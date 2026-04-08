---
name: UX Redesign — Full Implementation Plan & Codebase Map
description: Step-by-step implementation plan for the Connections Hub UX redesign with exact file paths, patterns, and technical details needed to resume work
type: project
---

## Codebase Key Facts (app-autobooks/)

### Directory Convention
- App root: `/Users/r1/claude-projects/theownerstack/app-autobooks/`
- Note: Agent explored as `app-theownerstack` but the actual directory is `app-autobooks`
- Verify actual dirname before starting work

### Architecture
- Rails 8.1, ViewComponent, Tailwind CSS + Flowbite, dark-native (class="dark" on html)
- Service objects: dry-monads Result pattern (`ApplicationService` base)
- Feature flags: `FeatureFlags.enabled?(:feature_name)` — DB > ENV resolution
- POS providers: `PosProviders::REGISTRY` (clover, square, toast, lightspeed)
- Accounting providers: `AccountingProviders::REGISTRY` (quickbooks, xero, freshbooks, wave)
- Icons: `icon()` helper from `IconHelper` using HeroiconPaths
- All UUIDs for primary keys

### Key Models
- `Company` — multi-tenant container, has_many :account_linkings, :users
- `User` — Devise auth, belongs_to :current_company, :current_account_linking
- `AccountLinking` — THE core model: bridges POS + Accounting (polymorphic pos_account)
  - `resolved_pos_account` returns pos_account || clover_account
  - `pos_provider_key` infers :clover, :square, :toast, :lightspeed
  - has_many :daily_sales_reports, :sync_jobs
- `DailySalesReport` — AASM state machine (pending → synced → error)

### Key Controllers
- `ApplicationController` — authenticate_user!, set_current_company, helper_method :current_company, :current_account_linking
- `CompanyScoped` concern — loads company from params[:company_id]
- `LocationScoped` concern — loads location from params[:location_id]
- Routes: `/companies/:company_id/...` scoping pattern

### Current Sidebar (layouts/_sidebar.html.erb, ~252 lines)
- Groups: Clients, Main (13 items with feature flags), Discover, Manage
- Uses Stimulus `sidebar` controller
- Icons via `icon()` helper
- Feature-gated items: plaid, ai_chat, doordash, invoices, payroll, tax_center, location_intelligence

### Current Topbar (layouts/_topbar.html.erb, ~144 lines)
- Shows connected POS + Accounting names in center
- Company/Location switcher dropdowns on right
- Stimulus `dropdown` controller

### Current Dashboard (dashboard/show.html.erb)
- Components: SetupProgressComponent, SetupCardComponent (x3), RecentReportsComponent
- Controller loads: setup_progress, account_linking, recent_reports, sync status

### ViewComponent Pattern
- Base: `ApplicationComponent < ViewComponent::Base` (includes Turbo helpers, IconHelper)
- Template: `app/components/namespace/component_name.rb` + `.html.erb`
- Existing components: dashboard/, ui/, onboarding/, auth/, billing/, reports/, settings/, integrations/, locations/

### Test Setup
- RSpec + FactoryBot + SimpleCov (50% minimum currently)
- Shared context: `"authenticated_user"` (creates user, company, company_user, logs in)
- Shared context: `"company_with_setup_complete"` — fully wired company
- Factories: :company, :company(:fully_setup), :user, :account_linking, :clover_account, etc.

### CSS
- Dark-native Tailwind, no `dark:` prefixes needed
- Colors: primary (indigo), secondary (sky), accent (violet)
- Custom CSS in `app/assets/stylesheets/custom/components.css`
- Layout: CSS Grid (.app-layout, .sidebar, .app-topbar, .app-main)

---

## Implementation Steps (9 total)

### Step 1: Routes + Controller Restructure
- [ ] Add `resources :connections` routes (company-scoped)
- [ ] Add consolidated `resource :settings` routes
- [ ] Add legacy redirects for old routes (301)
- [ ] Create `ConnectionsController`
- [ ] Create `ConnectionSettingsController` (optional, may fold into connections#show tabs)
- **Files:** config/routes.rb, app/controllers/connections_controller.rb

### Step 2: Sidebar Rewrite
- [ ] Rewrite `_sidebar.html.erb` — 5 items: Dashboard, Reports, Connections, AI Assistant (gated), Settings
- [ ] Keep client switcher for multi-client accountant users
- [ ] Progressive disclosure: AI Assistant only if :ai_chat AND has synced data
- **Files:** app/views/layouts/_sidebar.html.erb, components.css

### Step 3: Topbar Simplification
- [ ] Remove POS/Accounting context from center
- [ ] Clean: brand + page title + user menu
- **Files:** app/views/layouts/_topbar.html.erb

### Step 4: Connections Hub Page
- [ ] `Connections::HubComponent` — page layout
- [ ] `Connections::PipelineCardComponent` — visual POS→Mapping→Accounting pipeline per connection
- [ ] `Connections::ServiceCardComponent` — bank/delivery/payroll cards
- [ ] `Connections::AddConnectionCardComponent` — CTA
- [ ] `connections/index.html.erb` — hub page
- [ ] `connections/show.html.erb` — detail with tabs (overview, mappings, reports, settings)
- **Files:** ~10 new component + view files

### Step 5: Reports Merge
- [ ] Merge Reports + Sync Monitor into tabbed single page
- [ ] Tab: All Reports (current daily_sales_reports/index)
- [ ] Tab: Sync Health (current reports/dashboard/show)
- [ ] Rename "Location" → "Connection" in filters
- **Files:** daily_sales_reports/index.html.erb, daily_sales_reports_controller.rb

### Step 6: Dashboard Redesign
- [ ] Setup state: onboarding wizard CTA
- [ ] Active state: HealthStripComponent, RevenueOverviewComponent, ActionItemsComponent
- [ ] Keep RecentReportsComponent (updated)
- **Files:** dashboard/show.html.erb, ~3 new components

### Step 7: Settings Consolidation
- [ ] Tabbed Settings page: General, Team, Billing, Tax, Invoices, Account
- [ ] Wrap existing views as tab content
- **Files:** company_settings/show.html.erb

### Step 8: Terminology Rename
- [ ] "Location" → "Connection" in all user-facing copy (~20 view files)
- [ ] UI-only rename, no model/table/column changes
- **Files:** all .html.erb with "location" in user-facing text

### Step 9: Cleanup
- [ ] Remove orphaned views, add redirects
- [ ] Remove unused sidebar CSS
- [ ] Rename "AutoBooks" → "TheOwnerStack" in remaining places

---

## TDD Approach
- Write specs FIRST for each component and controller
- Use existing shared contexts ("authenticated_user", "company_with_setup_complete")
- Component specs test rendering, conditional visibility, data display
- Controller specs test actions, redirects, instance variables
- Request specs for route redirects
- 100% line + branch coverage on new code

**Why:** User requested full UX redesign as single coherent push.
**How to apply:** Work through steps 1-9 sequentially, TDD each step (red→green→refactor), run rubocop + rspec after each step.
