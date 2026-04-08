'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

async function run(_root) {
  try {
    const home = os.homedir();
    const shell = process.env.SHELL || '';
    const rcFile = shell.includes('zsh')
      ? path.join(home, '.zshrc')
      : path.join(home, '.bashrc');

    const exportLine = `export OBSIDIAN_VAULT="$HOME/Documents/obsidian/TheOwnerStack"`;

    if (fs.existsSync(rcFile)) {
      const contents = fs.readFileSync(rcFile, 'utf8');
      if (contents.includes('OBSIDIAN_VAULT')) {
        return { ok: true, message: `OBSIDIAN_VAULT already set in ${path.basename(rcFile)}` };
      }
    }

    fs.appendFileSync(rcFile, `\n# claude-ninja\n${exportLine}\n`);
    return { ok: true, message: `OBSIDIAN_VAULT → ~/${path.basename(rcFile)}` };
  } catch (err) {
    return { ok: false, message: 'env-var setup failed', error: err.message };
  }
}

module.exports = { run };
