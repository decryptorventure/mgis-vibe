import React from 'react';
import { Badge } from 'antd';
import type { Campaign } from '@/shared/mock-data';
import { networkConfig } from '@/shared/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// NetworkComparisonCards — one compact card per network with brand-color border.
// Best ROAS badge shown on top-performing network.
// ─────────────────────────────────────────────────────────────────────────────

interface NetworkComparisonCardsProps {
  campaigns: Campaign[];
}

interface NetworkRow {
  network: string;
  spend: number;
  installs: number;
  cpa: number;
  roas: number;
}

function buildNetworkRows(campaigns: Campaign[]): NetworkRow[] {
  const map: Record<string, { spend: number; installs: number; weightedRoas: number }> = {};

  for (const c of campaigns) {
    if (!map[c.network]) map[c.network] = { spend: 0, installs: 0, weightedRoas: 0 };
    map[c.network].spend += c.spend;
    map[c.network].installs += c.installs;
    map[c.network].weightedRoas += c.roas * c.spend;
  }

  return Object.entries(map).map(([network, agg]) => ({
    network,
    spend: agg.spend,
    installs: agg.installs,
    cpa: agg.installs > 0 ? agg.spend / agg.installs : 0,
    roas: agg.spend > 0 ? agg.weightedRoas / agg.spend : 0,
  }));
}

export const NetworkComparisonCards: React.FC<NetworkComparisonCardsProps> = ({ campaigns }) => {
  const rows = buildNetworkRows(campaigns);
  const bestRoasNetwork = rows.reduce(
    (best, r) => (r.roas > best.roas ? r : best),
    rows[0] ?? { network: '', roas: 0 },
  ).network;

  if (rows.length === 0) {
    return (
      <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No network data available.</p>
    );
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
      {rows.map((row) => {
        const config = networkConfig[row.network as keyof typeof networkConfig];
        const color = config?.color ?? 'var(--text-tertiary)';
        const label = config?.label ?? row.network;
        const isBest = row.network === bestRoasNetwork;

        return (
          <div
            key={row.network}
            className="rounded-lg p-3 flex flex-col gap-2 relative"
            style={{
              background: 'var(--surface-base)',
              border: '1px solid var(--border-default)',
              borderLeft: `4px solid ${color}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-1">
              <span
                className="text-[12px] font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {label}
              </span>
              {isBest && (
                <Badge
                  count="Best ROAS"
                  style={{
                    backgroundColor: 'var(--status-success-bg)',
                    color: 'var(--status-success)',
                    border: '1px solid var(--status-success-border)',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '0 5px',
                    borderRadius: 6,
                    lineHeight: '18px',
                    height: 18,
                    flexShrink: 0,
                  }}
                />
              )}
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <Metric label="Spend" value={`$${(row.spend / 1000).toFixed(1)}k`} />
              <Metric label="Installs" value={row.installs.toLocaleString()} />
              <Metric label="CPA" value={`$${row.cpa.toFixed(2)}`} />
              <Metric label="ROAS" value={`${row.roas.toFixed(2)}x`} accent={color} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Small label+value pair used inside each card
const Metric: React.FC<{ label: string; value: string; accent?: string }> = ({
  label,
  value,
  accent,
}) => (
  <div>
    <div className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
      {label}
    </div>
    <div
      className="text-[13px] font-semibold leading-tight"
      style={{ color: accent ?? 'var(--text-primary)' }}
    >
      {value}
    </div>
  </div>
);

export default NetworkComparisonCards;
