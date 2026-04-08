'use strict';
const { spawnSync } = require('child_process');
const inquirer = require('inquirer');

function isObsidianRunning() {
  // pgrep works on both macOS and Linux
  const result = spawnSync('pgrep', ['-i', 'obsidian'], { stdio: 'pipe' });
  return result.status === 0;
}

function launchObsidian() {
  if (process.platform === 'darwin') {
    spawnSync('open', ['-a', 'Obsidian'], { stdio: 'pipe' });
  } else if (process.platform === 'linux') {
    // Try common Linux install locations in order
    const candidates = ['obsidian', 'obsidian-bin'];
    for (const cmd of candidates) {
      const result = spawnSync('which', [cmd], { stdio: 'pipe' });
      if (result.status === 0) {
        spawnSync(cmd, [], { stdio: 'pipe', detached: true });
        return;
      }
    }
    // Fallback: xdg-open with the obsidian:// URI scheme
    spawnSync('xdg-open', ['obsidian://'], { stdio: 'pipe' });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(_root) {
  try {
    if (isObsidianRunning()) {
      return { ok: true, message: 'running' };
    }

    const { openIt } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'openIt',
        message: 'Obsidian is not running. Open it now?',
        default: true,
      },
    ]);

    if (!openIt) {
      return { ok: true, message: 'skipped (not running)' };
    }

    launchObsidian();
    await sleep(3000);

    if (isObsidianRunning()) {
      return { ok: true, message: 'launched successfully' };
    }

    return { ok: true, message: 'launch attempted (verify manually)' };
  } catch (err) {
    return { ok: false, message: 'Obsidian check failed', error: err.message };
  }
}

module.exports = { run };
