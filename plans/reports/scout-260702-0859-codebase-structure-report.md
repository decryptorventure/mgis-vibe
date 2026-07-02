# Scout Report — nms-fe Codebase Structure

Date: 2026-07-02 | Agents: 3 parallel Explore | Scope: full `src/` (~225 TS/TSX files)

## Stack

- React 19 + TypeScript, Vite 8, Tailwind CSS 4
- Router: React Router v7 (`createBrowserRouter`)
- State: Redux Toolkit + redux-persist (auth slice only); local hooks elsewhere
- UI: `@frontend-team/ui-kit` v1.1.7 + `ui-kit-compat/` adapter (Ant-like API bridge). No antd/shadcn/MUI direct usage
- Data: mock only (`useMockQuery`, 800ms simulated delay); Socket.IO reserved, no real API yet
- Icons: lucide-react | Charts: recharts | Tokens: `src/shared/tokens.ts` + CSS vars in `src/index.css`

## Routing Map (src/routes, App.tsx)

All routes except `/login` wrapped by `AppLayout` (sidebar + header + notifications + command palette).

| Route | Page |
|---|---|
| `/`, `/dashboard` | Dashboard |
| `/apps` | AppsList |
| `/apps/:appId/dashboard` | AppDashboard |
| `/apps/:appId/automation-rules` | AppAutomationRules |
| `/apps/:appId/networks/:networkId` | NetworkWorkspace → dispatches to Meta/GoogleAds/Asa/Axon/Moloco/Portfolio workspace by networkId |
| `/apps/:appId/networks/:networkId/campaigns/new` | campaign-create-page |
| `/networks` | NetworksList |
| `/creatives`, `/media-libraries` | MediaLibraries |
| `/axon-reports`, `/predictions`, `/change-logs`, `/meta-errors`, `/upload-monitor` | ops pages |
| `/key-management`, `/permissions`, `/automation` | admin pages |

## Relevant Files

### Meta batch subsystem (active work area) — `src/components/networks/meta/`
- `meta-batch-generator-drawer.tsx` (224L) — top-level container; owns ALL batch state (templates, themes, minCreatives, namePattern, adCopy, exclusions, jobs); 2-phase: setup → progress
- `meta-batch-template-picker.tsx` (129L) — MetaTemplate multi-select + detail expand
- `meta-batch-theme-picker.tsx` (119L) — theme multi-select (themes from MOCK_MEDIA_FILES via meta-theme-parser)
- `meta-batch-account-picker.tsx` (89L) — ad account multi-select
- `meta-batch-creative-config.tsx` (50L) — min-creatives stepper + slice formula preview
- `meta-batch-matrix-preview.tsx` (231L) — live preview table grouped by template + name pattern editor + ad copy section + expandable ad cards
- `meta-batch-ad-copy-section.tsx` (76L) — ad copy form (125/40 char limits, CTA dropdown)
- `meta-batch-ad-card.tsx` (68L) — FB Feed ad mockup
- `meta-batch-progress-tracker.tsx` (156L) — simulated job execution (400–900ms/job, 10% error), pause/resume, retry
- `meta-batch-history-panel.tsx` (109L) / `meta-batch-history-detail.tsx` (146L) — session-only run history, regenerate/retry flows
- `meta-batch-types.ts` (101L) — BatchTheme/Combination/Job/Run/AdCopy + `computeSlices()`
- `meta-theme-parser.ts` (72L) — filename→theme parser, MOCK_MEDIA_FILES, resolveNamePattern()

Data flow: pickers → drawer computes T×Th combinations → computeSlices() → preview rows → Generate creates BatchJob[] → tracker simulates → BatchRun → history panel → regenerate via props.regenerateJobs.

### Other meta workspace files (57 files total in meta/)
- `use-meta-workspace.ts` (205L) — main state hook; `meta-types.ts`, `meta-table-config.ts`, `meta-metric-helpers.ts`, `meta-workspace-actions.ts` — shared logic
- Builder: `meta-builder-drawer.tsx`, `meta-campaign-type-modal.tsx`, `meta-campaign-settings-form.tsx`, `meta-adset-settings-form.tsx`, `meta-adset-placements-section.tsx`, `meta-creative-form.tsx`, `meta-builder-required-fields.tsx` (last session's work)
- Table/report: `meta-report-table.tsx`, `meta-column-builder.tsx`, `meta-column-settings-drawer.tsx`, `meta-entity-tabs.tsx`, `meta-selection-inspector.tsx`
- Media: `meta-media-library-modal.tsx`, `meta-thumbnail-extractor-modal.tsx`

### Other networks — `src/components/networks/`
- Shell: `network-workspace-shell.tsx`, `network-campaign-table.tsx` (261L), `NetworkWorkspaceAutomationRules.tsx` (413L)
- `axon/` (6 files, types in axon-types.ts), `google/` + `google-ads/` (6), `moloco/` (4), `asa/` (2)

### Components outside networks/ — `src/components/`
- `ui-kit-compat/` (13 files, ~1373L) — Ant-like bridge over ui-kit: Form, Table, Modal, Drawer, Select, Card, etc. THE import surface for most feature code
- `ui/` (18 files) — DataTable, FilterBar, ConfirmModal, StatCard, BulkActionBar, command-palette, NetworkBadge/StatusBadge, EmptyState
- `layout/` — AppLayout, AppSidebar (271L), AppHeader, NetworkContextBar, NotificationDrawer
- `campaign-wizard/` (13 files) — 6-step cross-network wizard + network-sections/
- `automation/` (7 files) — rule builder (conditions/actions/templates)
- `analytics/` (6 files) — KPI strips, comparison cards, pivot table
- `creative/` (5 files) — upload/preview/bulk-remove/grid

### Pages & shared
- `src/pages/networks/` — MetaWorkspace, GoogleAdsWorkspace, AsaWorkspace, AxonWorkspace, MolocoWorkspace + `meta-bulk-generation.ts`, `meta-bulk-create-drawer.tsx`
- `src/pages/` subdirs: `app-dashboard/`, `network-portfolio/`, `campaign-labs/`, `dashboard/`
- `src/shared/` — mock-data.ts (central mock store), network-config.ts + network-configs/ (per-network column/tab config), navigation.ts, tokens.ts, rule-conditions.ts, hooks/ (useMockQuery, use-persistent-filter), utils/cn.ts
- `src/theme/theme-mode.ts` — light/dark toggle (localStorage + CustomEvent)
- `src/assets/app-data/store.ts` — Redux store

## Oversized Files (>200L, per team ≤200L rule)

Top offenders: `NetworkWorkspaceAutomationRules.tsx` (413), `axon-automation-panels.tsx` (358), `axon-campaign-detail.tsx` (353), `AppSidebar.tsx` (271), `network-campaign-table.tsx` (261), `axon-campaign-builder-drawer.tsx` (259), `split-metrics-pivot-table.tsx` (257), `meta-batch-matrix-preview.tsx` (231), `google-builder-sections.tsx` (231), `meta-batch-generator-drawer.tsx` (224), `google-builder-adgroup-section.tsx` (223), `wizard-step-budget.tsx` (209), `moloco-adjust-metrics-tab.tsx` (205), `use-meta-workspace.ts` (205).

## Unresolved Questions

1. Batch generation is fully simulated (10% random error) — real backend API planned, or mock permanent for demo?
2. Batch history is session-only component state — should it persist (localStorage/DB)?
3. Data layer app-wide is mock (`mock-data.ts`, `useMockQuery`) — Socket.IO dep suggests realtime backend intent; integration timeline unknown.
4. `meta-batch-matrix-preview.tsx` (231L) bundles preview table + name pattern editor + ad copy — extract per 200L rule?
5. Axon files (353–358L) and `NetworkWorkspaceAutomationRules.tsx` (413L) are the largest violations — refactor priority?
