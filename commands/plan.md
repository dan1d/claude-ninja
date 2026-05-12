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

3.6. Invoke the `taste-judge` agent to evaluate the plan for:
   - Scope creep (features or refactors beyond the stated requirement)
   - Premature architecture (abstractions before complexity demands them)
   - Vague success criteria (phases without measurable completion targets)
   
   If taste-judge returns WARN or FAIL, simplify the plan:
   - Remove "while we're at it" phases
   - Inline premature abstractions
   - Add measurable verification to vague phases
   - Re-invoke taste-judge (max 1 retry)

4. Once approved, spawn the recommended agents in phases.
   When composing the prompt for each implementing agent, include:
   a. The Karpathy taste principles: minimum viable code, no premature abstractions,
      surgical changes only, match existing style. Agents must write the simplest code
      that solves the stated problem — no speculative features or "while we're at it" work.
   b. If the project uses react-doctor (check for `react-doctor` in package.json or
      `react-doctor.config.json`): instruct the agent to follow the React Doctor
      compliance rules (Pressable over TouchableOpacity, boxShadow over shadow props,
      named renderItem, useReducer at 4+ states, components under 300 lines, lazy
      initializer for useState(prop), single setState path, no index keys, useMemo,
      useCallback). The goal is zero react-doctor issues on first write.
   c. Explicit instruction: "Write code that passes react-doctor and taste-judge on
      the first try. Do not introduce issues to fix later."

5. After implementation, run the test suite:
   - If Gemfile present → `bundle exec rspec`
   - If package.json present → `npm test` or `npx jest`
   - Report pass/fail count, failures with file:line, and coverage status

6. Run the linter:
   - If Gemfile present → `bundle exec rubocop app/ spec/`
   - If package.json and eslint → `npx eslint .`
   - If biome.json → `npx biome check .`
   - Auto-fix safe offenses. Report remaining issues.

6.5. Run quality gate judges on the implementation:
   a. Invoke `taste-judge` on the changed files (git diff --name-only)
      - If WARN: note findings but continue
      - If FAIL: fix taste violations before marking done
   b. Detect react-doctor: check for `react-doctor.config.json` or `react-doctor` in package.json
      - If detected: invoke `react-doctor-judge` on the affected app(s)
      - If score regressed: fix issues before marking done
      - If not detected: skip silently

7. After all phases complete, update the Dev Tracker in Obsidian.
