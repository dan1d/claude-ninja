'use strict';
const { spawnSync } = require('child_process');
const os = require('os');

async function run(_root) {
  try {
    const result = spawnSync(
      'npx',
      ['@aitytech/agentkits-memory', '--platform=claude-code'],
      {
        cwd: os.homedir(),
        stdio: 'pipe',
        timeout: 120000,
        env: { ...process.env, npm_config_yes: 'true' },
      }
    );

    if (result.status !== 0) {
      const stderr = result.stderr ? result.stderr.toString().trim() : '';
      const stdout = result.stdout ? result.stdout.toString().trim() : '';
      const errMsg = stderr || stdout || `exit code ${result.status}`;
      return { ok: false, message: 'AgentKits Memory install failed', error: errMsg };
    }

    return { ok: true, message: 'AgentKits Memory → ~/.claude/settings.json' };
  } catch (err) {
    return { ok: false, message: 'AgentKits Memory install failed', error: err.message };
  }
}

module.exports = { run };
