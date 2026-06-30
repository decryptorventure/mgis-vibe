// ─── Axon (AppLovin) network config ──────────────────────────────────────────
import React from 'react';
import { Tag, Card, Statistic, Table } from '@/components/ui-kit-compat';
import { RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import type { NetworkConfig } from './types';
import { mockAxonCountryBids } from '@/shared/mock-data';
import { networkConfig } from '@/shared/tokens';
import { stableFloat, stablePick } from '@/shared/stable-metrics';

const AXON_RECOMMENDATION_OPTIONS = ['Increase bid 15%', 'Decrease bid 10%', null, null] as const;

const AxonInsightsContent: React.FC = () => {
  const bids = mockAxonCountryBids;
  const withRecommendations = bids.filter(b => b.recommendation);

  const columns = [
    {
      title: 'Country',
      dataIndex: 'countryName',
      key: 'countryName',
      render: (t: string, record: typeof bids[0]) => (
        <span className="font-semibold text-xs flex items-center gap-1.5">
          <span>{record.countryCode === 'US' ? '🇺🇸' : record.countryCode === 'JP' ? '🇯🇵' : record.countryCode === 'KR' ? '🇰🇷' : '🇻🇳'}</span>
          {t}
        </span>
      ),
    },
    {
      title: 'Bid ($)',
      dataIndex: 'baseBid',
      key: 'baseBid',
      width: 90,
      render: (v: number) => <span className="font-semibold text-xs">${v.toFixed(2)}</span>,
    },
    {
      title: 'Target CPA',
      dataIndex: 'targetCpa',
      key: 'targetCpa',
      width: 100,
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    {
      title: 'Actual CPA',
      dataIndex: 'actualCpa',
      key: 'actualCpa',
      width: 100,
      render: (v: number, record: typeof bids[0]) => {
        const exceeded = v > record.targetCpa;
        return <span className={exceeded ? 'text-[var(--status-error)] font-bold text-xs' : 'text-xs'}>${v.toFixed(2)}</span>;
      },
    },
    {
      title: 'Recommendation',
      key: 'recommendation',
      render: (_: unknown, record: typeof bids[0]) => {
        if (!record.recommendation) return <span className="text-[var(--text-tertiary)] text-xs">—</span>;
        const isUp = record.recommendation.action === 'INCREASE';
        return (
          <Tag
            color={isUp ? 'success' : 'warning'}
            className="rounded-md font-semibold text-[10px]"
            icon={isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          >
            {isUp ? '+' : '-'}{record.recommendation.percent}%
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Country Bids Active" value={bids.length} valueStyle={{ color: networkConfig.axon.color }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Geo-level overrides</div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Pending Recommendations" value={withRecommendations.length} valueStyle={{ color: 'var(--status-warning)' }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">AI bid suggestions</div>
        </Card>
        <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
          <Statistic title="Top Bid Country" value={bids[0]?.countryName ?? 'US'} valueStyle={{ color: networkConfig.axon.color, fontSize: 16 }} />
          <div className="text-xs text-[var(--text-tertiary)] mt-1">${bids[0]?.baseBid.toFixed(2)} base bid</div>
        </Card>
      </div>
      <Table
        className="nms-table"
        columns={columns}
        dataSource={bids}
        rowKey="id"
        pagination={false}
        scroll={{ x: 600 }}
        size="small"
      />
    </div>
  );
};

export const axonConfig: NetworkConfig = {
  key: 'axon',
  label: 'Axon',
  color: networkConfig.axon.color,
  icon: <RefreshCw size={20} />,
  createButtonLabel: 'Sync Axon Bids',
  insightsContent: () => <AxonInsightsContent />,
  extraColumns: [
    {
      dataIndex: 'topCountryBid',
      title: 'Top Country Bid',
      width: 130,
      render: (_value, record) => {
        const bid = stableFloat(`${record.id}:top-country-bid`, 0.5, 2);
        return <span className="text-xs font-semibold text-[var(--text-primary)]">${bid.toFixed(2)}</span>;
      },
    },
    {
      dataIndex: 'recommendation',
      title: 'Recommendation',
      width: 130,
      render: (_value, record) => {
        const pick = stablePick(`${record.id}:recommendation`, AXON_RECOMMENDATION_OPTIONS);
        if (!pick) return <span className="text-[var(--text-tertiary)] text-xs">—</span>;
        const isUp = pick.startsWith('Increase');
        return (
          <Tag color={isUp ? 'success' : 'warning'} className="rounded-md font-semibold text-[10px]">
            {pick}
          </Tag>
        );
      },
    },
  ],
};
