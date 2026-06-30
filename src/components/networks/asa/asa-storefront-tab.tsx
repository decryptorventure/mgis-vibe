import React from 'react';
import { Table, Tag, Typography, Switch } from '@/components/ui-kit-compat';
import { Globe } from 'lucide-react';
import { mockAsaStorefronts } from '@/shared/mock-data';
import type { AsaStorefront } from '@/shared/mock-data';

const { Text } = Typography;

export const AsaStorefrontTab: React.FC = () => {
  const data = mockAsaStorefronts;

  const columns = [
    {
      title: 'Storefront',
      dataIndex: 'countryName',
      key: 'countryName',
      render: (text: string, record: AsaStorefront) => (
        <div className="flex items-center gap-2">
          <span className="text-xl" title={record.countryCode}>{record.flag}</span>
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: AsaStorefront) => (
        <div className="flex items-center gap-2">
          <Switch 
            size="small" 
            checked={record.status === 'ACTIVE'} 
            disabled={record.status === 'NOT_CONFIGURED'} 
          />
          <span className={`text-xs ${record.status === 'ACTIVE' ? 'text-[var(--status-success)]' : 'text-[var(--text-tertiary)]'}`}>
            {record.status === 'NOT_CONFIGURED' ? 'Unconfigured' : record.status}
          </span>
        </div>
      ),
    },
    {
      title: 'Campaigns',
      dataIndex: 'campaigns',
      key: 'campaigns',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : <Tag>{v}</Tag>,
    },
    {
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : `$${v.toLocaleString()}`,
      sorter: (a: AsaStorefront, b: AsaStorefront) => a.spend - b.spend,
    },
    {
      title: 'Installs',
      dataIndex: 'installs',
      key: 'installs',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : v.toLocaleString(),
      sorter: (a: AsaStorefront, b: AsaStorefront) => a.installs - b.installs,
    },
    {
      title: 'CPA',
      dataIndex: 'cpa',
      key: 'cpa',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : `$${v.toFixed(2)}`,
    },
    {
      title: 'TTR',
      dataIndex: 'ttr',
      key: 'ttr',
      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : `${v.toFixed(1)}%`,
    },
  ];

  return (
    <div className="p-2">
      <div className="mb-4 bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-default)] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0 mt-0.5">
          <Globe size={18} />
        </div>
        <div>
          <h4 className="m-0 text-sm font-semibold mb-1">Global Storefront Manager</h4>
          <p className="text-xs text-[var(--text-secondary)] m-0 max-w-2xl">
            Apple Search Ads campaigns are localized by App Store region. Use this manager to control active storefronts and compare regional performance for your app.
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
