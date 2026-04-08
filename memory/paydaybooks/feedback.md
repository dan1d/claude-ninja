---
name: Feedback & Preferences
description: How Daniel likes to work — Obsidian source of truth, agent routing, no trailing summaries, no Co-Authored-By
type: feedback
---

## Obsidian is the source of truth
Always read `PaydayBooks/Dev/Dev Tracker.md` before starting work. Update it when done.
**Why:** Daniel set this up explicitly so every session starts with current state, not guesswork.
**How to apply:** First action in any session = `obsidian vault="TheOwnerStack" read path="PaydayBooks/Dev/Dev Tracker.md"`

## Agent routing — use the dispatch table
CLAUDE.md has an Agent Dispatch Protocol table. Route to the right specialist agent automatically.
For multi-domain tasks, use `/plan <task>` which fires `agent-organizer` first.
**Why:** 41 agents installed in ~/.claude/agents/ — `rails-react-pro` is the primary one for this stack.
**How to apply:** Never do Rails+React work without considering whether `rails-react-pro` should handle it.

## No Co-Authored-By lines in commits
**Why:** Daniel's preference — keep commit history clean.
**How to apply:** Never add `Co-Authored-By: Claude...` to any commit message in this project.

## Short messages = implicit "just do it"
When Daniel sends a short message like "next", "continue", or "commit and push" — just do it.
**Why:** He trusts the system; he doesn't need a plan confirmation for straightforward tasks.
**How to apply:** Read Obsidian first, then act. Don't ask for confirmation on clear next steps.

## No trailing summaries after completing work
Don't recap what was just done in a long bullet list after every task.
**Why:** Daniel can read the diff and the Obsidian tracker.
**How to apply:** One short paragraph max after completing a task, or just the key result.
