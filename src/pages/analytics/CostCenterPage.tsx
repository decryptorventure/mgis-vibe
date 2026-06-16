import React, { useState } from 'react';
import { Table, Select, DatePicker, Card } from 'antd';
import { DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { mockCampaigns } from '@/shared/mock-data';
import type { Campaign } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// CostCenterPage — spend / budget pacing grouped by cost center × network.
// Filter bar: network select + date range (display only, no real filtering).
// ─────────────────────────────────────────────────────────────────────────────

interface CostCenterRow {
  key: string;
  center: string;
  network: string;
  spend: number;
  budget: number;
  pct: number;
  status: 'on-track' | 'at-risk' | 'overspent';
}

const NETWORK_LABELS: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta':       'Meta',
  'asa':        'Apple Search Ads',
  'axon':       'Axon / AppLovin',
  'moloco':     'Moloco',
};

const STATUS_CONFIG = {
  'on-track':  { label: 'On Track',  bg: 'var(--status-success-bg)', color: 'var(--status-success)', border: 'var(--status-success-border)' },
  'at-risk':   { label: 'At Risk',   bg: 'var(--status-warning-bg)', color: 'var(--status-warning)', border: 'var(--status-warning-border)' },
  'overspent': { label: 'Overspent', bg: 'var(--status-error-bg)',   color: 'var(--status-error)',   border: 'var(--status-error-border)' },
};

function buildRows(campaigns: Campaign[], networkFilter: string): CostCenterRow[] {
  const map: Record<string, { spend: number; budget: number }> = {};

  for (const c of campaigns) {
    if (networkFilter !== 'all' && c.network !== networkFilter) continue;
    const center = c.costCenter ?? 'Unassigned';
    const key = `${center}__${c.network}`;
    if (!map[key]) map[key] = { spend: 0, budget: 0 };
    map[key].spend  += c.spend;
    map[key].budget += c.budget;
  }

  return Object.entries(map).map(([key, agg]) => {
    const [center, network] = key.split('__');
    const pct = agg.budget > 0 ? (agg.spend / agg.budget) * 100 : 0;
    const status: CostCenterRow['status'] =
      pct > 100 ? 'overspent' : pct >= 80 ? 'at-risk' : 'on-track';
    return { key, center, network, spend: agg.spend, budget: agg.budget, pct, status };
  }).sort((a, b) => a.center.localeCompare(b.center) || a.network.localeCompare(b.network));
}

function fmtK(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

const NETWORK_OPTIONS = [
  { value: 'all', label: 'All Networks' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'meta',       label: 'Meta' },
  { value: 'asa',        label: 'Apple Search Ads' },
  { value: 'axon',       label: 'Axon / AppLovin' },
  { value: 'moloco',     label: 'Moloco' },
];

interface CostCenterPageProps {
  hideHeader?: boolean;
}

const CostCenterPage: React.FC<CostCenterPageProps> = ({ hideHeader }) => {
  const [networkFilter, setNetworkFilter] = useState('all');

  const rows = buildRows(mockCampaigns, networkFilter);
  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);

  const columns = [
    {
      title: 'Cost Center',
      dataIndex: 'center',
      key: 'center',
      render: (v: string) => (
        <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{v}</span>
      ),
    },
    {
      title: 'Network',
      dataIndex: 'network',
      key: 'network',
      render: (v: string) => (
        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          {NETWORK_LABELS[v] ?? v}
        </span>
      ),
    },
    {
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      align: 'right' as const,
      render: (v: number) => (
        <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{fmtK(v)}</span>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      align: 'right' as const,
      render: (v: number) => (
        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{fmtK(v)}</span>
      ),
    },
    {
      title: '% Used',
      dataIndex: 'pct',
      key: 'pct',
      align: 'right' as const,
      render: (v: number) => (
        <span className="font-semibold text-[12px]" style={{ color: 'var(--text-primary)' }}>
          {v.toFixed(1)}%
        </span>
      ),
    },
    {
      title: 'Pacing Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: CostCenterRow['status']) => {
        const cfg = STATUS_CONFIG[v];
        return (
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {!hideHeader && (
        <PageHeader
          icon={<DollarSign size={20} />}
          iconBg="var(--color-primary-500)"
          title="Cost Center"
          subtitle="Budget pacing and spend allocation by cost center"
        />
      )}

      {/* Filter bar */}
      <Card
        className="rounded-xl"
        styles={{ body: { padding: '12px 16px' } }}
        style={{ border: '1px solid var(--border-default)', background: 'var(--surface-base)' }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Network
            </span>
            <Select
              value={networkFilter}
              onChange={setNetworkFilter}
              options={NETWORK_OPTIONS}
              size="small"
              style={{ width: 160 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Date Range
            </span>
            <DatePicker.RangePicker size="small" style={{ width: 220 }} />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card
        className="rounded-xl"
        styles={{ body: { padding: 0 } }}
        style={{ border: '1px solid var(--border-default)', background: 'var(--surface-base)' }}
      >
        <Table
          className="nms-table"
          dataSource={rows}
          columns={columns}
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                <span className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  Total
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <span className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  {fmtK(totalSpend)}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} colSpan={3} />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
};

export default CostCenterPage;
