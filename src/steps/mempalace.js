'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function hasPython() {
  const r = spawnSync('python3', ['--version'], { stdio: 'pipe' });
  return r.status === 0;
}

function isInstalled() {
  const r = spawnSync('python3', ['-c', 'import mempalace'], { stdio: 'pipe' });
  return r.status === 0;
}

function getVersion() {
  const r = spawnSync('mempalace', ['--version'], { stdio: 'pipe' });
  if (r.status === 0 && r.stdout) return r.stdout.toString().trim();
  const r2 = spawnSync('python3', ['-c', 'from mempalace.version import __version__; print(__version__)'], { stdio: 'pipe' });
  if (r2.status === 0 && r2.stdout) return r2.stdout.toString().trim();
  return null;
}

function mergeSettings() {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (_) {}

  let changed = false;

  // MCP server
  if (!settings.mcpServers) settings.mcpServers = {};
  if (!settings.mcpServers.mempalace) {
    settings.mcpServers.mempalace = {
      command: 'python3',
      args: ['-m', 'mempalace.mcp_server'],
    };
    changed = true;
  }

  if (!settings.hooks) settings.hooks = {};

  const hasHook = (event, needle) => {
    return (settings.hooks[event] || []).some(
      e => (e.hooks || []).some(h => (h.command || '').includes(needle))
    );
  };

  // SessionStart → wake-up
  if (!hasHook('SessionStart', 'mempalace')) {
    settings.hooks.SessionStart = settings.hooks.SessionStart || [];
    settings.hooks.SessionStart.push({
      matcher: '',
      hooks: [{ type: 'command', command: 'mempalace hook run --hook session-start --harness claude-code', timeout: 15 }],
    });
    changed = true;
  }

  // Stop → auto-save
  if (!hasHook('Stop', 'mempalace')) {
    settings.hooks.Stop = settings.hooks.Stop || [];
    settings.hooks.Stop.push({
      matcher: '',
      hooks: [{ type: 'command', command: 'mempalace hook run --hook stop --harness claude-code', timeout: 30 }],
    });
    changed = true;
  }

  // PreCompact → save before compression
  if (!hasHook('PreCompact', 'mempalace')) {
    settings.hooks.PreCompact = settings.hooks.PreCompact || [];
    settings.hooks.PreCompact.push({
      matcher: '',
      hooks: [{ type: 'command', command: 'mempalace hook run --hook precompact --harness claude-code', timeout: 15 }],
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  }

  return changed;
}

async function run() {
  try {
    if (!hasPython()) {
      return { ok: false, message: 'python3 not found — install Python 3.9+ first' };
    }

    if (!isInstalled()) {
      const install = spawnSync('pip3', ['install', 'mempalace'], {
        stdio: 'pipe',
        timeout: 120000,
      });
      if (install.status !== 0) {
        return { ok: false, message: 'mempalace install failed', error: (install.stderr || '').toString().trim() };
      }
    }

    const version = getVersion();
    const hooksAdded = mergeSettings();

    const parts = [`v${version || '?'}`];
    if (hooksAdded) parts.push('MCP + 3 hooks → settings.json');
    else parts.push('MCP + hooks already configured');

    return { ok: true, message: parts.join(' — ') };
  } catch (err) {
    return { ok: false, message: 'mempalace setup failed', error: err.message };
  }
}

module.exports = { run };
