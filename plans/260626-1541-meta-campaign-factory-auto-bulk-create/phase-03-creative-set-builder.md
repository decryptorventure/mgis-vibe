---
phase: 3
title: "Creative Set Builder"
status: pending
priority: P1
effort: 4h
dependencies: [phase-01-types-and-mock-data]
---

# Phase 3: Creative Set Builder

## Overview

Build the Creative Set management surface: a `creative-set-builder-drawer.tsx` that walks the user through filter criteria → preview matched creatives → confirm as static snapshot, plus a reusable `creative-set-card.tsx` display component. Creative sets persist in localStorage.

## Requirements

- Functional:
  - Filter criteria form: network, type (image/video), minCTR, minROAS, minSpend, googleMark
  - "Preview" button resolves criteria against `mockMediaItems` and shows matched grid
  - User can deselect individual items from the preview
  - "Save as Set" confirms the selection as static `mediaIds[]`
  - Saved sets listed with `creative-set-card.tsx` (name, count, thumbnail strip)
  - Edit set → reopen builder pre-populated with saved criteria
  - Delete set with confirm
- Non-functional:
  - Sets persisted in `localStorage` via `use-creative-sets.ts` (self-contained hook)
  - Preview resolves client-side against mock (no async delay needed for mock)
  - Files ≤ 200 lines each

## Architecture

```
creative-set-builder-drawer.tsx   (new, ~190 lines)
  step 1: filter form (inline, not a sub-drawer)
  step 2: preview grid (reuses creative-grid-card.tsx)
  save → persists to localStorage

creative-set-card.tsx             (new, ~80 lines)
  props: set, onEdit, onDelete
  shows: name | count | thumbnail strip (max 4) | description

use-creative-sets.ts              (new, ~60 lines)
  manages sets in localStorage
  exports: sets[], saveSet, deleteSet, updateSet
```

**localStorage key:** `nms_creative_sets` — managed by `use-creative-sets.ts` directly (no shared hook; `usePersistentFilter` does not exist in this codebase).

**Client-side filter resolution:**
```typescript
function resolveCreativeSet(criteria: CreativeSetCriteria, media: MediaItem[]): MediaItem[] {
  return media.filter(m => {
    if (criteria.network?.length && !criteria.network.includes(m.network)) return false;
    if (criteria.type?.length && !criteria.type.includes(m.type)) return false;
    if (criteria.minCtr != null && (m.ctr ?? 0) < criteria.minCtr) return false;
    if (criteria.minRoas != null && (m.roas ?? 0) < criteria.minRoas) return false;
    if (criteria.minSpend != null && (m.spend ?? 0) < criteria.minSpend) return false;
    if (criteria.googleMark === 'good' && m.googleMark !== 'good') return false;
    return true;
  });
}
```

## Related Code Files

- Create: `src/components/networks/meta/campaign-factory/creative-set-builder-drawer.tsx`
- Create: `src/components/networks/meta/campaign-factory/creative-set-card.tsx`
- Create: `src/components/networks/meta/campaign-factory/use-creative-sets.ts`
- Read first: `src/shared/mock-data.ts` → `mockMediaItems` (type: `MediaItem`, fields: id, name, type, network, thumbnail, ctr, roas, spend, googleMark)
- Read first: `src/components/creative/creative-grid-card.tsx` (reuse for preview)


## Implementation Steps

### 1. Create `use-creative-sets.ts`

```typescript
import { useState, useEffect } from 'react';
import type { CreativeSet } from '../meta-types';

const STORAGE_KEY = 'nms_creative_sets';

function loadFromStorage(): CreativeSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useCreativeSets() {
  const [sets, setSets] = useState<CreativeSet[]>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  }, [sets]);

  const saveSet = (set: CreativeSet) => {
    setSets(prev => {
      const idx = prev.findIndex(s => s.id === set.id);
      return idx >= 0 ? prev.map(s => s.id === set.id ? set : s) : [...prev, set];
    });
  };

  const deleteSet = (id: string) => setSets(prev => prev.filter(s => s.id !== id));

  return { sets, saveSet, deleteSet };
}
```

### 2. Create `creative-set-card.tsx`

```tsx
// Props: set: CreativeSet, onEdit: () => void, onDelete: () => void
// Layout:
// ┌──────────────────────────────────────────────────────┐
// │ [thumbnail strip: max 4 images, w-10 h-10 each]      │
// │ Name (bold)                          [Edit] [Delete]  │
// │ description (text_secondary, truncate 1 line)         │
// │ {count} creatives · Created {date}                    │
// └──────────────────────────────────────────────────────┘
// thumbnail strip: uses actual image URLs from mockMediaItems
// if count > 4: show "+N more" pill after the 4th thumbnail
```

### 3. Create `creative-set-builder-drawer.tsx`

**Two-step flow within drawer (not sub-pages — use conditional rendering):**

**Step 1 — Filter** (default view):
```
Drawer title: "New Creative Set" / "Edit: {name}"

Form fields (stacked, compact):
  Set Name       [Input, required]
  Description    [Input, optional]
  --- Filter Criteria ---
  Network        [Select multi: meta | google | asa | axon | moloco]
  Type           [Checkbox: image | video]
  Min CTR        [NumberInput, step 0.1, placeholder "e.g. 1.5%"]
  Min ROAS       [NumberInput, step 0.1, placeholder "e.g. 2.0"]
  Min Spend      [NumberInput, step 1000, placeholder "e.g. 50000"]
  Google Mark    [Radio: all | good only]

[Cancel]   [Preview Results →]  ← footer buttons
```

**Step 2 — Preview** (after Preview click):
```
Header: "Preview: {N} matches" (with Back chevron)

Grid of matched items (2-3 cols, square thumbnails):
  Each item: checkbox (selected by default), thumbnail, name, type badge
  
  "Select All" / "Deselect All" link
  
  Empty state: "No creatives match these criteria. Adjust filters."

Footer: [{count} selected]   [← Back to Filters]   [Save Set ({count})]
```

**On Save:**
1. Build `mediaIds = selectedItems.map(i => i.id)`
2. Create `CreativeSet` object with `id: 'cs-' + Date.now()`
3. Call `useCreativeSets().saveSet(set)`
4. Close drawer

### 4. Export barrel

Add to `src/components/networks/meta/campaign-factory/index.ts` (create if not exists):
```typescript
export { CreativeSetCard } from './creative-set-card';
export { CreativeSetBuilderDrawer } from './creative-set-builder-drawer';
export { useCreativeSets } from './use-creative-sets';
```

## Success Criteria

- [ ] `use-creative-sets.ts` saves/loads sets from localStorage key `nms_creative_sets`
- [ ] Filter step renders all 6 criteria fields with correct input types
- [ ] "Preview Results" resolves against `mockMediaItems` and shows grid
- [ ] Deselecting items reduces the save count correctly
- [ ] Empty-state shown when no mock items match
- [ ] "Save Set" persists set and closes drawer
- [ ] `creative-set-card.tsx` shows thumbnail strip + count + edit/delete actions
- [ ] Edit reopens drawer pre-populated with saved criteria
- [ ] `npx tsc --noEmit` passes

## Risk Assessment

- **`mockMediaItems` fields:** CONFIRMED by scout — `MediaItem` has `ctr`, `roas`, `spend`, `googleMark` (all optional). Filter resolution logic is safe to implement as-is; use `?? 0` defaults for numeric comparisons.
- **`creative-grid-card.tsx` props mismatch:** If existing grid card requires props not on `MediaItem`, build a lightweight inline thumbnail component instead rather than forcing a prop-shape.
- **localStorage quota:** Each creative set stores only `mediaIds[]` (strings) + metadata. Even 50 sets with 20 IDs each is ~5KB — well within 5MB quota.
