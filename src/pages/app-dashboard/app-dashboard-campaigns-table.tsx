// Campaign list table card for AppDashboard
import React from 'react';
import { Card, Table, Tag } from '@/components/ui-kit-compat';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { NETWORK_LOGOS } from '@/shared/network-config';
import type { Campaign } from '@/shared/mock-data';
import { NETWORK_COLORS, NETWORK_LABELS } from './use-app-dashboard';

interface Props {
  appCampaigns: Campaign[];
}

export const AppDashboardCampaignsTable: React.FC<Props> = ({ appCampaigns }) => (
  <Card
    className="rounded-xl overflow-hidden border-[var(--border-default)] bg-[var(--surface-base)]"
    title={<span className="font-semibold text-sm text-[var(--text-primary)]">Danh sách Chiến dịch ({appCampaigns.length})</span>}
    styles={{ body: { padding: 0 } }}
  >
    <Table
      className="nms-table"
      dataSource={appCampaigns}
      rowKey="id"
      pagination={false}
      size="middle"
      columns={[
        {
          title: 'CAMPAIGN NAME', dataIndex: 'name', key: 'name',
          render: (name: string, r: Campaign) => (
            <div>
              <div className="font-bold text-[13px] text-[var(--text-primary)]">{name}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5 select-all">ID: {r.id}</div>
            </div>
          ),
        },
        {
          title: 'NETWORK', dataIndex: 'network', key: 'network', width: 140,
          render: (net: string) => (
            <Tag color="blue" bordered={false}
              className="rounded font-semibold text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 py-0.5 px-2"
              style={{ backgroundColor: `${NETWORK_COLORS[net]}15`, color: NETWORK_COLORS[net] }}>
              <span className="w-3.5 h-3.5 rounded-full bg-[var(--surface-base)] p-0.5 flex items-center justify-center overflow-hidden border border-[var(--border-subtle)] shrink-0">
                <img src={NETWORK_LOGOS[net]} alt={net} className="w-full h-full object-contain" />
              </span>
              <span>{NETWORK_LABELS[net] || net}</span>
            </Tag>
          ),
        },
        {
          title: 'STATUS', dataIndex: 'status', key: 'status', width: 110,
          render: (status: string) => <StatusBadge label={status} variant={statusToVariant(status)} />,
        },
        { title: 'BUDGET', dataIndex: 'budget', key: 'budget', align: 'right', render: (v: number) => <span className="text-xs font-semibold text-[var(--text-secondary)]">${v.toLocaleString()}</span> },
        { title: 'SPEND', dataIndex: 'spend', key: 'spend', align: 'right', render: (v: number) => <span className="text-xs font-bold text-[var(--text-primary)]">${v.toLocaleString()}</span> },
        { title: 'INSTALLS', dataIndex: 'installs', key: 'installs', align: 'right', render: (v: number) => <span className="text-xs font-bold text-[var(--text-primary)]">{v.toLocaleString()}</span> },
        { title: 'ROAS', dataIndex: 'roas', key: 'roas', align: 'right', render: (v: number) => <span className="text-xs font-bold text-[var(--status-success)]">{v}x</span> },
      ]}
    />
  </Card>
);
