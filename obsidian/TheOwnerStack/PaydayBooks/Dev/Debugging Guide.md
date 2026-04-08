# Debugging Guide

#paydaybooks #dev

## QBO 401 After Inactivity

Access tokens last **1 hour**. Refresh tokens last **100 days**.

```ruby
QboConnection.first.token_expired?     # check
QboConnection.first.refresh_tokens!   # force refresh
```

If refresh also 401s → refresh token expired → merchant must reconnect QBO.

## Sync Stuck in `decomposing` or `posting`

Job crashed between AASM transitions. Records stay in intermediate states permanently.

```ruby
record = SyncRecord.find(ID)
record.fail_sync! if record.may_fail_sync?
# Then either wait for RetryFailedSyncsJob, or manually:
record.retry_sync!
SyncPayoutJob.perform_later(record.id)
```

## Partial Sync in `response_payload`

If sync failed after SalesReceipt but before Deposit:

```ruby
SyncRecord.find(ID).response_payload
# => { "sales_receipt_id" => 123, "deposit_id" => nil }
# On retry: SalesReceipt step is skipped (idempotency)
```

## Stale Shop Records (DecryptionError)

Happens when `LOCKBOX_MASTER_KEY` changes. Existing rows can't be decrypted.

```ruby
Shop.delete_all  # then re-authenticate via Shopify
```

## `company_id IS NULL` in QBO Callback

Cause: `SameSite=Lax` blocks cookies on cross-site iframe AJAX — session set during `/qbo_connections/new` is lost.

Fix already in place: `company_id` is passed as URL query param to `/auth/quickbooks_oauth2?company_id=1`. OmniAuth forwards it via `request.env["omniauth.params"]`.

If you see this again: ensure `QboConnectionsController#new` is called via `authenticatedFetch` (Bearer token), not direct navigation.

## Missing AccountMapping

`PreviewSyncService#mappings_complete?` requires `sales` and `clearing` types.
If absent → preview returns empty. Onboarding step 2 must complete successfully.

## Shopify OAuth Redirect Mismatch

`SHOPIFY_APP_URL` must exactly match the "App URL" in Partners Dashboard — including `https://`, no trailing slash.

← Back to [[00 - Project Overview]]