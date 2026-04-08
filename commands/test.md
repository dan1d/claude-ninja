Run the test suite for the current project.

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
