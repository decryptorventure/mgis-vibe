---
title: "antd → compat + token cleanup"
description: "Swap remaining 108 direct antd imports to ui-kit-compat, remove AntD provider, and replace raw semantic colors with ikame DS tokens."
status: pending
priority: P1
created: 2026-06-25
blockedBy: []
blocks:
  - 260625-1051-ui-kit-phase-2-tightening
  - 260625-1439-ui-ux-polish
---

# antd → compat + token cleanup

## Context

The `260625-0952-ui-kit-migration` plan built a full `ui-kit-compat/` shim layer covering all AntD components used in the app. However, 108 source files still import directly from `antd` — including new code added in the Axon, Meta Phase 2-3, and UX-polish commits. This plan completes the final swap.

## Inventory

| Problem | Count | Action |
|---------|------:|-------|
| `from 'antd'` imports in source files | 108 files | Swap to `@/components/ui-kit-compat` |
| `ConfigProvider` + `ThemeConfig` + `antdAlgorithm` | `main.tsx` + `antd-theme.ts` | Remove AntD provider; keep ui-kit providers only |
| Raw Tailwind semantic colors (`text-red-*`, `bg-red-*`, etc.) | ~20 occurrences | Replace with `fg_error`, `bg_error_subtle`, etc. |
| Hardcoded hex in inline styles (`#ef4444`, `#f97316`, etc.) | ~12 occurrences | Replace with CSS variables or token classes |
| Files over 200 lines | 5 files (1060, 815, 467, 344, 310 LOC) | Extract sub-components/hooks |

## Strategy

1. **Phase 1 (batch import swap)** — regex-safe sed swap `from 'antd'` → `from '@/components/ui-kit-compat'` across all 108 files; fix any API mismatches immediately after.
2. **Phase 2 (theme/provider cleanup)** — delete `antd-theme.ts`, remove `ConfigProvider` from `main.tsx`, clean up `antd` package dependency.
3. **Phase 3 (raw color tokenization)** — replace semantic Tailwind colors and hex values with ikame token classes.
4. **Phase 4 (large file splitting)** — extract sub-components for files ≥ 400 LOC.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Batch import swap](./phase-01-batch-import-swap.md) | **Completed** |
| 2 | [Theme provider cleanup](./phase-02-theme-provider-cleanup.md) | Pending |
| 3 | [Raw color tokenization](./phase-03-raw-color-tokenization.md) | Pending |
| 4 | [Large file splitting](./phase-04-large-file-splitting.md) | Pending |

## Acceptance Criteria

- [ ] `grep -r "from 'antd'" src/` returns zero results (except `antd-theme.ts` which is deleted).
- [ ] `src/main.tsx` has no AntD imports; `ConfigProvider` removed.
- [ ] `npm run build` passes with no antd-related warnings.
- [ ] No raw Tailwind semantic color classes (`text-red-*`, `bg-red-*`, `bg-blue-*`, `bg-white`) in recently changed files.
- [ ] No hardcoded hex colors in inline styles for semantic states.
- [ ] `npm run lint` passes.
- [ ] `dk:ui-review` re-run → `"verdict": "compliant"`.

## Dependencies

- `260625-0952-ui-kit-migration` — built the compat shim; this plan depends on it being complete.
- Blocks `260625-1051-ui-kit-phase-2-tightening` — phase 2 token tightening only makes sense after imports are clean.
- Blocks `260625-1439-ui-ux-polish` — polish sprint assumptions depend on clean import graph.
