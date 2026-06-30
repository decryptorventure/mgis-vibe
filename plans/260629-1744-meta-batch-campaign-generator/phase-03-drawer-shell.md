---
phase: 3
title: "Drawer Shell"
status: pending
priority: P1
effort: 3h
dependencies: [phase-02-setup-pickers]
---

# Phase 3: Drawer Shell

## Overview

Build the main `meta-batch-generator-drawer.tsx` — a fullscreen Drawer that owns the phase state machine (`setup → matrix → progress`) and renders the three picker columns in setup phase. The drawer is the single source of truth for all selection state.

## Requirements

- Functional: phase state machine; setup layout with 3 columns; live count computation; "Preview Matrix →" enabled only when ≥1 of each picker is selected
- Non-functional: file ≤ 200 lines; if it exceeds, extract `BatchSetupFooter` to a separate file

## Architecture

```
meta-batch-generator-drawer.tsx
  state: generatorPhase, selectedTemplateIds[], selectedThemeIds[], selectedAccountIds[]
  setup phase → 3-col grid [BatchTemplatePicker | BatchThemePicker | BatchAccountPicker]
  matrix phase → <BatchMatrixPreview /> (Phase 4)
  progress phase → <BatchProgressTracker /> (Phase 5)
```

The drawer uses the `Drawer` component from `@/components/ui-kit-compat`.

**Phase transitions:**
- `setup → matrix`: click "Preview Matrix →" (requires ≥1 of each selected)
- `matrix → setup`: click "← Back"
- `matrix → progress`: click "Generate N Campaigns →"
- `progress` is terminal (drawer close to exit)

**Combination building** (runs in `useMemo` when entering matrix phase):
```ts
const combinations: BatchCombination[] = selectedTemplates.flatMap(t =>
  selectedThemes.flatMap(th =>
    selectedAccounts.map(a => ({
      id: `${t.id}-${th.id}-${a.id}`,
      template: t, theme: th, account: a,
      generatedName: resolveNamePattern(namePattern, { template: t, theme: th, account: a }),
      excluded: false,
    }))
  )
);
```

## Related Code Files

- Create: `src/components/networks/meta/meta-batch-generator-drawer.tsx`
- Read: `src/components/networks/meta/meta-batch-template-picker.tsx`
- Read: `src/components/networks/meta/meta-batch-theme-picker.tsx`
- Read: `src/components/networks/meta/meta-batch-account-picker.tsx`
- Read: `src/components/networks/meta/meta-batch-types.ts`
- Read: `src/components/networks/meta/meta-theme-parser.ts`
- Read: `src/components/networks/meta/meta-types.ts` (for mock templates)
- Read: `src/components/ui-kit-compat/` (Drawer)

## Implementation Steps

### 1. Draft `meta-batch-generator-drawer.tsx`

```tsx
// meta-batch-generator-drawer.tsx — Batch Campaign Generator fullscreen drawer
import React, { useMemo, useState } from 'react';
import { Drawer } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';
import type { BatchAccount, BatchCombination, BatchGeneratorPhase, BatchJob, NamePattern } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';
import { DEFAULT_NAME_PATTERN, MOCK_BATCH_ACCOUNTS, MOCK_MEDIA_FILES, resolveNamePattern, toThemeList } from './meta-theme-parser';
import { BatchTemplatePicker } from './meta-batch-template-picker';
import { BatchThemePicker } from './meta-batch-theme-picker';
import { BatchAccountPicker } from './meta-batch-account-picker';
// BatchMatrixPreview and BatchProgressTracker are stubs until Phase 4/5
// import { BatchMatrixPreview } from './meta-batch-matrix-preview';
// import { BatchProgressTracker } from './meta-batch-progress-tracker';

interface Props {
  open: boolean;
  onClose: () => void;
  templates: MetaTemplate[];
}

const mkId = () => Math.random().toString(36).slice(2, 8);

export const BatchGeneratorDrawer: React.FC<Props> = ({ open, onClose, templates }) => {
  const [phase, setPhase] = useState<BatchGeneratorPhase>('setup');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedThemeIds, setSelectedThemeIds]       = useState<string[]>([]);
  const [selectedAccountIds, setSelectedAccountIds]   = useState<string[]>([]);
  const [namePattern, setNamePattern]                 = useState<NamePattern>(DEFAULT_NAME_PATTERN);
  const [combinations, setCombinations]               = useState<BatchCombination[]>([]);
  const [jobs, setJobs]                               = useState<BatchJob[]>([]);

  const themes = useMemo(() => toThemeList(MOCK_MEDIA_FILES), []);
  const accounts: BatchAccount[] = MOCK_BATCH_ACCOUNTS;

  const toggle = (ids: string[], id: string): string[] =>
    ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

  const selectedTemplates = templates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedThemes    = themes.filter(th => selectedThemeIds.includes(th.id));
  const selectedAccounts  = accounts.filter(a => selectedAccountIds.includes(a.id));

  const totalCombos = selectedTemplates.length * selectedThemes.length * selectedAccounts.length;
  const canPreview  = selectedTemplates.length > 0 && selectedThemes.length > 0 && selectedAccounts.length > 0;

  const handlePreviewMatrix = () => {
    const combos = selectedTemplates.flatMap(t =>
      selectedThemes.flatMap(th =>
        selectedAccounts.map(a => ({
          id: `${t.id}-${th.id}-${a.id}-${mkId()}`,
          template: t, theme: th, account: a,
          generatedName: resolveNamePattern(namePattern, { template: t, theme: th, account: a }),
          excluded: false,
        }))
      )
    );
    setCombinations(combos);
    setPhase('matrix');
  };

  const handleGenerate = (activeCombos: BatchCombination[]) => {
    setJobs(activeCombos.map(c => ({ combination: c, status: 'queued' })));
    setPhase('progress');
  };

  const handleClose = () => {
    setPhase('setup');
    setSelectedTemplateIds([]); setSelectedThemeIds([]); setSelectedAccountIds([]);
    setCombinations([]); setJobs([]);
    onClose();
  };

  return (
    <Drawer open={open} onClose={handleClose} placement="right"
      width="calc(100vw - 72px)" title={null} closable={false}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, header: { display: 'none' } }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border_primary shrink-0">
        <div className="w-9 h-9 radius_8 bg_info flex items-center justify-center">
          <Sparkles size={16} className="fg_info" />
        </div>
        <div>
          <div className="body_s font-bold text_primary">Batch Campaign Generator</div>
          <div className="text-[11px] text_tertiary">Templates × Themes × Accounts → auto-generate campaigns</div>
        </div>
        <button type="button" onClick={handleClose} aria-label="Close"
          className="ml-auto text_tertiary hover:text_primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg_canvas_secondary">
        {phase === 'setup' && (
          <div className="grid grid-cols-3 gap-4 p-6 h-full">
            <div className="bg_primary border border_primary radius_8 p-4">
              <BatchTemplatePicker templates={templates} selected={selectedTemplateIds}
                onToggle={id => setSelectedTemplateIds(prev => toggle(prev, id))} />
            </div>
            <div className="bg_primary border border_primary radius_8 p-4">
              <BatchThemePicker themes={themes} selected={selectedThemeIds}
                onToggle={id => setSelectedThemeIds(prev => toggle(prev, id))} />
            </div>
            <div className="bg_primary border border_primary radius_8 p-4">
              <BatchAccountPicker accounts={accounts} selected={selectedAccountIds}
                onToggle={id => setSelectedAccountIds(prev => toggle(prev, id))} />
            </div>
          </div>
        )}
        {phase === 'matrix' && (
          <div className="p-6 text_secondary">
            {/* BatchMatrixPreview renders here — Phase 4 */}
            Matrix preview (Phase 4)
          </div>
        )}
        {phase === 'progress' && (
          <div className="p-6 text_secondary">
            {/* BatchProgressTracker renders here — Phase 5 */}
            Progress tracker (Phase 5)
          </div>
        )}
      </div>

      {/* Footer */}
      {phase === 'setup' && (
        <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
          <div className="flex items-center gap-1.5 text-xs text_secondary">
            {selectedTemplates.length > 0 && (
              <><span className="font-semibold fg_info">{selectedTemplates.length}</span> templates ×</>
            )}
            {selectedThemes.length > 0 && (
              <><span className="font-semibold fg_info">{selectedThemes.length}</span> themes ×</>
            )}
            {selectedAccounts.length > 0 && (
              <><span className="font-semibold fg_info">{selectedAccounts.length}</span> accounts</>
            )}
            {canPreview && <span className="text_tertiary">= {totalCombos} campaigns</span>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="border" size="m" onClick={handleClose}>Cancel</Button>
            <Button type="button" variant="primary" size="m" disabled={!canPreview}
              onClick={handlePreviewMatrix} className="gap-1.5">
              Preview Matrix <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}
      {phase === 'matrix' && (
        <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
          <Button type="button" variant="border" size="m" onClick={() => setPhase('setup')} className="gap-1.5">
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      )}
    </Drawer>
  );
};
```

**Estimated lines: ~130. Well within limit.**

> Note: If `combinations` state or `jobs` state grows complex, extract `useBatchGeneratorState` hook to keep drawer ≤200 lines.

### 2. Run type check

```bash
npx tsc --noEmit
```

## Success Criteria

- [ ] Drawer opens with 3-column layout; each column renders the correct picker
- [ ] Count summary in footer updates live as selections change (e.g., "2 templates × 2 themes × 1 accounts = 4 campaigns")
- [ ] "Preview Matrix →" disabled when any picker has 0 selections
- [ ] Clicking "Preview Matrix →" transitions to matrix phase (shows placeholder text for now)
- [ ] Clicking "← Back" from matrix returns to setup with selections preserved
- [ ] Closing the drawer resets all state
- [ ] `npx tsc --noEmit` — 0 errors

## Risk Assessment

Medium risk: The drawer body in Phase 4/5 will add matrix + progress components. Monitor line count. If drawer exceeds 200 lines after Phase 4 integration, extract `handlePreviewMatrix` + `handleGenerate` into a custom hook `useBatchGeneratorState.ts`.
