---
name: meta-workspace-refactor
description: MetaWorkspace.tsx modularization plan + key structural facts for the Meta network workspace
metadata:
  type: project
---

MetaWorkspace.tsx (src/pages/networks/) was 2,473 lines — 12x the 200-line rule. Modularization plan at `plans/260623-1626-meta-workspace-modularization-and-ux/`.

**Why:** violates project file-size rule; blocks maintainability and further Meta UX work.

**How to apply:** Before editing Meta workspace, check whether Phase 0 split is done. Target modules live in `src/components/networks/meta/`.

Key structural facts (verified 2026-06-23):
- `MetaWorkspace` is a named export consumed at `src/pages/NetworkWorkspace.tsx:71` — preserve export name + `MetaWorkspaceProps` on any refactor.
- Meta does NOT use the network-config `extraTabs`/shell pattern the way Moloco/ASA/Google do; it renders as a direct page. Detail tabs (MetaAudienceTab/MetaPlacementTab/MetaCreativeLabTab) are separate compliant files.
- Full-page campaign wizard route already exists: `apps/:appId/networks/:networkId/campaigns/new` → CampaignCreatePage (`src/routes/appRoutes.tsx:71`); shell navigates there at `network-workspace-shell.tsx:195`.
- 3 localStorage keys must stay byte-identical: `nms_meta_workspace_table_preferences_v2`, `nms_meta_creation_recipes_v1`, `nms_meta_creation_runs_v1`.
- Original file already had self-contained inline components (DraftCampaignsPanel, EntityTabs, SelectionInspector, ColumnSettingsDrawer, ManagePagesModal, TemplateDrawer, MetaBuilderDrawer) → extraction is lift-in-place, low risk.
