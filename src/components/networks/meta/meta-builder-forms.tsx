// Builder form components — CampaignSettingsForm, AdsetSettingsForm, AdCreativeForm
// and shared primitives BuilderCard, BuilderTreeItem used inside MetaBuilderDrawer
import React, { useState } from 'react';
import { Checkbox, Input, Select } from 'antd';
import { Eye, Folder, RefreshCcw, ShoppingCart, Smartphone, Target, Upload } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { MetaPage, MetaTemplate, BuilderContext } from './meta-types';
import { Field, TextAssetField } from './meta-template-forms';

// Sidebar nav item — kept for backward compat (used by other drawers)
export const BuilderTreeItem: React.FC<{
  active: boolean; icon: React.ReactNode; label: string; onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-2 text-left px-3 py-2 radius_8 border cursor-pointer',
      active ? 'bg_blue_subtle border_blue fg_blue_strong' : 'bg_primary border-transparent text_primary hover:state_bg_button_tertiary_soft',
    )}
  >
    {icon}
    <span className="text-sm font-medium truncate">{label}</span>
  </button>
);

// Card wrapper for grouped form sections
export const BuilderCard: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg_primary border border_primary radius_8 p-5 space-y-4">
    {title && <div className="text-sm font-semibold text_primary -mb-1 pb-3 border-b border_secondary">{title}</div>}
    {children}
  </div>
);

// ─── Campaign Objective selector ─────────────────────────────────────────────

const OBJECTIVES = [
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
    sel: 'border-emerald-400 bg-emerald-50',
    iconCls: 'bg-emerald-100 text-emerald-600',
    textCls: 'text-emerald-700',
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
] as const;

// ─── Platform list with brand colors ─────────────────────────────────────────

const PLATFORMS = [
  { value: 'Facebook', dot: 'bg-[var(--status-info)]' },
  { value: 'Instagram', dot: 'bg-pink-500' },
  { value: 'Audience Network', dot: 'bg-indigo-400' },
  { value: 'Messenger', dot: 'bg-[var(--status-info)]' },
  { value: 'Threads', dot: 'bg-slate-800' },
];

// ─── Forms ───────────────────────────────────────────────────────────────────

export const CampaignSettingsForm: React.FC<{ context: BuilderContext; template?: MetaTemplate }> = ({ context, template }) => {
  const defaultObj = template?.objective === 'App promotions' ? 'app_installs' : 'sales';
  const [objective, setObjective] = useState<string>(defaultObj);
  const [budgetOwner, setBudgetOwner] = useState<'campaign' | 'adset'>('campaign');

  return (
    <>
      <BuilderCard>
        <Field label="Account ID">
          <Select defaultValue="Clean2" options={[{ value: 'Clean2', label: 'Clean2' }]} />
        </Field>
        <Field label="Campaign Name">
          <Input defaultValue={context.campaign?.name ?? context.draft?.name ?? 'New Campaign Sales'} />
        </Field>
      </BuilderCard>

      <BuilderCard title="Campaign Objective">
        <div className="grid grid-cols-2 gap-2.5">
          {OBJECTIVES.map(obj => {
            const Icon = obj.icon;
            const isSelected = objective === obj.value;
            return (
              <button
                key={obj.value}
                type="button"
                onClick={() => setObjective(obj.value)}
                className={cn(
                  'flex items-center gap-3 p-3 radius_8 border-2 cursor-pointer text-left transition-colors',
                  isSelected ? obj.sel : 'border-[var(--ds-border-default)] bg-transparent hover:border-[var(--ds-border-strong)]',
                )}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors', isSelected ? obj.iconCls : 'bg_secondary text_tertiary')}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className={cn('text-xs font-bold', isSelected ? obj.textCls : 'text_primary')}>{obj.label}</div>
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

      <BuilderCard title="Budget Strategy">
        <div className="grid grid-cols-2 gap-2">
          {(['campaign', 'adset'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setBudgetOwner(type)}
              className={cn('border radius_8 p-4 cursor-pointer transition-colors',
                  budgetOwner === type
                  ? 'border-[var(--status-info-border)] bg-[var(--status-info-bg)]'
                  : 'border_primary bg_secondary hover:bg_primary'
                )}
            >
              <div className={cn('text-xs font-bold', budgetOwner === type ? 'text-[var(--status-info)]' : 'text_primary')}>
                {type === 'campaign' ? '📊 Campaign Budget' : '🎯 Ad Set Budget'}
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
            className="w-28 shrink-0"
            options={[{ value: 'daily', label: 'Daily' }, { value: 'lifetime', label: 'Lifetime' }]}
          />
          <Input prefix="$" defaultValue="100" className="flex-1" placeholder="Budget amount" />
          <Select
            defaultValue="highest"
            size="small"
            className="w-56 shrink-0"
            options={[{ value: 'highest', label: 'Highest volume or value' }, { value: 'cost_cap', label: 'Cost cap' }]}
          />
        </div>
      </BuilderCard>
    </>
  );
};

export const AdsetSettingsForm: React.FC<{ context: BuilderContext; template?: MetaTemplate }> = ({ context, template }) => (
  <>
    <BuilderCard>
      <Field label="Ad Set Name">
        <Input defaultValue={context.adSet?.name ?? 'New Adset Sales'} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Performance Goal">
          <Select defaultValue="installs" options={[{ value: 'installs', label: 'Maximize app installs' }, { value: 'value', label: 'Maximize value' }]} />
        </Field>
        <Field label="Conversion Event">
          <Select placeholder="Select event" options={[{ value: 'install', label: 'App install' }, { value: 'purchase', label: 'Purchase' }]} />
        </Field>
      </div>
    </BuilderCard>

    <BuilderCard title="Audience">
      <Field label="Saved Audiences">
        <Select
          placeholder="Select a saved audience to auto-fill targeting..."
          defaultValue={template ? 'template-audience' : undefined}
          options={template ? [{ value: 'template-audience', label: `${template.name} audience seed` }] : undefined}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Locations">
          <Select mode="multiple" defaultValue={['Worldwide']} options={[{ value: 'Worldwide', label: 'Worldwide' }, { value: 'US', label: 'United States' }, { value: 'JP', label: 'Japan' }]} />
        </Field>
        <Field label="Gender">
          <Select defaultValue="all" options={[{ value: 'all', label: 'All Genders' }, { value: 'male', label: 'Men' }, { value: 'female', label: 'Women' }]} />
        </Field>
      </div>
      <Field label="Age Range">
        <div className="flex items-center gap-2 max-w-56">
          <Input defaultValue="18" />
          <span className="text_tertiary shrink-0">–</span>
          <Input defaultValue={template?.age.split('-')[1] ?? '65'} />
        </div>
      </Field>
    </BuilderCard>

    <BuilderCard title="Placements">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text_tertiary">Select where your ads will appear</span>
        <Button type="button" variant="border" size="s" className="gap-1"><RefreshCcw size={12} />Sync OS</Button>
      </div>
      <Checkbox.Group
        className="grid grid-cols-2 gap-2"
        defaultValue={template?.placements ?? PLATFORMS.map(p => p.value)}
      >
        {PLATFORMS.map(({ value, dot }) => (
          <Checkbox key={value} value={value}>
            <span className="flex items-center gap-1.5">
              <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', dot)} />
              {value}
            </span>
          </Checkbox>
        ))}
      </Checkbox.Group>
    </BuilderCard>
  </>
);

export const AdCreativeForm: React.FC<{ context: BuilderContext; pages: MetaPage[]; template?: MetaTemplate }> = ({ context, pages, template }) => (
  <>
    <BuilderCard title="Media Assets">
      <p className="text-xs text_secondary -mt-1">Upload creatives for each aspect ratio. Supported: MP4, MOV, JPG, PNG.</p>
      <div className="grid grid-cols-3 gap-3">
        {(['9:16', '1:1', '16:9'] as const).map(ratio => (
          <div key={ratio} className="border border_primary radius_8 p-3">
            <div className="text-xs font-semibold text_secondary mb-2 text-center">{ratio}</div>
            <div className="h-36 border-2 border-dashed border_secondary radius_8 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[var(--status-info-border)] hover:bg-[var(--status-info-bg)] transition-colors group">
              <Upload size={18} className="text_tertiary group-hover:text-[var(--status-info)] transition-colors" />
              <div className="text-[11px] font-medium text_secondary group-hover:text-[var(--status-info)] text-center">Drop or click to upload</div>
              <div className="text-[10px] text_tertiary">MP4, MOV, JPG, PNG</div>
            </div>
            <Button type="button" variant="border" size="s" className="w-full mt-2 gap-1 text-xs">
              <Folder size={12} />Browse Files
            </Button>
          </div>
        ))}
      </div>
    </BuilderCard>

    <BuilderCard>
      <Field label="Ad Name">
        <Input defaultValue={context.ad?.name ?? 'New Ad Sales'} />
      </Field>
      <Field label="Facebook Page">
        <Select placeholder="Select a Facebook Page" options={pages.map(page => ({ value: page.id, label: page.name }))} />
      </Field>
      <TextAssetField label="Primary Text" count={template ? '1 of 5' : '2 of 5'} />
      <TextAssetField label="Headline" count={template ? '2 of 5' : '1 of 5'} />
      <TextAssetField label="Description" count="0 of 5" />
      <Field label="Call to Action">
        <Select
          defaultValue={template?.objective === 'App promotions' ? 'install_now' : 'download'}
          options={[{ value: 'download', label: 'Download' }, { value: 'install_now', label: 'Install Now' }, { value: 'learn_more', label: 'Learn More' }]}
        />
      </Field>
    </BuilderCard>
  </>
);
