# Phase 3: Polish & Consistency

Effort: 3h | Risk: Low | Cross-cutting visual hygiene. Run after Phase 2.

---

## 1. CreativeGridCard: fix placeholder images

**File:** `src/components/creative/creative-grid-card.tsx:35`

**Problem:** `<img src={`https://picsum.photos/seed/${item.id}/400/300`}>` renders random landscape photography (mountains, cities) as creative placeholders. This makes the creative library look like a photo gallery, not an ad asset library.

**Fix:** Replace random picsum with a deterministic placeholder that communicates "this is a creative asset":

```tsx
// For image type: use a neutral grey placeholder with image icon
) : (
  <div
    className="flex h-full w-full flex-col items-center justify-center gap-2 bg_secondary"
    style={{ aspectRatio: '4/3' }}
  >
    <ImageIcon size={32} className="text_tertiary" />
    <span className="body_xs text_tertiary">{item.dimensions ?? 'Image'}</span>
  </div>
)}
```

If actual creative thumbnails exist via a real API path, use them. For mock data, the icon placeholder is cleaner than random photos.

Also: reserve thumbnail dimensions to prevent layout shift:
```tsx
<button
  type="button"
  className="relative aspect-[4/3] w-full overflow-hidden bg_secondary"  // aspect-[4/3] prevents CLS
>
```

---

## 2. Typography scale audit

**Problem:** The codebase mixes `text-[10px]`, `text-[11px]`, `text-xs` (12px), and custom sizes. The DS baseline is `body_s` (14px body) with `body_xs` (12px) for support text.

**Fixes:**
- Replace `text-[11px]` labels with `body_xs` class where appropriate (StatCard title, FilterBar actions count, NetworksList key count)
- Replace `text-[10px]` with `body_xxs` if defined, or bump to `body_xs`
- Use `font-medium` (not `font-semibold`) for support labels and meta text — semibold at 11px reads as noise

**Audit targets:**
- `StatCard.tsx:59` — `text-[11px] font-semibold uppercase` → `body_xs font-medium uppercase tracking-wide`
- `AppsList.tsx:161` — `text-xs text_secondary` (OK, already using system class)
- `NetworksList.tsx:147` — `text-xs text_secondary` (OK)
- `creative-grid-card.tsx:63` — `body_xs font-semibold` (OK)
- `creative-grid-card.tsx:79-82` — `body_xxs` (OK if class exists, else `body_xs`)

---

## 3. Tabular numbers audit

**Rule:** All numeric values (spend, installs, ROAS, percentages, counts) must use `tabular-nums` to prevent layout jitter when numbers change.

**Search and fix:**
```bash
# Find metric value displays missing tabular-nums
grep -r "toLocaleString\|toFixed" src/ --include="*.tsx" -l
```

Key locations to verify:
- `AppsList.tsx:181-189` — KPI cells already have `tabular-nums` ✓
- `NetworksList.tsx:121-133` — KPI cells already have `tabular-nums` ✓
- `DashboardMetrics.tsx` — verify StatCard values have `tabular-nums`
- `FunnelKpiStrip.tsx` — verify all metric spans

---

## 4. Button sizing consistency

**Problem:** Pages mix `size="s"`, `size="m"`, `size="icon-s"`, `size="icon-m"` without a clear rule. The result is inconsistent action heights across pages.

**Rule:**
- Primary page CTA: `size="m"` (always)
- Filter row controls (selects, inputs, buttons): all `size="m"` for consistent height alignment
- Toolbar icon buttons: `size="icon-m"`
- Table row actions / compact list actions: `size="s"` or `size="icon-s"`
- Destructive / danger actions in drawers: `size="m"`

**Audit and fix in:**
- `MediaLibraries.tsx` — ensure all FilterBar children (Select, Input, Button) are `size="m"` for height alignment
- `AppsList.tsx` — Radio.Group `size="middle"` → verify it aligns with `Input` height
- `NetworksList.tsx` — no filter row (OK)

---

## 5. Cursor pointer on Card rows

**Problem:** Hoverable cards in AppsList don't show `cursor-pointer`. The `hoverable` AntD prop added a box-shadow on hover but the cursor may not change in the compat layer.

**Fix:** Add `cursor-pointer` class to all clickable Card containers:
```tsx
<Card
  hoverable
  onClick={() => navigate(...)}
  className="... cursor-pointer"  // explicit
>
```

Also ensure `NetworksList` cards get `cursor-pointer` after making them clickable (Phase 2 change).

---

## 6. Focus states: audit interactive elements

Per DS rule `focus-states`: all interactive elements need visible focus rings.

**Check:**
- FilterBar Input: does it show focus ring? (ui-kit should handle this)
- Custom `<button>` elements (e.g. the card-level click target in CreativeGridCard) — add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline_accent_primary`
- Card rows acting as navigation targets — add `tabIndex={0}` + keyboard handler for Enter/Space

---

## 7. Image dimensions and lazy loading

**Files:** `AppsList.tsx:207`, `NetworksList.tsx:71`, `AppSidebar.tsx:38-40`

**Fix:** All `<img>` elements should have:
1. Explicit `width` + `height` (or CSS `aspect-ratio`) to prevent CLS
2. `loading="lazy"` for non-hero images
3. `alt` text describing the image

```tsx
// Network logos in AppsList card
<img
  src={NETWORK_LOGOS[network]}
  alt={network}
  width={20}
  height={20}
  loading="lazy"
  className="h-full w-full rounded-full object-contain"
/>

// Network logo in NetworksList card  
<img
  src={NETWORK_LOGOS[network.key]}
  alt={network.label}
  width={32}
  height={32}
  loading="lazy"
  className="h-full w-full object-contain"
/>
```

---

## 8. Transition: replace `transition: all` with specific properties

**File:** `src/index.css`

Per audit finding at `index.css:175-201,240`: global CSS uses `transition: all` which causes repaints on non-composited properties.

**Fix:** Replace with specific properties:
```css
/* Before */
transition: all 0.2s ease;

/* After */
transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease, box-shadow 150ms ease;
```

Only `opacity`, `transform`, `background-color`, `border-color`, `color`, and `box-shadow` should be transitioned. Never `width`, `height`, `padding`, `margin`.

---

## 9. DataFreshnessIndicator compact mode

**File:** `src/components/ui/data-freshness-indicator.tsx`

Add a `compact` boolean prop. When `compact={true}`, render as inline text only:
```tsx
// compact mode — just a status dot + text
<span className="inline-flex items-center gap-1.5 body_xs text_tertiary">
  <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', isStale ? 'bg_amber_medium' : 'bg_emerald_medium')} />
  {isStale ? 'Stale' : `Synced ${timeAgo}`}
</span>

// full mode (existing) — keeps the card surface
```

This enables Phase 2's MediaLibraries restructure where DataFreshnessIndicator moves into the slim toolbar.

---

## Validation

Final check:
```bash
npm run build && npm run lint
```

Manual review checklist:
- [ ] Apps page: cards are compact, no double-border KPI cells, no pulsing logo
- [ ] Networks page: cards are compact, no description paragraph, whole card is clickable
- [ ] Creative Library: ≤2 control surfaces before content, no random photo placeholders
- [ ] Dashboard: section headers use semantic tokens, StatCard values are appropriately sized
- [ ] All interactive rows show `cursor-pointer` on hover
- [ ] No `animate-pulse` on structural elements
- [ ] FilterBar renders as compact sunken toolbar on all pages
