# claude-ninja

Private backup of Daniel's full Claude Code configuration. Restores agents, the Obsidian skill plugin, vault notes, and memory files on a new machine.

---

## Prerequisites

- **Claude Code CLI** installed (`npm install -g @anthropic-ai/claude-code` or via the desktop app)
- **Obsidian** installed with the TheOwnerStack vault at `~/Documents/obsidian/TheOwnerStack/`
- **gh CLI** installed and authenticated (`gh auth login`)
- macOS (paths are macOS-specific)

---

## Installation

```bash
git clone git@github.com:dan1d/claude-ninja.git
cd claude-ninja
./install.sh
```

The script installs agents, the Obsidian skill plugin, and vault notes automatically. Memory files require a manual step — see below.

---

## What gets installed

| Component | Source | Destination |
|-----------|--------|-------------|
| Agents (41 files) | `agents/` | `~/.claude/agents/` |
| Global commands | `commands/*.md` | `~/.claude/commands/` |
| Obsidian skill plugin | `plugins/obsidian-skills/` | `~/.claude/plugins/cache/obsidian-skills/` |
| Obsidian vault notes | `obsidian/TheOwnerStack/` | `~/Documents/obsidian/TheOwnerStack/` |
| Memory files | `memory/` | Manual — see below |

---

## Adding to a project

1. Run `install.sh` once on any new machine (installs agents + commands globally).
2. In each project repo, create one file:
   ```bash
   echo "YourProjectName" > .claude/obsidian-project
   ```
   That's it. `/next`, `/test`, `/lint`, `/plan`, `/marketing` are all available globally.

3. Optionally commit `.claude/` to git so your stack-specific agent overrides travel with the repo.

---

## AgentKits Memory (MCP Server)

Persistent SQLite memory with vector search and auto-capture hooks. Install once per machine:

**Option A — npx (runs during install.sh):**
```bash
npx @aitytech/agentkits-memory --platform=claude-code
```

**Option B — Claude Code Marketplace:**
```
/plugin marketplace add aitytech/agentkits-memory
/plugin install agentkits-memory@agentkits-memory
```

After install: memories are auto-captured each session. Browse them at `http://localhost:1905` via:
```bash
npx @aitytech/agentkits-memory web
```

---

## Manual steps after install

### 1. Enable the Obsidian skill

Open Claude Code and run:
```
/plugins
```
Enable `obsidian-skills` from the list. This activates the `obsidian` tool that reads vault notes during session starts.

### 2. Install memory files

Claude Code stores project memory at paths derived from the absolute workspace path, with `/` replaced by `-`:

```
~/.claude/projects/<encoded-workspace-path>/memory/
```

**TheOwnerStack workspace** (adjust username `r1` if different):
```bash
mkdir -p ~/.claude/projects/-Users-r1-claude-projects-theownerstack/memory/
cp memory/theownerstack/* ~/.claude/projects/-Users-r1-claude-projects-theownerstack/memory/
```

**PaydayBooks workspace** (Shopify project):
```bash
mkdir -p ~/.claude/projects/-Users-r1-claude-projects-theownerstack-shopify-project/memory/
cp memory/paydaybooks/* ~/.claude/projects/-Users-r1-claude-projects-theownerstack-shopify-project/memory/
```

Memory files include `MEMORY.md` (the session index Claude reads at startup) plus all project-specific sub-files.

### 3. Verify Obsidian vault

Ensure the vault is open in Obsidian at `~/Documents/obsidian/TheOwnerStack/`. The vault must be registered in Obsidian for the CLI skill to access it.

---

## How the system works

### Session start (4-read pattern)

Run `/next` in any project repo. It auto-detects the project by reading `.claude/obsidian-project`, then loads four Obsidian notes to restore context:

```bash
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Meta/User Profile.md"
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Meta/Preferences & Feedback.md"
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Meta/Known Issues.md"
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Dev/Dev Tracker.md"
```

No hardcoded project names — `PROJECT_NAME` is read from `.claude/obsidian-project` in the repo root.

### New project auto-trigger

When Daniel says anything like "I want to build X" or "new project for Y", Claude automatically:
1. Reads `Project Guidelines.md` from the Obsidian vault
2. Asks for name/stack/description if not clear
3. Generates the full project scaffold (CLAUDE.md, `.claude/` dir, agents, commands, MEMORY.md entry)

### `/next` command

The `/next` command resumes the most recent task from the Dev Tracker, reading current state from the Obsidian vault.

---

## Stack reference

| Project | Stack | Path |
|---------|-------|------|
| **LeadFound** | Rails 8.1.3, Ruby 4.0.2, SolidQueue, Reddit + X scanning | `~/claude-projects/theownerstack/lead_found/` |
| **SalesToBooks** (main app) | Rails 8.1, Hotwire, Tailwind, Sidekiq, Neon PostgreSQL | `~/claude-projects/theownerstack/app-theownerstack/` |
| **PaydayBooks** | Rails 8.1.2, React 19, Shopify + QuickBooks Online | `~/claude-projects/theownerstack/shopify-project/` |
| **SandboxHub** | Rails 8.1, Hotwire, Flowbite, SolidQueue | `~/claude-projects/theownerstack/sandbox_hub/` |

---

## Repository layout

```
claude-ninja/
├── agents/                    # 41 Claude Code agent definitions (.md)
├── commands/                  # Global commands (next, test, lint, plan, marketing)
│   └── marketing/             # Marketing sub-commands
├── memory/
│   ├── theownerstack/         # 23 memory files for the TheOwnerStack workspace
│   └── paydaybooks/           # 4 memory files for the PaydayBooks workspace
├── obsidian/
│   └── TheOwnerStack/
│       ├── Project Guidelines.md
│       ├── LeadFound/         # All LeadFound vault notes
│       └── PaydayBooks/       # All PaydayBooks vault notes
├── plugins/
│   └── obsidian-skills/       # Obsidian CLI skill plugin (v1.0.1)
├── install.sh                 # Restore script
└── README.md                  # This file
```

---

## Marketing Agents (AgentKits Marketing)

20 enterprise-grade marketing agents from [AgentKits Marketing](https://github.com/aitytech/agentkits-marketing):

| Category | Agents |
|----------|--------|
| Core | attraction-specialist, lead-qualifier, email-wizard, sales-enabler, continuity-specialist, upsell-maximizer |
| Support | researcher, brainstormer, planner, project-manager, copywriter, docs-manager |
| Review | brand-voice-guardian, conversion-optimizer, seo-specialist |
| Strategy | persona-builder, solopreneur, startup-founder, command-helper, mcp-manager |

### How routing works

1. Type `/next` — Claude reads your Obsidian Dev Tracker
2. If task is dev-related → routes to `ruby-on-rails-pro`, `hotwire-pro`, etc.
3. If task is marketing-related → routes to the appropriate marketing agent above
4. For unclear/multi-domain → `agent-organizer` decides

### Marketing commands

Run `/marketing <task description>` to directly invoke the marketing agent dispatcher.

---

## Updating this backup

After adding new agents, updating memory files, or adding vault notes, commit and push:

```bash
cd /path/to/claude-ninja
cp ~/.claude/agents/*.md agents/
cp ~/.claude/projects/-Users-r1-claude-projects-theownerstack/memory/* memory/theownerstack/
cp ~/.claude/projects/-Users-r1-claude-projects-theownerstack-shopify-project/memory/* memory/paydaybooks/
cp "/path/to/obsidian/TheOwnerStack/Project Guidelines.md" obsidian/TheOwnerStack/
cp -r "/path/to/obsidian/TheOwnerStack/LeadFound" obsidian/TheOwnerStack/
cp -r "/path/to/obsidian/TheOwnerStack/PaydayBooks" obsidian/TheOwnerStack/
git add -A
git commit -m "Update claude-ninja backup $(date +%Y-%m-%d)"
git push
```
