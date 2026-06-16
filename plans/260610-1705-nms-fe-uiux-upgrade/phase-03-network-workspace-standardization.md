# Phase 3: Network Workspace Standardization

**Priority:** P1  
**Status:** Pending  
**Effort:** ~10h  
**Parallelism:** Runs after Phase 1; Phase 4 depends on this phase

## Context Links

- Plan overview: [plan.md](./plan.md)
- Current router: `src/pages/NetworkWorkspace.tsx`
- Network pages: `src/pages/networks/GoogleAdsWorkspace.tsx`, `MetaWorkspace.tsx`, `AsaWorkspace.tsx`, `AxonWorkspace.tsx`, `MolocoWorkspace.tsx`
- Shared UI: `src/components/ui/`
- Mock data: `src/shared/mock-data.ts`

## Overview

Standardize all 5 network workspaces around a **shared core + network plugin config** pattern. Each workspace currently has 400-600 lines of duplicated table/toolbar/drawer logic. Extract shared structure into a `NetworkWorkspaceShell` component driven by a `NetworkConfig` object per network. Network-specific content (wizards, extra tabs) remains as network plugins.

## Key Insights

- All 5 workspaces share: `PageHeader`, search Input, Filter button, Export button, Create button, campaign Table with same base columns, detail Drawer with same Statistic layout
- Key differences: Google has Asset Groups tab; Meta has hierarchical AdSet expansion + bulk operations; Axon has country bid management; Moloco has publisher blacklist/whitelist; ASA has keyword targeting
- Wizard logic is the largest differentiator — Phase 4 extracts these into a shared wizard system
- `statusConfig` is duplicated in every workspace as local `StatusTag` component — extract to shared `StatusBadge`
- `NetworkWorkspace.tsx` (router/switch) stays — just becomes thinner after workspaces are refactored

## Requirements

### Functional
- Each network workspace has **3 standard tabs**: Campaigns | Insights | Settings
- `Campaigns` tab: shared `NetworkCampaignTable` with configurable extra columns per network
- `Insights` tab: network-specific analytics (Google: Quality Score trends; Meta: Relevance Score; ASA: keyword match rates; Axon: country bid efficiency; Moloco: publisher performance)
- `Settings` tab: API key status + sync config (same structure across all networks)
- Network-specific features kept as additional tabs or within Insights (e.g., Google's Asset Groups → sub-tab of Campaigns)
- Bulk operations (pause/resume/budget adjust) standardized across all networks via `NetworkCampaignTable`

### Non-Functional
- Each network workspace file target: < 200 lines (down from 400-600)
- `shared/network-config.ts` defines all network-specific config — single source of truth
- No behavior regression on Meta's hierarchical AdSet expansion

## Architecture

```
src/shared/
└── network-config.ts          (NEW — NetworkConfig type + 5 config objects)

src/components/networks/       (NEW directory)
├── network-workspace-shell.tsx   (shared shell: PageHeader, toolbar, tab structure)
├── network-campaign-table.tsx    (shared campaign table with configurable columns)
├── network-settings-tab.tsx      (shared Settings tab)
└── network-insights-tab.tsx      (base Insights tab — each network overrides content)

src/pages/networks/            (REFACTORED — each file becomes thin plugin)
├── GoogleAdsWorkspace.tsx     (GoogleConfig + AssetGroups tab override)
├── MetaWorkspace.tsx          (MetaConfig + AdSet expansion + bulk ops)
├── AsaWorkspace.tsx           (AsaConfig + keyword insights)
├── AxonWorkspace.tsx          (AxonConfig + country bid table)
└── MolocoWorkspace.tsx        (MolocoConfig + publisher table)
```

### NetworkConfig Type

```typescript
// src/shared/network-config.ts

export interface NetworkColumnConfig {
  dataIndex: string;
  title: string;
  width?: number;
  render?: (value: unknown, record: Campaign) => React.ReactNode;
}

export interface NetworkConfig {
  key: string;                          // 'google-ads' | 'meta' | 'asa' | 'axon' | 'moloco'
  label: string;
  color: string;                        // brand color for accents
  icon: React.ReactNode;
  extraColumns: NetworkColumnConfig[];  // appended after shared base columns
  extraTabs?: TabsProps['items'];       // additional tabs beyond Campaigns/Insights/Settings
  createButtonLabel: string;
  createButtonAction: (onClose: () => void) => React.ReactNode; // renders wizard modal
  insightsContent: React.ReactNode;     // network-specific Insights tab content
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  'google-ads': { ... },
  'meta': { ... },
  'asa': { ... },
  'axon': { ... },
  'moloco': { ... },
};
```

### NetworkWorkspaceShell

```typescript
// src/components/networks/network-workspace-shell.tsx
interface NetworkWorkspaceShellProps {
  config: NetworkConfig;
  campaigns: Campaign[];
}
// Renders: PageHeader → Toolbar → Tabs (Campaigns | Insights | Settings | ...extraTabs)
```

### Shared Base Columns (same for all networks)

```
Campaign Name (clickable → detail drawer)
Status (StatusBadge)
Budget ($)
Spend ($)
Impressions
Clicks
Installs
CPA ($)
ROAS (x)
Actions (pause/resume quick action)
```

### Network Extra Columns

| Network | Extra Columns |
|---------|--------------|
| Google  | Quality Score, Asset Group count |
| Meta    | CBO status badge, Lookalike % |
| ASA     | Keyword match type, Search term count |
| Axon    | Top country bid ($), Recommendation badge |
| Moloco  | Publisher count, Blocked publishers |

## Related Code Files

### Create
- `src/shared/network-config.ts`
- `src/components/networks/network-workspace-shell.tsx`
- `src/components/networks/network-campaign-table.tsx`
- `src/components/networks/network-settings-tab.tsx`
- `src/components/networks/network-insights-tab.tsx`

### Modify (refactor to thin plugins)
- `src/pages/networks/GoogleAdsWorkspace.tsx` — keep `GoogleUacWizard` + Asset Groups tab; delegate rest to shell
- `src/pages/networks/MetaWorkspace.tsx` — keep AdSet expansion render + bulk ops; delegate rest to shell
- `src/pages/networks/AsaWorkspace.tsx` — keep keyword table; delegate rest
- `src/pages/networks/AxonWorkspace.tsx` — keep country bid table; delegate rest
- `src/pages/networks/MolocoWorkspace.tsx` — keep publisher table; delegate rest

### Extract (move to shared)
- Local `StatusTag` component (duplicated in all 5 workspaces) → use existing `src/components/ui/StatusBadge.tsx`

### No Change
- `src/pages/NetworkWorkspace.tsx` — switch statement stays, just routes to refactored workspace components
- `src/routes/appRoutes.tsx` — no route changes needed

## Implementation Steps

1. **Create `network-config.ts`**
   - Define `NetworkConfig` interface
   - Define `NETWORK_CONFIGS` with placeholder `insightsContent` and `createButtonAction` for each network (Phases 4 fills wizard actions)
   - Export `NETWORK_ROUTES` array: `['/google-ads', '/meta', '/asa', '/axon', '/moloco']`
   - Export `getNetworkFromPath(pathname: string): string | null`

2. **Create `network-campaign-table.tsx`**
   - Props: `config: NetworkConfig`, `campaigns: Campaign[]`, `onViewDetail: (c: Campaign) => void`
   - Shared base columns + `config.extraColumns` appended
   - Row selection (checkboxes) for bulk operations
   - Floating bulk action bar (extracted from MetaWorkspace — generalize for all networks)
   - Search input + filter button in toolbar
   - Detail Drawer (shared — same Statistic layout used across all current workspaces)

3. **Create `network-settings-tab.tsx`**
   - Shows: API key status (masked), last sync timestamp, sync frequency selector, "Test Connection" button
   - Content is mock/static for now — real API integration deferred
   - Same UI for all 5 networks

4. **Create `network-insights-tab.tsx`**
   - Base wrapper with `PageHeader`-style sub-header
   - Renders `config.insightsContent` (passed from network config)
   - Each network's `insightsContent` is a self-contained React element

5. **Create `network-workspace-shell.tsx`**
   - Props: `config: NetworkConfig`, `campaigns: Campaign[]`
   - Renders: `<PageHeader>` → toolbar (search + filter + export + create button) → `<Tabs>` with Campaigns/Insights/Settings tabs + `config.extraTabs`
   - Create button: `config.createButtonLabel` triggers `config.createButtonAction`

6. **Refactor each workspace** (one by one to avoid regressions):
   - **GoogleAdsWorkspace**: Keep `GoogleUacWizard` component; pass as `createButtonAction`; keep Asset Groups as `extraTab`; keep Insights showing asset performance
   - **MetaWorkspace**: Keep `renderAdSetsTable` (nested expansion) as `expandable` prop passed to `network-campaign-table`; keep bulk op logic; pass as `MetaConfig`
   - **AsaWorkspace**: Extract keyword insights as `insightsContent`
   - **AxonWorkspace**: Extract country bid table as `insightsContent`  
   - **MolocoWorkspace**: Extract publisher table as `insightsContent`

7. **Remove duplicated `StatusTag`** from all 5 workspace files — use `StatusBadge` from `src/components/ui/`

## Todo List

- [ ] Create `src/shared/network-config.ts` with `NetworkConfig` interface and 5 config objects
- [ ] Create `network-campaign-table.tsx` with shared base columns + detail drawer
- [ ] Move bulk operations from MetaWorkspace to `network-campaign-table.tsx`
- [ ] Create `network-settings-tab.tsx`
- [ ] Create `network-insights-tab.tsx`
- [ ] Create `network-workspace-shell.tsx`
- [ ] Refactor `GoogleAdsWorkspace.tsx` to use shell
- [ ] Refactor `MetaWorkspace.tsx` to use shell (preserve AdSet expansion)
- [ ] Refactor `AsaWorkspace.tsx` to use shell
- [ ] Refactor `AxonWorkspace.tsx` to use shell
- [ ] Refactor `MolocoWorkspace.tsx` to use shell
- [ ] Remove all local `StatusTag` duplicates — use shared `StatusBadge`
- [ ] Verify each workspace renders correctly after refactor
- [ ] Check no TypeScript compile errors

## Success Criteria

- Each workspace file < 200 lines
- All 5 workspaces show 3 tabs: Campaigns, Insights, Settings
- Meta's hierarchical AdSet expansion still works
- Bulk operations (pause/resume/budget) work on all networks
- Google's Asset Groups tab still renders
- `network-config.ts` is single source of truth for network identity (color, label, extra columns)
- No duplicate `StatusTag` components

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Meta's nested `expandable` doesn't compose with shared table | Medium | Pass `expandable` as optional prop to `network-campaign-table`; Meta provides it via config |
| `insightsContent` as static React element loses reactivity | Low | Use render function `() => React.ReactNode` instead of static element; allows hooks inside |
| Config file grows beyond 200 lines | Medium | Split: `network-config.ts` for types/constants, `network-configs/google.ts`, etc. for per-network configs |

## Security Considerations

- `network-settings-tab.tsx` displays API keys — mask by default, show only last 4 chars
- "Test Connection" button should not expose full key in network request logs (internal tool, lower risk)

## Next Steps

- Phase 4 (Campaign Wizard) depends on this phase — wizard components created here are extracted/refactored there
- `network-config.ts` `createButtonAction` fields are placeholders until Phase 4 provides unified wizard
