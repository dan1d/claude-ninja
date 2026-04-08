---
name: TDD is mandatory for all code changes
description: Always write failing specs BEFORE writing implementation code — no exceptions, even for "simple" view changes
type: feedback
---

Always follow TDD (Red → Green → Refactor) for every code change. This includes view changes, route helpers, component updates — not just services and models.

**Why:** A clickable report row was shipped with a wrong route helper (`company_daily_sales_report_path` instead of `company_location_daily_sales_report_path`) causing a 500 error on production dashboard. A simple component spec would have caught this immediately.

**How to apply:** Before writing any implementation code:
1. Write a failing spec that exercises the new behavior
2. Run the spec to confirm it fails (Red)
3. Write the minimum code to make it pass (Green)
4. Refactor if needed
5. Run `bundle exec rubocop` and `bundle exec brakeman --no-pager -q` before committing
