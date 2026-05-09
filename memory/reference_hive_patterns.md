---
name: Hive framework patterns for claude-ninja
description: 20 agentic patterns from open-hive.com/Hive framework. Research-backed (NeurIPS, ICLR). Prioritized for claude-ninja adoption. Reflexion + judges are first.
type: reference
---

## Source

- Blog: https://www.open-hive.com/
- Repo: https://github.com/aden-hive/hive
- Research: JudgeBench (ICLR 2025), WebTestPilot, WebTestBench, SpecOps, Reflexion (NeurIPS 2023)

## Patterns Prioritized for claude-ninja

### Implemented / In Progress
1. **LLM-as-Judge pipeline** — 5 judges at every dev stage (plan, impl, test, integration, e2e)
2. **Reflexion Loop** — Try -> Judge -> Inject feedback -> Retry (max 2). Shinn et al. NeurIPS 2023.

### Next Priority
3. **Hybrid Judge** — Deterministic checks first (regex, JSON, structural), then LLM semantic evaluation, then human escalation. Cheaper, faster, catches obvious issues without opus tokens.
4. **Failure Capture** — Structured logging: which agent, what it tried, what broke, judge feedback. Feeds evolution.
5. **Intelligent Model Routing** — Select model per-task (opus for judgment, sonnet for generation, haiku for simple tasks) based on complexity/cost.

### Medium-term
6. **Outcome-Driven Goals** — Define success criteria instead of step sequences. Agent figures out HOW.
7. **Graph Evolution** — Auto-improve agent prompts from failure patterns across sessions.
8. **Episodic Memory** — Store (agent, task, outcome, verdict) across sessions. Retrieve relevant past experiences.
9. **Dynamic Topology** — Commands spawn sub-agents at runtime as needed.

### Long-term / Research
10. **Confidence Calibration** — Compare LLM judgments to human decisions, build accuracy curves.
11. **Actor Model Supervision** — Prevent hallucination cascades with supervision trees.
12. **Synthetic SLAs** — Outcome-based reliability guarantees (99.5% of commands produce criteria-meeting output).
13. **Context Compaction** — Intelligent pruning of older context over long sessions.
14. **Blackboard Architecture** — Shared mutable state with event-driven agents.

## Decision: Keep Obsidian + Cherry-pick Hive Patterns (2026-05-09)

**Why:** Obsidian hooks already work well. Tolaria (alpha) migration cost is high for marginal gain. Hive patterns can be implemented as claude-ninja agent .md files + command edits + JS hooks — no external framework dependency needed.

**Why not Tolaria:** Same file format as Obsidian. Its MCP server could be added without switching apps. But the migration of all hooks (obsidian-task-gate, post-task-review, prompt-route plan reminders) isn't worth it for an alpha product.
