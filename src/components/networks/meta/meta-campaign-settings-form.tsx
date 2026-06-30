// Campaign Settings form — step 1 of the Meta builder drawer
import React, { useState } from 'react';
import { Input, Select } from '@/components/ui-kit-compat';
import { Eye, ExternalLink, ShoppingCart, Smartphone, Target, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { MetaTemplate, BuilderContext } from './meta-types';
import { Field } from './meta-template-forms';
import { BuilderCard } from './meta-builder-forms';

type Objective = 'app_installs' | 'sales' | 'awareness' | 'traffic';

const OBJECTIVES: {
  value: Objective; label: string; desc: string;
  icon: React.ElementType; sel: string; iconCls: string; textCls: string;
}[] = [
  {
    value: 'app_installs', label: 'App Installs', desc: 'Maximize app downloads',
    icon: Smartphone,
    sel: 'border-[var(--status-info-border)] bg-[var(--status-info-bg)]',
    iconCls: 'bg-[var(--status-info-bg)] text-[var(--status-info)]',
    textCls: 'text-[var(--status-info)]',
  },
  {
    value: 'sales', label: 'Sales', desc: 'Drive online purchases',
    icon: ShoppingCart,
    sel: 'border_emerald bg_emerald_subtle',
    iconCls: 'bg_emerald_subtle fg_success',
    textCls: 'fg_success',
  },
  {
    value: 'awareness', label: 'Awareness', desc: 'Increase brand reach',
    icon: Eye,
    sel: 'border-purple-400 bg-purple-50',
    iconCls: 'bg-purple-100 text-purple-600',
    textCls: 'text-purple-700',
  },
  {
    value: 'traffic', label: 'Traffic', desc: 'Drive site visitors',
    icon: Target,
    sel: 'border-amber-400 bg-amber-50',
    iconCls: 'bg-amber-100 text-amber-600',
    textCls: 'text-amber-700',
  },
];

const BID_STRATEGY_OPTIONS = [
  { value: 'highest', label: 'Highest volume or value' },
  { value: 'cost_cap', label: 'Cost per result goal' },
  { value: 'roas_goal', label: 'ROAS goal' },
  { value: 'other', label: 'Other option' },
];

interface Props {
  context: BuilderContext;
  template?: MetaTemplate;
  /** initial objective from type modal — 'app_installs' for App Promotion, 'sales' for Sales */
  initialObjective?: Objective;
}

export const CampaignSettingsForm: React.FC<Props> = ({ context, template, initialObjective }) => {
  const defaultObj: Objective = initialObjective
    ?? (template?.objective === 'App promotions' ? 'app_installs' : 'sales');

  const [objective, setObjective] = useState<Objective>(defaultObj);
  const [budgetOwner, setBudgetOwner] = useState<'campaign' | 'adset'>('campaign');
  const [ios14, setIos14] = useState(false);

  const isApp = objective === 'app_installs';

  return (
    <>
      {/* Account + App fields */}
      <BuilderCard>
        <Field label="Account ID">
          <Select defaultValue="Clean2" options={[{ value: 'Clean2', label: 'Clean2' }]} />
        </Field>

        {/* App fields: only visible for App Installs objective */}
        {isApp && (
          <>
            <Field label="App ID">
              <Input placeholder="e.g. 685975236869366" defaultValue="685975236869366" />
            </Field>
            <Field label="App URL">
              <Input
                placeholder="https://itunes.apple.com/app/id..."
                defaultValue="https://itunes.apple.com/app/id1641040766"
                suffix={<ExternalLink size={13} className="text_tertiary" />}
              />
            </Field>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text_primary">iOS 14+ campaign</div>
                <div className="text-[11px] text_tertiary mt-0.5">Enable for SKAdNetwork tracking</div>
              </div>
              <button type="button" onClick={() => setIos14(v => !v)} className="shrink-0">
                {ios14
                  ? <ToggleRight size={28} className="text-[var(--status-info)]" />
                  : <ToggleLeft size={28} className="text_tertiary" />}
              </button>
            </div>
          </>
        )}

        <Field label="Campaign Name">
          <Input defaultValue={context.campaign?.name ?? context.draft?.name ?? 'New Campaign Promotions'} />
        </Field>
      </BuilderCard>

      {/* Objective */}
      <BuilderCard title="Campaign Objective">
        <div className="grid grid-cols-2 gap-2.5">
          {OBJECTIVES.map(obj => {
            const Icon = obj.icon;
            const isSel = objective === obj.value;
            return (
              <button
                key={obj.value}
                type="button"
                onClick={() => setObjective(obj.value)}
                className={cn(
                  'flex items-center gap-3 p-3 radius_8 border-2 cursor-pointer text-left transition-colors',
                  isSel ? obj.sel : 'border-[var(--ds-border-default)] bg-transparent hover:border-[var(--ds-border-strong)]',
                )}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isSel ? obj.iconCls : 'bg_secondary text_tertiary')}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className={cn('text-xs font-bold', isSel ? obj.textCls : 'text_primary')}>{obj.label}</div>
                  <div className="text-[10px] text_tertiary">{obj.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        <Field label="Buying Type">
          <Select disabled defaultValue="auction" options={[{ value: 'auction', label: 'AUCTION' }]} />
        </Field>
      </BuilderCard>

      {/* Budget */}
      <BuilderCard title="Budget Strategy">
        <div className="grid grid-cols-2 gap-2">
          {(['campaign', 'adset'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setBudgetOwner(type)}
              className={cn(
                'border radius_8 p-4 cursor-pointer transition-colors',
                budgetOwner === type
                  ? 'border-[var(--status-info-border)] bg-[var(--status-info-bg)]'
                  : 'border_primary bg_secondary hover:bg_primary',
              )}
            >
              <div className={cn('text-xs font-bold', budgetOwner === type ? 'text-[var(--status-info)]' : 'text_primary')}>
                {type === 'campaign' ? 'Campaign Budget' : 'Ad Set Budget'}
              </div>
              <div className="text-[10px] text_tertiary mt-0.5">
                {type === 'campaign' ? 'Advantage+ auto-distributes spend' : 'Control budget per ad set'}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select
            defaultValue="daily"
            size="small"
            className="w-24 shrink-0"
            options={[{ value: 'daily', label: 'Daily' }, { value: 'lifetime', label: 'Lifetime' }]}
          />
          <Input prefix="$" defaultValue="100" className="flex-1" placeholder="Budget amount" />
        </div>

        <Field label="Bid Strategy">
          <Select defaultValue="highest" options={BID_STRATEGY_OPTIONS} />
        </Field>
      </BuilderCard>
    </>
  );
};
