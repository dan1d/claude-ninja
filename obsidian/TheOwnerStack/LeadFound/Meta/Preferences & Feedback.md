# Preferences & Feedback

#meta #memory

## Obsidian is the source of truth
Always read `LeadFound/Dev/Dev Tracker.md` before starting work. Update it when done.
Track architectural decisions in `LeadFound/Meta/Key Decisions.md`.

## Agent routing
CLAUDE.md has an Agent Dispatch Protocol table. Route automatically.
For multi-domain tasks use `/plan <task>` to fire `agent-organizer` first.

## No Co-Authored-By lines in commits
Keep commit history clean — never add `Co-Authored-By: Claude...`

## Short messages = just do it
"next", "continue", "phase 2" — read Obsidian first, then act. No confirmation needed.

## No trailing summaries
One short sentence max after completing a task. Daniel reads the diff and the tracker.

## TDD is mandatory — always write specs first
Write the failing spec BEFORE implementation. A broken route helper caused a 500 in production
because no spec existed. Red → Green → Refactor, always.

## No fake social proof
Never add testimonials, user counts, or stats we don't have. Demonstrate potential honestly.

## Tailwind light theme only — no dark mode
Flowbite 3.1 light theme. Never use `dark:` prefix or invalid classes like `text-success`.
Use `text-green-600`, `text-amber-500`, `text-red-600` instead.

## ERB raw output in script tags
Never `<%= .to_json %>` inside `<script>` — use `<%== %>` (raw) to avoid HTML entity escaping.

## Importmap transitive dependencies
Always pin transitive deps when adding CDN bundles to `importmap.rb`.

## No Devise — Rails 8.1 native auth
Project uses `rails generate authentication` (has_secure_password + Sessions). Never suggest Devise.

## params.expect() not params.require().permit()
Rails 8.1 strong params API. Always use `params.expect(model: %i[field...])`.