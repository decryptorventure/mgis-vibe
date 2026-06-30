---
title: "NMS FE full ui-kit migration"
description: "Migrate NMS FE from Ant Design/Tailwind app styling to @frontend-team/ui-kit + ikame Core DS 1.1."
status: in-progress
priority: P1
created: 2026-06-25
blockedBy: []
blocks:
  - 260623-1530-nms-uiux-optimization
  - 260610-1705-nms-fe-uiux-upgrade
---

# NMS FE full ui-kit migration

## Overview

Move the app UI stack to `@frontend-team/ui-kit` + ikame Core DS 1.1. The current source is a hybrid React/Vite app with Ant Design, app-level Tailwind, custom CSS variables, and partial ui-kit usage. This plan keeps the app buildable by using a temporary ui-kit-backed compatibility layer, then removes external UI dependencies and aligns docs/gates.

## Inventory

| Surface | Current evidence | Migration target |
|---|---:|---|
| AntD named imports | 108 source files; top use: `Card`, `Tag`, `Select`, `Input`, `Table`, `Row`, `Col`, `Button` | `@/components/ui-kit-compat` first, then direct ui-kit components |
| Raw color / Tailwind colors | 36 source files | ikame token classes and CSS variables only |
| Oversized files | 34 files over 200 lines | Split high-risk pages during cleanup phases |
| Existing ui-kit setup | `TooltipProvider`, `Toaster`, `@frontend-team/ui-kit/style.css` already present | Keep, remove AntD provider/theme |

## Strategy

1. Stop importing external UI libraries from app source.
2. Replace AntD provider/theme and app Tailwind plugin with ui-kit setup.
3. Add `src/components/ui-kit-compat/` as a temporary shim for AntD-like props, backed by ui-kit/native elements.
4. Rewrite imports from `antd` and `antd/es/table/interface` to local compat/types.
5. Tokenize page/component styling and replace raw colors.
6. Split major oversized files and update docs/ADR after build is stable.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Audit and stack setup](./phase-01-audit-and-stack-setup.md) | Completed |
| 2 | [Compatibility layer and import migration](./phase-02-compatibility-layer-and-import-migration.md) | Completed |
| 3 | [Page tokenization and component cleanup](./phase-03-page-tokenization-and-component-cleanup.md) | Completed |
| 4 | [Frontend hard-rules and docs gates](./phase-04-frontend-hard-rules-and-docs-gates.md) | Completed |

## Dependencies

- Extends/supersedes UI stack assumptions from `plans/260610-1705-nms-fe-uiux-upgrade/`.
- Blocks remaining UX polish in `plans/260623-1530-nms-uiux-optimization/` where AntD component assumptions remain.

## Acceptance Criteria

- [x] No source imports from `antd`, `@mui/*`, shadcn, or `@radix-ui/themes`.
- [x] `package.json` no longer depends on `antd`, `@radix-ui/themes`, app-level `tailwindcss`, or `@tailwindcss/vite`.
- [x] Root app uses ui-kit CSS, `TooltipProvider`, and `Toaster` only for UI provider setup.
- [x] Major raw color/hardcoded hex usage is replaced with ikame token classes/variables for the migrated runtime path.
- [x] `npm run build` passes.
- [x] `dk:ui-review` gate is rerun and decision file updated.
- [x] Architecture docs and ADR reflect the UI stack switch.

## Unresolved Questions

`npm run lint` still reports existing repo-wide lint debt after parser-root fix; not treated as a migration blocker in this plan.
