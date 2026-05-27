'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');

// Claude Code encodes project paths by replacing every path separator with -
// e.g. /Users/alice/my-project → -Users-alice-my-project
function encodeProjectPath(absolutePath) {
  return absolutePath.split(path.sep).join('-');
}

function getMemoryDirs(root) {
  const memDir = path.join(root, 'memory');
  if (!fs.existsSync(memDir)) return [];
  return fs.readdirSync(memDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => ({
      name: e.name,
      src: path.join(memDir, e.name),
      fileCount: fs.readdirSync(path.join(memDir, e.name)).filter(f => f.endsWith('.md')).length,
    }))
    .filter(d => d.fileCount > 0);
}

async function run(root) {
  try {
    const home = os.homedir();
    const memoryDirs = getMemoryDirs(root);

    if (memoryDirs.length === 0) {
      return { ok: true, message: 'no memory files found in repo' };
    }

    if (!process.stdin.isTTY) {
      return { ok: true, message: `skipped ${memoryDirs.length} memory dir(s) — non-interactive mode` };
    }

    let totalCopied = 0;
    let totalSkipped = 0;

    for (const dir of memoryDirs) {
      const { install } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'install',
          message: `Install "${dir.name}" memory (${dir.fileCount} files)? Requires the workspace path.`,
          default: false,
        },
      ]);

      if (!install) continue;

      const { workspacePath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'workspacePath',
          message: `Absolute path to the "${dir.name}" workspace (e.g. ${home}/projects/${dir.name}):`,
        },
      ]);

      const trimmed = workspacePath.trim();
      if (!trimmed) continue;

      const encoded = encodeProjectPath(trimmed);
      const dest = path.join(home, '.claude', 'projects', encoded, 'memory');
      fs.mkdirSync(dest, { recursive: true });

      const files = fs.readdirSync(dir.src).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const destFile = path.join(dest, file);
        if (fs.existsSync(destFile)) {
          totalSkipped++;
        } else {
          fs.copyFileSync(path.join(dir.src, file), destFile);
          totalCopied++;
        }
      }
    }

    const parts = [];
    if (totalCopied > 0) parts.push(`${totalCopied} added`);
    if (totalSkipped > 0) parts.push(`${totalSkipped} already present`);
    const msg = parts.length > 0
      ? `${parts.join(', ')} → ~/.claude/projects/.../memory/`
      : 'skipped — no memory dirs selected';

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'memory-files install failed', error: err.message };
  }
}

module.exports = { run };
