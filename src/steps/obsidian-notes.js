'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');

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

function findVaultSrc(root) {
  const obsidianDir = path.join(root, 'obsidian');
  if (!fs.existsSync(obsidianDir)) return null;
  const entries = fs.readdirSync(obsidianDir, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory());
  return dirs.length > 0 ? path.join(obsidianDir, dirs[0].name) : null;
}

async function run(root) {
  try {
    const src = findVaultSrc(root);
    if (!src) {
      return { ok: true, message: 'skipped (no obsidian/ in repo)' };
    }

    const obsidianBase = path.join(os.homedir(), 'Documents', 'obsidian');
    if (!fs.existsSync(obsidianBase)) {
      return {
        ok: true,
        message: 'skipped — ~/Documents/obsidian/ not found (open Obsidian first and create a vault)',
      };
    }

    let vaultName = '';
    if (process.stdin.isTTY) {
      const existing = fs.readdirSync(obsidianBase, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name);

      if (existing.length === 1) {
        vaultName = existing[0];
      } else if (existing.length > 1) {
        const { name } = await inquirer.prompt([
          {
            type: 'list',
            name: 'name',
            message: 'Which Obsidian vault should receive the notes?',
            choices: [...existing, '(skip)'],
          },
        ]);
        vaultName = name === '(skip)' ? '' : name;
      }
    }

    if (!vaultName) {
      return { ok: true, message: 'skipped (no vault selected)' };
    }

    const dest = path.join(obsidianBase, vaultName);
    const { copied, skipped } = copyDirRecursiveNonDestructive(src, dest);

    const msg = copied > 0
      ? `${copied} notes → ~/Documents/obsidian/${vaultName}/${skipped > 0 ? ` (${skipped} already present, skipped)` : ''}`
      : `all ${skipped} already present — nothing to do`;

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'obsidian-notes install failed', error: err.message };
  }
}

module.exports = { run };
