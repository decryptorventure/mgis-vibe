---
phase: 3
title: "Filter & State Persistence"
status: pending
priority: P2
dependencies: [phase-02]
---

# Phase 03: Filter & State Persistence

## Overview

Every filterable view in the app must persist its filter/sort state across page refresh and navigation. Currently `use-persistent-filter.ts` exists but is inconsistently applied. This phase standardizes filter persistence, adds "Clear all filters" shortcut everywhere, and preserves scroll position and tab state on back-navigation.

## Requirements

### Filter Persistence — Audit & Standardize

Pages that use `usePersistentFilter` ✓ vs need it:
| Page | Current | Action |
|------|---------|--------|
| `MediaLibraries` (creative library) | Partial (search only) | Add network/format/performance filters |
| `AppsList` | None | Add OS + status filter |
| `NetworksList` | None | Add network status filter |
| `AppAutomationRules` | None | Add network + status filter |
| `KeyManagement` | None | Add status + network filter |
| `Automation` (global history) | None | Add network filter |
| `Dashboard` (global) | Partial (platform) | Add user/action/date filters |
| Network workspaces | Partial | Standardize all filter keys |

Filter key naming convention: `{pageId}_filters_v1` (e.g. `media_lib_filters_v1`, `apps_list_filters_v1`).

### Clear All Filters — Universal Shortcut

Every `FilterBar` must have a "Clear all" button that:
- Only renders when ≥1 filter is non-default
- Resets all filters to defaults + clears localStorage entry
- Already exists in some filter bars — audit and enforce everywhere

Pattern:
```tsx
{hasActiveFilters && (
  <Button variant="ghost" size="s" onClick={clearAll} className="text_tertiary hover:fg_error gap-1">
    <X size={12} /> Clear all
  </Button>
)}
```

### Tab State Preservation

When user switches between app-scoped network tabs (Google Ads → Meta → back to Google Ads):
- The previously active sub-tab (e.g. "Insights" vs "Campaigns") must be restored
- Store in `sessionStorage` (not localStorage — intentionally resets on close): `${networkId}_active_tab`
- Scroll position within the campaign table: store in `sessionStorage` as `${networkId}_scroll`

### Network Context Bar — Quick Switch State

When user quick-switches networks via `NetworkContextBar`:
- Do NOT reset filter state (current behavior may reset)
- Preserve search text when switching between networks of the same app
- Restore last-viewed campaign (if detail panel was open, close it gracefully)

### Breadcrumb Accuracy

`getBreadcrumbItems()` in `src/shared/navigation.ts` — fix two gaps:
1. Portfolio view (`/networks/:networkId` with no appId) currently shows wrong breadcrumb — add "Portfolio" label
2. Analytics sub-pages (`/analytics/split-metrics`, `/analytics/cost-center`) missing breadcrumb items

### App Dashboard — Date Range Persistence

`AppDashboard` date range picker currently resets on each visit.
Save selected range to `localStorage`: `app_dashboard_date_${appId}`.
Default: last 7 days.

### Notification Drawer — Unread Persistence

When user closes and reopens the notification drawer:
- "Read" notifications remain marked as read (don't reset to all-unread)
- Persist read state to `localStorage`: `nms_notifications_read_v1` (array of read IDs)
- "Mark all as read" clears the unread badge on the bell icon

## Files to Modify

| File | Change |
|------|--------|
| `src/shared/hooks/use-persistent-filter.ts` | Add `sessionStorage` variant + `clearAll` helper |
| `src/pages/MediaLibraries.tsx` | Add format + performance filter persistence |
| `src/pages/AppsList.tsx` | Add OS + status filter with persistence |
| `src/pages/NetworksList.tsx` | Add status filter with persistence |
| `src/pages/AppAutomationRules.tsx` | Add network + status filter persistence |
| `src/pages/KeyManagement.tsx` | Add filter persistence |
| `src/pages/Automation.tsx` | Add network filter persistence |
| `src/pages/Dashboard.tsx` | Complete filter persistence (user/action/date) |
| `src/components/layout/NetworkContextBar.tsx` | Preserve filter on quick-switch |
| `src/components/layout/NotificationDrawer.tsx` | Persist read state |
| `src/components/ui/FilterBar.tsx` | Enforce "Clear all" button visibility |
| `src/shared/navigation.ts` | Fix portfolio + analytics breadcrumbs |
| `src/pages/app-dashboard/index.tsx` | Date range persistence |
| `src/pages/networks/*.tsx` | Tab + scroll position via sessionStorage |

## Implementation Steps

### 1. Extend `use-persistent-filter.ts`

```ts
// Add session-only variant
export function useSessionFilter<T>(key: string, defaults: T) {
  const [state, setState] = useState<T>(() => {
    try { return JSON.parse(sessionStorage.getItem(key) ?? 'null') ?? defaults; }
    catch { return defaults; }
  });
  useEffect(() => { sessionStorage.setItem(key, JSON.stringify(state)); }, [state, key]);
  const clearAll = useCallback(() => {
    sessionStorage.removeItem(key);
    setState(defaults);
  }, [key, defaults]);
  return [state, setState, clearAll] as const;
}
```

### 2. Filter persistence pattern (apply to each page)

```tsx
// Example: AppsList
const [filters, setFilters, clearFilters] = usePersistentFilter('apps_list_filters_v1', {
  os: 'all',
  status: 'all',
  search: '',
});
const hasActiveFilters = filters.os !== 'all' || filters.status !== 'all' || filters.search !== '';
```

### 3. Tab state preservation

```tsx
// In each NetworkWorkspace component
const TAB_KEY = `${networkId}_active_tab`;
const [activeTab, setActiveTab] = useState(
  () => sessionStorage.getItem(TAB_KEY) ?? 'campaigns'
);
const handleTabChange = (tab: string) => {
  setActiveTab(tab);
  sessionStorage.setItem(TAB_KEY, tab);
};
```

### 4. Scroll restoration

```tsx
const SCROLL_KEY = `${networkId}_scroll`;
const tableRef = useRef<HTMLDivElement>(null);

useLayoutEffect(() => {
  const saved = sessionStorage.getItem(SCROLL_KEY);
  if (saved && tableRef.current) tableRef.current.scrollTop = parseInt(saved);
}, []);

const handleScroll = useCallback(
  debounce((e: UIEvent) => {
    sessionStorage.setItem(SCROLL_KEY, String((e.target as HTMLElement).scrollTop));
  }, 200),
  [SCROLL_KEY]
);
```

### 5. Notification read state

```tsx
const NOTIFICATIONS_READ_KEY = 'nms_notifications_read_v1';
const [readIds, setReadIds] = useState<string[]>(
  () => JSON.parse(localStorage.getItem(NOTIFICATIONS_READ_KEY) ?? '[]')
);
const markRead = (id: string) => {
  setReadIds(prev => { const next = [...new Set([...prev, id])]; localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(next)); return next; });
};
const markAllRead = () => {
  const all = notifications.map(n => n.id);
  setReadIds(all);
  localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(all));
};
const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;
```

## Success Criteria

- [ ] Refreshing any filterable page restores the last active filters
- [ ] "Clear all" button appears in FilterBar whenever ≥1 filter is non-default, resets all
- [ ] Network quick-switch via context bar preserves the search text
- [ ] Navigating app tabs (Google → Meta → Google) restores last sub-tab on return
- [ ] Campaign table scroll position restored on back-navigation
- [ ] Notification bell badge reflects actual unread count; "Mark all read" clears it
- [ ] Closing + reopening notification drawer shows same read/unread state
- [ ] Dashboard date range picker restores last selection per app
- [ ] Breadcrumbs correct for Portfolio view and all Analytics sub-pages
- [ ] `npm run build` passes with 0 errors

## Risk Assessment

- **sessionStorage scope**: Tab state reset on browser close is intentional — do not use localStorage for tab state (would restore stale state from days ago).
- **Scroll restoration race**: `useLayoutEffect` must fire before the browser's own scroll reset. In React Router, ensure `scrollRestoration: 'manual'` in the router config if not already set.
- **Debounce import**: `use-persistent-filter.ts` may not currently import lodash debounce — implement inline to avoid adding dependency.
- **`clearAll` breaking existing call sites**: `usePersistentFilter` currently returns `[state, setState]` — adding `clearAll` as third element is backward-compatible (existing destructures `[state, setState]` ignore the third).
