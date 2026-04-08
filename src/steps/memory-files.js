'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

async function run(root) {
  try {
    const username = os.userInfo().username;
    const home = os.homedir();

    const destinations = [
      {
        src: path.join(root, 'memory', 'theownerstack'),
        dest: path.join(
          home,
          '.claude',
          'projects',
          `-Users-${username}-claude-projects-theownerstack`,
          'memory'
        ),
      },
      {
        src: path.join(root, 'memory', 'paydaybooks'),
        dest: path.join(
          home,
          '.claude',
          'projects',
          `-Users-${username}-claude-projects-theownerstack-shopify-project`,
          'memory'
        ),
      },
    ];

    let copied = 0;
    let skipped = 0;
    let memoryPreserved = false;

    for (const { src, dest } of destinations) {
      if (!fs.existsSync(src)) continue;
      fs.mkdirSync(dest, { recursive: true });
      const files = fs.readdirSync(src);
      for (const file of files) {
        const srcFile = path.join(src, file);
        const stat = fs.statSync(srcFile);
        if (stat.isFile()) {
          const destFile = path.join(dest, file);
          if (fs.existsSync(destFile)) {
            if (file === 'MEMORY.md') {
              memoryPreserved = true;
            }
            skipped++;
          } else {
            fs.copyFileSync(srcFile, destFile);
            copied++;
          }
        }
      }
    }

    let msg;
    if (copied > 0) {
      msg = `${copied} added → ~/.claude/projects/.../memory/`;
      if (skipped > 0) {
        msg += ` (${skipped} already present, skipped`;
        if (memoryPreserved) msg += ' — MEMORY.md preserved';
        msg += ')';
      }
    } else {
      msg = `all ${skipped} already installed — nothing to do`;
      if (memoryPreserved) msg += ' (MEMORY.md preserved)';
    }

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'memory-files install failed', error: err.message };
  }
}

module.exports = { run };
