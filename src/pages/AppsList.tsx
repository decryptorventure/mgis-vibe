import React, { useState } from 'react';
import { Card, Input, Radio, Row, Col, Tooltip } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { Search, Plus, Play, ShieldAlert, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, FilterBar, PageHeader } from '@/components/ui';
import { mockProjects } from '@/shared/mock-data';
import { NETWORK_LOGOS } from '@/shared/network-config';
import { ACTIVE_NETWORKS, isActiveNetworkKey } from '@/shared/navigation';

// Custom status configuration for vibrant aesthetics
const STATUS_META = {
  Running: {
    color: 'var(--status-success)',
    bg: 'var(--status-success-bg)',
    border: 'var(--status-success-border)',
    icon: <Play size={10} className="fill-[var(--status-success)] text-[var(--status-success)] animate-pulse" />,
  },
  Error: {
    color: 'var(--status-error)',
    bg: 'var(--status-error-bg)',
    border: 'var(--status-error-border)',
    icon: <ShieldAlert size={10} />,
  },
  Stop: {
    color: 'var(--text-tertiary)',
    bg: 'var(--surface-muted)',
    border: 'var(--border-subtle)',
    icon: <AlertCircle size={10} />,
  },
  'Update Required': {
    color: 'var(--status-warning)',
    bg: 'var(--status-warning-bg)',
    border: 'var(--status-warning-border)',
    icon: <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '4s' }} />,
  },
};

export const AppsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [osFilter, setOsFilter] = useState<'all' | 'ios' | 'android'>('all');

  const filteredProjects = mockProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.package.toLowerCase().includes(searchText.toLowerCase());
    const matchesOs = osFilter === 'all' || p.os === osFilter;
    return matchesSearch && matchesOs;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Plus size={20} />}
        iconBg="var(--color-primary-500)"
        title="Danh sách các App"
        subtitle="Quản lý và truy cập các workspace chuyên biệt của từng ứng dụng"
        actions={
          <Button
            type="button"
            variant="primary"
            size="m"
            onClick={() => toast.info('Chức năng thêm App mới sẽ sớm ra mắt')}
            className="font-semibold gap-1.5"
          >
            <Plus size={14} />
            Thêm App mới
          </Button>
        }
      />

      <FilterBar
        title="Bộ lọc"
        onReset={() => {
          setSearchText('');
          setOsFilter('all');
        }}
        actions={
          <>
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {filteredProjects.length} apps
            </span>
            <Button
              type="button"
              variant="subtle"
              size="s"
              onClick={() => {
                setSearchText('');
                setOsFilter('all');
              }}
            >
              Đặt lại
            </Button>
          </>
        }
      >
        <Input
          prefix={<Search size={15} className="text-[var(--text-tertiary)]" />}
          placeholder="Tìm kiếm app theo tên hoặc bundle ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full sm:w-80"
          allowClear
        />
        <Radio.Group
          value={osFilter}
          onChange={(e) => setOsFilter(e.target.value)}
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="all">Tất cả</Radio.Button>
          <Radio.Button value="ios">iOS</Radio.Button>
          <Radio.Button value="android">Android</Radio.Button>
        </Radio.Group>
      </FilterBar>

      {/* Grid List */}
      <Row gutter={[16, 16]}>
        {filteredProjects.map((p) => {
          const statusConfig = STATUS_META[p.status] || STATUS_META['Stop'];
          return (
            <Col xs={24} sm={12} lg={8} key={p.id}>
              <Card
                hoverable
                onClick={() => navigate(`/apps/${p.id}/dashboard`)}
                className="rounded-lg border-[var(--border-default)] overflow-hidden transition-colors hover:border-primary-500 bg-[var(--surface-base)] group"
                styles={{ body: { padding: '20px' } }}
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border-default)]"
                    >
                      {p.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)] font-mono truncate max-w-[160px]">
                        {p.package}
                      </div>
                    </div>
                  </div>

                  <span
                    className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      borderColor: statusConfig.border,
                    }}
                  >
                    {statusConfig.icon}
                    {p.status}
                  </span>
                </div>

                {/* Subtitle / OS Indicator */}
                <div className="mt-3.5 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Hệ điều hành</span>
                  <span className="font-semibold uppercase tracking-wider text-[var(--text-primary)] inline-flex items-center gap-1">
                    <Smartphone size={12} />
                    {p.os}
                  </span>
                </div>

                {/* Performance stats strip */}
                <div
                  className="mt-4 p-3 rounded-lg flex justify-between bg-[var(--surface-subtle)] border border-[var(--border-subtle)]"
                >
                  <div className="text-center">
                    <div className="text-[10px] text-[var(--text-tertiary)]">Spend</div>
                    <div className="font-bold text-xs text-[var(--text-primary)] mt-0.5">
                      ${p.spend.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-[var(--text-tertiary)]">Installs</div>
                    <div className="font-bold text-xs text-[var(--text-primary)] mt-0.5">
                      {p.installs.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-[var(--text-tertiary)]">ROAS</div>
                    <div className="font-bold text-xs text-[var(--status-success)] mt-0.5">
                      {p.roas > 0 ? `${p.roas}x` : '—'}
                    </div>
                  </div>
                </div>

                {/* Connected Networks */}
                <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mr-1">
                    Networks:
                  </span>
                  {p.networks.length > 0 ? (
                    p.networks.map((net) => (
                      <Tooltip key={net} title={isActiveNetworkKey(net) ? ACTIVE_NETWORKS[net].label : net}>
                        <span className="w-5.5 h-5.5 rounded-full border border-[var(--border-subtle)] bg-white p-0.5 flex items-center justify-center cursor-help transition-transform hover:scale-110 shadow-sm">
                          <img
                            src={NETWORK_LOGOS[net]}
                            alt={net}
                            className="w-full h-full object-contain rounded-full"
                          />
                        </span>
                      </Tooltip>
                    ))
                  ) : (
                    <span className="text-[10px] text-[var(--text-disabled)] italic">Chưa kết nối</span>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {filteredProjects.length === 0 && (
        <Card className="rounded-lg border-[var(--border-default)] bg-[var(--surface-base)]">
          <EmptyState
            icon={<Search size={28} />}
            title="Không tìm thấy ứng dụng"
            description="Không có app nào phù hợp với bộ lọc hiện tại."
            actionLabel="Đặt lại bộ lọc"
            onAction={() => {
              setSearchText('');
              setOsFilter('all');
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default AppsList;
