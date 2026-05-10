# claude-ninja

A batteries-included Claude Code configuration kit. Ships 53 dev agents (including a 5-judge quality pipeline), 20 marketing agents, 3 global commands, auto-routing hooks, Obsidian integration, and persistent memory &mdash; installed with one command.

```
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░                                        ░
  ░            ██████                       ░
  ░           ████████                      ░
  ░           ██◉◉████                      ░
  ░           ████████                      ░
  ░         ▄████████████▄                  ░
  ░          ████ ████ ████                 ░
  ░          ████ ████ ████                 ░
  ░          ██▀   ██   ▀██                 ░
  ░                                        ░
  ░   claude-ninja                         ░
  ░   Your AI development environment      ░
  ░                                        ░
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

---

## Quick Start

```bash
npx github:dan1d/claude-ninja
```

That's it. The installer walks you through each step with progress indicators and skips anything already installed.

### Updating

Already installed? Pull the latest agents, commands, hooks, and plugins:

```bash
npx github:dan1d/claude-ninja --update
```

This overwrites code files (agents, commands, hooks, plugins) but preserves your local data (memory files, Obsidian notes) since those evolve per-machine.

### What gets installed

| Component | Count | Destination |
|-----------|-------|-------------|
| Dev agents | 53 | `~/.claude/agents/` |
| Marketing agents | 20 | `~/.claude/agents/` |
| Global commands | 3 | `~/.claude/commands/` |
| Auto-route hooks | 2 | `~/.claude/hooks/` + `settings.json` |
| Obsidian skill plugin | 1 | `~/.claude/plugins/cache/` |
| Memory MCP server | 1 | `~/.claude/settings.json` |
| `OBSIDIAN_VAULT` env var | &mdash; | `~/.zshrc` or `~/.bashrc` |

---

## Prerequisites

- [Claude Code](https://claude.ai/code) installed (CLI, desktop app, or IDE extension)
- [Node.js](https://nodejs.org/) 16+
- macOS or Linux
- (Optional) [Obsidian](https://obsidian.md/) for the vault integration
- (Optional) [GitHub CLI](https://cli.github.com/) for `gh auth` check

---

## How It Works

claude-ninja turns Claude Code from a general-purpose assistant into a **team of specialists** that auto-route to the right agent based on what you're doing.

### 1. Agents &mdash; your specialist team

Every `.md` file in `agents/` defines a specialist persona. When Claude encounters a task, the `agent-organizer` reads the situation and delegates to the best-fit agent:

```
You edit a React component
  └─ auto-route hook fires → routes to react-pro agent

You type "add Stripe webhook"
  └─ prompt-route hook fires → routes to payment-integration agent

You run /next
  └─ agent-organizer reads your tracker → picks the right specialist
```

### 2. Commands &mdash; workflows you can invoke

| Command | What it does |
|---------|-------------|
| `/plan` | Create plan, execute, run tests + lint, update Obsidian tracker |
| `/e2e` | Run E2E tests via Playwright MCP with integration pre-checks |
| `/marketing` | Route to the marketing agent team |

### 3. Hooks &mdash; automatic routing

Three hooks fire automatically:

- **`auto-route.js`** (PostToolUse) &mdash; after every file edit, matches the file path to a specialist (JSX → `react-pro`, models → `ruby-on-rails-pro`, etc.)
- **`prompt-route.js`** (UserPromptSubmit) &mdash; scores your prompt against keyword rules and routes to the matching domain agent
- **`post-task-review.js`** (Stop) &mdash; after every task that modifies source files, automatically runs code-reviewer-pro → impl-judge → test-judge (with reflexion loops), then updates the Obsidian Dev Tracker

### 4. Quality pipeline &mdash; 5-judge LLM-as-Judge

Five LLM-as-Judge agents form a quality gate at every development stage. Each gate uses a **reflexion loop**: if the verdict is WARN/FAIL, the critique is injected as context and the agent retries automatically (max 2 retries). Inspired by [Hive](https://www.open-hive.com/) patterns (Reflexion from Shinn et al., NeurIPS 2023).

```
/plan → [plan-judge] ←reflexion─┐
            │                    │
       WARN/FAIL? ── revise ────┘
            │ PASS
            ▼
     implement → [impl-judge] ←reflexion─┐    ← auto (post-task hook)
                      │                   │
                 WARN/FAIL? ── fix ──────┘
                      │ PASS
                      ▼
              [test-judge] ←reflexion─┐        ← auto (post-task hook)
                    │                  │
               WARN/FAIL? ── fix ────┘
                    │ PASS
                    ▼
         [integration-judge] → [e2e-judge]     ← manual (/e2e)
```

| Judge | When it fires | What it catches |
|-------|--------------|-----------------|
| `plan-judge` | Inside `/plan` (step 3.5) | Missing infrastructure, incomplete paths, no error handling, no verification strategy |
| `impl-judge` | Automatic (post-task hook) | Dead buttons, unwired handlers, missing routes, defined-but-never-called side effects |
| `test-judge` | Automatic (post-task hook) | Vacuous assertions, mocks that defeat their purpose, missing edge cases |
| `integration-judge` | `/e2e` pre-check | Missing env vars, unreachable services, expired API keys, pending migrations |
| `e2e-judge` | `/e2e` | Off-screen elements, stuck spinners, UI/network state mismatch, dead interactions |

Only `/plan` needs to be invoked manually. Everything else fires automatically via hooks.

### 5. Obsidian integration (optional)

If you use Obsidian for project notes, claude-ninja connects Claude Code to your vault. This requires a few pieces:

#### What you need

1. **[Obsidian](https://obsidian.md/)** installed and running with a vault open
2. **Obsidian Skills plugin** for Claude Code (from [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills))
3. **`OBSIDIAN_VAULT` env var** pointing to your vault path
4. **A `.claude/obsidian-project` file** in each project repo

#### Step-by-step setup

**1. Install the Obsidian Skills plugin in Claude Code**

The installer copies a bundled version, but you can also install from the marketplace:

```bash
# Inside Claude Code, run:
/plugins
```

Then add the `obsidian-skills` marketplace and enable the plugin:

```
# Add the marketplace source (one time)
/plugin marketplace add kepano/obsidian-skills

# Install and enable
/plugin install obsidian@obsidian-skills
```

Or, if the installer already copied it, just enable it in `/plugins`.

**2. Set the `OBSIDIAN_VAULT` environment variable**

The installer adds this to your shell profile automatically, but if you need to set it manually:

```bash
# Add to ~/.zshrc or ~/.bashrc
export OBSIDIAN_VAULT="$HOME/Documents/obsidian/YourVaultName"

# Reload
source ~/.zshrc
```

**3. Make sure Obsidian is running**

The Obsidian CLI skill communicates with the running Obsidian app. It won't work if Obsidian is closed. The installer checks this and offers to launch it.

**4. Create your vault structure**

For each project, create a folder in your Obsidian vault. The only **required** file is `Dev/Dev Tracker.md` &mdash; everything else is optional and grows as the project matures.

**Minimal setup (enough to get started):**

```
YourVaultName/
└── YourProject/
    └── Dev/
        └── Dev Tracker.md          # Task list (Claude reads/writes this)
```

**Full structure (for a mature project):**

Here's a real example from the GymsRatz project &mdash; a gym management SaaS:

```
YourVaultName/
└── gymsratz/
    ├── Product Vision & Envision.md   # What the product is, who it's for, architecture
    ├── CEO Plan.md                    # Roadmap, go-to-market, pricing, projections
    ├── Competitive Analysis.md        # Market landscape, competitor gaps
    ├── Design Prompt.md               # Full UI/UX spec for Claude Design
    ├── Decisions.md                   # Architectural choices + why (append-only)
    └── Dev/
        ├── Dev Tracker.md             # In Progress / Up Next / Completed
        └── Tickets.md                 # Backlog with acceptance criteria
```

**Notes you might add per project:**

| Note | Purpose | When to add |
|------|---------|-------------|
| `Dev/Dev Tracker.md` | Task list Claude reads at session start | **Always** (required) |
| `Product Vision & Envision.md` | Product definition, user roles, data model | Day 1 of a new product |
| `CEO Plan.md` | Roadmap, pricing, go-to-market, revenue projections | When planning launch |
| `Competitive Analysis.md` | Competitor landscape, feature gaps | Before pricing/positioning |
| `Design Prompt.md` | Full UI spec for Claude Design or other AI design tools | Before design phase |
| `Decisions.md` | Append-only log of architectural decisions + rationale | Ongoing |
| `Dev/Tickets.md` | Detailed ticket backlog with acceptance criteria | When breaking work into tickets |

The structure is flexible. Add notes as you need them. The only convention Claude enforces is that `Dev/Dev Tracker.md` exists and follows the In Progress / Up Next / Completed format.

**5. Connect a project to Obsidian**

```bash
cd your-project/
mkdir -p .claude
echo 'YourProject' > .claude/obsidian-project
```

The value must match the folder name in your vault (e.g., if your vault has `MyVault/gymsratz/Dev/Dev Tracker.md`, use `echo 'gymsratz'`).

#### What it does once connected

- **Session start**: Claude reads your Dev Tracker (and any other project notes) from Obsidian before starting work
- **Task gate**: A PreToolUse hook blocks code edits until a task plan exists in the Dev Tracker
- **Session end**: A Stop hook updates your Obsidian notes with what changed

#### Dev Tracker format

The Dev Tracker follows a simple format that Claude reads and writes:

```markdown
# ProjectName — Dev Tracker

## In Progress

- [ ] Build user authentication — 2026-05-09 14:00
    - Plan: Implement email/password auth with Supabase, add login/register screens
    - Files: src/auth/, src/screens/Login.tsx, src/screens/Register.tsx

## Up Next

- [ ] Add payment integration with MercadoPago
- [ ] Build routine builder for trainers

## Completed

- [x] Set up monorepo with Turborepo — 2026-05-06
- [x] Create database schema — 2026-05-07
```

When you run `/next`, Claude reads this file, sees what's in progress (or picks the first item from Up Next), and starts working. When a task is done, it ticks the checkbox and moves it to Completed.

### 6. Persistent memory

An MCP-based SQLite memory system (via [AgentKits Memory](https://github.com/aitytech/agentkits-memory)) that persists across sessions:

- Automatic session summaries
- Searchable project history
- Decision tracking
- Browse at `http://localhost:1905` via `npx @aitytech/agentkits-memory web`

---

## All Agents

### Dev Agents (53)

| Agent | Specialty |
|-------|-----------|
| `agent-organizer` | Routes tasks to the right specialist |
| `ai-engineer` | LLM apps, RAG, prompt pipelines |
| `api-documenter` | OpenAPI specs, SDK guides |
| `architect-review` | Architecture consistency review |
| `backend-architect` | System design, scalability |
| `cloud-architect` | AWS/Azure/GCP, Terraform, FinOps |
| `code-reviewer` | Code quality, security, performance |
| `data-engineer` | ETL, Spark, Airflow, Kafka |
| `data-scientist` | SQL, BigQuery, data analysis |
| `database-optimizer` | Query tuning, schema design |
| `debugger` | Error diagnosis, test failures |
| `deployment-engineer` | CI/CD, containers, GitOps |
| `devops-incident-responder` | Incident response, RCA |
| `documentation-expert` | Technical documentation |
| `dx-optimizer` | Developer experience improvement |
| `e2e-judge` | LLM-as-Judge for browser E2E verification |
| `electron-pro` | Cross-platform desktop apps |
| `financial-analyst` | SaaS metrics, financial modeling |
| `frontend-developer` | React components, UI |
| `full-stack-developer` | End-to-end web apps |
| `golang-pro` | Go architecture and concurrency |
| `graphql-architect` | GraphQL API design |
| `heroku-pro` | Heroku deployment optimization |
| `impl-judge` | LLM-as-Judge for implementation completeness |
| `incident-responder` | Production incident commander |
| `integration-judge` | Pre-E2E service connectivity verifier |
| `legacy-modernizer` | Monolith decomposition, upgrades |
| `ml-engineer` | ML model lifecycle, MLOps |
| `mobile-developer` | React Native, Flutter |
| `nextjs-pro` | Next.js SSR/SSG, App Router |
| `payment-integration` | Stripe, PayPal, webhooks |
| `performance-engineer` | Profiling, optimization |
| `plan-judge` | LLM-as-Judge for plan quality evaluation |
| `postgres-pro` | PostgreSQL, PgLite |
| `product-manager` | Product strategy, roadmaps |
| `prompt-engineer` | LLM prompt design |
| `python-pro` | Python optimization, patterns |
| `qa-expert` | Test strategy, quality assurance |
| `rails-architect` | Rails system design |
| `rails-react-pro` | Rails API + React frontend |
| `react-pro` | React, hooks, state management |
| `ruby-on-rails-pro` | Rails implementation |
| `security-auditor` | Security assessment, OWASP |
| `sparring-partner` | Stress-test your thinking |
| `startup-analyst` | Market sizing, unit economics |
| `startup-roast` | Brutally honest idea critique |
| `tdd-orchestrator` | Test-driven development |
| `test-automator` | Test automation, CI testing |
| `test-judge` | LLM-as-Judge for test quality |
| `typescript-pro` | TypeScript architecture |
| `ui-designer` | UI design, design systems |
| `ux-designer` | UX research, usability |

### Marketing Agents (20)

From [AgentKits Marketing](https://github.com/aitytech/agentkits-marketing):

| Agent | Specialty |
|-------|-----------|
| `attraction-specialist` | Lead gen, landing pages, SEO |
| `brainstormer` | Campaign ideation |
| `brand-voice-guardian` | Brand consistency review |
| `command-helper` | Intent-based command discovery |
| `continuity-specialist` | Retention, re-engagement |
| `conversion-optimizer` | CRO, A/B testing |
| `copywriter` | High-converting copy |
| `docs-manager` | Marketing documentation |
| `email-wizard` | Email sequences, automation |
| `lead-qualifier` | Lead scoring, segmentation |
| `mcp-manager` | MCP server integration |
| `persona-builder` | Customer persona discovery |
| `planner` | Campaign planning, calendars |
| `project-manager` | Campaign coordination |
| `researcher` | Market research, competitive intel |
| `sales-enabler` | Sales collateral, objection handling |
| `seo-specialist` | SEO optimization |
| `solopreneur` | Solo founder perspective review |
| `startup-founder` | Startup founder perspective review |
| `upsell-maximizer` | Revenue expansion, upsells |

---

## Customization

### Add your own agent

1. Create `agents/my-agent.md` with a system prompt defining the persona
2. Update `agents/agent-organizer.md` routing table so tasks get routed to it
3. Reinstall: `npx github:dan1d/claude-ninja`

### Add a global command

1. Create `commands/my-command.md` with the command prompt
2. Update `src/steps/commands.js` to copy the new file
3. Reinstall or manually copy: `cp commands/my-command.md ~/.claude/commands/`

### Add auto-route rules

Edit `src/hooks/auto-route.js` to add file-path matching rules:

```javascript
// Example: route .py files to python-pro
if (filePath.endsWith('.py')) {
  console.log('[ROUTE] Python file → use python-pro agent');
}
```

### Use without Obsidian

The Obsidian integration is fully optional. If you don't use Obsidian:
- The installer skips vault steps if Obsidian isn't detected
- Agents and commands work independently
- The task gate hook won't fire without `.claude/obsidian-project`

### Per-project setup

After installing globally, connect a specific project:

```bash
cd your-project/

# (Optional) Connect to Obsidian vault
echo 'YourProjectName' > .claude/obsidian-project

# (Optional) Add project-specific agent overrides
mkdir -p .claude/agents/
# Add .md files here to override global agents for this project
```

---

## Repo Structure

```
claude-ninja/
├── agents/                     # 53 dev agent definitions (.md)
│   └── marketing/              # 20 marketing agents (AgentKits Marketing)
├── bin/
│   └── cli.js                  # npx entry point
├── commands/                   # Global slash commands
│   ├── plan.md                 # Plan → execute → test → lint → update tracker
│   ├── e2e.md                  # E2E testing with integration pre-checks
│   ├── marketing.md            # Marketing dispatcher
│   └── marketing/              # Marketing sub-commands
├── memory/                     # Project memory files (per-workspace)
├── obsidian/                   # Obsidian vault templates
├── plugins/
│   └── obsidian-skills/        # Obsidian CLI skill plugin
├── skills/
│   └── marketing/              # AgentKits Marketing skills
├── src/
│   ├── installer.js            # Main installer orchestrator
│   ├── hooks/                  # Auto-routing hook scripts
│   └── steps/                  # One file per install step
├── install.sh                  # Legacy bash installer (still works)
├── package.json
├── CLAUDE.md                   # Claude Code project context
└── README.md
```

---

## How the Installer Works

The `npx` installer runs 10 steps sequentially, each with a spinner and pass/fail indicator:

| Step | Module | What it does |
|------|--------|-------------|
| 1 | `steps/agents.js` | Copies agent `.md` files to `~/.claude/agents/` |
| 2 | `steps/commands.js` | Copies command `.md` files to `~/.claude/commands/` |
| 3 | `steps/obsidian-skill.js` | Installs the Obsidian CLI plugin |
| 4 | `steps/obsidian-notes.js` | Copies vault templates to Obsidian |
| 5 | `steps/memory-mcp.js` | Installs AgentKits Memory MCP server |
| 6 | `steps/env-var.js` | Sets `OBSIDIAN_VAULT` in shell profile |
| 7 | `steps/memory-files.js` | Copies memory files to Claude project dirs |
| 8 | `steps/hooks.js` | Installs auto-route hooks + settings.json |
| 9 | `steps/github-auth.js` | Checks `gh` CLI authentication |
| 10 | `steps/obsidian-app.js` | Checks if Obsidian is running |

All steps are **non-destructive** &mdash; they skip existing files and never overwrite your config.

---

## Alternative Install

If you prefer the bash script over npx:

```bash
git clone https://github.com/dan1d/claude-ninja.git
cd claude-ninja
./install.sh
```

---

## FAQ

**Can I use this without Obsidian?**
Yes. Agents, commands, hooks, and memory all work independently. The Obsidian integration adds session context loading and task tracking, but is fully optional.

**Will this overwrite my existing agents or settings?**
No. The installer is non-destructive &mdash; it copies files but doesn't overwrite existing ones.

**How do I update?**
Run `npx github:dan1d/claude-ninja` again. It re-copies all files.

**Does it work on Linux?**
Yes. The installer detects the platform and adjusts paths. Obsidian-related steps are macOS/Linux compatible.

**Can I add my own agents alongside these?**
Absolutely. Drop `.md` files in `~/.claude/agents/` and they'll coexist with the ninja agents.

---

## Credits

- [Obsidian Skills](https://github.com/kepano/obsidian-skills) by [@kepano](https://github.com/kepano) &mdash; Obsidian CLI plugin for Claude Code
- [AgentKits Marketing](https://github.com/aitytech/agentkits-marketing) &mdash; 20 marketing agents
- [AgentKits Memory](https://github.com/aitytech/agentkits-memory) &mdash; Persistent memory MCP server
- [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) &mdash; Inspiration for the plan command and ECC agents

---

## License

MIT
