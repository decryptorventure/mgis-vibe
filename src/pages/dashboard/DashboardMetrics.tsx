import React from 'react';
import { Card, Badge } from '@/components/ui-kit-compat';
import { StatCard } from '@/components/ui/StatCard';
import { Users, Activity, Trophy, TrendingUp, Sparkles } from 'lucide-react';

interface DashboardMetricsProps {
  metrics: {
    totalUsers: number;
    avgActions: number | string;
    mostActive: string;
    mostActiveCount: number;
    successRate: number;
  };
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={<Users size={14} />}
          variant="info"
        />
        <StatCard
          title="Avg Actions / User"
          value={metrics.avgActions}
          icon={<Activity size={14} />}
          variant="primary"
        />
        <StatCard
          title="Most Active Operator"
          value={`${metrics.mostActive} (${metrics.mostActiveCount.toLocaleString()})`}
          icon={<Trophy size={14} />}
          variant="warning"
        />
        <StatCard
          title="System Success Rate"
          value={`${metrics.successRate}%`}
          icon={<TrendingUp size={14} />}
          variant="success"
        />
      </div>

      <Card 
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-muted)]/50" 
        styles={{ body: { padding: '16px' } }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary-500" />
          <span className="font-semibold text-[var(--text-primary)] text-sm">Optimization Suggestions & System Alerts</span>
          <Badge status="processing" text="Real-time Insights" className="text-[10px] text-[var(--text-tertiary)] ml-1" />
        </div>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 text-xs text-[var(--text-secondary)] bg-[var(--surface-base)] p-3 rounded-lg border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-default)]">
            <span className="px-2.5 py-0.5 rounded bg-[var(--status-success-bg)] text-[var(--status-success)] font-semibold flex-shrink-0 text-[10px] tracking-wide uppercase">Optimize</span>
            <span className="leading-relaxed">
              Chiến dịch <strong className="text-[var(--text-primary)] font-medium">Meta_US_LAL_Install</strong> đạt hiệu quả cao (ROAS <strong className="text-[var(--status-success)] font-semibold">4.1x</strong>). Đề xuất tăng ngân sách thêm <strong className="text-primary-500 font-semibold">15%</strong> để tối đa hóa lượt chuyển đổi.
            </span>
          </div>
          <div className="flex items-start gap-3 text-xs text-[var(--text-secondary)] bg-[var(--surface-base)] p-3 rounded-lg border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-default)]">
            <span className="px-2.5 py-0.5 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)] font-semibold flex-shrink-0 text-[10px] tracking-wide uppercase">Security</span>
            <span className="leading-relaxed">
              Khóa API của <strong className="text-[var(--text-primary)] font-medium">Apple Search Ads</strong> sẽ hết hạn trong <strong className="text-[var(--status-warning)] font-semibold">11 ngày</strong> nữa. Vui lòng cập nhật thông tin trong phần quản lý khóa để tránh gián đoạn đồng bộ chiến dịch.
            </span>
          </div>
          <div className="flex items-start gap-3 text-xs text-[var(--text-secondary)] bg-[var(--surface-base)] p-3 rounded-lg border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-default)]">
            <span className="px-2.5 py-0.5 rounded bg-[var(--status-info-bg)] text-[var(--status-info)] font-semibold flex-shrink-0 text-[10px] tracking-wide uppercase">Trend</span>
            <span className="leading-relaxed">
              Số lượng chiến dịch tạo mới đạt đỉnh trong tháng 5, chủ yếu tập trung trên nền tảng <strong className="text-[var(--status-info)] font-semibold">META</strong>.
            </span>
          </div>
        </div>
      </Card>
    </>
  );
};
