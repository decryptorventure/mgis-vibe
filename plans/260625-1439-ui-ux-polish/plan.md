---
title: "NMS UI/UX Polish Sprint"
description: "Targeted fixes to reduce visual noise, improve hierarchy, and align components with ikame Core DS 1.1 data-dense SaaS patterns."
status: ready
priority: P1
created: 2026-06-25
---

# NMS UI/UX Polish Sprint

## Problem Statement

The app completed the AntD → ui-kit migration, but the UI is still _tokenized-but-not-system-designed_. Every surface is bordered, controls are heavy, and multiple filter strips compete before the user sees content. The overall effect reads as chaotic rather than a calm, data-dense operational tool.

Design system reference: **ikame Core DS 1.1** · **Data-Dense Dashboard** style (space-efficient, multiple data views, minimal padding, neutral hierarchy).

## Root Causes (from audit)

| # | Issue | Affected Files |
|---|-------|----------------|
| 1 | `FilterBar` has mandatory title + horizontal divider → heavy header | AppsList, NetworksList, MediaLibraries |
| 2 | KPI cells inside cards are double-bordered (`border` inside `Card`) | AppsList, NetworksList |
| 3 | `StatCard` left accent strip adds vertical-list feeling, not data card | Dashboard, AppDashboard |
| 4 | `PageHeader` icon uses raw CSS var per-page, no consistent variant | All pages |
| 5 | `AppSidebar` logo pulsing (`animate-pulse`) — decorative, meaningless | AppSidebar |
| 6 | MediaLibraries has 4 separate control surfaces before content | MediaLibraries |
| 7 | Dashboard section headers use inline `text-[var(--color-primary-500)]` | Dashboard.tsx |
| 8 | `CreativeGridCard` uses `picsum.photos` random photos as placeholders | creative-grid-card.tsx |
| 9 | NetworksList description paragraph makes cards unnecessarily tall | NetworksList |
| 10 | `StatCard` value at `text-[32px]` is too large for compact/dense context | StatCard.tsx |

## Design Principles to Apply

- **One border tier**: Cards have border. Content _inside_ cards does not border unless it's a nested surface (drawer, modal).
- **One primary CTA per screen**: Orange only on the page's main action.
- **Filter controls are utility**: FilterBar should be a sunken, compact toolbar — no header/divider, `bg_secondary` container.
- **Neutral icon tone on PageHeader**: All page headers use the same neutral icon box, not per-page colored backgrounds.
- **Semantic color only for state**: Status = success/error/warning. Network color = logo/chip accent only.
- **Tabular numbers** for all metrics/KPIs.

## Phases

| Phase | Name | Effort | Risk | Status |
|-------|------|--------|------|--------|
| 0 | [Quick Wins](./phase-00-quick-wins.md) | 1-2h | Low | Ready |
| 1 | [Component Refinements](./phase-01-component-refinements.md) | 3-4h | Low-Med | Ready |
| 2 | [Page Restructuring](./phase-02-page-restructuring.md) | 4-6h | Medium | Ready |
| 3 | [Polish & Consistency](./phase-03-polish-and-consistency.md) | 3h | Low | After Phase 2 |

## Acceptance Criteria

- [ ] No `animate-pulse` on structural/logo elements
- [ ] FilterBar renders as compact sunken toolbar — no mandatory title divider
- [ ] No double-bordered KPI cells inside Card containers
- [ ] StatCard left accent strip removed from `default` variant
- [ ] All PageHeader icons use neutral token, not per-page raw CSS var
- [ ] MediaLibraries: max 2 control surfaces before content
- [ ] Dashboard section labels use semantic token classes only
- [ ] `npm run build` passes after each phase
