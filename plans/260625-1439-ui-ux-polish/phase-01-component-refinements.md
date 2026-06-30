# Phase 1: Component Refinements

Effort: 3–4h | Risk: Low-Medium | Shared components only — no page logic changes.

## 1. KPI cells: remove double-border inside Cards

**Files:** `src/pages/AppsList.tsx:179-190`, `src/pages/NetworksList.tsx:119-135`

**Problem:** KPI metric cells use `radius_10 border border_secondary bg_secondary` inside a Card that itself has `border_primary`. Result: border > border > content ("box in a box"). Violates "one border tier" principle.

**Before (AppsList):**
```tsx
<div className="radius_10 border border_secondary bg_secondary px-4 py-3">
  <div className="text-[11px] font-medium text_tertiary">Spend</div>
  <div className="mt-1 text-lg font-semibold tabular-nums text_primary">$12,400</div>
</div>
```

**After — borderless, just background tier:**
```tsx
<div className="radius_8 bg_secondary px-4 py-3">
  <div className="body_xs text_tertiary">Spend</div>
  <div className="mt-0.5 text-base font-semibold tabular-nums text_primary">$12,400</div>
</div>
```

Apply the same change to NetworksList KPI cells (Spend, Installs, Active campaigns, Spend share).

Also reduce the KPI value font size: `text-lg` (18px) → `text-base` (16px). The cells are inside a card that already has a 16px heading — `text-lg` competes.

---

## 2. NetworksList: remove description paragraph

**File:** `src/pages/NetworksList.tsx:90`

**Problem:** Each network card has a `<p>` description (e.g. "Facebook, Instagram, Audience Network, and Messenger placements.") that takes 2 lines. For an operational list screen, descriptions add reading load without aiding decisions. The user knows what Meta is.

**Fix:** Remove the description paragraph. Replace with a simpler compact label showing connection state and key count. This reduces each card height significantly.

```tsx
// Before
<p className="m-0 max-w-2xl text-sm leading-5 text_secondary">{network.description}</p>

// After: remove this line entirely. The API status badge + connected apps already convey state.
```

Card height reduction: ~40px per card × 5 networks = dramatically less scrolling.

---

## 3. StatCard: add `compact` variant

**File:** `src/components/ui/StatCard.tsx`

**Problem:** The current StatCard has `text-[32px]` value and `min-h-[120px]`. This is appropriate for a prominent dashboard metric but too heavy when 6 cards are side-by-side or used in nested contexts.

**Fix:** Add a `size` prop with `default` and `compact` options:

```tsx
interface StatCardProps {
  // ...existing props
  size?: 'default' | 'compact';
}

// In render:
const valueClass = size === 'compact'
  ? 'text-xl font-semibold leading-none tracking-tight tabular-nums text_primary'
  : 'text-[32px] font-semibold leading-none tracking-tight text_primary';

const cardClass = size === 'compact'
  ? cn('relative flex flex-col gap-2 overflow-hidden radius_10 border border_primary bg_primary p-3', className)
  : cn('relative flex min-h-[120px] flex-col gap-3 overflow-hidden radius_12 border border_primary bg_primary p-4', className);
```

Compact variant: 20px value, 12px padding, no min-height.

**Update Dashboard:** The 6 metric cards in `DashboardMetrics` should use `size="compact"` since they appear in a 6-column grid and the 32px value creates excessive height.

---

## 4. NetworkBadge and StatusBadge: unify size scale

**Files:** `src/components/ui/StatusBadge.tsx`, `src/components/ui/NetworkBadge.tsx`

**Problem (from audit):** Badge sizes are inconsistent across uses. Status badges sometimes appear large, sometimes small, with no systematic scale.

**Fix:** Ensure both components share the same size tokens:
- `sm`: `px-1.5 py-0.5 text-[10px]` — for table cells, compact lists
- `md` (default): `px-2 py-0.5 text-[11px]` — for cards, rows
- `lg`: `px-2.5 py-1 text-xs` — for headers, prominent display

Check current StatCard and CreativeGridCard usages and ensure they pass `size="sm"` or `size="md"` explicitly rather than relying on the default.

---

## 5. SurfaceSection: add `framed={false}` for nested use

**File:** `src/components/ui/SurfaceSection.tsx`

**Problem:** `SurfaceSection` inside `CreativeGridCard` adds nested border noise. Creative card body uses `<SurfaceSection tone="secondary">` which creates a bordered sub-surface inside an already-bordered card.

**Fix:** Add a `framed` prop that controls whether the section gets a border:

```tsx
interface SurfaceSectionProps {
  // ...existing
  framed?: boolean; // default true for standalone, should be false inside a Card
}

// In render:
className={cn(
  padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-6',
  framed && 'radius_8 border border_secondary',
  !framed && 'radius_6 bg_secondary',
  toneClass,
  className
)}
```

**Update `CreativeGridCard`:**
```tsx
// Before
<SurfaceSection tone="secondary" padding="sm">

// After — inside a card, no extra border
<SurfaceSection tone="secondary" padding="sm" framed={false}>
```

---

## 6. AppHeader: reduce height and visual weight

**File:** `src/components/layout/AppHeader.tsx`

Read the current file first, then apply:
- Reduce header height from ~64px to ~52px if possible
- Ensure breadcrumbs use `body_xs` class (not arbitrary font sizes)
- Page title in header should match `body_s font-semibold` — not larger than sidebar labels

---

## Validation

```bash
npm run build && npm run lint
```

Visual check after each component change: verify the change on at least 2 pages that use it.
