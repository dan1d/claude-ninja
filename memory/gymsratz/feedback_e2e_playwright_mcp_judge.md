---
name: E2E testing with Playwright MCP + LLM Judge pattern
description: Use Playwright MCP for browser-based e2e verification. Claude acts as LLM judge to evaluate UI from accessibility snapshots, screenshots, and network requests.
type: feedback
---

## Pattern: Claude as E2E Tester + LLM Judge

Instead of writing formal E2E test scripts for every flow, use Playwright MCP during development to drive a real browser and have Claude evaluate the results.

### The Workflow

```
1. Start dev server (pnpm dev / rails s / etc.)
2. browser_navigate → target URL
3. browser_snapshot → Claude reads accessibility tree
4. browser_click / browser_type → interact with the UI
5. browser_snapshot → Claude evaluates: did the expected state change happen?
6. browser_network_requests → verify correct API calls
7. browser_console_messages → check for JS errors
```

### Why This Works

- **Unit tests verify code correctness, not feature correctness.** TypeScript compiles and tests pass, but the button might be in the wrong place or show wrong copy.
- **Claude can judge "does this look right?" from a snapshot.** No explicit assertions needed for many cases — Claude can tell "the form shows a success message" vs "the form shows an error."
- **Network request inspection reveals what the UI can't show.** Caught a Supabase 500 error this way — the UI showed "sending..." but the network tab revealed the actual error response body.
- **Console messages catch silent failures.** Supabase auth errors appeared in console before any UI feedback.

### When to Use This vs Formal E2E Tests

| Use Playwright MCP + LLM Judge | Use Formal E2E Tests (Playwright scripts) |
|---|---|
| During development to verify your work | CI/CD pipeline regression prevention |
| Debugging "it doesn't work" reports | Critical user flows (signup, checkout) |
| One-off verification of a fix | Smoke tests for deployment validation |
| Exploring unknown UI state | Accessibility compliance automation |

### Practical Tips

1. **Always check `browser_console_messages` after navigation** — auth errors, failed fetches, and React warnings surface here before any UI change
2. **`browser_network_requests` is gold for debugging** — filter by status code to find failures. Response bodies show the actual error.
3. **`browser_snapshot` > `browser_take_screenshot`** — snapshots are text (accessible to Claude), screenshots are images (require vision). Use snapshots first, screenshots for visual-only issues.
4. **Don't `browser_evaluate` when `browser_snapshot` works** — evaluate is for reading JS state the DOM doesn't expose
5. **Test the symmetric flow** — for password reset, test both "email exists" and "email doesn't exist" paths. Both should show the same UI (CWE-204).

### Example: Debugging Supabase Auth 500

```
→ browser_navigate to /login/forgot-password
→ browser_type email into the form
→ browser_click "Enviar enlace" button
→ browser_snapshot shows "Enviando..." stuck
→ browser_network_requests reveals:
    POST /auth/v1/recover → 500
    Response: {"code":500,"msg":"converting NULL to string"}
→ Root cause: NULL columns in auth.users
→ Fix: SQL UPDATE to set empty strings
→ browser_navigate again → verify flow completes
```

This debugging cycle (navigate → interact → inspect network → fix → verify) is far faster than reading server logs alone.
