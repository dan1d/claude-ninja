'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_COMMAND = 'node ~/.claude/hooks/auto-route.js';
const HOOK_ENTRY = {
  matcher: 'Edit|Write|MultiEdit',
  hooks: [
    {
      type: 'command',
      command: HOOK_COMMAND,
      timeout: 5,
    },
  ],
};

function isAutoRouteHook(entry) {
  if (!entry || !Array.isArray(entry.hooks)) return false;
  return entry.hooks.some(
    (h) => typeof h.command === 'string' && h.command.includes('auto-route')
  );
}

async function run(root) {
  try {
    const claudeDir = path.join(os.homedir(), '.claude');
    const hooksDir = path.join(claudeDir, 'hooks');
    const settingsPath = path.join(claudeDir, 'settings.json');
    const hookSrc = path.join(root, 'src', 'hooks', 'auto-route.js');
    const hookDest = path.join(hooksDir, 'auto-route.js');

    // ── 1. Copy hook script to ~/.claude/hooks/ ──────────────────────────────
    fs.mkdirSync(hooksDir, { recursive: true });

    if (fs.existsSync(hookDest)) {
      // Already installed — overwrite with latest version
      fs.copyFileSync(hookSrc, hookDest);
    } else {
      fs.copyFileSync(hookSrc, hookDest);
    }

    // ── 2. Merge hook entry into settings.json PostToolUse array ─────────────
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (_) {
        settings = {};
      }
    }

    if (!settings.hooks) settings.hooks = {};
    if (!Array.isArray(settings.hooks.PostToolUse)) settings.hooks.PostToolUse = [];

    const alreadyInstalled = settings.hooks.PostToolUse.some(isAutoRouteHook);

    if (alreadyInstalled) {
      return { ok: true, message: 'auto-route hook already in settings.json — skipped' };
    }

    // Non-destructive: append to existing PostToolUse entries
    settings.hooks.PostToolUse.push(HOOK_ENTRY);

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');

    return {
      ok: true,
      message: 'auto-route hook installed → ~/.claude/hooks/auto-route.js + settings.json',
    };
  } catch (err) {
    return { ok: false, message: 'hooks install failed', error: err.message };
  }
}

module.exports = { run };
