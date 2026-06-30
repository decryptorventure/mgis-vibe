---
phase: 1
title: "Foundation"
status: pending
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Foundation

## Overview

Create the shared type definitions and theme parser utility that all subsequent phases depend on. No UI — pure TypeScript.

## Requirements

- Functional: `parseThemeName(filename)` → theme string; `toThemeList(files)` → `BatchTheme[]`
- Non-functional: zero dependencies beyond existing `meta-types.ts` and `meta-media-library-modal.tsx` imports; all functions pure (testable)

## Architecture

```
meta-batch-types.ts           — all interfaces for batch generator
meta-theme-parser.ts          — regex utility + mock data (MOCK_MEDIA_FILES, MOCK_BATCH_ACCOUNTS)
```

`meta-batch-types.ts` imports from `./meta-types` (MetaTemplate) and `./meta-media-library-modal` (MediaFile).
`meta-theme-parser.ts` imports from `./meta-media-library-modal` and `./meta-batch-types`.

## Related Code Files

- Create: `src/components/networks/meta/meta-batch-types.ts`
- Create: `src/components/networks/meta/meta-theme-parser.ts`
- Read (no change): `src/components/networks/meta/meta-types.ts` — reference `MetaTemplate`
- Read (no change): `src/components/networks/meta/meta-media-library-modal.tsx` — reference `MediaFile`

## Implementation Steps

### 1. Create `meta-batch-types.ts`

```typescript
// meta-batch-types.ts — interfaces for Batch Campaign Generator
import type { MetaTemplate } from './meta-types';
import type { MediaFile } from './meta-media-library-modal';

// Theme — auto-detected group of MediaFiles sharing a naming pattern
export interface BatchTheme {
  id: string;       // kebab-slug of name e.g. "sexy-phone"
  name: string;     // parsed display name e.g. "Sexy_Phone"
  files: MediaFile[];
}

// Ad account (mock; Phase 3 will fetch from API)
export interface BatchAccount {
  id: string;
  name: string;
}

// One cell in the matrix
export interface BatchCombination {
  id: string;
  template: MetaTemplate;
  theme: BatchTheme;
  account: BatchAccount;
  generatedName: string;  // resolved from NamePattern
  excluded: boolean;
}

export type BatchJobStatus = 'queued' | 'running' | 'done' | 'error';

export interface BatchJob {
  combination: BatchCombination;
  status: BatchJobStatus;
  error?: string;
}

// Drawer phase state
export type BatchGeneratorPhase = 'setup' | 'matrix' | 'progress';

// Name pattern with token placeholders
export type NamePattern = string;

export const DEFAULT_NAME_PATTERN: NamePattern = '[{template}] {theme} | {account}';
```

### 2. Create `meta-theme-parser.ts`

```typescript
// meta-theme-parser.ts — filename → theme name parser + mock data
import type { MediaFile } from './meta-media-library-modal';
import type { BatchTheme, BatchAccount } from './meta-batch-types';

// Pattern: {AppCode}_{ThemeName}_Ver{version}_{dims}.{ext}
const THEME_REGEX = /^[A-Z0-9]+_(.+?)_Ver\d/;

export function parseThemeName(filename: string): string {
  const match = THEME_REGEX.exec(filename);
  return match?.[1] ?? 'Uncategorized';
}

export function groupFilesByTheme(files: MediaFile[]): Record<string, MediaFile[]> {
  return files.reduce<Record<string, MediaFile[]>>((acc, file) => {
    const theme = parseThemeName(file.name);
    acc[theme] = [...(acc[theme] ?? []), file];
    return acc;
  }, {});
}

export function toThemeList(files: MediaFile[]): BatchTheme[] {
  const grouped = groupFilesByTheme(files);
  return Object.entries(grouped).map(([name, themeFiles]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    files: themeFiles,
  }));
}

export function resolveNamePattern(
  pattern: string,
  combo: Pick<import('./meta-batch-types').BatchCombination, 'template' | 'theme' | 'account'>
): string {
  const date = new Date().toISOString().slice(0, 10);
  return pattern
    .replace('{template}', combo.template.name)
    .replace('{theme}', combo.theme.name)
    .replace('{account}', combo.account.name)
    .replace('{date}', date);
}

// Mock media library — replace with RTK Query when API available
export const MOCK_MEDIA_FILES: MediaFile[] = [
  { id: 'mf1', name: 'N3_Sexy_Phone_Ver1.3_25-55_916.mp4', type: 'video', duration: '0:30', size: '12MB', modified: '2026-06-01' },
  { id: 'mf2', name: 'N3_Sexy_Phone_Ver2.0_9-16.mp4',      type: 'video', duration: '0:15', size: '8MB',  modified: '2026-06-02' },
  { id: 'mf3', name: 'N3_Mistakes_Phone_Ver1.0_25-55.mp4', type: 'video', duration: '0:45', size: '18MB', modified: '2026-06-03' },
  { id: 'mf4', name: 'N3_Mistakes_Phone_Ver2.1_9-16.mp4',  type: 'video', duration: '0:20', size: '9MB',  modified: '2026-06-04' },
  { id: 'mf5', name: 'N3_Clean_IOS_Ver1.0_9-16.mp4',       type: 'video', duration: '0:30', size: '10MB', modified: '2026-06-05' },
  { id: 'mf6', name: 'FOCUS_Clean_IOS_Ver2.0_9-16.mp4',    type: 'video', duration: '0:20', size: '9MB',  modified: '2026-06-06' },
  { id: 'mf7', name: 'banner_no_pattern.jpg',               type: 'image', size: '400KB',                  modified: '2026-06-07' },
];

export const MOCK_BATCH_ACCOUNTS: BatchAccount[] = [
  { id: 'acc1', name: 'FOCUS PT' },
  { id: 'acc2', name: 'FOCUS ES' },
  { id: 'acc3', name: 'Focus EN' },
  { id: 'acc4', name: 'Focus ASIA' },
];
```

### 3. Run type check

```bash
npx tsc --noEmit
```

Confirm 0 errors before proceeding to Phase 2.

## Success Criteria

- [ ] `parseThemeName('N3_Sexy_Phone_Ver1.3_25-55_916.mp4')` returns `'Sexy_Phone'`
- [ ] `parseThemeName('banner_no_pattern.jpg')` returns `'Uncategorized'`
- [ ] `toThemeList(MOCK_MEDIA_FILES)` returns 4 themes: `Sexy_Phone`, `Mistakes_Phone`, `Clean_IOS`, `Uncategorized`
- [ ] `resolveNamePattern('[{template}] {theme} | {account}', ...)` substitutes all tokens
- [ ] `npx tsc --noEmit` — 0 errors

## Risk Assessment

Low risk. Pure utility functions with no UI. Only risk is import path alignment — verify `./meta-media-library-modal` exports `MediaFile` correctly before writing types.
