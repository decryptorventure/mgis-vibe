import React from 'react';
import type { Campaign } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// BudgetPacingBar — horizontal progress bar per network showing spend vs budget.
// Status: < 80% → On Track (green), 80-100% → At Risk (yellow), > 100% → Overspent (red)
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetPacingBarProps {
  campaigns: Campaign[];
}

interface NetworkPacing {
  network: string;
  spend: number;
  budget: number;
  pct: number;
  status: 'on-track' | 'at-risk' | 'overspent';
}

const NETWORK_LABELS: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta':       'Meta',
  'asa':        'Apple Search Ads',
  'axon':       'Axon / AppLovin',
  'moloco':     'Moloco',
};

const STATUS_CONFIG = {
  'on-track':  { label: 'On Track',  barColor: 'var(--status-success)', badgeBg: 'var(--status-success-bg)', badgeText: 'var(--status-success)', badgeBorder: 'var(--status-success-border)' },
  'at-risk':   { label: 'At Risk',   barColor: 'var(--status-warning)', badgeBg: 'var(--status-warning-bg)', badgeText: 'var(--status-warning)', badgeBorder: 'var(--status-warning-border)' },
  'overspent': { label: 'Overspent', barColor: 'var(--status-error)',   badgeBg: 'var(--status-error-bg)',   badgeText: 'var(--status-error)',   badgeBorder: 'var(--status-error-border)' },
};

function buildPacingRows(campaigns: Campaign[]): NetworkPacing[] {
  const map: Record<string, { spend: number; budget: number }> = {};

  for (const c of campaigns) {
    if (!map[c.network]) map[c.network] = { spend: 0, budget: 0 };
    map[c.network].spend  += c.spend;
    map[c.network].budget += c.budget;
  }

  return Object.entries(map).map(([network, agg]) => {
    const pct = agg.budget > 0 ? (agg.spend / agg.budget) * 100 : 0;
    const status: NetworkPacing['status'] =
      pct > 100 ? 'overspent' : pct >= 80 ? 'at-risk' : 'on-track';
    return { network, spend: agg.spend, budget: agg.budget, pct, status };
  });
}

function fmtK(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

export const BudgetPacingBar: React.FC<BudgetPacingBarProps> = ({ campaigns }) => {
  const rows = buildPacingRows(campaigns);

  if (rows.length === 0) {
    return <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No pacing data.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const cfg = STATUS_CONFIG[row.status];
        const clampedPct = Math.min(row.pct, 100);

        return (
          <div key={row.network} className="flex flex-col gap-1">
            {/* Label row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {NETWORK_LABELS[row.network] ?? row.network}
                </span>
                {/* Status badge */}
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: cfg.badgeBg,
                    color: cfg.badgeText,
                    border: `1px solid ${cfg.badgeBorder}`,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  {fmtK(row.spend)} / {fmtK(row.budget)}
                </span>
                <span
                  className="text-[12px] font-bold w-12 text-right"
                  style={{ color: cfg.barColor }}
                >
                  {row.pct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress bar track */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-default)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${clampedPct}%`, background: cfg.barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetPacingBar;
