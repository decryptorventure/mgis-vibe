---
phase: 2
title: "Data Display & Tables"
status: pending
priority: P1
dependencies: [phase-01]
---

# Phase 02: Data Display & Tables

## Overview

Systematic audit and repair of all list/table/grid views: empty states, loading skeletons, bulk selection, column management, and lazy loading. Affects every network workspace, creative library, permissions, and analytics pages.

## Requirements

### Empty States
All tables/lists must show `EmptyState` component when:
- No data matches filters (with "Clear filters" action)
- No data exists at all (with primary CTA e.g. "Create campaign")
- API/network error (with retry action)

Pages missing correct empty states:
- `MetaWorkspace` campaign/adset/ad table when filtered → 0 results
- `AxonWorkspace` creative perf tab
- `Permissions` matrix when no users
- `KeyManagement` when no keys
- `AppAutomationRules` when network filter returns 0 rules
- Analytics pages (`SplitMetricsPage`, `CostCenterPage`) with no data

### Loading Skeletons
Replace full-page `LoadingSpinner` with per-section skeletons for:
- Network workspace campaign table (skeleton rows, not overlay)
- App Dashboard KPI cards (skeleton cards)
- Creative library grid (skeleton cards)
- Notification drawer (skeleton list items)
- Rule history table

Skeleton row pattern:
```tsx
// Use ui-kit Skeleton or a simple div approach
<div className="h-4 bg_secondary radius_4 animate-pulse w-3/4" />
```

### Bulk Actions — Creative Library
- Add checkbox column (visible on hover of any card in grid mode; visible always in list mode)
- When ≥1 selected: float a `BulkActionBar` above the grid with count + "Delete selected" + "Clear selection"
- "Delete selected" opens existing `CreativeBulkRemoveModal`
- `BulkActionBar`: fixed bottom bar, `bg_primary border-t border_secondary shadow-lg`, z-index 50

### Bulk Actions — Permissions Page
- "Select all" checkbox in user list header
- "Assign all permissions" / "Remove all permissions" buttons in permissions grid header
- Confirmation toast: "Permissions updated for N users"

### Column Visibility — Meta Workspace
`meta-column-settings-drawer.tsx` already exists — ensure it's wired to the table renderer.
- Default visible: campaign name, status, budget, spend, impressions, clicks, installs, ROAS, CPA
- Hidden by default: bid strategy, frequency cap, placement breakdown columns
- "Save as preset" not needed (out of scope)

### Column Visibility — Axon Workspace
Add a simple column toggle dropdown (button `Columns ⌄`) in the workspace filter bar.
Store visible columns in localStorage: `axon_columns_v1`.

### Table State Persistence
- Sort order (column + direction): save to `localStorage` keyed by `${networkId}_sort_v1`
- Scroll position: restore via `useLayoutEffect` + `scrollTo` on component mount using saved position

### Creative Library — Virtual Scroll
When grid has >50 items, render only visible rows (use CSS `content-visibility: auto` with `contain-intrinsic-size` as a lightweight alternative to a virtual scroll library):
```tsx
// Per card:
style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}
```
This requires no new dependencies and gives browser-native lazy rendering.

### App Dashboard — Refresh Button
Add `<Button variant="ghost" size="s" onClick={refetch}><RefreshCw size={14} /></Button>` in `AppDashboard` header alongside the date range picker.
Show `animate-spin` class on the icon while loading.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/networks/meta/meta-report-table.tsx` | Empty state for filter → 0 results |
| `src/components/networks/axon/axon-creative-perf-tab.tsx` | Empty state + column toggle |
| `src/pages/Permissions.tsx` | Select all + bulk permission UX |
| `src/pages/KeyManagement.tsx` | Empty state (no keys) |
| `src/components/automation/NetworkWorkspaceAutomationRules.tsx` | Empty state filtered |
| `src/pages/MediaLibraries.tsx` | Bulk action bar, virtual scroll CSS, skeleton cards |
| `src/components/creative/creative-grid-card.tsx` | Hover-reveal checkbox |
| `src/pages/app-dashboard/index.tsx` | Refresh button |
| `src/pages/app-dashboard/app-dashboard-metrics.tsx` | Skeleton cards during load |
| `src/components/networks/network-campaign-table.tsx` | Skeleton rows, sort persistence |
| `src/components/networks/meta/meta-column-settings-drawer.tsx` | Wire to table renderer |
| `src/components/layout/NotificationDrawer.tsx` | Skeleton list items |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/BulkActionBar.tsx` | Shared floating bulk action bar (≤60 LOC) |

## Implementation Steps

### 1. EmptyState pattern (consistent)

All empty states use existing `EmptyState` component:
```tsx
<EmptyState
  icon={<Search size={32} />}
  title="No campaigns match your filters"
  description="Try adjusting your search or clearing the active filters."
  action={<Button variant="border" size="s" onClick={clearFilters}>Clear filters</Button>}
/>
```

For error state:
```tsx
<EmptyState
  icon={<AlertCircle size={32} className="fg_error" />}
  title="Failed to load data"
  description="Check your connection and try again."
  action={<Button variant="border" size="s" onClick={retry}>Retry</Button>}
/>
```

### 2. BulkActionBar component

```tsx
// src/components/ui/BulkActionBar.tsx
interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  actions: { label: string; icon?: ReactNode; onClick: () => void; variant?: 'danger' | 'default' }[];
}
// Fixed bottom bar, z-50, slides up when count > 0 (translate-y-0), hidden when 0 (translate-y-full)
// Uses CSS transition for smooth show/hide
```

### 3. Creative Library checkbox state

In `MediaLibraries.tsx`:
```tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const toggle = (id: string) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
const clearSelection = () => setSelectedIds(new Set());
```

Pass `selected={selectedIds.has(item.id)}` and `onSelect={toggle}` to each `CreativeGridCard`.
`CreativeGridCard` shows checkbox only on `hover` (group-hover) or when `selected`.

### 4. Sort persistence

```tsx
// In network-campaign-table.tsx
const SORT_KEY = `${networkId}_sort_v1`;
const [sortState, setSortState] = useState(() => {
  try { return JSON.parse(localStorage.getItem(SORT_KEY) ?? 'null') ?? { col: 'spend', dir: 'desc' }; }
  catch { return { col: 'spend', dir: 'desc' }; }
});
useEffect(() => { localStorage.setItem(SORT_KEY, JSON.stringify(sortState)); }, [sortState, SORT_KEY]);
```

### 5. Skeleton rows

```tsx
// Reusable skeleton row for table
const SkeletonRow = () => (
  <tr className="border-b border_secondary">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-3 py-2.5">
        <div className={`h-3.5 bg_secondary radius_4 animate-pulse ${i === 0 ? 'w-40' : 'w-16'}`} />
      </td>
    ))}
  </tr>
);
// When loading: render 6 x SkeletonRow instead of spinner overlay
```

## Success Criteria

- [ ] Every table/grid shows a meaningful EmptyState (not blank) when 0 results — filtered + unfiltered + error
- [ ] Network campaign table shows skeleton rows (not spinner) during initial load
- [ ] Creative library: checkbox appears on card hover; BulkActionBar slides in when ≥1 selected
- [ ] "Delete selected" in BulkActionBar opens bulk remove modal with selected count
- [ ] Permissions page has "Select all" checkbox and bulk grant/revoke buttons
- [ ] Meta workspace table renders only default visible columns; column drawer toggles visibility
- [ ] Axon workspace has column toggle button; visible set persists across refresh
- [ ] Table sort order persists per network across page refresh
- [ ] App Dashboard has refresh button that triggers reload + spin animation
- [ ] Creative grid renders smoothly with 100+ items (contentVisibility CSS applied)
- [ ] `npm run build` passes with 0 errors

## Risk Assessment

- **BulkActionBar z-index**: must be below Drawer (z-[200]) — use z-50. Safe.
- **Column visibility in meta**: `meta-column-settings-drawer.tsx` may need state lifted to parent `MetaWorkspace` or stored in localStorage. Prefer localStorage to avoid prop drilling.
- **contentVisibility CSS**: requires Chrome 85+ / Firefox 125+ — acceptable for internal B2B tool.
- **Checkbox in CreativeGridCard**: adds group-hover dependency; existing `hoverable` class on `Card` may need `group` added to wrapper.
