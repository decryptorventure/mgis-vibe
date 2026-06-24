// Task 2 — Last synced / data freshness indicator for network data sources
import React from 'react';
import { Tooltip } from 'antd';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@frontend-team/ui-kit';

interface Props {
  /** ISO timestamp or localeString of last sync */
  lastSyncedAt: string;
  /** Human-readable name of data source (e.g. "Axon API", "Google Ads API") */
  sourceName: string;
  /** Minutes before data is considered stale (default 60) */
  staleThresholdMinutes?: number;
  /** Minutes before showing a critical warning (default 240) */
  criticalThresholdMinutes?: number;
  /** Optional manual sync cadence label, shown in tooltip */
  syncCadence?: string;
  /** Show inline or as a compact badge */
  variant?: 'inline' | 'badge';
  onSync?: () => void;
}

function minutesAgo(ts: string): number {
  const parsed = new Date(ts);
  if (isNaN(parsed.getTime())) return 0;
  return Math.floor((Date.now() - parsed.getTime()) / 60_000);
}

function formatAgo(mins: number): string {
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

export const DataFreshnessIndicator: React.FC<Props> = ({
  lastSyncedAt,
  sourceName,
  staleThresholdMinutes = 60,
  criticalThresholdMinutes = 240,
  syncCadence = 'Every 1 hour',
  variant = 'inline',
  onSync,
}) => {
  const mins = minutesAgo(lastSyncedAt);
  const isStale = mins >= staleThresholdMinutes;
  const isCritical = mins >= criticalThresholdMinutes;

  const color = isCritical ? 'text-[var(--status-error)]' : isStale ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]';
  const bg = isCritical ? 'bg-[var(--status-error-bg)] border-[var(--status-error-border)]' : isStale ? 'bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]' : 'bg-[var(--status-success-bg)] border-[var(--status-success-border)]';
  const Icon = isCritical ? AlertTriangle : isStale ? AlertTriangle : CheckCircle2;

  const tooltipContent = (
    <div className="text-xs space-y-1 max-w-[220px]">
      <div className="font-semibold">{sourceName}</div>
      <div>Last synced: <span className="font-mono">{lastSyncedAt}</span></div>
      <div>Cadence: {syncCadence}</div>
      {isStale && <div className="text-amber-300">Data may be stale — refresh before acting.</div>}
    </div>
  );

  if (variant === 'badge') {
    return (
      <Tooltip title={tooltipContent}>
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 radius_6 border text-[11px] font-semibold cursor-help', bg, color)}>
          <Icon size={11} />
          {formatAgo(mins)}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipContent}>
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 radius_8 border text-xs font-medium cursor-help',
        bg, color
      )}>
        <Icon size={13} />
        <span className="text_secondary">
          <span className="font-semibold">{sourceName}</span>
          {' '}synced {formatAgo(mins)}
        </span>
        {isStale && <span className={cn('font-semibold', color)}>· Data may be stale</span>}
        {onSync && (
          <button type="button" onClick={e => { e.stopPropagation(); onSync(); }}
            className="ml-1 inline-flex items-center gap-1 hover:underline text-[11px] bg-transparent border-0 cursor-pointer text_tertiary hover:text_primary">
            <RefreshCw size={11} />Sync
          </button>
        )}
        <Clock size={11} className="ml-auto text_tertiary" />
      </div>
    </Tooltip>
  );
};
