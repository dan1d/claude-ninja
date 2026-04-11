# Preferences & Feedback

#meta #memory

## Obsidian is the source of truth
Always read `claude-ninja/Dev/Dev Tracker.md` before starting work. Update it when done.

## Agent routing
CLAUDE.md has the hook system for routing. For multi-domain tasks use `/plan <task>` to fire `agent-organizer`.
Primary agent for this stack: general-purpose (Node.js CLI, no framework specialist needed).

## No Co-Authored-By lines in commits
Keep commit history clean — never add `Co-Authored-By: Claude...`

## Short messages = just do it
"next", "continue", "go" — act immediately. No confirmation needed for planned work.

## No trailing summaries
One short sentence after completing a task. Daniel reads the diff and the tracker.

## Cross-platform always
Every path, command, and shell assumption must work on both macOS and Linux.
Use `os.homedir()` not `~`. Use `path.join()` not string concatenation. Branch on `process.platform`.

## Hooks write to stderr for blocking
PreToolUse hooks that block (exit 2) must write the reason to `process.stderr`, not stdout.
Claude Code reads stderr on exit 2; stdout is silently discarded.

## Sentinel namespacing
All temp sentinels must be scoped: `{name}-{projHash}-{sessionId}` to avoid collision across parallel Claude sessions.
