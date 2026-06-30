---
phase: 2
title: "Templates Management Tab"
status: pending
priority: P1
effort: 4h
dependencies: [phase-01-types-and-mock-data]
---

# Phase 2: Templates Management Tab

## Overview

Build the standalone Templates management surface inside Meta workspace: a searchable table with full CRUD, backed by the `CampaignTemplate` type from Phase 1. Extends existing `meta-template-drawer.tsx` and `meta-template-forms.tsx` to support the full hierarchy form.

## Requirements

- Functional:
  - Table lists all templates (search by name, filter by objective)
  - Row click → opens edit drawer
  - "+ New Template" → opens create drawer
  - Delete (single + bulk) with confirm dialog
  - Form covers all `CampaignTemplate` fields: campaign level + adset shell + ad shell
- Non-functional:
  - Tab lazy-renders (no performance cost when tab not active)
  - State stored in `useState` (localStorage persistence is Phase 6 enhancement)
  - File ≤ 200 lines; split if needed

## Architecture

```
meta-template-tab.tsx                 (new, ~180 lines)
  uses → meta-template-drawer.tsx     (extend, ~150 lines)
    uses → meta-template-forms.tsx    (extend, ~160 lines)
  data → mockCampaignTemplates[]      (from mock-data.ts)

meta-config.tsx                       (modify: add Templates tab to extraTabs)
```

**State pattern:** `meta-template-tab.tsx` owns local `templates` state initialized from `mockCampaignTemplates`. Drawer receives `template` prop + `onSave(t)` + `onDelete(id)` callbacks. No global state needed (single consumer).

## Related Code Files

- Create: `src/components/networks/meta/meta-template-tab.tsx`
- Modify: `src/components/networks/meta/meta-template-forms.tsx`
- Modify: `src/components/networks/meta/meta-template-drawer.tsx`
- Modify: `src/components/networks/meta/meta-workspace-header.tsx` — remove `onOpenTemplates` prop + button (replaced by the new tab)
- Read first: `src/components/networks/meta/meta-template-forms.tsx` (current fields)
- Read first: `src/components/networks/meta/meta-template-drawer.tsx` (current structure)
- Read first: `src/components/networks/meta/meta-workspace-header.tsx` (toolbar structure — scout the Templates button to remove)
- Read first: the workspace component rendering the Meta tab strip (scout `src/components/networks/meta/` to find where Campaigns/Ad Sets/Ads tabs are defined)

## Implementation Steps

### 1. Extend `meta-template-forms.tsx`

Add three new collapsible sections below the existing objective/attribution fields:

**Section A — Campaign Settings** (already partially exists; ensure these fields):
- Objective: Radio group `APP_INSTALLS | CONVERSIONS | REACH`
- Budget Optimization: Radio group `CBO | ABO`

**Section B — Ad Set Shell** (new collapsible `<details>` or Collapse component):
```
Daily Budget (number input, min 1)
Budget Type (Radio: daily | lifetime)
Bid Strategy (Select: LOWEST_COST | COST_CAP | BID_CAP)
Countries (multi-Select, use existing country list mock)
Age Range (two number inputs: min 13, max 65)
Genders (Checkbox: male | female | all)
Placements (Checkbox group: feed | reels | stories | search)
Click Attribution Window (Select: 1 | 7 | 28 days)
View Attribution Window (Select: 0 | 1 day)
```

**Section C — Ad Shell** (new collapsible):
```
Format (Radio: IMAGE | VIDEO | CAROUSEL)
Primary Text (Textarea, max 125 chars)
Headline (Input, max 40 chars)
Description (Input, optional, max 30 chars)
Call to Action (Select: INSTALL_MOBILE_APP | SIGN_UP | OPEN_LINK | LEARN_MORE | SHOP_NOW)
Destination URL (Input, url validation)
```

Keep each section under a `<details open>` or the ui-kit `Collapse` for progressive disclosure.

### 2. Extend `meta-template-drawer.tsx`

- Change prop type from `MetaTemplate` → `CampaignTemplate | null`
- Accept `onSave: (t: CampaignTemplate) => void` and `onDelete?: (id: string) => void`
- Wire the extended form
- On save: generate `id` (uuid pattern: `ct-${Date.now()}`), set `createdAt`/`updatedAt`, call `onSave`
- Footer: [Cancel] [Delete (if editing)] [Save Template]

### 3. Create `meta-template-tab.tsx`

```typescript
// Layout:
// ┌─ Toolbar ────────────────────────────────────────────────────┐
// │ [Search input]  [Objective filter]  [+ New Template]         │
// └──────────────────────────────────────────────────────────────┘
// ┌─ Table ──────────────────────────────────────────────────────┐
// │ Name | Objective | Budget | Bid Strategy | Countries | Usage │
// │ row actions: Edit | Delete                                   │
// └──────────────────────────────────────────────────────────────┘

// State:
const [templates, setTemplates] = useState<CampaignTemplate[]>(mockCampaignTemplates);
const [search, setSearch] = useState('');
const [drawerOpen, setDrawerOpen] = useState(false);
const [editTarget, setEditTarget] = useState<CampaignTemplate | null>(null);

// Columns (using DataTable / ColumnsType):
// - name (bold, clickable → opens edit)
// - objective (StatusBadge: APP_INSTALLS→info, CONVERSIONS→success, REACH→neutral)
// - budgetOptimization (Badge: CBO | ABO)
// - adsetShell.budget (formatted currency)
// - adsetShell.bidStrategy
// - adsetShell.targeting.countries (pill list, max 3 + "+N more")
// - usageCount (right-aligned)
// - actions (Edit icon button, Delete icon button)
```

### 4. Wire Templates tab into Meta workspace

**Scout first (required before implementing):** `meta-config.tsx` has only `extraColumns` for table config — no `extraTabs` pattern. The workspace tabs (Campaigns / Ad Sets / Ads / Insights / Settings) are defined elsewhere. Before writing code, search `src/components/networks/meta/` for where those tab entries are declared, then insert:

```typescript
{ key: 'templates', label: 'Templates', children: <MetaTemplateTab /> }
```

**Remove the existing Templates button:** `meta-workspace-header.tsx` already has an `onOpenTemplates` prop and a Templates toolbar button that opens the old lightweight drawer. This is now superseded by the full Templates tab. Steps:
1. Remove the `onOpenTemplates` prop from `MetaWorkspaceHeaderProps`
2. Remove the Templates button JSX from the toolbar
3. Remove the `onOpenTemplates` handler wherever it is passed to the header (the parent workspace component)

## Success Criteria

- [ ] Templates tab visible in Meta workspace tab list
- [ ] Table shows all 3 `mockCampaignTemplates` with correct data
- [ ] Search filters by name (case-insensitive)
- [ ] "+ New Template" opens empty form drawer
- [ ] Edit saves updated template back into table (optimistic local state)
- [ ] Delete removes row with confirm dialog
- [ ] Form sections A/B/C all render with correct field types
- [ ] `npx tsc --noEmit` passes

## Risk Assessment

- **`meta-template-forms.tsx` exceeds 200 lines:** Split into `meta-template-forms-adset-section.tsx` + `meta-template-forms-ad-section.tsx`, import in parent.
- **`meta-config.tsx` circular import:** `MetaTemplateTab` imports from `meta-types.ts` and `mock-data.ts` — both are safe (no circular path). Verify with tsc.
- **Countries list:** Use hardcoded array of `[{ value: 'VN', label: 'Vietnam' }, ...]` for mock — 10-15 SE Asia + global entries sufficient.
