// ─── Moloco DSP Workspace — thin plugin ──────────────────────────────────────
// Publisher/exchange management is preserved as an extraTab.
// Shell handles header, toolbar, Campaigns/Insights/Settings tabs.
import React, { useState } from 'react';
import { Table, Tag, Button } from 'antd';
import { toast } from '@frontend-team/ui-kit';
import { Ban, CheckCircle } from 'lucide-react';
import { mockCampaigns, mockMolocoPublishers, type MolocoPublisher } from '@/shared/mock-data';
import { NetworkWorkspaceShell } from '@/components/networks/network-workspace-shell';
import { NETWORK_CONFIGS } from '@/shared/network-config';

// ─── Publisher & Exchange management tab (Moloco-specific) ────────────────────
const PublisherManagementTab: React.FC = () => {
  const [publishers, setPublishers] = useState<MolocoPublisher[]>(mockMolocoPublishers);

  const togglePublisher = (id: string, bundleId: string, current: MolocoPublisher['status']) => {
    const next = current === 'ALLOWED' ? 'BLOCKED' : 'ALLOWED';
    setPublishers(prev => prev.map(p => p.id === id ? { ...p, status: next } : p));
    toast.success(next === 'BLOCKED' ? `Blocked ${bundleId}` : `Allowed ${bundleId}`);
  };

  const publisherColumns = [
    { title: 'App Name', dataIndex: 'appName', key: 'appName', render: (t: string) => <span className="font-semibold text-xs text-[var(--text-primary)]">{t}</span> },
    { title: 'Bundle ID', dataIndex: 'bundleId', key: 'bundleId', render: (t: string) => <span className="font-mono text-xs text-[var(--text-tertiary)] select-all">{t}</span> },
    { title: 'OS', dataIndex: 'os', key: 'os', width: 70, render: (v: string) => <Tag color={v === 'ios' ? 'blue' : 'green'} className="text-[10px]">{v.toUpperCase()}</Tag> },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 90, render: (v: number) => `$${v.toLocaleString()}` },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 80, render: (v: number) => v.toLocaleString() },
    { title: 'CPA', dataIndex: 'cpa', key: 'cpa', width: 80, render: (v: number) => `$${v.toFixed(2)}` },
    {
      title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 80,
      render: (v: number) => <span className={v < 1.5 ? 'text-[var(--status-error)] font-bold text-xs' : 'text-xs font-semibold'}>{v.toFixed(2)}x</span>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (s: MolocoPublisher['status']) => (
        <Tag color={s === 'ALLOWED' ? 'success' : 'error'} className="font-semibold rounded-md border-none text-[10px]">
          {s === 'ALLOWED' ? 'Allowed' : 'Blocked'}
        </Tag>
      ),
    },
    {
      title: 'Action', key: 'actions', width: 120,
      render: (_: unknown, r: MolocoPublisher) => {
        const isAllowed = r.status === 'ALLOWED';
        return (
          <Button
            size="small"
            danger={isAllowed}
            type={isAllowed ? 'default' : 'primary'}
            className={isAllowed ? 'border-[var(--status-error-border)] text-[var(--status-error)] h-7' : 'bg-[var(--status-success)] border-none h-7'}
            icon={isAllowed ? <Ban size={12} /> : <CheckCircle size={12} />}
            onClick={() => togglePublisher(r.id, r.bundleId, r.status)}
          >
            {isAllowed ? 'Block' : 'Allow'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        className="nms-table"
        columns={publisherColumns}
        dataSource={publishers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />
    </div>
  );
};

import { useParams } from 'react-router-dom';
import { MolocoAdjustMetricsTab } from '@/components/networks/moloco/moloco-adjust-metrics-tab';
import { MolocoCreativeGroupsTab } from '@/components/networks/moloco/moloco-creative-groups-tab';
import { MolocoExchangeTab } from '@/components/networks/moloco/moloco-exchange-tab';
import { MolocoMLTab } from '@/components/networks/moloco/moloco-ml-tab';

// ─── Moloco Workspace (thin plugin) ──────────────────────────────────────────
export const MolocoWorkspace: React.FC<{ network: string; networkLabel: string }> = ({ network }) => {
  const { appId } = useParams<{ appId?: string }>();
  const campaigns = mockCampaigns.filter(
    (c) => c.network === network && (!appId || c.projectId === appId)
  );

  const config = {
    ...NETWORK_CONFIGS['moloco'],
    extraTabs: [
      {
        key: 'adjust-performance',
        label: 'Adjust Performance',
        children: <MolocoAdjustMetricsTab />
      },
      {
        key: 'publisher-management',
        label: 'Publisher Management',
        children: <PublisherManagementTab />,
      },
      {
        key: 'exchange-targeting',
        label: 'Exchange Targeting',
        children: <MolocoExchangeTab />
      },
      {
        key: 'creative-groups',
        label: 'Creative Groups',
        children: <MolocoCreativeGroupsTab />
      },
      {
        key: 'ml-performance',
        label: 'ML Performance',
        children: <MolocoMLTab />
      }
    ],
  };

  return <NetworkWorkspaceShell config={config} campaigns={campaigns} />;
};

export default MolocoWorkspace;
