Load Obsidian context, show what's next, and start working.

## Instructions

1. Detect the current project's Obsidian folder:
   - Run: `cat .claude/obsidian-project`
   - Store the result as PROJECT_NAME (e.g. "LeadFound")
   - If the file doesn't exist, ask the user: "What's the Obsidian project folder name for this repo?"

2. Run the session start checklist — in order, no skipping:
```bash
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Meta/User Profile.md"
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Meta/Preferences & Feedback.md"
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Meta/Known Issues.md"
obsidian vault="TheOwnerStack" read path="<PROJECT_NAME>/Dev/Dev Tracker.md"
```
   (Replace <PROJECT_NAME> with the actual value read from step 1)

3. From the Dev Tracker, identify:
   - What is **In Progress** → continue that
   - If nothing in progress → take the first item from **Up Next**

4. Show the user a short list (≤5 bullets) of what you're about to do — agent to use, files to touch, tests to write first.

5. Route to the correct agent per CLAUDE.md's routing table and start immediately.

6. When done: tick the item in the Dev Tracker and move it to Completed.
