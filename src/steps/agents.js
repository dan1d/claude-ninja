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

    let copied = 0;
    let skipped = 0;

    for (const src of sources) {
      if (!fs.existsSync(src)) continue;
      const files = fs.readdirSync(src).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const destFile = path.join(dest, file);
        if (fs.existsSync(destFile)) {
          skipped++;
        } else {
          fs.copyFileSync(path.join(src, file), destFile);
          copied++;
        }
      }
    }

    const msg = copied > 0
      ? `${copied} added → ~/.claude/agents/${skipped > 0 ? ` (${skipped} already present, skipped)` : ''}`
      : `all ${skipped} already installed — nothing to do`;

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'agents install failed', error: err.message };
  }
}

module.exports = { run };
