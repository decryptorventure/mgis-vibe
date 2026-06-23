// meta-inline-adset-rows.tsx — compact adset table rendered inside campaign expand row
import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import type { AdSet, Campaign } from '@/shared/mock-data';
import { getMetricValue, formatMetricValue } from './meta-metric-helpers';

interface MetaInlineAdSetRowsProps {
  campaign: Campaign;
  adSets: AdSet[];
}

const COMPACT_COLUMNS: ColumnsType<AdSet> = [
  {
    title: 'Ad Set',
    key: 'name',
    width: 220,
    render: (_: unknown, record: AdSet) => (
      <span className="text-sm font-medium text_primary">{record.name}</span>
    ),
  },
  {
    title: 'Status',
    key: 'status',
    width: 110,
    render: (_: unknown, record: AdSet) => (
      <StatusBadge label={record.status} variant={statusToVariant(record.status)} />
    ),
  },
  {
    title: 'Budget',
    key: 'budget',
    width: 120,
    align: 'right' as const,
    render: (_: unknown, record: AdSet) => (
      <span className="text-xs">{formatMetricValue('budget', getMetricValue(record, 'budget'))}</span>
    ),
  },
  {
    title: 'Spent',
    key: 'amountSpent',
    width: 120,
    align: 'right' as const,
    render: (_: unknown, record: AdSet) => (
      <span className="text-xs">{formatMetricValue('amountSpent', getMetricValue(record, 'amountSpent'))}</span>
    ),
  },
  {
    title: 'ROAS',
    key: 'resultRoas',
    width: 100,
    align: 'right' as const,
    render: (_: unknown, record: AdSet) => (
      <span className="text-xs">{formatMetricValue('resultRoas', getMetricValue(record, 'resultRoas'))}</span>
    ),
  },
];

export const MetaInlineAdSetRows: React.FC<MetaInlineAdSetRowsProps> = ({ campaign, adSets }) => {
  const rows = adSets.filter(s => s.campaignId === campaign.id);

  if (rows.length === 0) {
    return (
      <div className="px-6 py-3 text-xs text_secondary italic">
        No ad sets for this campaign.
      </div>
    );
  }

  return (
    <div className="bg_secondary px-4 py-3 border-t border_secondary">
      <div className="text-[10px] font-bold text_tertiary uppercase tracking-wider mb-2">
        Ad Sets ({rows.length})
      </div>
      <Table<AdSet>
        columns={COMPACT_COLUMNS}
        dataSource={rows}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </div>
  );
};
