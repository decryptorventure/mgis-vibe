---
phase: 2
title: "Setup Pickers"
status: pending
priority: P1
effort: 4h
dependencies: [phase-01-foundation]
---

# Phase 2: Setup Pickers

## Overview

Build the three column picker components for the Setup phase: Template picker, Theme picker (auto-detected from media files), and Account picker. Each is a standalone, self-contained component receiving selected state from the parent drawer.

## Requirements

- Functional: multi-select for all three pickers; show count badge; Select All / Clear All in header
- Non-functional: each file ≤ 200 lines; `@frontend-team/ui-kit` + DS tokens only; no business logic in components

## Architecture

```
meta-batch-template-picker.tsx   — props: templates[], selected[], onToggle(id)
meta-batch-theme-picker.tsx      — props: themes[], selected[], onToggle(id)
meta-batch-account-picker.tsx    — props: accounts[], selected[], onToggle(id)
```

All three are purely presentational — no internal state beyond local UI state (hover, etc.). The drawer shell (Phase 3) owns selected arrays.

## Related Code Files

- Create: `src/components/networks/meta/meta-batch-template-picker.tsx`
- Create: `src/components/networks/meta/meta-batch-theme-picker.tsx`
- Create: `src/components/networks/meta/meta-batch-account-picker.tsx`
- Read: `src/components/networks/meta/meta-batch-types.ts` (BatchTheme, BatchAccount)
- Read: `src/components/networks/meta/meta-types.ts` (MetaTemplate)
- Read: `src/components/ui-kit-compat/` (Checkbox if available, else use native)

## Implementation Steps

### 1. `meta-batch-template-picker.tsx`

```tsx
// meta-batch-template-picker.tsx — MetaTemplate multi-select grid
import React from 'react';
import { cn } from '@frontend-team/ui-kit';
import { LayoutGrid } from 'lucide-react';
import type { MetaTemplate } from './meta-types';

interface Props {
  templates: MetaTemplate[];
  selected: string[];
  onToggle: (id: string) => void;
}

export const BatchTemplatePicker: React.FC<Props> = ({ templates, selected, onToggle }) => {
  const allSelected = selected.length === templates.length;
  const toggleAll = () => templates.forEach(t => {
    if (allSelected ? selected.includes(t.id) : !selected.includes(t.id)) onToggle(t.id);
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <LayoutGrid size={13} />
          Templates
          <span className="font-normal text_tertiary">({selected.length}/{templates.length})</span>
        </div>
        <button type="button" onClick={toggleAll}
          className="text-[11px] text_tertiary hover:text_secondary transition-colors">
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      {/* Template cards */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
        {templates.map(t => {
          const isSelected = selected.includes(t.id);
          return (
            <button key={t.id} type="button" onClick={() => onToggle(t.id)}
              className={cn(
                'w-full text-left border radius_8 px-3 py-2.5 transition-colors',
                isSelected
                  ? 'border_accent_secondary bg_info'
                  : 'border_primary bg_primary hover:bg_secondary'
              )}>
              <div className="flex items-center gap-2">
                <span className={cn('w-4 h-4 radius_8 border shrink-0 flex items-center justify-center',
                  isSelected ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary bg_primary')}>
                  {isSelected && <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
                    <path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>}
                </span>
                <span className="body_s font-medium text_primary truncate">{t.name}</span>
              </div>
              <div className="mt-1 pl-6 flex gap-2 flex-wrap">
                <span className="text-[10px] bg_secondary border border_secondary radius_8 px-1.5 py-0.5 text_tertiary">{t.objective}</span>
                {t.age && <span className="text-[10px] text_tertiary">Age: {t.age}</span>}
              </div>
            </button>
          );
        })}
        {templates.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">No templates available</div>
        )}
      </div>
    </div>
  );
};
```

**Estimated lines: ~60. Well within limit.**

### 2. `meta-batch-theme-picker.tsx`

```tsx
// meta-batch-theme-picker.tsx — auto-detected theme multi-select
import React from 'react';
import { cn } from '@frontend-team/ui-kit';
import { Film, Layers3 } from 'lucide-react';
import type { BatchTheme } from './meta-batch-types';

interface Props {
  themes: BatchTheme[];
  selected: string[];
  onToggle: (id: string) => void;
}

export const BatchThemePicker: React.FC<Props> = ({ themes, selected, onToggle }) => {
  const allSelected = selected.length === themes.length;
  const toggleAll = () => themes.forEach(t => {
    if (allSelected ? selected.includes(t.id) : !selected.includes(t.id)) onToggle(t.id);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <Layers3 size={13} />
          Themes
          <span className="font-normal text_tertiary">({selected.length}/{themes.length})</span>
        </div>
        <button type="button" onClick={toggleAll}
          className="text-[11px] text_tertiary hover:text_secondary transition-colors">
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
        {themes.map(t => {
          const isSelected = selected.includes(t.id);
          const videoCount = t.files.filter(f => f.type === 'video').length;
          return (
            <button key={t.id} type="button" onClick={() => onToggle(t.id)}
              className={cn(
                'w-full text-left border radius_8 px-3 py-2.5 transition-colors',
                isSelected
                  ? 'border_accent_secondary bg_info'
                  : 'border_primary bg_primary hover:bg_secondary'
              )}>
              <div className="flex items-center gap-2">
                <span className={cn('w-4 h-4 radius_8 border shrink-0 flex items-center justify-center',
                  isSelected ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary bg_primary')}>
                  {isSelected && <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
                    <path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>}
                </span>
                <span className="body_s font-medium text_primary truncate">{t.name}</span>
              </div>
              <div className="mt-1 pl-6 flex items-center gap-2">
                <Film size={10} className="text_tertiary shrink-0" />
                <span className="text-[11px] text_tertiary">{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
                <span className="text-[10px] text_tertiary">({t.files.length} total)</span>
              </div>
            </button>
          );
        })}
        {themes.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">No themes detected</div>
        )}
      </div>
    </div>
  );
};
```

**Estimated lines: ~65. Well within limit.**

### 3. `meta-batch-account-picker.tsx`

```tsx
// meta-batch-account-picker.tsx — ad account multi-select list
import React from 'react';
import { cn } from '@frontend-team/ui-kit';
import { Users } from 'lucide-react';
import type { BatchAccount } from './meta-batch-types';

interface Props {
  accounts: BatchAccount[];
  selected: string[];
  onToggle: (id: string) => void;
}

export const BatchAccountPicker: React.FC<Props> = ({ accounts, selected, onToggle }) => {
  const allSelected = selected.length === accounts.length;
  const toggleAll = () => accounts.forEach(a => {
    if (allSelected ? selected.includes(a.id) : !selected.includes(a.id)) onToggle(a.id);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <Users size={13} />
          Ad Accounts
          <span className="font-normal text_tertiary">({selected.length}/{accounts.length})</span>
        </div>
        <button type="button" onClick={toggleAll}
          className="text-[11px] text_tertiary hover:text_secondary transition-colors">
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
        {accounts.map(a => {
          const isSelected = selected.includes(a.id);
          return (
            <button key={a.id} type="button" onClick={() => onToggle(a.id)}
              className={cn(
                'w-full text-left border radius_8 px-3 py-2.5 transition-colors',
                isSelected
                  ? 'border_accent_secondary bg_info'
                  : 'border_primary bg_primary hover:bg_secondary'
              )}>
              <div className="flex items-center gap-2">
                <span className={cn('w-4 h-4 radius_8 border shrink-0 flex items-center justify-center',
                  isSelected ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary bg_primary')}>
                  {isSelected && <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
                    <path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>}
                </span>
                <span className="body_s font-medium text_primary">{a.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

**Estimated lines: ~55. Well within limit.**

### 4. Run type check

```bash
npx tsc --noEmit
```

## Success Criteria

- [ ] Template picker renders all templates; selecting one toggles its border/bg
- [ ] Theme picker auto-groups mock files; `Sexy_Phone` shows "2 videos (2 total)"
- [ ] Account picker shows 4 mock accounts
- [ ] "Select All" selects all; "Clear All" deselects all in each picker
- [ ] Count badge updates as selection changes
- [ ] All pickers use DS tokens only (no raw hex, no Tailwind color classes)
- [ ] `npx tsc --noEmit` — 0 errors

## Risk Assessment

Low risk. Purely presentational components with no state logic. Main risk: DS token availability for active state background — use `bg_info` (available) + `border_accent_secondary` for selected state.
