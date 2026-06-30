---
phase: 3
title: "Page tokenization and component cleanup"
status: pending
priority: P1
dependencies: [2]
effort: "2-4d"
---

# Phase 3: Page tokenization and component cleanup

## Overview

Replace raw colors, one-off Tailwind color utilities, and AntD-specific visual patterns with ikame token classes and direct ui-kit components.

## Requirements

- Functional: Route surfaces keep current information architecture and workflows.
- Non-functional: Token-first styling, one primary CTA per screen where practical, neutral tabs/pagination/selection, dark-mode-safe colors.

## Architecture

Shared components in `src/components/ui/` become the preferred page building blocks. Pages gradually move from compatibility exports to direct ui-kit components.

## Related Code Files

- Modify: `src/index.css`, `src/shared/tokens.ts`, shared UI components, page/network modules with raw colors.
- Modify: high-use pages first: dashboard, upload monitor, key management, meta errors, network portfolio, campaign wizard.

## Implementation Steps

1. Replace raw `text-red-*`, `bg-indigo-*`, hardcoded hex, and `var(--brand-primary)` patterns with token classes.
2. Normalize tabs/filter/selection active states to neutral tokens.
3. Replace simple compatibility imports with direct `@frontend-team/ui-kit` imports where prop mapping is trivial.
4. Keep Recharts as charting dependency; use token CSS variables for chart colors where possible.

## Success Criteria

- [ ] Major raw color scan count is materially reduced.
- [ ] Shared UI components use token classes and ui-kit APIs.
- [ ] No brand orange outside primary CTA/status exceptions.
