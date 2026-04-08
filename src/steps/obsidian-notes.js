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

    copyDirRecursive(src, dest);
    return { ok: true, message: 'Obsidian notes → ~/Documents/obsidian/TheOwnerStack/' };
  } catch (err) {
    return { ok: false, message: 'obsidian-notes install failed', error: err.message };
  }
}

module.exports = { run };
