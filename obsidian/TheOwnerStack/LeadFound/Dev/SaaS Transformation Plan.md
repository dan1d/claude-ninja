---
status: in-progress
---
# SaaS Transformation Plan

Personal tool → multi-tenant SaaS. 8 phases, TDD throughout (100% SimpleCov, RuboCop 0 offenses after each phase).

---

## Phase 0 — VCR Cassettes
> Add `stripe ~> 13.0` + `vcr ~> 6.2` gems. Convert service specs from hand-crafted WebMock stubs to recorded cassettes.

- [x] Add gems to Gemfile + `bundle install`
- [x] Create `spec/support/vcr.rb` (cassette dir, hook into webmock, filter Serper key)
- [x] Convert `reddit_client_spec.rb` → VCR cassettes
- [x] Convert `x_client_spec.rb` → VCR cassettes
- [x] Record real cassettes; commit `spec/cassettes/`
- [x] ✅ `bundle exec rspec` — 0 failures, 100% coverage

## Phase 1 — Authentication (Rails 8.1 built-in)
> Email + password only (no Google). Split-screen auth layout.

- [x] `rails generate authentication`
- [x] Update generated migrations → UUID PKs, add `name` to users
- [x] Create `RegistrationsController` (signup)
- [x] Create `app/views/layouts/auth.html.erb` (hero left / form right)
- [x] Add `resource :registration` route
- [x] Add `sign_in(user)` to `spec/support/request_helpers.rb`
- [x] Update ALL request specs → `sign_in` + unauthenticated redirect test
- [x] Write specs: `users.rb` factory, `user_spec.rb`, `session_spec.rb`, `registrations_spec.rb`, `sessions_spec.rb`
- [x] ✅ Green

## Phase 2 — Projects → Campaigns + Multi-tenancy
> **Largest phase** — rename everything atomically. All data scoped to `current_user`.

- [ ] Migration: rename `projects` → `campaigns`, add `user_id`, `website_url`, `lead_type`, `last_scanned_at`, `scan_reddit`, `scan_x`
- [ ] Migration: `project_id` → `campaign_id` in keywords, add `negative` boolean
- [ ] Migration: add `match_strength`, `ai_reply_draft`, `reply_sent_at` to leads
- [ ] Migration: add `user_id` to `platform_credentials` (per-user uniqueness)
- [ ] `project.rb` → `campaign.rb` (new validations, `due_for_scan?`, `scan_interval_hours`)
- [ ] `keyword.rb` — `belongs_to :campaign`, `within_keyword_limit` validation
- [ ] `lead.rb` — add `match_strength` scopes, `for_campaign`, `delegate :campaign`
- [ ] `platform_credential.rb` — `belongs_to :user`, `.reddit_for(user)` / `.x_for(user)`
- [ ] `projects_controller.rb` → `campaigns_controller.rb` (add `sync_now` action)
- [ ] Update `keywords_controller`, `leads_controller`, `dashboard_controller`, `settings_controller`
- [ ] `lead_finder.rb` — add `score_match` (strong if phrase in title, partial if body)
- [ ] Create `scan_campaign_job.rb` (checks `due_for_scan?`)
- [ ] Update `scan_all_keywords_job.rb` → iterate campaigns
- [ ] Update routes + factories + spec filenames
- [ ] Add cross-user isolation test to each request spec
- [ ] ✅ Green

## Phase 3 — Stripe Billing + Subscription
> 7-day trial → plan selection → Stripe Checkout.

- [ ] Migration: `create_subscriptions` (plan, status, trial_ends_at, stripe IDs)
- [ ] Create `subscription.rb` with `PLAN_LIMITS` constant
- [ ] `user.rb` — `has_one :subscription`, `after_create :create_trial_subscription`
- [ ] `campaign.rb` — `within_campaign_limit` validation on create
- [ ] `keyword.rb` — `within_keyword_limit` validation on create
- [ ] Create `BillingController` (index/checkout/portal)
- [ ] Create `StripeWebhooksController` (3 events + error handling)
- [ ] Add Stripe credentials via `rails credentials:edit`
- [ ] Dashboard trial banner (days countdown + CTA)
- [ ] Write: `subscriptions.rb` factory, `subscription_spec.rb`, `billing_spec.rb`, `stripe_webhooks_spec.rb`
- [ ] ✅ Green

## Phase 4 — Onboarding Wizard (4 steps)
> After Stripe success → wizard → first campaign → ScanCampaignJob triggered.

- [ ] Migration: `create_voice_samples`
- [ ] Create `voice_sample.rb`
- [ ] Create `OnboardingController` (session-based step tracking)
- [ ] Route: `resource :onboarding`
- [ ] Step 1 partial: basics (name, URL, description 0/300, Product/Service selector)
- [ ] Step 2 partial: keywords (dynamic inputs via Stimulus, negative keywords)
- [ ] Step 3 partial: targeting (platform checkboxes, range sliders, explicit filters)
- [ ] Step 4 partial: voice (sample post cards, reply textarea, "Find My Leads")
- [ ] Stimulus: `keyword_inputs_controller.js`, `char_counter_controller.js`, `range_slider_controller.js`
- [ ] Write: `voice_sample_spec.rb`, `onboarding_spec.rb` (all 4 steps)
- [ ] ✅ Green

## Phase 5 — Campaign Detail Page + Navigation
- [ ] Rewrite sidebar layout → CONFIGURE / ENGAGE / RESEARCH sections
- [ ] Add plan badge + usage meters to sidebar bottom
- [ ] `campaigns/show.html.erb` — stats bar (Strong/Partial matches, Last/Next sync) + Flowbite tabs
- [ ] ✅ Green

## Phase 6 — Conversations + Research Stubs
- [ ] `ConversationsController` (index + update — leads with `ai_reply_draft`)
- [ ] `CompetitorsController` (index — empty state UI)
- [ ] `InsightsController` (index — live queries: leads/day, top subreddits, top keywords)
- [ ] Add routes + request specs
- [ ] ✅ Green

## Phase 7 — Settings Refactor (3 tabs)
- [ ] Migration: add `preferences jsonb` to users
- [ ] `SettingsController` — dispatch by `@tab` (profile/subscription/team)
- [ ] Rewrite `settings/show.html.erb` — Flowbite 3-tab layout
- [ ] ✅ Green

## Phase 8 — Final Coverage Sweep
- [ ] 100% line + branch — `require_authentication` both paths
- [ ] `Campaign#due_for_scan?` — nil vs. recent
- [ ] `LeadFinder#score_match` — strong vs. partial
- [ ] `Subscription#trial_expired?` — `travel_to` past + future
- [ ] `StripeWebhooksController` — all events + signature error
- [ ] `within_campaign_limit` / `within_keyword_limit` — at limit + under
- [ ] ✅ `bundle exec rspec && bundle exec rubocop app/ spec/` — all green

---

## Progress Log

| Date       | Phase   | Status   | Notes |
|------------|---------|----------|-------|
| 2026-04-07 | Phases 0–8 | Planned | Ready to implement |
