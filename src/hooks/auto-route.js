'use strict';

// PostToolUse hook — auto-routing by file path
// Reads JSON payload from stdin, prints a routing recommendation to stdout if a
// rule matches, exits 0 silently otherwise.
// No npm dependencies — only Node.js built-ins.

const ROUTING_RULES = [
  {
    // QBO services — check before generic services rule
    test: (p) => /app\/services\/qbo\//.test(p) && /\.(rb)$/.test(p),
    agent: 'qbo-specialist',
    reason: 'QBO service changed — check OAuth/accounting logic',
  },
  {
    // React pages — check before generic JS/TS rule
    test: (p) => /app\/javascript\//.test(p) && /pages\//.test(p) && /\.[jt]sx?$/.test(p),
    agent: 'react-pro',
    reason: 'Page component changed — check UX flow',
  },
  {
    // React components (JS/TS/JSX/TSX inside app/javascript)
    test: (p) => /app\/javascript\//.test(p) && /\.[jt]sx?$/.test(p),
    agent: 'react-pro',
    reason: 'React component changed — UX review',
  },
  {
    // Background jobs
    test: (p) => /app\/jobs\//.test(p) && /\.rb$/.test(p),
    agent: 'sync-engineer',
    reason: 'Background job changed — check sync pipeline',
  },
  {
    // Controllers
    test: (p) => /app\/controllers\//.test(p) && /\.rb$/.test(p),
    agent: 'rails-react-pro',
    reason: 'Controller changed — check API contract',
  },
  {
    // Generic services (not QBO — already matched above)
    test: (p) => /app\/services\//.test(p) && /\.rb$/.test(p),
    agent: 'ruby-on-rails-pro',
    reason: 'Service object changed',
  },
  {
    // Models
    test: (p) => /app\/models\//.test(p) && /\.rb$/.test(p),
    agent: 'ruby-on-rails-pro',
    reason: 'Model changed — check associations/validations',
  },
];

// Patterns that should produce no output
const SILENT_PATTERNS = [
  /\/(spec|test)\//,
  /\.md$/,
];

function getFilePath(payload) {
  const { tool_name, tool_input } = payload;
  if (!tool_name || !tool_input) return null;

  const name = tool_name.toLowerCase();

  if (name === 'edit' || name === 'write') {
    return tool_input.file_path || null;
  }

  if (name === 'multiedit') {
    // MultiEdit uses file_path at the top level
    return tool_input.file_path || null;
  }

  return null;
}

function route(filePath) {
  // Silent patterns — no output
  for (const pat of SILENT_PATTERNS) {
    if (pat.test(filePath)) return null;
  }

  // Match routing rules in priority order
  for (const rule of ROUTING_RULES) {
    if (rule.test(filePath)) {
      return rule;
    }
  }

  return null;
}

function main() {
  let raw = '';

  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    raw += chunk;
  });

  process.stdin.on('end', () => {
    try {
      if (!raw.trim()) process.exit(0);

      const payload = JSON.parse(raw);
      const filePath = getFilePath(payload);

      if (!filePath) process.exit(0);

      const match = route(filePath);

      if (!match) process.exit(0);

      process.stdout.write(
        `[CLAUDE-NINJA AUTO-ROUTE]\n` +
        `Changed: ${filePath}\n` +
        `Recommended agent: ${match.agent}\n` +
        `Reason: ${match.reason}\n` +
        `Action: Invoke ${match.agent} to review this change. If the change is already complete and tested, you may skip. If UX/logic/test gaps exist, invoke the agent now.\n`
      );
    } catch (_err) {
      // Never block Claude — exit silently on any error
      process.exit(0);
    }
  });

  process.stdin.on('error', () => {
    process.exit(0);
  });
}

main();
