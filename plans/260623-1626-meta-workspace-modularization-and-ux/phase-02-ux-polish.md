# Phase 2 — UX Polish

**Priority:** P3 · **Status:** pending · **Effort:** 6h · **Blocked by:** Phase 0 (independent of Phase 1)

## Overview
Three UX refinements: faster filtering, richer creative inspection, and routing Create Campaign to the existing full-page wizard.

## Task 1 — Smart filter presets (2h)
Replace primary filtering with quick-filter chips; keep the advanced rule builder as a collapsible fallback.

**Chips:** Active only · Paused only · Budget > $1k · ROAS < 1.5. Toggling a chip sets `appliedFilters` to an equivalent FilterRule set.

**Data flow:** chip click → preset → maps to existing `appliedFilters` FilterRule[] → existing `applyFilterRules` unchanged.

**Files:**
- Modify `meta-filter-panel.tsx` (extracted in Phase 0): add chip row above advanced builder; "Advanced" toggle reveals existing builder.
- Modify `use-meta-workspace-state.ts`: add `activeChips` state + `toggleChip` mapping chips → FilterRule[].
- New `meta-filter-presets.ts` (~40 lines): chip definitions + chip→FilterRule mapper (pure).

**Acceptance:**
- [ ] 4 chips toggle correctly, reflected in filtered table
- [ ] Multiple chips combine (AND semantics, matches existing applyFilterRules)
- [ ] Advanced builder still available + functional under toggle
- [ ] Clear resets chips + advanced rules

## Task 2 — Creative Lab inline preview (2.5h)
Click a creative card in Creative Lab → side drawer with full metrics + status controls.

**Data flow:** card click → selected creative → drawer renders metrics (from `getMetricValue`) + status switch (ACTIVE/PAUSED) → status change updates ads array via callback.

**Files:**
- Modify `src/components/networks/meta/meta-creative-lab-tab.tsx` (90 lines now): add `onSelect`, render drawer. If >200 lines, split drawer to `meta-creative-detail-drawer.tsx` (~120 lines).
- Reuse `meta-metric-helpers.ts` for metric formatting (DRY).

**Acceptance:**
- [ ] Card click opens drawer with that creative's metrics
- [ ] Status toggle updates state + reflects in card
- [ ] Drawer close returns to grid, no state loss
- [ ] creative-lab-tab.tsx stays < 200 lines (split if needed)

## Task 3 — Campaign wizard integration (1.5h)
"Create Campaign" inside Meta workspace navigates to existing full-page wizard route instead of opening builder modal.

**Existing route (verified):** `apps/:appId/networks/:networkId/campaigns/new` → `CampaignCreatePage` (`appRoutes.tsx:71`; shell already navigates here at `network-workspace-shell.tsx:195`).

**Data flow:** Create Campaign button → `useNavigate()` → `/apps/${appId}/networks/meta/campaigns/new`. `appId` from `useParams` (already used in MetaWorkspace).

**Files:**
- Modify `meta-header.tsx` (or wherever Create Campaign button lands post-Phase-0): add `useNavigate`, replace `openBuilder` call for the top-level Create Campaign action with route nav.
- Keep MetaBuilderDrawer for edit / adset / ad creation (only the campaign-create entry reroutes).

**Acceptance:**
- [ ] Create Campaign navigates to `/apps/:appId/networks/meta/campaigns/new`
- [ ] Edit campaign / create adset / create ad still use drawer (unchanged)
- [ ] Back returns to workspace with state intact (route-level, no preserved local state expected)

## Implementation Steps
1. Task 3 (smallest, isolated nav change).
2. Task 1 (filter chips).
3. Task 2 (creative drawer).
4. `tsc` + smoke after each.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|-----------|
| Chip→FilterRule mapping diverges from builder semantics | M×M | Single pure mapper, unit-test AND combination |
| creative-lab-tab exceeds 200 lines | M×L | Pre-plan drawer split |
| Wizard route expects params Meta doesn't pass | L×M | Verify CampaignCreatePage reads only appId/networkId from params |
| Builder still wired to campaign-create elsewhere | M×M | Grep openBuilder('campaigns', create) call sites; reroute only top-level button |

## Backwards Compatibility
- Advanced filter builder preserved (no removal) — existing power-user flow intact.
- Builder drawer retained for non-campaign-create flows.
- Wizard route already live → no migration.

## Rollback
Each task own commit, independently revertable. Phases 0/1 untouched.

## File Ownership
filter-panel + filter-presets (T1), creative-lab-tab + creative-detail-drawer (T2), meta-header (T3). Overlap with Phase 1 only at `meta-data-table.tsx` — none here, safe to parallelize with Phase 1.

## Todo
- [ ] Task 3 — wizard nav
- [ ] Task 1 — filter chips
- [ ] Task 2 — creative drawer
- [ ] tsc + smoke

## Unresolved Questions
- Does `CampaignCreatePage` pre-select Meta network from `:networkId` param, or need extra query/state? Verify before Task 3.
- Should chip filters and advanced rules be mutually exclusive or stack? Plan assumes stack (AND). Confirm.
