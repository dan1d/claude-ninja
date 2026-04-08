# Dev Tracker

#paydaybooks #dev

Active tasks and next steps for PaydayBooks.

---

## In Progress

- [ ] Test full QBO OAuth flow end-to-end in ngrok environment
- [ ] Verify `AfterAuthenticateJob` provisions Company + Store correctly on fresh install

---

## Up Next

- [ ] Plan next feature — run `/plan <feature>` to get agent-routed execution plan
- [ ] Consider: QBO token re-auth flow (100-day refresh token expiry, no recovery path yet)
- [ ] Consider: Billing/subscription setup (ShopifyApp billing config commented out)
- [ ] Consider: Security audit before staging deploy

---

## Completed

- [x] Fix 406 errors on embedded app API calls (App Bridge v3 + AuthFetch context)
- [x] Provision Company + Store via `AfterAuthenticateJob` after Shopify OAuth
- [x] Fix QBO OAuth flow: AJAX + `window.top` pattern for iframe escape
- [x] Pass `company_id` via URL param to survive `SameSite=Lax` session loss
- [x] Redirect back to Shopify Admin after QBO OAuth callback
- [x] Add Redis db/1 isolation (avoid key collision with other services)
- [x] Add Intuit C2QB branded button (`ConnectToQuickBooksButton.jsx`)
- [x] Write README.md
- [x] RSpec: `AfterAuthenticateJob` — 15 examples, 0 failures
- [x] RSpec: `QboCallbacksController` — updated to test current behavior (19 examples)
- [x] RSpec: `QboConnectionsController` — JSON API + Shopify session stub (9 examples)
- [x] Jest: `ConnectToQuickBooksButton` — 17 examples, 0 failures, 100% line coverage
- [x] Jest: `AuthFetch` — 9 examples, 0 failures, 100% line + branch coverage
- [x] Set up Jest (jest-environment-jsdom, @testing-library/react, babel-jest)
- [x] RuboCop — 0 offenses across 151 files
- [x] Full RSpec suite — 570 examples, 0 failures, 100% line + branch coverage
- [x] Commit and push to main (00f5974)

---

## Known Issues / Watch

- QBO refresh tokens expire after **100 days** — no automated re-auth flow yet
- No billing/subscription configured yet (ShopifyApp billing config commented out)
- Sidekiq Web UI is accessible without auth in dev — do not expose in production

← Back to [[00 - Project Overview]]