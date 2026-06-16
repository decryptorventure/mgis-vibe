# Phase 2: Analytics Hub — Dashboard + Cost Center + Split Metrics

**Priority:** P1 — Highest business value  
**Status:** Pending  
**Effort:** ~12h  
**Parallelism:** Runs after Phase 1; independent of Phases 3, 4, 5

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm report: `../reports/brainstorm-260610-1705-nms-fe-uiux-upgrade.md`
- Market research: `../reports/researcher-260610-1708-mobile-ad-network-ux-patterns.md`
- Current Dashboard: `src/pages/Dashboard.tsx` (828 lines — full refactor)
- Phase 1 placeholder pages: `src/pages/analytics/CostCenterPage.tsx`, `src/pages/analytics/SplitMetricsPage.tsx`

## Overview

Replace the current activity-log-heavy dashboard with a **3-view Analytics Hub**. Refactor `Dashboard.tsx` into a Funnel View. Fill Phase 1's placeholder pages with full Cost Center and Split Metrics implementations.

## Key Insights

- Current `Dashboard.tsx` (828 lines) mixes: KPI cards, area chart, pie chart, leaderboard, activity logs — too much cognitive load
- New architecture: Dashboard = Funnel metrics + network comparison. Cost Center and Split Metrics are separate pages accessible from sidebar
- `Campaign` interface already has `spend`, `budget`, `installs`, `cpa`, `roas` fields — sufficient for funnel
- No new mock data interfaces needed; add `costCenter` field to `Campaign` and `Project` for Cost Center grouping
- Split Metrics pivot: pure UI computation from existing mock data — no new data needed

## Requirements

### Functional

**Dashboard (Funnel View)**
- KPI funnel: Total Spend → Total Installs → Avg CPA → Avg ROAS
- Network comparison cards: side-by-side per-network KPIs (spend, installs, CPA, ROAS)
- Trend area chart (7d/30d/90d toggle)
- Budget pacing bar per network (spend / budget %)
- Keep leaderboard + activity log but move to collapsible secondary section

**Cost Center Page**
- Table: Cost Center Name × Network × Spend × Budget × Budget Used % × Pacing Status
- Pacing status: `On Track` / `At Risk` (>80%) / `Overspent` (>100%)
- Filter: by date range, by network, by cost center name
- Summary row: total spend across all centers

**Split Metrics Page (Pivot Table)**
- Metric selector: CPA | ROAS | Installs | Spend | CTR
- Row dimension: Network | Country | Creative Type | Status
- Column dimension: Network | Country | Creative Type | Status | Date Range
- Table renders metric value at intersection
- Color scale: green (good) → red (bad) based on metric type
- Export button (CSV)

### Non-Functional
- Dashboard initial render < 2s with mock data
- Split Metrics table handles 5×5 = 25 cells without layout overflow
- No new npm dependencies (use Recharts already installed)

## Architecture

```
src/pages/
├── Dashboard.tsx              (refactored — Funnel View)
└── analytics/
    ├── CostCenterPage.tsx     (filled from Phase 1 placeholder)
    └── SplitMetricsPage.tsx   (filled from Phase 1 placeholder)

src/components/analytics/     (NEW directory)
├── network-comparison-cards.tsx
├── budget-pacing-bar.tsx
├── split-metrics-pivot-table.tsx
└── funnel-kpi-strip.tsx

src/shared/mock-data.ts        (add costCenter field to Campaign)
```

### Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│ [Spend]  [Installs]  [Avg CPA]  [Avg ROAS]      │  ← FunnelKpiStrip
├──────────────────┬──────────────────────────────┤
│ Network Cards    │ Trend Chart (7d/30d/90d)      │  ← NetworkComparisonCards
│ [G] [M] [A] [X] │ (AreaChart - Recharts)        │
│ [Mo]             │                               │
├──────────────────┴──────────────────────────────┤
│ Budget Pacing                                    │  ← BudgetPacingBar × 5
│ Google  ████████░░  82%  [At Risk]              │
│ Meta    ████████████  105%  [Overspent]          │
├─────────────────────────────────────────────────┤
│ ▶ Activity & Leaderboard (collapsible)           │  ← Kept from current Dashboard
└─────────────────────────────────────────────────┘
```

### Cost Center Table

```
src/shared/mock-data.ts — add to Campaign interface:
  costCenter?: string; // 'UA Team' | 'Growth Team' | 'Brand Team'

Mock cost center data shape:
interface CostCenterRow {
  center: string;
  network: string;
  spend: number;
  budget: number;
  pct: number;      // spend/budget * 100
  status: 'on-track' | 'at-risk' | 'overspent';
}
```

### Split Metrics Pivot

```typescript
// Pure computation — no new data needed
function buildPivot(
  campaigns: Campaign[],
  metric: 'cpa' | 'roas' | 'installs' | 'spend',
  rowDim: 'network' | 'status',
  colDim: 'network' | 'status',
): Record<string, Record<string, number>> {
  // group campaigns by rowDim × colDim, aggregate metric
}
```

## Related Code Files

### Modify
- `src/pages/Dashboard.tsx` — full refactor to Funnel View layout (keep leaderboard/logs in collapsible)
- `src/shared/mock-data.ts` — add `costCenter` field to `Campaign` interface + mock values

### Create
- `src/components/analytics/funnel-kpi-strip.tsx`
- `src/components/analytics/network-comparison-cards.tsx`
- `src/components/analytics/budget-pacing-bar.tsx`
- `src/components/analytics/split-metrics-pivot-table.tsx`
- `src/pages/analytics/CostCenterPage.tsx` (replace Phase 1 placeholder)
- `src/pages/analytics/SplitMetricsPage.tsx` (replace Phase 1 placeholder)

### No Change
- `src/routes/appRoutes.tsx` — routes already added in Phase 1
- `src/components/layout/*` — no changes needed

## Implementation Steps

1. **Add `costCenter` to mock data**
   - In `mock-data.ts`: add `costCenter?: string` to `Campaign` interface
   - Assign mock values: `'UA Team'`, `'Growth Team'`, `'Brand Team'` across existing campaigns

2. **Create `funnel-kpi-strip.tsx`**
   - Props: `campaigns: Campaign[]`
   - Computes: total spend, total installs, avg CPA (total spend / total installs), avg ROAS
   - Renders: 4 `StatCard` components in a horizontal strip
   - Add trend indicator (vs previous period — use hardcoded mock delta for now)

3. **Create `network-comparison-cards.tsx`**
   - Props: `campaigns: Campaign[]`
   - Groups by network, computes per-network: spend, installs, CPA, ROAS
   - Renders: 5 compact cards (one per network) with colored left border (network brand color)
   - Shows top-performing network badge

4. **Create `budget-pacing-bar.tsx`**
   - Props: `campaigns: Campaign[]` (or pre-computed per-network totals)
   - Groups by network: sum spend, sum budget
   - Renders: horizontal progress bar per network with `pct%` label and `status` badge
   - Status threshold: < 80% = `On Track` (green), 80-100% = `At Risk` (yellow), > 100% = `Overspent` (red)

5. **Refactor `Dashboard.tsx`**
   - Remove: current 6-card KPI row, standalone area chart, pie chart, standalone leaderboard section
   - Add: `<FunnelKpiStrip>`, `<NetworkComparisonCards>`, `<BudgetPacingBar>`
   - Wrap existing leaderboard + activity log in Ant Design `<Collapse>` with `defaultActiveKey={[]}` (collapsed by default)
   - Keep all existing filtering/leaderboard logic intact — just repositioned

6. **Create `split-metrics-pivot-table.tsx`**
   - Local state: `metric` (default: `'cpa'`), `rowDim` (default: `'network'`), `colDim` (default: `'status'`)
   - `buildPivot()` pure function: groups campaigns, aggregates metric
   - Ant Design `Table` with dynamic columns built from `colDim` unique values
   - Cell color: for CPA/CPM — red=high, green=low; for ROAS/Installs — green=high, red=low
   - Color via inline style: `backgroundColor: interpolateColor(value, min, max, isInverted)`
   - Toolbar: metric selector (`Select`), row dim (`Select`), col dim (`Select`), export CSV button

7. **Create `SplitMetricsPage.tsx`**
   - `<PageHeader>` + `<SplitMetricsPivotTable campaigns={mockCampaigns} />`

8. **Create `CostCenterPage.tsx`**
   - Derive `CostCenterRow[]` from `mockCampaigns` grouped by `costCenter × network`
   - `<PageHeader>` + filter bar (network Select, date range DatePicker) + Ant Design `Table`
   - Table columns: Cost Center | Network | Spend | Budget | % Used | Pacing Status
   - Summary row using Ant Design `Table` `summary` prop

## Todo List

- [ ] Add `costCenter` field to `Campaign` in `mock-data.ts` with mock values
- [ ] Create `funnel-kpi-strip.tsx`
- [ ] Create `network-comparison-cards.tsx`
- [ ] Create `budget-pacing-bar.tsx`
- [ ] Refactor `Dashboard.tsx` — replace top section with new components
- [ ] Wrap existing leaderboard/activity log in Collapse
- [ ] Create `split-metrics-pivot-table.tsx` with `buildPivot()` logic
- [ ] Create `SplitMetricsPage.tsx`
- [ ] Create `CostCenterPage.tsx` with grouping logic
- [ ] Verify no TypeScript compile errors

## Success Criteria

- Dashboard loads in < 2s, shows Funnel KPIs + Network Cards + Budget Pacing
- Activity log still accessible (collapse open)
- Cost Center page shows table with correct grouping by center × network
- Pacing status highlights correctly (red for overspent)
- Split Metrics pivot renders with color scale; changing metric/dim updates table
- All new components < 200 lines each (modular)
- No console errors

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `Dashboard.tsx` refactor breaks existing filter/leaderboard logic | Medium | Keep leaderboard logic in same file, only move JSX into Collapse; test click-to-filter behavior |
| Pivot table column count > viewport width | Low | `scroll={{ x: 'max-content' }}` on Ant Design Table |
| `interpolateColor()` function produces invalid CSS | Low | Clamp values to [0,1] before interpolation; test edge cases (zero spend) |

## Security Considerations

- All data is mock/internal — no PII handling concerns
- Export CSV: client-side only, no server call needed
