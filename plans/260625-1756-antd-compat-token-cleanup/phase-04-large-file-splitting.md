---
phase: 4
title: "Large file splitting"
status: pending
priority: P3
dependencies: [phase-01, phase-03]
---

# Phase 4: Large file splitting

## Overview

Split the five files that exceed the 200-line frontend hard-rule. Focus on the two largest (`NetworkPortfolioWorkspace.tsx` at 1060 LOC, `AppDashboard.tsx` at 815 LOC) which co-locate render, data, and business logic. `CampaignLabs.tsx` (467 LOC) and `AxonWorkspace.tsx` (344 LOC) are secondary. `network-workspace-shell.tsx` (310 LOC) is borderline.

## Target files

| File | LOC | Split strategy |
|------|----:|---------------|
| `src/pages/NetworkPortfolioWorkspace.tsx` | 1060 | Extract 4 sub-components + 1 hook |
| `src/pages/AppDashboard.tsx` | 815 | Extract 3 sub-components + 1 hook |
| `src/pages/CampaignLabs.tsx` | 467 | Extract 2 sub-components |
| `src/pages/networks/AxonWorkspace.tsx` | 344 | Extract 1 sub-component |
| `src/components/networks/network-workspace-shell.tsx` | 310 | Extract 1 section component |

## Related Code Files

### `NetworkPortfolioWorkspace.tsx` → extract to:

```
src/pages/network-portfolio/
  index.tsx                          — shell (< 60 lines, imports sub-components)
  network-portfolio-kpi-strip.tsx    — top KPI row
  network-portfolio-table.tsx        — main data table + pagination
  network-portfolio-filters.tsx      — filter bar + search
  use-network-portfolio.ts           — all state, sort, filter, fetch logic
```

### `AppDashboard.tsx` → extract to:

```
src/pages/app-dashboard/
  index.tsx                          — shell (< 50 lines)
  app-dashboard-metrics.tsx          — KPI / stat cards section
  app-dashboard-chart.tsx            — trend chart section
  use-app-dashboard.ts               — data fetching + state
```

### `CampaignLabs.tsx` → extract to:

```
src/pages/campaign-labs/
  index.tsx                          — shell (< 60 lines)
  campaign-labs-editor.tsx           — config editor panel
  campaign-labs-preview.tsx          — preview/result panel
```

### `AxonWorkspace.tsx` → extract to:

```
src/pages/networks/axon/
  axon-workspace.tsx                 — renamed entry (< 120 lines)
  axon-workspace-tabs.tsx            — tab panel render
```

Update `src/routes/appRoutes.tsx` lazy import paths after move.

### `network-workspace-shell.tsx` → extract to:

```
src/components/networks/
  network-workspace-shell.tsx        — keep file; extract inner panel to:
  network-workspace-panel.tsx        — the panel/card section (reduces shell to < 150 lines)
```

## Implementation Steps

### Step 1 — `NetworkPortfolioWorkspace.tsx`

1. Create `src/pages/network-portfolio/` directory.
2. Extract all state + effects into `use-network-portfolio.ts`; hook returns the data and handlers page needs.
3. Extract KPI strip JSX → `network-portfolio-kpi-strip.tsx`.
4. Extract table JSX → `network-portfolio-table.tsx`.
5. Extract filter bar JSX → `network-portfolio-filters.tsx`.
6. Rewrite `index.tsx` as orchestrator: imports hook + sub-components, < 60 lines.
7. Update `appRoutes.tsx`: `lazy(() => import('./pages/network-portfolio'))`.

### Step 2 — `AppDashboard.tsx`

Same pattern:
1. Create `src/pages/app-dashboard/`.
2. Extract fetch/state to `use-app-dashboard.ts`.
3. Extract metrics cards → `app-dashboard-metrics.tsx`.
4. Extract chart → `app-dashboard-chart.tsx`.
5. Shell `index.tsx` < 50 lines.
6. Update route: `lazy(() => import('./pages/app-dashboard'))`.

### Step 3 — `CampaignLabs.tsx`

1. Create `src/pages/campaign-labs/`.
2. Extract editor panel → `campaign-labs-editor.tsx`.
3. Extract preview panel → `campaign-labs-preview.tsx`.
4. Shell `index.tsx` < 60 lines.
5. Update route.

### Step 4 — `AxonWorkspace.tsx` and `network-workspace-shell.tsx`

Simpler splits — no new directories needed:
- Move Axon tab panel JSX to `axon-workspace-tabs.tsx` in the same folder.
- Move network workspace card panel to `network-workspace-panel.tsx`.

### Step 5 — Verify routes and lazy imports

```bash
npm run build
```

Check that all lazy-loaded routes resolve correctly. TypeScript will catch broken imports immediately.

### Step 6 — File size verification

```bash
for f in src/pages/NetworkPortfolioWorkspace.tsx src/pages/AppDashboard.tsx src/pages/CampaignLabs.tsx src/pages/networks/AxonWorkspace.tsx src/components/networks/network-workspace-shell.tsx; do
  echo "$f"; wc -l "$f" 2>/dev/null || echo "  (moved/deleted)"
done
# Also check new files
find src/pages/network-portfolio src/pages/app-dashboard src/pages/campaign-labs -name "*.tsx" | xargs wc -l
```

All new files must be ≤ 200 lines.

## Success Criteria

- [ ] Original 5 files either deleted (replaced by directory) or reduced to ≤ 200 lines each.
- [ ] All new extracted files are ≤ 200 lines.
- [ ] `npm run build` passes — no broken imports.
- [ ] `npm run lint` passes.
- [ ] App routes load in browser without error (spot-check `/networks`, `/apps/:id/dashboard`, `/campaign-labs`).
- [ ] No business logic (API calls, sort/filter state) lives inside JSX-rendering components.

## Risk Assessment

- **Route lazy imports** — moving files breaks `appRoutes.tsx` unless updated atomically. Fix routes in the same commit as the file move.
- **Prop drilling** — extracted sub-components will need props passed down. Use the hook pattern to minimize prop count; accept up to 2 levels of prop passing per the frontend hard-rule.
- **Phase 4 is lowest priority** — if time-boxed, defer `AxonWorkspace.tsx` (344 lines, borderline) and tackle only the two 800+ LOC files first.
