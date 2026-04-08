# LeadFound

Multi-tenant lead generation SaaS at leadfound.com. Monitors Reddit and X for keyword matches and surfaces relevant posts/comments as actionable leads — similar to Leadverse.ai.

**Stack:** Rails 8.1.3 · Ruby 4.0.2 · PostgreSQL · Tailwind + Flowbite 3.1 · SolidQueue · Faraday
**Repo:** `~/claude-projects/theownerstack/lead_found`
**Dev URL:** http://localhost:5000

---

## Architecture

```
User (tenant)
  ├── has_one  :subscription       → plan limits, trial
  ├── has_many :campaigns          → renamed from "Projects"
  │     ├── has_many :keywords     → positive + negative
  │     │     └── has_many :leads  → match_strength, ai_reply_draft
  │     └── has_many :voice_samples → onboarding training
  ├── has_many :platform_credentials → serper_api_key, per-user
  └── has_many :sessions           → Rails 8.1 auth
```

## Scanning

- **Reddit**: public JSON API (no auth) — `reddit.com/search.json`
- **X**: Serper API — Google Search wrapper for `site:x.com phrase`
- **Dedup**: `last_scanned_at` on campaigns (Option A) — skip if scanned within `scan_interval_hours`
- **Jobs**: SolidQueue · `ScanAllKeywordsJob` → `ScanCampaignJob` → `ScanKeywordJob` (leaf)
- **Schedule**: hourly via `config/recurring.yml`

## Plan Tiers

| Plan     | Price   | Campaigns | Keywords | Platforms   | Sync |
|----------|---------|-----------|----------|-------------|------|
| trial    | free 7d | 1         | 5        | reddit      | 12h  |
| explorer | $19/mo  | 1         | 5        | reddit      | 12h  |
| founder  | $29/mo  | 2         | 10       | reddit + x  | 1h   |
| business | $39/mo  | 3         | 30       | reddit + x  | 1h   |

## Quality Gates

```bash
bundle exec rspec                 # 126 examples, 0 failures, 100% line + branch
bundle exec rubocop app/ spec/    # 0 offenses
```

---

## Navigation

- [[SaaS Transformation Plan]]
- [[Auth Flow]]
- [[Stripe Billing]]
- [[Onboarding Wizard]]
- [[Campaign Scanning]]
