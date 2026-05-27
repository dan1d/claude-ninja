'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

async function run(root) {
  try {
    const memDir = path.join(root, 'memory');
    if (!fs.existsSync(memDir)) {
      return { ok: true, message: 'no memory files in repo' };
    }

    const dirs = fs.readdirSync(memDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name);

    if (dirs.length === 0) {
      return { ok: true, message: 'no memory dirs found' };
    }

    return {
      ok: true,
      message: `skipped (${dirs.length} personal memory dirs — use /init to set up your own project memory)`,
    };
  } catch (err) {
    return { ok: false, message: 'memory-files check failed', error: err.message };
  }
}

module.exports = { run };
