---
title: "Meta Campaign Factory — Auto Bulk Campaign Creation"
description: "Template × CreativeSet matrix generation for Meta: Templates tab, Creative Set builder, 3-step Factory wizard, ABO/CBO generation engine"
status: pending
priority: P1
effort: 24h
branch: main
tags: [meta, campaign-factory, bulk-create, creative-sets, templates]
created: 2026-06-26
brainstorm: plans/reports/brainstorm-260626-1541-meta-campaign-factory-auto-bulk-create-report.md
blockedBy: []
blocks: []
---

# Meta Campaign Factory — Auto Bulk Campaign Creation

## Goal

Build a "Campaign Factory" feature for the Meta network workspace that allows performance marketers to bulk-generate campaigns from a matrix of **Campaign Templates** × **Creative Sets** — a flow not available in native Meta Ads Manager or any competing tool.

## Core Concept

```
CampaignTemplate (objective + adset shell + ad shell)
  × 
CreativeSet[] (filter → preview → confirmed snapshot of mediaIds)
  →
ABO: 1 campaign per set (N campaigns)
CBO: 1 campaign, N ad sets (1 campaign)
```

## Key Decisions (from brainstorm)

| Item | Decision |
|------|----------|
| Template scope | Full hierarchy: campaign settings + adset shell (targeting, budget, bid) + ad shell (copy/CTA) |
| Creative Set | Hybrid: filter criteria → preview resolved → confirm as static snapshot |
| Generation output | Configurable: ABO (1 campaign/set) or CBO (1 campaign, N adsets) |
| Template management | Templates tab in Meta workspace + quick-create shortcut in Factory wizard |
| Sprint scope | Full flow: Template CRUD + Creative Set CRUD + Factory Wizard + Preview + Result |

## Phases

| # | Phase | Priority | Effort | Status | Blockers |
|---|-------|----------|--------|--------|----------|
| 1 | [Types + Mock Data](./phase-01-types-and-mock-data.md) | P1 | 3h | pending | none |
| 2 | [Templates Management Tab](./phase-02-template-management-tab.md) | P1 | 4h | pending | Phase 1 |
| 3 | [Creative Set Builder](./phase-03-creative-set-builder.md) | P1 | 4h | pending | Phase 1 |
| 4a | [Factory Wizard Shell + Steps 1–2](./phase-04-campaign-factory-wizard.md) | P2 | 3.5h | pending | Phase 2, 3 |
| 4b | [Factory Step 3 + Preview Tree](./phase-04b-factory-step-3-preview-tree.md) | P2 | 3.5h | pending | Phase 4a |
| 5 | [Generation Engine + Result](./phase-05-generation-engine-and-result.md) | P2 | 4h | pending | Phase 4b |
| 6 | [Integration + Polish](./phase-06-integration-and-polish.md) | P3 | 2h | pending | Phase 4b, 5 |

## Dependency Graph

```
Phase 1 (types)
  ├──> Phase 2 (templates tab)  ──┐
  └──> Phase 3 (creative sets)  ──┴──> Phase 4a (wizard shell + steps 1–2)
                                          └──> Phase 4b (step 3 + preview tree)
                                                 └──> Phase 5 (generation) ──> Phase 6 (integration)

Phases 2 and 3 are independent → can run in parallel.
Phase 4a and 4b are sequential (4b extends 4a's stubs).
```

## New Files

```
src/components/networks/meta/
├── campaign-factory/
│   ├── campaign-factory-drawer.tsx       # Wizard container (3 steps + result)
│   ├── factory-step-template.tsx         # Step 1: template browser + quick-create
│   ├── factory-step-creative-sets.tsx    # Step 2: creative set picker (multi-select)
│   ├── factory-step-generate-config.tsx  # Step 3: ABO/CBO + naming + preview tree
│   ├── factory-generation-result.tsx     # Result screen: progress + generated list
│   ├── creative-set-builder-drawer.tsx   # Nested drawer: filter → preview → confirm
│   ├── creative-set-card.tsx             # Reusable set display card
│   ├── generation-preview-tree.tsx       # Collapsible Campaign > AdSet > Ad tree
│   └── use-campaign-factory.ts           # Hook: full factory state + generation logic
└── meta-template-tab.tsx                 # Templates management tab (table + CRUD)
```

## Modified Files

```
src/components/networks/meta/meta-types.ts          # +CampaignTemplate, CreativeSet, GenerationConfig
src/shared/mock-data.ts                             # +mockCampaignTemplates, mockCreativeSets
src/components/networks/meta/meta-template-forms.tsx # extend for full hierarchy form
src/components/networks/meta/meta-template-drawer.tsx # extend to save full CampaignTemplate
src/shared/network-configs/meta-config.tsx          # +Templates extraTab entry point
src/components/networks/meta/meta-workspace-header.tsx (or shell) # +"Campaign Factory" button
```

## Acceptance Criteria

- [ ] User can create/edit/delete Campaign Templates with full hierarchy (campaign + adset + ad shell)
- [ ] Templates tab renders in Meta workspace with search + CRUD
- [ ] User can create Creative Sets via filter criteria → preview → confirm (snapshot)
- [ ] Creative sets persist across page refresh (localStorage)
- [ ] Factory wizard 3-step flow: template select → set select → config + preview
- [ ] Preview tree shows correct ABO or CBO hierarchy before generating
- [ ] Generate (mock) produces campaigns visible in Meta workspace Campaigns tab
- [ ] Naming pattern token substitution works: `{template}`, `{set_name}`, `{week}`, `{date}`
- [ ] Preflight warns on empty sets and naming conflicts
- [ ] `npx tsc --noEmit` passes after each phase

## Global Risks

| Risk | L×I | Mitigation |
|------|-----|-----------|
| `meta-types.ts` > 200 lines after extension | M×M | Split types into `meta-factory-types.ts` if needed |
| `meta-template-forms.tsx` complexity explosion | M×M | Keep adset + ad shell as collapsible sections |
| Creative set filter reuse conflict with `creative-performance-filter-bar.tsx` | L×M | Extend via props, not fork |
| Naming collision with existing `MetaTemplate` type | L×H | Rename existing → `MetaBuilderTemplate`, new → `CampaignTemplate` |
| Phase 6 entry point touching files also in UI/UX refinement plan | L×M | Coordinate: factory button added to Meta-specific header, not shared `NetworkWorkspaceShell` |

## Unresolved Questions (carry to implementation)

1. **Ad copy override per creative set?** — Template has 1 primaryText/headline. Does each creative set need its own copy? → Default: no override for MVP; add as optional Phase 6 enhancement.
2. **Targeting override per creative set?** — Template targeting is default. Country-split per set? → Default: no override for MVP.
3. **Template versioning?** — When template edited post-generate, old campaigns unaffected (snapshots in mock). Note in code.
4. **Backend integration timeline?** → Mock only for this sprint. Data model designed to be API-ready (ids, timestamps, jobStatus).
