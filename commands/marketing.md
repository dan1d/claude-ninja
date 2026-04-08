# /marketing — Marketing Agent Dispatcher

Read the current Obsidian task context and route to the appropriate marketing agent.

## Instructions

1. Detect the current project's Obsidian folder:
   - Run: `cat .claude/obsidian-project`
   - Store the result as PROJECT_NAME (e.g. "LeadFound")
   - If the file doesn't exist, ask the user: "What's the Obsidian project folder name for this repo?"
   - Use PROJECT_NAME to load context: product name, target audience, and current Dev Tracker state

2. Identify the marketing task type from $ARGUMENTS or current Obsidian Dev Tracker
3. Route to the correct agent using this table:

| Task | Agent |
|------|-------|
| Lead generation, TOFU, landing pages | `attraction-specialist` |
| Lead scoring, segmentation | `lead-qualifier` |
| Email campaigns, sequences | `email-wizard` |
| Sales collateral | `sales-enabler` |
| Retention, customer success | `continuity-specialist` |
| Upsell/cross-sell copy | `upsell-maximizer` |
| Market research | `researcher` |
| Brainstorming | `brainstormer` |
| Campaign planning | `planner` |
| Content creation | `copywriter` |
| SEO | `seo-specialist` |
| Brand review | `brand-voice-guardian` |
| CRO | `conversion-optimizer` |

4. Spawn the agent with full context: project name, target audience, current task description
5. After completion, update Obsidian Dev Tracker
