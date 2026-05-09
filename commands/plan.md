# /plan — claude-ninja
# Inspired by affaan-m/everything-claude-code (commands/plan.md)
# Adapted: uses agent-organizer + Obsidian Dev Tracker instead of the upstream planner agent.
# This file is bundled in claude-ninja — no dependency on the upstream repo at runtime.

Analyse the task and produce a phased execution plan before doing any work.

**Task:** $ARGUMENTS

## Instructions

1. Detect project context:
   - Read `CLAUDE.md` for stack, domain, agents, quality gates
   - Run `cat .claude/obsidian-project` for the Obsidian project name

2. Invoke the `agent-organizer` agent with:
   - The task description
   - Stack info from CLAUDE.md
   - Available agents (from CLAUDE.md or .claude/agents/)
   - Current phase (from Dev Tracker if readable)

3. Present the plan for user approval before executing anything.

3.5. Invoke the `plan-judge` agent to evaluate the plan for:
   - Infrastructure coverage (email, auth, storage, payments)
   - End-to-end path completeness (UI -> API -> DB -> side effects)
   - Error path coverage
   - Environment & config requirements
   - Verification strategy
   - Integration points
   
   **Reflexion loop:** If plan-judge returns WARN or FAIL:
   - Inject the judge's findings into the plan context
   - Revise the plan to address the specific gaps
   - Re-invoke plan-judge on the revised plan (max 2 retries)
   - If still failing after 2 retries, present plan + unresolved findings to user

4. Once approved, spawn the recommended agents in phases.

5. After implementation, run the test suite:
   - If Gemfile present → `bundle exec rspec`
   - If package.json present → `npm test` or `npx jest`
   - Report pass/fail count, failures with file:line, and coverage status

6. Run the linter:
   - If Gemfile present → `bundle exec rubocop app/ spec/`
   - If package.json and eslint → `npx eslint .`
   - If biome.json → `npx biome check .`
   - Auto-fix safe offenses. Report remaining issues.

7. After all phases complete, update the Dev Tracker in Obsidian.
