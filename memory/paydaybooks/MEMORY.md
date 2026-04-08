# Memory

## New Project Intent — Auto-trigger

If the user expresses intent to start a new project (any phrasing: "new project", "I want to build", "start a clone of", "set up a new app") — automatically:
1. Read `TheOwnerStack/Project Guidelines.md` from Obsidian: `obsidian vault="TheOwnerStack" read path="Project Guidelines.md"`
2. Ask for project name, stack, and one-line description if not provided
3. Generate the full scaffold (Obsidian notes, CLAUDE.md, .claude/ dir, agents) from those 3 inputs

This project uses **Obsidian** as its memory store. All persistent context lives in the vault.

**Vault:** TheOwnerStack  
**Session start — read these in order:**

```bash
obsidian vault="TheOwnerStack" read path="PaydayBooks/Meta/User Profile.md"
obsidian vault="TheOwnerStack" read path="PaydayBooks/Meta/Preferences & Feedback.md"
obsidian vault="TheOwnerStack" read path="PaydayBooks/Meta/Known Issues.md"
obsidian vault="TheOwnerStack" read path="PaydayBooks/Dev/Dev Tracker.md"
```
