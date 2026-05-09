Run browser-based E2E verification against a running dev server and judge UI correctness with Opus.

## Instructions

1. Parse `$ARGUMENTS` for the target URL and an optional flow description.
   - If no URL provided, default to `http://localhost:3000`
   - If a route path is given (e.g. `/login`), prepend `http://localhost:3000`

2. Verify the dev server is reachable:
   ```bash
   curl -sf -o /dev/null <URL>
   ```
   If it fails, report: "Dev server not reachable at <URL>. Start it first, then re-run /e2e." and stop.

3. Invoke the `integration-judge` agent to verify:
   - Required env vars are set (not just documented)
   - External services are reachable (DB, email, auth)
   - API routes respond (not 500)
   Report findings. If FAIL, stop and report — fix infrastructure before E2E testing.
   Integration failures are NOT auto-retried (they require human env/config changes).

4. Invoke the `e2e-judge` agent with:
   - The target URL
   - The flow description (from $ARGUMENTS), if provided
   - Instruction to test error paths if the flow involves forms or auth

5. Report the verdict to the user. If WARN or FAIL, suggest specific follow-up actions.

## Prerequisites

- A dev server must be running at the target URL
- Playwright MCP server must be configured

## Examples

```
/e2e http://localhost:3000/login — test the login form with valid and invalid credentials
/e2e /dashboard — verify the dashboard loads and shows expected data
/e2e http://localhost:8080/forgot-password — test password reset flow end-to-end
```
