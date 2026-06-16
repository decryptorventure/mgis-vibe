// ─── Apple Search Ads (ASA) network config ───────────────────────────────────
import React from 'react';
import { Tag, Card, Statistic, Table } from 'antd';
import { Search } from 'lucide-react';
import type { NetworkConfig } from './types';
import { mockAsaKeywords } from '@/shared/mock-data';
import { networkConfig } from '@/shared/tokens';
import { stableInt, stablePick } from '@/shared/stable-metrics';

const AsaInsightsContent: React.FC = () => {
  const matchBreakdown = [
    { type: 'EXACT', count: mockAsaKeywords.filter(k => k.matchType === 'EXACT').length, cpa: 1.24, roas: '3.8x' },
    { type: 'BROAD', count: mockAsaKeywords.filter(k => k.matchType === 'BROAD').length, cpa: 1.87, roas: '2.6x' },
  ];

  const topKeywords = [...mockAsaKeywords]
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 5);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Active Keywords" value={mockAsaKeywords.length} valueStyle={{ color: networkConfig.asa.color }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Bidding keywords</div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Avg CPA" value={1.45} prefix="$" precision={2} valueStyle={{ color: 'var(--status-success)' }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Across all match types</div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Search Term Coverage" value={72} suffix="%" valueStyle={{ color: networkConfig.asa.color }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Terms with bid keyword</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--surface-subtle)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-xs font-semibold text-[var(--text-secondary)] mb-3">Match Type Breakdown</div>
          {matchBreakdown.map((m) => (
            <div key={m.type} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
              <Tag color={m.type === 'EXACT' ? 'blue' : 'orange'} className="rounded-md font-semibold text-[10px]">{m.type}</Tag>
              <span className="text-xs text-[var(--text-secondary)]">{m.count} keywords</span>
              <span className="text-xs font-medium">${m.cpa} CPA</span>
              <span className="text-xs font-semibold text-[var(--status-success)]">{m.roas}</span>
            </div>
          ))}
        </div>

        <div className="bg-[var(--surface-subtle)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-xs font-semibold text-[var(--text-secondary)] mb-3">Top Performing Keywords</div>
          <div className="space-y-2">
            {topKeywords.map((k) => (
              <div key={k.id} className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-[var(--text-primary)] truncate max-w-[120px]">{k.keywordText}</span>
                <Tag color={k.matchType === 'EXACT' ? 'blue' : 'orange'} className="text-[10px]">{k.matchType}</Tag>
                <span className="text-[var(--status-success)] font-semibold">{k.installs} installs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Suppress TS unused warning — Table is used inside JSX
void Table;

export const asaConfig: NetworkConfig = {
  key: 'asa',
  label: 'Apple Search Ads',
  color: networkConfig.asa.color,
  icon: <Search size={20} />,
  createButtonLabel: 'Create Keyword',
  insightsContent: () => <AsaInsightsContent />,
  extraColumns: [
    {
      dataIndex: 'keywordMatchType',
      title: 'Match Type',
      width: 120,
      render: (_value, record) => {
        const type = stablePick(`${record.id}:match-type`, ['EXACT', 'BROAD'] as const);
        return (
          <Tag color={type === 'EXACT' ? 'blue' : 'orange'} className="rounded-md font-semibold text-[10px]">
            {type}
          </Tag>
        );
      },
    },
    {
      dataIndex: 'searchTermCount',
      title: 'Search Terms',
      width: 120,
      render: (_value, record) => {
        const count = stableInt(`${record.id}:search-terms`, 5, 54);
        return <span className="text-xs font-medium text-[var(--text-secondary)]">{count} terms</span>;
      },
    },
  ],
};
