// ─── Moloco DSP network config ────────────────────────────────────────────────
import React from 'react';
import { Tag, Card, Statistic, Table, Switch } from '@/components/ui-kit-compat';
import { ShieldAlert } from 'lucide-react';
import type { NetworkConfig } from './types';
import { mockMolocoPublishers, mockMolocoExchanges } from '@/shared/mock-data';
import type { MolocoPublisher } from '@/shared/mock-data';
import { networkConfig } from '@/shared/tokens';
import { stableInt } from '@/shared/stable-metrics';

const MolocoInsightsContent: React.FC = () => {
  const publishers = mockMolocoPublishers;
  const exchanges = mockMolocoExchanges;
  const blocked = publishers.filter(p => p.status === 'BLOCKED');
  const allowed = publishers.filter(p => p.status === 'ALLOWED');

  const topPublishers = [...publishers]
    .filter(p => p.status === 'ALLOWED')
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 6);

  const publisherColumns = [
    {
      title: 'App Name',
      dataIndex: 'appName',
      key: 'appName',
      render: (t: string) => <span className="font-semibold text-xs text-[var(--text-primary)]">{t}</span>,
    },
    {
      title: 'OS',
      dataIndex: 'os',
      key: 'os',
      width: 70,
      render: (v: string) => <Tag color={v === 'ios' ? 'blue' : 'green'} className="text-[10px]">{v.toUpperCase()}</Tag>,
    },
    {
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      width: 90,
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: 'Installs',
      dataIndex: 'installs',
      key: 'installs',
      width: 80,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: 'ROAS',
      dataIndex: 'roas',
      key: 'roas',
      width: 80,
      render: (v: number) => {
        const low = v < 1.5;
        return <span className={low ? 'text-[var(--status-error)] font-bold text-xs' : 'text-xs font-semibold'}>{v.toFixed(2)}x</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: MolocoPublisher['status']) => (
        <Tag color={s === 'ALLOWED' ? 'success' : 'error'} className="font-semibold rounded-md border-none text-[10px]">
          {s === 'ALLOWED' ? 'Allowed' : 'Blocked'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Total Publishers" value={publishers.length} valueStyle={{ color: networkConfig.moloco.color }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">{allowed.length} allowed · {blocked.length} blocked</div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Blocked Publishers" value={blocked.length} valueStyle={{ color: 'var(--status-error)' }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Blacklisted apps</div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Active Exchanges" value={exchanges.filter(e => e.status === 'ENABLED').length} valueStyle={{ color: networkConfig.moloco.color }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">of {exchanges.length} total</div>
        </Card>
      </div>

      <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Top Performing Publishers</div>
      <Table
        className="nms-table"
        columns={publisherColumns}
        dataSource={topPublishers}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 500 }}
      />

      <div className="text-xs font-semibold text-[var(--text-secondary)] mt-4 mb-2">Exchange Status</div>
      <div className="grid grid-cols-2 gap-3">
        {exchanges.map(ex => (
          <div key={ex.id} className="flex items-center justify-between p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)]">
            <div>
              <div className="font-semibold text-xs text-[var(--text-primary)]">{ex.name}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">ID: {ex.id}</div>
            </div>
            <Switch checked={ex.status === 'ENABLED'} size="small" disabled />
          </div>
        ))}
      </div>
    </div>
  );
};

export const molocoConfig: NetworkConfig = {
  key: 'moloco',
  label: 'Moloco',
  color: networkConfig.moloco.color,
  icon: <ShieldAlert size={20} />,
  createButtonLabel: 'Rules Monitor',
  insightsContent: () => <MolocoInsightsContent />,
  extraColumns: [
    {
      dataIndex: 'publisherCount',
      title: 'Publishers',
      width: 110,
      render: (_value, record) => {
        const count = stableInt(`${record.id}:publishers`, 20, 99);
        return <span className="text-xs font-medium text-[var(--text-secondary)]">{count} apps</span>;
      },
    },
    {
      dataIndex: 'blockedPublishers',
      title: 'Blocked',
      width: 100,
      render: (_value, record) => {
        const count = stableInt(`${record.id}:blocked-publishers`, 0, 9);
        return count > 0
          ? <Tag color="error" className="rounded-md font-semibold text-[10px] border-none">{count} blocked</Tag>
          : <span className="text-[var(--text-tertiary)] text-xs">—</span>;
      },
    },
  ],
};
