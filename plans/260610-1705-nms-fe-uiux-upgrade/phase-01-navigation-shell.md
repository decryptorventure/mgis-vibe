# Phase 1: Navigation Shell & Network Context Bar

**Priority:** P0 — Foundation for all other phases  
**Status:** Pending  
**Effort:** ~6h  
**Parallelism:** Sequential — must complete before Phases 2, 3, 5

## Context Links

- Plan overview: [plan.md](./plan.md)
- Current sidebar: `src/components/layout/AppSidebar.tsx`
- Current layout: `src/components/layout/AppLayout.tsx`
- Current header: `src/components/layout/AppHeader.tsx`
- Current routes: `src/routes/appRoutes.tsx`

## Overview

Restructure the sidebar navigation and add a **Network Context Bar** — a persistent top-of-content strip that shows the active network and allows quick-switch without returning to sidebar. This is the structural foundation all other phases depend on.

## Key Insights

- `AppSidebar.tsx` currently has networks NOT in the sidebar menu — they're accessed via Campaign Labs. All 5 networks (`/google-ads`, `/meta`, `/asa`, `/axon`, `/moloco`) resolve `getSelectedKey()` to `/campaign-labs`.
- Network Context Bar is new — needs a new component and integration into `AppLayout`.
- Routes stay the same (`/google-ads`, etc.) — only navigation UX changes.
- `getPageTitle()` needs updating to return network-specific titles.

## Requirements

### Functional
- Sidebar groups: Overview | Campaign Labs (with network sub-items) | Analytics | Media | Automation | Settings
- Network sub-items under Campaign Labs: Google Ads, Meta, ASA, Axon, Moloco
- When inside a network workspace (`/google-ads`, `/meta`, etc.), show **Network Context Bar** below header
- Network Context Bar: network icon + name + quick-switch tabs (all 5 networks)
- Breadcrumb: Dashboard > Campaign Labs > [Network Name]
- `getPageTitle()` returns correct title per route

### Non-Functional
- No regression on mobile drawer behavior
- Sidebar collapse still works (< 1024px)
- No new npm dependencies

## Architecture

```
AppLayout
├── AppSidebar (updated menu items + sub-group)
├── AppHeader (updated page title logic)
├── NetworkContextBar (NEW — shown only on /google-ads, /meta, /asa, /axon, /moloco)
│   ├── Network icon + name badge
│   └── Quick-switch tabs (Google | Meta | ASA | Axon | Moloco)
└── Content (Outlet)
```

### Sidebar Menu Structure (new)

```typescript
const menuItems = [
  { key: '/', icon: <LayoutDashboard />, label: 'Overview' },
  {
    key: 'campaign-labs-group',
    icon: <FlaskConical />,
    label: 'Campaign Labs',
    children: [
      { key: '/campaign-labs', icon: <Grid3x3 />, label: 'All Networks' },
      { key: '/google-ads', icon: <NetworkIcon />, label: 'Google Ads' },
      { key: '/meta', icon: <NetworkIcon />, label: 'Meta' },
      { key: '/asa', icon: <NetworkIcon />, label: 'Apple Search Ads' },
      { key: '/axon', icon: <NetworkIcon />, label: 'Axon / AppLovin' },
      { key: '/moloco', icon: <NetworkIcon />, label: 'Moloco' },
    ],
  },
  {
    key: 'analytics-group',
    icon: <BarChart3 />,
    label: 'Analytics',
    children: [
      { key: '/analytics/cost-center', label: 'Cost Center' },
      { key: '/analytics/split-metrics', label: 'Split Metrics' },
      { key: '/predictions', label: 'AI Predictions' },
    ],
  },
  { key: '/media-libraries', icon: <Library />, label: 'Media Libraries' },
  {
    key: 'settings-group',
    icon: <Settings />,
    label: 'Settings',
    children: [
      { key: '/network-rules', label: 'Network Rules' },
      { key: '/automation', label: 'Automation' },
      { key: '/key-management', label: 'Key Management' },
      { key: '/permissions', label: 'Permissions' },
    ],
  },
];
```

### NetworkContextBar Component

```typescript
// src/components/layout/NetworkContextBar.tsx
interface NetworkContextBarProps {
  activeNetwork: string; // 'google-ads' | 'meta' | 'asa' | 'axon' | 'moloco'
}

const NETWORKS = [
  { key: 'google-ads', label: 'Google Ads', color: '#4285F4' },
  { key: 'meta',       label: 'Meta',       color: '#1877F2' },
  { key: 'asa',        label: 'Apple ASA',  color: '#000000' },
  { key: 'axon',       label: 'Axon',       color: '#FF6B35' },
  { key: 'moloco',     label: 'Moloco',     color: '#7C3AED' },
];
```

## Related Code Files

### Modify
- `src/components/layout/AppSidebar.tsx` — update `menuItems`, `getSelectedKey()`, `getPageTitle()`
- `src/components/layout/AppLayout.tsx` — add `NetworkContextBar` rendering logic (show when on network routes)
- `src/components/layout/AppHeader.tsx` — update page title display
- `src/routes/appRoutes.tsx` — add `/analytics/cost-center` and `/analytics/split-metrics` routes (pointing to placeholder pages for now)

### Create
- `src/components/layout/NetworkContextBar.tsx` — new network switcher bar
- `src/pages/analytics/CostCenterPage.tsx` — placeholder (Phase 2 fills content)
- `src/pages/analytics/SplitMetricsPage.tsx` — placeholder (Phase 2 fills content)

## Implementation Steps

1. **Update `menuItems` in `AppSidebar.tsx`**
   - Replace flat network links with grouped `campaign-labs-group` containing sub-items for each network
   - Add `analytics-group` sub-menu with Cost Center, Split Metrics, AI Predictions
   - Remove `axon-reports` and `meta-errors` from top level → move to network-specific workspace (Phase 3)
   - Update `change-logs` and `upload-monitor` to be under a future "Operations" group or keep in sidebar as-is (keep for now)

2. **Update `getSelectedKey()` in `AppSidebar.tsx`**
   - Network routes (`/google-ads`, `/meta`, etc.) should now select their own key, NOT `/campaign-labs`
   - `/analytics/*` routes should select correctly

3. **Update `getPageTitle()` in `AppSidebar.tsx`**
   - Return network label for network routes: `'/google-ads' → 'Google Ads'`, etc.
   - Return `'Cost Center'`, `'Split Metrics'` for analytics routes

4. **Create `NetworkContextBar.tsx`**
   - Accept `activeNetwork` prop
   - Render: colored dot + network name badge on left, tab strip (all 5 networks) on right
   - Active tab highlighted with network's brand color
   - On tab click: `navigate(/network-key)`
   - Height: `40px`, subtle border-bottom, `var(--surface-base)` background

5. **Update `AppLayout.tsx`**
   - Detect if current route is a network workspace: `NETWORK_ROUTES.includes(pathname)`
   - If yes: render `<NetworkContextBar activeNetwork={networkFromPath} />` between `AppHeader` and `Content`
   - Extract `networkFromPath` from `location.pathname`

6. **Add placeholder pages** (`CostCenterPage.tsx`, `SplitMetricsPage.tsx`)
   - Simple `<PageHeader>` + "Coming in Phase 2" `<EmptyState>` component
   - Add routes in `appRoutes.tsx`: `{ path: 'analytics/cost-center', element: <CostCenterPage /> }`

7. **Verify mobile behavior** — confirm Drawer still works, new submenu groups are properly collapsible

## Todo List

- [ ] Update `menuItems` array in AppSidebar — add campaign-labs-group with network sub-items
- [ ] Update `menuItems` array in AppSidebar — add analytics-group sub-menu
- [ ] Update `getSelectedKey()` for network routes
- [ ] Update `getPageTitle()` for network + analytics routes
- [ ] Create `NetworkContextBar.tsx` component
- [ ] Update `AppLayout.tsx` to conditionally render NetworkContextBar
- [ ] Create placeholder `CostCenterPage.tsx`
- [ ] Create placeholder `SplitMetricsPage.tsx`
- [ ] Update `appRoutes.tsx` — add analytics routes
- [ ] Verify mobile Drawer still works correctly

## Success Criteria

- Sidebar shows correct groups: Campaign Labs (expanded with 5 networks), Analytics, Media, Settings
- Clicking Google Ads/Meta/etc. in sidebar navigates to correct workspace AND highlights that network's sidebar item
- Network Context Bar appears on `/google-ads`, `/meta`, `/asa`, `/axon`, `/moloco` routes only
- Clicking a network tab in Context Bar navigates to that network
- `/analytics/cost-center` and `/analytics/split-metrics` routes load placeholder pages without errors
- No TypeScript compile errors
- Mobile drawer still opens/closes correctly

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `defaultOpenKeys` on sidebar causes flicker | Low | Set `defaultOpenKeys` to always include `campaign-labs-group` and `analytics-group` |
| Mobile drawer doesn't show submenu properly | Medium | Test Drawer with new menu items; Ant Design Drawer supports Menu with submenu natively |
| NetworkContextBar height pushes content down | Low | Use `flex-col` layout in AppLayout; content area shrinks gracefully |

## Security Considerations

No security-sensitive changes — this is pure navigation restructuring.

## Next Steps

After Phase 1 completes, unblocks:
- Phase 2 (Analytics Hub) — can fill `CostCenterPage` and `SplitMetricsPage` placeholders
- Phase 3 (Network Workspace Standardization) — workspaces already route correctly
- Phase 5 (Network-Aware Automation) — sidebar `network-rules` and `automation` links already exist
