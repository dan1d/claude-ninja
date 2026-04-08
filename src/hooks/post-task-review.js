'use strict';

// Stop hook — auto-review + Obsidian update after a task that modified source files.
// Fires when Claude finishes a turn. Uses session-scoped sentinel files.
//
// FIXED:
//  - Sentinel paths are session + project scoped (parallel window safe)
//  - Plan sentinel is NOT cleared here — multi-turn tasks within a session
//    don't require re-planning. It expires via its 4-hour TTL.
//  - Only the review sentinel is cleared (single-fire per stop event).
//  - isTTY guard prevents hanging when stdin is not piped.
//
// No npm dependencies.

const os     = require('os');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

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

function getProjectName() {
  try {
    return fs.readFileSync(path.join(process.cwd(), '.claude', 'obsidian-project'), 'utf8').trim();
  } catch (_) {
    return path.basename(process.cwd());
  }
}

function main() {
  if (process.stdin.isTTY) process.exit(0);

  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    try {
      let sessionId = '';
      try {
        const payload = JSON.parse(raw);
        sessionId = payload.session_id || '';
      } catch (_) {}

      const reviewSentinel = sentinelPath('review-pending', sessionId);

      // Only trigger if source files were changed this turn
      if (!fs.existsSync(reviewSentinel)) process.exit(0);

      let filesChanged = '';
      try { filesChanged = fs.readFileSync(reviewSentinel, 'utf8').trim(); } catch (_) {}

      // Clear review sentinel — fires once per task completion
      // NOTE: plan sentinel is intentionally NOT cleared here.
      // Multi-turn tasks within the same session share a plan; it expires via TTL.
      try { fs.unlinkSync(reviewSentinel); } catch (_) {}

      // Deduplicate file list (defensive against race appends)
      const uniqueFiles = [...new Set((filesChanged || '').split('\n').filter(Boolean))];
      const fileList = uniqueFiles.length
        ? `\nFiles changed:\n${uniqueFiles.map(f => `  - ${f}`).join('\n')}`
        : '';

      const project  = getProjectName();
      const vault    = getVaultPath();
      const tracker  = path.join(vault, project, 'Dev', 'Dev Tracker.md');
      const taskDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

      process.stdout.write(
        `[CLAUDE-NINJA AUTO-REVIEW + OBSIDIAN UPDATE]\n` +
        `A task just completed that modified source files.${fileList}\n\n` +
        `You MUST do both of the following before this task is considered done:\n\n` +
        `1. CODE REVIEW — Use the Agent tool to invoke "code-reviewer-pro" subagent.\n` +
        `   Pass it the changed files and ask it to review for correctness, security, and pattern consistency.\n\n` +
        `2. OBSIDIAN UPDATE — Update the Dev Tracker at: ${tracker}\n` +
        `   - Move the active task from "## In Progress" to "## Completed"\n` +
        `   - Mark it [x] and add the completion timestamp: ${taskDate}\n` +
        `   - Add key decisions or findings as sub-bullets\n` +
        `   Example:\n` +
        `     - [x] [task name] — Done: ${taskDate}\n` +
        `       - [key decision or finding]\n`
      );
    } catch (_) {
      process.exit(0);
    }
  });
  process.stdin.on('error', () => { process.exit(0); });
}

main();
