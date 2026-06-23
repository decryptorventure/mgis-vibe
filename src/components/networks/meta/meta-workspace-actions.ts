// Pure CRUD and bulk-action helpers for useMetaWorkspace.
// Each function receives only what it needs — no closures over hook state.
import type { Key } from 'react';
import { toast } from '@frontend-team/ui-kit';
import type { Ad, AdSet, Campaign } from '@/shared/mock-data';
import type { MetaAutomationRun, MetaBulkCriteria, MetaBulkGenerationResult, MetaCreationRecipe } from '@/pages/networks/meta-bulk-generation';
import type { MetaEntity, MetaReportRow, DraftCampaign } from './meta-types';
import { ENTITY_META } from './meta-table-config';
import { isCampaign, isAdSet, isAd } from './meta-metric-helpers';

// ----- State setter bundle -----------------------------------------------

export interface WorkspaceSetters {
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setAdSets: React.Dispatch<React.SetStateAction<AdSet[]>>;
  setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<Key[]>>;
  setDrafts: React.Dispatch<React.SetStateAction<DraftCampaign[]>>;
  setAutomationRuns: React.Dispatch<React.SetStateAction<MetaAutomationRun[]>>;
  setRecipes: React.Dispatch<React.SetStateAction<MetaCreationRecipe[]>>;
  setSelectedCampaignId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedAdSetId: React.Dispatch<React.SetStateAction<string | null>>;
  setEntity: (next: MetaEntity) => void;
  setDraftsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setBulkCreateOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// ----- Duplicate ----------------------------------------------------------

export function duplicateRows(
  entity: MetaEntity,
  selectedRows: MetaReportRow[],
  setters: Pick<WorkspaceSetters, 'setCampaigns' | 'setAdSets' | 'setAds'>,
) {
  if (selectedRows.length === 0) { toast.info('Select rows to duplicate'); return; }
  const ts = Date.now();
  if (entity === 'campaigns') setters.setCampaigns(items => [...(selectedRows as Campaign[]).map((item, i) => ({ ...item, id: `${item.id}-copy-${ts}-${i}`, name: `${item.name} Copy`, status: 'DRAFT' as Campaign['status'] })), ...items]);
  if (entity === 'adsets') setters.setAdSets(items => [...(selectedRows as AdSet[]).map((item, i) => ({ ...item, id: `${item.id}-copy-${ts}-${i}`, name: `${item.name} Copy`, status: 'DRAFT' as AdSet['status'] })), ...items]);
  if (entity === 'ads') setters.setAds(items => [...(selectedRows as Ad[]).map((item, i) => ({ ...item, id: `${item.id}-copy-${ts}-${i}`, name: `${item.name} Copy`, status: 'DRAFT' as Ad['status'] })), ...items]);
  toast.success(`Duplicated ${selectedRows.length} ${ENTITY_META[entity].singular.toLowerCase()}(s)`);
}

// ----- Delete -------------------------------------------------------------

export function deleteRows(
  entity: MetaEntity,
  selectedRowKeys: Key[],
  selectedRows: MetaReportRow[],
  setters: Pick<WorkspaceSetters, 'setCampaigns' | 'setAdSets' | 'setAds' | 'setSelectedRowKeys'>,
) {
  if (selectedRows.length === 0) { toast.info('Select rows to delete'); return; }
  const ids = new Set(selectedRowKeys.map(String));
  if (entity === 'campaigns') {
    setters.setCampaigns(items => items.filter(item => !ids.has(item.id)));
    setters.setAdSets(items => items.filter(item => !ids.has(item.campaignId)));
    setters.setAds(items => items.filter(item => !ids.has(item.campaignId)));
  }
  if (entity === 'adsets') { setters.setAdSets(items => items.filter(item => !ids.has(item.id))); setters.setAds(items => items.filter(item => !ids.has(item.adSetId))); }
  if (entity === 'ads') setters.setAds(items => items.filter(item => !ids.has(item.id)));
  setters.setSelectedRowKeys([]);
  toast.success(`Deleted ${ids.size} ${ENTITY_META[entity].singular.toLowerCase()}(s)`);
}

// ----- Bulk status --------------------------------------------------------

export function applyBulkStatus(
  entity: MetaEntity,
  status: 'ACTIVE' | 'PAUSED',
  selectedRowKeys: Key[],
  selectedRows: MetaReportRow[],
  setters: Pick<WorkspaceSetters, 'setCampaigns' | 'setAdSets' | 'setAds'>,
) {
  if (selectedRows.length === 0) { toast.info('Select rows first'); return; }
  const ids = new Set(selectedRowKeys.map(String));
  if (entity === 'campaigns') setters.setCampaigns(items => items.map(item => ids.has(item.id) ? { ...item, status: status as Campaign['status'] } : item));
  if (entity === 'adsets') setters.setAdSets(items => items.map(item => ids.has(item.id) ? { ...item, status: status as AdSet['status'] } : item));
  if (entity === 'ads') setters.setAds(items => items.map(item => ids.has(item.id) ? { ...item, status: status as Ad['status'] } : item));
  toast.success(`${status === 'ACTIVE' ? 'Activated' : 'Paused'} ${ids.size} row(s)`);
}

// ----- Edit / drill-down inspector ----------------------------------------

export interface OpenBuilderFn {
  (target: MetaEntity, context?: { mode: 'edit'; campaign?: Campaign | null; adSet?: AdSet | null; ad?: Ad | null }): void;
}

export function editRow(row: MetaReportRow, campaigns: Campaign[], adSets: AdSet[], openBuilder: OpenBuilderFn) {
  if (isCampaign(row)) openBuilder('campaigns', { mode: 'edit', campaign: row });
  if (isAdSet(row)) openBuilder('adsets', { mode: 'edit', adSet: row, campaign: campaigns.find(c => c.id === row.campaignId) ?? null });
  if (isAd(row)) openBuilder('ads', { mode: 'edit', ad: row, adSet: adSets.find(s => s.id === row.adSetId) ?? null, campaign: campaigns.find(c => c.id === row.campaignId) ?? null });
}

export function drillDownRow(
  row: MetaReportRow,
  setters: Pick<WorkspaceSetters, 'setSelectedCampaignId' | 'setSelectedAdSetId' | 'setEntity'>,
) {
  if (isCampaign(row)) { setters.setSelectedCampaignId(row.id); setters.setSelectedAdSetId(null); setters.setEntity('adsets'); }
  if (isAdSet(row)) { setters.setSelectedCampaignId(row.campaignId); setters.setSelectedAdSetId(row.id); setters.setEntity('ads'); }
}

// ----- Recipes ------------------------------------------------------------

export function upsertRecipe(recipe: MetaCreationRecipe, setRecipes: WorkspaceSetters['setRecipes']) {
  setRecipes(items => { const exists = items.some(i => i.id === recipe.id); return exists ? items.map(i => i.id === recipe.id ? recipe : i) : [recipe, ...items]; });
}

// ----- Bulk draft generation ---------------------------------------------

export function applyBulkGenerationResult(
  result: MetaBulkGenerationResult,
  criteria: MetaBulkCriteria,
  setters: Pick<WorkspaceSetters, 'setCampaigns' | 'setAdSets' | 'setAds' | 'setDrafts' | 'setAutomationRuns' | 'setSelectedCampaignId' | 'setSelectedAdSetId' | 'setEntity' | 'setDraftsCollapsed' | 'setBulkCreateOpen' | 'setSelectedRowKeys'>,
) {
  const gc = result.campaigns.map(c => c.campaign);
  const gs = result.campaigns.flatMap(c => c.adSets.map(s => s.adSet));
  const ga = result.campaigns.flatMap(c => c.adSets.flatMap(s => s.ads.map(a => a.ad)));
  setters.setCampaigns(items => [...gc, ...items]);
  setters.setAdSets(items => [...gs, ...items]);
  setters.setAds(items => [...ga, ...items]);
  setters.setDrafts(items => [{
    id: result.runId,
    name: `${criteria.name} batch`,
    objective: criteria.objective,
    budget: `$${result.summary.totalDailyBudget} / day`,
    updatedAt: 'just now',
    campaignId: gc[0]?.id,
    progress: {
      campaign: result.summary.campaigns,
      adsets: result.summary.adSets,
      creatives: Math.max(1, criteria.creativeGroups.length),
      ads: result.summary.ads,
      campaignTotal: result.summary.campaigns,
      adsetsTotal: result.summary.adSets,
      creativesTotal: Math.max(1, criteria.creativeGroups.length),
      adsTotal: result.summary.ads,
    },
  }, ...items]);
  setters.setAutomationRuns(items => [{
    id: result.runId,
    recipeName: criteria.name || 'Untitled Meta recipe',
    createdAt: result.createdAt,
    summary: result.summary,
    status: 'drafted',
  }, ...items]);
  setters.setSelectedCampaignId(null);
  setters.setSelectedAdSetId(null);
  setters.setSelectedRowKeys([]);
  setters.setEntity('campaigns');
  setters.setDraftsCollapsed(false);
  setters.setBulkCreateOpen(false);
  toast.success(`Generated ${result.summary.campaigns} campaign draft(s), ${result.summary.adSets} ad set(s), ${result.summary.ads} ad(s)`);
}

// ----- Discard drafts ----------------------------------------------------

export function discardAllDrafts(drafts: DraftCampaign[], setDrafts: WorkspaceSetters['setDrafts']) {
  if (drafts.length === 0) { toast.info('No drafts to discard'); return; }
  setDrafts([]);
  toast.success('All drafts discarded');
}
