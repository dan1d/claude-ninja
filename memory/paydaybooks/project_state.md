---
name: Project State — PaydayBooks
description: Current status, key architectural decisions made, known issues to tackle
type: project
---

## Current state (as of 2026-04-07)

Clean, fully tested, committed and pushed to `main` (00f5974).
- 570 RSpec examples, 0 failures, 100% line + branch coverage
- 26 Jest examples, 0 failures, 100% line coverage
- 0 RuboCop offenses
- All core OAuth flows working (Shopify + QBO)

## Key architectural decisions made

**Redis db/1** — Use db/1 (not db/0) to avoid key collisions with other services on the same Redis instance.
**Why:** Daniel runs multiple projects on the same Redis.

**QBO OAuth: AJAX + window.top pattern** — `QboConnectionsController#new` returns JSON with `redirect_url`. React calls it via `authenticatedFetch`, then does `window.top.location.href = data.redirect_url` to break out of the Shopify Admin iframe.
**Why:** Shopify embedded apps run in an iframe. Full-page nav from inside the iframe causes MissingJwtTokenError. SameSite=Lax blocks session cookies on cross-site AJAX.

**company_id via URL param** — Passed as `/auth/quickbooks_oauth2?company_id=1`, forwarded by OmniAuth to `request.env["omniauth.params"]` in callback.
**Why:** Rails session is unreliable across cross-site iframe fetches (SameSite=Lax). Session set during AJAX is lost by the time the OAuth callback fires.

**AfterAuthenticateJob as string** — `config.after_authenticate_job = { job: "AfterAuthenticateJob", inline: false }` — string form, not constant.
**Why:** Initializer runs before eager loading; constant reference causes NameError at boot.

## Known issues / next candidates

1. **QBO refresh token expiry (100 days)** — no re-auth flow when refresh token expires. Merchant hits silent 401 with no recovery. High priority before production.
2. **No billing setup** — ShopifyApp billing config commented out. Required before charging merchants.
3. **Sidekiq Web UI unprotected** — accessible without auth in dev. Must add auth before staging/production expose.

## Infrastructure

- **Dev:** ngrok at `paydaybooks.ngrok.app`, Rails on port 3000, Docker (PostgreSQL + Redis db/1)
- **Repo:** `github.com/dan1d/paydaybooks`, branch `main`
- **Obsidian vault:** `TheOwnerStack` at `~/Documents/obsidian/TheOwnerStack/`, project folder `PaydayBooks/`
