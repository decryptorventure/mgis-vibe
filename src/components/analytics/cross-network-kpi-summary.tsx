// ─── CrossNetworkKpiSummary — aggregated KPI strip across all networks ───────
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiItem {
  label: string;
  value: string;
  delta: number;
  positiveIsGood?: boolean;
}

interface CrossNetworkKpiSummaryProps {
  items?: KpiItem[];
}

const DEFAULT_ITEMS: KpiItem[] = [
  { label: 'Total Spend', value: '$124,830', delta: 8.2 },
  { label: 'Total Installs', value: '48,291', delta: 12.4 },
  { label: 'Avg ROAS', value: '2.41x', delta: -3.1 },
  { label: 'Avg CPA', value: '$2.58', delta: -6.7, positiveIsGood: false },
];

const DeltaBadge: React.FC<{ delta: number; positiveIsGood?: boolean }> = ({
  delta,
  positiveIsGood = true,
}) => {
  const isPositive = delta > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className="flex items-center gap-0.5 text-[10px] font-semibold"
      style={{ color: isGood ? 'var(--status-success)' : 'var(--status-error)' }}
    >
      <Icon size={10} />
      {isPositive ? '+' : ''}{delta.toFixed(1)}%
    </span>
  );
};

export const CrossNetworkKpiSummary: React.FC<CrossNetworkKpiSummaryProps> = ({
  items = DEFAULT_ITEMS,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {items.map(item => (
      <div
        key={item.label}
        className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-default)] px-5 py-4"
      >
        <div className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1">{item.label}</div>
        <div className="text-xl font-bold text-[var(--text-primary)] leading-none mb-1.5">
          {item.value}
        </div>
        <DeltaBadge delta={item.delta} positiveIsGood={item.positiveIsGood} />
      </div>
    ))}
  </div>
);
