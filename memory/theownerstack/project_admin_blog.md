---
name: Admin panel and blog system
description: Building admin panel (super_admin only), blog, DB-driven integrations, FAQ items, and search with autocomplete
type: project
---

Admin panel + blog system planned 2026-03-14. Full plan in docs/ADMIN_BLOG_PLAN.md.

**Why:** Content is hardcoded across pages (integrations, FAQs, copy). Need blog for SEO/content marketing. Need admin for non-deploy content changes.

**How to apply:**
- New gems: acts-as-taggable-on, pg_search, ActionText
- New models: BlogPost, Integration (replaces hardcoded hash), FaqItem
- Existing models: PageContent (built), FeatureConfig (exists)
- Admin at /admin, gated by User#super_admin? (column exists, unused until now)
- Public blog at /blog with search autocomplete (Stimulus + Turbo Frame + pg_search)
- 4 phases: Foundation → Admin CRUD → Public Blog → Wire Up (replace hardcoded content)
