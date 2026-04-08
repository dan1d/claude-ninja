# Memory Index

## New Project Intent — Auto-trigger

When Daniel expresses intent to create a new project — any phrasing like "I want to build X", "new project for Y", "start a clone of Z", "set up a new app", "create a new repo" — do this automatically without being asked:

1. Read the project guidelines: `obsidian vault="TheOwnerStack" read path="Project Guidelines.md"`
2. If project name/stack/description not clear from context, ask for the 3 inputs (name, stack, one-line description)
3. Generate the complete project scaffold per the guidelines: Obsidian notes, CLAUDE.md, .claude/ directory, agents, commands, settings.local.json, MEMORY.md entry
4. Do NOT wait for a /new-project command — infer the intent and act.

## Project
- [Landing page pivot](project_landing_page_pivot.md) — Pivoting from AutoBooks to ChowNow-style restaurant financial platform
- [UX Redesign](project_ux_redesign.md) — Connections Hub architecture: 13-item sidebar → 5-item nav with visual POS→Accounting pipelines
- [UX Redesign Implementation](project_ux_redesign_implementation.md) — Full 9-step implementation plan with codebase map, file paths, TDD approach, and progress tracking

- [Gusto integration](project_gusto_integration.md) — Setting up Gusto developer account for payroll; OAuth gem in progress

- [Rebrand to SalesToBooks](project_rebrand_salestobooks.md) — Product rebrand from TheOwnerStack to SalesToBooks (salestobooks.com purchased 2026-03-13)
- [6-month execution plan](project_6month_plan.md) — Launch strategy, pricing, competitive analysis, revenue targets ($200→$1K→$5K MRR)

- [Admin panel and blog system](project_admin_blog.md) — Admin panel, blog, DB-driven integrations/FAQs, search autocomplete (plan in docs/ADMIN_BLOG_PLAN.md)

- [Neon PostgreSQL](project_neon_db.md) — Production DB on Neon us-west-2, PG 17, pooler endpoint
- [Lightspeed integration](project_lightspeed_integration.md) — Lightspeed Retail K-Series: OAuth app, OmniAuth gem, simulator gem, sandbox hub
- [Play 2 & Play 3](project_play2_play3.md) — Delivery Profit Tracker landing page + Sales Tax Automation (US + Canada)
- [Gusto production approval](project_gusto_production_approval.md) — Pre-Approval form submitted 2026-03-20; awaiting Gusto response
- [Uber Eats production access](project_uber_eats_production.md) — Scope request submitted, being verified as of 2026-03-20
- [POS marketplace approvals](project_pos_marketplace_approvals.md) — Approval status for Clover, Square, Toast, Lightspeed; each has OmniAuth gem + API lib + open-source simulator
- [LeadFound app](project_lead_found.md) — Rails 8.1 lead gen dashboard at lead_found/ (Ruby 4.0.2, SolidQueue, Reddit + X scanning, leadfound.com)

## LeadFound Session Start (run at the start of every LeadFound session)

```bash
obsidian vault="TheOwnerStack" read path="LeadFound/Meta/User Profile.md"
obsidian vault="TheOwnerStack" read path="LeadFound/Meta/Preferences & Feedback.md"
obsidian vault="TheOwnerStack" read path="LeadFound/Meta/Known Issues.md"
obsidian vault="TheOwnerStack" read path="LeadFound/Dev/Dev Tracker.md"
```

## Reference
- [Square App](reference_square_app.md) — Square App ID and marketplace application status (submitted 2026-03-21)

## User
- [Email](user_email.md) — daniel@theownerstack.com, same across all environments

## Feedback
- [No fake social proof](feedback_no_fake_social_proof.md) — Never add testimonials/stats we don't have; demonstrate potential honestly
- [No invalid Tailwind classes](feedback_no_invalid_tailwind_classes.md) — Never use text-success/text-warning/text-error; use real Tailwind classes (text-green-600, text-amber-500, text-red-600)
- [TDD is mandatory](feedback_tdd_always.md) — Always write failing specs BEFORE implementation, even for view/component changes. A broken route helper caused a 500 because no spec was written.
- [ERB raw output in script tags](feedback_erb_script_escaping.md) — Never use `<%= .to_json %>` inside `<script>` tags; use `<%== %>` (raw) to avoid HTML entity escaping
- [Importmap transitive dependencies](feedback_importmap_transitive_deps.md) — Always pin transitive deps when adding CDN bundles to importmap.rb
