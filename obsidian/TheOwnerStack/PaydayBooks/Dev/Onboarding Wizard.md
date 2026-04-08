# Onboarding Wizard

#paydaybooks #dev

Tracked in `Store#onboarding_step` integer enum. Advance logic: `OnboardingStepsController` + `Onboarding::AdvanceStepService`.

| Step | Enum key | What happens |
|------|----------|--------------|
| 0 | `welcome` | Intro screen, no data written |
| 1 | `connect_qbo` | OmniAuth → `/auth/quickbooks_oauth2`, saves `QboConnection` |
| 2 | `account_mapping` | Fetches chart of accounts via `Qbo::AccountListService`, saves `AccountMapping` |
| 3 | `select_bank` | Merchant picks QBO bank/clearing account |
| 4 | `dry_run_preview` | Calls `PreviewSyncService`, shows what will be posted |
| 5 | `confirm_sync` | Merchant approves, `SyncPayoutJob`s enqueued |
| 6 | `onboarding_complete` | Wizard done, dashboard unlocked |

## Key Files

- `app/controllers/onboarding/steps_controller.rb`
- `app/services/onboarding/advance_step_service.rb`
- `app/javascript/pages/Onboarding.jsx`
- `app/javascript/pages/onboarding/StepConnectQbo.jsx`
- `app/javascript/pages/onboarding/StepAccountMapping.jsx`
- `app/javascript/pages/onboarding/StepSelectBank.jsx`
- `app/javascript/pages/onboarding/StepDryRunPreview.jsx`

## QBO OAuth Flow (Step 1)

Because the app runs inside a Shopify Admin iframe, OAuth can't happen in the iframe.

1. React calls `authenticatedFetch("/qbo_connections/new")` (JSON, with Bearer token)
2. Rails returns `{ redirect_url: "/auth/quickbooks_oauth2?company_id=1" }`
3. React does `window.top.location.href = data.redirect_url` — breaks out of iframe
4. OmniAuth handles OAuth, forwards `company_id` via `omniauth.params`
5. Callback saves `QboConnection`, redirects back to Shopify Admin embedded URL

← Back to [[00 - Project Overview]]