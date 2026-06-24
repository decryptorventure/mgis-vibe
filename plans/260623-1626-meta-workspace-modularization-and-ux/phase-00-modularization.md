# Phase 0 — Modularization (MANDATORY)

**Priority:** P1 (highest) · **Status:** pending · **Effort:** 14h

## Overview
Split `src/pages/networks/MetaWorkspace.tsx` (2,473 lines) into focused modules under `src/components/networks/meta/`. **Pure extraction — no behavior change.** The file already contains self-contained inline components and pure helpers; this phase lifts each to its own file and rewires imports.

## Source Map (verified line ranges in current MetaWorkspace.tsx)
| Lines | Content | Destination |
|-------|---------|-------------|
| 72–182 | Types (MetaEntity, MetaColumnKey, configs, interfaces) | `meta-types.ts` |
| 184–348 | Data consts: ACCOUNT_OPTIONS, TEMPLATES, PAGES, DRAFTS, ENTITY_META, REPORT_COLUMNS, COLUMN_HELP, HEATMAP_COLORS, DEFAULT_VISIBLE, storage keys, VIEW_PRESETS, METRIC_POLARITY | `meta-table-config.ts` |
| 350–426 | Helpers: tablePref factory, loadStoredArray, formatNumber, getAdSet*, isCampaign/isAdSet/isAd, safeDivide, getSynthetic* | `meta-metric-helpers.ts` |
| 428–519 | getMetricValue, formatMetricValue, getHeatmapStyle | `meta-metric-helpers.ts` |
| 521–544 | MetaToolbarButton, ProgressChip | `meta-header.tsx` (shared bits) |
| 546–605 | DraftCampaignsPanel | `meta-drafts-panel.tsx` |
| 607–668 | EntityTabs | `meta-entity-tabs.tsx` |
| 670–735 | SelectionInspector | `meta-selection-inspector.tsx` |
| 737–884 | ColumnSettingsDrawer + HeatmapColorPicker | `meta-column-settings-drawer.tsx` |
| 886–1025 | ManagePagesModal | `meta-manage-pages-modal.tsx` |
| 1027–1321 | TemplateDrawer + Field/TemplateSection/TextAssetField/RequiredChecklist | `meta-template-drawer.tsx` |
| 1323–1529 | MetaBuilderDrawer + BuilderTreeItem/BuilderCard/*SettingsForm | `meta-builder-drawer.tsx` |
| 1531–2472 | Main component: state, handlers, buildColumns, render | split → hook + table + page |

Note: proposed names refined from task brief to reflect real contents (ManagePagesModal, TemplateDrawer, MetaBuilderDrawer are large enough to warrant own files; they were undersized in the original estimate).

## Target Files (all < 200 lines)
| File | ~LOC | Layer |
|------|------|-------|
| `meta-types.ts` | 90 | types |
| `meta-table-config.ts` | 165 | data (no JSX) |
| `meta-metric-helpers.ts` | 160 | pure fns |
| `meta-header.tsx` | 90 | presentational (header + MetaToolbarButton + ProgressChip) |
| `meta-entity-tabs.tsx` | 70 | presentational |
| `meta-drafts-panel.tsx` | 70 | presentational |
| `meta-selection-inspector.tsx` | 80 | presentational |
| `meta-column-settings-drawer.tsx` | 160 | presentational |
| `meta-manage-pages-modal.tsx` | 150 | presentational |
| `meta-template-drawer.tsx` | 190 | presentational (split forms to `meta-template-forms.tsx` if >200) |
| `meta-builder-drawer.tsx` | 130 | presentational |
| `meta-builder-forms.tsx` | 110 | presentational (BuilderTree/Card/SettingsForms) |
| `meta-data-table.tsx` | 180 | presentational (buildColumns + Table render) |
| `use-meta-workspace-state.ts` | 195 | state hook (all useState/useMemo/useEffect + handlers) |
| `meta-workspace-page.tsx` | 130 | orchestrator |

If `use-meta-workspace-state.ts` exceeds 200, split handlers → `meta-workspace-handlers.ts` (pure fns taking state setters as args).

## Files to Modify
- `src/pages/networks/MetaWorkspace.tsx` → becomes 3-line re-export shim: `export { MetaWorkspace } from '@/components/networks/meta/meta-workspace-page'; export type { MetaWorkspaceProps } from '...';` (preserves consumer at `NetworkWorkspace.tsx:71`). Alternatively delete + update import — shim is lower-risk, KISS.

## Data Flow (post-split)
```
meta-types.ts  ─────────────┐
meta-table-config.ts ───────┼──> meta-metric-helpers.ts ──┐
                            │                              │
        ┌───────────────────┴──────────────────────────────┤
        ▼ (presentational components import types/config/helpers)
   header / entity-tabs / drafts / selection-inspector /
   column-settings / manage-pages / template-drawer /
   builder-drawer / data-table
        ▲ props
        │
use-meta-workspace-state.ts (owns all state, returns {state, handlers, computed})
        ▲
meta-workspace-page.tsx (calls hook, distributes props to children)
        ▲
MetaWorkspace.tsx (re-export shim) ──> NetworkWorkspace.tsx
```
Strict one-directional import layering — no cycles.

## Implementation Steps (ordered, each step compiles)
1. Create `meta-types.ts` (move 72–182). Update MetaWorkspace.tsx to import from it. `tsc`.
2. Create `meta-table-config.ts` (move 184–348, keep storage keys byte-identical). Import back. `tsc`.
3. Create `meta-metric-helpers.ts` (move 350–519). Import back. `tsc`.
4. Extract leaf presentational components one at a time (entity-tabs → drafts-panel → selection-inspector → header → column-settings → manage-pages → template-drawer → builder-drawer). After each: import back, `tsc`, visual smoke.
5. Extract `meta-data-table.tsx`: move `buildColumns` + Table JSX. Pass columns/data/handlers as props.
6. Create `use-meta-workspace-state.ts`: move all useState/useMemo/useEffect + handlers (applyFilterRules, handleEntityChange, applyTablePreset, openBuilder, applyBulkStatus, handleBulkDraftGeneration) from main component. Return typed object.
7. Create `meta-workspace-page.tsx`: thin orchestrator calling the hook, rendering header + filter + drafts + entity-tabs + data-table + drawers.
8. Replace `MetaWorkspace.tsx` body with re-export shim.
9. Final `tsc --noEmit` + full visual smoke + grep for any remaining import to old internal symbols.

## Acceptance Criteria
- [ ] Every new file < 200 lines (`wc -l`)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `MetaWorkspace` named export + `MetaWorkspaceProps` type unchanged; `NetworkWorkspace.tsx` compiles untouched
- [ ] All 3 localStorage keys identical strings (grep diff)
- [ ] Visual smoke: entity tab switch, table heatmap, column drawer toggle, filter apply/clear, drafts panel, templates drawer, manage pages, AI bulk create, builder drawer — all render + function as before
- [ ] No console errors on mount

## Todo
- [ ] Step 1 — meta-types.ts
- [ ] Step 2 — meta-table-config.ts
- [ ] Step 3 — meta-metric-helpers.ts
- [ ] Step 4 — extract 8 presentational components
- [ ] Step 5 — meta-data-table.tsx
- [ ] Step 6 — use-meta-workspace-state.ts
- [ ] Step 7 — meta-workspace-page.tsx
- [ ] Step 8 — re-export shim
- [ ] Step 9 — final tsc + smoke

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|-----------|
| State hook >200 lines | M×M | Pre-plan handler split to `meta-workspace-handlers.ts` |
| Closure dependency on local state in extracted handlers | M×H | Move handlers into the hook (same closure scope) rather than standalone |
| useMemo dep arrays reference moved consts | L×M | Consts are stable module-level — deps unaffected |
| Hidden coupling via `buildColumns` reading `campaigns/adSets` | M×M | Pass as explicit props to data-table |

## Rollback
Single-commit-per-step. Revert offending step's commit; prior steps remain valid (each compiles independently). Worst case: `git revert` to shim-less state — old monolith fully restored.

## File Ownership
Single owner (sequential). No parallelism within Phase 0 — extractions share the source file.

## Unresolved Questions
- Re-export shim vs. delete-and-update-import at `NetworkWorkspace.tsx`? Recommend shim (KISS, isolates blast radius). Confirm.
- Should `meta-bulk-create-drawer.tsx` / `meta-bulk-generation.ts` move from `pages/` to `components/networks/meta/` for cohesion? Out of scope unless requested (they already comply with size rule).
