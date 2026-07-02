// Pure CRUD and bulk-action helpers for useMetaWorkspace.
// Each function receives only what it needs — no closures over hook state.
import type { Key } from 'react';
import { toast } from '@frontend-team/ui-kit';
import type { Ad, AdSet, Campaign } from '@/shared/mock-data';
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
  setSelectedCampaignId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedAdSetId: React.Dispatch<React.SetStateAction<string | null>>;
  setEntity: (next: MetaEntity) => void;
  setDraftsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
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

// ----- Batch generator draft materialization -------------------------------
// Turns completed batch-generator jobs into real DRAFT campaign/adset/ad rows
// (ports the "materialize as drafts" behavior from the retired AI Bulk Create flow).

export function addBatchGeneratedEntities(
  entities: { campaigns: Campaign[]; adSets: AdSet[]; ads: Ad[] },
  draft: DraftCampaign,
  setters: Pick<WorkspaceSetters, 'setCampaigns' | 'setAdSets' | 'setAds' | 'setDrafts'>,
) {
  if (entities.campaigns.length === 0) return;
  setters.setCampaigns(items => [...entities.campaigns, ...items]);
  setters.setAdSets(items => [...entities.adSets, ...items]);
  setters.setAds(items => [...entities.ads, ...items]);
  setters.setDrafts(items => [draft, ...items]);
  toast.success(`Generated ${entities.campaigns.length} campaign draft(s), ${entities.adSets.length} ad set(s), ${entities.ads.length} ad(s)`);
}

// ----- Discard drafts ----------------------------------------------------

export function discardAllDrafts(drafts: DraftCampaign[], setDrafts: WorkspaceSetters['setDrafts']) {
  if (drafts.length === 0) { toast.info('No drafts to discard'); return; }
  setDrafts([]);
  toast.success('All drafts discarded');
}
