import React from 'react';
import { PieChart } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SplitMetricsPivotTable } from '@/components/analytics/split-metrics-pivot-table';
import { mockCampaigns } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// SplitMetricsPage — full pivot-table view for cross-network metric comparison.
// ─────────────────────────────────────────────────────────────────────────────

interface SplitMetricsPageProps {
  hideHeader?: boolean;
}

const SplitMetricsPage: React.FC<SplitMetricsPageProps> = ({ hideHeader }) => (
  <div className="flex flex-col gap-5">
    {!hideHeader && (
      <PageHeader
        icon={<PieChart size={20} />}
        iconBg="var(--chart-4)"
        title="Split Metrics"
        subtitle="Pivot table for cross-network metric comparison"
      />
    )}
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)' }}
    >
      <SplitMetricsPivotTable campaigns={mockCampaigns} />
    </div>
  </div>
);

export default SplitMetricsPage;
