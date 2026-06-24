// Creative Management page — orchestrator (Tasks 2, 4, 5, 6 wired up)
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Segmented, Select, Skeleton } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { FileCode2, Grid3x3, ImageIcon, List, RefreshCw, Search, Upload as UploadIcon, Video } from 'lucide-react';
import { mockMediaItems, type MediaItem } from '../shared/mock-data';
import { DataTable, EmptyState, FilterBar, PageHeader } from '../components/ui';
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
  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState<string | undefined>();
  const [appFilter, setAppFilter] = useState<string | undefined>();
  const [formatFilter, setFormatFilter] = useState('all');
  const [topPerformers, setTopPerformers] = useState(false);
  const [perfFilters, setPerfFilters] = useState<CreativePerformanceFilters>(DEFAULT_PERF_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, networkFilter, appFilter, formatFilter, perfFilters]);

  const googleLowItems = useMemo(() => mockMediaItems.filter(m => m.network === 'google-ads' && m.googleMark === 'low'), []);

  const filtered = useMemo(() => mockMediaItems.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchNetwork = !networkFilter || m.network.toLowerCase() === networkFilter.toLowerCase().replace('-ads', '');
    const matchApp = !appFilter || m.projectId === appFilter;
    const fmt = m.name.endsWith('.html') || m.name.endsWith('.zip') ? 'html' : m.type === 'video' ? 'video' : 'image';
    const matchFormat = formatFilter === 'all' || fmt === formatFilter;
    const matchTop = !topPerformers || (m.installs ?? 0) > 1000;
    const matchSpend = (m.spend ?? 0) >= perfFilters.minSpend;
    const matchRoas = (m.roas ?? 0) >= perfFilters.minRoas;
    const matchCtr = (m.ctr ?? 0) >= perfFilters.minCtr;
    const matchCvr = (m.cvr ?? 0) >= perfFilters.minCvr;
    const matchMark = perfFilters.googleMark === 'all' || m.googleMark === perfFilters.googleMark || (perfFilters.googleMark === 'good' && !m.googleMark);
    const matchActive = !perfFilters.activeOnly || m.status === 'READY';
    return matchSearch && matchNetwork && matchApp && matchFormat && matchTop && matchSpend && matchRoas && matchCtr && matchCvr && matchMark && matchActive;
  }).sort((a, b) => topPerformers ? (b.installs ?? 0) - (a.installs ?? 0) : 0), [search, networkFilter, appFilter, formatFilter, topPerformers, perfFilters]);

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
            <Button type="button" variant="subtle" size="s" onClick={() => { setSearch(''); setNetworkFilter(undefined); setAppFilter(undefined); setFormatFilter('all'); setTopPerformers(false); setPerfFilters(DEFAULT_PERF_FILTERS); }}>
              Reset
            </Button>
          </>
        }
      >
        <Select allowClear placeholder="All Networks" className="w-44" value={networkFilter} onChange={setNetworkFilter}
          options={ACTIVE_NETWORK_KEYS.map(k => ({ value: k, label: ACTIVE_NETWORKS[k].label }))} />
        <Select allowClear placeholder="All Apps" className="w-56" value={appFilter} onChange={setAppFilter}
          options={mockProjects.map(p => ({ value: p.id, label: p.name }))} />
        <Input prefix={<Search size={14} className="text_tertiary" />} placeholder="Search name…" value={search}
          onChange={e => setSearch(e.target.value)} className="w-60" allowClear />
        <Button type="button" variant={topPerformers ? 'primary' : 'border'} size="m"
          onClick={() => setTopPerformers(!topPerformers)}>Top performers</Button>
      </FilterBar>

      {/* Task 4 — Performance metric filters */}
      <CreativePerformanceFilterBar filters={perfFilters} onChange={p => setPerfFilters(f => ({ ...f, ...p }))} onReset={() => setPerfFilters(DEFAULT_PERF_FILTERS)} />

      {/* Format tabs + sync */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Segmented value={formatFilter} onChange={setFormatFilter}
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
        <Card><EmptyState icon={<ImageIcon size={32} />} title="No media found" description="Adjust filters to find creatives." actionLabel="Reset" onAction={() => setSearch('')} /></Card>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map(item => <CreativeGridCard key={item.id} item={item} onPreview={setPreviewItem} />)}
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

      {/* Modals */}
      <CreativePreviewModal item={previewItem} open={!!previewItem} onClose={() => setPreviewItem(null)} />
      <CreativeUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <CreativeBulkRemoveModal items={googleLowItems} open={bulkRemoveOpen} onClose={() => setBulkRemoveOpen(false)}
        onConfirm={ids => console.info('Removed creative IDs:', ids)} />
    </div>
  );
};

export default MediaLibraries;
