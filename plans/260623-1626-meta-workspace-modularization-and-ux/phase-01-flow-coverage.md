# Phase 1 — Full Flow Coverage

**Priority:** P2 · **Status:** pending · **Effort:** 6h · **Blocked by:** Phase 0

## Overview
Close 3 flow gaps that force extra clicks or hide useful signal. All work lands in the new modular files — no monolith edits.

## Task 1 — Inline row expand for adset hierarchy (2.5h)
Click chevron on a campaign row → expand inline to show its ad sets (no entity-tab switch).

**Data flow:** campaign row → `expandedRowRender(campaign)` → filter `normalizedAdSets` by `campaignId` → render compact nested table (subset of columns: name, status, budget, amountSpent, resultRoas).

**Files:**
- Modify `meta-data-table.tsx`: add Ant `expandable={{ expandedRowRender, rowExpandable }}` for `entity==='campaigns'` only.
- Modify `use-meta-workspace-state.ts`: add `expandedRowKeys` state + `onExpandedRowsChange`.
- New (optional) `meta-inline-adset-rows.tsx` (~80 lines) if render exceeds inline budget.

**Acceptance:**
- [ ] Chevron visible only on campaign rows (not adsets/ads)
- [ ] Expand shows that campaign's ad sets, compact columns, correct values
- [ ] No double-fetch; reuses `normalizedAdSets`
- [ ] Collapsing/expanding does not reset selection or filters

## Task 2 — Quick-resume draft (1.5h)
"Resume" on a draft row opens MetaBuilderDrawer at the draft's current step.

**Data flow:** draft row → onResume(draft) → `openBuilder('campaigns', { mode: 'edit', entity, step: draft.currentStep, draftId })` → builder opens on correct step.

**Files:**
- Modify `meta-drafts-panel.tsx`: add Resume button per draft, wire `onResume` prop.
- Modify `meta-builder-drawer.tsx`: accept `initialStep` in `BuilderContext`, set `activeTab` from it.
- Modify `use-meta-workspace-state.ts`: extend `openBuilder` to accept/forward step.

**Acceptance:**
- [ ] Resume opens builder at draft's step (verify 4-step mapping)
- [ ] Existing "create" entry still defaults to step 1
- [ ] Draft id carried in builder context for later save-back

## Task 3 — Spend pacing chip (2h)
Badge on amountSpent column: "✓ On Track" / "⚠ Over Pace" / "↓ Under Pace".

**Data flow:** row → `getPacingStatus(row)` (pure, in `meta-metric-helpers.ts`) compares `amountSpent` vs expected daily pace = `budget × elapsedFraction`. Thresholds: within ±10% = on track, >+10% = over, <-10% = under.

**Files:**
- Modify `meta-metric-helpers.ts`: add `getPacingStatus(row): 'on'|'over'|'under'` + `getPacingMeta(status)` (label+color). Pure, deterministic from existing fields (no new data).
- Modify `meta-data-table.tsx` / column builder: render chip in amountSpent cell.

**Acceptance:**
- [ ] Chip renders inline with spend value, 3 states with distinct color/icon
- [ ] Logic pure + deterministic (unit-testable)
- [ ] No layout shift / column width overflow (widen amountSpent if needed)

## Implementation Steps
1. Task 3 first (pure helper, lowest risk, isolated).
2. Task 1 (table expandable).
3. Task 2 (builder step plumbing).
4. `tsc` + smoke after each.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|-----------|
| expandedRowRender perf on large lists | L×M | Render only on expand; mock data small |
| Builder step enum mismatch with draft.currentStep | M×M | Map explicitly; default to step 1 on unknown |
| Pacing thresholds arbitrary | M×L | Centralize constants in helper; easy to tune |

## Rollback
Each task = own commit. Revert independently; Phase 0 untouched.

## File Ownership
data-table + helpers + drafts-panel + builder-drawer + state hook. No overlap with Phase 2 files except `meta-data-table.tsx` (Task 1/3) — sequence Phase 1 table edits before Phase 2 if run together, or assign table to one owner.

## Todo
- [ ] Task 3 — pacing chip
- [ ] Task 1 — inline adset expand
- [ ] Task 2 — quick-resume draft
- [ ] tsc + smoke

## Unresolved Questions
- Pacing needs an "elapsed fraction" — is there a campaign start date + flight length in mock data, or assume month-to-date? Confirm source field.
- Draft `currentStep` field name/shape in `DraftCampaign` type — verify before Task 2.
