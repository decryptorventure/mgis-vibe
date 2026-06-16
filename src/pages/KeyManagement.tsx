import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, Button as AntButton, Tooltip, Skeleton } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { 
  RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle, Key, 
  LayoutGrid, List, User, Folder, Calendar, Clock, Plus 
} from 'lucide-react';
import { mockVaultKeys } from '../shared/mock-data';
import { PageHeader, EmptyState, StatusBadge, statusToVariant, NetworkBadge } from '../components/ui';

export const KeyManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [syncLoading, setSyncLoading] = useState(false);

  // Phase 4: Loading state with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Action handlers
  const handleReverify = useCallback((id: string) => {
    toast.loading(`Đang xác thực khóa ${id}...`);
    setTimeout(() => {
      toast.success(`Khóa ${id} đã được xác thực thành công!`);
    }, 1000);
  }, []);

  const handleSyncPermissions = useCallback(() => {
    setSyncLoading(true);
    toast.loading('Đang đồng bộ hóa quyền với các Ad Networks...');
    setTimeout(() => {
      setSyncLoading(false);
      toast.success('Đồng bộ hóa quyền thành công!');
    }, 1500);
  }, []);

  const handleAddKey = useCallback(() => {
    toast.info('Tính năng thêm API Key mới sẽ được kết nối với HashiCorp Vault ở môi trường Production.');
  }, []);

  // Filter keys based on active tab
  const filteredKeys = useMemo(() => {
    if (activeTab === 'All') return mockVaultKeys;
    return mockVaultKeys.filter(
      (k) => k.network.toLowerCase() === activeTab.toLowerCase()
    );
  }, [activeTab]);

  // Memoize columns for table view
  const columns = useMemo(() => [
    { 
      title: 'Network', 
      dataIndex: 'network', 
      key: 'network', 
      width: 140, 
      render: (t: string) => <NetworkBadge network={t.toLowerCase().replace(' ', '-') as any} /> 
    },
    { 
      title: 'Key Type', 
      dataIndex: 'keyType', 
      key: 'keyType', 
      render: (t: string) => <span className="font-mono text-xs text-[var(--text-secondary)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{t}</span> 
    },
    {
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 150,
      render: (s: string) => <StatusBadge label={s.replaceAll('_', ' ')} variant={statusToVariant(s)} />,
    },
    { title: 'Owner', dataIndex: 'owner', key: 'owner', width: 140, className: 'text-[var(--text-secondary)] text-sm' },
    { title: 'Project', dataIndex: 'project', key: 'project', width: 160, render: (p: string) => <span className="font-medium text-[var(--text-primary)]">{p}</span> },
    { title: 'Last Verified', dataIndex: 'lastVerified', key: 'lastVerified', width: 160, className: 'text-[var(--text-tertiary)] text-xs' },
    {
      title: 'Expires', 
      dataIndex: 'expiresAt', 
      key: 'expiresAt', 
      width: 120,
      render: (t: string) => t ? <span className="text-sm">{t}</span> : <span className="text-[var(--text-disabled)]">—</span>,
    },
    {
      title: 'Actions', 
      key: 'actions', 
      width: 80,
      render: (_: unknown, record: typeof mockVaultKeys[0]) => (
        <Tooltip title="Re-verify key">
          <AntButton
            aria-label="Re-verify key" 
            size="small" 
            icon={<RefreshCw size={14} />} 
            onClick={() => handleReverify(record.id)}
          />
        </Tooltip>
      ),
    },
  ], [handleReverify]);

  // Memoize stats computation
  const stats = useMemo(() => ({
    total: mockVaultKeys.length,
    valid: mockVaultKeys.filter(k => k.status === 'VALID').length,
    expiring: mockVaultKeys.filter(k => k.status === 'EXPIRING_SOON').length,
    expired: mockVaultKeys.filter(k => k.status === 'EXPIRED' || k.status === 'REVOKED').length,
  }), []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="rounded-xl">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ))}
        </div>
        <Card className="rounded-xl">
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header with Primary & Secondary Actions */}
      <PageHeader
        icon={<Key size={20} />}
        iconBg="var(--chart-4)"
        title="Key Management"
        subtitle="Quản lý khóa API và chứng thực của các ad network"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="border"
              size="m"
              onClick={handleSyncPermissions}
              loading={syncLoading}
              className="gap-1.5 font-bold text-xs"
            >
              <RefreshCw size={13} />
              Sync Permissions
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              onClick={handleAddKey}
              className="gap-1.5 font-bold text-xs"
            >
              <Plus size={13} />
              Add Key
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--surface-muted)] rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-[var(--text-secondary)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
              <div className="text-xs text-[var(--text-secondary)]">Total Keys</div>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--status-success-bg)] rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-[var(--status-success)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--status-success)]">{stats.valid}</div>
              <div className="text-xs text-[var(--text-secondary)]">Valid</div>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--status-warning-bg)] rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-[var(--status-warning)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--status-warning)]">{stats.expiring}</div>
              <div className="text-xs text-[var(--text-secondary)]">Expiring Soon</div>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--status-error-bg)] rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-[var(--status-error)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--status-error)]">{stats.expired}</div>
              <div className="text-xs text-[var(--text-secondary)]">Expired / Revoked</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Warning Notice */}
      <div className="bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] rounded-xl p-3 text-sm text-[var(--status-warning)] flex items-center gap-2">
        <AlertTriangle size={16} />
        <span><strong>Security Notice:</strong> Chỉ hiển thị metadata và trạng thái key. Credential thật được quản lý bởi Vault backend và không hiển thị trên giao diện.</span>
      </div>

      {/* Filter and View Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Network Tabs (using Core DS compliant theme styling, no brand orange) */}
        <div
          className="flex gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-default)] flex-wrap w-fit"
        >
          {['All', 'Meta', 'Google Ads', 'ASA', 'Axon', 'YouTube', 'Moloco'].map(net => {
            const isActive = activeTab === net;
            return (
              <button
                key={net}
                onClick={() => setActiveTab(net)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border-0 select-none"
                style={
                  isActive
                    ? { background: 'var(--surface-base)', color: 'var(--text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
                    : { background: 'transparent', color: 'var(--text-secondary)' }
                }
              >
                {net}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div
          className="flex gap-0.5 p-0.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-default)] w-fit"
        >
          <button
            onClick={() => setViewMode('grid')}
            className="p-1.5 rounded-md cursor-pointer transition-all border-0 flex items-center justify-center"
            style={
              viewMode === 'grid'
                ? { background: 'var(--surface-base)', color: 'var(--text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
                : { background: 'transparent', color: 'var(--text-tertiary)' }
            }
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className="p-1.5 rounded-md cursor-pointer transition-all border-0 flex items-center justify-center"
            style={
              viewMode === 'table'
                ? { background: 'var(--surface-base)', color: 'var(--text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
                : { background: 'transparent', color: 'var(--text-tertiary)' }
            }
            title="Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Credentials Content Area */}
      {filteredKeys.length > 0 ? (
        viewMode === 'grid' ? (
          /* Card Grid layout representing credentials */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredKeys.map((k) => (
              <Card
                key={k.id}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] relative overflow-hidden transition-all hover:border-[var(--border-strong)] shadow-none"
                styles={{ body: { padding: '16px' } }}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <NetworkBadge network={k.network.toLowerCase().replace(' ', '-') as any} />
                  <StatusBadge label={k.status.replaceAll('_', ' ')} variant={statusToVariant(k.status)} />
                </div>

                {/* Key Type & Vault Protection */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Key size={14} className="text-[var(--text-secondary)]" />
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[var(--surface-muted)] text-[var(--text-secondary)] rounded border border-[var(--border-subtle)] truncate">
                      {k.keyType}
                    </span>
                  </div>
                  {/* Encrypted indicator */}
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--status-success)] bg-[var(--status-success-bg)] px-2.5 py-0.5 rounded-full w-fit font-semibold border border-[var(--status-success-border)]">
                    <Shield size={12} />
                    <span>Encrypted in Vault</span>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="space-y-2 text-xs border-t border-[var(--border-subtle)] pt-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-tertiary)] flex items-center gap-1.5">
                      <Folder size={13} /> Project
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">{k.project}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-tertiary)] flex items-center gap-1.5">
                      <User size={13} /> Owner
                    </span>
                    <span className="font-medium text-[var(--text-secondary)]">{k.owner}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-tertiary)] flex items-center gap-1.5">
                      <Clock size={13} /> Verified
                    </span>
                    <span className="text-[var(--text-secondary)]">{k.lastVerified}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-tertiary)] flex items-center gap-1.5">
                      <Calendar size={13} /> Expires
                    </span>
                    <span>
                      {k.expiresAt ? (
                        <span className="text-[var(--text-secondary)]">{k.expiresAt}</span>
                      ) : (
                        <span className="text-[var(--text-disabled)]">—</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
                  <Tooltip title="Re-verify credential status">
                    <AntButton
                      onClick={() => handleReverify(k.id)}
                      size="small"
                      className="flex items-center gap-1 text-[11px] font-bold"
                      icon={<RefreshCw size={12} />}
                    >
                      Re-verify
                    </AntButton>
                  </Tooltip>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="rounded-xl overflow-hidden shadow-none" styles={{ body: { padding: 0 } }}>
            <Table 
              className="nms-table" 
              columns={columns} 
              dataSource={filteredKeys} 
              rowKey="id" 
              pagination={false} 
              scroll={{ x: 1000 }} 
            />
          </Card>
        )
      ) : (
        /* Empty State */
        <Card className="rounded-xl shadow-none" style={{ border: '1px solid var(--border-default)' }}>
          <EmptyState
            icon={<Key size={32} className="stroke-[1.5]" />}
            title="No credentials found"
            description="Không có chứng thực nào phù hợp với bộ lọc ad network hiện tại."
          />
        </Card>
      )}
    </div>
  );
};

export default KeyManagement;
