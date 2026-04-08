'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

function copyDirRecursiveNonDestructive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      const result = copyDirRecursiveNonDestructive(srcPath, destPath);
      copied += result.copied;
      skipped += result.skipped;
    } else {
      if (fs.existsSync(destPath)) {
        skipped++;
      } else {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
  }
  return { copied, skipped };
}

async function run(root) {
  try {
    const src = path.join(root, 'plugins', 'obsidian-skills');
    const dest = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'obsidian-skills');

    if (!fs.existsSync(src)) {
      return { ok: false, message: 'obsidian-skill install failed', error: `Source not found: ${src}` };
    }

    const { copied, skipped } = copyDirRecursiveNonDestructive(src, dest);

    const msg = copied > 0
      ? `Obsidian skill → ~/.claude/plugins/cache/${skipped > 0 ? ` (${skipped} already present, skipped)` : ''}`
      : `already installed — nothing to do (${skipped} files)`;

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'obsidian-skill install failed', error: err.message };
  }
}

module.exports = { run };
