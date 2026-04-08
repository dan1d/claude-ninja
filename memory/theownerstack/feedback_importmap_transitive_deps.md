---
name: Importmap transitive dependencies
description: Always pin transitive dependencies when adding CDN bundles to importmap.rb — importmap-rails doesn't resolve them
type: feedback
---

When pinning a CDN JS bundle in `config/importmap.rb`, always check and pin its transitive dependencies. Importmap-rails does NOT resolve bare module specifiers that the bundle internally imports.

**Why:** `chart.js/auto` was pinned from CDN but its internal dependency `@kurkle/color` was missing, causing the `labor-chart` Stimulus controller to fail registration with `Failed to resolve module specifier "@kurkle/color"`. This silently broke the labor chart on any page that used it.

**How to apply:** After adding a new CDN pin, check the library's `package.json` for dependencies, or load the page and check the browser console for `Failed to resolve module specifier` errors. Pin each missing bare specifier.
