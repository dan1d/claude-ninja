# Key Decisions

#meta #memory

Architectural decisions and why.

---

## 2026-04-07 — Rails 8.1 native auth over Devise
**Decision:** Use `rails generate authentication` (has_secure_password + Sessions model).
**Why:** Full control over every auth line; no Devise DSL debt; custom 4-step onboarding + Stripe trial doesn't integrate cleanly with Devise's :confirmable/:lockable. Saves a dependency.
**Impact:** RegistrationsController, SessionsController, PasswordsController — all custom and fully tested.

## 2026-04-07 — Scan deduplication via last_scanned_at (Option A)
**Decision:** Dedup at campaign level using `last_scanned_at` timestamp, not at keyword level.
**Why:** One timestamp per campaign is simpler than per-keyword tracking. `Campaign#due_for_scan?` checks nil OR older than `scan_interval_hours.hours.ago`.
**Impact:** ScanCampaignJob sets `last_scanned_at` after dispatching keyword jobs. `ScanAllKeywordsJob` iterates campaigns, not keywords directly.

## 2026-04-07 — VCR hybrid pattern for service specs
**Decision:** VCR cassettes for realistic HTTP shape; WebMock stubs for parsing edge cases.
**Why:** VCR gives realistic request/response structure for the happy path; WebMock lets us test nil links, bad dates, twitter.com normalization without cassette overhead.
**Impact:** `x_client_spec.rb` has two describe groups — VCR group and edge cases group.

## 2026-04-07 — UUID PKs on all tables
**Decision:** All models use `id: :uuid` primary keys.
**Why:** Distributed-safe, no sequential ID guessing, consistent with the broader TheOwnerStack codebase direction.
**Impact:** All migrations use `create_table :things, id: :uuid` and `t.references :user, type: :uuid`.

## 2026-04-07 — SolidQueue over Sidekiq
**Decision:** SolidQueue for background jobs (no Redis dependency).
**Why:** Rails 8.1 default, simpler ops, no Redis to manage for this scale.
**Impact:** `bin/jobs` to start worker; cron via `config/recurring.yml`; no Sidekiq Web UI.