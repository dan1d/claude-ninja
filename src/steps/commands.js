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
    const dest = path.join(os.homedir(), '.claude', 'commands');
    fs.mkdirSync(dest, { recursive: true });

    const topLevelFiles = ['plan.md', 'e2e.md', 'marketing.md'];
    let copied = 0;
    let skipped = 0;

    for (const file of topLevelFiles) {
      const srcFile = path.join(root, 'commands', file);
      if (fs.existsSync(srcFile)) {
        const destFile = path.join(dest, file);
        if (fs.existsSync(destFile)) {
          skipped++;
        } else {
          fs.copyFileSync(srcFile, destFile);
          copied++;
        }
      }
    }

    // Copy marketing subdirectory recursively (non-destructive)
    const marketingSrc = path.join(root, 'commands', 'marketing');
    if (fs.existsSync(marketingSrc)) {
      const result = copyDirRecursiveNonDestructive(marketingSrc, path.join(dest, 'marketing'));
      copied += result.copied;
      skipped += result.skipped;
    }

    const msg = copied > 0
      ? `${copied} added → ~/.claude/commands/${skipped > 0 ? ` (${skipped} already present, skipped)` : ''}`
      : `all ${skipped} already installed — nothing to do`;

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'commands install failed', error: err.message };
  }
}

module.exports = { run };
