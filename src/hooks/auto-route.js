'use strict';

// PostToolUse hook — two jobs:
//  1. Route source-file edits to the right specialist agent
//  2. Manage session-scoped sentinels for the Obsidian plan gate and auto-review
//
// FIXED:
//  - Sentinels are session + project scoped (parallel Claude Code windows safe)
//  - isInsideVault uses realpathSync + path.sep boundary (no prefix false-positives)
//  - Plan sentinel only set for .md files inside vault (not any vault-adjacent write)
//  - Review sentinel deduplicates repeated edits to the same file
//  - JSON parse error → silent exit (no fallback that misroutes)
//
// No npm dependencies.

const os     = require('os');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// ── Sentinel helpers ──────────────────────────────────────────────────────────

function projHash() {
  return crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 8);
}

function sentinelPath(name, sessionId) {
  const sid = (sessionId || 'no-session').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
  return path.join(os.tmpdir(), `claude-ninja-${name}-${projHash()}-${sid}`);
}

function getVaultPath() {
  if (process.env.OBSIDIAN_VAULT) return process.env.OBSIDIAN_VAULT;
  return path.join(os.homedir(), 'Documents', 'obsidian');
}

function safeRealpath(p) {
  try { return fs.realpathSync(p); } catch { return path.resolve(p); }
}

function isInsideVault(filePath, vaultPath) {
  try {
    const f   = safeRealpath(filePath);
    const v   = safeRealpath(vaultPath);
    const rel = path.relative(v, f);
    return rel.length > 0 && !rel.startsWith('..') && !path.isAbsolute(rel);
  } catch {
    return false;
  }
}

// Unlock code edits: only when Claude writes a .md file inside the vault
function markPlanReady(filePath, sessionId) {
  try {
    const vault = getVaultPath();
    if (filePath.endsWith('.md') && isInsideVault(filePath, vault)) {
      fs.writeFileSync(sentinelPath('plan-ready', sessionId), filePath, 'utf8');
    }
  } catch (_) {}
}

// Track changed source files for auto-review; deduplicate repeated edits
function markReviewPending(filePath, sessionId) {
  try {
    const p = sentinelPath('review-pending', sessionId);
    let existing = '';
    try { existing = fs.readFileSync(p, 'utf8'); } catch {}
    if (!existing.split('\n').includes(filePath)) {
      fs.appendFileSync(p, filePath + '\n', 'utf8');
    }
  } catch (_) {}
}

// ── Routing rules ─────────────────────────────────────────────────────────────

const ROUTING_RULES = [
  {
    // QBO services — check before generic services rule
    test: (p) => /app\/services\/qbo\//.test(p) && /\.rb$/.test(p),
    agent: 'qbo-specialist',
    reason: 'QBO service changed — check OAuth/accounting logic',
  },
  {
    // React pages — check before generic JS/TS rule
    test: (p) => /app\/javascript\//.test(p) && /pages\//.test(p) && /\.[jt]sx?$/.test(p),
    agent: 'react-pro',
    reason: 'Page component changed — check UX flow',
  },
  {
    // React components
    test: (p) => /app\/javascript\//.test(p) && /\.[jt]sx?$/.test(p),
    agent: 'react-pro',
    reason: 'React component changed — UX review',
  },
  {
    // Background jobs
    test: (p) => /app\/jobs\//.test(p) && /\.rb$/.test(p),
    agent: 'sync-engineer',
    reason: 'Background job changed — check sync pipeline',
  },
  {
    // Controllers
    test: (p) => /app\/controllers\//.test(p) && /\.rb$/.test(p),
    agent: 'rails-react-pro',
    reason: 'Controller changed — check API contract',
  },
  {
    // Generic services (not QBO)
    test: (p) => /app\/services\//.test(p) && /\.rb$/.test(p),
    agent: 'ruby-on-rails-pro',
    reason: 'Service object changed',
  },
  {
    // Models
    test: (p) => /app\/models\//.test(p) && /\.rb$/.test(p),
    agent: 'ruby-on-rails-pro',
    reason: 'Model changed — check associations/validations',
  },
];

// Patterns that suppress routing output (vault writes, specs, docs)
const SILENT_PATTERNS = [/\/(spec|test)\//, /\.md$/];

function getFilePath(payload) {
  const { tool_name, tool_input } = payload;
  if (!tool_name || !tool_input) return null;
  const name = tool_name.toLowerCase();
  if (name === 'edit' || name === 'write' || name === 'multiedit') {
    return tool_input.file_path || null;
  }
  return null;
}

function route(filePath) {
  for (const pat of SILENT_PATTERNS) {
    if (pat.test(filePath)) return null;
  }
  for (const rule of ROUTING_RULES) {
    if (rule.test(filePath)) return rule;
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  if (process.stdin.isTTY) process.exit(0);

  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });

  process.stdin.on('end', () => {
    try {
      if (!raw.trim()) process.exit(0);

      const payload   = JSON.parse(raw); // exit silently on parse error via catch
      const filePath  = getFilePath(payload);
      const sessionId = payload.session_id || '';

      if (!filePath) process.exit(0);

      // Vault write → unlock code edits for this session
      markPlanReady(filePath, sessionId);

      const match = route(filePath);
      if (!match) process.exit(0);

      // Source file changed → flag for auto-review
      markReviewPending(filePath, sessionId);

      process.stdout.write(
        `[CLAUDE-NINJA AUTO-ROUTE]\n` +
        `Changed: ${filePath}\n` +
        `Recommended agent: ${match.agent}\n` +
        `Reason: ${match.reason}\n` +
        `Action: Invoke ${match.agent} to review this change. ` +
        `If the change is already complete and tested, you may skip. ` +
        `If UX/logic/test gaps exist, invoke the agent now.\n`
      );
    } catch (_) {
      process.exit(0);
    }
  });

  process.stdin.on('error', () => { process.exit(0); });
}

main();
