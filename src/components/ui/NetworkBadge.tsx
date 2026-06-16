import React from 'react';
import { Badge, cn } from '@frontend-team/ui-kit';

type NetworkKey = 'google-ads' | 'meta' | 'asa' | 'axon' | 'moloco' | 'adjust' | 'youtube';

interface NetworkBadgeProps {
  network: NetworkKey;
  size?: 'sm' | 'md';
  className?: string;
}

const networkDisplayConfig: Record<NetworkKey, { label: string; className: string }> = {
  'google-ads': { label: 'Google Ads', className: 'bg_blue_subtle fg_blue_strong border_blue' },
  meta: { label: 'Meta', className: 'bg_indigo_subtle fg_indigo_strong border_indigo' },
  asa: { label: 'Apple Search Ads', className: 'bg_tertiary text_primary border_secondary' },
  axon: { label: 'Axon / AppLovin', className: 'bg_violet_subtle fg_violet_strong border_violet' },
  moloco: { label: 'Moloco', className: 'bg_pink_subtle fg_pink_strong border_pink' },
  adjust: { label: 'Adjust', className: 'bg_emerald_subtle fg_emerald_strong border_emerald' },
  youtube: { label: 'YouTube', className: 'bg_red_subtle fg_red_strong border_red' },
};

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({ network, size = 'sm', className }) => {
  const config = networkDisplayConfig[network];
  if (!config) return null;

  return (
    <Badge
      rounded
      className={cn(
        'border font-semibold select-none leading-snug',
        size === 'sm' ? 'text-[11px] px-2 py-0' : 'text-xs px-2.5 py-0.5',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
};

export default NetworkBadge;
