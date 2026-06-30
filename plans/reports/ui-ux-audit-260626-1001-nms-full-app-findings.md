# NMS UI/UX Full-Application Audit — Findings Report
**Date:** 2026-06-26 | **Scope:** All routes, 5 network workspaces, shared layout
**Design baseline:** ikame Core DS 1.1 + @frontend-team/ui-kit
**Plan:** `plans/260626-1001-ui-ux-refinement-plan/plan.md`

---

## Application Profile

| Dimension | Value |
|-----------|-------|
| Type | B2B SaaS — Ad Operations Platform |
| Routes | 23+ (global + app-scoped + network workspaces) |
| Networks | Google Ads, Meta, ASA, Axon, Moloco |
| Primary users | Media buyers, campaign managers (desktop-first) |
| Design style | Data-Dense Dashboard (space-efficient, multi-widget, max data visibility) |
| UI stack | @frontend-team/ui-kit + Lucide icons + Recharts + React Router |

---

## Overall Assessment

The app has a **solid foundation**: good navigation structure, consistent network color coding, token-based theming, and well-extracted components. The gaps are concentrated in **interaction completeness** (missing validation, feedback, and guardrails in key flows) and **state consistency** (filter persistence applied unevenly). No structural rewrites needed — all fixes are additive.

---

## Issue Inventory by Priority

### P1 — Critical (daily-use friction)

| # | Issue | Location | Phase |
|---|-------|----------|-------|
| C1 | Campaign wizard "Next" never disabled — user can skip required fields | `campaign-create-page.tsx` | 01 |
| C2 | No submission loading state — wizard submit gives no feedback | `wizard-step-review.tsx` | 01 |
| C3 | No unsaved-changes warning when leaving in-progress wizard | `campaign-create-page.tsx` | 01 |
| C4 | Draft auto-save exists but is invisible — user doesn't know draft is saved | `campaign-wizard-modal.tsx` | 01 |
| C5 | Rule editor: schedule `interval=0` accepted — silent fail | `rule-editor-modal.tsx` | 01 |
| C6 | Rule editor: network change resets conditions/actions without warning | `rule-editor-modal.tsx` | 01 |
| C7 | Rule editor: only 1 condition + 1 action supported — multi-condition needed | `rule-editor-modal.tsx` | 01 |
| C8 | Template picker: no preview before "Use Template" commit | `rule-template-picker.tsx` | 01 |
| C9 | Empty state missing when filter returns 0 results (Meta, Axon, Automation) | Multiple | 02 |
| C10 | Loading: full-page spinner instead of skeleton rows causes layout jump | Network workspaces | 02 |

### P2 — High (workflow efficiency)

| # | Issue | Location | Phase |
|---|-------|----------|-------|
| H1 | Filter state resets on page refresh for most pages | 8 pages | 03 |
| H2 | "Clear all filters" button missing or inconsistent | `FilterBar.tsx` + pages | 03 |
| H3 | Creative library: no bulk select → no bulk delete without opening each card | `MediaLibraries.tsx` | 02 |
| H4 | Meta workspace: 26 columns visible by default — overwhelming | `meta-report-table.tsx` | 02 |
| H5 | Column visibility for Axon workspace not wired | `axon-workspace-overview-tab.tsx` | 02 |
| H6 | Table sort order resets on navigation | `network-campaign-table.tsx` | 02 |
| H7 | No tab state restored when back-navigating between networks | Network workspaces | 03 |
| H8 | App Dashboard: no manual refresh button | `app-dashboard/index.tsx` | 02 |
| H9 | Permissions page: no Select All / bulk grant-revoke | `Permissions.tsx` | 02 |
| H10 | Creative grid: all items rendered at once — slow at 100+ assets | `MediaLibraries.tsx` | 02 |
| H11 | Notification read state resets when drawer is reopened | `NotificationDrawer.tsx` | 03 |
| H12 | Breadcrumb wrong for Portfolio view and Analytics sub-pages | `navigation.ts` | 03 |

### P3 — Medium (mobile + polish)

| # | Issue | Location | Phase |
|---|-------|----------|-------|
| M1 | Campaign wizard step sidebar unusable below 768px | `campaign-create-page.tsx` | 04 |
| M2 | Network context bar overflows at <768px (no scroll) | `NetworkContextBar.tsx` | 04 |
| M3 | Campaign tables: horizontal scroll with no sticky first column or visual cue | `network-campaign-table.tsx` | 04 |
| M4 | Workspace header: date picker + 3 buttons overflow at 375px | `network-workspace-shell.tsx` | 04 |
| M5 | No swipe-to-open for mobile sidebar | `AppSidebar.tsx` | 04 |
| M6 | Body scroll not locked when mobile sidebar drawer is open | `AppSidebar.tsx` | 04 |
| M7 | Modal max-height `70vh` clips on landscape/short screens | `overlays.tsx` | 04 |
| M8 | Spacing inconsistencies (`p-5`, `gap-2.5`) break 8dp rhythm | Multiple | 04 |
| M9 | Custom `<button>` elements lack hover/active states | Multiple | 05 |
| M10 | Modal/Drawer open does not auto-focus first element | `overlays.tsx` | 05 |
| M11 | Focus not returned to trigger element on modal close | `overlays.tsx` | 05 |
| M12 | `⌘K` command palette has no discoverability hint in header | `AppHeader.tsx` | 05 |
| M13 | Network text colors fail WCAG AA on white backgrounds | `network-config.ts` | 05 |
| M14 | `prefers-reduced-motion` not respected globally | `index.css` | 05 |
| M15 | Icon-only buttons missing `aria-label` throughout | Multiple | 05 |
| M16 | Status badge tokens inconsistent (mix of raw colors + tokens) | `StatusBadge.tsx` | 05 |
| M17 | Inline edit cell: no auto-focus, no blur-to-save, no Escape-cancel | `inline-edit-cell.tsx` | 05 |

---

## Positive Patterns (preserve)

- `EmptyState` component exists and is well-designed — just needs consistent adoption
- `usePersistentFilter` hook is solid — needs broader application
- Modal/Drawer portal implementation (from recent fix) is correct — backdrop, X button, Escape handler
- Network color system (`network-config.ts`) is centralized — easy to fix contrast in one place
- `DataTable` wrapper handles loading/pagination/empty-state scaffold
- `useMockQuery` delay simulation is realistic — good for UX testing
- Tab overflow to "More" dropdown in network workspace is well-implemented
- Command palette (`Cmd+K`) implementation is complete — just needs discoverability

---

## Files with Most Issues (hotspots)

| File | Issue Count | Priority |
|------|-------------|----------|
| `src/pages/campaign-create-page.tsx` | 4 | P1 |
| `src/components/automation/rule-editor-modal.tsx` | 4 | P1 |
| `src/components/networks/network-campaign-table.tsx` | 3 | P1–P3 |
| `src/components/layout/AppSidebar.tsx` | 2 | P3 |
| `src/components/ui-kit-compat/overlays.tsx` | 3 | P3 |
| `src/components/layout/NetworkContextBar.tsx` | 2 | P3 |
| `src/pages/MediaLibraries.tsx` | 3 | P2 |

---

## Estimated Effort by Phase

| Phase | Issues Addressed | Files | Estimated Effort |
|-------|-----------------|-------|-----------------|
| 01 — Core Flows | C1–C8 | 10 | Large (complex state) |
| 02 — Data Display | C9–C10, H3–H10 | 12 + 1 new | Medium |
| 03 — Filter/Navigation | H1–H2, H7, H11–H12 | 14 | Medium |
| 04 — Layout/Mobile | M1–M8 | 7 | Medium |
| 05 — Polish/A11y | M9–M17 | 10 | Small–Medium |

---

## Unresolved Questions

1. **Multi-condition rule execution**: Does the backend support multiple AND conditions per rule, or is 1 condition the current API limit? Phase 01 plans UI for multi-condition — confirm backend support before implementing.
2. **Column visibility persistence**: Store in `localStorage` (survives session) or `sessionStorage` (resets on close)? Recommend localStorage for column prefs (users expect them to persist).
3. **Network contrast colors**: Replacing network text colors affects the sidebar active state and context bar. Should the sidebar active item use the `_strong` variant or keep the current vivid color (user recognition value)?
4. **Campaign wizard mobile**: Is the campaign wizard intentionally desktop-only? If the primary user base is 100% desktop, responsive fixes for the wizard (Phase 04) can be deprioritized.
5. **Automation multi-action**: Are multiple actions per rule supported by the execution engine, or is this a roadmap item?
