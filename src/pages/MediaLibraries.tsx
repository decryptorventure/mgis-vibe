/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button as AntButton, Input, Select, Tag, Upload, Modal, Tooltip, Skeleton, Segmented } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { Search, Upload as UploadIcon, Grid3x3, List, Play, Trash2, Download, Eye, ImageIcon, RefreshCw, FileCode2, Video } from 'lucide-react';
import { mockMediaItems, statusConfig, mockProjects, type MediaItem } from '../shared/mock-data';
import { DataTable, EmptyState, FilterBar, PageHeader } from '../components/ui';
import { ACTIVE_NETWORKS, ACTIVE_NETWORK_KEYS } from '@/shared/navigation';

export const MediaLibraries: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState<string | undefined>();
  const [appFilter, setAppFilter] = useState<string | undefined>();
  const [formatFilter, setFormatFilter] = useState<string>('all');
  
  const [topPerformers, setTopPerformers] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const pageSize = 20;

  // Phase 4: Loading state with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Phase 7: Memoize filtered list
  const filtered = useMemo(() =>
    mockMediaItems.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchNetwork = !networkFilter || m.network.toLowerCase() === networkFilter.toLowerCase().replace('-ads', '');
      const matchApp = !appFilter || m.projectId === appFilter;

      // Classify format
      let format = 'image';
      if (m.name.endsWith('.html') || m.name.endsWith('.zip')) {
        format = 'html';
      } else if (m.type === 'video') {
        format = 'video';
      }
      
      const matchFormat = formatFilter === 'all' || format === formatFilter;
      const matchTop = !topPerformers || (m.installs !== undefined && m.installs > 1000);
      
      return matchSearch && matchNetwork && matchApp && matchFormat && matchTop;
    }).sort((a, b) => topPerformers ? ((b.installs || 0) - (a.installs || 0)) : 0),
    [search, networkFilter, appFilter, formatFilter, topPerformers]
  );

  // Pagination for large libraries
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, networkFilter, appFilter, formatFilter]);

  const handlePreview = (item: MediaItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const handleSync = () => {
    setSyncing(true);
    toast.loading('Đang đồng bộ creative assets...');
    setTimeout(() => {
      setSyncing(false);
      toast.success('Đồng bộ creative assets thành công!');
    }, 1500);
  };

  // Memoize table columns for list view
  const listColumns = useMemo(() => [
    { 
      title: 'Thumbnail', 
      key: 'thumbnail', 
      width: 64,
      render: (_: unknown, record: MediaItem) => (
        <div className="w-10 h-10 rounded bg-[var(--surface-muted)] overflow-hidden flex items-center justify-center flex-shrink-0 border border-[var(--border-subtle)]">
          {record.name.endsWith('.html') || record.name.endsWith('.zip') ? (
            <span className="text-[10px] font-bold text-[var(--color-primary-500)] font-mono">HTML</span>
          ) : record.type === 'video' ? (
             <Play size={16} className="text-[var(--text-tertiary)]" />
          ) : (
             <img src={`https://picsum.photos/seed/${record.id}/100/100`} alt="thumb" className="w-full h-full object-cover" />
          )}
        </div>
      ) 
    },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <span className="font-semibold text-xs text-[var(--text-primary)]">{t}</span> },
    { 
      title: 'Type', 
      key: 'creativeType', 
      width: 100, 
      render: (_, r: MediaItem) => {
        let label = 'IMAGE';
        let color = 'blue';
        if (r.name.endsWith('.html') || r.name.endsWith('.zip')) {
          label = 'HTML';
          color = 'purple';
        } else if (r.type === 'video') {
          label = 'VIDEO';
          color = 'orange';
        }
        return <Tag color={color} className="text-[10px] font-semibold rounded-md border-none">{label}</Tag>;
      } 
    },
    { title: 'Size', dataIndex: 'size', key: 'size', width: 100, className: 'text-[var(--text-secondary)] font-medium text-xs' },
    { title: 'Dimensions', dataIndex: 'dimensions', key: 'dimensions', width: 120, className: 'text-[var(--text-secondary)] font-mono text-xs' },
    { title: 'Network', dataIndex: 'network', key: 'network', width: 100, render: (t: string) => <Tag bordered={false} className="rounded text-[10px] font-bold uppercase">{t}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (s: string) => (
        <Tag style={{ color: statusConfig[s]?.color, backgroundColor: statusConfig[s]?.bg, borderColor: 'transparent' }} className="rounded text-[10px] font-bold border-0">
          {s}
        </Tag>
      )
    },
    {
      title: 'Performance', key: 'performance', width: 180,
      render: (_: unknown, record: MediaItem) => (
        record.spend !== undefined && record.spend > 0 ? (
          <div className="text-xs">
            <div className="text-[var(--text-primary)] font-bold">${record.spend.toLocaleString()} Spend • {record.installs?.toLocaleString()} Inst</div>
            <div className="text-[var(--text-tertiary)] mt-0.5">CTR {record.ctr}% • IPM {record.ipm}</div>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-tertiary)] italic">No data</span>
        )
      )
    },
    {
      title: 'Uploaded', key: 'uploaded', width: 140,
      render: (_: unknown, record: MediaItem) => (
        <div className="text-[var(--text-tertiary)] text-[11px] font-semibold">
          <div>{record.uploadedBy}</div>
          <div className="text-[10px] text-[var(--text-disabled)] mt-0.5">{record.uploadedAt}</div>
        </div>
      )
    },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: unknown, record: MediaItem) => (
        <AntButton aria-label="Preview media" size="small" icon={<Eye size={14} />} onClick={() => handlePreview(record)} />
      )
    },
  ], []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="rounded-xl">
              <Skeleton.Image active style={{ width: '100%', height: 120 }} />
              <Skeleton active paragraph={{ rows: 1 }} className="mt-2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<ImageIcon size={20} />}
        iconBg="var(--status-info)"
        title="Creative Management"
        subtitle="Quản lý các creative assets (videos, hình ảnh, html playables) đồng bộ hóa trên các network"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex border border-[var(--border-default)] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-2 cursor-pointer border-0 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-500' : 'bg-[var(--surface-base)] text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-2 cursor-pointer border-0 ${viewMode === 'list' ? 'bg-primary-50 text-primary-500' : 'bg-[var(--surface-base)] text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}
              >
                <List size={16} />
              </button>
            </div>
            <Button type="button" variant="primary" size="m" onClick={() => setUploadOpen(true)} className="gap-1.5">
              <UploadIcon size={14} />
              Upload Media
            </Button>
          </div>
        }
      />

      <FilterBar
        title="Bộ lọc"
        actions={
          <>
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {filtered.length} assets
            </span>
            <Button
              type="button"
              variant="subtle"
              size="s"
              onClick={() => {
                setSearch('');
                setNetworkFilter(undefined);
                setAppFilter(undefined);
                setFormatFilter('all');
                setTopPerformers(false);
              }}
            >
              Đặt lại
            </Button>
          </>
        }
      >
        <Select
          allowClear
          placeholder="All Networks"
          className="w-44"
          value={networkFilter}
          onChange={setNetworkFilter}
          options={ACTIVE_NETWORK_KEYS.map(key => ({
            value: key,
            label: ACTIVE_NETWORKS[key].label,
          }))}
        />
        <Select
          allowClear
          placeholder="All Apps"
          className="w-56"
          value={appFilter}
          onChange={setAppFilter}
          options={mockProjects.map(p => ({
            value: p.id,
            label: p.name,
          }))}
        />
        <Input
          prefix={<Search size={14} className="text-[var(--text-tertiary)]" />}
          placeholder="Tìm tên creative..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-60"
          allowClear
        />
        <Button
          type="button"
          variant={topPerformers ? 'primary' : 'border'}
          size="m"
          onClick={() => setTopPerformers(!topPerformers)}
          className="font-medium text-xs"
        >
          Top performers
        </Button>
      </FilterBar>

      {/* Formats Tabs row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Segmented
          value={formatFilter}
          onChange={setFormatFilter}
          className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] p-1 rounded-lg"
          options={[
            { value: 'all', label: <span className="px-2 font-bold text-xs uppercase">All formats</span> },
            { value: 'video', label: <span className="px-2 font-bold text-xs uppercase inline-flex items-center gap-1"><Video size={12} /> Videos</span> },
            { value: 'html', label: <span className="px-2 font-bold text-xs uppercase inline-flex items-center gap-1"><FileCode2 size={12} /> HTMLs</span> },
            { value: 'image', label: <span className="px-2 font-bold text-xs uppercase inline-flex items-center gap-1"><ImageIcon size={12} /> Images</span> },
          ]}
        />
        
        <div className="flex items-center gap-2">
          <Select defaultValue="yesterday" className="w-32" options={[
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'last7days', label: 'Last 7 Days' },
            { value: 'last30days', label: 'Last 30 Days' },
          ]} />
          <Button
            type="button"
            variant="primary"
            size="m"
            onClick={handleSync}
            className="font-semibold text-xs flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            Sync Assets
          </Button>
        </div>
      </div>

      {/* Stats counter */}
      <div className="flex gap-3 text-xs font-semibold text-[var(--text-secondary)] px-1">
        <span>{filtered.length} items found</span>
        <span>•</span>
        <span>{filtered.filter(m => m.type === 'video' && !m.name.endsWith('.html')).length} videos</span>
        <span>•</span>
        <span>{filtered.filter(m => m.name.endsWith('.html') || m.name.endsWith('.zip')).length} htmls</span>
        <span>•</span>
        <span>{filtered.filter(m => m.type === 'image').length} images</span>
      </div>

      {/* Grid vs List view */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl" style={{ border: '1px solid var(--border-default)' }}>
          <EmptyState
            icon={<ImageIcon size={32} className="stroke-[1.5]" />}
            title="No media found"
            description="Không tìm thấy creative media nào khớp với cấu hình bộ lọc hiện tại."
            actionLabel="Reset Filters"
            onAction={() => { setSearch(''); setNetworkFilter(undefined); setAppFilter(undefined); setFormatFilter('all'); }}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedItems.map(item => {
              const isHtml = item.name.endsWith('.html') || item.name.endsWith('.zip');
              return (
                <Card key={item.id} className="rounded-xl overflow-hidden cursor-pointer group bg-[var(--surface-base)] border border-[var(--border-default)]" styles={{ body: { padding: 0 } }}>
                  <div className="relative h-36 bg-[var(--surface-muted)] flex items-center justify-center overflow-hidden" onClick={() => handlePreview(item)}>
                    {isHtml ? (
                      <div className="text-center absolute inset-0 bg-indigo-50/50 flex flex-col items-center justify-center p-4">
                        <span className="text-2xl font-black text-indigo-500 font-mono tracking-widest uppercase">HTML5</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] mt-1 font-semibold truncate max-w-full">{item.name}</span>
                      </div>
                    ) : item.type === 'video' ? (
                      <div className="text-center absolute inset-0 bg-black/10 flex flex-col items-center justify-center">
                        <Play size={32} className="text-white/80 mx-auto drop-shadow-md" />
                      </div>
                    ) : (
                      <img src={`https://picsum.photos/seed/${item.id}/400/300`} alt={item.name} className="w-full h-full object-cover" />
                    )}
                    
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      <Tag style={{ color: statusConfig[item.status]?.color, backgroundColor: statusConfig[item.status]?.bg, borderColor: 'transparent' }} className="rounded text-[9px] border-0 font-bold">{item.status}</Tag>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <AntButton aria-label="Preview media" size="small" shape="circle" icon={<Eye size={14} />} className="bg-[var(--surface-base)]/90" />
                      <AntButton aria-label="Download media" size="small" shape="circle" icon={<Download size={14} />} className="bg-[var(--surface-base)]/90" />
                      <AntButton aria-label="Delete media" size="small" shape="circle" icon={<Trash2 size={14} />} danger className="bg-[var(--surface-base)]/90" />
                    </div>
                  </div>
                  <div className="p-3">
                    <Tooltip title={item.name}>
                      <p className="font-bold text-xs text-[var(--text-primary)] truncate mb-1">{item.name}</p>
                    </Tooltip>
                    
                    {item.spend !== undefined && item.spend > 0 ? (
                      <div className="mb-2 bg-[var(--surface-subtle)] p-1.5 rounded text-[10px] border border-[var(--border-subtle)] font-medium">
                        <div className="flex justify-between text-[var(--text-secondary)] font-bold">
                          <span>${item.spend.toLocaleString()} Spend</span>
                          <span>{item.installs?.toLocaleString()} Inst</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-tertiary)] mt-0.5">
                          <span>CTR {item.ctr}%</span>
                          <span>IPM {item.ipm}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2 h-10 border border-dashed border-[var(--border-subtle)] rounded flex items-center justify-center text-[10px] text-[var(--text-tertiary)] italic">
                        No Performance Data
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-[var(--text-tertiary)] font-semibold">
                      <span>{item.size} • {item.dimensions}</span>
                      <Tag bordered={false} className="text-[9px] font-bold rounded m-0 uppercase">{item.network}</Tag>
                    </div>
                    <p className="text-[9px] text-[var(--text-tertiary)] font-medium mt-1 truncate">{item.uploadedBy} • {item.uploadedAt}</p>
                  </div>
                </Card>
              );
            })}
          </div>
          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="flex justify-center pt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="border"
                  size="s"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="text-xs"
                >
                  Previous
                </Button>
                <span className="flex items-center text-xs text-[var(--text-secondary)]">
                  Page {currentPage} / {Math.ceil(filtered.length / pageSize)} ({filtered.length} items)
                </span>
                <Button
                  type="button"
                  variant="border"
                  size="s"
                  disabled={currentPage >= Math.ceil(filtered.length / pageSize)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* List View */
        <Card className="rounded-lg overflow-hidden bg-[var(--surface-base)] border border-[var(--border-default)]" styles={{ body: { padding: 0 } }}>
          <DataTable<MediaItem>
            columns={listColumns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} media items` }}
            emptyTitle="No media found"
            emptyDescription="Không tìm thấy creative media nào khớp với bộ lọc hiện tại."
          />
        </Card>
      )}

      {/* Upload Modal */}
      <Modal title="Upload Media" open={uploadOpen} onCancel={() => setUploadOpen(false)} footer={null} width={520}>
        <div className="space-y-4 mt-4">
          <Select placeholder="Select Network" className="w-full" options={[
            { value: 'meta', label: 'Meta' }, { value: 'google-ads', label: 'Google Ads' },
            { value: 'axon', label: 'Axon' }, { value: 'moloco', label: 'Moloco' },
          ]} />
          <Upload.Dragger 
            multiple 
            onChange={() => toast.info('Upload simulation: file queued!')}
            className="group border-2 border-dashed border-[var(--color-primary-300)] rounded-2xl bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] hover:border-[var(--color-primary-500)] transition-all p-8 text-center cursor-pointer shadow-inner"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md">
                <UploadIcon size={28} className="text-[var(--color-primary-500)]" />
              </div>
              <p className="text-sm font-extrabold text-[var(--color-primary-800)] mb-1">Kéo thả file hoặc click để chọn</p>
              <p className="text-xs text-[var(--color-primary-600)] font-medium">Hỗ trợ PNG, JPG, MP4, HTML (max 50MB)</p>
            </div>
          </Upload.Dragger>
          <Button type="button" variant="primary" size="m" className="w-full">Start Upload</Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal title={previewItem?.name} open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} width={600}>
        {previewItem && (
          <div className="space-y-4">
            <div className="bg-[var(--surface-subtle)] rounded-lg h-[300px] flex items-center justify-center overflow-hidden relative">
              {previewItem.name.endsWith('.html') || previewItem.name.endsWith('.zip') ? (
                <div className="text-center font-black text-indigo-500 font-mono tracking-widest text-3xl">HTML5 AD</div>
              ) : previewItem.type === 'video' ? (
                <>
                  <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls className="w-full h-full object-contain bg-black" />
                </>
              ) : (
                <img src={`https://picsum.photos/seed/${previewItem.id}/800/600`} alt={previewItem.name} className="w-full h-full object-contain" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm bg-[var(--surface-muted)] p-4 rounded-xl border border-[var(--border-subtle)] font-medium">
              <div><span className="text-[var(--text-secondary)]">Type:</span> {previewItem.name.endsWith('.html') ? 'HTML5 Playable' : previewItem.type.toUpperCase()}</div>
              <div><span className="text-[var(--text-secondary)]">Size:</span> {previewItem.size}</div>
              <div><span className="text-[var(--text-secondary)]">Dimensions:</span> {previewItem.dimensions}</div>
              <div><span className="text-[var(--text-secondary)]">Network:</span> {previewItem.network}</div>
              <div><span className="text-[var(--text-secondary)]">Uploaded by:</span> {previewItem.uploadedBy}</div>
              <div><span className="text-[var(--text-secondary)]">Date:</span> {previewItem.uploadedAt}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MediaLibraries;
