# claude-ninja

Node.js CLI that installs and maintains Daniel's personal Claude Code configuration on any machine. Runs via `npx github:dan1d/claude-ninja`.

**Stack:** Node.js · CommonJS · npx · GitHub
**Repo:** `~/dan1d/claude-ninja` → `github.com/dan1d/claude-ninja`
**Install:** `npx github:dan1d/claude-ninja`

---

## What It Installs

| Step | What | Where |
|------|------|-------|
| agents | 41 dev + 20 marketing `.md` files | `~/.claude/agents/` |
| commands | next, test, lint, plan, marketing | `~/.claude/commands/` |
| obsidian-skill | CLI plugin | `~/.claude/plugins/cache/` |
| obsidian-notes | vault scaffolds for all projects | `~/Documents/obsidian/TheOwnerStack/` |
| memory-mcp | AgentKits Memory MCP server | `~/.claude/settings.json` |
| memory-files | workspace memory | `~/.claude/projects/.../memory/` |
| hooks | 4 hooks: gate, route, review, plan-reminder | `~/.claude/settings.json` |
| env-var | OBSIDIAN_VAULT → ~/.zshrc | shell profile |
| obsidian-app | launch Obsidian if not running | interactive |
| github-auth | check gh auth | interactive |

## Hook System

| Hook | Event | Purpose |
|------|-------|---------|
| `obsidian-task-gate.js` | PreToolUse (Edit/Write) | Block code edits until vault plan written |
| `auto-route.js` | PostToolUse (Edit/Write) | Mark plan ready + review pending |
| `prompt-route.js` | UserPromptSubmit | Keyword score → specialist agent dispatch |
| `post-task-review.js` | Stop | Trigger code-reviewer-pro + Obsidian update |

## Sentinel Lifecycle

```
vault .md write (PostToolUse)
  → plan sentinel created  → code edits unblocked (PreToolUse)
    → source edit (PostToolUse) → review sentinel populated
      → Claude stops (Stop) → review triggered → review sentinel cleared
        → plan sentinel persists (4hr TTL)
```

---

## Navigation

- [[Dev Tracker]]
- [[Key Decisions]]
- [[Known Issues]]
