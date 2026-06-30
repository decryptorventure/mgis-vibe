# Phase 2: Page-Level Restructuring

Effort: 4–6h | Risk: Medium | Layout changes on 3 key pages. No logic changes.

---

## 1. MediaLibraries: collapse 4 control surfaces into 2

**File:** `src/pages/MediaLibraries.tsx`

**Problem:** User sees this before any content:
```
1. PageHeader (view toggle + Upload button)        ← ~68px
2. DataFreshnessIndicator (floats alone)           ← ~40px
3. FilterBar with title "Filters" + divider        ← ~100px
4. CreativePerformanceFilterBar (separate card)    ← ~80px  
5. Segmented + Sync button row (raw flex)          ← ~44px
                                                     ─────
                                                     ~332px of controls
```

**Target: 2 surfaces max**

**Surface A — Library toolbar (replaces surfaces 2+5):**
```tsx
<div className="flex items-center gap-3 border-b border_secondary py-2 px-1">
  {/* Left: format segmented + freshness dot */}
  <DataFreshnessIndicator ... compact /> {/* add compact prop: just a dot + text, no card */}
  <Segmented options={formatOptions} ... />
  
  {/* Right: sync + count */}
  <div className="ml-auto flex items-center gap-2">
    <span className="body_xs text_tertiary">{filtered.length} assets</span>
    <Button variant="border" size="s" onClick={handleSync}>
      <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
      Sync
    </Button>
  </div>
</div>
```

**Surface B — Filter row (replaces surfaces 3+4):**
```tsx
<FilterBar actions={...}>  {/* no title prop */}
  <Select placeholder="All Networks" ... />
  <Select placeholder="All Apps" ... />
  <Input placeholder="Search creative name..." ... />
  <Button variant={topPerformers ? 'dim' : 'border'} size="m">Top performers</Button>
  
  {/* Performance filters as disclosure — collapsed by default */}
  <Disclosure>
    <DisclosureTrigger>
      <Button variant="border" size="s">
        Advanced filters {hasActivePerf && <Badge count={activePerfCount} />}
      </Button>
    </DisclosureTrigger>
    <DisclosurePanel>
      <CreativePerformanceFilterBar ... />
    </DisclosurePanel>
  </Disclosure>
</FilterBar>
```

**Implementation steps:**
1. Add `compact` prop to `DataFreshnessIndicator` — renders as `● Synced 2h ago` inline text instead of a full card.
2. Move `Segmented` and Sync button into a new slim toolbar div above the FilterBar.
3. Remove `title` from FilterBar call.
4. Wrap `CreativePerformanceFilterBar` in a collapsible disclosure (use native `<details>`/`<summary>` or a simple `useState` toggle button).
5. Move `googleLowItems` bulk-remove button into the filter row actions (it's already there).

**Result:** User sees ~2 control rows (~96px total) before content, down from ~332px.

---

## 2. AppsList: tighten card layout

**File:** `src/pages/AppsList.tsx`

**Problem:**
- Card body has 3 zones in a flex-wrap layout: identity | KPI cells | networks+action
- The flex-wrap + `style={{ minWidth }}` on each zone causes unpredictable wrap behavior at mid-widths
- "Open workspace" button appears as a secondary CTA inside every card, adding decision weight

**Target layout:**
```
[App icon] [Name · Bundle ID · OS chip · Status badge]   [Spend | Installs | ROAS]   [network chips]   [→]
```

One row per app. The `→` chevron (not a full button) opens the workspace on row click.

**Changes:**
1. Remove the `Button` "Open workspace" from inside each card — the whole card is already `hoverable` + `onClick`. Replace with a `<ChevronRight size={14} className="text_tertiary flex-shrink-0" />` at the far right.
2. Remove the explicit `style={{ flex: '0 0 420px', minWidth: '320px' }}` fixed widths — use `flex-1`, `flex-none`, and `gap-x-6` for natural column behavior.
3. Reduce card padding: `18px` → `14px` (already `styles={{ body: { padding: '18px' } }}`).
4. Apply Phase 1 fix: KPI cells get `radius_8 bg_secondary` only, no border.

**Resulting card height:** ~64px per app (down from ~100px), fitting more apps in viewport.

---

## 3. NetworksList: tighten card layout

**File:** `src/pages/NetworksList.tsx`

**Problem:** Each network card is ~130px tall due to the description paragraph and the 4 KPI sub-cells being in a second row. Goal is ~90px.

**Changes:**
1. Remove description paragraph (Phase 1 fix #2 above).
2. Move KPI cells from a separate column into an inline strip under the network identity:
   ```
   [Logo] [Name · API status badge]   [Spend · Installs · Campaigns · Share]   [apps]   [Enter →]
   ```
3. Remove the `Button "Enter workspace"` — replace with `<ChevronRight>` icon (card is already clickable for navigation).

   **Wait:** NetworksList cards don't have `onClick` yet. Add `onClick={() => navigate(getNetworkPath(network.key))}` + `cursor-pointer` to make whole card clickable. Remove the button.

4. API key count: inline as `<Key size={11} /> {network.keysCount} keys` next to the API status badge, not in a separate column.
5. Apply Phase 1 fix: KPI cells borderless.

**Resulting card height:** ~76px per network × 5 = 380px total for all networks (was ~650px).

---

## 4. Dashboard: extract SectionHeader component

**File:** `src/pages/Dashboard.tsx:236-290`

**Problem:** Dashboard has 3 identical inline section headers:
```tsx
<div className="flex items-center gap-2 px-1">
  <Activity size={18} className="text-[var(--color-primary-500)]" />
  <h2 className="text-base font-bold text-[var(--text-primary)] m-0">Section Title</h2>
</div>
```
Pattern is duplicated and uses raw CSS vars.

**Fix:** Extract to `src/components/ui/SectionHeader.tsx`:
```tsx
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, action }) => (
  <div className="flex items-center justify-between gap-2 px-1">
    <div className="flex items-center gap-2">
      <span className="fg_accent_primary">{icon}</span>
      <h2 className="body_m font-bold text_primary m-0">{title}</h2>
    </div>
    {action && <div>{action}</div>}
  </div>
);
```

Replace all 3 inline section headers in `Dashboard.tsx` with `<SectionHeader>`.

Export from `src/components/ui/index.ts`.

---

## 5. AppsList/NetworksList: add page-level summary strip

**Problem (from audit):** There's no at-a-glance summary before the list — user must scroll to get a feel for the portfolio size.

**Fix:** Add a compact summary row between PageHeader and FilterBar:

**AppsList summary:**
```tsx
<div className="flex items-center gap-6 px-1 body_xs text_secondary">
  <span><strong className="text_primary tabular-nums">{mockProjects.length}</strong> apps</span>
  <span><strong className="text_primary tabular-nums">{runningCount}</strong> running</span>
  <span><strong className="text_primary tabular-nums">{errorCount}</strong> errors</span>
</div>
```

**NetworksList summary:**
```tsx
<div className="flex items-center gap-6 px-1 body_xs text_secondary">
  <span><strong className="text_primary tabular-nums">{ACTIVE_NETWORK_KEYS.length}</strong> networks</span>
  <span><strong className="text_primary tabular-nums">${totalSpend.toLocaleString()}</strong> total spend</span>
  <span><strong className="text_primary tabular-nums">{apiErrorCount}</strong> API issues</span>
</div>
```

This is a read-only strip — no border, no card, just inline text using `body_xs` and tabular numbers.

---

## Validation

After each page change:
```bash
npm run build
```

Check each page at 1440px, 1024px, and 768px widths. Confirm no horizontal scroll at 1024px.
