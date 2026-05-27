'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');

async function run(_root, opts = {}) {
  try {
    const home = os.homedir();
    const shell = process.env.SHELL || '';
    const rcFile = shell.includes('zsh')
      ? path.join(home, '.zshrc')
      : path.join(home, '.bashrc');

    if (fs.existsSync(rcFile)) {
      const contents = fs.readFileSync(rcFile, 'utf8');
      if (contents.includes('OBSIDIAN_VAULT')) {
        return { ok: true, message: `OBSIDIAN_VAULT already set in ${path.basename(rcFile)}` };
      }
    }

    let vaultName = opts.vaultName || '';

    if (!vaultName && process.stdin.isTTY && !opts.update) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Obsidian vault name (leave empty to skip):',
          default: '',
        },
      ]);
      vaultName = name.trim();
    }

    if (!vaultName) {
      return { ok: true, message: 'skipped (no vault name provided)' };
    }

    const exportLine = `export OBSIDIAN_VAULT="$HOME/Documents/obsidian/${vaultName}"`;
    fs.appendFileSync(rcFile, `\n# claude-ninja\n${exportLine}\n`);
    return { ok: true, message: `OBSIDIAN_VAULT (${vaultName}) → ~/${path.basename(rcFile)}` };
  } catch (err) {
    return { ok: false, message: 'env-var setup failed', error: err.message };
  }
}

module.exports = { run };
