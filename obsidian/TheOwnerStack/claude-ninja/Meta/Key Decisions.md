# Key Decisions

#meta #decisions

Append-only. Each entry: decision, why, impact.

---

## 2026-04-10 — Sentinel scoped by session_id + project hash

**Decision:** Temp files named `claude-ninja-{name}-{sha1(cwd).slice(0,8)}-{sessionId}` in `os.tmpdir()`.
**Why:** Two Claude windows open simultaneously (e.g. lead_found + claude-ninja) would corrupt each other's plan/review state if sentinels were global.
**Impact:** Zero cross-session interference.

## 2026-04-10 — PreToolUse block written to stderr not stdout

**Decision:** Block message in `obsidian-task-gate.js` uses `process.stderr.write()`.
**Why:** Claude Code only reads stderr when a hook exits with code 2. Stdout is silently discarded.
**Impact:** Claude sees the block reason and writes the plan; before this fix it was silently blocked with no guidance.

## 2026-04-10 — Plan sentinel not cleared on Stop

**Decision:** `post-task-review.js` (Stop hook) only clears the review sentinel; plan sentinel expires via 4hr TTL.
**Why:** Clearing plan sentinel on Stop forced re-plan on every follow-up message in the same task, breaking multi-turn work.
**Impact:** One plan per task, not one per message.

## 2026-04-10 — Model set to claude-opus-4-6 by installer

**Decision:** `src/steps/hooks.js` sets `settings.model = 'claude-opus-4-6'` if unset.
**Why:** Default is sonnet; daniel wants opus for all sessions.
**Impact:** Installer sets it once; user can override manually.

## 2026-04-11 — mempalace and claude-ninja hooks coexist

**Decision:** Both systems register under same hook events (Stop, UserPromptSubmit, PostToolUse).
**Why:** Claude Code runs all hooks for a given event sequentially; no conflict.
**Impact:** mempalace handles semantic memory; claude-ninja handles workflow gates.
