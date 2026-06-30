---
title: "NMS UI/UX Refinement — Full Application Polish"
status: planned
created: 2026-06-26
priority: P1
phases:
  - id: phase-01
    title: "Core Feature Flows"
    status: pending
    priority: P1
  - id: phase-02
    title: "Data Display & Tables"
    status: pending
    priority: P1
  - id: phase-03
    title: "Filter & State Persistence"
    status: pending
    priority: P2
  - id: phase-04
    title: "Layout & Mobile Responsiveness"
    status: pending
    priority: P2
  - id: phase-05
    title: "Micro-interactions & Accessibility"
    status: pending
    priority: P3
---

# NMS UI/UX Refinement Plan

## Overview

Full-application UI/UX audit and refinement plan for the NMS Ad Management Platform.
Audit scope: all 23+ routes, 5 network workspaces, campaign wizard, automation rules, creative library, analytics, and shared layout.
Design baseline: **ikame Core DS 1.1** + **@frontend-team/ui-kit** (no external libs).

## Design System Baseline (from audit)

| Dimension | Decision |
|-----------|----------|
| Style | Data-Dense Dashboard — space-efficient, multiple widgets, min padding |
| Primary color | `#2563EB` (via DS token `fg_link` / `bg_blue_subtle`) |
| Text hierarchy | `text_primary` → `text_secondary` → `text_tertiary` |
| Typography | Inter (system) via ui-kit, `body_s` baseline, `body_m` only for long reading |
| Surface tiers | `bg_primary` → `bg_secondary` → `bg_tertiary` |
| Icons | Lucide (already in use), stroke-consistent, no emojis |
| Token rule | Zero raw hex or raw Tailwind colors — all via DS token classes |

## Acceptance Criteria (overall)

- [ ] All feature flows complete without dead ends or missing feedback states
- [ ] No blank/broken empty states across any table, list, or workspace
- [ ] All forms have inline validation + proper error placement + submission feedback
- [ ] Filter state persists across page refresh for all filterable views
- [ ] App is usable at 375px with no horizontal overflow
- [ ] No raw hex / raw Tailwind color classes remain in any src/ file
- [ ] Zero antd imports in src/ (already completed, verify preserved)
- [ ] Build passes with zero TypeScript errors

## Phase Summary

| Phase | Focus | Priority | Files Touched | Risk |
|-------|-------|----------|---------------|------|
| [01](phase-01-core-flows.md) | Campaign wizard + Automation rule editor | P1 | 10 files | Medium |
| [02](phase-02-data-tables.md) | Empty states, loading skeletons, bulk actions | P1 | 15 files | Low |
| [03](phase-03-filter-navigation.md) | Filter persistence, tab state, navigation | P2 | 8 files | Low |
| [04](phase-04-layout-mobile.md) | Mobile responsiveness, responsive tables | P2 | 10 files | Medium |
| [05](phase-05-polish-accessibility.md) | Micro-interactions, keyboard nav, contrast | P3 | 12 files | Low |

## Key Constraints

- All UI must use `@frontend-team/ui-kit` components + ikame DS tokens
- No new external dependencies (no antd, shadcn, MUI)
- File size ≤ 200 LOC (split if exceeded)
- Each phase must build with `npm run build` before next phase starts
- Mock data and demo flows preserved as-is (backend not in scope)

## Execution Order

Phases are sequential (each must build clean before next):
1 → 2 → 3 → 4 → 5

Phases 2 and 3 can be partially parallelized (non-overlapping files).
