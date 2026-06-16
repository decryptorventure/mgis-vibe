---
title: "NMS-FE UI/UX Full Upgrade — Hub+Spokes Architecture"
description: "Complete UI/UX redesign: navigation shell, analytics hub (cost center + split metrics), per-network workspace standardization, unified campaign wizard, and network-aware automation rules"
status: pending
priority: P1
effort: 40h
tags: [ui, ux, redesign, navigation, analytics, campaign-wizard, automation]
blockedBy: []
blocks: []
created: 2026-06-10
---

# NMS-FE UI/UX Full Upgrade

## Overview

Full product redesign from a fragmented 5-workspace structure to a **Hub + Spokes** architecture. The hub provides unified analytics (cost center, split metrics, cross-network comparison); the spokes are per-network workspaces with standardized shared core + network-specific plugin config.

**Product model:** Internal tool | **Tech stack:** React 19 + TypeScript + Ant Design 6 + Tailwind CSS 4 + Recharts

**Context:** Brainstorm report → `../reports/brainstorm-260610-1705-nms-fe-uiux-upgrade.md`

## Phases

| Phase | Name | Status | Parallelism |
|-------|------|--------|-------------|
| 1 | [Navigation Shell & Network Context Bar](./phase-01-navigation-shell.md) | Pending | Sequential (foundation) |
| 2 | [Analytics Hub: Dashboard + Cost Center + Split Metrics](./phase-02-analytics-hub.md) | Pending | Parallel after Phase 1 |
| 3 | [Network Workspace Standardization](./phase-03-network-workspace-standardization.md) | Pending | Parallel after Phase 1 |
| 4 | [Unified Campaign Wizard](./phase-04-campaign-wizard.md) | Pending | Parallel after Phase 3 |
| 5 | [Network-Aware Automation & Rules](./phase-05-network-aware-automation.md) | Pending | Parallel after Phase 1 |

## Execution Strategy

```
Phase 1 (sequential — foundation)
    └── Phase 2 ─┐
    └── Phase 3 ─┤─ (parallel)
    └── Phase 5 ─┘
                Phase 4 (after Phase 3 completes)
```

## File Ownership Matrix

| Phase | Files Owned |
|-------|-------------|
| 1 | `AppSidebar.tsx`, `AppLayout.tsx`, `AppHeader.tsx`, `appRoutes.tsx` |
| 2 | `Dashboard.tsx`, `pages/analytics/*` (new), `components/analytics/*` (new) |
| 3 | `NetworkWorkspace.tsx`, `pages/networks/*.tsx`, `shared/network-config.ts` (new) |
| 4 | `components/campaign-wizard/*` (new), network wizard files extracted from Phase 3 |
| 5 | `NetworkRules.tsx`, `Automation.tsx`, `shared/rule-conditions.ts` (new) |

## Key Dependencies

- Ant Design 6 (Table, Form, Tabs, Select, Drawer, Modal, Steps)
- Recharts (AreaChart, LineChart, BarChart, PieChart)
- React Router 7 (nested routes, useNavigate, useLocation)
- Mock data: `src/shared/mock-data.ts` (Campaign, AdSet, NetworkRule, etc.)
