# ADR 2026-06-25: Migrate NMS FE to team UI kit

```yaml
status: Proposed
date: 2026-06-25
decision_owner: TBD
scope: nms-fe
```

## Context

`nms-fe` currently uses a hybrid UI stack: Ant Design, app-level Tailwind, custom CSS variables, and partial `@frontend-team/ui-kit` adoption. The team standard is `@frontend-team/ui-kit` + ikame Core DS 1.1, with token-first styling and no external UI library imports in consuming apps.

The user explicitly requested full migration on 2026-06-25.

## Options Considered

1. Keep Ant Design and only polish tokens.
   - Lowest short-term risk.
   - Fails team UI-kit standard and keeps duplicated theme systems.
2. Big-bang rewrite every page directly to ui-kit.
   - Clean final shape.
   - High regression risk across many routes and data-heavy screens.
3. Incremental migration through a local ui-kit-backed compatibility layer.
   - Removes external UI imports quickly.
   - Keeps app buildable while page-level cleanup proceeds.
   - Leaves temporary adapter code to retire later.

## Decision

Use option 3. Add a local compatibility layer backed by `@frontend-team/ui-kit` and native elements, migrate all source imports off Ant Design, then progressively replace compatibility usage with direct ui-kit components and ikame token classes.

## Consequences

- `@frontend-team/ui-kit/style.css`, `TooltipProvider`, and `Toaster` become the active UI foundation.
- Ant Design provider/theme and app-level Tailwind plugin are removed.
- Some screens may temporarily use local compatibility components until page-level refactors finish.
- Documentation must be updated once code reflects the new runtime stack.

## Validation

- `npm run build`
- `npm run lint`
- `dk:ui-review`

## Unresolved Questions

None.
