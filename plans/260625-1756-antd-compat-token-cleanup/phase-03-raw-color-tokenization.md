---
phase: 3
title: "Raw color tokenization"
status: pending
priority: P2
dependencies: [phase-01]
---

# Phase 3: Raw color tokenization

## Overview

Replace raw Tailwind semantic color classes and hardcoded hex values in recently committed code with ikame DS token classes. Focus is on semantic-state colors (error/warning/success/info) that have direct token equivalents. Brand-specific network identity colors (Axon teal, Google blue) are excluded when no token exists — document those.

## Token mapping reference

| Raw class / hex | ikame DS token | Usage context |
|-----------------|---------------|---------------|
| `text-red-500`, `text-red-600`, `text-red-700` | `fg_error` | Error text, required markers |
| `bg-red-50` | `bg_error_subtle` | Error background tint |
| `border-red-200` | `border_error` | Error border |
| `text-emerald-600`, `text-green-600` | `fg_success` | Success / positive delta |
| `bg-emerald-50`, `bg-green-50` | `bg_success_subtle` | Success tint |
| `text-blue-700`, `text-blue-600` | `fg_info` | Info text |
| `bg-blue-50` | `bg_info_subtle` | Info tint |
| `border-blue-200` | `border_info` | Info border |
| `text-yellow-600`, `text-amber-600` | `fg_warning` | Warning text |
| `bg-yellow-50`, `bg-amber-50` | `bg_warning_subtle` | Warning tint |
| `bg-white` (semantic bg, not decorative) | `bg_primary` | Surface background |
| `#ef4444` in inline style | `var(--status-error)` or class `bg_error` | Error badge bg |
| `#16a34a` / `#22c55e` in inline style | `var(--status-success)` | Success progress |
| `#f59e0b` in inline style | `var(--status-warning)` | Warning progress |
| `#f97316` in inline style (CountBadge) | `var(--status-warning)` or `fg_warning` | Metric badge |
| `#3b82f6` in inline style (CountBadge) | `var(--status-info)` | Metric badge |

**Do NOT change:**
- `AXON_COLOR` (`#6366f1` teal/purple) — no DS token; keep as named constant with comment.
- `GOOGLE_COLOR` (`#4285f4`) — no DS token; keep as named constant.
- `bg-[#FA2B56]` / `bg-[#000000]` in network badge tiles — intentional brand identity.
- `bg-[var(--accent-primary-bg,#fff3ec)]` — already using CSS variable; the hex is a fallback. Acceptable.

## Related Code Files

Files with raw semantic color violations (from ui-review audit):

```
src/components/analytics/cross-network-kpi-summary.tsx    — text-red-500, text-emerald-600
src/components/analytics/funnel-kpi-strip.tsx             — text-red-500, text-emerald-600
src/components/automation/rule-card.tsx                   — bg-red-50, text-red-600, border-red-200
src/components/networks/axon/axon-campaign-builder-drawer.tsx — #ef4444 inline, bg-blue-50, text-blue-700
src/components/networks/axon/axon-automation-panels.tsx   — CountBadge #f97316 / #3b82f6 / #ef4444
src/components/networks/axon/axon-ui-atoms.tsx            — text-red-600, text-red-500
src/components/networks/google/google-builder-adgroup-section.tsx — text-red-500 (required marker)
src/components/networks/google/google-builder-sections.tsx        — text-red-500 (required marker)
src/components/networks/google/google-campaign-builder-drawer.tsx — bg-red-50, text-red-600, border-red-200
src/components/creative/creative-grid-card.tsx            — bg-white
src/pages/networks/AxonWorkspace.tsx                      — #ef4444 inline style
```

## Implementation Steps

### Step 1 — Semantic class sweep (regex replacements)

Apply in order to avoid partial matches:

```powershell
# Error text
Get-ChildItem -Recurse -Include "*.tsx","*.ts" src/ | ForEach-Object {
  (Get-Content $_.FullName -Raw) `
    -replace '\btext-red-[4-9]00\b', 'fg_error' `
    -replace '\bbg-red-50\b', 'bg_error_subtle' `
    -replace '\bborder-red-200\b', 'border_error' `
    -replace '\btext-emerald-[4-9]00\b', 'fg_success' `
    -replace '\btext-green-[4-9]00\b', 'fg_success' `
    -replace '\bbg-emerald-50\b', 'bg_success_subtle' `
    -replace '\btext-blue-[6-9]00\b', 'fg_info' `
    -replace '\bbg-blue-50\b', 'bg_info_subtle' `
    -replace '\bborder-blue-200\b', 'border_info' |
  Set-Content $_.FullName -Encoding utf8
}
```

> **Review before committing**: the regex targets `text-red-400` through `text-red-900`. Spot-check 3-4 files after running.

### Step 2 — Required-field asterisk (`*`) color

Several builder forms use `<span className="text-red-500">*</span>` for required markers. Replace with the DS error token:

```tsx
// before
<span className="text-red-500">*</span>
// after
<span className="fg_error">*</span>
```

Affected files: `google-builder-adgroup-section.tsx`, `google-builder-sections.tsx`, `axon-campaign-builder-drawer.tsx`, and any wizard step forms.

### Step 3 — Inline hex in `axon-automation-panels.tsx` — CountBadge

```tsx
// before
<CountBadge value={row.totalActive} color="#f97316" />
<CountBadge value={row.evaluated} color="#3b82f6" />
<CountBadge value={row.matched}   color="#ef4444" />

// after — use CSS variables (check if CountBadge accepts className or variant)
<CountBadge value={row.totalActive} color="var(--status-warning)" />
<CountBadge value={row.evaluated}   color="var(--status-info)" />
<CountBadge value={row.matched}     color="var(--status-error)" />
```

If `CountBadge` only accepts raw hex, add a `variant` prop (`warning` | `info` | `error`) that maps to CSS variables internally.

### Step 4 — Inline hex in `Progress` strokeColor

```tsx
// before
<Progress percent={v} strokeColor={v >= 80 ? '#16a34a' : v >= 60 ? '#f59e0b' : '#ef4444'} />

// after
<Progress
  percent={v}
  strokeColor={v >= 80 ? 'var(--status-success)' : v >= 60 ? 'var(--status-warning)' : 'var(--status-error)'}
/>
```

### Step 5 — `#ef4444` inline button/badge styles

```tsx
// before
style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}

// after
className="bg_error border_error"
// and remove the style prop
```

### Step 6 — `bg-white` in `creative-grid-card.tsx`

```tsx
// before
className="... bg-white rounded-full ..."
// after
className="... bg_primary radius_round ..."
```

### Step 7 — Verify no raw semantic colors remain

```bash
grep -rn "text-red-\|bg-red-\|text-emerald-\|text-green-\|bg-blue-\|text-blue-\|bg-white" src/components src/pages
```

Expected: zero matches (only network-config brand tints are exempt, which use specific selectors not matched here).

## Success Criteria

- [ ] No `text-red-*`, `bg-red-*`, `border-red-*` in `src/components/` or `src/pages/`.
- [ ] No `text-emerald-*`, `bg-emerald-*` semantic usage.
- [ ] No `text-blue-*`, `bg-blue-*` semantic usage.
- [ ] No `bg-white` as a semantic surface background.
- [ ] No hardcoded `#ef4444`, `#f97316`, `#3b82f6`, `#16a34a`, `#f59e0b` hex in inline styles for semantic states.
- [ ] `npm run build` and `npm run lint` pass.

## Risk Assessment

- **Regex over-matches** — `text-red-500` in a CSS string literal or comment. Review diff carefully before commit.
- **CountBadge variant prop** — if `CountBadge` doesn't have a variant API, adding it is a small additive change (1 component, no impact on callers).
- **`Progress strokeColor`** — AntD Progress accepted hex; compat Progress bridge passes it through. CSS variables as strokeColor work in modern browsers; test in dark mode.
