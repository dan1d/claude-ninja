---
name: Rebrand to SalesToBooks
description: Product rebranding from TheOwnerStack to SalesToBooks (salestobooks.com) — domain purchased March 13, 2026
type: project
---

Product rebranding from TheOwnerStack to SalesToBooks. Domain salestobooks.com purchased on 2026-03-13.

**Brand hierarchy:**
- **SalesToBooks** = the product (customer-facing name, domain, app)
- **TheOwnerStack LLC** = the company (legal entity, Delaware LLC, contracts, app store provider)

**Design:** Light theme with emerald green primary (trust/money color, QuickBooks-like). White/slate backgrounds. Dark footer for contrast. No more purple/dark crypto aesthetic.

**Why:** "TheOwnerStack" has zero SEO value. "SalesToBooks" contains keywords ("sales", "books") that match target search queries like "sales to QuickBooks", "sync sales to accounting". Restaurant owners and accountants immediately understand what the product does from the name alone.

**How to apply:**
- The Rails app codebase still references "TheOwnerStack" throughout (views, layouts, mailers, deploy configs, docs)
- The domain migration from theownerstack.com → salestobooks.com needs DNS, Kamal, OAuth redirect URIs, app store listings, and Intuit developer portal updates
- Clover App Market submission should use the new name
- The monorepo directory is still called app-theownerstack — rename is optional but code references matter more
- staging.salestobooks.com for staging environment
- support.salestobooks.com for Chatwoot (or keep support.theownerstack.com and redirect later)
