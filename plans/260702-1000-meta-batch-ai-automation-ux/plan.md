# Plan: Meta Batch Campaign Generator — UX Optimization → AI-Agent Automation

Status: Phase 1 + Phase 2 implemented and manually verified in browser (2026-07-02). Phase 3 remains backlog (see phase-03 file).
Branch: main | Created: 2026-07-02

## Implementation Notes (2026-07-02)

- All Phase 1 + Phase 2 requirements shipped: confirm-before-generate modal, per-job error taxonomy (7 mock codes) with per-row retry, visible "Excluded" tag, full name-list preview, fixed slicing-aware footer copy, a11y pass (aria-label/role=checkbox/aria-live), 3-step setup stepper, localStorage-backed batch presets + run history, "Edit & Regenerate" reopening editable setup, pluggable `runJob()` interface, and the AI-Bulk-Create merge (prompt-to-criteria box + preflight panel + unified recipes/history). `meta-bulk-create-drawer.tsx` / `meta-bulk-generation.ts` deleted; "AI Bulk Create" toolbar entry removed — "Batch Generate" is now the single bulk-creation entry point.
- New capability beyond the original plan: batch-generated campaigns now materialize as real DRAFT Campaign/AdSet/Ad rows in the workspace table (`meta-batch-entity-builder.ts` + `addBatchGeneratedEntities`) — the old batch generator never did this; it's ported from AI Bulk Create's "materialize as drafts" behavior, closing a gap where a "completed" batch didn't actually add anything to the table.
- Bug found and fixed during self-review: draft Campaign/AdSet/Ad IDs were derived only from `combination.id` + `sliceIndex`, so regenerating the same template/theme/slice would collide with previously materialized rows (same `id` twice in state). Fixed by threading a per-run `runId` into `buildDraftEntitiesFromBatchJobs`. Verified live: generate → regenerate same combo → 5th distinct campaign appears, no React duplicate-key warning.
- `npx tsc --noEmit` and `npx eslint` clean on all touched/new files (pre-existing lint debt in untouched files and two files with debt present before this change — `MetaWorkspace.tsx` 259→275 lines, `use-meta-workspace.ts` set-state-in-effect patterns — left as-is, out of scope).
- Automated code-reviewer subagent hit a session limit mid-run; review was completed manually instead (see this section + git diff).

## Context

Meta "Batch Generate" flow (`src/components/networks/meta/meta-batch-*`) creates N campaigns from Template × Theme combos + creative slicing. Current state: fully mocked (no real Meta API), session-only history, 12 concrete UX pain points found (see reports). User wants: (1) easier to use/track flow now, (2) roadmap toward 100% AI-Agent-driven automation.

Reports:
- `plans/reports/scout-260702-0859-codebase-structure-report.md` — codebase map
- Deep UX flow analysis — see Unresolved Questions + pain points below (from live agent research, not yet written to a standalone file)

## Design constraint

Org default is `/dk:ui-kit`: all UI stays on `@frontend-team/ui-kit` + `ui-kit-compat` (Modal, Drawer, Table, Tag, Steps, Alert, etc). No new design system/palette introduced — this plan only reorders/extends existing components.

## Phases

| # | Phase | Effort | Depends on |
|---|---|---|---|
| 1 | [Quick-win UX fixes](phase-01-quick-win-ux-fixes.md) | Low, in-place edits to existing files | none |
| 2 | [Structural redesign + persistence](phase-02-structural-redesign-persistence.md) | Medium, new sub-components + localStorage | Phase 1 |
| 3 | [AI-agent automation roadmap](phase-03-ai-agent-automation-roadmap.md) | High, new screens + backend/agent dependency | Phase 1+2, backend agent infra (out of FE scope) |

## Acceptance Criteria (overall)

- Phase 1: user cannot trigger >10-campaign batch without explicit confirm; every failed job shows a human-readable reason; exclusion state is unambiguous; a11y checks pass (aria-live errors, keyboard pause/resume, native-equivalent checkbox semantics)
- Phase 2: setup flow is steppable (not 3 stacked pickers at once); user can save/reuse a batch config; history survives page refresh; regenerate reopens editable setup, not locked progress
- Phase 3: FE ships an "agent control surface" (approval queue, guardrail settings, audit trail, autonomy-level indicator, kill switch, multi-run monitoring dashboard) that a future agent backend can plug into via a defined job-runner interface

## Decisions (resolved 2026-07-02)

1. **Mock data only, no real API.** This build is a vibe-code handoff to another dev — stay 100% mock/local. No real Meta API integration in this pass.
2. **localStorage for persistence.** Batch presets + run history persist to localStorage for the demo. No backend.
3. **Merge "AI Bulk Create" into Batch Generator — single entry point.** Read `meta-bulk-create-drawer.tsx` + `meta-bulk-generation.ts`: that flow builds campaigns from a country×audience criteria matrix via prompt-to-criteria (regex-based mock "AI"), with preflight validation issues, saved recipes, and run history. Retire it as a separate toolbar button/drawer in `MetaWorkspace.tsx`; fold its 3 differentiators into the Batch Generator:
   - **Prompt-to-criteria box** — free-text field that mock-parses intent and pre-fills existing batch fields (matches templates/themes by keyword, sets minCreatives/ad copy hints) — same mock-parsing style as `generateMetaCriteriaFromPrompt`, adapted to this flow's fields instead of country/audience.
   - **Preflight issues panel** — validation warnings shown before the Generate button (reuse `MetaPreflightIssue`-style severity model: error/warning/info), using the invented taxonomy below.
   - **Recipes → unify with Phase 2's "batch preset"** — one save/load mechanism, not two. Keep the existing `BatchHistoryPanel`/`BatchRunDetail` as the single run-history UI (localStorage-backed per decision 2); drop the AI Bulk drawer's separate `MetaAutomationRun[]` state.
4. **"AI Agent" = third-party model integration**, not in-house. Phase 3's agent *logic* is out of scope for this repo/pass — only the future control-surface hooks matter, and are NOT built in this cook pass (see phase-03, marked backlog).
5. **Invented common error taxonomy** for job failures (mock, mimics real Meta Ads API categories) — used by progress tracker + preflight panel:
   - `INVALID_PLACEMENT_COMBO` — "Selected placements aren't compatible with this campaign's objective"
   - `AUDIENCE_TOO_NARROW` — "Estimated audience size is too small for this ad set"
   - `BUDGET_BELOW_MINIMUM` — "Daily budget is below the account's minimum for this objective"
   - `DUPLICATE_CAMPAIGN_NAME` — "A campaign with this name already exists in the ad account"
   - `MISSING_PAGE_ATTACHMENT` — "No Facebook Page attached for this ad's call-to-action"
   - `CREATIVE_ASSET_REJECTED` — "A media file failed creative policy pre-check (aspect ratio/duration)"
   - `RATE_LIMITED` — "Meta API rate limit hit — retry after a short delay"

## Cook scope for this pass

**In scope:** Phase 1 (quick-win UX fixes) + Phase 2 (stepper setup, localStorage presets/history, edit & regenerate, merged AI-Bulk-Create prompt/preflight/recipe capability).
**Out of scope (backlog, needs real third-party AI model + backend first):** Phase 3 L2–L4 (approval queue, guardrails, audit trail, kill switch, multi-run monitor dashboard). Left as roadmap for the next dev.
