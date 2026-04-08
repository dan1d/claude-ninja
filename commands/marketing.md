# /marketing — Marketing Agent Dispatcher

Read the current Obsidian task context and route to the appropriate marketing agent.

## Instructions

1. Identify the marketing task type from $ARGUMENTS or current Obsidian Dev Tracker
2. Route to the correct agent using this table:

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

3. Spawn the agent with full context: project name, target audience, current task description
4. After completion, update Obsidian Dev Tracker
