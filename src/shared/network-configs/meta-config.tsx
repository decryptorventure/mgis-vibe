// ─── Meta (Facebook/Instagram) network config ────────────────────────────────
import React from 'react';
import { Tag, Card, Statistic } from 'antd';
import { Settings } from 'lucide-react';
import type { NetworkConfig } from './types';
import { networkConfig } from '@/shared/tokens';
import { stableInt, stablePick } from '@/shared/stable-metrics';

const MetaInsightsContent: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
        <Statistic title="Avg Relevance Score" value={8.1} suffix="/10" valueStyle={{ color: networkConfig.meta.color }} />
        <div className="text-xs text-[var(--text-tertiary)] mt-1">Meta AI relevance</div>
      </Card>
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
        <Statistic title="Advantage+ Campaigns" value={4} valueStyle={{ color: networkConfig.meta.color }} />
        <div className="text-xs text-[var(--text-tertiary)] mt-1">CBO enabled</div>
      </Card>
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
        <Statistic title="Top Lookalike %" value={3} suffix="%" valueStyle={{ color: 'var(--status-success)' }} />
        <div className="text-xs text-[var(--text-tertiary)] mt-1">Best performing audience</div>
      </Card>
    </div>
    <div className="bg-[var(--surface-subtle)] rounded-xl p-4 border border-[var(--border-subtle)]">
      <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Placement Performance</div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          { label: 'Instagram Feed', spend: '$12,400', installs: 2840, roas: '3.2x' },
          { label: 'Facebook Feed', spend: '$8,900', installs: 1960, roas: '2.8x' },
          { label: 'Reels', spend: '$6,200', installs: 1540, roas: '3.8x' },
          { label: 'Audience Network', spend: '$3,100', installs: 890, roas: '2.1x' },
        ].map((p) => (
          <div key={p.label} className="bg-[var(--surface-base)] rounded-lg p-2 border border-[var(--border-subtle)]">
            <div className="font-semibold text-[var(--text-primary)]">{p.label}</div>
            <div className="flex justify-between text-[var(--text-tertiary)] mt-1">
              <span>{p.spend}</span>
              <span>{p.installs.toLocaleString()} installs</span>
              <span className="text-[var(--status-success)] font-semibold">{p.roas}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const metaConfig: NetworkConfig = {
  key: 'meta',
  label: 'Meta',
  color: networkConfig.meta.color,
  icon: <Settings size={20} />,
  createButtonLabel: 'Create Campaign',
  insightsContent: () => <MetaInsightsContent />,
  extraColumns: [
    {
      dataIndex: 'cboStatus',
      title: 'CBO Status',
      width: 110,
      render: (_value, record) => {
        const active = stablePick(`${record.id}:cbo`, [true, true, true, false] as const);
        return (
          <Tag
            color={active ? 'success' : 'default'}
            className="rounded-md font-semibold text-[10px] border-none"
          >
            {active ? 'Active' : 'Off'}
          </Tag>
        );
      },
    },
    {
      dataIndex: 'lookalikePct',
      title: 'Lookalike %',
      width: 110,
      render: (_value, record) => {
        const pct = stableInt(`${record.id}:lookalike-pct`, 1, 5);
        return <span className="text-xs font-medium text-[var(--text-secondary)]">{pct}%</span>;
      },
    },
  ],
};
