// Axon shared UI primitives — PanelTitle, RecommendationBadge, SelectTile, BuilderSection
import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, cn } from '@frontend-team/ui-kit';
import type { AxonCampaignRow } from './axon-types';
import { AXON_COLOR } from './axon-types';

export const PanelTitle: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-8 h-8 radius_8 bg_secondary border border_secondary flex items-center justify-center icon_secondary shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text_primary truncate">{title}</div>
        {subtitle && <div className="text-xs text_tertiary mt-0.5 truncate">{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

export const RecommendationBadge: React.FC<{ value: AxonCampaignRow['recommendation'] }> = ({ value }) => {
  const map = {
    scale: 'bg_emerald_subtle fg_emerald_strong border_emerald',
    trim: 'bg_amber_subtle fg_amber_strong border_amber',
    watch: 'bg_blue_subtle fg_blue_strong border_blue',
  };
  const label = value === 'scale' ? 'Scale' : value === 'trim' ? 'Trim bid' : 'Watch';
  return <span className={cn('inline-flex px-2 py-1 radius_6 border text-[11px] font-semibold', map[value])}>{label}</span>;
};

export const SelectTile: React.FC<{
  active?: boolean;
  title: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}> = ({ active, title, subtitle, className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'min-h-[54px] radius_8 border px-4 py-3 bg_primary text-left flex items-center gap-3 transition-colors cursor-pointer',
      active ? '' : 'border_primary hover:bg_secondary',
      className,
    )}
    style={active ? { borderColor: AXON_COLOR, backgroundColor: `${AXON_COLOR}0F` } : undefined}
  >
    <span
      className={cn('w-4 h-4 radius_round border flex items-center justify-center shrink-0', active ? '' : 'border_secondary')}
      style={active ? { borderColor: AXON_COLOR } : undefined}
    >
      {active && <span className="w-2 h-2 radius_round" style={{ backgroundColor: AXON_COLOR }} />}
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text_primary truncate">{title}</span>
      {subtitle && <span className="block text-xs text_tertiary mt-0.5 truncate">{subtitle}</span>}
    </span>
  </button>
);

export const BuilderSection: React.FC<{
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status?: 'ready' | 'warning';
  children: React.ReactNode;
}> = ({ id, icon, title, subtitle, status = 'ready', children }) => (
  <Card id={id} className="radius_8 border border_primary bg_primary p-0 overflow-hidden">
    <div className="px-5 py-4 border-b border_secondary flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 radius_8 bg_secondary border border_secondary flex items-center justify-center icon_secondary shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-base font-semibold text_primary">{title}</div>
          <div className="text-xs text_tertiary mt-0.5 truncate">{subtitle}</div>
        </div>
      </div>
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 radius_round text-xs font-semibold border shrink-0',
        status === 'ready' ? 'bg_emerald_subtle fg_emerald_strong border_emerald' : 'bg_amber_subtle fg_amber_strong border_amber',
      )}>
        {status === 'ready' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
        {status === 'ready' ? 'Ready' : 'Needs input'}
      </span>
    </div>
    <div className="p-5">{children}</div>
  </Card>
);

export const MetricCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] text_tertiary">{label}</div>
    <div className="font-semibold text_primary">{value}</div>
  </div>
);

// Colored count badge used in trigger history
export const CountBadge: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <span
    className="inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold text-white shrink-0"
    style={{ backgroundColor: color }}
  >
    {value}
  </span>
);

// Pool tag chip for draft rules
export const PoolTag: React.FC<{ label: string; color: 'blue' | 'emerald' | 'violet'; badge?: string }> = ({ label, color, badge }) => {
  const cls = {
    blue: 'bg_blue_subtle fg_blue_strong border_blue',
    emerald: 'bg_emerald_subtle fg_emerald_strong border_emerald',
    violet: 'bg_violet_subtle fg_violet_strong border_violet',
  }[color];
  return (
    <span className="inline-flex items-center gap-1 mr-1 mb-1">
      <span className={cn('inline-flex px-2 py-0.5 radius_6 border text-xs', cls)}>{label}</span>
      {badge && <span className="inline-flex px-1.5 py-0.5 radius_4 bg_secondary border border_secondary text-[10px] text_tertiary font-semibold">{badge}</span>}
    </span>
  );
};
