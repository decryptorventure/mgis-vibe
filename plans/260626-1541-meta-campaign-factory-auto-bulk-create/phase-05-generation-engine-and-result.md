---
phase: 5
title: "Generation Engine + Result Screen"
status: pending
priority: P2
effort: 4h
dependencies: [phase-04b-factory-step-3-preview-tree]
---

# Phase 5: Generation Engine + Result Screen

## Overview

Implement the actual generation logic (ABO/CBO algorithms, naming pattern engine, preflight checks) inside `use-campaign-factory.ts`, plus the result screen `factory-generation-result.tsx` that shows mock async progress and the generated campaign list.

## Requirements

- Functional:
  - `generatePreview()` computes `GeneratedCampaignPreview[]` synchronously from template + sets + config
  - `startGeneration()` simulates async job (mock progress 0→100% over ~1.5s) then produces mock campaigns
  - Naming pattern supports tokens: `{template}`, `{set_name}`, `{objective}`, `{week}`, `{date}`, `{counter}`
  - Preflight checks: warn if any selected set has 0 mediaIds; warn if generated campaign name already exists in mock data
  - Result screen shows: progress bar → completed list of generated campaigns with link-to-workspace affordance
  - "Create Another" resets wizard to step 1
- Non-functional:
  - Generation mock uses `setTimeout` (no real API call)
  - Generated campaigns appended to a shared mock campaigns list (can be a module-level array for mock)
  - Files ≤ 200 lines

## Architecture

```
use-campaign-factory.ts          (extend from Phase 4 stub)
  + generatePreview()            (sync computation)
  + startGeneration()            (mock async)
  + preflightIssues              (derived from template + sets)

factory-generation-result.tsx    (new, ~120 lines)
  shows progress → result list

generation-engine.ts             (new, ~100 lines — pure functions, no React)
  generateABO()
  generateCBO()
  renderNamingPattern()
  runPreflight()
```

Split engine logic into `generation-engine.ts` (pure functions) — keeps `use-campaign-factory.ts` focused on React state.

## Related Code Files

- Create: `src/components/networks/meta/campaign-factory/generation-engine.ts`
- Create: `src/components/networks/meta/campaign-factory/factory-generation-result.tsx`
- Modify: `src/components/networks/meta/campaign-factory/use-campaign-factory.ts` (fill stubs from Phase 4)
- Read first: `src/shared/mock-data.ts` → existing mock campaigns array (check field shape to match `DraftCampaign`)
- Read first: `src/components/networks/meta/meta-types.ts` → `GenerationJob`, `GeneratedCampaignPreview`

## Implementation Steps

### 1. Create `generation-engine.ts`

```typescript
import type {
  CampaignTemplate, CreativeSet, GenerationConfig,
  GeneratedCampaignPreview, GenerationPreflightIssue
} from '../meta-types';

// ─── Naming pattern engine ────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function renderNamingPattern(
  pattern: string,
  tokens: { template?: string; set_name?: string; objective?: string; counter?: number }
): string {
  const now = new Date();
  return pattern
    .replace(/{template}/g, tokens.template ?? '')
    .replace(/{set_name}/g, tokens.set_name ?? '')
    .replace(/{objective}/g, tokens.objective ?? '')
    .replace(/{week}/g, String(getISOWeek(now)))
    .replace(/{date}/g, now.toISOString().slice(0, 10))
    .replace(/{counter}/g, String(tokens.counter ?? 1).padStart(2, '0'));
}

// ─── ABO: 1 campaign per creative set ────────────────────────────────────

export function generateABO(
  template: CampaignTemplate,
  sets: CreativeSet[],
  config: GenerationConfig
): GeneratedCampaignPreview[] {
  return sets.map((set, idx) => ({
    campaignName: renderNamingPattern(config.namingPattern, {
      template: template.name,
      set_name: set.name,
      objective: template.objective,
      counter: idx + 1,
    }),
    adsets: [{
      adsetName: `${set.name} — ${template.adsetShell.targeting.countries.join(', ')}`,
      mediaIds: set.mediaIds,
      adCount: set.mediaIds.length,
    }],
    totalAds: set.mediaIds.length,
  }));
}

// ─── CBO: 1 campaign, N ad sets ──────────────────────────────────────────

export function generateCBO(
  template: CampaignTemplate,
  sets: CreativeSet[],
  config: GenerationConfig
): GeneratedCampaignPreview[] {
  return [{
    campaignName: renderNamingPattern(config.namingPattern, {
      template: template.name,
      set_name: sets.map(s => s.name).join('+'),
      objective: template.objective,
    }),
    adsets: sets.map(set => ({
      adsetName: set.name,
      mediaIds: set.mediaIds,
      adCount: set.mediaIds.length,
    })),
    totalAds: sets.reduce((sum, s) => sum + s.mediaIds.length, 0),
  }];
}

// ─── Preflight ────────────────────────────────────────────────────────────

export function runPreflight(
  template: CampaignTemplate | null,
  sets: CreativeSet[],
  preview: GeneratedCampaignPreview[],
  existingCampaignNames: string[]
): GenerationPreflightIssue[] {
  const issues: GenerationPreflightIssue[] = [];

  if (!template) {
    issues.push({ type: 'error', message: 'No template selected.' });
    return issues;
  }

  sets.forEach(s => {
    if (s.mediaIds.length === 0) {
      issues.push({ type: 'warning', message: `Creative set "${s.name}" has 0 creatives — ad set will be empty.` });
    }
  });

  preview.forEach(p => {
    if (existingCampaignNames.includes(p.campaignName)) {
      issues.push({ type: 'warning', message: `Campaign name "${p.campaignName}" already exists — may cause duplicates.` });
    }
  });

  return issues;
}
```

### 2. Extend `use-campaign-factory.ts` (fill Phase 4 stubs)

Replace stub implementations:

```typescript
import { generateABO, generateCBO, runPreflight } from './generation-engine';

// generatePreview — called whenever step/config changes on step 3
const generatePreview = useCallback(() => {
  if (!selectedTemplate || selectedSets.length === 0) { setPreview([]); return; }
  const result = config.strategy === 'ABO'
    ? generateABO(selectedTemplate, selectedSets, { ...config, templateId: selectedTemplate.id, creativeSetIds: selectedSetIds })
    : generateCBO(selectedTemplate, selectedSets, { ...config, templateId: selectedTemplate.id, creativeSetIds: selectedSetIds });
  setPreview(result);
}, [selectedTemplate, selectedSets, config]);

// preflightIssues — derived value
const preflightIssues = useMemo(
  () => runPreflight(selectedTemplate, selectedSets, preview, /* existing names from mock */ []),
  [selectedTemplate, selectedSets, preview]
);

// startGeneration — mock async
const startGeneration = useCallback(async () => {
  if (preflightIssues.some(i => i.type === 'error')) return;
  const jobId = `job-${Date.now()}`;
  setJob({ id: jobId, config: { ...config, templateId: selectedTemplate!.id, creativeSetIds: selectedSetIds },
           preview, preflightIssues, status: 'generating', generatedCampaignIds: [], createdAt: new Date().toISOString() });
  setStep('result');

  // Simulate progress via job status updates (component polls job.status)
  await new Promise(r => setTimeout(r, 1500));
  const generatedIds = preview.map((_, i) => `gen-camp-${Date.now()}-${i}`);
  setJob(j => j ? { ...j, status: 'completed', generatedCampaignIds: generatedIds } : j);
}, [config, selectedTemplate, selectedSetIds, preview, preflightIssues]);
```

### 3. Create `factory-generation-result.tsx`

```tsx
// Props: job: GenerationJob | null, onCreateAnother: () => void, onViewWorkspace: () => void

// Two states:

// State: generating
// ┌─────────────────────────────────────────────────────┐
// │  [Spinner] Creating your campaigns…                 │
// │  ████████████░░░░░░░░  65%                          │
// │  Processing creative sets and building ad structure │
// └─────────────────────────────────────────────────────┘

// State: completed
// ┌─────────────────────────────────────────────────────┐
// │  [✓ Green checkmark]  {N} campaigns created!        │
// │                                                     │
// │  [Campaign item list:]                              │
// │  • App Installs - Top Videos - W26  [View →]        │
// │  • App Installs - Q2 Banners - W26  [View →]        │
// │                                                     │
// │  [View in Meta Workspace →]   [+ Create Another]    │
// └─────────────────────────────────────────────────────┘

// Progress simulation:
// Use useEffect + interval to animate progress bar 0→100 over 1.5s
// When job.status === 'completed', snap to 100% and show result

// "View in Meta Workspace →" calls onViewWorkspace prop
// "+ Create Another" calls onCreateAnother (resets wizard)
```

## Success Criteria

- [ ] `renderNamingPattern` correctly substitutes all 6 tokens (`{template}`, `{set_name}`, `{objective}`, `{week}`, `{date}`, `{counter}`)
- [ ] `generateABO` produces 1 campaign per creative set
- [ ] `generateCBO` produces 1 campaign with N ad sets
- [ ] Preflight warns when a set has 0 mediaIds
- [ ] Preflight warns when a generated campaign name matches an existing mock campaign
- [ ] `startGeneration` transitions wizard to 'result' step
- [ ] Result screen shows animated progress bar then completed list
- [ ] "Create Another" resets all wizard state to step 1
- [ ] `npx tsc --noEmit` passes

## Risk Assessment

- **`setTimeout` cleanup:** `startGeneration` uses `await new Promise(r => setTimeout(...))` — if user closes drawer before completion, the timeout still fires and calls `setJob`. Fix: add an `abortRef` (useRef) set on drawer close; check in the timeout before calling setJob.
- **ISO week edge case:** `getISOWeek` manual implementation — test with week boundary dates. If off-by-one is acceptable for mock, proceed; backend will compute real week number.
- **Existing campaign names for preflight:** For mock, pass `[]` as existingCampaignNames (no real campaigns list to check against). Leave a TODO comment for backend integration.
