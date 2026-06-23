// Builder form components — CampaignSettingsForm, AdsetSettingsForm, AdCreativeForm
// and shared primitives BuilderCard, BuilderTreeItem used inside MetaBuilderDrawer
import React from 'react';
import { Checkbox, Input, Radio, Select } from 'antd';
import { Folder, RefreshCcw, Upload } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { MetaPage, MetaTemplate, BuilderContext } from './meta-types';
import { Field, TextAssetField } from './meta-template-forms';

// Sidebar nav item for campaign / adset / creative tabs
export const BuilderTreeItem: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
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

// Card wrapper for grouped form fields
export const BuilderCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg_primary border border_primary radius_8 p-5 space-y-4">{children}</div>
);

export const CampaignSettingsForm: React.FC<{ context: BuilderContext; template?: MetaTemplate }> = ({ context, template }) => (
  <>
    <BuilderCard>
      <Field label="Account ID"><Select defaultValue="Clean2" options={[{ value: 'Clean2', label: 'Clean2' }]} /></Field>
    </BuilderCard>
    <BuilderCard>
      <Field label="Campaign Name"><Input defaultValue={context.campaign?.name ?? context.draft?.name ?? 'New Campaign Sales'} /></Field>
    </BuilderCard>
    <BuilderCard>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Campaign Objective">
          <Select defaultValue={template?.objective === 'App promotions' ? 'app_installs' : 'sales'} options={[{ value: 'sales', label: 'Sales' }, { value: 'app_installs', label: 'App Installs' }]} />
        </Field>
        <Field label="Buying Type"><Select disabled defaultValue="auction" options={[{ value: 'auction', label: 'AUCTION' }]} /></Field>
      </div>
    </BuilderCard>
    <BuilderCard>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text_primary">Budget Strategy</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_emerald_subtle fg_emerald_strong">Advantage+ On</span>
      </div>
      <Radio.Group defaultValue="campaign" className="flex gap-5">
        <Radio value="campaign">Campaign Budget</Radio>
        <Radio value="adset">Ad Set Budget</Radio>
      </Radio.Group>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Budget Amount">
          <div className="grid grid-cols-[130px_1fr] gap-2">
            <Select defaultValue="daily" options={[{ value: 'daily', label: 'Daily' }, { value: 'lifetime', label: 'Lifetime' }]} />
            <Input defaultValue="$100" />
          </div>
        </Field>
        <Field label="Bid Strategy"><Select defaultValue="highest" options={[{ value: 'highest', label: 'Highest volume or value' }]} /></Field>
      </div>
    </BuilderCard>
  </>
);

export const AdsetSettingsForm: React.FC<{ context: BuilderContext; template?: MetaTemplate }> = ({ context, template }) => (
  <>
    <BuilderCard>
      <Field label="Ad Set Name"><Input defaultValue={context.adSet?.name ?? 'New Adset Sales'} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Performance Goal"><Select defaultValue="installs" options={[{ value: 'installs', label: 'Maximize app installs' }, { value: 'value', label: 'Maximize value' }]} /></Field>
        <Field label="Conversion Event"><Select placeholder="Select event" options={[{ value: 'install', label: 'App install' }, { value: 'purchase', label: 'Purchase' }]} /></Field>
      </div>
    </BuilderCard>
    <BuilderCard>
      <div className="text-base font-semibold text_primary">Audience</div>
      <Field label="Saved Audiences">
        <Select placeholder="Select a saved audience to auto-fill targeting..." defaultValue={template ? 'template-audience' : undefined} options={template ? [{ value: 'template-audience', label: `${template.name} audience seed` }] : undefined} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Locations"><Select mode="multiple" defaultValue={['Worldwide']} options={[{ value: 'Worldwide', label: 'Worldwide' }, { value: 'US', label: 'United States' }, { value: 'JP', label: 'Japan' }]} /></Field>
        <Field label="Gender"><Select defaultValue="all" options={[{ value: 'all', label: 'All Genders' }, { value: 'male', label: 'Men' }, { value: 'female', label: 'Women' }]} /></Field>
      </div>
      <Field label="Age Range">
        <div className="flex items-center gap-2 max-w-72">
          <Input defaultValue="18" />
          <span className="text_tertiary">-</span>
          <Input defaultValue={template?.age.split('-')[1] ?? '65'} />
        </div>
      </Field>
    </BuilderCard>
    <BuilderCard>
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text_primary">Placements</div>
        <Button type="button" variant="border" size="s" className="gap-1.5"><RefreshCcw size={13} /> Sync OS</Button>
      </div>
      <Checkbox.Group defaultValue={template?.placements ?? ['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads']} className="grid grid-cols-2 gap-2">
        {['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads'].map(platform => <Checkbox key={platform} value={platform}>{platform}</Checkbox>)}
      </Checkbox.Group>
    </BuilderCard>
  </>
);

export const AdCreativeForm: React.FC<{ context: BuilderContext; pages: MetaPage[]; template?: MetaTemplate }> = ({ context, pages, template }) => (
  <>
    <BuilderCard>
      <div className="grid grid-cols-3 gap-3">
        {['9:16', '1:1', '16:9'].map(ratio => (
          <div key={ratio} className="border border_primary radius_8 p-3">
            <div className="text-xs text_tertiary mb-2">{ratio}</div>
            <div className="h-40 bg_secondary radius_8 flex items-center justify-center text_tertiary">
              <Folder size={24} />
            </div>
            <Button type="button" variant="primary" size="m" className="w-full mt-3 gap-1.5"><Upload size={14} /> Select Video</Button>
          </div>
        ))}
      </div>
    </BuilderCard>
    <BuilderCard>
      <Field label="Ad Name"><Input defaultValue={context.ad?.name ?? 'New Ad Sales'} /></Field>
      <Field label="Facebook Page"><Select placeholder="Select a Facebook Page" options={pages.map(page => ({ value: page.id, label: page.name }))} /></Field>
      <TextAssetField label="Primary Text" count={template ? '1 of 5' : '2 of 5'} />
      <TextAssetField label="Headline" count={template ? '2 of 5' : '1 of 5'} />
      <TextAssetField label="Description" count="0 of 5" />
      <Field label="Call to Action">
        <Select defaultValue={template?.objective === 'App promotions' ? 'install_now' : 'download'} options={[{ value: 'download', label: 'Download' }, { value: 'install_now', label: 'Install Now' }]} />
      </Field>
    </BuilderCard>
  </>
);
