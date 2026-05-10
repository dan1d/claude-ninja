'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

async function run(root, opts = {}) {
  try {
    const dest = path.join(os.homedir(), '.claude', 'agents');
    fs.mkdirSync(dest, { recursive: true });

    const sources = [
      path.join(root, 'agents'),
      path.join(root, 'agents', 'marketing'),
    ];

    let copied = 0;
    let skipped = 0;
    let updated = 0;

    for (const src of sources) {
      if (!fs.existsSync(src)) continue;
      const files = fs.readdirSync(src).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        if (fs.existsSync(destFile)) {
          if (opts.update) {
            fs.copyFileSync(srcFile, destFile);
            updated++;
          } else {
            skipped++;
          }
        } else {
          fs.copyFileSync(srcFile, destFile);
          copied++;
        }
      }
    }

    const parts = [];
    if (copied > 0) parts.push(`${copied} added`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (skipped > 0) parts.push(`${skipped} unchanged`);
    const msg = parts.length > 0
      ? `${parts.join(', ')} → ~/.claude/agents/`
      : 'nothing to do';

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'agents install failed', error: err.message };
  }
}

module.exports = { run };
