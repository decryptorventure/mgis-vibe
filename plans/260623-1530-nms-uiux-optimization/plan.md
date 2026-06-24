---
title: "NMS UI/UX Optimization — Brainstorm Implementation"
description: "Implement 12 targeted UI/UX improvements: tab overflow, bulk actions, inline editing, context switcher, delta KPI, persistent filters, slide-in drawer, full-page wizard, command palette, rule card UI"
status: in-progress
priority: P1
effort: 14-18h
tags: [ui, ux, navigation, campaign-ops, quick-wins]
blockedBy: []
blocks: []
extends: 260610-1705-nms-fe-uiux-upgrade
created: 2026-06-23
---

# NMS UI/UX Optimization

## Overview

12 targeted improvements chia làm 4 phases dựa trên brainstorm session 2026-06-23.
Pain point #1 được xác nhận: **Navigation phức tạp, quá nhiều clicks**.
Daily ops: campaign adjustment, campaign creation, performance check.

**Predecessor plan:** `../260610-1705-nms-fe-uiux-upgrade/plan.md` — covers broad architecture redesign.
Phase 3 của predecessor (Network Workspace Standardization) đã được implement phần lớn (shell, configs, campaign table đều có). Plan này build ON TOP OF kết quả đó.

## Phases

| Phase | Name | Effort | Parallelism | Status |
|-------|------|--------|-------------|--------|
| 0 | [Quick Wins](./phase-00-quick-wins.md) | 2-3d | Independent — deploy alone | Completed |
| 1 | [Context Switcher & Persistent State](./phase-01-context-switcher.md) | 2-3d | Independent after Phase 0 | Completed |
| 2 | [Campaign Operations UX](./phase-02-campaign-ops-ux.md) | 3-4d | After Phase 0 | Completed |
| 3 | [Advanced — Wizard, ⌘K, Rules, Reports](./phase-03-advanced.md) | 5-8d | After Phase 1+2 | Pending |

## Execution Strategy

```
Phase 0 (Quick Wins — independent, deployable alone)
    ├── Phase 1 (Context Switcher)   ─┐
    └── Phase 2 (Campaign Ops UX)   ─┤── parallel
                                      └── Phase 3 (Advanced — post-validation)
```

## File Ownership Matrix

| Phase | Files Owned |
|-------|-------------|
| 0 | `network-workspace-shell.tsx`, `network-campaign-table.tsx`, `StatusBadge.tsx`, dashboard KPI components |
| 1 | `AppHeader.tsx`, Redux store (filter slice), `AppSidebar.tsx` |
| 2 | `network-campaign-table.tsx` (inline edit, bulk bar), new `campaign-edit-drawer.tsx` |
| 3 | `appRoutes.tsx`, new wizard route pages, new command palette component, automation components |

## Key Decisions

1. **Tab overflow → "More" dropdown** thay vì side nav (ít refactor hơn, compatible với extraTabs pattern)
2. **Context Switcher in Header** (App + Network dropdowns) thay vì NetworkContextBar riêng (UI gọn hơn)
3. **Inline editing chỉ cho budget/bid/name** — complex validation fields vẫn dùng drawer
4. **Edit drawer thay modal** — giữ table context visible, không full-page (phase 3 mới có full-page wizard cho CREATE)
5. **Delta indicators** chỉ khi data có prev period — không fake nếu không có data
