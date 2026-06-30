---
title: "Meta Batch Campaign Generator — Phase 1+2"
description: "Theme-based batch campaign generation: auto-detect themes from media filenames, pick Templates × Themes × Accounts, preview matrix of combinations, generate campaigns in bulk (mock)"
status: pending
priority: P1
effort: 14h
branch: main
tags: [meta, batch-generator, themes, bulk-create]
created: 2026-06-29
brainstorm: plans/reports/brainstorm-260629-1744-meta-batch-campaign-generator-report.md
blockedBy: []
blocks: []
---

# Meta Batch Campaign Generator — Phase 1+2

## Goal

Allow UA team to select multiple **Templates × Themes × Accounts** and auto-generate all combinations as campaigns in bulk — replacing the current one-by-one manual flow. Phase 1+2 delivers the full FE flow with mock generation; Phase 3 (API queue + multi-account) is out of scope.

## Core Concept

```
Templates × Themes × Accounts
  ↓ matrix (with exclude + name pattern)
  ↓ mock generation
N campaigns generated
```

**Theme detection:** Filename regex `^[A-Z0-9]+_(.+?)_Ver\d` parses theme name from media files automatically.

## Key Decisions (from brainstorm)

| Item | Decision |
|------|----------|
| Theme source | Auto-detected from media library filenames via regex |
| Copy fields | Inherited from MetaTemplate (no per-theme override in P1) |
| Generation | Mock only (setTimeout simulation); API queue deferred to Phase 3 |
| Entry point | "Batch Generate" button in `MetaWorkspaceHeader` |
| Accounts | Mock list of 4 accounts; single-account selection for now |
| File size limit | Every file ≤ 200 lines — split if needed |

## Phases

| # | Phase | Priority | Effort | Status | Blockers |
|---|-------|----------|--------|--------|----------|
| 1 | [Foundation](./phase-01-foundation.md) | P1 | 2h | pending | none |
| 2 | [Setup Pickers](./phase-02-setup-pickers.md) | P1 | 4h | pending | Phase 1 |
| 3 | [Drawer Shell](./phase-03-drawer-shell.md) | P1 | 3h | pending | Phase 2 |
| 4 | [Matrix Preview](./phase-04-matrix-preview.md) | P1 | 3h | pending | Phase 3 |
| 5 | [Progress + Entry](./phase-05-progress-and-entry.md) | P1 | 2h | pending | Phase 4 |

## New Files

```
src/components/networks/meta/
├── meta-batch-types.ts              # Phase 1 — BatchTheme, BatchCombination, BatchJob, etc.
├── meta-theme-parser.ts             # Phase 1 — filename → theme name utility + mock data
├── meta-batch-template-picker.tsx   # Phase 2 — MetaTemplate multi-select grid
├── meta-batch-theme-picker.tsx      # Phase 2 — auto-detected theme multi-select
├── meta-batch-account-picker.tsx    # Phase 2 — ad account multi-select list
├── meta-batch-generator-drawer.tsx  # Phase 3 — main drawer shell, phase state machine
├── meta-batch-matrix-preview.tsx    # Phase 4 — combination table, name pattern, exclude
└── meta-batch-progress-tracker.tsx  # Phase 5 — mock generation progress UI
```

## Modified Files

```
src/components/networks/meta/meta-workspace-header.tsx   # Phase 5 — add Batch Generate button
```

## Dependency Graph

```
Phase 1 (types + parser)
  └──> Phase 2 (pickers × 3)
         └──> Phase 3 (drawer shell)
                └──> Phase 4 (matrix preview)
                       └──> Phase 5 (progress tracker + entry point)
```

## Acceptance Criteria

- [ ] `parseThemeName()` correctly extracts theme from `N3_Sexy_Phone_Ver1.3_25-55.mp4` → `"Sexy_Phone"`
- [ ] Files with no match fall back to `"Uncategorized"` bucket
- [ ] Template picker shows all `MetaTemplate` entries with multi-select + count
- [ ] Theme picker auto-groups mock media files by detected theme with file counts
- [ ] Account picker shows 4 mock accounts with multi-select
- [ ] Drawer opens from "Batch Generate" button in workspace header
- [ ] Setup phase shows live count: "N templates × M themes × K accounts = NMK campaigns"
- [ ] "Preview Matrix →" is disabled until at least 1 of each is selected
- [ ] Matrix table shows all combinations; each row has a checkbox to exclude
- [ ] Name pattern editor with `{template}`, `{theme}`, `{account}`, `{date}` tokens; live preview in table
- [ ] "Generate N Campaigns" button triggers progress tracker
- [ ] Progress tracker shows per-campaign status (Queued → Running → Done/Error) via mock interval
- [ ] "View in Campaign List" CTA appears when all done
- [ ] `npx tsc --noEmit` passes after each phase

## Global Risks

| Risk | L×I | Mitigation |
|------|-----|------------|
| `meta-batch-generator-drawer.tsx` > 200 lines | H×M | Extract setup footer count/button to `meta-batch-setup-footer.tsx` |
| `meta-batch-matrix-preview.tsx` > 200 lines | M×M | Extract name-pattern token chips row to `meta-batch-name-pattern-editor.tsx` |
| Shared header file conflict with Campaign Factory plan | L×M | Add `onOpenBatchGenerator` prop as optional; factory plan adds its own prop separately |
| `MetaTemplate` only has 6 fields; copy fields thin | L×L | Use existing fields for now; Phase 3 extends MetaTemplate when API is ready |

## Unresolved Questions

1. Should "Accounts" column support multi-select (creates N×M×K combos) or single-select for Phase 1+2?
   → **Single-select in Phase 1** to keep matrix manageable; multi-select in Phase 3.
2. Where do media files come from — real MediaLibraryModal or mock list?
   → **Mock list** (`MOCK_MEDIA_FILES` in `meta-theme-parser.ts`); real integration deferred.
3. Should generated campaigns appear in the campaigns table?
   → **Mock only** — add to a local state array; no real API call.
