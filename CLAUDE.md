# claude-ninja — Claude Code Context

**Node.js CLI · Private · github.com/dan1d/claude-ninja**

Personal Claude Code configuration backup and installer for dan1d. Installs agents, commands, Obsidian skill, AgentKits Memory MCP, and vault notes on any new machine.

## Install command

```bash
npx github:dan1d/claude-ninja
```

## What's in this repo

| Path | Contents |
|------|----------|
| `agents/` | 41 dev agents (base) |
| `agents/marketing/` | 20 marketing agents (AgentKits Marketing) |
| `commands/` | 5 global commands: next, test, lint, plan, marketing |
| `plugins/obsidian-skills/` | Obsidian CLI skill plugin |
| `memory/theownerstack/` | Workspace memory for theownerstack projects |
| `memory/paydaybooks/` | Workspace memory for PaydayBooks (shopify-project) |
| `obsidian/TheOwnerStack/` | Obsidian vault notes: Project Guidelines, LeadFound, PaydayBooks |
| `skills/marketing/` | AgentKits Marketing skills |
| `bin/cli.js` | npx entry point |
| `src/installer.js` | Orchestrates all install steps |
| `src/steps/` | One file per install step |

## CLI architecture

```
npx github:dan1d/claude-ninja
  └─► src/installer.js
        ├─► steps/agents.js          — copy .md files to ~/.claude/agents/
        ├─► steps/commands.js        — copy to ~/.claude/commands/
        ├─► steps/obsidian-skill.js  — copy plugin to ~/.claude/plugins/cache/
        ├─► steps/obsidian-notes.js  — copy vault notes to ~/Documents/obsidian/
        ├─► steps/memory-mcp.js      — npx @aitytech/agentkits-memory (from $HOME)
        ├─► steps/env-var.js         — OBSIDIAN_VAULT → ~/.zshrc
        ├─► steps/memory-files.js    — copy memory to ~/.claude/projects/.../memory/
        ├─► steps/github-auth.js     — check gh auth, prompt login if needed
        └─► steps/obsidian-app.js    — check Obsidian running, offer to launch
```

All steps are **non-destructive** — skip existing files, never overwrite.

## Adding a new agent

1. Drop the `.md` file into `agents/` (or `agents/marketing/`)
2. Update `agent-organizer.md` routing table with when to use it
3. `git add . && git commit -m "Add <agent-name> agent" && git push`
4. Install locally: `cp agents/<name>.md ~/.claude/agents/`

## Adding a new global command

1. Add `commands/<name>.md`
2. Update `install.sh` and `src/steps/commands.js` to include the new file
3. Commit + push + `cp commands/<name>.md ~/.claude/commands/`

## Key agents in this setup

| Agent | Purpose |
|-------|---------|
| `agent-organizer` | Routes tasks to the right specialist |
| `ruby-on-rails-pro` | Base Rails agent (overridden per project) |
| `attraction-specialist` | Lead gen, landing pages, TOFU |
| `payment-integration` | Stripe, checkout, webhooks |
| `tdd-orchestrator` | TDD workflow coordination |
| `startup-analyst` | Business analysis, SaaS metrics |

## Quality gates (if editing the CLI)

```bash
node bin/cli.js    # must run without errors
```

No test suite yet — keep the installer simple and manually verify each step file.
