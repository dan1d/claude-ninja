---
name: FreshBooks tender mapping 409 bug
description: FreshBooks tender accounts return 409 (already exists) during onboarding — accounts exist but aren't linked locally
type: project
---

FreshBooks tender mapping fails with 409 "The fields name, sub_type must make a unique set" on all tender clearing accounts during onboarding.

**Root cause:** Accounts already exist in FreshBooks (from previous setup or FB defaults), but `find_accounts_by_names` (Pass 2) doesn't find them — likely a name case mismatch or the FreshBooks API returning names differently than what we search for. When Pass 3 tries to create them, FB returns 409 with the existing `entity_uuid`.

**Fix needed:** In `CreateTenderAccountsService#create_missing_accounts`, handle 409 by extracting `entity_uuid` from the error response and fetching/persisting that account. Same pattern needed in `EnsureSpecialAccountsService` for FreshBooks.

**Files:**
- `app/services/accounting_sync/freshbooks/create_tender_accounts_service.rb:99-107` — handle 409 in create loop
- `app/services/api_clients/freshbooks/client.rb:53-78` — create_account method
- `app/services/onboarding/prepare_freshbooks_mappings_service.rb:181-192` — also ignores result

**Why:** Blocking onboarding for FreshBooks users. Tenders show "Mapping..." forever.

**How to apply:** TDD fix. Write spec for 409 handling, then update create_missing_accounts to fetch existing account on 409.
