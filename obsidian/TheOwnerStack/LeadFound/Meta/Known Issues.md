# Known Issues

#meta #memory

Things to tackle — in priority order.

## 1. Phase 2 not started — Projects → Campaigns rename (HIGH)
Largest phase. Rename `projects` → `campaigns`, add `user_id` for multi-tenancy,
add `match_strength` scoring, per-user platform credentials.
All 8 sub-steps still TODO. Must complete before Phase 3 (billing) can start.

## 2. No Stripe billing yet (HIGH)
Phase 3 — subscription model, trial enforcement, Checkout Sessions, webhooks.
Users currently have no plan limits enforced.

## 3. No onboarding wizard (HIGH)
Phase 4 — 4-step wizard (Basics → Keywords → Targeting → Voice).
Currently users go straight to dashboard with no guided setup.

## 4. No campaign detail page (MEDIUM)
Phase 5 — campaign show with tabs (Leads, Keywords, Filters, AI Reply, Sync History).

## 5. Rate-limit lambdas untestable with null_store (LOW)
`SessionsController` and `PasswordsController` rate-limit lambdas use `# :nocov:`
because test env uses `:null_store` (cache never accumulates).
Accepted — framework boilerplate.

## 6. Platform credentials not per-user yet (HIGH → fixed in Phase 2)
Currently `PlatformCredential` has no `user_id`. Fix in Phase 2 migration.

## 7. ScanAllKeywordsJob not yet campaign-aware (MEDIUM → fixed in Phase 2)
Currently iterates all keywords globally. Phase 2 adds `ScanCampaignJob` with `due_for_scan?` dedup.