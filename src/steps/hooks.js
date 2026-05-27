'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use $HOME expansion so the command works on both macOS and Linux
// regardless of where the shell resolves ~ from
const HOME = os.homedir();

const AUTO_ROUTE_ENTRY = {
  matcher: 'Edit|Write|MultiEdit',
  hooks: [
    {
      type: 'command',
      command: `node ${path.join(HOME, '.claude', 'hooks', 'auto-route.js')}`,
      timeout: 5,
    },
  ],
};

const PROMPT_ROUTE_ENTRY = {
  hooks: [
    {
      type: 'command',
      command: `node ${path.join(HOME, '.claude', 'hooks', 'prompt-route.js')}`,
      timeout: 5,
    },
  ],
};

function hasHookWith(entries, substring) {
  if (!Array.isArray(entries)) return false;
  return entries.some(
    (e) => Array.isArray(e.hooks) &&
      e.hooks.some((h) => typeof h.command === 'string' && h.command.includes(substring))
  );
}

async function run(root) {
  try {
    const claudeDir = path.join(HOME, '.claude');
    const hooksDir  = path.join(claudeDir, 'hooks');
    const settingsPath = path.join(claudeDir, 'settings.json');

    fs.mkdirSync(hooksDir, { recursive: true });

    // ── 1. Copy hook scripts (always overwrite so updates propagate) ─────────
    const hooksToCopy = ['auto-route.js', 'prompt-route.js', 'post-task-review.js', 'obsidian-task-gate.js'];
    for (const name of hooksToCopy) {
      const src  = path.join(root, 'src', 'hooks', name);
      const dest = path.join(hooksDir, name);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    }

    // ── 2. Load settings.json ────────────────────────────────────────────────
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); }
      catch (_) { settings = {}; }
    }

    if (!settings.hooks) settings.hooks = {};

    // ── 3. Merge PreToolUse obsidian-task-gate ───────────────────────────────
    if (!Array.isArray(settings.hooks.PreToolUse)) settings.hooks.PreToolUse = [];

    if (!hasHookWith(settings.hooks.PreToolUse, 'obsidian-task-gate')) {
      settings.hooks.PreToolUse.push({
        matcher: 'Edit|Write|MultiEdit',
        hooks: [
          {
            type: 'command',
            command: `node ${path.join(HOME, '.claude', 'hooks', 'obsidian-task-gate.js')}`,
            timeout: 5,
          },
        ],
      });
    }

    // ── 4. Merge PostToolUse auto-route ──────────────────────────────────────
    if (!Array.isArray(settings.hooks.PostToolUse)) settings.hooks.PostToolUse = [];

    if (!hasHookWith(settings.hooks.PostToolUse, 'auto-route')) {
      settings.hooks.PostToolUse.push(AUTO_ROUTE_ENTRY);
    }

    // ── 5. Merge UserPromptSubmit prompt-route ───────────────────────────────
    if (!Array.isArray(settings.hooks.UserPromptSubmit)) settings.hooks.UserPromptSubmit = [];

    if (!hasHookWith(settings.hooks.UserPromptSubmit, 'prompt-route')) {
      settings.hooks.UserPromptSubmit.push(PROMPT_ROUTE_ENTRY);
    }

    // ── 6. Merge Stop post-task-review ───────────────────────────────────────
    if (!Array.isArray(settings.hooks.Stop)) settings.hooks.Stop = [];

    if (!hasHookWith(settings.hooks.Stop, 'post-task-review')) {
      settings.hooks.Stop.push({
        hooks: [
          {
            type: 'command',
            command: `node ${path.join(HOME, '.claude', 'hooks', 'post-task-review.js')}`,
            timeout: 5,
          },
        ],
      });
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');

    return {
      ok: true,
      message: 'obsidian-gate (PreToolUse) + auto-route (PostToolUse) + prompt-route (UserPromptSubmit) + review (Stop) → settings.json',
    };
  } catch (err) {
    return { ok: false, message: 'hooks install failed', error: err.message };
  }
}

module.exports = { run };
