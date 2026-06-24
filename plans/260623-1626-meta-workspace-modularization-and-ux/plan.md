---
title: "Meta Workspace Modularization + UX Optimization"
description: "Split 2,473-line MetaWorkspace into <200-line modules, then close flow gaps and polish UX"
status: pending
priority: P1
effort: 26h
branch: main
tags: [meta, refactor, modularization, ux, networks]
created: 2026-06-23
---

# Meta Workspace Modularization + UX Optimization

## Goal
`src/pages/networks/MetaWorkspace.tsx` is 2,473 lines (12x over 200-line rule). Decompose into focused modules under `src/components/networks/meta/`, then implement missing flows and UX polish. Zero behavior change in Phase 0.

## Key Decisions
1. **Extract-in-place, not rewrite.** File already has self-contained inline components (DraftCampaignsPanel, EntityTabs, SelectionInspector, ColumnSettingsDrawer, ManagePagesModal, TemplateDrawer, MetaBuilderDrawer). Lift each to its own file — minimal logic change, lowest risk.
2. **Preserve public contract.** `MetaWorkspace` named export + `MetaWorkspaceProps` must stay identical — consumed by `src/pages/NetworkWorkspace.tsx:71`. Orchestrator re-exports from new location OR keeps a 1-line re-export shim at old path.
3. **State stays in orchestrator via custom hook.** `use-meta-workspace-state.ts` owns useState/useMemo/useEffect; orchestrator wires hook output to presentational children. Avoids prop-drilling explosion and context overhead (YAGNI — single consumer).
4. **Pure data/helpers first.** `meta-table-config.ts` + `meta-metric-helpers.ts` have no JSX/state — extract first, they unblock everything else.
5. **Reuse existing route.** Phase 2-3 wizard nav target `apps/:appId/networks/:networkId/campaigns/new` already exists (appRoutes.tsx:71, shell line 195). No new route.

## Phases

| # | Phase | Priority | Effort | Status | Blockers |
|---|-------|----------|--------|--------|----------|
| 0 | [Modularization](./phase-00-modularization.md) | P1 | 14h | ✅ completed | none |
| 1 | [Flow Coverage](./phase-01-flow-coverage.md) | P2 | 6h | ✅ completed | Phase 0 |
| 2 | [UX Polish](./phase-02-ux-polish.md) | P3 | 6h | ✅ completed | Phase 0 |

## Dependency Graph
```
Phase 0 (modularize) ──┬──> Phase 1 (flows)
                       └──> Phase 2 (UX)
Phase 1 and Phase 2 are independent of each other (different files) → can run parallel.
```

## Global Risks
| Risk | L×I | Mitigation |
|------|-----|-----------|
| Behavior regression during extract | M×H | Phase 0 = pure move, no logic edits; `tsc` + manual smoke per sub-step |
| Circular imports (config↔helpers↔components) | M×M | Strict layering: types→config→helpers→components→hook→page |
| Broken public export | L×H | Keep `MetaWorkspace` export name; verify NetworkWorkspace.tsx compiles |
| localStorage key drift | L×H | Keep all 3 storage keys byte-identical in extracted config |

## Success Criteria (whole plan)
- All new files < 200 lines; `npx tsc --noEmit` clean
- Meta workspace renders identically post-Phase-0 (visual smoke: tabs, table, drawers, filters, drafts)
- Phase 1: inline expand, quick-resume draft, pacing chip all functional
- Phase 2: filter chips, creative drawer, wizard nav all functional

## Unresolved Questions
- See per-phase files; carried to bottom of each.
