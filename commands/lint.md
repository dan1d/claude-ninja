Run the linter for the current project.

## Usage
```
/lint              # Full check
/lint --fix        # Auto-correct safe offenses
/lint --fix-all    # Auto-correct all offenses
```

## Instructions

1. Detect stack:
   - If Gemfile present → `bundle exec rubocop app/ spec/` (or `-a` / `-A` with flags)
   - If package.json and eslint → `npx eslint .`
   - If biome.json → `npx biome check .`

2. Report:
   1. Total offense count
   2. Any offenses requiring manual attention
   3. If 0 offenses: confirm clean

## Key rules (Rails projects)
- `params.expect()` not `params.require().permit()`
- `# rubocop:disable Rails/DynamicFindBy` on `find_by_password_reset_token!` — intentional
- `# :nocov:` on rate-limit lambdas — intentional
