---
phase: "4a"
title: "Campaign Factory Wizard Shell + Steps 1–2"
status: pending
priority: P2
effort: 3.5h
dependencies: [phase-02-template-management-tab, phase-03-creative-set-builder]
---

# Phase 4a: Campaign Factory Wizard Shell + Steps 1–2

## Overview

Build the wizard drawer shell (step indicator, back/next footer, close/reset) and the first two steps: Step 1 (template picker with quick-create shortcut) and Step 2 (creative set multi-select with inline builder). Establishes `use-campaign-factory.ts` state hook shared across all wizard components. Step 3 and preview tree are in Phase 4b.

## Requirements

- Functional:
  - Drawer ~800px wide (full-width on mobile)
  - Step indicator: 3 numbered circles — active, completed, pending states
  - Step 1: browse/search templates by name, select one, quick-create shortcut, navigate to Templates tab
  - Step 2: multi-select creative sets, create new set inline via nested sheet overlay
  - Back/Next navigation; cannot proceed step without required selection
  - Wizard state resets on drawer close
- Non-functional:
  - Wizard state in `use-campaign-factory.ts` — ephemeral (no localStorage)
  - Step 3 and result rendered as stubs until Phase 4b/5 complete
  - Files ≤ 200 lines each

## Architecture

```
campaign-factory-drawer.tsx           (new, ~180 lines — wizard shell)
  └── factory-step-template.tsx      (new, ~160 lines — step 1)
  └── factory-step-creative-sets.tsx (new, ~170 lines — step 2)
  [Step 3 stub → Phase 4b] [Result stub → Phase 5]

use-campaign-factory.ts               (new, ~120 lines — shared state hook)
```

**State shape in `use-campaign-factory.ts`:**
```typescript
interface FactoryState {
  step: 1 | 2 | 3 | 'result';
  selectedTemplateId: string | null;
  selectedSetIds: string[];
  config: {
    strategy: GenerationStrategy;
    namingPattern: string;
  };
  preview: GeneratedCampaignPreview[];
  job: GenerationJob | null;
}
```

## Related Code Files

- Create: `src/components/networks/meta/campaign-factory/campaign-factory-drawer.tsx`
- Create: `src/components/networks/meta/campaign-factory/factory-step-template.tsx`
- Create: `src/components/networks/meta/campaign-factory/factory-step-creative-sets.tsx`
- Create: `src/components/networks/meta/campaign-factory/use-campaign-factory.ts`
- Read first: `src/components/networks/meta/meta-types.ts` (GenerationConfig, GeneratedCampaignPreview, GenerationJob)
- Read first: `src/shared/mock-data.ts` (mockCampaignTemplates from Phase 1)
- Read first: `src/components/networks/meta/campaign-factory/use-creative-sets.ts` (Phase 3)
- Read first: `src/components/networks/meta/campaign-factory/creative-set-card.tsx` (Phase 3, for Step 2)

## Implementation Steps

### 1. Create `use-campaign-factory.ts`

```typescript
export function useCampaignFactory() {
  const [step, setStep] = useState<1 | 2 | 3 | 'result'>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [config, setConfig] = useState({
    strategy: 'ABO' as GenerationStrategy,
    namingPattern: '{template} - {set_name} - W{week}',
  });
  const [preview, setPreview] = useState<GeneratedCampaignPreview[]>([]);
  const [job, setJob] = useState<GenerationJob | null>(null);

  const selectedTemplate = mockCampaignTemplates.find(t => t.id === selectedTemplateId) ?? null;
  // Merge saved + mock sets, dedup by id
  const { sets: savedSets } = useCreativeSets();
  const selectedSets = [...savedSets, ...mockCreativeSets.filter(m => !savedSets.find(s => s.id === m.id))]
    .filter(s => selectedSetIds.includes(s.id));

  const canProceedStep1 = selectedTemplateId !== null;
  const canProceedStep2 = selectedSetIds.length > 0;

  // Stubs — filled in Phase 4b (generatePreview) and Phase 5 (startGeneration)
  const generatePreview = () => {};
  const startGeneration = async () => {};

  const reset = () => {
    setStep(1); setSelectedTemplateId(null); setSelectedSetIds([]);
    setConfig({ strategy: 'ABO', namingPattern: '{template} - {set_name} - W{week}' });
    setPreview([]); setJob(null);
  };

  return { step, setStep, selectedTemplateId, setSelectedTemplateId,
           selectedSetIds, setSelectedSetIds, config, setConfig,
           preview, job, selectedTemplate, selectedSets,
           canProceedStep1, canProceedStep2, generatePreview, startGeneration, reset };
}
```

### 2. Create `campaign-factory-drawer.tsx` (wizard shell)

```tsx
// Props: open: boolean, onClose: () => void, onNavigateToTemplates: () => void

// Layout:
// ┌─ Header ──────────────────────────────────────────────┐
// │ Campaign Factory                            [✕ Close] │
// │ ①Templates ──── ②Creative Sets ──── ③Configure        │
// └───────────────────────────────────────────────────────┘
// ┌─ Body (scrollable) ──────────────────────────────────┐
// │ <Step component based on step state>                  │
// └───────────────────────────────────────────────────────┘
// ┌─ Footer ──────────────────────────────────────────────┐
// │ [Cancel]          [← Back]      [Next →] / [Generate] │
// └───────────────────────────────────────────────────────┘

// Step indicator: 3 numbered circles + connecting line
// Active: filled primary; Completed: ✓; Pending: outlined
// aria-current="step" on active; role="list" on container
// Drawer: role="dialog", aria-label="Campaign Factory"

// Step routing:
// step 1 → <FactoryStepTemplate onNavigateToTemplates={onNavigateToTemplates} />
// step 2 → <FactoryStepCreativeSets />
// step 3 → <div className="p-6 text_secondary">Step 3 coming soon…</div>  ← stub
// 'result' → <div className="p-6 text_secondary">Result coming soon…</div> ← stub

// Footer buttons:
// step 1: [Cancel]   [Next → Creative Sets]  (disabled if !canProceedStep1)
// step 2: [← Back]  [Next → Configure]       (disabled if !canProceedStep2)
// step 3: [← Back]  [Generate ({preview.length} campaigns)]

// On close: call factory.reset() then onClose
```

### 3. Create `factory-step-template.tsx` (Step 1)

```tsx
// Props: onNavigateToTemplates: () => void

// Layout:
// ┌─ Toolbar ──────────────────────────────────────────────┐
// │ [Search templates…]    [Filter: Objective ▾]           │
// │ [+ Quick Create]  [Manage Templates ↗]                 │
// └────────────────────────────────────────────────────────┘
// ┌─ Grid: 2 cols desktop, 1 col mobile ──────────────────┐
// │ Card: Selected = ring border (brand) + ✓ overlay       │
// │ Name (bold) · [Objective badge] · [CBO|ABO badge]      │
// │ {usageCount} uses · {countries joined}                 │
// └────────────────────────────────────────────────────────┘
// Empty state: "No templates yet. [+ Create your first template]"

// Data: mockCampaignTemplates (Phase 1 mock)
// Click card → factory.setSelectedTemplateId(t.id)
// "Quick Create" → <MetaTemplateDrawer /> in nested sheet (local open state)
// "Manage Templates ↗" → calls onNavigateToTemplates() prop
```

### 4. Create `factory-step-creative-sets.tsx` (Step 2)

```tsx
// Layout:
// ┌─ Toolbar ──────────────────────────────────────────────┐
// │ [Search sets…]          [{N} selected]                 │
// │ [+ New Creative Set]    [Select All] / [Clear]         │
// └────────────────────────────────────────────────────────┘
// ┌─ List: CreativeSetCards with checkbox overlay ────────┐
// │ Click card or checkbox → toggle in selectedSetIds      │
// └────────────────────────────────────────────────────────┘
// Selected pill strip below list

// Data: [...savedSets, ...mockCreativeSets] deduped by id
// "+ New Creative Set" → <CreativeSetBuilderDrawer /> as nested sheet (z above wizard)
// On save → auto-add new set id to selectedSetIds
// Empty state: "No creative sets yet. [+ New Creative Set]"
```

## Success Criteria

- [ ] Wizard drawer opens/closes cleanly; close resets all state
- [ ] Step indicator: active (filled), completed (✓), pending (outlined) — correct transitions
- [ ] `aria-current="step"` on active step; drawer has `role="dialog"` + `aria-label`
- [ ] Step 1: all 3 mock templates render with correct data
- [ ] Step 1: click selects template (ring + ✓); click again deselects
- [ ] Step 1: search filters by name (case-insensitive)
- [ ] Step 1: "Manage Templates ↗" calls `onNavigateToTemplates`
- [ ] Step 2: sets from `useCreativeSets` + `mockCreativeSets` render (deduped)
- [ ] Step 2: multi-select toggles correctly; count in toolbar updates
- [ ] Step 2: "+ New Creative Set" opens nested `CreativeSetBuilderDrawer` overlay
- [ ] Back/Next navigation preserves selections between steps
- [ ] Next disabled when required selection missing
- [ ] Step 3/result stubs render without TS errors
- [ ] `npx tsc --noEmit` passes

## Risk Assessment

- **Nested sheet z-index:** Use `z-[60]` on the nested `CreativeSetBuilderDrawer` overlay — above the wizard's z-index. The wizard shell must have `overflow-visible` or use a portal to avoid clipping.
- **`selectedSets` dedup:** `[...savedSets, ...mockCreativeSets.filter(m => !savedSets.find(s => s.id === m.id))]` — correct dedup pattern. Order: saved sets first (user-owned), mock sets as fallback.
- **Step 3 stub:** `step === 3` renders a `<div>` stub — valid JSX, no TS issue. Phase 4b replaces it with `<FactoryStepGenerateConfig />`.
