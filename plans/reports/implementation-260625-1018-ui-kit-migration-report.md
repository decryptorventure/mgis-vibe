# UI kit migration report

## Scope

Migrate `nms-fe` runtime UI stack from Ant Design + app-level Tailwind wiring to `@frontend-team/ui-kit` + ikame Core DS 1.1.

## Done

- Removed direct source imports from `antd` and `antd/es/*`; source now routes through `src/components/ui-kit-compat/` or direct `@frontend-team/ui-kit`.
- Removed app runtime/provider setup for AntD. Root now uses `@frontend-team/ui-kit/style.css`, `TooltipProvider`, and `Toaster`.
- Added `ui-kit-compat` shims for table, form, layout, overlay, display, and control surfaces so current pages keep building while runtime stack is on ui-kit.
- Removed direct app dependencies: `antd`, `@radix-ui/themes`, `@tailwindcss/vite`, `tailwindcss`, `clsx`, `tailwind-merge`.
- Replaced local `cn` helper usage with ui-kit `cn`.
- Refactored `MetaErrors` off undeclared `dayjs` transitive usage to native date helpers.
- Updated `README.md`, `docs/README.md`, `docs/02_architecture.md`, and ADR context to reflect the new runtime stack.

## Validation

- `npm run build` : passed
- `npm run lint` : failed, but failure is baseline-wide lint debt after config root-dir fix, not a migration compile/runtime regression
- Source scan:
  - no `antd` imports under `src/`
  - no `antd`, `@radix-ui/themes`, `@tailwindcss/vite`, `tailwindcss`, `clsx`, `tailwind-merge` in `package.json`

## Risks

- `src/components/ui-kit-compat/` is transitional. Runtime stack is migrated, but page-level direct ui-kit adoption is still incremental.
- `npm run lint` now reports existing repo issues such as `no-explicit-any`, `react-hooks/set-state-in-effect`, and `react-refresh/only-export-components`.

## QA handoff

- Smoke app shell, dashboard, network workspaces, automation, and meta-errors.
- Verify drawers, tables, filters, and date pickers still render and accept interaction.
- Check dark/light theme toggle paths because provider stack changed.

## Unresolved questions

None.
