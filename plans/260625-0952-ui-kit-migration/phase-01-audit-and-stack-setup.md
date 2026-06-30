---
phase: 1
title: "Audit and stack setup"
status: in-progress
priority: P1
dependencies: []
effort: "2-4h"
---

# Phase 1: Audit and stack setup

## Overview

Confirm source inventory, record the architecture decision, and remove provider/config pieces that force AntD/Tailwind as the app-level UI stack.

## Requirements

- Functional: App bootstrap remains intact with Redux, persistence, router, ui-kit `TooltipProvider`, and `Toaster`.
- Non-functional: No secrets or private registry token changes. Keep changes reversible.

## Architecture

`@frontend-team/ui-kit/style.css` is the only design-system stylesheet. App-level Tailwind plugin/config and AntD `ConfigProvider`/theme are removed after compatibility components can render without AntD.

## Related Code Files

- Modify: `package.json`, `package-lock.json`, `vite.config.ts`, `src/main.tsx`
- Delete: `src/theme/antd-theme.ts` when no imports remain
- Create: `docs/04_decisions/adr-2026-06-25-ui-kit-migration.md`

## Implementation Steps

1. Keep the audit counts in `plan.md`.
2. Draft ADR as `Proposed`.
3. Remove AntD `ConfigProvider` from `src/main.tsx`.
4. Remove app-level Tailwind plugin from `vite.config.ts`.
5. Remove unused external UI dependencies after imports are migrated.

## Success Criteria

- [ ] ADR exists with status `Proposed`.
- [ ] `src/main.tsx` no longer imports `antd`.
- [ ] `vite.config.ts` no longer imports or invokes `@tailwindcss/vite`.
- [ ] Build progresses to source component issues, not provider/config issues.
