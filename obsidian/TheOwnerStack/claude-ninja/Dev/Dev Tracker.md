# Dev Tracker — claude-ninja

#claude-ninja #dev

Active tasks and next steps for the claude-ninja installer and hooks system.

---

## In Progress

- [ ] Add full Obsidian integration for claude-ninja repo — 2026-04-11 20:53
  - Plan: Create complete vault scaffold (Project Overview, Meta notes, Dev Tracker) in both live vault and repo obsidian/ tree; add .claude/obsidian-project so obsidian-task-gate knows where to look; add Obsidian pre-allows to settings.local.json
  - Files: obsidian/TheOwnerStack/claude-ninja/**, .claude/obsidian-project, .claude/settings.local.json

---

## Up Next

- [ ] Add reference to everything-claude-code for /plan command — plan.md comes from affaan-m/everything-claude-code; new machine install will fail without it
- [ ] Add mempalace init step to installer — run mempalace init + mempalace mine in project repos

---

## Known Issues / Watch

- auto-route.js was using `~/.claude/` (tilde) instead of absolute path — fixed 2026-04-11

---

## Completed

- [x] Initial repo scaffold — agents, commands, hooks, memory system — 2026-04-08
- [x] Linux + macOS cross-platform support (obsidian-app.js, memory-files.js) — 2026-04-10
- [x] Obsidian task gate (PreToolUse) — blocks edits without vault plan — 2026-04-10
- [x] Auto-route hook (PostToolUse) — routes to specialist after file edits — 2026-04-10
- [x] Prompt-route hook (UserPromptSubmit) — keyword scoring → agent dispatch — 2026-04-10
- [x] Post-task-review hook (Stop) — triggers code-reviewer-pro + Obsidian update — 2026-04-10
- [x] Session start plan reminder — proactive prompt before gate fires — 2026-04-10
- [x] Add financial-analyst, sparring-partner, startup-roast agents — 2026-04-10
- [x] mempalace integration — hooks coexist in settings.json — 2026-04-11
- [x] Fix model to claude-opus-4-6 (was sonnet) — 2026-04-11

← Back to [[00 - Project Overview]]
