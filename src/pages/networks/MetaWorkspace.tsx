// MetaWorkspace — thin JSX orchestrator. All state and handlers live in useMetaWorkspace.
import React, { useState } from 'react';
import { DatePicker, Drawer, Input, Select, Segmented } from '@/components/ui-kit-compat';
import { ChevronDown, Columns3, FileText, History, Play, Plus, RefreshCcw, Settings, Sparkles, Trash2, Zap } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import { MetaReportTable } from '@/components/networks/meta/meta-report-table';
import type { MetaWorkspaceProps, MetaEntity, FilterOperator, FilterField } from '@/components/networks/meta/meta-types';
import { META_ACCOUNT_OPTIONS, ENTITY_META, TABLE_VIEW_PRESETS, META_BATCH_RUNS_STORAGE_KEY, META_BATCH_PRESETS_STORAGE_KEY } from '@/components/networks/meta/meta-table-config';
import { EntityTabs } from '@/components/networks/meta/meta-entity-tabs';
import { DraftCampaignsPanel } from '@/components/networks/meta/meta-drafts-panel';
import { SelectionInspector } from '@/components/networks/meta/meta-selection-inspector';
import { ColumnSettingsDrawer } from '@/components/networks/meta/meta-column-settings-drawer';
import { ManagePagesModal } from '@/components/networks/meta/meta-manage-pages-modal';
import { TemplateDrawer } from '@/components/networks/meta/meta-template-drawer';
import { MetaBuilderDrawer } from '@/components/networks/meta/meta-builder-drawer';
import { BatchGeneratorDrawer } from '@/components/networks/meta/meta-batch-generator-drawer';
import { BatchHistoryPanel } from '@/components/networks/meta/meta-batch-history-panel';
import { buildDraftEntitiesFromBatchJobs } from '@/components/networks/meta/meta-batch-entity-builder';
import { useMetaWorkspace } from '@/components/networks/meta/use-meta-workspace';
import { loadStoredArray } from '@/components/networks/meta/meta-metric-helpers';
import { FILTER_CHIPS } from '@/components/networks/meta/meta-filter-presets';
import type { BatchAdCopy, BatchJob, BatchPreset, BatchRegenerateRequest, BatchRun } from '@/components/networks/meta/meta-batch-types';
import type { Campaign, AdSet, Ad } from '@/shared/mock-data';

const MetaToolbarButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean }> = ({ icon, label, onClick, active }) => (
  <Button type="button" variant={active ? 'primary' : 'border'} size="s" onClick={onClick} className="gap-1.5 whitespace-nowrap">
    {icon}{label}
  </Button>
);

export const MetaWorkspace: React.FC<MetaWorkspaceProps> = (props) => {
  const ws = useMetaWorkspace(props);
  const { entity, activeApp, accountId, setAccountId } = ws;
  const [batchGeneratorOpen, setBatchGeneratorOpen] = useState(false);
  const [historyOpen, setHistoryOpen]               = useState(false);
  const [batchRuns, setBatchRuns]                   = useState<BatchRun[]>(() => loadStoredArray<BatchRun>(META_BATCH_RUNS_STORAGE_KEY));
  const [batchPresets, setBatchPresets]             = useState<BatchPreset[]>(() => loadStoredArray<BatchPreset>(META_BATCH_PRESETS_STORAGE_KEY));
  const [regenerateRequest, setRegenerateRequest]   = useState<BatchRegenerateRequest | undefined>(undefined);
  const [regenerateNonce, setRegenerateNonce]       = useState(0);
  const currentTitle = ENTITY_META[entity].title;

  React.useEffect(() => { window.localStorage.setItem(META_BATCH_RUNS_STORAGE_KEY, JSON.stringify(batchRuns)); }, [batchRuns]);
  React.useEffect(() => { window.localStorage.setItem(META_BATCH_PRESETS_STORAGE_KEY, JSON.stringify(batchPresets)); }, [batchPresets]);

  const handleBatchComplete = (run: BatchRun) => setBatchRuns(prev => [...prev, run]);
  const handleSavePreset = (preset: BatchPreset) => { setBatchPresets(prev => [preset, ...prev]); toast.success('Batch preset saved'); };

  const handleGenerateDrafts = (jobs: BatchJob[], adCopy: BatchAdCopy) => {
    const entities = buildDraftEntitiesFromBatchJobs(jobs, adCopy, activeApp?.id ?? ws.appId ?? 'p1');
    if (entities.campaigns.length === 0) return;
    const templateNames = [...new Set(jobs.map(j => j.combination.template.name))].slice(0, 2).join(', ');
    ws.addBatchDrafts(entities, {
      id: `batch-${Date.now()}`,
      name: `Batch: ${templateNames}`,
      objective: jobs[0]?.combination.template.objective ?? '',
      budget: '—',
      updatedAt: 'just now',
      campaignId: entities.campaigns[0]?.id,
      progress: {
        campaign: entities.campaigns.length, adsets: entities.adSets.length,
        creatives: entities.ads.length, ads: entities.ads.length,
        campaignTotal: entities.campaigns.length, adsetsTotal: entities.adSets.length,
        creativesTotal: entities.ads.length, adsTotal: entities.ads.length,
      },
    });
  };

  const handleRegenerate = (request: BatchRegenerateRequest) => {
    setHistoryOpen(false);
    setRegenerateRequest(request);
    setRegenerateNonce(n => n + 1);
    setBatchGeneratorOpen(true);
  };

  const handleOpenBuilderOrNavigate = (targetEntity?: MetaEntity) => {
    ws.openBuilder(targetEntity ?? entity);
  };

  return (
    <div className="space-y-4">
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <div className="px-4 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border_secondary">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 radius_8 bg_secondary border border_secondary flex items-center justify-center overflow-hidden">
              <img src="/logo/meta.png" alt="Meta" className="w-7 h-7 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text_primary m-0 leading-none">{activeApp?.name ?? 'Meta Workspace'}</h1>
                <Select className="min-w-64" size="small" value={accountId} onChange={(v) => setAccountId(v as string)} options={META_ACCOUNT_OPTIONS} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text_secondary">
                <span className="inline-flex items-center gap-1 px-2 py-1 radius_4 bg_secondary border border_secondary">
                  <img src="/logo/meta.png" alt="" className="w-3.5 h-3.5 object-contain" />Meta
                </span>
                <span>{activeApp?.package ?? 'App package'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <MetaToolbarButton icon={<RefreshCcw size={14} />} label="Sync page" onClick={() => toast.success('Meta pages synced')} />
            <MetaToolbarButton icon={<Settings size={14} />} label="Manage Pages" onClick={() => ws.setPagesOpen(true)} />
            <MetaToolbarButton icon={<FileText size={14} />} label="Templates" onClick={() => ws.setTemplatesOpen(true)} />
            <MetaToolbarButton icon={<Sparkles size={14} />} label="Batch Generate" onClick={() => setBatchGeneratorOpen(true)} active={batchGeneratorOpen} />
            <MetaToolbarButton icon={<History size={14} />} label={`History${batchRuns.length > 0 ? ` (${batchRuns.length})` : ''}`} onClick={() => setHistoryOpen(true)} active={historyOpen} />
            <Button type="button" variant="border" size="s" className="gap-1.5 fg_accent_primary border_accent_primary_contrast" onClick={() => toast.info('API warm-up is mocked')}>
              <Zap size={14} />API Warm-up
            </Button>
          </div>
        </div>
        <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="text-sm text_secondary flex items-center gap-1.5 flex-wrap">
            {ws.breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <span className="text_tertiary">/</span>}
                <button type="button" className={cn('border-0 bg-transparent p-0 text-sm cursor-pointer', item.emphasis ? 'font-medium text_primary' : 'text_secondary')} onClick={item.onClick}>
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button type="button" variant="dim" size="s">Today</Button>
            <DatePicker.RangePicker size="small" className="min-w-72" />
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <button type="button" onClick={() => ws.setFiltersOpen(open => !open)} className="w-full bg-transparent border-0 px-4 py-3 flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text_primary">Customize filters</span>
          <div className="flex items-center gap-3">
            <button type="button" className="border-0 bg-transparent text-xs text_secondary cursor-pointer" onClick={e => { e.stopPropagation(); ws.setDraftFilters([{ id: 'filter-entity', field: 'entity', operator: 'contains', value: '' }, { id: 'filter-status', field: 'status', operator: 'in', value: '' }]); ws.setAppliedFilters([]); }}>
              Clear
            </button>
            <Button type="button" variant="dim" size="s" className="gap-1.5" onClick={e => { e.stopPropagation(); ws.setAppliedFilters(ws.draftFilters.filter(r => r.value.trim())); toast.success('Filters applied'); }}>
              <Play size={13} />Run
            </Button>
            <ChevronDown size={15} className={cn('transition-transform', ws.filtersOpen ? 'rotate-180' : '')} />
          </div>
        </button>
        {/* Quick filter chips */}
        <div className="border-t border_secondary px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text_tertiary">Quick:</span>
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => ws.toggleChip(chip.id)}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer',
                ws.activeChips.has(chip.id)
                  ? 'bg_blue_subtle border_blue fg_blue_strong'
                  : 'bg-transparent border_secondary text_secondary hover:border_primary hover:text_primary'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {ws.filtersOpen && (
          <div className="border-t border_secondary p-4 space-y-3">
            {ws.draftFilters.map(rule => (
              <div key={rule.id} className="grid grid-cols-1 lg:grid-cols-[180px_200px_1fr_auto] gap-3 items-center">
                <Select value={rule.field} options={[{ value: 'entity', label: ENTITY_META[entity].singular }, { value: 'status', label: 'Status' }, { value: 'account', label: 'Account' }]} onChange={v => ws.setDraftFilters(fs => fs.map(f => f.id === rule.id ? { ...f, field: v as FilterField } : f))} />
                <Segmented size="small" value={rule.operator} options={['is', 'is not', 'contains', 'in']} onChange={v => ws.setDraftFilters(fs => fs.map(f => f.id === rule.id ? { ...f, operator: v as FilterOperator } : f))} />
                <Input value={rule.value} placeholder={rule.operator === 'in' ? 'Value 1, Value 2' : 'Type filter value'} onChange={e => ws.setDraftFilters(fs => fs.map(f => f.id === rule.id ? { ...f, value: e.target.value } : f))} />
                <Button type="button" variant="danger" size="icon-s" onClick={() => ws.setDraftFilters(fs => fs.filter(f => f.id !== rule.id))}><Trash2 size={13} /></Button>
              </div>
            ))}
            <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => ws.setDraftFilters(fs => [...fs, { id: `filter-${Date.now()}`, field: 'entity', operator: 'contains', value: '' }])}>
              <Plus size={13} />Add filter rule
            </Button>
          </div>
        )}
      </div>

      {/* Entity section */}
      <div className="space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-semibold text_primary m-0">{currentTitle}</h2>
            <Select size="small" value={ws.bulkAction} className="w-40" options={[{ value: 'actions', label: 'Bulk actions' }, { value: 'duplicate', label: 'Duplicate' }, { value: 'pause', label: 'Pause' }, { value: 'activate', label: 'Activate' }, { value: 'delete', label: 'Delete' }]} onChange={(v) => ws.setBulkAction(v as string)} />
            <Button type="button" variant="border" size="s" onClick={ws.runBulkAction}>Apply</Button>
            {ws.selectedCampaign && entity !== 'campaigns' && <Button type="button" variant="border" size="s" onClick={ws.clearCampaignScope}>Clear campaign scope</Button>}
            {ws.selectedAdSet && entity === 'ads' && <Button type="button" variant="border" size="s" onClick={ws.clearAdSetScope}>Clear ad set scope</Button>}
          </div>
          <div className="flex items-center gap-2 justify-end flex-wrap">
            <Button type="button" variant="border" size="s" className="gap-1.5" onClick={ws.discardDrafts}><Trash2 size={14} /> Discard Drafts ({ws.drafts.length})</Button>
            <Select size="small" className="w-44" value={ws.activePresetByEntity[entity]} options={[{ value: 'custom', label: 'Custom view' }, ...TABLE_VIEW_PRESETS[entity].map(p => ({ value: p.id, label: p.label }))]} onChange={v => ws.applyTablePreset(entity, v as string)} />
            <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => ws.setColumnsOpen(true)}><Columns3 size={14} />Columns</Button>
            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => handleOpenBuilderOrNavigate(entity)}><Plus size={14} />{ENTITY_META[entity].createLabel}</Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ws.selectedCampaign && <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg_blue_subtle border border_blue fg_blue_strong">Campaign scope: {ws.selectedCampaign.name}</span>}
          {ws.selectedAdSet && <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg_amber_subtle border border_amber fg_amber_strong">Ad set scope: {ws.selectedAdSet.name}</span>}
          {ws.appliedFilters.length > 0 && <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg_secondary border border_secondary text_secondary">{ws.appliedFilters.length} active filter(s)</span>}
        </div>

        <DraftCampaignsPanel
          drafts={ws.drafts}
          collapsed={ws.draftsCollapsed}
          onToggle={() => ws.setDraftsCollapsed(c => !c)}
          onContinue={draft => ws.openBuilder('campaigns', { mode: 'draft', draft, campaign: ws.campaigns.find(c => c.id === draft.campaignId) ?? null, initialStep: draft.currentStep })}
          onDelete={draftId => ws.setDrafts(items => items.filter(item => item.id !== draftId))}
        />

        <EntityTabs entity={entity} setEntity={ws.handleEntityChange} campaignCount={ws.visibleCampaigns.length} adSetCount={ws.visibleAdSets.length} adCount={ws.visibleAds.length} selectedCampaign={ws.selectedCampaign} selectedAdSet={ws.selectedAdSet} />

        <SelectionInspector entity={entity} selectedRows={ws.selectedRows} campaigns={ws.campaigns} adSets={ws.adSets} ads={ws.ads} onEdit={ws.editInspectedRow} onDrillDown={ws.drillDownInspectedRow} />

        <MetaReportTable
          entity={entity}
          visibleColumnKeys={ws.visibleColumnKeys}
          campaignColumns={ws.campaignColumns}
          adSetColumns={ws.adSetColumns}
          adColumns={ws.adColumns}
          visibleCampaigns={ws.visibleCampaigns}
          visibleAdSets={ws.visibleAdSets}
          visibleAds={ws.visibleAds}
          selectedRowKeys={ws.selectedRowKeys}
          onSelectedRowKeysChange={ws.setSelectedRowKeys}
          searchText={ws.searchText}
          onSearchChange={ws.setSearchText}
          analysisOpen={ws.analysisOpen}
          onToggleAnalysis={() => ws.setAnalysisOpen(o => !o)}
          summaryRows={ws.summaryRows}
          activeRows={ws.activeRows}
          onOpenBuilder={handleOpenBuilderOrNavigate}
          normalizedAdSets={ws.adSets}
          expandedRowKeys={ws.expandedRowKeys}
          onExpandedRowsChange={ws.setExpandedRowKeys}
          onDuplicate={ws.duplicateSelected}
          onDelete={ws.deleteSelected}
          onEditFirst={() => {
            const first = ws.selectedRows[0];
            if (!first) return toast.info('Select one row to edit');
            if (entity === 'campaigns') ws.openBuilder('campaigns', { mode: 'edit', campaign: first as Campaign });
            if (entity === 'adsets') ws.openBuilder('adsets', { mode: 'edit', adSet: first as AdSet, campaign: ws.campaigns.find(c => c.id === (first as AdSet).campaignId) ?? null });
            if (entity === 'ads') ws.openBuilder('ads', { mode: 'edit', ad: first as Ad, adSet: ws.adSets.find(s => s.id === (first as Ad).adSetId) ?? null, campaign: ws.campaigns.find(c => c.id === (first as Ad).campaignId) ?? null });
          }}
          onOpenColumns={() => ws.setColumnsOpen(true)}
        />
      </div>

      <ManagePagesModal open={ws.pagesOpen} onClose={() => ws.setPagesOpen(false)} pages={ws.pages} onChange={ws.setPages} />
      <TemplateDrawer open={ws.templatesOpen} onClose={() => ws.setTemplatesOpen(false)} templates={ws.templates} pages={ws.pages} onChange={ws.setTemplates} />
      <ColumnSettingsDrawer open={ws.columnsOpen} onClose={() => ws.setColumnsOpen(false)} entity={entity} visibleKeys={ws.visibleColumnKeys} heatmapColors={ws.heatmapColors} onVisibleKeysChange={keys => ws.updateTablePreferences(entity, { visibleKeys: keys })} onHeatmapColorsChange={colors => ws.updateTablePreferences(entity, { heatmapColors: colors })} />
      <MetaBuilderDrawer open={ws.builderOpen} onClose={() => ws.setBuilderOpen(false)} context={ws.builderContext} pages={ws.pages} templates={ws.templates} />
      <BatchGeneratorDrawer
        key={regenerateRequest ? `regen-${regenerateNonce}` : 'setup'}
        open={batchGeneratorOpen}
        onClose={() => { setBatchGeneratorOpen(false); setRegenerateRequest(undefined); }}
        templates={ws.templates}
        existingCampaignNames={ws.campaigns.map(c => c.name)}
        presets={batchPresets}
        onSavePreset={handleSavePreset}
        onBatchComplete={handleBatchComplete}
        onGenerateDrafts={handleGenerateDrafts}
        onViewHistory={() => { setBatchGeneratorOpen(false); setHistoryOpen(true); }}
        regenerateRequest={regenerateRequest}
      />
      <Drawer open={historyOpen} onClose={() => setHistoryOpen(false)} placement="right" width={520} title={null} closable={false}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }, header: { display: 'none' } }}>
        <BatchHistoryPanel runs={batchRuns} onRegenerate={handleRegenerate} />
      </Drawer>
    </div>
  );
};

export default MetaWorkspace;
