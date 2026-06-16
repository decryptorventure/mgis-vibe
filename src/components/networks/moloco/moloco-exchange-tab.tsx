import React from 'react';
import { Table, Typography, Switch, Tag, Tooltip } from 'antd';
import { ShieldAlert, Globe } from 'lucide-react';
import { mockMolocoExchangePerfs } from '@/shared/mock-data';
import type { MolocoExchangePerf } from '@/shared/mock-data';

const { Text } = Typography;

export const MolocoExchangeTab: React.FC = () => {
  const data = mockMolocoExchangePerfs;

  const columns = [
    {
      title: 'Exchange Name',
      dataIndex: 'name',
      key: 'name',
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: MolocoExchangePerf) => (
        <div className="flex items-center gap-2">
          <Switch size="small" checked={record.status === 'ENABLED'} />
          <Text className={`text-xs ${record.status === 'ENABLED' ? 'text-[var(--status-success)]' : 'text-[var(--text-tertiary)]'}`}>
            {record.status}
          </Text>
        </div>
      ),
    },
    {
      title: 'Traffic Share',
      dataIndex: 'trafficShare',
      key: 'trafficShare',
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden w-16">
            <div className="h-full bg-[var(--brand-primary)]" style={{ width: `${v}%` }} />
          </div>
          <span className="text-xs font-medium w-8">{v}%</span>
        </div>
      ),
      sorter: (a: MolocoExchangePerf, b: MolocoExchangePerf) => a.trafficShare - b.trafficShare,
    },
    {
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : `$${v.toLocaleString()}`,
      sorter: (a: MolocoExchangePerf, b: MolocoExchangePerf) => a.spend - b.spend,
    },
    {
      title: 'CPA',
      dataIndex: 'cpa',
      key: 'cpa',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : `$${v.toFixed(2)}`,
    },
    {
      title: 'Win Rate',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : `${v.toFixed(1)}%`,
    },
    {
      title: 'Avg Bid Price',
      dataIndex: 'avgBidPrice',
      key: 'avgBidPrice',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : `$${v.toFixed(4)}`,
    },
    {
      title: 'Fraud Score',
      dataIndex: 'fraudScore',
      key: 'fraudScore',
      render: (v: number) => {
        if (v === 0) return <Text type="secondary">—</Text>;
        const color = v > 4 ? 'error' : v > 2.5 ? 'warning' : 'success';
        return (
          <Tooltip title={`Higher score indicates higher probability of invalid traffic`}>
            <Tag color={color} className="m-0 text-[10px] flex items-center gap-1 w-fit">
              {v > 4 && <ShieldAlert size={10} />}
              {v.toFixed(1)}
            </Tag>
          </Tooltip>
        );
      },
      sorter: (a: MolocoExchangePerf, b: MolocoExchangePerf) => a.fraudScore - b.fraudScore,
    },
  ];

  return (
    <div className="p-2">
      <div className="mb-4 bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-default)] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--status-info-bg)] text-[var(--status-info)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--status-info-border)]">
          <Globe size={18} />
        </div>
        <div>
          <h4 className="m-0 text-sm font-semibold mb-1">Exchange & Inventory Targeting</h4>
          <p className="text-xs text-[var(--text-secondary)] m-0">
            Control which programmatic exchanges your ads run on. Disabling top exchanges may severely limit your campaign's ability to scale.
          </p>
        </div>
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
