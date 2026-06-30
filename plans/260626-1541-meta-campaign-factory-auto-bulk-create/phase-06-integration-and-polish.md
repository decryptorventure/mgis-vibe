---
phase: 6
title: "Integration + Polish"
status: pending
priority: P3
effort: 2h
dependencies: [phase-04b-factory-step-3-preview-tree, phase-05-generation-engine-and-result]
---

# Phase 6: Integration + Polish

## Overview

Wire the Campaign Factory into the Meta workspace (toolbar button + entry point), link generated campaigns back to the campaigns list, add localStorage persistence for creative sets (verify from Phase 3), and apply final polish: naming validation, preflight UX, empty states, and a TypeScript clean pass.

## Requirements

- Functional:
  - "Campaign Factory" button in Meta workspace header/toolbar opens the wizard drawer
  - Generated campaigns appear in Meta workspace Campaigns tab (appended to mock list)
  - "View in Meta Workspace" from result screen closes wizard and navigates/scrolls to Campaigns tab
  - Creative sets persist across page refresh (localStorage — should already work from Phase 3; verify here)
  - Naming pattern validation: show error if pattern produces empty string after substitution
- Non-functional:
  - No new external dependencies
  - All new files ≤ 200 lines (verify; split any that aren't)
  - Full `npx tsc --noEmit` clean pass
  - No console errors in browser dev tools for the happy path

## Related Code Files

- Modify: `src/components/networks/meta/meta-workspace-header.tsx` — add "Campaign Factory" button
- Modify: `src/shared/mock-data.ts` — append generated campaigns to `mockCampaigns[]` (confirmed mutable, not `as const`; filter by `network: 'meta'` in workspace)
- Read first: `src/components/networks/meta/meta-workspace-header.tsx` (existing toolbar structure)
- Read first: `src/shared/network-configs/meta-config.tsx` (how tabs + toolbar are assembled)
- Read first: `src/components/networks/meta/campaign-factory/` all files from phases 3–5 (verify LOC, export shape)

## Implementation Steps

### 1. Add "Campaign Factory" button to Meta workspace header

Open `meta-workspace-header.tsx`. In the toolbar right-side action group (near "Bulk Create" or "New Campaign"), add:

```tsx
import { CampaignFactoryDrawer } from './campaign-factory/campaign-factory-drawer';

// State in parent component:
const [factoryOpen, setFactoryOpen] = useState(false);

// Button (use ui-kit Button, variant="border", size="m"):
<Button variant="border" size="m" onClick={() => setFactoryOpen(true)}>
  <Wand2 size={14} />
  Campaign Factory
</Button>

<CampaignFactoryDrawer
  open={factoryOpen}
  onClose={() => setFactoryOpen(false)}
  onNavigateToTemplates={() => {
    setFactoryOpen(false);
    // emit tab change to 'templates' via callback/context — check how existing tab switching works
  }}
/>
```

Icon: `Wand2` from `lucide-react` (already in dependency tree — verify).

### 2. Wire generated campaigns into mock list

In `generation-engine.ts` or `use-campaign-factory.ts`, after mock generation completes, append to the shared mock campaigns array. Check `mock-data.ts` for the campaigns array export name (likely `mockMetaCampaigns` or `mockDraftCampaigns`).

```typescript
// In use-campaign-factory.ts startGeneration(), after job completes:
const newCampaigns = preview.map((p, i) => ({
  id: generatedIds[i],
  name: p.campaignName,
  status: 'DRAFT',
  objective: selectedTemplate!.objective,
  budget: selectedTemplate!.adsetShell.budget,
  network: 'meta' as const,
  createdAt: new Date().toISOString(),
  // ... match remaining fields from Campaign type in mock-data.ts
}));
// mockCampaigns is unified (not as const) — safe to push
mockCampaigns.push(...newCampaigns);
```

Read `mock-data.ts` to verify exact field shape before writing.

### 3. "View in Meta Workspace" navigation

In `factory-generation-result.tsx`, the `onViewWorkspace` prop closes the wizard and navigates to the Campaigns tab. The drawer receives this as a prop from `campaign-factory-drawer.tsx`, which receives it from `meta-workspace-header.tsx`.

Callback chain:
```
meta-workspace-header.tsx
  onViewWorkspace={() => { setFactoryOpen(false); setActiveTab('campaigns'); }}
↓
campaign-factory-drawer.tsx  (passes through as prop)
↓  
factory-generation-result.tsx  (calls it on button click)
```

Verify how the active tab state is managed in `meta-workspace-header.tsx` or `meta-config.tsx` — it may use a URL param, a context, or a prop. Pass the correct setter.

### 4. Naming pattern validation

In `factory-step-generate-config.tsx`, add inline validation on the naming pattern input:

```typescript
const patternIsValid = namingPattern.trim().length > 0 &&
  renderNamingPattern(namingPattern, {
    template: selectedTemplate?.name ?? 'Template',
    set_name: 'Set',
  }).trim().length > 0;

// Show error below input if !patternIsValid:
// "Pattern cannot produce an empty campaign name"
```

Disable "Generate" button if `!patternIsValid || preflightIssues.some(i => i.type === 'error')`.

### 5. Polish pass

Run through these checks after all components are wired:

**Empty states:**
- [ ] Step 1 with no templates: "No templates yet. [+ Create your first template]"
- [ ] Step 2 with no creative sets: "No creative sets yet. [+ New Creative Set]"
- [ ] Preview tree when sets have 0 media: show preflight warning inline

**Accessibility:**
- [ ] All icon-only buttons have `aria-label`
- [ ] Step indicator has `aria-current="step"` on active step
- [ ] Drawer has `role="dialog"` and `aria-label="Campaign Factory"`

**TypeScript:**
- [ ] Run `npx tsc --noEmit` — fix any errors (common: missing field in mock object, wrong union type)
- [ ] No `any` types introduced

**Console:**
- [ ] Open wizard, run through full flow, check browser console for errors
- [ ] Check localStorage `nms_creative_sets` persists after page refresh

## Success Criteria

- [ ] "Campaign Factory" button visible in Meta workspace toolbar
- [ ] Clicking it opens the 3-step wizard drawer
- [ ] Full end-to-end flow works: select template → select sets → configure → generate → result
- [ ] Generated campaigns appear in Campaigns tab after "View in Meta Workspace"
- [ ] Creative sets persist in localStorage across page refresh
- [ ] Naming pattern validation prevents empty campaign names
- [ ] Preflight warnings shown for empty sets
- [ ] All TypeScript errors resolved (`npx tsc --noEmit` clean)
- [ ] No console errors on happy path

## Risk Assessment

- **Tab switching mechanism unknown:** If Meta workspace uses URL-based tab switching (e.g., `?tab=campaigns`), the `onViewWorkspace` callback needs to update the URL. Read `meta-config.tsx` first to understand the tab management pattern before implementing.
- **`mockCampaigns` is the correct array name** (scout confirmed — NOT `mockMetaCampaigns`). It is unified across all networks (filter by `network: 'meta'` in workspace). Not `as const` — safe to push without re-declaration.
- **`Wand2` icon not in lucide-react version:** Verify with `grep -r "Wand2" node_modules/lucide-react/dist/` or check the version in `package.json`. Fallback: use `Zap` or `Sparkles` icon instead.
- **LOC limit violations:** After all phases, run `wc -l` on each new file. Any file >200 lines should be split before considering this phase complete.
