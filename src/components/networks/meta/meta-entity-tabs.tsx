// Entity tabs (Campaigns / Ad Sets / Ads) navigation component
import React from 'react';
import { CheckCircle2, Layers3, Megaphone, PanelRightOpen } from 'lucide-react';
import { cn } from '@frontend-team/ui-kit';
import type { Campaign, AdSet } from '@/shared/mock-data';
import type { MetaEntity } from './meta-types';

interface EntityTabsProps {
  entity: MetaEntity;
  setEntity: (entity: MetaEntity) => void;
  campaignCount: number;
  adSetCount: number;
  adCount: number;
  selectedCampaign?: Campaign | null;
  selectedAdSet?: AdSet | null;
}

export const EntityTabs: React.FC<EntityTabsProps> = ({
  entity,
  setEntity,
  campaignCount,
  adSetCount,
  adCount,
  selectedCampaign,
  selectedAdSet,
}) => {
  const items = [
    {
      key: 'campaigns' as const,
      title: 'Campaigns',
      subtitle: `${campaignCount} campaigns`,
      icon: <Megaphone size={16} />,
    },
    {
      key: 'adsets' as const,
      title: selectedCampaign ? `Ad sets for 1 campaign` : 'Ad sets',
      subtitle: selectedCampaign?.name ?? `${adSetCount} ad sets`,
      icon: <Layers3 size={16} />,
    },
    {
      key: 'ads' as const,
      title: selectedAdSet ? `Ads for 1 ad set` : selectedCampaign ? 'Ads for selected campaign' : 'Ads',
      subtitle: selectedAdSet?.name ?? selectedCampaign?.name ?? `${adCount} ads`,
      icon: <PanelRightOpen size={16} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      {items.map(item => {
        const isActive = entity === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setEntity(item.key)}
            className={cn(
              'text-left bg_primary border radius_8 px-4 py-3 cursor-pointer transition-colors',
              isActive ? 'border_blue bg_blue_subtle' : 'border_primary hover:state_bg_button_tertiary_soft',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn('w-8 h-8 radius_8 flex items-center justify-center shrink-0', isActive ? 'bg_info_contrast fg_on_contrast' : 'bg_secondary icon_secondary')}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className={cn('text-sm font-semibold truncate', isActive ? 'fg_blue_strong' : 'text_primary')}>{item.title}</div>
                  <div className="text-xs text_tertiary truncate">{item.subtitle}</div>
                </div>
              </div>
              {isActive && <CheckCircle2 size={16} className="fg_blue_accent shrink-0" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
