---
name: Lightspeed Retail integration
description: Lightspeed Retail K-Series POS integration — OAuth app, simulator gem, sandbox hub
type: project
---

Lightspeed Retail (K-Series) added as 4th POS provider.

- **Developer Portal**: developers.retail.lightspeed.app
- **Demo merchant**: developerdemowt2yi1.retail.lightspeed.app
- **OAuth App Name**: SalesToBooks.dev
- **Redirect URL**: https://salestobooks.ngrok.dev/auth/lightspeed/callback
- **Auth endpoints (demo)**: auth.lsk-demo.app/realms/k-series/protocol/openid-connect/
- **Auth endpoints (prod)**: auth.lsk-prod.app/realms/k-series/protocol/openid-connect/
- **API base (trial)**: https://api.trial.lsk.lightspeed.app
- **API uses**: REST, Bearer token auth, OAuth2 Authorization Code Grant
- **Key API groups**: Items, Financial, FinancialV2, Order and Pay, Rich Item, Tax Breakdown, Staff

**Why:** Expanding POS coverage for SalesToBooks — Lightspeed is a major restaurant/retail POS alongside Clover, Square, and Epos Now.

**How to apply:** Follow same gem pattern as omniauth-wave-oauth2/omniauth-gusto-oauth2 for OmniAuth strategy, and clover/square simulator gem pattern for sandbox simulator.
