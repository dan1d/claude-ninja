# Known Issues

#meta #memory

Things to tackle — in priority order.

## 1. QBO refresh token expiry (HIGH)
Refresh tokens expire after 100 days. No re-auth flow exists. Merchant hits silent 401 with no recovery path.
Must fix before production.

## 2. Billing / subscription (MEDIUM)
ShopifyApp billing config is commented out in `config/initializers/shopify_app.rb`.
Required before charging merchants.

## 3. Sidekiq Web UI unprotected (MEDIUM)
Accessible without auth at `/sidekiq` in dev. Must add auth middleware before staging/production.

## 4. Jest branch coverage gap (LOW)
`ConnectToQuickBooksButton.jsx` line 45 — `if (!isDisabled)` false branch unreachable via React+jsdom (React suppresses onMouseEnter on disabled form elements). Documented, accepted.