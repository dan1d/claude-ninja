'use strict';

// PreToolUse hook — enforce Obsidian task planning before code edits
// Blocks Edit/Write/MultiEdit to source code until a task entry has been written
// to the Obsidian Dev Tracker for the current session.
//
// FIXED: Critical bugs from code review:
//  - Block message goes to stderr (Claude reads stderr on exit 2, not stdout)
//  - Sentinel is session + project scoped (safe for parallel Claude Code windows)
//  - isInsideVault uses realpathSync to handle symlinks + path.sep suffix to avoid prefix collisions
//  - Sentinel TTL is touched on each use (extends with activity, not creation-only)
//  - Vault not found → skip gate (graceful Linux/no-Obsidian path)
//
// No npm dependencies.

const os     = require('os');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const SENTINEL_TTL = 4 * 60 * 60 * 1000; // 4 hours, refreshed on each valid access

// Source-code extensions that require a plan before editing
const CODE_EXTENSIONS = new Set([
  '.rb', '.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java', '.rs',
  '.css', '.scss', '.html', '.erb', '.haml', '.slim',
  '.sql', '.sh', '.bash',
]);

function projHash() {
  return crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 8);
}

// Session + project scoped sentinel — safe for parallel Claude Code windows
function sentinelPath(sessionId) {
  const sid = (sessionId || 'no-session').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
  return path.join(os.tmpdir(), `claude-ninja-plan-ready-${projHash()}-${sid}`);
}

function getVaultPath() {
  if (process.env.OBSIDIAN_VAULT) return process.env.OBSIDIAN_VAULT;
  return path.join(os.homedir(), 'Documents', 'obsidian');
}

function getProjectName() {
  try {
    const p = path.join(process.cwd(), '.claude', 'obsidian-project');
    return fs.readFileSync(p, 'utf8').trim();
  } catch (_) {}
  return path.basename(process.cwd());
}

// Resolve symlinks where possible; fall back to path.resolve for non-existent files
function safeRealpath(p) {
  try { return fs.realpathSync(p); } catch { return path.resolve(p); }
}

// Correct vault membership check: resolves symlinks + requires path.sep boundary
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

function isCodeFile(filePath) {
  return CODE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isManifestFile(filePath) {
  return /^(Gemfile|package\.json|package-lock\.json|Gemfile\.lock|yarn\.lock|Cargo\.toml|go\.mod)$/i
    .test(path.basename(filePath));
}

function sentinelIsValid(spath) {
  try {
    const stat = fs.statSync(spath);
    if ((Date.now() - stat.mtimeMs) >= SENTINEL_TTL) return false;
    // Touch on use — extends TTL with activity rather than capping at creation time
    try { fs.utimesSync(spath, new Date(), new Date()); } catch {}
    return true;
  } catch {
    return false;
  }
}

function getFilePath(payload) {
  const { tool_name, tool_input } = payload;
  if (!tool_name || !tool_input) return null;
  const name = tool_name.toLowerCase();
  if (name === 'edit' || name === 'write' || name === 'multiedit') {
    return tool_input.file_path || null;
  }
  return null;
}

function main() {
  // Skip gate when stdin is not piped (interactive or missing — avoids hang)
  if (process.stdin.isTTY) process.exit(0);

  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { raw += c; });
  process.stdin.on('end', () => {
    try {
      if (!raw.trim()) process.exit(0);

      const payload    = JSON.parse(raw);
      const filePath   = getFilePath(payload);
      const sessionId  = payload.session_id || '';

      if (!filePath) process.exit(0);

      const vaultPath = getVaultPath();

      // Vault not found → skip gate (Linux without Obsidian, first-run, etc.)
      if (!fs.existsSync(vaultPath)) process.exit(0);

      // Writing TO the vault itself is the planning step — always allow
      if (isInsideVault(filePath, vaultPath)) process.exit(0);

      // Only gate source code and manifests
      if (!isCodeFile(filePath) && !isManifestFile(filePath)) process.exit(0);

      // Plan sentinel valid for this session + project → allow, refresh TTL
      const spath = sentinelPath(sessionId);
      if (sentinelIsValid(spath)) process.exit(0);

      // ── Block: tell Claude via stderr where and how to write the plan ────────
      const project  = getProjectName();
      const tracker  = path.join(vaultPath, project, 'Dev', 'Dev Tracker.md');
      const taskDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

      process.stderr.write(
        `[CLAUDE-NINJA PLAN GATE] Code edit blocked — no Obsidian task plan found for this session.\n\n` +
        `Before writing code, you MUST:\n` +
        `1. Open the Dev Tracker: ${tracker}\n` +
        `   (Create it if missing using the template at the bottom of this message)\n` +
        `2. Add a task entry under "## In Progress":\n\n` +
        `   - [ ] [brief task name] — ${taskDate}\n` +
        `     - Plan: [what you are going to do and why]\n` +
        `     - Files: [which files will change]\n\n` +
        `3. Save it using the Write or Edit tool — that unlocks code edits for this session.\n` +
        `4. Then write the code.\n\n` +
        `Dev Tracker template (if file is missing):\n` +
        `# Dev Tracker\n\n## In Progress\n\n## Up Next\n\n## Completed\n`
      );

      process.exit(2);
    } catch (_) {
      process.exit(0); // Never block on hook errors
    }
  });
  process.stdin.on('error', () => { process.exit(0); });
}

main();
