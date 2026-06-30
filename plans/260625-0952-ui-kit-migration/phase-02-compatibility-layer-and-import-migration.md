---
phase: 2
title: "Compatibility layer and import migration"
status: pending
priority: P1
dependencies: [1]
effort: "1-2d"
---

# Phase 2: Compatibility layer and import migration

## Overview

Introduce local ui-kit-backed components with enough AntD-like API coverage to migrate all source imports off `antd` without rewriting every screen in one risky pass.

## Requirements

- Functional: Tables, cards, forms, modals, drawers, selects, tabs, steps, grid, badges, and basic inputs keep rendering.
- Non-functional: Compatibility layer is temporary and contained under one folder. No external UI library imports.

## Architecture

`src/components/ui-kit-compat/` exports components named like the previous AntD imports, but internally uses `@frontend-team/ui-kit` components and token classes. Source files import from this local layer instead of `antd`.

## Related Code Files

- Create: `src/components/ui-kit-compat/index.tsx`
- Create: `src/components/ui-kit-compat/table-types.ts`
- Modify: all `src/**/*.tsx|ts` imports from `antd` and `antd/es/table/interface`

## Implementation Steps

1. Build adapters for `Button`, `Card`, `Tag`, `Input`, `InputNumber`, `Select`, `Table`, `Modal`, `Drawer`, `Form`, `Radio`, `Checkbox`, `Switch`, `Tooltip`, `Tabs`, `DatePicker`, `Row`, `Col`, `Statistic`, `Skeleton`, `Progress`, `Alert`, `Segmented`, `Steps`, `Descriptions`, `Typography`, and simple utility components.
2. Rewrite source imports from `antd` to `@/components/ui-kit-compat`.
3. Rewrite table type imports to `@/components/ui-kit-compat/table-types`.
4. Run build and patch adapter gaps.

## Success Criteria

- [ ] `rg "from ['\"]antd|antd/es" src` returns no source imports.
- [ ] Compatibility layer imports UI only from `@frontend-team/ui-kit`.
- [ ] `npm run build` passes or remaining failures are isolated to page-level prop mismatches documented in Phase 3.
