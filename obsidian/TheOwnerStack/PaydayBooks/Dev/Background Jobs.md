# Background Jobs

#paydaybooks #dev

## Cron Schedule (sidekiq-cron)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `QboTokenRefreshJob` | `*/30 * * * *` | Refresh QBO tokens expiring within 15 min |
| `ScheduledSyncJob` | `0 */6 * * *` | Fetch new payouts + enqueue SyncPayoutJobs |
| `RetryFailedSyncsJob` | `0 * * * *` | Retry eligible failures + notify exhausted |

## Queue Config

| Queue | Concurrency |
|-------|-------------|
| critical | 3 |
| default | 2 |
| sync | 2 |
| low | 1 |

**Sidekiq Web UI** (dev): http://localhost:3000/sidekiq

## QBO Token Lifecycle

- Access token: **1 hour** TTL
- Refresh token: **100 days** TTL
- `QboTokenRefreshJob` proactively refreshes tokens expiring within 15 min
- If refresh token expires: merchant must reconnect QBO via OAuth (step 1 of onboarding)

← Back to [[00 - Project Overview]]