import React from 'react';
import { Card, Badge } from '@/components/ui-kit-compat';
import { DataTable } from '@/components/ui';
import { Trophy } from 'lucide-react';

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="w-6 h-6 rounded-full bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning)] flex items-center justify-center mx-auto">
        <Trophy size={11} className="fill-[var(--status-warning)] text-[var(--status-warning)]" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-6 h-6 rounded-full bg-[var(--surface-muted)] border border-[var(--border-default)] text-[var(--text-secondary)] flex items-center justify-center mx-auto">
        <Trophy size={11} className="fill-[var(--text-tertiary)] text-[var(--text-tertiary)]" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-6 h-6 rounded-full bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--text-primary)] flex items-center justify-center mx-auto">
        <Trophy size={11} className="fill-[var(--status-warning)] text-[var(--status-warning)]" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] flex items-center justify-center font-semibold text-[11px] mx-auto">
      {rank}
    </div>
  );
};

interface DashboardLeaderboardProps {
  filteredRankData: any[];
  selectedUserFilter: string | null;
  handleUserRowClick: (userName: string) => void;
}

export const DashboardLeaderboard: React.FC<DashboardLeaderboardProps> = ({
  filteredRankData,
  selectedUserFilter,
  handleUserRowClick,
}) => {
  return (
    <Card
      className="rounded-xl border-[var(--border-default)]"
      title={
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-[var(--status-warning)]" />
          <span className="font-semibold text-[var(--text-primary)] text-sm">Top 10 Users Leaderboard</span>
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      <DataTable
        dataSource={filteredRankData}
        rowKey="hash"
        pagination={false}
        size="middle"
        onRow={(record) => ({
          onClick: () => handleUserRowClick(record.name),
          className: 'cursor-pointer hover:bg-[var(--surface-muted)] transition-colors',
        })}
        columns={[
          {
            title: 'RANK',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            align: 'center',
            render: (r: number) => <RankBadge rank={r} />,
          },
          {
            title: 'USER',
            key: 'user',
            render: (_, record) => (
              <div className={selectedUserFilter === record.name ? 'text-[var(--text-primary)] font-bold' : ''}>
                <div className="font-semibold text-[13px] leading-tight flex items-center gap-1">
                  {record.name}
                  {selectedUserFilter === record.name && <Badge status="processing" />}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5 leading-none">
                  {record.hash.substring(0, 18)}...
                </div>
              </div>
            ),
          },
          {
            title: 'TOTAL',
            dataIndex: 'total',
            key: 'total',
            align: 'right',
            render: (v: number) => (
              <span className="font-semibold text-[var(--text-primary)]">{v.toLocaleString()}</span>
            ),
          },
          {
            title: 'CREATE',
            dataIndex: 'create',
            key: 'create',
            align: 'right',
            render: (v: number) => (
              <span className="text-[var(--text-secondary)] text-xs font-medium">{v.toLocaleString()}</span>
            ),
          },
          {
            title: 'UPDATE',
            dataIndex: 'update',
            key: 'update',
            align: 'right',
            render: (v: number) => (
              <span className="text-[var(--text-secondary)] text-xs font-medium">{v.toLocaleString()}</span>
            ),
          },
          {
            title: 'PAUSE',
            dataIndex: 'pause',
            key: 'pause',
            align: 'right',
            render: (v: number) => (
              <span className="text-[var(--text-secondary)] text-xs font-medium">{v.toLocaleString()}</span>
            ),
          },
          {
            title: 'DELETE',
            dataIndex: 'delete',
            key: 'delete',
            align: 'right',
            render: (v: number) => (
              <span className="text-[var(--text-secondary)] text-xs font-medium">{v.toLocaleString()}</span>
            ),
          },
          {
            title: 'SUCCESS RATE',
            dataIndex: 'successRate',
            key: 'success',
            width: 180,
            render: (rate: number) => (
              <div className="flex items-center justify-end gap-3">
                <span className="text-xs font-semibold text-[var(--text-secondary)] leading-none">{rate}%</span>
                <div className="w-16 h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full bg-[var(--status-success)] rounded-full" style={{ width: `${rate}%` }} />
                </div>
              </div>
            ),
          },
        ]}
        emptyTitle="No leaderboard data"
        emptyDescription="No operator activity matches the current filters."
      />
    </Card>
  );
};
