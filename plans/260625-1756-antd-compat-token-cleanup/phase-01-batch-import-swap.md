---
phase: 1
title: "Batch import swap"
status: completed
priority: P1
dependencies: []
---

# Phase 1: Batch import swap

## Overview

Swap all 108 `from 'antd'` imports to `from '@/components/ui-kit-compat'` and fix any API mismatches. The compat layer already covers every component used — this is mostly a mechanical rename with a handful of manual fixes.

## Related Code Files

- Modify: all 108 files listed below (grouped by directory)
- No new files created

### Components (63 files)

```
src/components/analytics/network-comparison-cards.tsx
src/components/analytics/network-performance-breakdown-table.tsx
src/components/analytics/split-metrics-pivot-table.tsx
src/components/automation/automation-template-library-drawer.tsx
src/components/automation/rule-action-builder.tsx
src/components/automation/rule-card.tsx
src/components/automation/rule-condition-builder.tsx
src/components/automation/rule-editor-modal.tsx
src/components/automation/rule-template-picker.tsx
src/components/campaign-wizard/campaign-wizard-modal.tsx
src/components/campaign-wizard/google-ad-preview-panel.tsx
src/components/campaign-wizard/network-sections/asa-targeting-section.tsx
src/components/campaign-wizard/network-sections/axon-targeting-section.tsx
src/components/campaign-wizard/network-sections/google-targeting-section.tsx
src/components/campaign-wizard/network-sections/meta-targeting-section.tsx
src/components/campaign-wizard/network-sections/moloco-targeting-section.tsx
src/components/campaign-wizard/wizard-step-basics.tsx
src/components/campaign-wizard/wizard-step-budget.tsx
src/components/campaign-wizard/wizard-step-creatives.tsx
src/components/campaign-wizard/wizard-step-review.tsx
src/components/campaign-wizard/wizard-step-targeting.tsx
src/components/campaign-wizard/wizard-step-tracking.tsx
src/components/creative/creative-bulk-remove-modal.tsx
src/components/creative/creative-grid-card.tsx
src/components/creative/creative-performance-filter-bar.tsx
src/components/creative/creative-preview-modal.tsx
src/components/creative/creative-upload-modal.tsx
src/components/layout/AppHeader.tsx
src/components/layout/AppLayout.tsx
src/components/layout/AppSidebar.tsx
src/components/layout/NetworkContextBar.tsx
src/components/layout/NotificationDrawer.tsx
src/components/networks/asa/asa-creative-sets-tab.tsx
src/components/networks/asa/asa-storefront-tab.tsx
src/components/networks/axon/axon-automation-panels.tsx
src/components/networks/axon/axon-campaign-builder-drawer.tsx
src/components/networks/axon/axon-campaign-detail.tsx
src/components/networks/axon/axon-creative-perf-tab.tsx
src/components/networks/axon/axon-roas-optimizer-tab.tsx
src/components/networks/campaign-edit-drawer.tsx
src/components/networks/google/google-builder-adgroup-section.tsx
src/components/networks/google/google-builder-sections.tsx
src/components/networks/google/google-campaign-builder-drawer.tsx
src/components/networks/google-ads/google-ads-bidding-tab.tsx
src/components/networks/google-ads/google-ads-conversions-tab.tsx
src/components/networks/meta/meta-audience-tab.tsx
src/components/networks/meta/meta-builder-drawer.tsx
src/components/networks/meta/meta-builder-forms.tsx
src/components/networks/meta/meta-column-builder.tsx
src/components/networks/meta/meta-column-settings-drawer.tsx
src/components/networks/meta/meta-creative-detail-drawer.tsx
src/components/networks/meta/meta-creative-lab-tab.tsx
src/components/networks/meta/meta-inline-adset-rows.tsx
src/components/networks/meta/meta-manage-pages-modal.tsx
src/components/networks/meta/meta-placement-tab.tsx
src/components/networks/meta/meta-report-table.tsx
src/components/networks/meta/meta-template-drawer.tsx
src/components/networks/meta/meta-template-forms.tsx
src/components/networks/moloco/moloco-adjust-metrics-tab.tsx
src/components/networks/moloco/moloco-creative-groups-tab.tsx
src/components/networks/moloco/moloco-exchange-tab.tsx
src/components/networks/moloco/moloco-ml-tab.tsx
src/components/networks/network-campaign-table.tsx
src/components/networks/network-settings-tab.tsx
src/components/networks/network-workspace-shell.tsx
src/components/networks/NetworkWorkspaceAutomationRules.tsx
src/components/ui/AiAssistantWidget.tsx
src/components/ui/command-palette.tsx
src/components/ui/ConfirmModal.tsx
src/components/ui/data-freshness-indicator.tsx
src/components/ui/DataTable.tsx
src/shared/network-configs/asa-config.tsx
src/shared/network-configs/axon-config.tsx
src/shared/network-configs/google-ads-config.tsx
src/shared/network-configs/meta-config.tsx
src/shared/network-configs/moloco-config.tsx
src/shared/network-configs/types.ts
```

### Pages (30 files)

```
src/pages/analytics/CostCenterPage.tsx
src/pages/AppAutomationRules.tsx
src/pages/AppDashboard.tsx
src/pages/AppsList.tsx
src/pages/Automation.tsx
src/pages/AxonReports.tsx
src/pages/campaign-create-page.tsx
src/pages/CampaignLabs.tsx
src/pages/ChangeLogs.tsx
src/pages/dashboard/DashboardFilters.tsx
src/pages/dashboard/DashboardLeaderboard.tsx
src/pages/dashboard/DashboardLogs.tsx
src/pages/dashboard/DashboardMetrics.tsx
src/pages/Dashboard.tsx
src/pages/KeyManagement.tsx
src/pages/LoginPage.tsx
src/pages/MediaLibraries.tsx
src/pages/MetaErrors.tsx
src/pages/NetworkPortfolioWorkspace.tsx
src/pages/networks/AsaWorkspace.tsx
src/pages/networks/AxonWorkspace.tsx
src/pages/networks/meta-bulk-create-drawer.tsx
src/pages/networks/MetaWorkspace.tsx
src/pages/networks/MolocoWorkspace.tsx
src/pages/NetworksList.tsx
src/pages/NetworkWorkspace.tsx
src/pages/Permissions.tsx
src/pages/Predictions.tsx
src/pages/UploadMonitor.tsx
src/pages/InsightSettingsPage.tsx
```

## Implementation Steps

### Step 1 — Automated batch swap (PowerShell)

Run from the repo root. This swaps all plain `from 'antd'` imports to the compat layer:

```powershell
Get-ChildItem -Recurse -Include "*.tsx","*.ts" src/ |
  Where-Object { Select-String -Path $_.FullName -Pattern "from 'antd'" -Quiet } |
  ForEach-Object {
    (Get-Content $_.FullName -Raw) -replace "from 'antd'", "from '@/components/ui-kit-compat'" |
    Set-Content $_.FullName -Encoding utf8
  }
```

Verify the swap did not touch `src/theme/antd-theme.ts` and `src/main.tsx` (handled in Phase 2) or `src/components/ui-kit-compat/` itself.

### Step 2 — Fix type-only imports

AntD type imports that must be remapped:

| Old import | New import |
|------------|-----------|
| `import type { TableProps } from 'antd'` | `import type { TableProps } from '@/components/ui-kit-compat'` |
| `import type { TabsProps } from 'antd'` | `import type { TabsProps } from '@/components/ui-kit-compat'` |
| `import type { ThemeConfig } from 'antd'` | Delete (only needed in `antd-theme.ts`, handled Phase 2) |

### Step 3 — Fix known API mismatches after swap

After the batch swap, several components have prop differences between AntD and compat. Fix per-file:

| AntD API | compat equivalent | Files affected |
|----------|------------------|---------------|
| `<Table pagination={{ pageSize: N, total: T, onChange: fn }}>`  | Add `pagination={{ pageSize: N, total: T, onChange: fn }}` — compat bridges this | `network-campaign-table.tsx`, `meta-report-table.tsx`, `DataTable.tsx` |
| `<Select style={{ width: 200 }}` | Wrap in `<div style={{ width: 200 }}>` — compat Select ignores `style` | Any file using `style=` on Select |
| `<Button icon={<X />}>label</Button>` | `<Button>{<X />}label</Button>` — compat Button takes `icon` as first child | Check each Button with `icon=` prop |
| `<Form.Item name="x">` (auto-bind) | Works via compat Form — verify forms still submit values | Wizard steps, rule-editor-modal |
| `<Typography.Text type="secondary">` | `<Typography.Text type="secondary">` — compat supports this | Any Typography usage |
| `<DatePicker.RangePicker />` | Already in compat via `overlays.tsx` | Works |
| `<Upload.Dragger>` | Already in compat | Works |

### Step 4 — Build verification

```bash
npm run build
```

Fix any TypeScript errors from mismatched prop types. Common patterns:
- `onChange` signature differs (AntD: `(value, option) =>`, compat: `(value) =>`) — remove unused second param
- `value` type mismatch on Select (compat stringifies numbers) — cast with `String(value)`

### Step 5 — Lint

```bash
npm run lint
```

## Success Criteria

- [ ] `grep -r "from 'antd'" src/` — 0 results (excluding `antd-theme.ts`, `main.tsx` handled Phase 2).
- [ ] `npm run build` passes with zero antd-related TypeScript errors.
- [ ] `npm run lint` passes.
- [ ] App loads in browser; no visible regressions on sidebar, tables, modals, and forms.

## Risk Assessment

- **Prop API mismatches** — compat layer is ~90% compatible; 5-10 files may need manual prop adjustments. Mitigate: fix one group at a time, keep build passing after each group.
- **Select `style=` is a no-op in compat** — documented in compat JSDoc; use wrapper div instead. Affects ~8 files.
- **Form auto-bind** — compat Form works for basic cases; complex dynamic form fields (e.g. rule-condition-builder) may need `getFieldsValue`/`setFieldsValue` calls checked manually.
