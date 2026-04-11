# Known Issues

#meta #bugs

Priority: HIGH (blocks usage) · MEDIUM (important, not blocking) · LOW (nice to fix)

---

## MEDIUM — /plan command depends on everything-claude-code

`commands/plan.md` was originally taken from `github.com/affaan-m/everything-claude-code`. On a new machine install, the file is copied from this repo's `commands/` directory correctly — but the upstream source isn't documented or pinned. If plan.md diverges from its origin, we have no reference to diff against.

**Fix:** Add a comment header to `commands/plan.md` crediting the source, and document in CLAUDE.md.

## LOW — obsidian-task-gate fires in non-project directories

If a Claude session is open in a directory that has no vault configured but the hook is global, the gate silently passes (vault doesn't exist check). This is safe but could be confusing.

## LOW — memory-files.js hardcodes theownerstack + shopify-project paths

The two destination paths in `src/steps/memory-files.js` are specific to dan1d's machine layout. On a different user's machine these paths would be wrong. Fine for personal tooling, but worth noting.
