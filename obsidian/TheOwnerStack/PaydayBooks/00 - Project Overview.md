# PaydayBooks

Embedded Shopify app that syncs Shopify Payments payouts to QuickBooks Online.

**Stack:** Rails 8.1 · Ruby 3.4 · React 19 + Polaris · PostgreSQL 16 · Sidekiq · Redis
**Repo:** `~/claude-projects/theownerstack/shopify-project`
**Dev URL:** https://paydaybooks.ngrok.app

---

## The Three-Entry Accounting Pattern

Every Shopify payout decomposes into exactly three QBO entries:

1. **SalesReceipt** (`PDB-{payout_id}`) — gross sales → Clearing Account
2. **RefundReceipt** (`PDB-R-{payout_id}`) — refunds ← Clearing Account (skipped if no refunds)
3. **Deposit** (`PDB-D-{payout_id}`) — net amount → Bank Account

---

## Multi-Tenant Architecture

```
Company ──< Store (Shopify domain)
  └──< QboConnection (one QBO company per owner)
        └──< SyncRecord (AASM state machine per payout)
              └──< SyncEvent (audit log)
```

---

## Navigation

- [[Onboarding Wizard]]
- [[Sync Pipeline]]
- [[QBO OAuth Flow]]
- [[Background Jobs]]
- [[Debugging Guide]]
- [[Content Plan]]