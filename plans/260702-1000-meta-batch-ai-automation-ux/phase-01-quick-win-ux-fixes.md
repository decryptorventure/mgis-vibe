# Phase 1: Quick-Win UX Fixes

Low-risk, in-place edits to existing meta-batch-* files. No new architecture, no persistence changes. Uses only existing `ui-kit-compat` components (Modal, Alert, Tag, Tooltip).

## Requirements

1. **Confirm before generate** — block accidental large batches
2. **Surface per-job error reason** — `error?: string` field exists on `BatchJob` (meta-batch-types.ts) but is never rendered
3. **Make exclusion state unambiguous** — 40% opacity alone is too subtle
4. **Full campaign-name preview** — only first combo's name currently resolves
5. **Fix "templates × themes" copy** — hides slicing, misleads on real campaign count
6. **Accessibility pass** — native checkbox semantics, aria-label on search, aria-live on errors, keyboard shortcut for pause/resume

## Files to modify

- `src/components/networks/meta/meta-batch-generator-drawer.tsx` — add confirm-before-generate step
- `src/components/networks/meta/meta-batch-progress-tracker.tsx` — render `job.error`, per-job retry, aria-live region, keyboard shortcut
- `src/components/networks/meta/meta-batch-matrix-preview.tsx` — exclusion visual (strikethrough + "Excluded" tag instead of opacity-only), full name-list preview, fixed count copy, aria-labels on expand chevrons
- `src/components/networks/meta/meta-batch-template-picker.tsx`, `meta-batch-theme-picker.tsx` — native-equivalent checkbox aria state, aria-label on search inputs

## Implementation notes

- Confirm modal: use `ConfirmModal` from `src/components/ui/` (already the house pattern for destructive/high-impact actions). Threshold: show confirm always, but escalate wording ("This will create N campaigns") when N > 10.
- Error reason: mock currently only sets `status: 'error'` with no reason. Add a small fixed taxonomy to the mock (`'BUDGET_TOO_LOW' | 'AUDIENCE_OVERLAP' | 'PLACEMENT_INVALID' | 'UNKNOWN'`) so Phase 1 can render *something* real before Phase 2 wires actual API errors. Render as inline text under the failed row + keep bulk "Retry N Failed" but add a per-row "Retry" action.
- Exclusion: add a `Tag` "Excluded" badge on the row (not just opacity) — passes `color-not-only` a11y rule (don't convey state by visual dimming alone).
- Name preview: replace single-name preview with a scrollable list of all resolved names (or first 5 + "+N more"), each computed via existing `resolveNamePattern()`.
- Count copy: change footer text pattern from `"{t} templates × {th} themes = {z} campaigns"` to `"{z} campaigns from {t} templates × {th} themes (creative-split)"` — keep it one line, just remove the false-equivalence framing.
- A11y: swap custom checkbox SVGs for `<input type="checkbox">` styled via ui-kit token classes (or confirm ui-kit's existing Checkbox already exposes correct aria — check `ui-kit-compat` first before adding raw `<input>`), add `aria-label` to all search `<Input>`, wrap error banner in `role="alert"`, add `onKeyDown` space-bar toggle for pause/resume buttons.

## Validation

- Manual QA: trigger a 15-campaign batch, verify confirm modal fires; force a mock error, verify reason text renders inline; toggle exclusion, verify Tag + counter both update; tab through setup phase with keyboard only, verify all controls reachable and screen-reader-announced (via ui-kit-compat's built-in a11y where present).
- No automated test suite currently covers these files (per scout, no test files found under networks/meta) — flag manual QA as the validation method; note in review if a smoke test should be added.

## Risks / Rollback

Low risk — purely additive UI changes, no state-shape changes except adding `error` taxonomy to mock generator (backward compatible, optional field). Rollback = revert the diff.
