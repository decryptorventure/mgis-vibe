# Phase 2: Structural Redesign + Persistence

Reduces cognitive load of the setup phase, removes the "everything resets" problem, and absorbs the standalone "AI Bulk Create" flow into this one. Persistence is localStorage-only for this demo pass (decision #2 in plan.md) — no backend.

## Requirements

1. **Stepper flow for setup phase** — replace 3 simultaneously-visible pickers (Templates/Themes/Creative-split) with a guided sequence, while keeping the live-preview panel persistently visible (that part already works well — don't regress it)
2. **Save/load batch presets** — persist `{selectedTemplateIds filter criteria, minCreatives, namePattern, adCopy}` to localStorage so recurring batches don't require re-entry
3. **Batch history survives refresh** — persist `batchRuns` to localStorage instead of resetting to `[]` on reload
4. **"Edit & Regenerate"** — regenerate flow currently skips straight to progress phase with locked config; should reopen editable setup pre-filled with original selections
5. **Selective per-job retry with invented error taxonomy** — use the 7-code mock taxonomy from plan.md decision #5 (`INVALID_PLACEMENT_COMBO`, `AUDIENCE_TOO_NARROW`, etc.) instead of the current opaque 10%-random error; render the human-readable reason per failed job
6. **Define a pluggable job-runner interface** — replace the hardcoded `setTimeout` mock in the progress tracker with a swappable `runJob(job): Promise<JobResult>` boundary, so real API integration later is a drop-in, not a rewrite
7. **Merge "AI Bulk Create" into this flow (retire the standalone drawer)** — see decision #3 in plan.md. Fold 3 capabilities from `meta-bulk-create-drawer.tsx` in as new pieces of the Batch Generator setup phase:
   - **Prompt-to-criteria box**: free-text input at top of setup phase ("Describe your batch..."), mock-parsed (same regex-matching style as `generateMetaCriteriaFromPrompt` in `meta-bulk-generation.ts`, adapted to match template/theme names by keyword instead of countries/audiences) to pre-select templates/themes and suggest ad copy/minCreatives
   - **Preflight panel**: validation warnings shown in the Review step before the Generate button, reusing the `MetaPreflightIssue` severity model (error/warning/info) — checks: duplicate campaign name vs `existingCampaignNames`, zero active campaigns, template missing account, all creatives excluded
   - **Recipes unified with batch presets** (requirement 2) — one save/load UI, not two separate ones
   - Remove the "AI Bulk Create" toolbar button + `MetaBulkCreateDrawer` mount from `MetaWorkspace.tsx`; "Batch Generate" becomes the single bulk-creation entry point

## Files to modify / add

- `src/components/networks/meta/meta-batch-generator-drawer.tsx` — orchestrate stepper state (extract step nav into new `meta-batch-setup-stepper.tsx` if drawer file would exceed 200L after changes — check current 224L first)
- New: `src/components/networks/meta/meta-batch-setup-stepper.tsx` — step indicator (Templates → Themes → Creative Split → Copy & Naming → Review), reuse `ui-kit-compat` `Steps`
- New: `src/components/networks/meta/use-batch-presets.ts` — localStorage-backed hook (pattern: mirror `src/shared/hooks/use-persistent-filter.ts`, don't reinvent)
- New: `src/components/networks/meta/meta-batch-prompt-criteria.tsx` — prompt-to-criteria box + mock parser (port relevant matching logic from `meta-bulk-generation.ts:generateMetaCriteriaFromPrompt`)
- New: `src/components/networks/meta/meta-batch-preflight-panel.tsx` — validation issue list (port `MetaPreflightIssue` model from `meta-bulk-generation.ts`)
- `src/components/networks/meta/meta-batch-types.ts` — add `BatchJobErrorCode` union (7 codes from plan.md decision #5) + `MetaBatchPreflightIssue` type
- `src/components/networks/meta/meta-batch-history-panel.tsx` — swap in-memory `batchRuns` state for the new persisted store
- `src/components/networks/meta/meta-batch-progress-tracker.tsx` — extract `runJob()` interface; mock impl assigns a random code from the taxonomy instead of an opaque error; render reason text per failed row
- `src/pages/networks/MetaWorkspace.tsx` — regenerate flow: pass full original selection state (not just `jobs[]`) into `regenerateJobs`/reopen setup phase; remove "AI Bulk Create" button + `MetaBulkCreateDrawer` mount (superseded by merged Batch Generator)
- Remove (after merge confirmed working): `src/pages/networks/meta-bulk-create-drawer.tsx`, `src/pages/networks/meta-bulk-generation.ts` — or keep `meta-bulk-generation.ts`'s pure parsing helpers only if reused by the new prompt-criteria component, delete the rest

## Implementation notes

- Stepper: keep right-side live preview panel unchanged in position/behavior — only the left panel becomes step-gated. This directly addresses pain point #2 (cognitive load) without touching the part of the UX that already works (live feedback).
- Presets: reuse `use-persistent-filter.ts` pattern already in `src/shared/hooks/` — don't build a second localStorage abstraction (DRY).
- History persistence: same localStorage approach as presets, OR wait for backend if open question #2 resolves to "server-side." Don't build both.
- Edit & Regenerate: the fix is structural — `regenerateJobs` prop currently only carries `BatchJob[]`; needs to also carry the originating `selectedTemplateIds/selectedThemeIds/minCreatives/namePattern/adCopy` so setup phase can be reopened pre-filled instead of jumping straight to progress.
- Job-runner interface: this is the single most important seam for Phase 3 — an agent backend (or real Meta API client) should be able to satisfy `runJob(job): Promise<JobResult>` without touching UI code at all.

## Validation

- Manual QA: complete a batch, refresh page, verify history still shows the run (once persistence lands); save a preset, close drawer, reopen, verify preset loads; regenerate from history, verify setup phase reopens with original selections editable.
- `tsc --noEmit` after each file change (repo convention per session state).

## Risks / Rollback

Medium — stepper reflow changes drawer layout; test that existing e2e/manual flows (if any exist) still find pickers. Persistence via localStorage is additive/optional (falls back to current session-only behavior if storage read fails) — safe to ship incrementally.
