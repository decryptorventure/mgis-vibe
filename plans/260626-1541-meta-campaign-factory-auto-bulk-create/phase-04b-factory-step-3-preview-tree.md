---
phase: "4b"
title: "Factory Step 3 + Preview Tree"
status: pending
priority: P2
effort: 3.5h
dependencies: [phase-04-campaign-factory-wizard]
---

# Phase 4b: Factory Step 3 + Preview Tree

## Overview

Complete the wizard with Step 3 (ABO/CBO strategy toggle, naming pattern editor with live token substitution, and generation summary) and the collapsible `generation-preview-tree.tsx` component. Replaces the Phase 4a stub. Preview tree visualizes the full campaign hierarchy before the user commits to generation.

## Requirements

- Functional:
  - ABO/CBO toggle updates preview tree in real time
  - Naming pattern input with clickable token chips (`{template}`, `{set_name}`, `{week}`, `{date}`); live substitution preview below input
  - Preview tree: collapsible campaign → adset → ad hierarchy (default: campaigns expanded, adsets collapsed)
  - Summary: "{N} campaigns · {M} ad sets · {P} ads"
  - Preflight warning block shown when issues exist (empty sets, naming conflicts)
  - "Generate" button triggers `startGeneration()` (Phase 5 fills the full engine)
- Non-functional:
  - Preview recomputes synchronously on config change (no debounce for mock)
  - Collapse/expand via CSS `max-height` transition (no animation library)
  - Files ≤ 200 lines each

## Architecture

```
factory-step-generate-config.tsx  (new, ~190 lines — step 3)
  └── generation-preview-tree.tsx (new, ~120 lines — collapsible tree)

use-campaign-factory.ts           (modify: fill generatePreview() stub from Phase 4a)
campaign-factory-drawer.tsx       (modify: replace step 3 stub with <FactoryStepGenerateConfig />)
```

## Related Code Files

- Create: `src/components/networks/meta/campaign-factory/factory-step-generate-config.tsx`
- Create: `src/components/networks/meta/campaign-factory/generation-preview-tree.tsx`
- Modify: `src/components/networks/meta/campaign-factory/campaign-factory-drawer.tsx` — replace `step === 3` stub
- Modify: `src/components/networks/meta/campaign-factory/use-campaign-factory.ts` — implement inline `generatePreview()`
- Read first: `src/components/networks/meta/meta-types.ts` (GeneratedCampaignPreview, GeneratedAdSetPreview)
- Read first: `src/components/networks/meta/campaign-factory/use-campaign-factory.ts` (state shape from Phase 4a)

## Implementation Steps

### 1. Fill `generatePreview()` stub in `use-campaign-factory.ts`

Inline implementation until Phase 5 lands `generation-engine.ts`:

```typescript
const generatePreview = useCallback(() => {
  if (!selectedTemplate || selectedSets.length === 0) { setPreview([]); return; }

  const applyTokens = (pattern: string, setName: string) =>
    pattern
      .replace(/{template}/g, selectedTemplate.name)
      .replace(/{set_name}/g, setName)
      .replace(/{objective}/g, selectedTemplate.objective)
      .replace(/{week}/g, String(Math.ceil(new Date().getDate() / 7)))
      .replace(/{date}/g, new Date().toISOString().slice(0, 10));

  if (config.strategy === 'ABO') {
    setPreview(selectedSets.map(set => ({
      campaignName: applyTokens(config.namingPattern, set.name),
      adsets: [{ adsetName: set.name, mediaIds: set.mediaIds, adCount: set.mediaIds.length }],
      totalAds: set.mediaIds.length,
    })));
  } else {
    setPreview([{
      campaignName: applyTokens(config.namingPattern, selectedSets.map(s => s.name).join('+')),
      adsets: selectedSets.map(set => ({ adsetName: set.name, mediaIds: set.mediaIds, adCount: set.mediaIds.length })),
      totalAds: selectedSets.reduce((sum, set) => sum + set.mediaIds.length, 0),
    }]);
  }
}, [selectedTemplate, selectedSets, config]);
```

Phase 5 replaces this with `generateABO` / `generateCBO` from `generation-engine.ts`.

### 2. Create `factory-step-generate-config.tsx` (Step 3)

```tsx
// Two columns desktop (stack on mobile): grid grid-cols-1 lg:grid-cols-2 gap-6

// Left — Config panel:
//   Strategy section:
//   ● ABO — {selectedSets.length} campaigns (1 campaign per set)
//   ○ CBO — 1 campaign with {selectedSets.length} ad sets
//   onChange → factory.setConfig({...config, strategy}) + factory.generatePreview()
//
//   Naming Pattern section:
//   Token chips (clickable, append to input end):
//     [{template}]  [{set_name}]  [{week}]  [{date}]
//   TextInput value=config.namingPattern; onChange updates config
//   Preview line: "{live-substituted-name}" (text_secondary, italic, truncate)
//   Validation error: "Pattern cannot produce an empty name" (red, below input)
//
//   Summary:
//   {preview.length} campaigns · {totalAdsets} ad sets · {totalAds} ads
//
//   Preflight (yellow InfoBox, only when issues.length > 0):
//   ⚠ {issue.message}

// Right — Preview tree:
//   <GenerationPreviewTree preview={preview} strategy={config.strategy} />

// useEffect triggers:
useEffect(() => { factory.generatePreview(); }, [factory.config.strategy, factory.config.namingPattern]);
// Also call on mount when step becomes 3 — ensure preview is populated immediately.
```

**Naming pattern validation:**
```typescript
const previewName = config.namingPattern
  .replace(/{template}/g, selectedTemplate?.name ?? 'Template')
  .replace(/{set_name}/g, 'Set')
  .replace(/{week}/g, '26')
  .replace(/{date}/g, '2026-06-26');
const patternIsValid = previewName.trim().length > 0;
```

**Preflight issues** (derive without Phase 5's engine):
```typescript
const preflightIssues: GenerationPreflightIssue[] = [
  ...selectedSets.filter(s => s.mediaIds.length === 0)
    .map(s => ({ type: 'warning' as const, message: `"${s.name}" has 0 creatives — ad set will be empty.` })),
  ...(!patternIsValid ? [{ type: 'error' as const, message: 'Naming pattern produces empty campaign name.' }] : []),
];
```

Disable Generate button if `preflightIssues.some(i => i.type === 'error')`.

### 3. Create `generation-preview-tree.tsx`

```tsx
// Props: preview: GeneratedCampaignPreview[], strategy: GenerationStrategy

// Toolbar: [Expand All] | [Collapse All]
//   Total: {totalCampaigns} campaigns · {totalAdsets} ad sets · {totalAds} ads

// Tree structure:
// ▼ [Campaign icon] "App Installs - Top Videos - W26"  [ABO badge]
//   ▼ [AdSet icon] "Top Videos — VN, TH"  [2 ads]
//     [img 14px] video_1.mp4
//     [img 14px] video_3.mp4
// ▼ [Campaign icon] "App Installs - Q2 Banners - W26"
//   ...

// State:
// expandedCampaigns: Set<string>  — default: all campaign names
// expandedAdsets: Set<string>     — default: empty (adsets collapsed)

// Expand/collapse CSS pattern (no library):
// <div style={{ maxHeight: expanded ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.2s ease' }}>

// Row structure: flex items-center gap-1.5 py-0.5 text-sm
// Indent: pl-0 (campaign), pl-5 (adset), pl-10 (ad item)
// Campaign row: chevron toggle + Campaign icon (Layers from lucide) + name + badge
// Adset row: chevron toggle + Users icon + name + "{N} ads" count
// Ad row: small thumbnail (16×16, object-cover) + filename

// Thumbnail resolution: mockMediaItems.find(m => m.id === mediaId)?.thumbnail ?? placeholder

// Empty state: <p className="text_tertiary p-4">Configure settings to see preview</p>
```

### 4. Replace Step 3 stub in `campaign-factory-drawer.tsx`

Change the `step === 3` stub:
```tsx
// Before (Phase 4a stub):
// step === 3 → <div className="p-6 text_secondary">Step 3 coming soon…</div>

// After (Phase 4b):
// step === 3 → <FactoryStepGenerateConfig />
import { FactoryStepGenerateConfig } from './factory-step-generate-config';
```

## Success Criteria

- [ ] Step 3 renders in wizard (stub removed from Phase 4a)
- [ ] ABO toggle: preview shows {N} separate campaigns (1 per selected set)
- [ ] CBO toggle: preview shows 1 campaign with {N} ad sets
- [ ] Naming pattern input: typing updates live preview name in real time
- [ ] Token chip click appends token to pattern input
- [ ] Preview tree renders correct hierarchy for both ABO and CBO modes
- [ ] Campaign rows expand/collapse; "Expand All" / "Collapse All" buttons work
- [ ] Preflight warning shows for sets with 0 mediaIds
- [ ] "Generate" button disabled when pattern produces empty name or preflight has errors
- [ ] `npx tsc --noEmit` passes

## Risk Assessment

- **Two-column layout on narrow drawers:** `grid grid-cols-1 lg:grid-cols-2` — single column on mobile and small screens. Config panel comes first; preview tree below. Tree height limit: `max-h-[400px] overflow-y-auto` to avoid overflowing drawer.
- **Token chip "append to input":** Appending at end of string is simpler than cursor position — use `factory.setConfig({ namingPattern: config.namingPattern + token })`. Acceptable for MVP.
- **`generatePreview()` called twice on step change:** `useEffect` fires on both step change and config change. Add `step === 3` guard inside the effect to prevent spurious calls when on steps 1 and 2.
- **Phase 5 replacement:** When Phase 5 lands `generation-engine.ts`, replace the inline `generatePreview` logic in `use-campaign-factory.ts` with `generateABO`/`generateCBO` imports. No changes needed to the Step 3 component itself.
