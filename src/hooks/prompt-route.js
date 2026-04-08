'use strict';

// UserPromptSubmit hook — two jobs:
//  1. If no Obsidian plan exists for this session, remind Claude to write one FIRST
//     (proactive — prevents the PreToolUse gate from ever firing as a surprise)
//  2. Route prompts to specialist agents based on keyword scoring
// Reads JSON payload from stdin, prints a routing directive if the prompt matches a rule.
// No npm dependencies — only Node.js built-ins.

const os     = require('os');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// ── Plan sentinel helpers (mirrors obsidian-task-gate.js) ────────────────────

const SENTINEL_TTL = 4 * 60 * 60 * 1000;

function projHash() {
  return crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 8);
}

function planSentinelPath(sessionId) {
  const sid = (sessionId || 'no-session').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
  return path.join(os.tmpdir(), `claude-ninja-plan-ready-${projHash()}-${sid}`);
}

function planExists(sessionId) {
  try {
    const stat = fs.statSync(planSentinelPath(sessionId));
    return (Date.now() - stat.mtimeMs) < SENTINEL_TTL;
  } catch { return false; }
}

function getVaultPath() {
  if (process.env.OBSIDIAN_VAULT) return process.env.OBSIDIAN_VAULT;
  return path.join(os.homedir(), 'Documents', 'obsidian');
}

function getProjectName() {
  try {
    return fs.readFileSync(path.join(process.cwd(), '.claude', 'obsidian-project'), 'utf8').trim();
  } catch { return path.basename(process.cwd()); }
}

// ── Routing rules ────────────────────────────────────────────────────────────

// Each rule has a `score` function that returns a numeric weight for the prompt.
// The rule with the highest non-zero score wins.
const ROUTING_RULES = [
  {
    agent: 'tdd-orchestrator',
    description: 'TDD workflow, test-first, failing tests, RSpec/Jest/Minitest',
    score: (p) => {
      let s = 0;
      if (/\btest[s]?\b/i.test(p)) s += 2;
      if (/\bspec[s]?\b/i.test(p)) s += 2;
      if (/\btdd\b/i.test(p)) s += 5;
      if (/\bfailing test/i.test(p)) s += 3;
      if (/\brspec\b/i.test(p)) s += 3;
      if (/\bjest\b/i.test(p)) s += 3;
      if (/\bminitest\b/i.test(p)) s += 3;
      if (/\btest.driven\b/i.test(p)) s += 5;
      if (/\bred.green\b/i.test(p)) s += 5;
      return s;
    },
  },
  {
    agent: 'react-pro',
    description: 'React components, JSX, hooks, frontend UI',
    score: (p) => {
      let s = 0;
      if (/\breact\b/i.test(p)) s += 3;
      if (/\bjsx\b/i.test(p)) s += 3;
      if (/\bcomponent[s]?\b/i.test(p)) s += 1;
      if (/\bhook[s]?\b/i.test(p)) s += 2;
      if (/\busestate\b/i.test(p)) s += 3;
      if (/\buseeffect\b/i.test(p)) s += 3;
      if (/\bfrontend\b/i.test(p)) s += 2;
      if (/\bui\b/i.test(p)) s += 1;
      if (/\bpolaris\b/i.test(p)) s += 3;
      return s;
    },
  },
  {
    agent: 'rails-react-pro',
    description: 'Full-stack Rails + React, Shopify embedded app, API + frontend together',
    score: (p) => {
      let s = 0;
      const hasRails = /\brails\b/i.test(p) || /\bruby\b/i.test(p);
      const hasReact = /\breact\b/i.test(p) || /\bjsx\b/i.test(p) || /\bfrontend\b/i.test(p);
      if (hasRails && hasReact) s += 8;
      if (/\bshopify\b/i.test(p)) s += 3;
      if (/\bapp bridge\b/i.test(p)) s += 3;
      if (/\bapi.*controller\b/i.test(p)) s += 2;
      return s;
    },
  },
  {
    agent: 'ruby-on-rails-pro',
    description: 'Rails models, migrations, ActiveRecord, controllers, services',
    score: (p) => {
      let s = 0;
      if (/\brails\b/i.test(p)) s += 3;
      if (/\bruby\b/i.test(p)) s += 2;
      if (/\bmodel[s]?\b/i.test(p)) s += 2;
      if (/\bmigration[s]?\b/i.test(p)) s += 3;
      if (/\bactive.?record\b/i.test(p)) s += 4;
      if (/\bcontroller[s]?\b/i.test(p)) s += 2;
      if (/\bservice.?object[s]?\b/i.test(p)) s += 3;
      if (/\bvalidation[s]?\b/i.test(p)) s += 2;
      if (/\bassociation[s]?\b/i.test(p)) s += 2;
      if (/\bhotwire\b/i.test(p)) s += 3;
      if (/\bturbo\b/i.test(p)) s += 2;
      return s;
    },
  },
  {
    agent: 'security-auditor',
    description: 'Security vulnerabilities, auth, OAuth, permissions, OWASP',
    score: (p) => {
      let s = 0;
      if (/\bsecurit\w+\b/i.test(p)) s += 4;
      if (/\bvulnerabilit\w+\b/i.test(p)) s += 5;
      if (/\boauth\b/i.test(p)) s += 3;
      if (/\bauth[eo]\w*\b/i.test(p)) s += 2;
      if (/\bowasp\b/i.test(p)) s += 5;
      if (/\bpermission[s]?\b/i.test(p)) s += 2;
      if (/\binjection\b/i.test(p)) s += 4;
      if (/\bxss\b/i.test(p)) s += 4;
      if (/\bcsrf\b/i.test(p)) s += 4;
      return s;
    },
  },
  {
    agent: 'database-optimizer',
    description: 'Database performance, slow queries, N+1, indexes, schema',
    score: (p) => {
      let s = 0;
      if (/\bdatabase\b/i.test(p)) s += 2;
      if (/\bslow.query\b/i.test(p)) s += 5;
      if (/\bn\+1\b/i.test(p)) s += 5;
      if (/\bindex\b/i.test(p)) s += 2;
      if (/\bquery.perform\w+\b/i.test(p)) s += 3;
      if (/\bsql\b/i.test(p)) s += 2;
      if (/\bschema\b/i.test(p)) s += 2;
      if (/\bpostgres\b/i.test(p)) s += 2;
      return s;
    },
  },
  {
    agent: 'debugger',
    description: 'Errors, exceptions, bugs, crashes, unexpected behavior',
    score: (p) => {
      let s = 0;
      if (/\berror\b/i.test(p)) s += 2;
      if (/\bexception\b/i.test(p)) s += 3;
      if (/\bcrash\b/i.test(p)) s += 3;
      if (/\bbug\b/i.test(p)) s += 3;
      if (/\bfix\b/i.test(p)) s += 1;
      if (/\bstack.?trace\b/i.test(p)) s += 4;
      if (/\bnot.working\b/i.test(p)) s += 2;
      if (/\bbroken\b/i.test(p)) s += 2;
      if (/\bundefined\b/i.test(p)) s += 2;
      if (/\bnil.?error\b/i.test(p)) s += 3;
      return s;
    },
  },
  {
    agent: 'payment-integration',
    description: 'Stripe, payments, subscriptions, webhooks, billing',
    score: (p) => {
      let s = 0;
      if (/\bstripe\b/i.test(p)) s += 5;
      if (/\bpayment[s]?\b/i.test(p)) s += 4;
      if (/\bsubscription[s]?\b/i.test(p)) s += 3;
      if (/\bwebhook[s]?\b/i.test(p)) s += 3;
      if (/\bbilling\b/i.test(p)) s += 3;
      if (/\bcheckout\b/i.test(p)) s += 2;
      if (/\binvoice\b/i.test(p)) s += 2;
      return s;
    },
  },
  {
    agent: 'heroku-pro',
    description: 'Heroku deploy, dynos, buildpacks, add-ons, Procfile',
    score: (p) => {
      let s = 0;
      if (/\bheroku\b/i.test(p)) s += 8;
      if (/\bdyno[s]?\b/i.test(p)) s += 5;
      if (/\bbuildpack[s]?\b/i.test(p)) s += 5;
      if (/\bprocfile\b/i.test(p)) s += 4;
      return s;
    },
  },
  {
    agent: 'deployment-engineer',
    description: 'CI/CD, Docker, pipelines, GitHub Actions, deploy workflows',
    score: (p) => {
      let s = 0;
      if (/\bci\/?cd\b/i.test(p)) s += 5;
      if (/\bdocker\b/i.test(p)) s += 4;
      if (/\bgithub.actions\b/i.test(p)) s += 4;
      if (/\bpipeline[s]?\b/i.test(p)) s += 3;
      if (/\bdeploy\b/i.test(p)) s += 2;
      if (/\bkubernetes\b/i.test(p)) s += 4;
      return s;
    },
  },
  {
    agent: 'performance-engineer',
    description: 'Performance, slow, optimize, bottleneck, memory, latency',
    score: (p) => {
      let s = 0;
      if (/\bperform\w+\b/i.test(p)) s += 3;
      if (/\bslow\b/i.test(p)) s += 2;
      if (/\boptimize\b/i.test(p)) s += 2;
      if (/\bbottleneck\b/i.test(p)) s += 4;
      if (/\bmemory.leak\b/i.test(p)) s += 5;
      if (/\blatency\b/i.test(p)) s += 3;
      if (/\bthroughput\b/i.test(p)) s += 3;
      return s;
    },
  },
  {
    agent: 'attraction-specialist',
    description: 'Landing pages, lead gen, SEO content, TOFU marketing',
    score: (p) => {
      let s = 0;
      if (/\blanding.page\b/i.test(p)) s += 5;
      if (/\blead.gen\b/i.test(p)) s += 4;
      if (/\bseo\b/i.test(p)) s += 3;
      if (/\btofu\b/i.test(p)) s += 5;
      if (/\bcontent.market\w+\b/i.test(p)) s += 4;
      return s;
    },
  },
  {
    agent: 'financial-analyst',
    description: 'SaaS unit economics, LTV, CAC, MRR, ARR, burn rate, runway, financial modeling',
    score: (p) => {
      let s = 0;
      if (/\bltv\b/i.test(p)) s += 5;
      if (/\bcac\b/i.test(p)) s += 5;
      if (/\bmrr\b/i.test(p)) s += 5;
      if (/\barr\b/i.test(p)) s += 4;
      if (/\bburn.rate\b/i.test(p)) s += 5;
      if (/\brunway\b/i.test(p)) s += 5;
      if (/\bunit.econom\w+\b/i.test(p)) s += 6;
      if (/\bchurn\b/i.test(p)) s += 3;
      if (/\bretention\b/i.test(p)) s += 2;
      if (/\bfinancial.model\b/i.test(p)) s += 5;
      if (/\bpayback.period\b/i.test(p)) s += 5;
      if (/\bnet.revenue.retention\b/i.test(p)) s += 6;
      if (/\bcohort\b/i.test(p)) s += 3;
      if (/\bfundraising\b/i.test(p)) s += 3;
      return s;
    },
  },
  {
    agent: 'startup-roast',
    description: 'Startup reality check, pitch roast, fatal flaw analysis, honest feedback',
    score: (p) => {
      let s = 0;
      if (/\broast\b/i.test(p)) s += 8;
      if (/\breality.check\b/i.test(p)) s += 6;
      if (/\bpitch\b/i.test(p)) s += 3;
      if (/\bstartup.idea\b/i.test(p)) s += 4;
      if (/\bbusiness.idea\b/i.test(p)) s += 4;
      if (/\bfatal.flaw\b/i.test(p)) s += 6;
      if (/\bvalidat\w+.idea\b/i.test(p)) s += 4;
      if (/\bam.i.crazy\b/i.test(p)) s += 5;
      if (/\bhonest.feedback\b/i.test(p)) s += 4;
      if (/\bstress.test.*(idea|model|pitch)\b/i.test(p)) s += 5;
      return s;
    },
  },
  {
    agent: 'sparring-partner',
    description: 'Strategy stress-testing, devil\'s advocate, decision pressure-testing, debate',
    score: (p) => {
      let s = 0;
      if (/\bspar\w*\b/i.test(p)) s += 7;
      if (/\bdevil.?s.advocate\b/i.test(p)) s += 8;
      if (/\bstress.test\b/i.test(p)) s += 5;
      if (/\bpressure.test\b/i.test(p)) s += 5;
      if (/\bchallenge.my\b/i.test(p)) s += 6;
      if (/\bdebate\b/i.test(p)) s += 4;
      if (/\bsteelman\b/i.test(p)) s += 7;
      if (/\bcounterargument\b/i.test(p)) s += 6;
      if (/\bam.i.wrong\b/i.test(p)) s += 5;
      if (/\bwhat.am.i.missing\b/i.test(p)) s += 5;
      if (/\bpoke.holes\b/i.test(p)) s += 6;
      return s;
    },
  },
];

// Minimum score threshold before we emit a routing directive
const MIN_SCORE = 4;

function extractPrompt(payload) {
  // UserPromptSubmit payload: { prompt: string } or { message: string } or raw text
  if (payload && typeof payload.prompt === 'string') return payload.prompt;
  if (payload && typeof payload.message === 'string') return payload.message;
  // Some versions send an array of messages
  if (payload && Array.isArray(payload.messages)) {
    const last = payload.messages[payload.messages.length - 1];
    if (last && typeof last.content === 'string') return last.content;
  }
  return null;
}

function bestMatch(prompt) {
  let best = null;
  let bestScore = 0;

  for (const rule of ROUTING_RULES) {
    const s = rule.score(prompt);
    if (s > bestScore) {
      bestScore = s;
      best = rule;
    }
  }

  return bestScore >= MIN_SCORE ? { rule: best, score: bestScore } : null;
}

function main() {
  if (process.stdin.isTTY) process.exit(0);

  let raw = '';

  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => { raw += chunk; });

  process.stdin.on('end', () => {
    try {
      if (!raw.trim()) process.exit(0);

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (_) {
        // Malformed input — exit silently rather than routing garbage JSON as a prompt
        process.exit(0);
      }

      const sessionId = payload.session_id || '';
      const prompt    = extractPrompt(payload);
      if (!prompt || prompt.trim().length < 10) process.exit(0);

      // ── Proactive Obsidian plan reminder ─────────────────────────────────
      // If no plan sentinel exists for this session AND the vault is present,
      // tell Claude to write to the Dev Tracker BEFORE doing any code edits.
      // This prevents the PreToolUse gate from ever firing as a surprise block.
      const vault = getVaultPath();
      let planReminder = '';
      if (!planExists(sessionId) && fs.existsSync(vault)) {
        const project = getProjectName();
        const tracker = path.join(vault, project, 'Dev', 'Dev Tracker.md');
        const now     = new Date().toISOString().slice(0, 16).replace('T', ' ');
        planReminder =
          `[CLAUDE-NINJA SESSION START]\n` +
          `No Obsidian task plan found for this session.\n` +
          `Before making any code changes, use Write or Edit to add a task entry to:\n` +
          `  ${tracker}\n` +
          `Format:\n` +
          `  - [ ] [brief task name] — ${now}\n` +
          `    - Plan: [what and why]\n` +
          `    - Files: [which files will change]\n` +
          `Do this first, then proceed with the user's request.\n\n`;
      }

      // ── Agent routing ─────────────────────────────────────────────────────
      const match = bestMatch(prompt);

      if (!match && !planReminder) process.exit(0);

      process.stdout.write(
        planReminder +
        (match
          ? `[CLAUDE-NINJA PROMPT-ROUTE]\n` +
            `Detected task: ${match.rule.description}\n` +
            `Required agent: ${match.rule.agent}\n` +
            `Action: You MUST use the Agent tool to invoke the "${match.rule.agent}" subagent for this task. Do not handle it as the general-purpose assistant. Pass the full user request and relevant context to the agent.\n`
          : '')
      );
    } catch (_err) {
      process.exit(0);
    }
  });

  process.stdin.on('error', () => { process.exit(0); });
}

main();
