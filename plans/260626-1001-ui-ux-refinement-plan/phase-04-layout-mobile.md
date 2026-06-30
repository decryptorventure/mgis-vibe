---
phase: 4
title: "Layout & Mobile Responsiveness"
status: pending
priority: P2
dependencies: [phase-03]
---

# Phase 04: Layout & Mobile Responsiveness

## Overview

Fix all layout issues that break the experience below 768px. The app targets desktop-first but must be usable on tablets (768px) and basic mobile (375px) for key flows. Campaign wizard step sidebar, network context bar overflow, and table horizontal scroll indicator are the three critical gaps.

## Requirements

### Campaign Wizard — Responsive Step Sidebar

At <768px the vertical step sidebar (fixed ~220px wide) pushes the form content off screen.

Fix: below `md` breakpoint, replace sidebar with a **horizontal step indicator bar** (stepper dots/pills) at the top of the modal content.

Desktop (≥768px): keep existing vertical sidebar.
Mobile (<768px): horizontal pill stepper:
```
① Basics  ② Budget  ③ Targeting  ④ Creatives  ⑤ Tracking  ⑥ Review
```
Active step: `bg_blue_subtle fg_blue_strong border_blue radius_full px-3 py-1 text-xs font-semibold`
Completed step: `fg_success` checkmark icon only
Upcoming step: `text_tertiary` dot

### Network Context Bar — Mobile Overflow

`NetworkContextBar` renders 5 network tabs horizontally. At <768px these overflow.

Fix: enable `overflow-x-auto` + `scrollbar-hide` on the tab container. Add a subtle right-edge gradient fade to indicate scroll-ability:
```tsx
<div className="relative">
  <div className="flex overflow-x-auto scrollbar-hide gap-1 px-3 sm:px-4">
    {/* tabs */}
  </div>
  {/* fade indicator */}
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--ds-bg-primary)] to-transparent pointer-events-none" />
</div>
```

### Tables — Mobile Horizontal Scroll Indicator

Campaign tables on mobile have `overflow-x: auto` but no visual cue. Add:
- A sticky left column (campaign name) so it stays visible while scrolling horizontally
- A subtle shadow on the left column when table is scrolled (`box-shadow: 4px 0 8px -2px var(--ds-border-secondary)`)
- A "scroll for more →" label that appears on small screens below the table header, then disappears after first scroll

### Network Workspace Shell — Responsive Header

At <640px the workspace header shows: app selector + network badge + date picker + 3 action buttons.
This overflows. Fix:
- Collapse date picker into an icon button `<Calendar size={16} />` on mobile — opens a popover
- Move "Export" and "Column settings" into an overflow menu (`<MoreHorizontal />` button) on mobile
- Keep "Create campaign" CTA visible at all sizes (it's the primary action)

### Sidebar — Touch Behavior

On mobile, the sidebar renders as a Drawer (already implemented via portal). Ensure:
- Tap on backdrop closes it (already in compat layer)
- Swipe-left from left edge opens sidebar (add `touchstart` / `touchmove` handler with 20px edge threshold)
- Body scroll locked when sidebar drawer is open (add `overflow-hidden` to `document.body` on open)

### Campaign Wizard Modal — Mobile Height

At mobile heights (<700px, e.g. landscape phone), the campaign wizard modal clips.
Fix: change max-height from `70vh` to `calc(100dvh - 32px)` and ensure the content area scrolls independently.

### Form Inputs — Touch Target Size

Audit all form inputs in campaign wizard and rule editor:
- Input height must be ≥ 44px (use `size="m"` on all ui-kit inputs — already 44px)
- Select dropdowns: same
- Checkbox hit areas: wrap in a `<label>` that's at least 44×44px

### Spacing Audit — 8dp Grid

All section padding/gap values must follow the 4/8px rhythm:
- Section padding: `p-4` (16px) or `p-6` (24px) — not `p-5` unless intentional
- Gap between cards: `gap-3` (12px) or `gap-4` (16px) — not `gap-2.5`
- Form row spacing: `space-y-4` (16px) for standard, `space-y-3` (12px) for compact

Do a grep pass for non-rhythm values (`p-5`, `gap-2.5`, `space-y-5`) and standardize.
Exception: `py-3.5` for table rows (intentional — maps to 14px for data density).

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/campaign-create-page.tsx` | Responsive step layout (sidebar → pills at mobile) |
| `src/components/campaign-wizard/campaign-wizard-modal.tsx` | Mobile height fix (`100dvh`) |
| `src/components/layout/NetworkContextBar.tsx` | Overflow-x-auto + fade gradient |
| `src/components/networks/network-workspace-shell.tsx` | Responsive header collapse |
| `src/components/networks/network-campaign-table.tsx` | Sticky first column + scroll indicator |
| `src/components/layout/AppSidebar.tsx` | Swipe-to-open + body scroll lock |
| `src/components/ui-kit-compat/overlays.tsx` | Modal max-height `100dvh` |

## Implementation Steps

### 1. Responsive stepper in campaign-create-page.tsx

```tsx
// Add at top of the form layout
<div className="md:hidden flex items-center gap-1.5 px-4 py-3 border-b border_secondary overflow-x-auto scrollbar-hide">
  {WIZARD_STEPS.map((step, i) => (
    <button
      key={step.id}
      onClick={() => i < currentStep ? setCurrentStep(i) : undefined}
      className={cn(
        'shrink-0 flex items-center gap-1.5 px-2.5 py-1 radius_full text-xs font-medium transition-colors',
        i === currentStep ? 'bg_blue_subtle fg_blue_strong border border_blue' :
        i < currentStep ? 'text_tertiary' : 'text_tertiary opacity-40'
      )}
    >
      {i < currentStep ? <Check size={10} className="fg_success" /> : <span>{i + 1}</span>}
      <span className={i !== currentStep ? 'hidden sm:inline' : ''}>{step.label}</span>
    </button>
  ))}
</div>
// Hide the vertical sidebar on mobile
<div className="hidden md:flex ..."> {/* existing sidebar */} </div>
```

### 2. Sticky column in network-campaign-table.tsx

```tsx
// First column (campaign name):
<th className="sticky left-0 z-10 bg_primary border-r border_secondary ...">Name</th>
<td className="sticky left-0 z-10 bg_primary border-r border_secondary ...">...</td>

// Detect scroll to add shadow:
const [scrolled, setScrolled] = useState(false);
<div onScroll={e => setScrolled((e.target as HTMLElement).scrollLeft > 0)} ...>
  // Apply shadow class to sticky cells when scrolled:
  // className={cn('sticky left-0 ...', scrolled && 'shadow-[4px_0_8px_-2px_var(--ds-border-secondary)]')}
```

### 3. Swipe-to-open sidebar

```tsx
// In AppSidebar.tsx
useEffect(() => {
  if (!isMobile) return;
  let startX = 0;
  const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
  const onTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (startX < 20 && dx > 50) onOpen(); // swipe right from left edge
  };
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
  return () => { document.removeEventListener('touchstart', onTouchStart); document.removeEventListener('touchend', onTouchEnd); };
}, [isMobile, onOpen]);
```

Body scroll lock:
```tsx
useEffect(() => {
  document.body.style.overflow = mobileOpen ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [mobileOpen]);
```

### 4. Spacing audit — grep pass

```bash
grep -r "p-5\|gap-2\.5\|space-y-5\|py-5\|px-5" src/ --include="*.tsx" --include="*.ts"
```
Review each result: replace with nearest 4/8 rhythm value unless it's a deliberate exception.

### 5. Responsive workspace header

```tsx
// Date picker: hide label + shrink on mobile
<div className="hidden sm:block">{/* DateRangePicker full */}</div>
<button className="sm:hidden flex items-center justify-center w-8 h-8 radius_8 border border_primary text_secondary">
  <Calendar size={15} />
</button>

// Export + Column settings: in overflow menu on mobile
<div className="hidden sm:flex gap-2">{/* Export, Columns buttons */}</div>
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="sm:hidden ..."><MoreHorizontal size={16} /></button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={onExport}>Export</DropdownMenuItem>
    <DropdownMenuItem onClick={onColumns}>Columns</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Success Criteria

- [ ] Campaign wizard at 375px shows horizontal pill stepper (not the sidebar)
- [ ] Wizard form content fully visible and scrollable at 375px
- [ ] Network context bar scrolls horizontally on mobile with fade gradient visible
- [ ] Campaign table sticky first column stays fixed during horizontal scroll; shadow appears when scrolled
- [ ] Sidebar opens on swipe-right from left edge of screen on mobile
- [ ] Body scroll locked when sidebar drawer is open on mobile
- [ ] Workspace header on 375px shows icon-only date picker; Export/Columns in overflow menu
- [ ] All section padding/gap values follow 4/8px grid (no `p-5` or `gap-2.5` exceptions unless justified)
- [ ] No horizontal overflow (`overflow-x: hidden` not used as a band-aid) at 375px or 768px
- [ ] `npm run build` passes with 0 errors

## Risk Assessment

- **Sticky column + CSS**: `position: sticky` in a horizontally scrolling table requires `overflow-x: auto` on the *table wrapper*, not on a parent. If a parent has `overflow: hidden` it will break sticky. Verify wrapper chain.
- **dvh unit**: `100dvh` supported in all modern browsers (Chrome 108+, Safari 15.4+, Firefox 101+). Safe for B2B internal tool.
- **Swipe handler conflict**: The swipe-to-open gesture must not conflict with table horizontal scroll. Guard: only activate if `startX < 20` (within 20px of left edge) to avoid interfering with table swipes.
- **Spacing audit scope**: Only change values in `src/` — do not touch `node_modules` or generated files. Use grep to scope precisely before editing.
