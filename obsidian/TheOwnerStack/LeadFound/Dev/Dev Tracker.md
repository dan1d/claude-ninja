# Dev Tracker

#leadfound #dev

Active tasks and next steps for LeadFound SaaS transformation.

---

## In Progress

- [ ] Phase 2: Projects → Campaigns + Multi-tenancy (see [[SaaS Transformation Plan]])
  - [ ] Migration: rename `projects` → `campaigns`, add `user_id`, `website_url`, `lead_type`, `last_scanned_at`, `scan_reddit`, `scan_x`
  - [ ] Migration: `project_id` → `campaign_id` in keywords, add `negative` boolean
  - [ ] Migration: add `match_strength`, `ai_reply_draft`, `reply_sent_at` to leads
  - [ ] Migration: add `user_id` to `platform_credentials` (per-user uniqueness)
  - [ ] `project.rb` → `campaign.rb` (validations, `due_for_scan?`, `scan_interval_hours`)
  - [ ] Update controllers, jobs, services, routes, factories, specs
  - [ ] Cross-user isolation test in every request spec
  - [ ] ✅ Green (0 failures, 100% coverage, 0 rubocop offenses)

---

## Up Next

- [ ] Phase 3: Stripe Billing + Subscription
- [ ] Phase 4: Onboarding Wizard (4 steps)
- [ ] Phase 5: Campaign Detail Page + Navigation
- [ ] Phase 6: Conversations + Research Stubs
- [ ] Phase 7: Settings Refactor (3 tabs)
- [ ] Phase 8: Coverage Sweep + launch prep

---

## Completed

- [x] Phase 0: VCR Cassettes — stripe + vcr gems, cassettes for reddit/serper service specs
- [x] Phase 1: Authentication — Rails 8.1 native auth, RegistrationsController, auth layout, sign_in helper, all request specs updated with auth + unauthenticated redirect tests
- [x] Fix 99.64% → 100% line + branch coverage (x_client.rb ArgumentError + nil URL branches)
- [x] Convert service specs to VCR hybrid (cassettes for realistic HTTP, WebMock for edge cases)
- [x] RuboCop: 0 offenses across 55 files
- [x] Full RSpec suite: 153 examples, 0 failures, 100% line + branch coverage

---

## Known Issues / Watch

- Rate-limit lambdas use `# :nocov:` — null_store in test env means rate limits can't accumulate
- Platform credentials not per-user yet (fixed in Phase 2)
- No plan limit enforcement yet (fixed in Phase 3)

← Back to [[00 - Project Overview]]