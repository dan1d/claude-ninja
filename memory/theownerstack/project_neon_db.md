---
name: Neon PostgreSQL production database
description: Managed PostgreSQL on Neon (us-west-2 Oregon), project salestobooks_production, PG 17
type: reference
---

Neon PostgreSQL production database created 2026-03-15.

- **Host:** ep-noisy-sea-akek01b5-pooler.c-3.us-west-2.aws.neon.tech
- **Port:** 5432
- **User:** neondb_owner
- **Database:** salestobooks_production
- **SSL:** require
- **Region:** us-west-2 (Oregon) — same state as Hetzner Hillsboro server
- **Pooler:** yes (PgBouncer, the `-pooler` suffix in the host)
- **Dashboard:** https://console.neon.tech

**How to apply:** Update `deploy.yml` PGHOST/PGUSER/PGSSL and add PGPASSWORD to Kamal secrets. See Phase 7 in docs/ADMIN_BLOG_PLAN.md for full migration steps.
