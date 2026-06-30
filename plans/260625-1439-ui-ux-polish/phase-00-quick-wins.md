# Phase 0: Quick Wins

Effort: 1–2h | Risk: Low | No layout changes, no new components.

## 1. Remove `animate-pulse` from AppSidebar logo

**File:** `src/components/layout/AppSidebar.tsx:59`

**Problem:** The logo icon permanently pulses — decorative animation with no semantic meaning. Violates `motion-meaning` rule (animation must express cause-effect).

**Fix:**
```tsx
// Before
<div className="w-8 h-8 radius_8 flex items-center justify-center flex-shrink-0 animate-pulse bg_accent_primary fg_on_accent">

// After
<div className="w-8 h-8 radius_8 flex items-center justify-center flex-shrink-0 bg_accent_primary fg_on_accent">
```

---

## 2. Remove FilterBar mandatory title section

**File:** `src/components/ui/FilterBar.tsx`

**Problem:** Every FilterBar renders:
```
FILTERS [uppercase label + horizontal border-b]
[actual filter inputs]
```
This adds ~52px of visual header to what is purely a utility toolbar. The uppercase label + `tracking-[0.08em]` makes a utility control feel like a section heading.

**Fix:** Make `title` display optional and low-weight. If passed, render it inline with the filter row, not as a block header with divider.

```tsx
// Before: title + divider creates a heavy block header
{(title || actionNode) && (
  <div className="mb-4 flex flex-col gap-3 border-b border_secondary pb-3 sm:flex-row sm:items-center sm:justify-between">
    {title ? <span className="text-xs font-semibold uppercase tracking-[0.08em] text_tertiary">{title}</span> : <span />}
    <div className="flex flex-wrap items-center gap-2">{actionNode}</div>
  </div>
)}
<div className="flex flex-wrap items-end gap-3">{children}</div>

// After: actions float right in the same row as filters; title is removed from the header design
<div className="flex flex-wrap items-center gap-3">
  {children}
  {actionNode && (
    <div className="ml-auto flex flex-shrink-0 items-center gap-2">{actionNode}</div>
  )}
</div>
```

Also update the container: from `border border_primary bg_primary px-4 py-4` to a sunken toolbar feel:
```tsx
// Before
'w-full radius_12 border border_primary bg_primary px-4 py-4'

// After
'w-full radius_10 border border_secondary bg_secondary px-3 py-2.5'
```

**Update callers:** Remove `title` prop from `AppsList.tsx`, `NetworksList.tsx`, and `MediaLibraries.tsx` (or keep as hidden). The `actions` slot content (count + reset) naturally migrates to the right of the filter row.

---

## 3. Fix Dashboard section headers inline color

**File:** `src/pages/Dashboard.tsx:239,248,288`

**Problem:** Section icon uses `text-[var(--color-primary-500)]` — raw CSS var in className. Should use semantic token class.

**Fix:**
```tsx
// Before
<Activity size={18} className="text-[var(--color-primary-500)]" />
<h2 className="text-base font-bold text-[var(--text-primary)] m-0">System Overview</h2>

// After — use semantic token utility classes
<Activity size={18} className="fg_accent_primary" />
<h2 className="body_m font-bold text_primary m-0">System Overview</h2>
```

Apply same fix to all 3 section headers in Dashboard.tsx.

---

## 4. Simplify PageHeader icon to neutral token

**Files:** `src/pages/AppsList.tsx:51`, `src/pages/NetworksList.tsx:49`, `src/pages/MediaLibraries.tsx:157`, `src/pages/Dashboard.tsx:210`

**Problem:** Each page passes a different `iconBg` color:
- AppsList: `var(--color-primary-500)` (brand orange)
- NetworksList: `var(--color-primary-500)` (brand orange)
- MediaLibraries: `var(--status-info)` (blue)
- Dashboard: no iconBg (falls back to `var(--ds-bg-accent-primary)`)

This inconsistency makes each page look like a separate product. The icon box should be a neutral neutral secondary or tertiary surface — it's a page identity marker, not a status indicator.

**Fix in `PageHeader.tsx`:**
```tsx
// Before: arbitrary iconBg prop with different colors per page
iconBg = 'var(--ds-bg-accent-primary)'
<div style={{ background: iconBg }}>

// After: use a single consistent neutral token; remove iconBg prop or default to neutral
// Option A: hardcode to neutral
<div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center radius_8 bg_secondary border border_secondary text_secondary">

// Option B: keep iconBg but default to neutral token, document the expected values
```

Recommended: **Option A** — the icon box is a secondary surface marker. Remove per-page color variation. The page title itself is the primary identifier.

**Remove `iconBg` from all page callers** after making the change.

---

## 5. Remove StatCard left accent strip from default variant

**File:** `src/components/ui/StatCard.tsx:55`

**Problem:** The absolute `<span className="absolute left-0 top-0 h-full w-1 ...">` creates a colored left border on every stat card. For the `default` variant this is `bg_quaternary` (neutral) which is nearly invisible but still adds visual weight. For colored variants it makes cards look like a vertical-striped bullet list.

**Fix:** Remove the accent strip entirely from `default` variant. Keep it only for `success`/`error`/`warning`/`info` when the card needs to communicate a status state at a glance.

```tsx
// Before: always renders accent strip
<span className={cn('absolute left-0 top-0 h-full w-1', variantAccentClassMap[variant])} />

// After: only render when variant has real semantic meaning
{variant !== 'default' && (
  <span className={cn('absolute left-0 top-0 h-full w-1', variantAccentClassMap[variant])} />
)}
```

---

## Validation

After each fix:
```bash
npm run build
```

Visual check: All 3 key pages (Apps, Networks, Creative) should feel less "busy" with the FilterBar change alone.
