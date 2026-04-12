Run the test suite for the current project, then judge test quality with Opus.

## Instructions

1. Detect stack from CLAUDE.md or Gemfile/package.json in the current directory:
   - If Gemfile present → `bundle exec rspec $ARGUMENTS`
   - If package.json present → `npm test $ARGUMENTS` or `npx jest $ARGUMENTS`

2. After the run, report:
   1. Pass/fail count and total duration
   2. Any failures — show spec description, file:line, and error
   3. Coverage status — 100% line + branch required for Ruby projects

3. If `WebMock::NetConnectNotAllowedError` → add a `stub_request` or VCR cassette
4. If a VCR cassette error → check `recorded_at` is RFC 2616 format (`Tue, 07 Apr 2026 00:00:00 GMT`)

## Step 5 — LLM-as-Judge (runs only when suite is green + coverage 100%)

If and only if all tests pass AND coverage is 100%, invoke the `test-judge` agent:

```
Use the test-judge agent. Pass it the list of spec files changed in this task
(from git diff --name-only HEAD or the files you just wrote). It will evaluate
test quality against a rubric and return a PASS/WARN/FAIL verdict with specific
findings. Report the verdict to the user after the test results.
```

The judge uses Opus and reads the actual spec + implementation files. It does not
re-run tests. It takes ~30 seconds. Do not skip it on green runs — this is the
step that catches vacuous assertions, mock-defeats-purpose gaps, and missing
network error branches that 100% coverage does not catch.
