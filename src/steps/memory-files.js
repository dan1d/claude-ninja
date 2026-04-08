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

    let count = 0;
    for (const { src, dest } of destinations) {
      if (!fs.existsSync(src)) continue;
      fs.mkdirSync(dest, { recursive: true });
      const files = fs.readdirSync(src);
      for (const file of files) {
        const srcFile = path.join(src, file);
        const stat = fs.statSync(srcFile);
        if (stat.isFile()) {
          fs.copyFileSync(srcFile, path.join(dest, file));
          count++;
        }
      }
    }

    return { ok: true, message: `${count} memory files → ~/.claude/projects/.../memory/` };
  } catch (err) {
    return { ok: false, message: 'memory-files install failed', error: err.message };
  }
}

module.exports = { run };
