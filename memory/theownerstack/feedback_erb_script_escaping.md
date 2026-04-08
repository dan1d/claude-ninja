---
name: ERB raw output in script tags
description: Never use <%= .to_json %> inside <script> tags — use <%== %> (raw) to avoid HTML entity escaping that breaks JavaScript
type: feedback
---

Never use `<%= value.to_json %>` inside `<script>` tags. ERB HTML-escapes the output (`"` → `&quot;`, `&` → `&amp;`), producing invalid JavaScript that causes `Uncaught SyntaxError: Unexpected token '&'`.

**Why:** The Chatwoot inline script in `_chatwoot.html.erb` used `<%= .to_json %>` for all values (user ID, email, company name, etc.) inside a `<script>` tag. This silently broke the entire Chatwoot widget on every authenticated page and interfered with Turbo form submissions on the onboarding wizard.

**How to apply:** Always use `<%== value.to_json %>` (raw output) for JSON values inside `<script>` tags. `.to_json` already handles JS-specific escaping (e.g., `</script>` → `<\/script>`), so it's XSS-safe. Also applies to any inline JS that outputs Ruby values.
