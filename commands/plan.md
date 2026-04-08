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

4. Once approved, spawn the recommended agents in phases.

5. After all phases complete, update the Dev Tracker in Obsidian.
