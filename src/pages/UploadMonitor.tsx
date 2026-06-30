import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Input, Select, Tabs, Modal, Row, Col, Skeleton } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { Search, Info, AlertTriangle, Upload } from 'lucide-react';
import { DataTable, FilterBar, PageHeader, StatCard, StatusBadge, type StatusVariant } from '../components/ui';

interface UploadMonitorTask {
  id: string;
  taskId: string;
  channel: 'Facebook (Meta)' | 'Axon' | 'YouTube';
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING' | 'QUEUED';
  statusDesc: string;
  retryCount: number;
  fileName: string;
  shortPath: string;
  fullPath: string;
  nextRetry: string;
  lastUpdated: string;
  errorTitle: string;
  errorMsg: string;
}

const initialTasks: UploadMonitorTask[] = [
  {
    id: 'yt-task-1', taskId: 'bdac9d13-6b7d-41a4-946d-9bcfb92d6e32', channel: 'YouTube', status: 'QUEUED',
    statusDesc: 'Đã nhận media và đang chờ hệ thống xử lý.', retryCount: 5,
    fileName: 'N3_Sexy_Phone_Ver1.2_25-55_34.mp4', shortPath: 'watchout-07/Dino_Robot_10/Videos/...',
    fullPath: 'nms-dev/watchout-07/Dino_Robot_10/Videos/N3_Sexy_Phone_Ver1.2_25-55_34.mp4',
    nextRetry: '2026-04-16 10:53:23', lastUpdated: '2026-04-16 10:37:23',
    errorTitle: 'Có lỗi khi xử lý media', errorMsg: 'No such object: nms-dev/watchout-07/Dino_Robot_10/Videos/N3_Sexy_Phone_Ver1.2_25-55_34.mp4',
  },
  {
    id: 'yt-task-2', taskId: 'ef0d57d7-f25b-466d-9226-c2cf88c9fa1c', channel: 'YouTube', status: 'QUEUED',
    statusDesc: 'Đã nhận media và đang chờ hệ thống xử lý.', retryCount: 5,
    fileName: 'N3_Sexy_Phone_Ver1.3_25-55_169.mp4', shortPath: 'watchout-07/Dino_Robot_10/Videos/...',
    fullPath: 'nms-dev/watchout-07/Dino_Robot_10/Videos/N3_Sexy_Phone_Ver1.3_25-55_169.mp4',
    nextRetry: '2026-04-16 10:53:23', lastUpdated: '2026-04-16 10:37:23',
    errorTitle: 'Có lỗi khi xử lý media', errorMsg: 'No such object: nms-dev/watchout-07/Dino_Robot_10/Videos/N3_Sexy_Phone_Ver1.3_25-55_169.mp4',
  },
  {
    id: 'yt-task-completed-1', taskId: 'c1c2c3c4-d5d6-e7e8-f9f0-a1b2c3d4e5f6', channel: 'YouTube', status: 'COMPLETED',
    statusDesc: 'Tải media thành công lên YouTube.', retryCount: 1,
    fileName: 'Gameplay_Teaser_v2.mp4', shortPath: 'watchout-07/Teaser/Videos/...',
    fullPath: 'nms-dev/watchout-07/Teaser/Videos/Gameplay_Teaser_v2.mp4',
    nextRetry: '—', lastUpdated: '2026-04-16 09:15:00', errorTitle: '', errorMsg: '',
  },
];

// Phase 7: Move generateAllTasks to module scope (outside component)
const generateAllTasks = (): UploadMonitorTask[] => {
  const list = [...initialTasks];

  for (let i = 2; i <= 4; i++) {
    list.push({
      id: `yt-completed-${i}`, taskId: `completed-task-id-${i}`, channel: 'YouTube', status: 'COMPLETED',
      statusDesc: 'Tải media thành công lên YouTube.', retryCount: 1,
      fileName: `Gameplay_Walkthrough_Part_${i}.mp4`, shortPath: 'watchout-07/Walkthrough/Videos/...',
      fullPath: `nms-dev/watchout-07/Walkthrough/Videos/Gameplay_Walkthrough_Part_${i}.mp4`,
      nextRetry: '—', lastUpdated: '2026-04-16 09:20:00', errorTitle: '', errorMsg: '',
    });
  }

  for (let i = 1; i <= 30; i++) {
    list.push({
      id: `yt-placeholder-${i}`, taskId: `task-placeholder-id-${i}`, channel: 'YouTube', status: 'QUEUED',
      statusDesc: 'Đã nhận media và đang chờ hệ thống xử lý.', retryCount: 5,
      fileName: `Dino_Robot_Clip_Sub_${i}.mp4`, shortPath: 'watchout-07/Dino_Robot_10/Clips/...',
      fullPath: `nms-dev/watchout-07/Dino_Robot_10/Clips/Dino_Robot_Clip_Sub_${i}.mp4`,
      nextRetry: '2026-04-16 11:10:00', lastUpdated: '2026-04-16 10:40:00',
      errorTitle: 'Có lỗi khi xử lý media', errorMsg: 'No such object: nms-dev/watchout-07/Dino_Robot_10/Clips/Dino_Robot_Clip_Sub_x.mp4',
    });
  }

  for (let i = 1; i <= 40; i++) {
    list.push({
      id: `meta-completed-${i}`, taskId: `meta-task-completed-${i}`, channel: 'Facebook (Meta)', status: 'COMPLETED',
      statusDesc: 'Tải media thành công lên Facebook Meta.', retryCount: 1,
      fileName: `Creative_Banner_${i}.png`, shortPath: 'facebook-creatives/banners/...',
      fullPath: `nms-dev/facebook-creatives/banners/Creative_Banner_${i}.png`,
      nextRetry: '—', lastUpdated: '2026-04-16 08:30:00', errorTitle: '', errorMsg: '',
    });
  }
  for (let i = 1; i <= 3; i++) {
    list.push({
      id: `meta-failed-${i}`, taskId: `meta-task-failed-${i}`, channel: 'Facebook (Meta)', status: 'FAILED',
      statusDesc: 'Tải media thất bại lên Facebook Meta.', retryCount: 3,
      fileName: `Creative_Video_Failed_${i}.mp4`, shortPath: 'facebook-creatives/videos/...',
      fullPath: `nms-dev/facebook-creatives/videos/Creative_Video_Failed_${i}.mp4`,
      nextRetry: '2026-04-16 12:00:00', lastUpdated: '2026-04-16 10:12:00',
      errorTitle: 'File size exceeds limit', errorMsg: 'Meta API error: The video file size exceeds the maximum limit of 4GB.',
    });
  }
  for (let i = 1; i <= 2; i++) {
    list.push({
      id: `meta-processing-${i}`, taskId: `meta-task-proc-${i}`, channel: 'Facebook (Meta)', status: 'PROCESSING',
      statusDesc: 'Đang chuyển đổi định dạng và upload...', retryCount: 1,
      fileName: `Main_Gameplay_Trailer_v${i}.mp4`, shortPath: 'facebook-creatives/videos/...',
      fullPath: `nms-dev/facebook-creatives/videos/Main_Gameplay_Trailer_v${i}.mp4`,
      nextRetry: '—', lastUpdated: '2026-04-16 10:55:00', errorTitle: '', errorMsg: '',
    });
  }

  for (let i = 1; i <= 22; i++) {
    list.push({
      id: `axon-completed-${i}`, taskId: `axon-task-completed-${i}`, channel: 'Axon', status: 'COMPLETED',
      statusDesc: 'Tải media thành công lên Axon.', retryCount: 1,
      fileName: `Endcard_Playable_v${i}.zip`, shortPath: 'axon-playable/endcards/...',
      fullPath: `nms-dev/axon-playable/endcards/Endcard_Playable_v${i}.zip`,
      nextRetry: '—', lastUpdated: '2026-04-16 07:15:00', errorTitle: '', errorMsg: '',
    });
  }
  for (let i = 1; i <= 3; i++) {
    list.push({
      id: `axon-processing-${i}`, taskId: `axon-task-proc-${i}`, channel: 'Axon', status: 'PROCESSING',
      statusDesc: 'Đang gửi gói tin media lên server Axon...', retryCount: 1,
      fileName: `Endcard_Playable_Processing_${i}.zip`, shortPath: 'axon-playable/endcards/...',
      fullPath: `nms-dev/axon-playable/endcards/Endcard_Playable_Processing_${i}.zip`,
      nextRetry: '—', lastUpdated: '2026-04-16 10:55:00', errorTitle: '', errorMsg: '',
    });
  }

  return list;
};

// Phase 7: Generate once at module scope
const allTasks = generateAllTasks();

export const UploadMonitor: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<'Facebook (Meta)' | 'Axon' | 'YouTube'>('YouTube');
  const [tasks, setTasks] = useState<UploadMonitorTask[]>(allTasks);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Actual applied filters
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('All');

  // Modal Detail
  const [selectedTask, setSelectedTask] = useState<UploadMonitorTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Phase 7: Ref to track retry timers for cleanup
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase 4: Loading state with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Phase 7: Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Phase 7: Memoize filtered tasks
  const filteredTasks = useMemo(() =>
    tasks.filter(t => {
      if (t.channel !== activeChannel) return false;
      if (appliedSearch) {
        const matchSearch =
          t.taskId.toLowerCase().includes(appliedSearch.toLowerCase()) ||
          t.fileName.toLowerCase().includes(appliedSearch.toLowerCase()) ||
          t.fullPath.toLowerCase().includes(appliedSearch.toLowerCase());
        if (!matchSearch) return false;
      }
      if (appliedStatus !== 'All' && t.status !== appliedStatus) return false;
      return true;
    }),
    [tasks, activeChannel, appliedSearch, appliedStatus]
  );

  // Phase 7: Memoize channel stats
  const stats = useMemo(() => {
    const channelTasks = tasks.filter(t => t.channel === activeChannel);
    return {
      total: channelTasks.length,
      completed: channelTasks.filter(t => t.status === 'COMPLETED').length,
      failed: channelTasks.filter(t => t.status === 'FAILED').length,
      processing: channelTasks.filter(t => t.status === 'PROCESSING').length,
      queued: channelTasks.filter(t => t.status === 'QUEUED').length,
    };
  }, [tasks, activeChannel]);

  const handleApply = useCallback(() => {
    setAppliedSearch(search);
    setAppliedStatus(statusFilter);
    toast.success('Đã áp dụng bộ lọc tiến độ');
  }, [search, statusFilter]);

  const handleReset = useCallback(() => {
    setSearch('');
    setStatusFilter('All');
    setAppliedSearch('');
    setAppliedStatus('All');
    toast.success('Đã đặt lại bộ lọc');
  }, []);

  const handleRefresh = useCallback(() => {
    toast.success('Đã làm mới dữ liệu upload');
  }, []);

  // Phase 4: Fix setTimeout cleanup for retry simulation
  const handleRetry = useCallback((taskId: string) => {
    toast.info(`Đang yêu cầu thử lại task ${taskId.substring(0, 8)}...`);

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'PROCESSING', statusDesc: 'Đang kết nối tới bucket GCS và thử lại...', errorTitle: '', errorMsg: '' };
      }
      return t;
    }));

    // Cleanup any previous timer before setting new one
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

    retryTimerRef.current = setTimeout(() => {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t, status: 'COMPLETED', statusDesc: 'Tải media thành công.',
            retryCount: t.retryCount + 1, nextRetry: '—',
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return t;
      }));
      toast.success(`Task ${taskId.substring(0, 8)} đã được tải lên thành công!`);
    }, 2500);
  }, []);

  const handleShowDetail = useCallback((task: UploadMonitorTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const columns = useMemo(() => [
    {
      title: 'Task ID', dataIndex: 'taskId', key: 'taskId', width: 140,
      render: (val: string) => (
        <span className="font-mono text-[var(--text-secondary)] text-xs font-semibold">
          {val.length > 13 ? `${val.substring(0, 8)}...${val.substring(val.length - 4)}` : val}
        </span>
      )
    },
    {
      title: 'Status', key: 'status', width: 260,
      render: (_: unknown, record: UploadMonitorTask) => {
        let text = 'Queued';
        let variant: StatusVariant = 'warning';
        if (record.status === 'COMPLETED') { variant = 'success'; text = 'Completed'; }
        if (record.status === 'FAILED') { variant = 'error'; text = 'Failed'; }
        if (record.status === 'PROCESSING') { variant = 'processing'; text = 'Processing'; }
        return (
          <div className="py-1">
            <StatusBadge label={text} variant={variant} className="mb-1.5" />
            <div className="text-[10px] text-[var(--text-tertiary)] font-medium leading-tight max-w-[240px]">
              {record.statusDesc} {record.status === 'QUEUED' && `| Số lần thử: ${record.retryCount}`}
            </div>
          </div>
        );
      }
    },
    {
      title: 'File / Video', key: 'fileDetails',
      render: (_: unknown, record: UploadMonitorTask) => (
        <div className="max-w-xs py-1">
          <div className="text-[var(--text-primary)] font-bold text-xs truncate leading-normal">{record.shortPath}</div>
          <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate leading-normal mt-0.5">{record.fullPath}</div>
        </div>
      )
    },
    { title: 'Next Retry', dataIndex: 'nextRetry', key: 'nextRetry', width: 150, render: (t: string) => <span className="text-[var(--text-secondary)] font-medium text-xs">{t}</span> },
    { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated', width: 150, render: (t: string) => <span className="text-[var(--text-secondary)] font-medium text-xs">{t}</span> },
    {
      title: 'Issue', key: 'issue', width: 250,
      render: (_: unknown, record: UploadMonitorTask) => record.errorTitle ? (
        <div className="text-xs text-[var(--status-error)] font-semibold leading-relaxed max-w-[230px] py-1">
          <div>{record.errorTitle}</div>
          <div className="text-[10px] text-[var(--status-error)] font-mono truncate mt-0.5">{record.errorMsg}</div>
        </div>
      ) : <span className="text-[var(--text-disabled)]">—</span>
    },
    {
      title: 'Actions', key: 'actions', width: 160,
      render: (_: unknown, record: UploadMonitorTask) => (
        <div className="flex gap-1.5">
          <Button type="button" variant="border" size="s" onClick={() => handleShowDetail(record)} className="font-bold text-xs">
            Details
          </Button>
          {record.status !== 'COMPLETED' && (
            <Button
              type="button"
              variant="primary"
              size="s"
              onClick={() => handleRetry(record.id)}
              disabled={record.status === 'PROCESSING'}
              className="font-bold text-xs"
            >
              Retry
            </Button>
          )}
        </div>
      )
    },
  ], [handleShowDetail, handleRetry]);

  // Phase 4: Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5].map(i => (
            <Col xs={24} sm={12} md={5} key={i}>
              <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Upload size={20} />}
        iconBg="var(--chart-5)"
        title="Upload Monitor"
        subtitle="Theo dõi trạng thái upload theo từng kênh, xem vấn đề để xử lý nhanh."
      />

      {/* Tabs */}
      <div className="border-b border-[var(--border-default)]">
        <Tabs
          activeKey={activeChannel}
          onChange={(key) => {
            setActiveChannel(key as 'Facebook (Meta)' | 'Axon' | 'YouTube');
            setSearch(''); setStatusFilter('All'); setAppliedSearch(''); setAppliedStatus('All');
          }}
          className="mb-0 text-xs font-semibold"
          items={[
            { key: 'Facebook (Meta)', label: 'Facebook (Meta)' },
            { key: 'Axon', label: 'Axon' },
            { key: 'YouTube', label: 'YouTube' },
          ]}
        />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={5}><StatCard title="Total Media" value={stats.total} variant="default" /></Col>
        <Col xs={24} sm={12} md={5}><StatCard title="Completed" value={stats.completed} variant="success" /></Col>
        <Col xs={24} sm={12} md={4}><StatCard title="Failed" value={stats.failed} variant="error" /></Col>
        <Col xs={24} sm={12} md={5}><StatCard title="Processing" value={stats.processing} variant="info" /></Col>
        <Col xs={24} sm={12} md={5}><StatCard title="Queued / Retry" value={stats.queued + stats.failed} variant="warning" /></Col>
      </Row>

      <FilterBar
        title="Upload filters"
        onApply={handleApply}
        onReset={handleReset}
        applyLabel="Apply"
        resetLabel="Reset"
        actions={
          <>
            <Button type="button" variant="primary" size="s" onClick={handleApply}>Apply</Button>
            <Button type="button" variant="subtle" size="s" onClick={handleReset}>Reset</Button>
            <Button type="button" variant="border" size="s" onClick={handleRefresh}>Refresh</Button>
          </>
        }
      >
        <Input
          prefix={<Search size={15} className="text-[var(--text-tertiary)] mr-1" />}
          placeholder="Search by task ID, bucket or file name..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[280px]" allowClear
        />
        <Select value={statusFilter} onChange={setStatusFilter} className="w-44" options={[
          { value: 'All', label: 'Filter by status' }, { value: 'COMPLETED', label: 'Completed' },
          { value: 'PROCESSING', label: 'Processing' }, { value: 'QUEUED', label: 'Queued' },
          { value: 'FAILED', label: 'Failed' },
        ]} />
      </FilterBar>

      <DataTable<UploadMonitorTask>
        panel
        columns={columns}
        dataSource={filteredTasks}
        rowKey="id"
        pagination={{ pageSize: 5, showSizeChanger: true }}
        rowClassName="hover:bg-[var(--surface-subtle)]/40 transition-colors"
        emptyIcon={<Upload size={32} className="stroke-[1.5]" />}
        emptyTitle="No tasks found"
        emptyDescription="Không có task nào khớp với bộ lọc hiện tại. Thử đặt lại bộ lọc để xem toàn bộ danh sách."
      />

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
            <Info size={16} className="text-[var(--status-info)]" />
            Media Upload Task Details
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" type="button" variant="border" size="m" onClick={() => setIsModalOpen(false)} className="font-bold">Close</Button>
        ]}
        width={650}
      >
        {selectedTask && (
          <div className="space-y-4 py-3">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase select-none">Full Task ID</div>
                <div className="font-mono text-[var(--text-secondary)] text-xs bg-[var(--surface-subtle)] p-2 rounded border border-[var(--border-subtle)] select-all mt-1">{selectedTask.taskId}</div>
              </Col>
              <Col span={12}>
                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase select-none">Channel</div>
                <div className="font-semibold text-[var(--text-primary)] text-sm mt-1">{selectedTask.channel}</div>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase select-none">Next Retry</div>
                <div className="text-[var(--text-primary)] font-medium text-xs mt-1">{selectedTask.nextRetry}</div>
              </Col>
              <Col span={12}>
                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase select-none">Last Updated</div>
                <div className="text-[var(--text-primary)] font-medium text-xs mt-1">{selectedTask.lastUpdated}</div>
              </Col>
            </Row>
            <div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase select-none">Full GCS Bucket Path</div>
              <div className="font-mono text-xs text-[var(--text-secondary)] bg-[var(--surface-subtle)] p-2.5 rounded border border-[var(--border-subtle)] mt-1 select-all break-all leading-relaxed">
                {selectedTask.fullPath}
              </div>
            </div>
            {selectedTask.errorTitle && (
              <div className="bg-[var(--status-error-bg)] p-3 rounded-lg border border-[var(--status-error-border)]">
                <div className="flex items-center gap-1.5 text-[var(--status-error)] font-bold text-xs select-none">
                  <AlertTriangle size={14} />
                  {selectedTask.errorTitle}
                </div>
                <div className="font-mono text-[10px] text-[var(--status-error)] mt-1.5 leading-relaxed break-all select-text">
                  {selectedTask.errorMsg}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UploadMonitor;
