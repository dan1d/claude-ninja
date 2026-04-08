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
    const src = path.join(root, 'plugins', 'obsidian-skills');
    const dest = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'obsidian-skills');

    if (!fs.existsSync(src)) {
      return { ok: false, message: 'obsidian-skill install failed', error: `Source not found: ${src}` };
    }

    copyDirRecursive(src, dest);
    return { ok: true, message: 'Obsidian skill → ~/.claude/plugins/cache/' };
  } catch (err) {
    return { ok: false, message: 'obsidian-skill install failed', error: err.message };
  }
}

module.exports = { run };
