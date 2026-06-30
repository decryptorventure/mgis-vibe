import React from 'react';
import { Card, Input } from '@/components/ui-kit-compat';
import { DataTable } from '@/components/ui';
import { Clock, Search } from 'lucide-react';

interface DashboardLogsProps {
  filteredLogs: any[];
  logSearchQuery: string;
  setLogSearchQuery: (val: string) => void;
}

export const DashboardLogs: React.FC<DashboardLogsProps> = ({
  filteredLogs,
  logSearchQuery,
  setLogSearchQuery,
}) => {
  return (
    <Card
      className="rounded-xl border-[var(--border-default)]"
      title={
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-primary-500" />
            <span className="font-semibold text-[var(--text-primary)] text-sm">Recent Activity Logs</span>
          </div>
          <Input
            placeholder="Search by campaign name or Account ID..."
            value={logSearchQuery}
            onChange={(e) => setLogSearchQuery(e.target.value)}
            prefix={<Search size={14} className="text-[var(--text-tertiary)]" />}
            className="w-64 rounded-lg font-normal"
            size="middle"
            allowClear
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      <DataTable
        dataSource={filteredLogs}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: false, size: 'small' }}
        size="middle"
        columns={[
          {
            title: 'CAMPAIGN NAME',
            dataIndex: 'campaign',
            key: 'campaign',
            render: (text: string) => {
              const isMediaFile = text.endsWith('.mp4') || text.endsWith('.png');
              return (
                <span
                  className={`font-semibold text-[13px] ${isMediaFile ? 'text-[var(--text-secondary)] font-mono' : 'text-[var(--text-primary)]'}`}
                >
                  {text}
                </span>
              );
            },
          },
          {
            title: 'PLATFORM',
            dataIndex: 'platform',
            key: 'platform',
            width: 110,
            render: (text: string) => (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info-border)] tracking-wider">
                {text}
              </span>
            ),
          },
          {
            title: 'ACTION',
            dataIndex: 'action',
            key: 'action',
            width: 120,
            render: (text: string) => (
              <span className="font-semibold text-xs text-[var(--text-secondary)] tracking-wide">{text}</span>
            ),
          },
          {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (text: string) => (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-success)] bg-[var(--status-success-bg)] px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
                {text}
              </span>
            ),
          },
          {
            title: 'ACCOUNT ID',
            dataIndex: 'accountId',
            key: 'accountId',
            render: (text: string) => (
              <span className="font-mono text-[var(--text-secondary)] text-xs">{text}</span>
            ),
          },
          {
            title: 'CAMPAIGN ID',
            dataIndex: 'campaignId',
            key: 'campaignId',
            render: (text: string) => (
              <span className="font-mono text-[var(--text-tertiary)] text-xs">{text}</span>
            ),
          },
          {
            title: 'TIME',
            dataIndex: 'time',
            key: 'time',
            width: 160,
            align: 'right',
            render: (text: string) => (
              <span className="text-[var(--text-secondary)] text-xs font-medium">{text}</span>
            ),
          },
        ]}
        emptyTitle="No activity logs"
        emptyDescription="No recent activity logs match the current filters."
      />
    </Card>
  );
};
