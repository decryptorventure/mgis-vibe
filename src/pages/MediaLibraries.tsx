// Creative Management page — orchestrator (Tasks 2, 4, 5, 6 wired up)
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Input, Segmented, Select, Skeleton } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { Download, FileCode2, Grid3x3, ImageIcon, List, RefreshCw, Search, Trash2, Upload as UploadIcon, Video } from 'lucide-react';
import { mockMediaItems, type MediaItem } from '../shared/mock-data';
import { DataTable, EmptyState, FilterBar, PageHeader } from '../components/ui';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { usePersistentFilter } from '@/shared/hooks/use-persistent-filter';
import { DataFreshnessIndicator } from '../components/ui/data-freshness-indicator';
import { ACTIVE_NETWORKS, ACTIVE_NETWORK_KEYS } from '@/shared/navigation';
import { mockProjects } from '@/shared/mock-data';
import { CreativeGridCard } from '@/components/creative/creative-grid-card';
import { CreativePreviewModal } from '@/components/creative/creative-preview-modal';
import { CreativeUploadModal } from '@/components/creative/creative-upload-modal';
import { CreativeBulkRemoveModal } from '@/components/creative/creative-bulk-remove-modal';
import { CreativePerformanceFilterBar, DEFAULT_PERF_FILTERS, type CreativePerformanceFilters } from '@/components/creative/creative-performance-filter-bar';

const PAGE_SIZE = 20;

export const MediaLibraries: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters, clearMainFilters] = usePersistentFilter('media_lib_filters_v1', {
    search: '',
    network: '',
    app: '',
    format: 'all',
    topPerformers: false,
  });
  const [perfFilters, setPerfFilters, clearPerfFilters] = usePersistentFilter<CreativePerformanceFilters>('media_lib_perf_v1', DEFAULT_PERF_FILTERS);
  const hasActiveFilters = filters.search !== '' || filters.network !== '' || filters.app !== '' || filters.format !== 'all' || filters.topPerformers;
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()); }, [filters, perfFilters]);

  const toggleSelect = useCallback((id: string, sel: boolean) => {
    setSelectedIds(prev => { const next = new Set(prev); sel ? next.add(id) : next.delete(id); return next; });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const googleLowItems = useMemo(() => mockMediaItems.filter(m => m.network === 'google-ads' && m.googleMark === 'low'), []);

  const filtered = useMemo(() => mockMediaItems.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchNetwork = !filters.network || m.network.toLowerCase() === filters.network.toLowerCase().replace('-ads', '');
    const matchApp = !filters.app || m.projectId === filters.app;
    const fmt = m.name.endsWith('.html') || m.name.endsWith('.zip') ? 'html' : m.type === 'video' ? 'video' : 'image';
    const matchFormat = filters.format === 'all' || fmt === filters.format;
    const matchTop = !filters.topPerformers || (m.installs ?? 0) > 1000;
    const matchSpend = (m.spend ?? 0) >= perfFilters.minSpend;
    const matchRoas = (m.roas ?? 0) >= perfFilters.minRoas;
    const matchCtr = (m.ctr ?? 0) >= perfFilters.minCtr;
    const matchCvr = (m.cvr ?? 0) >= perfFilters.minCvr;
    const matchMark = perfFilters.googleMark === 'all' || m.googleMark === perfFilters.googleMark || (perfFilters.googleMark === 'good' && !m.googleMark);
    const matchActive = !perfFilters.activeOnly || m.status === 'READY';
    return matchSearch && matchNetwork && matchApp && matchFormat && matchTop && matchSpend && matchRoas && matchCtr && matchCvr && matchMark && matchActive;
  }).sort((a, b) => filters.topPerformers ? (b.installs ?? 0) - (a.installs ?? 0) : 0), [filters, perfFilters]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);

  const handleSync = () => {
    setSyncing(true);
    toast.loading('Syncing creative assets…');
    setTimeout(() => { setSyncing(false); toast.success('Creative assets synced!'); }, 1500);
  };

  const listColumns = useMemo(() => [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <span className="font-semibold text-xs text_primary">{t}</span> },
    { title: 'Network', dataIndex: 'network', key: 'network', width: 100 },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 100, render: (v?: number) => v ? `$${v.toLocaleString()}` : '—' },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 80, render: (v?: number) => v != null ? `${v.toFixed(1)}×` : '—' },
    { title: 'CTR', dataIndex: 'ctr', key: 'ctr', width: 70, render: (v?: number) => v ? `${v}%` : '—' },
    { title: 'CVR', dataIndex: 'cvr', key: 'cvr', width: 70, render: (v?: number) => v ? `${v}%` : '—' },
    { title: 'Google', key: 'gmark', width: 80, render: (_: unknown, r: MediaItem) => r.googleMark === 'low' ? <span className="text-[var(--status-error)] font-bold text-xs">↓ LOW</span> : r.googleMark === 'good' ? <span className="text-[var(--status-success)] font-bold text-xs">✓ Good</span> : '—' },
    { title: 'Actions', key: 'actions', width: 70, render: (_: unknown, r: MediaItem) => <button type="button" onClick={() => setPreviewItem(r)} className="text-xs text_tertiary hover:text_primary cursor-pointer bg-transparent border-0">Preview</button> },
  ], []);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton.Input active style={{ width: 300, height: 40 }} />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Card key={i}><Skeleton active /></Card>)}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader icon={<ImageIcon size={20} />} iconBg="var(--status-info)" title="Creative Management"
        subtitle="Manage creative assets synced across networks"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex border border-[var(--border-default)] rounded-lg overflow-hidden">
              {(['grid', 'list'] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)} aria-label={`${m} view`}
                  className={`p-2 cursor-pointer border-0 ${viewMode === m ? 'bg-primary-50 text-primary-500' : 'bg-[var(--surface-base)] text-[var(--text-tertiary)]'}`}>
                  {m === 'grid' ? <Grid3x3 size={16} /> : <List size={16} />}
                </button>
              ))}
            </div>
            <Button type="button" variant="primary" size="m" onClick={() => setUploadOpen(true)} className="gap-1.5">
              <UploadIcon size={14} />Upload
            </Button>
          </div>
        }
      />

      {/* Task 2 — Data freshness */}
      <DataFreshnessIndicator lastSyncedAt="2026-06-24T12:45:00" sourceName="Creative Library" syncCadence="Every 30 minutes" staleThresholdMinutes={60} onSync={handleSync} />

      <FilterBar title="Filters"
        actions={
          <>
            {googleLowItems.length > 0 && (
              <Button type="button" variant="border" size="m" onClick={() => setBulkRemoveOpen(true)}
                className="gap-1.5 text-[var(--status-error)] border-[var(--status-error-border)] hover:bg-[var(--status-error-bg)]">
                ↓ Remove {googleLowItems.length} Google Low
              </Button>
            )}
            <span className="text-xs font-medium text_tertiary">{filtered.length} assets</span>
            {hasActiveFilters && (
              <Button type="button" variant="subtle" size="s" onClick={() => { clearMainFilters(); clearPerfFilters(); }} className="text_tertiary gap-1">
                Clear all
              </Button>
            )}
          </>
        }
      >
        <Select allowClear placeholder="All Networks" className="w-44"
          value={filters.network || undefined}
          onChange={(v) => setFilters(f => ({ ...f, network: (v as string) || '' }))}
          options={ACTIVE_NETWORK_KEYS.map(k => ({ value: k, label: ACTIVE_NETWORKS[k].label }))} />
        <Select allowClear placeholder="All Apps" className="w-56"
          value={filters.app || undefined}
          onChange={(v) => setFilters(f => ({ ...f, app: (v as string) || '' }))}
          options={mockProjects.map(p => ({ value: p.id, label: p.name }))} />
        <Input prefix={<Search size={14} className="text_tertiary" />} placeholder="Search name…"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="w-60" allowClear />
        <Button type="button" variant={filters.topPerformers ? 'primary' : 'border'} size="m"
          onClick={() => setFilters(f => ({ ...f, topPerformers: !f.topPerformers }))}>Top performers</Button>
      </FilterBar>

      {/* Task 4 — Performance metric filters */}
      <CreativePerformanceFilterBar filters={perfFilters} onChange={p => setPerfFilters(f => ({ ...f, ...p }))} onReset={clearPerfFilters} />

      {/* Format tabs + sync */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Segmented value={filters.format} onChange={v => setFilters(f => ({ ...f, format: v as string }))}
          options={[
            { value: 'all', label: <span className="px-2 font-bold text-xs">All</span> },
            { value: 'video', label: <span className="px-2 font-bold text-xs inline-flex items-center gap-1"><Video size={12} />Video</span> },
            { value: 'html', label: <span className="px-2 font-bold text-xs inline-flex items-center gap-1"><FileCode2 size={12} />HTML</span> },
            { value: 'image', label: <span className="px-2 font-bold text-xs inline-flex items-center gap-1"><ImageIcon size={12} />Image</span> },
          ]} />
        <Button type="button" variant="primary" size="m" onClick={handleSync} className="gap-1">
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />Sync Assets
        </Button>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card><EmptyState icon={<ImageIcon size={32} />} title="No media found" description="Adjust filters to find creatives." actionLabel="Clear filters" onAction={() => { clearMainFilters(); clearPerfFilters(); }} /></Card>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map(item => (
              <div key={item.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 220px' }}>
                <CreativeGridCard item={item} onPreview={setPreviewItem} selected={selectedIds.has(item.id)} onSelect={toggleSelect} />
              </div>
            ))}
          </div>
          {filtered.length > PAGE_SIZE && (
            <div className="flex justify-center gap-2 pt-2">
              <Button type="button" variant="border" size="s" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center text-xs text_secondary">Page {currentPage}/{Math.ceil(filtered.length / PAGE_SIZE)}</span>
              <Button type="button" variant="border" size="s" disabled={currentPage >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <DataTable<MediaItem> columns={listColumns} dataSource={filtered} rowKey="id"
            pagination={{ pageSize: 10 }} emptyTitle="No media" emptyDescription="Adjust filters." />
        </Card>
      )}

      {/* Bulk action bar */}
      <BulkActionBar
        count={selectedIds.size}
        itemLabel="assets"
        onClear={clearSelection}
        actions={[
          {
            label: 'Download',
            icon: <Download size={12} />,
            onClick: () => { toast.info(`Downloading ${selectedIds.size} assets…`); clearSelection(); },
          },
          {
            label: 'Delete',
            icon: <Trash2 size={12} />,
            danger: true,
            onClick: () => { toast.error(`Deleted ${selectedIds.size} assets`); clearSelection(); },
          },
        ]}
      />

      {/* Modals */}
      <CreativePreviewModal item={previewItem} open={!!previewItem} onClose={() => setPreviewItem(null)} />
      <CreativeUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <CreativeBulkRemoveModal items={googleLowItems} open={bulkRemoveOpen} onClose={() => setBulkRemoveOpen(false)}
        onConfirm={ids => console.info('Removed creative IDs:', ids)} />
    </div>
  );
};

export default MediaLibraries;
