// ─── NetworkPerformanceBreakdownTable — sortable cross-network metrics table ─
import React, { useState } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType, SortOrder } from 'antd/es/table/interface';

interface NetworkRow {
  key: string;
  network: string;
  networkColor: string;
  spend: number;
  installs: number;
  roas: number;
  cpa: number;
  impressions: number;
  clicks: number;
}

const MOCK_DATA: NetworkRow[] = [
  { key: 'google-ads', network: 'Google Ads', networkColor: 'orange', spend: 42300, installs: 18200, roas: 2.8, cpa: 2.32, impressions: 1240000, clicks: 54000 },
  { key: 'meta', network: 'Meta', networkColor: 'blue', spend: 35100, installs: 14600, roas: 2.2, cpa: 2.40, impressions: 980000, clicks: 41000 },
  { key: 'asa', network: 'ASA', networkColor: 'purple', spend: 18200, installs: 8900, roas: 2.6, cpa: 2.04, impressions: 420000, clicks: 22000 },
  { key: 'axon', network: 'Axon', networkColor: 'magenta', spend: 16100, installs: 4900, roas: 2.1, cpa: 3.28, impressions: 510000, clicks: 18000 },
  { key: 'moloco', network: 'Moloco', networkColor: 'pink', spend: 13130, installs: 1691, roas: 2.4, cpa: 7.76, impressions: 340000, clicks: 11000 },
];

const fmt$ = (v: number) => `$${v.toLocaleString()}`;
const fmtN = (v: number) => v.toLocaleString();

export const NetworkPerformanceBreakdownTable: React.FC<{ appFilter?: string }> = () => {
  const [sortField, setSortField] = useState<keyof NetworkRow>('spend');
  const [sortOrder, setSortOrder] = useState<SortOrder>('descend');

  const handleChange = (_: unknown, __: unknown, sorter: unknown) => {
    const s = sorter as { field?: keyof NetworkRow; order?: SortOrder };
    if (s.field) { setSortField(s.field); setSortOrder(s.order ?? 'descend'); }
  };

  const columns: ColumnsType<NetworkRow> = [
    {
      title: 'Network',
      dataIndex: 'network',
      key: 'network',
      render: (name: string, r: NetworkRow) => (
        <Tag color={r.networkColor} bordered={false} className="font-bold text-[11px] rounded">
          {name}
        </Tag>
      ),
    },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', sorter: true, sortOrder: sortField === 'spend' ? sortOrder : null, render: fmt$ },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', sorter: true, sortOrder: sortField === 'installs' ? sortOrder : null, render: fmtN },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', sorter: true, sortOrder: sortField === 'roas' ? sortOrder : null, render: (v: number) => `${v.toFixed(1)}x` },
    { title: 'CPA', dataIndex: 'cpa', key: 'cpa', sorter: true, sortOrder: sortField === 'cpa' ? sortOrder : null, render: (v: number) => `$${v.toFixed(2)}` },
    { title: 'Impressions', dataIndex: 'impressions', key: 'impressions', sorter: true, sortOrder: sortField === 'impressions' ? sortOrder : null, render: fmtN },
    { title: 'Clicks', dataIndex: 'clicks', key: 'clicks', sorter: true, sortOrder: sortField === 'clicks' ? sortOrder : null, render: fmtN },
  ];

  const sorted = [...MOCK_DATA].sort((a, b) => {
    const dir = sortOrder === 'ascend' ? 1 : -1;
    return ((a[sortField] as number) - (b[sortField] as number)) * dir;
  });

  return (
    <Table<NetworkRow>
      className="nms-table"
      columns={columns}
      dataSource={sorted}
      pagination={false}
      size="middle"
      onChange={handleChange}
    />
  );
};
