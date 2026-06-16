/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Badge, cn } from '@frontend-team/ui-kit';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'processing';

const variantClassMap: Record<StatusVariant, string> = {
  success: 'bg_emerald_subtle fg_emerald_strong border_emerald',
  error: 'bg_red_subtle fg_red_strong border_red',
  warning: 'bg_amber_subtle fg_amber_strong border_amber',
  info: 'bg_blue_subtle fg_blue_strong border_blue',
  neutral: 'bg_tertiary text_secondary border_secondary',
  processing: 'bg_blue_subtle fg_blue_strong border_blue',
};

const DotIndicator: React.FC<{ variant: StatusVariant }> = ({ variant }) => {
  if (variant !== 'processing') return null;
  return <span className="w-1.5 h-1.5 radius_round inline-block animate-pulse bg_info_contrast" />;
};

interface StatusBadgeProps {
  label: string;
  variant: StatusVariant;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant, className, dot = false }) => (
  <Badge
    rounded
    className={cn(
      'inline-flex items-center gap-1.5 border text-[11px] font-semibold px-2 py-0.5 leading-snug select-none',
      variantClassMap[variant],
      className,
    )}
  >
    {(dot || variant === 'processing') && <DotIndicator variant={variant} />}
    {label}
  </Badge>
);

export function statusToVariant(status: string): StatusVariant {
  const s = status.toUpperCase();
  if (['ACTIVE', 'RUNNING', 'COMPLETED', 'SUCCESS', 'VALID'].includes(s)) return 'success';
  if (['ERROR', 'FAILED', 'EXPIRED', 'REVOKED'].includes(s)) return 'error';
  if (['PAUSED', 'STOP', 'QUEUED', 'EXPIRING_SOON', 'UPDATE REQUIRED'].includes(s)) return 'warning';
  if (['PROCESSING', 'PENDING'].includes(s)) return 'processing';
  if (['LOGIC', 'INFO'].includes(s)) return 'info';
  return 'neutral';
}

export default StatusBadge;
