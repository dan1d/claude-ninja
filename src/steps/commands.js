'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function run(root) {
  try {
    const dest = path.join(os.homedir(), '.claude', 'commands');
    fs.mkdirSync(dest, { recursive: true });

    const topLevelFiles = ['next.md', 'test.md', 'lint.md', 'plan.md', 'marketing.md'];
    let count = 0;

    for (const file of topLevelFiles) {
      const srcFile = path.join(root, 'commands', file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(dest, file));
        count++;
      }
    }

    // Copy marketing subdirectory recursively
    const marketingSrc = path.join(root, 'commands', 'marketing');
    if (fs.existsSync(marketingSrc)) {
      copyDirRecursive(marketingSrc, path.join(dest, 'marketing'));
      const marketingFiles = fs.readdirSync(marketingSrc, { recursive: true })
        .filter(f => typeof f === 'string');
      count += marketingFiles.length;
    }

    return { ok: true, message: `${count} commands → ~/.claude/commands/` };
  } catch (err) {
    return { ok: false, message: 'commands install failed', error: err.message };
  }
}

module.exports = { run };
