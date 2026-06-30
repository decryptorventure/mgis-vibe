---
phase: 4
title: "Frontend hard-rules and docs gates"
status: pending
priority: P2
dependencies: [3]
effort: "2-5d"
---

# Phase 4: Frontend hard-rules and docs gates

## Overview

Close governance gaps: oversized files, `any`, relative imports, docs drift, and review gate artifacts.

## Requirements

- Functional: No route regressions.
- Non-functional: Frontend hard-rules compliance is improved without unrelated rewrites.

## Architecture

Large route modules are split only where it reduces real complexity. Docs are updated after source reflects the new runtime stack.

## Related Code Files

- Modify: top oversized files over 200 lines.
- Modify: `README.md`, `docs/02_architecture.md`
- Modify: `ui-review-decision.json`
- Create: implementation report under `plans/reports/`

## Implementation Steps

1. Split the largest files by stable domain boundaries.
2. Replace remaining `any` in touched migration surfaces with typed interfaces or `unknown` narrowing.
3. Convert relative imports to `@/` aliases except same-file local patterns if still justified.
4. Run `npm run build`, `npm run lint`, and `dk:ui-review`.
5. Update docs and implementation report with context delta.

## Success Criteria

- [ ] `npm run build` passes.
- [ ] `npm run lint` passes or failures are documented with a fix path.
- [ ] `ui-review-decision.json` is updated from `major-violations`.
- [ ] README and architecture docs no longer describe AntD/Tailwind as the active FE UI stack.

## Unresolved Questions

None.
