---
name: No invalid Tailwind CSS classes
description: Never use text-success, text-warning, text-error, text-info — use real Tailwind classes instead
type: feedback
---

Never use non-existent Tailwind utility classes like `text-success`, `text-warning`, `text-error`, `text-info`, `bg-primary-500`. These do nothing and make UI elements invisible.

**Why:** The codebase had 20+ occurrences of `text-success` and `text-warning` across views and components. These classes don't exist in Tailwind CSS or any custom CSS file, causing icons and badges to render with no color (nearly invisible). This was the root cause of "mapping status doesn't show green checkmark" bug.

**How to apply:** Use real Tailwind color classes:
- `text-success` → `text-green-600`
- `text-warning` → `text-amber-500`
- `text-error` → `text-red-600`
- `text-info` → `text-blue-600`
- `bg-primary-500` → `bg-emerald-600`

When reviewing or writing UI code, always verify that CSS classes are valid Tailwind utilities or defined in custom CSS files.
