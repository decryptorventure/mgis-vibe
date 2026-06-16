import React from 'react';
import { Card, Skeleton, cn } from '@frontend-team/ui-kit';
import { TrendingDown, TrendingUp } from 'lucide-react';

type StatCardVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: { value: number; label: string };
  footer?: React.ReactNode;
  loading?: boolean;
  variant?: StatCardVariant;
  className?: string;
}

const variantAccentClassMap: Record<StatCardVariant, string> = {
  default: 'bg_quaternary',
  success: 'bg_emerald_medium',
  error: 'bg_red_medium',
  warning: 'bg_amber_medium',
  info: 'bg_blue_medium',
  primary: 'bg_accent_primary',
};

const variantBgClassMap: Record<StatCardVariant, string> = {
  default: 'bg_tertiary icon_secondary',
  success: 'bg_emerald_subtle fg_emerald_strong',
  error: 'bg_red_subtle fg_red_strong',
  warning: 'bg_amber_subtle fg_amber_strong',
  info: 'bg_blue_subtle fg_blue_strong',
  primary: 'bg_accent_primary_subtle fg_accent_primary',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  footer,
  loading = false,
  variant = 'default',
  className,
}) => (
  <Card
    shadow="none"
    className={cn(
      'relative radius_8 border border_primary bg_primary p-4 flex flex-col gap-2 overflow-hidden',
      className,
    )}
  >
    <span className={cn('absolute left-0 top-0 h-full w-1', variantAccentClassMap[variant])} />

    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="text-[11px] font-semibold uppercase text_tertiary">{title}</span>
        {description && <div className="text-[11px] mt-1 truncate text_secondary">{description}</div>}
      </div>

      {icon && (
        <div
          className={cn(
            'w-8 h-8 radius_round flex items-center justify-center flex-shrink-0',
            variantBgClassMap[variant],
          )}
        >
          {icon}
        </div>
      )}
    </div>

    {loading ? (
      <Skeleton className="h-7 w-24 radius_6" />
    ) : (
      <span className="text-2xl font-bold leading-none text_primary">{value}</span>
    )}

    {trend && (
      <div className="flex items-center gap-1.5 mt-0.5">
        {trend.value >= 0 ? (
          <TrendingUp size={14} className="fg_emerald_accent" />
        ) : (
          <TrendingDown size={14} className="fg_red_accent" />
        )}
        <span className={cn('text-xs font-semibold', trend.value >= 0 ? 'fg_emerald_accent' : 'fg_red_accent')}>
          {trend.value >= 0 ? '+' : ''}
          {trend.value}%
        </span>
        <span className="text-[11px] text_tertiary">{trend.label}</span>
      </div>
    )}

    {footer && <div className="mt-1 text-[11px] text_secondary">{footer}</div>}
  </Card>
);

export default StatCard;
