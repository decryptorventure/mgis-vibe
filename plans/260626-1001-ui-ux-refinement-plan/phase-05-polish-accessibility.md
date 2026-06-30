---
phase: 5
title: "Micro-interactions & Accessibility"
status: pending
priority: P3
dependencies: [phase-04]
---

# Phase 05: Micro-interactions & Accessibility

## Overview

Final polish pass: consistent hover/active states on all interactive elements, keyboard navigation improvements, focus management in modals and drawers, color contrast verification for network-colored text, and command palette discoverability. These changes convert a "functional" UI into a "polished" one.

## Requirements

### Hover & Active States — Interactive Elements

All clickable elements must have visible hover + active (pressed) feedback:
- **Buttons**: already handled by ui-kit; verify `variant="ghost"` and custom `<button>` elements have `hover:bg_secondary` + `active:bg_tertiary` + `transition-colors duration-150`
- **Table rows**: `hover:bg_secondary` with `cursor-pointer` on rows that open detail panels
- **Card tiles** (app cards, network cards, creative cards): `hover:shadow-md` or `hover:border_primary` transition
- **Sidebar items**: already styled — verify `active` state uses `bg_blue_subtle` token (not hardcoded)
- **Tab triggers**: verify `hover:text_primary hover:bg_secondary` on inactive tabs
- **Inline edit cells** (`inline-edit-cell.tsx`): on hover show edit pencil icon + `cursor-pointer`; on click transition smoothly into input mode

Pattern for custom interactive elements:
```tsx
className="... cursor-pointer transition-colors duration-150 hover:bg_secondary active:bg_tertiary"
```

### Focus States — Keyboard Navigation

Every interactive element must show a visible focus ring:
- Custom `<button>` elements: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-color-primary-500)] focus-visible:ring-offset-2`
- `<input>`, `<select>`: ui-kit handles these — verify compat wrapper preserves it
- Modal/Drawer: on open, auto-focus the first interactive element (title input, first form field, or close button)
- On close: return focus to the trigger element

Focus trap in modals (already in portal impl — verify):
```tsx
// In Modal/Drawer useEffect on open:
const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
focusable?.[0]?.focus();
```

### Keyboard Shortcuts — Discoverability

Command palette (`Cmd/Ctrl+K`) is the main power-user shortcut but has no hint in the UI.

Add a subtle keyboard hint in the header next to the search trigger:
```tsx
<kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 radius_4 border border_secondary text-[10px] text_tertiary font-mono">
  {isMac ? '⌘K' : 'Ctrl+K'}
</kbd>
```

Add shortcut hints inside the command palette results (right-aligned):
- "Go to Dashboard" → `G then D`
- "Create campaign" → `C`
- "Open notifications" → `N`
These are display-only hints — no actual shortcut wiring needed in this phase.

### Color Contrast — Network Badge Text

Network-colored text on light backgrounds must meet WCAG AA (4.5:1). Audit each:
| Network | Current color | Fix if needed |
|---------|--------------|---------------|
| Google | `#F97316` (orange-500) | On white bg: ratio ~3.1:1 → FAIL. Use `text-[#C2520A]` (orange-800) for text |
| Meta | `#3B82F6` (blue-500) | On white bg: ratio ~3.9:1 → FAIL for small text. Use `fg_link` (#2563EB) |
| ASA | Purple-500 | Verify — likely borderline |
| Axon | Magenta/pink | Verify — likely fails |
| Moloco | Pink-500 | Likely fails on light bg |

Rule: network color is used for **background badges** (`bg_blue_subtle fg_blue_strong`) — never as standalone text color on white/primary background. If network color appears as raw text color (`text-[#...]`), replace with the `_strong` token variant or use a badge pattern.

Audit command:
```bash
grep -r "text-\[#" src/ --include="*.tsx"
```
Each hit must be converted to either a DS token or a `_strong` contrast-safe variant.

### Animation — Consistent Timing

Apply consistent motion tokens across the app:
- Sidebars / Drawers: `transition-transform duration-200 ease-out` (enter) / `duration-150 ease-in` (exit)
- Modals: `transition-opacity duration-150` + `transition-transform duration-150` (scale 0.96 → 1)
- Dropdowns: `duration-100 ease-out`
- Toast: slide-in from bottom-right, `duration-200`
- BulkActionBar (phase 2): `transition-transform duration-200` slide up from bottom

All animations must respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```
Add this to `src/index.css` if not already present.

### Icon-only Buttons — aria-label

Every `<button>` that contains only an icon (no visible text) must have `aria-label`:
```tsx
<button aria-label="Close notification panel" ...><X size={16} /></button>
<button aria-label="Refresh data" ...><RefreshCw size={14} /></button>
<button aria-label="Export CSV" ...><Download size={14} /></button>
<button aria-label="Open column settings" ...><SlidersHorizontal size={14} /></button>
```

Audit command:
```bash
grep -r "aria-label" src/ --include="*.tsx" -l  # files that have it
# Then spot-check icon-only buttons in files NOT in that list
```

### Status Badges — Consistent Tokens

`StatusBadge` component and inline status chips scattered across the app use a mix of token classes and raw colors. Standardize:
| Status | Token pattern |
|--------|--------------|
| Active / Running | `bg_emerald_subtle fg_success border_emerald` |
| Paused | `bg_secondary text_secondary border_secondary` |
| Error / Failed | `bg_red_subtle fg_error border_error` |
| Warning / Expiring | `bg_amber_subtle fg_warning border_amber` |
| Draft | `bg_blue_subtle fg_blue_strong border_blue` |
| Completed | `bg_secondary fg_success border_emerald` |

Apply to: `StatusBadge.tsx`, inline status in `KeyManagement.tsx`, rule cards, campaign rows.

### Inline Edit — UX Completeness

`inline-edit-cell.tsx` gaps:
- Auto-focus input when entering edit mode (`inputRef.current?.focus()`)
- `Escape` key cancels edit and restores original value
- `Enter` key confirms (already exists — verify)
- Clicking outside the cell saves (add `onBlur` → `onSave`)
- Show a brief `✓` success indicator after save (fade out after 1.5s)

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add `prefers-reduced-motion` block |
| `src/components/ui-kit-compat/overlays.tsx` | Focus trap + return focus on close |
| `src/components/layout/AppHeader.tsx` | Keyboard shortcut hint (⌘K badge) |
| `src/components/ui/command-palette.tsx` | Shortcut display hints in results |
| `src/components/ui/StatusBadge.tsx` | Standardize token classes |
| `src/components/networks/inline-edit-cell.tsx` | Focus, Escape, onBlur save, ✓ indicator |
| `src/components/networks/network-campaign-table.tsx` | Row hover state + cursor-pointer |
| `src/pages/AppsList.tsx` | App card hover state |
| `src/pages/NetworksList.tsx` | Network card hover state |
| `src/shared/network-config.ts` | Fix network text colors (contrast-safe variants) |
| Various | Add `aria-label` to icon-only buttons (audit-driven) |

## Success Criteria

- [ ] All custom `<button>` elements have `cursor-pointer` + `hover:bg_secondary` + `active:bg_tertiary`
- [ ] Opening any Modal or Drawer auto-focuses the first interactive element
- [ ] Closing a Modal returns focus to the element that opened it
- [ ] `⌘K` hint visible in header on desktop (≥1024px)
- [ ] No `text-[#hex]` network colors on white/primary backgrounds — all converted to token or badge pattern
- [ ] `prefers-reduced-motion` block in `index.css` — transitions disabled at OS level
- [ ] All icon-only buttons have `aria-label`
- [ ] All status indicators use standardized token pattern from StatusBadge
- [ ] Inline edit cell: Escape cancels, blur saves, ✓ appears briefly after save
- [ ] `npm run build` passes with 0 errors

## Risk Assessment

- **Focus trap in overlays**: the portal-based Modal/Drawer already renders at `document.body`; focus management via `querySelectorAll` on `panelRef` is safe. Verify `panelRef` is attached to the inner panel div, not the portal root.
- **Network color contrast**: changing colors in `network-config.ts` will affect NetworkBadge, sidebar active states, and context bar — test all three after change.
- **Reduced-motion CSS**: placing this in `index.css` as a global rule will override any intentional animations. Scope to `transition-duration` and `animation-duration` only, not `visibility` or `opacity` (those affect layout).
- **`aria-label` audit scope**: grep will find obvious cases; do a manual pass on the 5 network workspace headers and the rule editor modal (highest icon density).
