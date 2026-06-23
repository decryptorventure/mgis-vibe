import React from 'react';
import { DollarSign, Download, Target, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import type { Campaign } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// FunnelKpiStrip — 4-card horizontal strip showing top-level funnel metrics.
// Trend values are hardcoded mock deltas (no real time-series in mock data).
// ─────────────────────────────────────────────────────────────────────────────

interface FunnelKpiStripProps {
  campaigns: Campaign[];
}

export const FunnelKpiStrip: React.FC<FunnelKpiStripProps> = ({ campaigns }) => {
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalInstalls = campaigns.reduce((s, c) => s + c.installs, 0);
  const avgCpa = totalInstalls > 0 ? totalSpend / totalInstalls : 0;

  // ROAS: weighted average by spend
  const totalWeightedRoas = campaigns.reduce((s, c) => s + c.roas * c.spend, 0);
  const avgRoas = totalSpend > 0 ? totalWeightedRoas / totalSpend : 0;

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
    >
      <StatCard
        title="Total Spend"
        value={fmt(totalSpend)}
        icon={<DollarSign size={14} />}
        variant="primary"
        trend={{ value: 8.3, label: 'vs last period' }}
      />
      <StatCard
        title="Total Installs"
        value={totalInstalls.toLocaleString()}
        icon={<Download size={14} />}
        variant="success"
        trend={{ value: 12.1, label: 'vs last period' }}
      />
      <StatCard
        title="Avg CPA"
        value={`$${avgCpa.toFixed(2)}`}
        icon={<Target size={14} />}
        variant="warning"
        trend={{ value: -4.7, label: 'vs last period', positiveIsGood: false }}
      />
      <StatCard
        title="Avg ROAS"
        value={`${avgRoas.toFixed(2)}x`}
        icon={<TrendingUp size={14} />}
        variant="info"
        trend={{ value: 5.9, label: 'vs last period' }}
      />
    </div>
  );
};

export default FunnelKpiStrip;
