import React from 'react';
import { Table, Typography, Progress } from 'antd';
import { mockMetaPlacements } from '@/shared/mock-data';
import type { MetaPlacement } from '@/shared/mock-data';

const { Text } = Typography;

export const MetaPlacementTab: React.FC = () => {
  const data = mockMetaPlacements;
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);

  const columns = [
    {
      title: 'Placement',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MetaPlacement) => (
        <div>
          <Text strong>{text}</Text>
          <div className="text-xs text-[var(--text-tertiary)]">{record.platform} • {record.format}</div>
        </div>
      ),
    },
    {
      title: 'Spend Share',
      key: 'share',
      width: 150,
      render: (_: any, record: MetaPlacement) => {
        const percent = Math.round((record.spend / totalSpend) * 100);
        return (
          <div className="flex items-center gap-2">
            <Progress percent={percent} size="small" showInfo={false} className="m-0" />
            <Text className="text-xs">{percent}%</Text>
          </div>
        );
      },
    },
    {
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      render: (v: number) => `$${v.toLocaleString()}`,
      sorter: (a: MetaPlacement, b: MetaPlacement) => a.spend - b.spend,
    },
    {
      title: 'Installs',
      dataIndex: 'installs',
      key: 'installs',
      render: (v: number) => v.toLocaleString(),
      sorter: (a: MetaPlacement, b: MetaPlacement) => a.installs - b.installs,
    },
    {
      title: 'CPA',
      dataIndex: 'cpa',
      key: 'cpa',
      render: (v: number) => <Text className={v < 4.0 ? 'text-[var(--status-success)]' : ''}>${v.toFixed(2)}</Text>,
      sorter: (a: MetaPlacement, b: MetaPlacement) => a.cpa - b.cpa,
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (v: number) => `${v.toFixed(2)}%`,
    },
    {
      title: 'IPM',
      dataIndex: 'ipm',
      key: 'ipm',
      render: (v: number) => v.toFixed(2),
    },
  ];

  return (
    <div className="p-2">
      <div className="mb-4 bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-default)]">
        <h4 className="m-0 text-sm font-semibold mb-1">Advantage+ Placements Performance</h4>
        <p className="text-xs text-[var(--text-secondary)] m-0">
          The algorithm is currently prioritizing Instagram Feed and Facebook Feed based on efficiency.
        </p>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        pagination={false} 
        size="small"
        className="nms-table"
      />
    </div>
  );
};
