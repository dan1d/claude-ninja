---
tags: [guidelines, meta]
---

# TheOwnerStack — Project Guidelines

How every new project in this workspace is set up. Claude reads this and **generates** the full scaffold — never copy-paste.

---

## Philosophy

- **Obsidian is the source of truth** for every project. Tasks, decisions, preferences, bugs — all live there. CLAUDE.md points to Obsidian; Obsidian holds the content.
- **Session continuity via 5 reads.** Every session starts by reading 5 Obsidian notes (User Profile, Preferences, Known Issues, Key Decisions, Dev Tracker). Full context, no re-explanation.
- **"next" = full context.** One word. Claude reads Obsidian, shows what's in progress, picks the right agent, starts working.
- **Agents are specialists.** Project-level agents in `.claude/agents/` override global ones with stack-specific knowledge.
- **TDD always.** Failing test first. 100% line + branch coverage (Ruby). 100% line (JS). Suite must pass before any task is marked done.
- **Zero lint offenses.** RuboCop (Ruby) / ESLint or Biome (JS/TS). 0 offenses before committing.
- **No Co-Authored-By in commits. Ever.**
- **Never trust agent coverage claims.** Agents run partial suites and report "100% coverage" incorrectly. Always verify with the full suite (`bundle exec rspec` / `jest`) before accepting coverage as done. Every agent prompt that writes tests must end with: "run the full suite and confirm 100% before declaring done."
- **Network error branches are mandatory.** Every HTTP client method needs a `to_raise(Faraday::ConnectionFailed...)` / `axios` network error test. HTTP status code tests alone do not cover the `rescue StandardError` block inside `begin`.
- **Adapter/wrapper rescue branches need their own tests.** If an outer spec mocks the adapter (using doubles), the adapter's own rescue blocks are never hit. Add dedicated unit specs for the adapter with real WebMock 401/500 stubs.

---

## Trigger

When a user expresses intent to start a new project — any phrasing like "new project", "I want to build", "start a clone of", "set up a new app" — Claude should automatically:
1. Read this guidelines note from Obsidian
2. Ask for the 3 inputs below if not provided
3. Generate the full scaffold without being asked

**The 3 inputs needed:**
- Project name (e.g. "XClone", "ShipFast", "BudgetTracker")
- Stack (e.g. "Rails 8.1 + Hotwire", "Next.js 15 + TypeScript", "Node.js + Fastify")
- One-line description (e.g. "Twitter competitor with chronological feed")

Everything else is generated from these 3 inputs using the patterns below.

---

## Obsidian Vault Structure

Every project gets: `TheOwnerStack/<ProjectName>/`

```
<ProjectName>/
├── 00 - Project Overview.md      ← architecture, stack, domain model, quick ref
├── Meta/
│   ├── User Profile.md           ← who Daniel is, working style, background
│   ├── Preferences & Feedback.md ← rules learned from working together
│   ├── Key Decisions.md          ← architectural choices + why (append-only, date-stamped)
│   └── Known Issues.md           ← bugs and gaps, priority-ordered (HIGH/MEDIUM/LOW)
└── Dev/
    ├── Dev Tracker.md            ← In Progress / Up Next / Completed
    └── <Feature>.md              ← deep-dive notes per major feature (optional)
```

### What goes in each note

**User Profile.md** — Name, role, background (Argentine founder, 14+ yrs Rails, terse communicator, short messages = just do it). Same across all projects — copy from PaydayBooks/Meta/User Profile.md and adjust role.

**Preferences & Feedback.md** — Always starts with "Obsidian is the source of truth". Includes: no trailing summaries, TDD mandatory, no Co-Authored-By, stack-specific rules. Grows over time.

**Key Decisions.md** — Append-only. Format: `## YYYY-MM-DD — Decision Title` then Decision / Why / Impact.

**Known Issues.md** — Prioritised list. HIGH (blocks launch), MEDIUM (important but not blocking), LOW (nice to fix).

**Dev Tracker.md** — Three sections: `## In Progress`, `## Up Next`, `## Completed`. This is what "next" reads to know what to work on.

---

## CLAUDE.md Structure

Every project CLAUDE.md has these sections in this order:

```
# <ProjectName> — Claude Code Context
**Stack line** — versions + one-line description

## Agent Dispatch Protocol
Auto-routing table: task type → agent
"/plan <task>" for multi-domain work

## Obsidian — Source of Truth
Session start checklist (4 reads)
Rules (before/when completing/when discovering)
CLI commands
Vault map

## Domain Model
Core architecture or data model

## Key Models / Architecture
Table of main entities

## Testing Requirements
Coverage minimum, filtered files, framework rules

## Quality Gates
The 2 commands to run before marking anything done

## Development Commands
6-8 most-used shell commands

## Project-Level Agents
Table: agent name → what it's for
```

---

## .claude/ Directory Structure

```
.claude/
├── agents/                  ← project-specific overrides of global agents
├── commands/
│   ├── next.md              ← reads Obsidian, shows In Progress, picks agent, starts
│   ├── test.md              ← runs tests with project-specific context and rules
│   ├── lint.md              ← runs linter with known intentional disables
│   └── plan.md              ← fires agent-organizer for multi-domain tasks
└── settings.local.json      ← pre-allows 4 Obsidian reads + common bash commands
```

### settings.local.json — always include these pre-allows

```json
{
  "permissions": {
    "allow": [
      "Bash(obsidian vault=\"TheOwnerStack\" read path=\"<Name>/Meta/User Profile.md\")",
      "Bash(obsidian vault=\"TheOwnerStack\" read path=\"<Name>/Meta/Preferences & Feedback.md\")",
      "Bash(obsidian vault=\"TheOwnerStack\" read path=\"<Name>/Meta/Known Issues.md\")",
      "Bash(obsidian vault=\"TheOwnerStack\" read path=\"<Name>/Meta/Key Decisions.md\")",
      "Bash(obsidian vault=\"TheOwnerStack\" read path=\"<Name>/Dev/Dev Tracker.md\")",
      "Bash(obsidian vault=\"TheOwnerStack\" read path=\"<Name>/Dev/*\")",
      "Bash(obsidian vault=\"TheOwnerStack\" append path=\"<Name>/Dev/Dev Tracker.md\"*)",
      "Bash(obsidian task toggle ref=\"<Name>/*\"*)",
      "Bash(obsidian vault=\"TheOwnerStack\" create path=\"<Name>/*\"*)",
      "Bash(ls*)", "Bash(grep*)", "Bash(git add*)", "Bash(git status)",
      "Bash(git diff*)", "Bash(git log*)"
    ]
  }
}
```

---

## Agent Selection by Stack

### Ruby on Rails + Hotwire
Override globals: `ruby-on-rails-pro`, `tdd-rspec-pro`, `migration-pro`, `hotwire-pro`
Add if Stripe: `stripe-billing-pro`
Add if Flowbite: `flowbite-ui-pro`
Keep global (no override): `postgres-pro`, `security-auditor`, `code-reviewer`, `rails-architect`

### Next.js / React / TypeScript
Override globals: `react-pro`, `nextjs-pro`, `typescript-pro`
Add if Tailwind+Flowbite: `flowbite-ui-pro` (adapted for React)
Keep global (no override): `security-auditor`, `code-reviewer`, `database-optimizer`

### Node.js / Express / Fastify
Override globals: `typescript-pro`, `backend-architect`
Keep global: `postgres-pro`, `security-auditor`, `code-reviewer`

### Shopify App (Rails + React)
Override globals: `rails-react-pro` (combined), `ruby-on-rails-pro`, `react-pro`
Keep global: `security-auditor`, `postgres-pro`

### What a project-level agent override contains
- Exact version numbers (not "Rails 8", say "Rails 8.1.3")
- Stack-specific tool choices (SolidQueue not Sidekiq, Propshaft not Sprockets, Bun not npm)
- Coverage requirements for this project
- Naming conventions and patterns specific to this codebase
- Known gotchas or rules learned during development
- The quality gate commands verbatim

---

## Slash Commands — Content Patterns

### next.md
1. Run 5 Obsidian reads
2. Read Dev Tracker → identify In Progress (or first Up Next)
3. Show user: what we're working on + 3-5 bullet plan
4. Route to correct agent per CLAUDE.md routing table
5. Start immediately
6. When done: tick item, move to Completed

### test.md
- Runs: `<test command> $ARGUMENTS`
- Reports: pass/fail count, any failures with file:line, coverage status
- Knows: coverage minimum, filtered files, framework-specific error causes (WebMock, VCR, Lockbox, etc.)

### lint.md
- Runs: `<lint command>` with --fix / --fix-all flags
- Knows: known intentional disables and why they exist
- Recommends: extract methods over rubocop:disable

### plan.md
- Fires agent-organizer with full project context
- Returns phased plan for approval before execution
- Context includes: stack, repo path, domain, available agents, quality gates, current phase

---

## Memory System Integration

In `~/.claude/projects/<workspace>/memory/MEMORY.md`, add:

```markdown
## <ProjectName> Session Start

```bash
obsidian vault="TheOwnerStack" read path="<Name>/Meta/User Profile.md"
obsidian vault="TheOwnerStack" read path="<Name>/Meta/Preferences & Feedback.md"
obsidian vault="TheOwnerStack" read path="<Name>/Meta/Known Issues.md"
obsidian vault="TheOwnerStack" read path="<Name>/Meta/Key Decisions.md"
obsidian vault="TheOwnerStack" read path="<Name>/Dev/Dev Tracker.md"
```
```

Also create `memory/project_<name>.md` — a pointer file, not content. Just: what it is, what stack, current phase, "read Obsidian at session start".

---

## Reference Implementations

| Project | Obsidian Folder | Stack | Repo |
|---------|-----------------|-------|------|
| PaydayBooks | `PaydayBooks/` | Rails 8.1.2 · Ruby 3.4 · React 19 · Shopify+QBO | `shopify-project/` |
| LeadFound | `LeadFound/` | Rails 8.1.3 · Ruby 4.0.2 · SolidQueue · Flowbite | `lead_found/` |

When generating a new project, use these as tone and depth reference for each note.
