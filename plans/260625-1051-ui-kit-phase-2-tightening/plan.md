---
title: "NMS FE ui-kit phase 2 tightening"
description: "Push migrated runtime surfaces from ui-kit-compatible to ui-kit-strict tokens, hierarchy, and shared primitives."
status: in-progress
priority: P1
created: 2026-06-25
blockedBy: [260625-1756-antd-compat-token-cleanup]
blocks: []
---

# NMS FE ui-kit phase 2 tightening

## Overview

Phase 1 removed the external UI runtime stack and got the app building on the team ui-kit. Phase 2 tightens the remaining UI debt: raw utility-heavy styling, raw status/network color usage, and page-local section patterns that still drift from ikame Core DS 1.1.

## Focus Areas

1. Shared section primitives for token-safe surfaces and headers.
2. Campaign wizard screens with the heaviest local styling.
3. Automation rule editor + template picker.
4. Follow-up sweep on touched areas for raw color, shadow, and hierarchy drift.

## Acceptance Criteria

- [ ] Touched wizard and automation surfaces use token classes and shared ui-kit-aligned primitives instead of page-local raw color styling.
- [ ] Network/status chips on touched surfaces use shared badge components.
- [ ] Touched surfaces avoid inline shadow-heavy card styling unless floating.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Notes

- Scope stays incremental: no big-bang rewrite.
- Remaining raw utility debt outside touched areas can be handled in later phases after the core high-traffic flows are aligned.
