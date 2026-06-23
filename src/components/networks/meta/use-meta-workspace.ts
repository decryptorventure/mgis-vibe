// Custom hook encapsulating all state, derived values, and handlers for MetaWorkspace.
// The component becomes a thin JSX shell that calls this hook and renders.
import type { Key } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockAds, mockAdSets, mockCampaigns, mockProjects, type Ad, type AdSet, type Campaign } from '@/shared/mock-data';
import type { MetaAutomationRun, MetaBulkCriteria, MetaBulkGenerationResult, MetaCreationRecipe } from '@/pages/networks/meta-bulk-generation';
import type { MetaEntity, MetaReportRow, MetaColumnKey, MetaWorkspaceProps, MetaPage, MetaTemplate, DraftCampaign, FilterRule, BuilderContext, TablePreference } from './meta-types';
import { META_ACCOUNT_OPTIONS, META_PAGES, META_TEMPLATES, META_DRAFTS, META_REPORT_COLUMNS, TABLE_PREF_STORAGE_KEY, META_CREATION_RECIPES_STORAGE_KEY, META_CREATION_RUNS_STORAGE_KEY, TABLE_VIEW_PRESETS } from './meta-table-config';
import { getMetricValue, formatMetricValue, loadStoredArray, getInitialTablePreferences } from './meta-metric-helpers';
import { buildMetaColumns } from './meta-column-builder';
import { duplicateRows, deleteRows, applyBulkStatus, editRow, drillDownRow, upsertRecipe, applyBulkGenerationResult, discardAllDrafts } from './meta-workspace-actions';
import { applyChipFilter } from './meta-filter-presets';

export function useMetaWorkspace({ network }: MetaWorkspaceProps) {
  const { appId } = useParams<{ appId?: string }>();
  const activeApp = mockProjects.find(p => p.id === appId);

  const initialCampaigns = useMemo(
    () => mockCampaigns.filter(c => c.network === network && (!appId || c.projectId === appId)),
    [appId, network],
  );
  const initialCampaignIds = useMemo(() => new Set(initialCampaigns.map(c => c.id)), [initialCampaigns]);
  const initialAdSets = useMemo(() => mockAdSets.filter(s => initialCampaignIds.has(s.campaignId)), [initialCampaignIds]);
  const initialAds = useMemo(() => mockAds.filter(a => initialCampaignIds.has(a.campaignId)), [initialCampaignIds]);
  const [accountId, setAccountId] = useState(META_ACCOUNT_OPTIONS[0].value);
  const [entity, setEntity] = useState<MetaEntity>('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [draftsCollapsed, setDraftsCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [adSets, setAdSets] = useState<AdSet[]>(initialAdSets);
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [pages, setPages] = useState<MetaPage[]>(META_PAGES);
  const [templates, setTemplates] = useState<MetaTemplate[]>(META_TEMPLATES);
  const [recipes, setRecipes] = useState<MetaCreationRecipe[]>(() => loadStoredArray<MetaCreationRecipe>(META_CREATION_RECIPES_STORAGE_KEY));
  const [automationRuns, setAutomationRuns] = useState<MetaAutomationRun[]>(() => loadStoredArray<MetaAutomationRun>(META_CREATION_RUNS_STORAGE_KEY));
  const [drafts, setDrafts] = useState<DraftCampaign[]>(() => META_DRAFTS.map((d, i) => ({ ...d, campaignId: initialCampaigns[i]?.id ?? initialCampaigns[0]?.id })));
  const [draftFilters, setDraftFilters] = useState<FilterRule[]>([
    { id: 'filter-entity', field: 'entity', operator: 'contains', value: '' },
    { id: 'filter-status', field: 'status', operator: 'in', value: '' },
  ]);
  const [appliedFilters, setAppliedFilters] = useState<FilterRule[]>([]);
  const [tablePreferences, setTablePreferences] = useState<Record<MetaEntity, TablePreference>>(getInitialTablePreferences);
  const [activePresetByEntity, setActivePresetByEntity] = useState<Record<MetaEntity, string>>({ campaigns: 'custom', adsets: 'custom', ads: 'custom' });
  const [bulkAction, setBulkAction] = useState('actions');
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [builderContext, setBuilderContext] = useState<BuilderContext>({ mode: 'create', entity: 'campaigns' });
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCampaigns(initialCampaigns); setAdSets(initialAdSets); setAds(initialAds);
    setDrafts(META_DRAFTS.map((d, i) => ({ ...d, campaignId: initialCampaigns[i]?.id ?? initialCampaigns[0]?.id })));
    setSelectedCampaignId(null); setSelectedAdSetId(null); setSelectedRowKeys([]);
  }, [initialAds, initialAdSets, initialCampaigns]);
  useEffect(() => { window.localStorage.setItem(TABLE_PREF_STORAGE_KEY, JSON.stringify(tablePreferences)); }, [tablePreferences]);
  useEffect(() => { window.localStorage.setItem(META_CREATION_RECIPES_STORAGE_KEY, JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { window.localStorage.setItem(META_CREATION_RUNS_STORAGE_KEY, JSON.stringify(automationRuns)); }, [automationRuns]);
  useEffect(() => { if (selectedCampaignId && !campaigns.some(c => c.id === selectedCampaignId)) { setSelectedCampaignId(null); setSelectedAdSetId(null); } }, [campaigns, selectedCampaignId]);
  useEffect(() => { if (selectedAdSetId && !adSets.some(s => s.id === selectedAdSetId)) setSelectedAdSetId(null); }, [adSets, selectedAdSetId]);

  const campaignIds = useMemo(() => new Set(campaigns.map(c => c.id)), [campaigns]);
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) ?? null;
  const normalizedAdSets = useMemo(() => adSets.filter(s => campaignIds.has(s.campaignId)), [adSets, campaignIds]);
  const selectedAdSet = normalizedAdSets.find(s => s.id === selectedAdSetId) ?? null;
  const normalizedAds = useMemo(() => ads.filter(a => campaignIds.has(a.campaignId)), [ads, campaignIds]);

  const applyFilterRules = <T extends MetaReportRow>(rows: T[]) =>
    rows.filter(row => appliedFilters.every(rule => {
      if (!rule.value.trim()) return true;
      const nv = rule.value.toLowerCase().trim();
      const fv = rule.field === 'entity' ? row.name.toLowerCase() : rule.field === 'status' ? row.status.toLowerCase() : 'clean2';
      return rule.operator === 'is' ? fv === nv : rule.operator === 'is not' ? fv !== nv : rule.operator === 'contains' ? fv.includes(nv) : rule.operator === 'in' ? nv.split(',').map(s => s.trim()).filter(Boolean).includes(fv) : true;
    }));

  const visibleCampaigns = useMemo(
    () => applyChipFilter(applyFilterRules(campaigns.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()))), activeChips),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campaigns, searchText, appliedFilters, activeChips],
  );
  const visibleAdSets = useMemo(() => {
    const base = selectedCampaignId ? normalizedAdSets.filter(s => s.campaignId === selectedCampaignId) : normalizedAdSets;
    return applyChipFilter(applyFilterRules(base.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()))), activeChips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedAdSets, searchText, selectedCampaignId, appliedFilters, activeChips]);
  const visibleAds = useMemo(() => {
    const base = selectedAdSetId ? normalizedAds.filter(a => a.adSetId === selectedAdSetId) : selectedCampaignId ? normalizedAds.filter(a => a.campaignId === selectedCampaignId) : normalizedAds;
    return applyChipFilter(applyFilterRules(base.filter(a => a.name.toLowerCase().includes(searchText.toLowerCase()))), activeChips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedAds, searchText, selectedAdSetId, selectedCampaignId, appliedFilters, activeChips]);

  const currentPreferences = tablePreferences[entity];
  const visibleColumnKeys = currentPreferences.visibleKeys;
  const heatmapColors = currentPreferences.heatmapColors;

  const handleEntityChange = (next: MetaEntity) => { setEntity(next); setSelectedRowKeys([]); setExpandedRowKeys([]); };
  const toggleChip = (chipId: string) => setActiveChips(prev => { const n = new Set(prev); n.has(chipId) ? n.delete(chipId) : n.add(chipId); return n; });

  const updateTablePreferences = (target: MetaEntity, patch: Partial<TablePreference>) => {
    setTablePreferences(prev => ({ ...prev, [target]: { ...prev[target], ...patch } }));
    setActivePresetByEntity(prev => ({ ...prev, [target]: 'custom' }));
  };
  const applyTablePreset = (target: MetaEntity, presetId: string) => {
    setActivePresetByEntity(prev => ({ ...prev, [target]: presetId }));
    const preset = presetId !== 'custom' ? TABLE_VIEW_PRESETS[target].find(p => p.id === presetId) : null;
    if (preset) setTablePreferences(prev => ({ ...prev, [target]: { visibleKeys: preset.keys, heatmapColors: preset.heatmaps } }));
  };
  const openBuilder = (target: MetaEntity = entity, context?: Partial<BuilderContext>) => {
    setEntity(target);
    setBuilderContext({ mode: context?.mode ?? 'create', entity: target, campaign: context?.campaign ?? selectedCampaign, adSet: context?.adSet ?? selectedAdSet, ad: context?.ad ?? null, draft: context?.draft ?? null, initialStep: context?.initialStep });
    setBuilderOpen(true);
  };
  const clearCampaignScope = () => { setSelectedCampaignId(null); setSelectedAdSetId(null); setEntity('campaigns'); };
  const clearAdSetScope = () => { setSelectedAdSetId(null); setEntity('adsets'); };
  const updateEntityStatus = (target: MetaEntity, id: string, enabled: boolean) => {
    const s = enabled ? 'ACTIVE' : 'PAUSED';
    if (target === 'campaigns') setCampaigns(items => items.map(item => item.id === id ? { ...item, status: s as Campaign['status'] } : item));
    if (target === 'adsets') setAdSets(items => items.map(item => item.id === id ? { ...item, status: s as AdSet['status'] } : item));
    if (target === 'ads') setAds(items => items.map(item => item.id === id ? { ...item, status: s as Ad['status'] } : item));
  };

  const columnBuilderConfig = useMemo(() => ({
    entity, visibleColumnKeys, heatmapColors, campaigns, adSets,
    onStatusChange: updateEntityStatus,
    onUpdateHeatmapColor: (colorId: string, columnKey: MetaColumnKey) => updateTablePreferences(entity, { heatmapColors: { ...heatmapColors, [columnKey]: colorId } }),
    onRemoveHeatmapColor: (columnKey: MetaColumnKey) => { const next = { ...heatmapColors }; delete next[columnKey]; updateTablePreferences(entity, { heatmapColors: next }); },
    onDrillCampaign: (id: string) => { setSelectedCampaignId(id); setSelectedAdSetId(null); handleEntityChange('adsets'); },
    onDrillAdSet: (id: string, campaignId: string) => { setSelectedAdSetId(id); setSelectedCampaignId(campaignId); handleEntityChange('ads'); },
    onEditCampaign: (record: Campaign) => openBuilder('campaigns', { mode: 'edit', campaign: record }),
    onEditAdSet: (record: AdSet) => openBuilder('adsets', { mode: 'edit', adSet: record, campaign: campaigns.find(c => c.id === record.campaignId) ?? null }),
    onEditAd: (record: Ad) => openBuilder('ads', { mode: 'edit', ad: record, adSet: normalizedAdSets.find(s => s.id === record.adSetId) ?? null, campaign: campaigns.find(c => c.id === record.campaignId) ?? null }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [entity, visibleColumnKeys, heatmapColors, campaigns, adSets, normalizedAdSets]);

  const campaignColumns = useMemo(() => buildMetaColumns<Campaign>('campaigns', visibleCampaigns, columnBuilderConfig), [columnBuilderConfig, visibleCampaigns]);
  const adSetColumns = useMemo(() => buildMetaColumns<AdSet>('adsets', visibleAdSets, columnBuilderConfig), [columnBuilderConfig, visibleAdSets]);
  const adColumns = useMemo(() => buildMetaColumns<Ad>('ads', visibleAds, columnBuilderConfig), [columnBuilderConfig, visibleAds]);

  const activeRows: MetaReportRow[] = entity === 'campaigns' ? visibleCampaigns : entity === 'adsets' ? visibleAdSets : visibleAds;
  const selectedRows = activeRows.filter(row => selectedRowKeys.includes(row.id));

  // Action setters bundle passed to extracted action helpers
  const setters = { setCampaigns, setAdSets, setAds, setSelectedRowKeys, setDrafts, setAutomationRuns, setRecipes, setSelectedCampaignId, setSelectedAdSetId, setEntity: handleEntityChange, setDraftsCollapsed, setBulkCreateOpen };

  const duplicateSelected = () => duplicateRows(entity, selectedRows, setters);
  const deleteSelected = () => deleteRows(entity, selectedRowKeys, selectedRows, setters);
  const applyStatus = (status: 'ACTIVE' | 'PAUSED') => applyBulkStatus(entity, status, selectedRowKeys, selectedRows, setters);

  const runBulkAction = () => {
    if (bulkAction === 'actions') { return; }
    if (bulkAction === 'duplicate') duplicateSelected();
    if (bulkAction === 'pause') applyStatus('PAUSED');
    if (bulkAction === 'activate') applyStatus('ACTIVE');
    if (bulkAction === 'delete') deleteSelected();
    setBulkAction('actions');
  };

  const editInspectedRow = (row: MetaReportRow) => editRow(row, campaigns, normalizedAdSets, openBuilder);
  const drillDownInspectedRow = (row: MetaReportRow) => drillDownRow(row, setters);
  const saveCreationRecipe = (recipe: MetaCreationRecipe) => upsertRecipe(recipe, setRecipes);
  const handleBulkDraftGeneration = (result: MetaBulkGenerationResult, criteria: MetaBulkCriteria) => applyBulkGenerationResult(result, criteria, setters);
  const discardDrafts = () => discardAllDrafts(drafts, setDrafts);

  const summaryRows = useMemo(() => {
    const metrics = ['amountSpent', 'appInstalls', 'results', 'purchase', 'linkClicks'] as MetaColumnKey[];
    return metrics.map(metric => ({ label: META_REPORT_COLUMNS.find(col => col.key === metric)?.label ?? metric, value: formatMetricValue(metric, activeRows.reduce((sum, row) => { const v = getMetricValue(row, metric); return sum + (typeof v === 'number' ? v : 0); }, 0)) }));
  }, [activeRows]);

  const breadcrumbItems = [
    { key: 'adnetwork', label: 'Adnetwork', onClick: clearCampaignScope },
    { key: 'meta', label: 'Meta', onClick: clearCampaignScope },
    { key: 'app', label: activeApp?.name ?? 'All Apps', onClick: clearCampaignScope, emphasis: true },
    { key: 'campaign-root', label: 'Campaign', onClick: () => setEntity('campaigns') },
    ...(selectedCampaign ? [{ key: 'campaign', label: selectedCampaign.name, onClick: () => { setEntity('adsets'); setSelectedAdSetId(null); }, emphasis: true }] : []),
    ...(entity === 'adsets' || entity === 'ads' || selectedAdSet ? [{ key: 'adset-root', label: 'Ad Set', onClick: () => setEntity('adsets') }] : []),
    ...(selectedAdSet ? [{ key: 'adset', label: selectedAdSet.name, onClick: () => setEntity('ads'), emphasis: true }] : []),
    ...(entity === 'ads' ? [{ key: 'ads-root', label: 'Ads', onClick: () => setEntity('ads') }] : []),
  ];

  return {
    appId, activeApp, accountId, setAccountId, entity, handleEntityChange,
    selectedCampaign, selectedAdSet, campaigns, adSets: normalizedAdSets, ads: normalizedAds,
    visibleCampaigns, visibleAdSets, visibleAds, activeRows, selectedRows, selectedRowKeys, setSelectedRowKeys,
    searchText, setSearchText, filtersOpen, setFiltersOpen, pagesOpen, setPagesOpen,
    templatesOpen, setTemplatesOpen, builderOpen, setBuilderOpen, bulkCreateOpen, setBulkCreateOpen,
    columnsOpen, setColumnsOpen, draftsCollapsed, setDraftsCollapsed, analysisOpen, setAnalysisOpen,
    builderContext, pages, setPages, templates, setTemplates, drafts, setDrafts, recipes, automationRuns,
    draftFilters, setDraftFilters, appliedFilters, setAppliedFilters,
    visibleColumnKeys, heatmapColors, activePresetByEntity, bulkAction, setBulkAction,
    campaignColumns, adSetColumns, adColumns, summaryRows, breadcrumbItems,
    openBuilder, clearCampaignScope, clearAdSetScope, updateTablePreferences, applyTablePreset,
    duplicateSelected, deleteSelected, runBulkAction, editInspectedRow, drillDownInspectedRow,
    saveCreationRecipe, handleBulkDraftGeneration, discardDrafts,
    expandedRowKeys, setExpandedRowKeys, activeChips, toggleChip,
  };
}
