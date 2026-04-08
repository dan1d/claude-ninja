---
name: UX Redesign — Connections Hub Architecture
description: Major UX overhaul replacing 13-item sidebar with 5-item navigation centered on a "Connections Hub" that visually shows POS→Mapping→Accounting pipelines
type: project
---

Redesigning TheOwnerStack authenticated app from feature-flag-driven navigation (13+ sidebar items) to user-driven navigation (5 items).

**Core concept: "Connections Hub"** — a single page that visually shows each POS→Accounting pipeline as a card, with additional services (bank, delivery, payroll) below. Replaces Locations, Integrations, Delivery, Bank Feeds, Payroll pages.

**New sidebar:** Dashboard, Reports, Connections, AI Assistant (gated), Settings

**Key changes:**
- Sidebar: 13 items → 5
- Reports + Sync Monitor → merged with tabs
- Mappings → per-connection tab (not top-level)
- Tax Center, Invoices, Team, Billing → Settings tabs
- Topbar: remove POS/Accounting context display
- Terminology: "Location" → "Connection"

**Why:** Competitor research (Restaurant365, Ramp, MarginEdge) shows integrations should be plumbing in Settings, progressive disclosure beats showing everything, and pipeline visualization is the best metaphor for system connections.

**How to apply:** All authenticated app UI work should follow this new IA. Don't add sidebar items for new features — add them to Connections or Settings.
