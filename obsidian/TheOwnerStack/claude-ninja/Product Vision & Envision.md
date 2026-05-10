# claude-ninja — Product Vision & Envision

**Last updated:** 2026-05-10
**Status:** Active, evolving
**Author:** Daniel Dominguez
**Users:** Daniel + brother (technical co-builders), future: any dev who wants /plan to just work

---

## What is claude-ninja?

A personal Claude Code configuration system that turns `/plan <anything>` into finished, working software. Not "code that compiles" — software that actually satisfies the user need it was built for.

**Install:** `npx github:dan1d/claude-ninja`
**Repo:** `github.com/dan1d/claude-ninja`

---

## The Problem — Why AI-Written Code Breaks

The default AI coding workflow is backwards:

```
User: "build a gym management dashboard"
AI:   writes 17 pages of code
User: tests it
User: "half the buttons don't do anything"
User: spends 4 prompts auditing what's broken
User: spends 10 more prompts fixing each dead element
```

This is what happened on GymsRatz. We built an Electron + React app with 17 pages. The code compiled. The UI rendered. But ~60 interactive elements were dead — buttons with `onClick={() => {}}`, mock data pretending to be real, cursor:pointer on spans with no handler, commented-out API calls.

**The real question:** Why were those 60 elements broken in the first place?

Because nobody asked "what should this button DO?" before writing it. The AI generated plausible-looking UI without understanding the user workflow behind each element. Code was written, then audited, then fixed. The thinking happened last.

---

## The Thesis — Think First, Code Second

**`/plan` should just WORK.**

One prompt should take you from intent to finished, working software. Not "here's some code, go test it" — actual working features that satisfy real user needs.

The insight came from auditing GymsRatz in 3 prompts:

| Prompt | What we did | What it proved |
|--------|-------------|----------------|
| 1 | Source-level grep audit of all 17 pages | Found ~60 dead elements in minutes, not hours |
| 2 | UX behavior mapping against product vision | Each dead element got a "what it SHOULD do" spec |
| 3 | Priority framework + ticket generation | Organized chaos into a phased plan |

The methodology worked 10x faster than browser testing. But the bigger realization was: **if we had done this BEFORE writing the code, those 60 elements would never have been broken.**

---

## The Philosophy — "It Works" Means It Works

"It works" does not mean:
- The code compiles
- The tests pass
- The server starts
- The page renders

"It works" means:
- The user can complete their task
- Every interactive element does something meaningful
- The data shown is real (or clearly marked as placeholder)
- The UX copy makes sense in the user's language
- Edge cases are handled, not ignored
- The feature satisfies the NEED it was built for

---

## The Pipeline — How /plan Should Work

### Current state (what we have)

```
/plan <task>
  └── agent-organizer picks specialist agents
        └── agents write code
              └── tests run (RSpec/Jest)
                    └── linter runs (RuboCop/ESLint)
                          └── Dev Tracker updated
```

This produces code that passes tests. But it doesn't guarantee the code is USEFUL.

### Target state (what we're building)

```
/plan <task>
  │
  ├── Phase 0: ENVISION (think before code)
  │   ├── What user need does this satisfy?
  │   ├── What does each interactive element DO?
  │   ├── What data does each element show? Where does it come from?
  │   ├── What does the user see on success? On error? On empty state?
  │   └── Cross-reference: product vision, design spec, existing API
  │
  ├── Phase 1: VALIDATE (plan-judge)
  │   ├── Is the plan complete? (no "TODO: wire later" allowed)
  │   ├── Does every UI element have a defined behavior?
  │   ├── Are all API endpoints identified (existing or new)?
  │   ├── Are error paths covered?
  │   └── Reflexion loop: WARN/FAIL → revise → re-judge (max 2 retries)
  │
  ├── Phase 2: BUILD (specialist agents)
  │   ├── TDD: failing spec → implementation → green
  │   ├── Each element wired to real data or clearly deferred
  │   ├── No onClick={() => {}} — every handler has intent
  │   └── UX copy in the user's language
  │
  ├── Phase 3: VERIFY (multi-judge)
  │   ├── test-judge: Are the tests meaningful? (not just coverage)
  │   ├── impl-judge: Does the code match the envision spec?
  │   ├── integration-judge: Do the pieces connect end-to-end?
  │   └── Reflexion loop: failures → fix → re-judge
  │
  └── Phase 4: AUDIT (app-auditor — if requested)
      ├── Source-level grep scan (dead handlers, mock data, commented API)
      ├── Cross-reference against envision spec
      ├── LLM judge validates proposed fixes
      └── Output: prioritized findings → Obsidian
```

### The key difference

The old flow: **build → discover problems → fix**
The new flow: **envision → validate → build correctly → verify it works**

The audit (Phase 4) becomes a safety net, not the primary workflow. If Phase 0-3 work correctly, the audit should find nothing.

---

## The Audit Methodology (proven on GymsRatz)

When Phase 0-3 haven't been applied (existing codebase, inherited code, fast prototype), the audit recovers the situation.

### Why source-level > browser testing

| | Source-Level (grep + Read) | Browser (Playwright) |
|---|---------------------------|---------------------|
| Speed | 10x faster | Slow — server crashes, HMR, overlays |
| Reliability | 100% — files don't crash | Fragile — dev servers die |
| Coverage | Every element in every file | Only what you click |
| Depth | Sees TODOs, commented code, mock patterns | Only rendered UI |
| Visual bugs | Misses them | Catches them |

**Best practice:** Source audit FIRST, browser verify SECOND.

### Grep patterns that find dead elements

```bash
# Dead handlers
grep -rn 'onClick={() => {}' src/
grep -rn 'onClick={() => console' src/

# Clickable-looking but dead
grep -rn 'cursor.*pointer' src/    # check parent for onClick
grep -rn 'role="button"' src/      # check for onClick

# Commented-out API calls
grep -rn '// .*trpc\.\|// .*fetch(' src/
grep -rn 'TODO.*api\|TODO.*trpc' src/

# Mock data
grep -rn 'const.*MOCK\|const.*mock_\|mockData' src/
grep -rn 'useState<.*>\(\[{' src/  # inline hardcoded arrays

# Decorative elements pretending to be interactive
grep -rn '<span.*→\|<span.*Ver todo' src/
```

### Rails/Hotwire patterns (adaptation)

```bash
# Dead links in ERB
grep -rn 'href="#"' app/views/
grep -rn "link_to.*'#'" app/views/

# Stimulus controllers referenced but missing
grep -rn 'data-controller=' app/views/ | # extract controller names
  # then check if app/javascript/controllers/{name}_controller.js exists

# Turbo frames without src (placeholder frames)
grep -rn 'turbo-frame.*id=' app/views/ # check for src= or lazy loading

# Empty actions in controllers
grep -rn 'def.*\n.*end' app/controllers/ # methods with no body
```

### Element status taxonomy

| Status | Meaning | Action |
|--------|---------|--------|
| WORKS | Fully functional | Leave it |
| tRPC/API | Wired but needs running server | Will work once API is up |
| MOCK | Hardcoded fake data | Wire to real API |
| UI-ONLY | Visual toggle, no data effect | Wire to real filter/mutation |
| DEAD | Has cursor/hover but no handler | Define behavior + wire |
| PARTIAL | Some parts work, some don't | Wire the gaps |

### Priority framework

- **P0 (BLOCKER):** App is unusable without this
- **P1 (HIGH):** Daily workflow action (user does this every day)
- **P2 (MEDIUM):** Weekly action or power-user feature
- **P3 (LOW):** Nice-to-have, defer to next version

---

## The Agent Roster

### Core pipeline agents

| Agent | Phase | Role |
|-------|-------|------|
| `agent-organizer` | Routing | Detects intent, picks specialists |
| `plan-judge` | Phase 1 | Validates plan completeness |
| `test-judge` | Phase 3 | Evaluates test quality (not just coverage) |
| `impl-judge` | Phase 3 | Verifies code matches spec |
| `integration-judge` | Phase 3 | Checks end-to-end connectivity |
| `app-auditor` | Phase 4 | Source-level audit methodology |

### Specialist agents (50+)

| Domain | Examples |
|--------|----------|
| Rails | `ruby-on-rails-pro`, `rails-architect`, `migration-pro` |
| Frontend | `react-pro`, `frontend-developer`, `hotwire-pro` |
| Testing | `tdd-orchestrator`, `tdd-rspec-pro`, `qa-expert` |
| Payments | `payment-integration`, `stripe-billing-pro` |
| DevOps | `deployment-engineer`, `cloud-architect`, `heroku-pro` |
| Security | `security-auditor`, `ecc:security-review` |
| AI/LLM | `ai-engineer`, `prompt-engineer` |
| Marketing | 20 agents (attraction, conversion, email, SEO, etc.) |

---

## The Hook System (automation layer)

| Hook | Event | What it does |
|------|-------|-------------|
| `obsidian-task-gate.js` | PreToolUse | Blocks code edits until plan is written in Obsidian |
| `auto-route.js` | PostToolUse | Routes to specialist after file edits (JSX → react-pro, etc.) |
| `prompt-route.js` | UserPromptSubmit | Keyword scoring → agent dispatch before Claude processes |
| `post-task-review.js` | Stop | Triggers code review + Obsidian update when Claude finishes |

### Sentinel lifecycle

```
Obsidian plan written → plan sentinel created → code edits unblocked
  → source edit → review sentinel populated
    → Claude stops → review triggered → review cleared
      → plan sentinel persists (4hr TTL)
```

---

## The Obsidian Integration (knowledge layer)

Every project gets a vault scaffold:

```
TheOwnerStack/
  {project}/
    00 - Project Overview.md     ← what, stack, repo link
    Product Vision & Envision.md ← this document pattern
    Dev/
      Dev Tracker.md             ← tasks, status, progress
    Meta/
      Key Decisions.md           ← architectural choices
      Known Issues.md            ← bugs, watch items
```

The task gate hook ensures every coding session starts with a plan written to the Dev Tracker. No plan → no code edits allowed.

---

## The Memory System (persistence layer)

Four types of memory survive between sessions:

| Type | What | Example |
|------|------|---------|
| `user` | Who you are, preferences | "Deep Go expertise, new to React" |
| `feedback` | Corrections + confirmed approaches | "TDD is mandatory — shipped a broken route helper once" |
| `project` | Ongoing work, goals, decisions | "Merge freeze starts 2026-03-05" |
| `reference` | Pointers to external resources | "Pipeline bugs tracked in Linear project INGEST" |

Backed up in `claude-ninja/memory/` and restored via `npx github:dan1d/claude-ninja`.

---

## What "It Works" Looks Like (success criteria)

### For a new feature request

```
User: /plan add a payment history page to the gym app

Claude-ninja:
  1. ENVISION: "Payment history needs: list of transactions, date/amount/status,
     filter by date range, export to CSV. Data source: MercadoPago webhooks
     stored in payments table. Melisa checks this weekly."
  2. VALIDATE: plan-judge confirms all elements have behavior specs
  3. BUILD: TDD → page component → tRPC query → tests
  4. VERIFY: test-judge confirms tests are meaningful,
     impl-judge confirms every element is wired,
     no onClick={() => {} anywhere

Result: Page works. Every button does something. Data is real.
No audit needed.
```

### For an existing codebase audit

```
User: /plan audit the desktop app, find what works and what doesn't

Claude-ninja:
  1. app-auditor detects Electron + React from package.json
  2. Batch grep scan → catalogs every interactive element
  3. Cross-references against Product Vision & Design Prompt
  4. UX behavior mapping → what each dead element SHOULD do
  5. LLM judge validates proposed fixes are usable, not just "add onClick"
  6. Prioritized output → Obsidian audit note

Result: Complete inventory with actionable fix plan.
~60 dead elements found in ~3 prompts, not 3 days.
```

---

## Metrics (proven)

- **GymsRatz audit:** 17 pages, ~60 dead elements, 4 global bugs, 18 API routers — cataloged in ~3 prompts
- **Source-level grep:** 10x faster than Playwright browser testing
- **Agent roster:** 50+ specialists covering Rails, React, Electron, payments, DevOps, marketing
- **Memory system:** Survives across machines via `npx` installer

---

## Roadmap

### Now (building)
- [ ] 5-Judge Pipeline + Reflexion Loop (plan/impl/test/integration/e2e judges)
- [ ] app-auditor agent (audit methodology as an agent)
- [ ] Phase 0 (Envision) integration into /plan

### Next
- [ ] Framework auto-detection for audit (React/Rails/Next/Electron)
- [ ] Obsidian audit output template
- [ ] Cross-project learning (patterns from gymsratz apply to leadfound)

### Future
- [ ] Self-improving: audit findings feed back into envision rules
- [ ] Multi-agent parallelism (audit + fix simultaneously)
- [ ] Community sharing (export agent configs as installable packages)

---

## Reference Documents

- **Dev Tracker:** [[Dev/Dev Tracker]]
- **GymsRatz audit methodology:** `~/Documents/obsidian/TheOwnerStack/gymsratz/Dev/Methodology — Desktop Audit & UX Research.md`
- **Reusable audit pattern:** `~/Documents/obsidian/TheOwnerStack/claude-ninja/Dev/Pattern — Source-Level App Audit.md`
- **Code:** `~/claude-projects/theownerstack/claude-ninja/`
- **Install:** `npx github:dan1d/claude-ninja`
