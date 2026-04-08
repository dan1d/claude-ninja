'use strict';
const { spawnSync } = require('child_process');

function checkAuth() {
  const status = spawnSync('gh', ['auth', 'status'], { stdio: 'pipe' });
  return status.status === 0;
}

function getUsername() {
  const result = spawnSync('gh', ['api', 'user', '--jq', '.login'], { stdio: 'pipe' });
  if (result.status === 0 && result.stdout) {
    return result.stdout.toString().trim();
  }
  return null;
}

async function run(_root) {
  try {
    if (checkAuth()) {
      const username = getUsername();
      return {
        ok: true,
        message: username ? `already logged in as ${username}` : 'already logged in',
      };
    }

    // Not logged in — run interactive login
    console.log('\n  GitHub CLI not authenticated. Starting gh auth login...\n');
    const login = spawnSync('gh', ['auth', 'login'], { stdio: 'inherit' });

    if (login.status !== 0) {
      return { ok: false, message: 'GitHub CLI auth failed', error: `exit code ${login.status}` };
    }

    // Verify after login
    if (checkAuth()) {
      const username = getUsername();
      return {
        ok: true,
        message: username ? `logged in as ${username}` : 'logged in',
      };
    }

    return { ok: false, message: 'GitHub CLI auth could not be verified', error: 'gh auth status returned non-zero after login' };
  } catch (err) {
    return { ok: false, message: 'GitHub CLI check failed', error: err.message };
  }
}

module.exports = { run };
