---
name: LeadFound app
description: Rails 8.1.3 multi-tenant lead gen SaaS at lead_found/. Obsidian vault TheOwnerStack/LeadFound/ is the source of truth — read 4 notes at session start per MEMORY.md checklist.
type: project
---

Obsidian vault **TheOwnerStack** → folder **LeadFound/** is the source of truth for this project.

**Why:** Matches the PaydayBooks pattern — all task state, preferences, known issues, and architectural decisions live in Obsidian. These memory files are pointers, not content.

**How to apply:** At the start of every LeadFound session, run the 4 Obsidian reads in MEMORY.md under "LeadFound Session Start". The CLAUDE.md at `lead_found/CLAUDE.md` has full domain context, agent routing, and technical reference.

## Quick Reference

- **Repo:** `~/claude-projects/theownerstack/lead_found`
- **Stack:** Rails 8.1.3 · Ruby 4.0.2 · PostgreSQL · SolidQueue · Flowbite 3.1 light · Stripe 13
- **Auth:** Rails 8.1 native (no Devise) — `rails generate authentication`
- **Strong params:** `params.expect()` not `params.require().permit()`
- **Current phase:** Phase 2 (Projects → Campaigns + multi-tenancy) — next up
- **Phases done:** Phase 0 (VCR cassettes) ✅ · Phase 1 (auth) ✅
- **Test suite:** 153 examples · 0 failures · 100% line + branch coverage
- **Agents:** `.claude/agents/` — ruby-on-rails-pro, hotwire-pro, flowbite-ui-pro, tdd-rspec-pro, stripe-billing-pro, migration-pro
