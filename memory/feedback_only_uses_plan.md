---
name: User only invokes /plan — slim to 3 commands
description: User only uses /plan. Redundant commands (next, test, lint, review) were deleted 2026-05-09. Only 3 commands remain: plan, e2e, marketing. Quality gates fire via hooks automatically.
type: feedback
---

## Rule: /plan is the single entry point. Quality gates are automatic.

The user only ever types `/plan`. All quality checks fire automatically — via hooks or absorbed into /plan itself.

**Why:** Commands that require manual invocation get skipped. The quality pipeline catches bugs the user DIDN'T think to check for. If the user has to remember to run `/review`, the pipeline fails at the human layer.

**Decision (2026-05-09):** Deleted 4 redundant commands (next, test, lint, review). Absorbed test + lint into /plan steps 5-6. Only 3 commands remain:
- `/plan` — the single entry point (plan → plan-judge → execute → test → lint → Obsidian update)
- `/e2e` — manual because it needs a running dev server
- `/marketing` — separate domain

**How to apply:**
- Never create new commands that require manual invocation for quality checks
- New quality gates go into `post-task-review.js` hook (automatic) or into /plan steps
- plan-judge fires within /plan (step 3.5)
- impl-judge + test-judge fire via post-task-review hook (automatic after every code change)
- integration-judge + e2e-judge stay manual (/e2e) because they need a running dev server
