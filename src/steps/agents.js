'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

async function run(root) {
  try {
    const dest = path.join(os.homedir(), '.claude', 'agents');
    fs.mkdirSync(dest, { recursive: true });

    const sources = [
      path.join(root, 'agents'),
      path.join(root, 'agents', 'marketing'),
    ];

    let count = 0;
    for (const src of sources) {
      if (!fs.existsSync(src)) continue;
      const files = fs.readdirSync(src).filter(f => f.endsWith('.md'));
      for (const file of files) {
        fs.copyFileSync(path.join(src, file), path.join(dest, file));
        count++;
      }
    }

    return { ok: true, message: `${count} agents → ~/.claude/agents/` };
  } catch (err) {
    return { ok: false, message: 'agents install failed', error: err.message };
  }
}

module.exports = { run };
