// Initial campaign type selection modal — shown before opening the builder drawer
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { Modal } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';

export type CampaignType = 'app_promotion' | 'sales';

interface Props {
  open: boolean;
  onSelect: (type: CampaignType) => void;
  onCancel: () => void;
}

const TYPES: {
  value: CampaignType;
  title: string;
  desc: string;
  goodFor: string[];
  bg: string;
  border: string;
  iconBg: string;
  emoji: string;
}[] = [
  {
    value: 'app_promotion',
    title: 'App Promotion',
    desc: 'Find new people to install your app and continue using it.',
    goodFor: ['App installs', 'App events'],
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    iconBg: 'bg-purple-100',
    emoji: '📱',
  },
  {
    value: 'sales',
    title: 'Sales',
    desc: 'Find people likely to purchase your product or service.',
    goodFor: ['Conversions', 'sales', 'Calls'],
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-100',
    emoji: '🛒',
  },
];

export const MetaCampaignTypeModal: React.FC<Props> = ({ open, onSelect, onCancel }) => {
  const [selected, setSelected] = useState<CampaignType>('app_promotion');

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Create Campaign"
      width={560}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="border" size="m" onClick={onCancel}>Cancel</Button>
          <Button type="button" variant="primary" size="m" onClick={() => onSelect(selected)}>OK</Button>
        </div>
      }
    >
      <p className="text-sm text_secondary mb-4">Select the type of campaign</p>
      <div className="grid grid-cols-2 gap-4">
        {TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setSelected(t.value)}
            className={cn(
              'flex flex-col items-center gap-3 p-5 radius_8 border-2 cursor-pointer text-center transition-all',
              selected === t.value
                ? `${t.border} ${t.bg}`
                : 'border_primary bg_primary hover:bg_secondary',
            )}
          >
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl', t.iconBg)}>
              {t.emoji}
            </div>
            <div>
              <div className="text-sm font-bold text_primary">{t.title}</div>
              <p className="text-xs text_secondary mt-1">{t.desc}</p>
              <div className="mt-2">
                <div className="text-[11px] font-semibold text_tertiary mb-1">Good for:</div>
                <div className="flex flex-wrap justify-center gap-1">
                  {t.goodFor.map(g => (
                    <span key={g} className="bg_secondary text_secondary text-[10px] px-2 py-0.5 radius_8">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};
