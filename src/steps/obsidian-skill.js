'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

function copyDirRecursive(src, dest, update = false) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;
  let updated = 0;
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      const result = copyDirRecursive(srcPath, destPath, update);
      copied += result.copied;
      skipped += result.skipped;
      updated += result.updated;
    } else {
      if (fs.existsSync(destPath)) {
        if (update) {
          fs.copyFileSync(srcPath, destPath);
          updated++;
        } else {
          skipped++;
        }
      } else {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
  }
  return { copied, skipped, updated };
}

async function run(root, opts = {}) {
  try {
    const src = path.join(root, 'plugins', 'obsidian-skills');
    const dest = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'obsidian-skills');

    if (!fs.existsSync(src)) {
      return { ok: false, message: 'obsidian-skill install failed', error: `Source not found: ${src}` };
    }

    const { copied, skipped, updated } = copyDirRecursive(src, dest, opts.update);

    const parts = [];
    if (copied > 0) parts.push(`${copied} added`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (skipped > 0) parts.push(`${skipped} unchanged`);
    const msg = parts.length > 0
      ? `${parts.join(', ')} → ~/.claude/plugins/cache/`
      : 'nothing to do';

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'obsidian-skill install failed', error: err.message };
  }
}

module.exports = { run };
