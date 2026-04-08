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
    const src = path.join(root, 'obsidian', 'TheOwnerStack');
    const dest = path.join(os.homedir(), 'Documents', 'obsidian', 'TheOwnerStack');

    if (!fs.existsSync(src)) {
      return { ok: true, message: 'skipped (no obsidian/ in repo)' };
    }

    if (!fs.existsSync(path.join(os.homedir(), 'Documents', 'obsidian'))) {
      return {
        ok: true,
        message: 'skipped — Vault directory not found (open Obsidian first and create TheOwnerStack vault)',
      };
    }

    const { copied, skipped } = copyDirRecursiveNonDestructive(src, dest);

    const msg = copied > 0
      ? `${copied} notes → ~/Documents/obsidian/TheOwnerStack/${skipped > 0 ? ` (${skipped} already present, skipped)` : ''}`
      : `all ${skipped} already present — nothing to do`;

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'obsidian-notes install failed', error: err.message };
  }
}

module.exports = { run };
