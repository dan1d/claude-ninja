'use strict';
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const ROOT = path.join(__dirname, '..');

const STEPS = [
  { key: 'agents',        label: 'Agents',            mod: './steps/agents' },
  { key: 'commands',      label: 'Commands',           mod: './steps/commands' },
  { key: 'obsidian-skill',label: 'Obsidian skill',    mod: './steps/obsidian-skill' },
  { key: 'obsidian-notes',label: 'Obsidian notes',    mod: './steps/obsidian-notes' },
  { key: 'memory-mcp',    label: 'AgentKits Memory',  mod: './steps/memory-mcp' },
  { key: 'env-var',       label: 'OBSIDIAN_VAULT',    mod: './steps/env-var' },
  { key: 'memory-files',  label: 'Memory files',      mod: './steps/memory-files' },
  { key: 'hooks',         label: 'Auto-route hook',   mod: './steps/hooks' },
  { key: 'mempalace',     label: 'MemPalace',         mod: './steps/mempalace' },
  { key: 'github-auth',   label: 'GitHub CLI',        mod: './steps/github-auth' },
  { key: 'obsidian-app',  label: 'Obsidian',          mod: './steps/obsidian-app' },
];

function formatResult(ok, label, message) {
  const icon = ok ? chalk.green('✔') : chalk.red('✖');
  const paddedLabel = label.padEnd(20);
  const msg = chalk.gray(message || '');
  return `  ${icon}  ${paddedLabel} ${msg}`;
}

const header = () => {
  const c = chalk.gray;
  const w = chalk.white.bold;

  console.log('');
  console.log(c('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'));
  console.log(c('  ░') + '                                        ' + c('░'));
  console.log(c('  ░') + '        ' + c('    ██████              ') + '    ' + c('░'));
  console.log(c('  ░') + '        ' + c('   ████████             ') + '    ' + c('░'));
  console.log(c('  ░') + '        ' + c('   ██') + chalk.red('◉◉') + c('████            ') + '    ' + c('░'));
  console.log(c('  ░') + '        ' + c('   ████████             ') + '    ' + c('░'));
  console.log(c('  ░') + '        ' + c(' ▄████████████▄         ') + '    ' + c('░'));
  console.log(c('  ░') + '        ' + c('  ████ ████ ████        ') + '    ' + c('░'));
  console.log(c('  ░') + '        ' + c('  ████ ████ ████        ') + '    ' + c('░'));
  console.log(c('  ░') + '        ' + c('  ██▀   ██   ▀██        ') + '    ' + c('░'));
  console.log(c('  ░') + '                                        ' + c('░'));
  console.log(c('  ░') + '   ' + w('🥷  claude-ninja') + '                      ' + c('░'));
  console.log(c('  ░') + '   ' + chalk.gray('Claude Code Setup Installer') + '          ' + c('░'));
  console.log(c('  ░') + '                                        ' + c('░'));
  console.log(c('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'));
  console.log('');
};

async function main(opts = {}) {
  header();

  if (opts.update) {
    console.log('  ' + chalk.yellow('⟳  Update mode') + ' — overwriting agents, commands, hooks & plugins...');
  } else {
    console.log('  Installing your AI development environment...');
  }
  console.log('');

  const results = [];

  // ── Run each step ────────────────────────────────────────────────────────
  for (const step of STEPS) {
    const spinner = ora({
      text: `  ${step.label}...`,
      indent: 0,
    }).start();

    let result;
    try {
      const mod = require(step.mod);
      result = await mod.run(ROOT, opts);
    } catch (err) {
      result = { ok: false, message: `${step.label} crashed`, error: err.message };
    }

    spinner.stop();
    console.log(formatResult(result.ok, step.label, result.message));

    if (!result.ok && result.error) {
      console.log(chalk.red(`     └─ ${result.error}`));
    }

    results.push({ step: step.key, ...result });
  }

  // ── Dependency check summary ─────────────────────────────────────────────
  console.log('');
  console.log('  Checking dependencies...');

  const ghResult = results.find(r => r.step === 'github-auth');
  if (ghResult) {
    console.log(formatResult(ghResult.ok, 'GitHub CLI', ghResult.message));
  }

  const obsResult = results.find(r => r.step === 'obsidian-app');
  if (obsResult) {
    console.log(formatResult(obsResult.ok, 'Obsidian', obsResult.message));
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  console.log('');
  const allOk = results.every(r => r.ok);

  if (allOk) {
    console.log(chalk.cyan('╔══════════════════════════════════════════════╗'));
    const user = require('os').userInfo().username;
    console.log(chalk.cyan('║') + chalk.green.bold(`  🎉  All done. Welcome back, ${user}.`.padEnd(46)) + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════╝'));
  } else {
    const failed = results.filter(r => !r.ok).map(r => r.step).join(', ');
    console.log(chalk.cyan('╔══════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.yellow.bold('  ⚠   Done with some issues.                  ') + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.yellow(`  Failed steps: ${failed}`));
  }

  console.log('');
  console.log('  Per-project setup (one time per repo):');
  console.log(chalk.gray("  $ echo 'ProjectName' > .claude/obsidian-project"));
  console.log('');
}

module.exports = { install: (opts) => main(opts).catch(console.error) };
