'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const CLINE_HOME = path.join(os.homedir(), '.cline');

const SKILL_META = {
  'plan.md': {
    name: 'plan',
    description: 'Analyse a task and produce a phased execution plan with quality gate judges before implementing.',
  },
  'e2e.md': {
    name: 'e2e',
    description: 'Run browser-based E2E verification against a dev server and judge UI correctness.',
  },
  'marketing.md': {
    name: 'marketing',
    description: 'Route to the appropriate marketing agent based on the current task context.',
  },
  'init.md': {
    name: 'init',
    description: 'Scan the current project, read docs, and generate a dev-focused Obsidian vault scaffold with architecture summary and Dev Tracker.',
  },
};

function copyAgents(root, opts) {
  const dest = path.join(CLINE_HOME, 'agents');
  fs.mkdirSync(dest, { recursive: true });

  const sources = [
    path.join(root, 'agents'),
    path.join(root, 'agents', 'marketing'),
  ];

  let copied = 0;
  let skipped = 0;
  let updated = 0;

  for (const src of sources) {
    if (!fs.existsSync(src)) continue;
    const files = fs.readdirSync(src).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      if (fs.existsSync(destFile)) {
        if (opts.update) {
          fs.copyFileSync(srcFile, destFile);
          updated++;
        } else {
          skipped++;
        }
      } else {
        fs.copyFileSync(srcFile, destFile);
        copied++;
      }
    }
  }

  return { copied, skipped, updated };
}

function writeMcpConfig() {
  const settingsDir = path.join(CLINE_HOME, 'data', 'settings');
  const settingsPath = path.join(settingsDir, 'cline_mcp_settings.json');
  fs.mkdirSync(settingsDir, { recursive: true });

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (_) {}
  }

  if (!settings.mcpServers) settings.mcpServers = {};
  let added = 0;

  if (!settings.mcpServers.mempalace) {
    settings.mcpServers.mempalace = {
      command: 'python3',
      args: ['-m', 'mempalace.mcp_server'],
    };
    added++;
  }


  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  return added;
}

function installSkills(root, opts) {
  let copied = 0;
  let skipped = 0;

  for (const [filename, meta] of Object.entries(SKILL_META)) {
    const srcFile = path.join(root, 'commands', filename);
    if (!fs.existsSync(srcFile)) continue;

    const skillDir = path.join(CLINE_HOME, 'skills', meta.name);
    const skillFile = path.join(skillDir, 'SKILL.md');

    if (fs.existsSync(skillFile) && !opts.update) {
      skipped++;
      continue;
    }

    fs.mkdirSync(skillDir, { recursive: true });

    const body = fs.readFileSync(srcFile, 'utf8');
    const skillContent = `---\nname: ${meta.name}\ndescription: ${meta.description}\n---\n\n${body}`;
    fs.writeFileSync(skillFile, skillContent, 'utf8');
    copied++;
  }

  return { copied, skipped };
}

function installRules(root, opts) {
  const rulesDir = path.join(CLINE_HOME, 'rules');
  const destFile = path.join(rulesDir, 'claude-ninja.md');

  if (fs.existsSync(destFile) && !opts.update) {
    return { copied: 0, skipped: 1 };
  }

  const claudeMd = path.join(root, 'CLAUDE.md');
  if (!fs.existsSync(claudeMd)) {
    return { copied: 0, skipped: 0 };
  }

  fs.mkdirSync(rulesDir, { recursive: true });
  fs.copyFileSync(claudeMd, destFile);
  return { copied: 1, skipped: 0 };
}

async function run(root, opts = {}) {
  try {
    const parts = [];

    // (a) Agents
    const agents = copyAgents(root, opts);
    const agentParts = [];
    if (agents.copied > 0) agentParts.push(`${agents.copied} agents added`);
    if (agents.updated > 0) agentParts.push(`${agents.updated} updated`);
    if (agents.skipped > 0) agentParts.push(`${agents.skipped} unchanged`);
    if (agentParts.length > 0) parts.push(agentParts.join(', '));

    // (b) MCP servers
    const mcpAdded = writeMcpConfig();
    if (mcpAdded > 0) parts.push(`${mcpAdded} MCP server(s)`);

    // (c) Skills (commands → SKILL.md)
    const skills = installSkills(root, opts);
    if (skills.copied > 0) parts.push(`${skills.copied} skill(s)`);

    // (d) Rules
    const rules = installRules(root, opts);
    if (rules.copied > 0) parts.push('rules');

    const msg = parts.length > 0
      ? `${parts.join(', ')} → ~/.cline/`
      : 'already installed — nothing to do';

    return { ok: true, message: msg };
  } catch (err) {
    return { ok: false, message: 'Cline setup failed', error: err.message };
  }
}

module.exports = { run };
