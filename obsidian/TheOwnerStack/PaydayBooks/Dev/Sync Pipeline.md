# Sync Pipeline

#paydaybooks #dev

## Flow

```
ScheduledSyncJob (cron: 0 */6 * * *)
  └─► Fetch payouts from Shopify API
  └─► Upsert ShopifyPayout records
  └─► Create SyncRecord (status: pending) per payout
  └─► Enqueue SyncPayoutJob per SyncRecord
        └─► start_decomposing!
        └─► DecomposePayoutService → Qbo::PayoutSummary
        └─► start_posting!
        └─► Qbo::PostPayoutService
            ├─► POST /salesreceipt   (PDB-{id})
            ├─► POST /refundreceipt  (PDB-R-{id}) — skipped if no refunds
            └─► POST /deposit        (PDB-D-{id})
        └─► complete!
```

## SyncRecord States (AASM)

`pending` → `decomposing` → `posting` → `synced`

Error paths: → `failed` → (retry) → `pending` again
Skipped: → `skipped` (already synced, no activity)

## Idempotency — 4 Layers

1. `SyncRecord.external_id` unique index — no duplicate records per payout
2. `find_or_build_sync_record` checks existing status before creating
3. `response_payload` stores partial progress after each QBO call — retries skip completed steps
4. QBO doc numbers (`PDB-{id}`) are QBO-side idempotency keys

## Retry & Exponential Backoff

`RetryFailedSyncsJob` runs hourly.

| Retries | Wait |
|---------|------|
| 0 | 5 min |
| 1 | 30 min |
| 2 | 2 hours |
| 3+ | Exhausted — email sent |

**Rate-limit (HTTP 429):** resets to `pending` via `update_column` (bypasses AASM), re-enqueues with 1-min wait. Retry budget NOT consumed.

## Key Files

- `app/jobs/sync_payout_job.rb`
- `app/jobs/scheduled_sync_job.rb`
- `app/jobs/retry_failed_syncs_job.rb`
- `app/services/decompose_payout_service.rb`
- `app/services/qbo/post_payout_service.rb`
- `app/models/sync_record.rb`
- `app/models/sync_event.rb`

← Back to [[00 - Project Overview]]