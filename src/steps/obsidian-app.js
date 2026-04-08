'use strict';
const { spawnSync } = require('child_process');
const inquirer = require('inquirer');

function isObsidianRunning() {
  const result = spawnSync('pgrep', ['-i', 'Obsidian'], { stdio: 'pipe' });
  return result.status === 0;
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

    spawnSync('open', ['-a', 'Obsidian'], { stdio: 'pipe' });
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
