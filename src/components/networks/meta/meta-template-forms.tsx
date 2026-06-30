// Template form sub-components — shared field primitives and the full template edit form
import React from 'react';
import { Checkbox, Input, Radio, Select } from '@/components/ui-kit-compat';
import { Bot, CalendarDays, Layers3, MousePointerClick, Plus, RefreshCcw, Settings, Zap } from 'lucide-react';
import { Button, toast } from '@frontend-team/ui-kit';
import type { MetaPage, MetaTemplate } from './meta-types';

// ─── Shared option lists (mirror the builder forms for consistency) ───────────

const BID_STRATEGY_OPTIONS = [
  { value: 'highest_volume', label: 'Highest volume or value' },
  { value: 'cost_cap', label: 'Cost per result goal' },
  { value: 'roas_goal', label: 'ROAS goal' },
  { value: 'other', label: 'Other option' },
];

const PERFORMANCE_GOAL_OPTIONS = [
  { label: 'App promotion goals', options: [
    { value: 'app_events', label: 'Maximize number of app events' },
    { value: 'app_installs', label: 'Maximize number of app installs' },
    { value: 'value_conversions', label: 'Maximize value of conversions' },
  ]},
  { label: 'Other goals', options: [
    { value: 'link_clicks', label: 'Maximize number of link clicks' },
    { value: 'reach', label: 'Maximize reach of ads' },
    { value: 'impressions', label: 'Maximize ad impressions' },
  ]},
];

const CONVERSION_EVENT_OPTIONS = [
  { value: 'install', label: 'App install' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'add_to_cart', label: 'Add to cart' },
  { value: 'view_content', label: 'View content' },
  { value: 'complete_registration', label: 'Complete registration' },
  { value: 'start_trial', label: 'Start trial' },
  { value: 'subscribe', label: 'Subscribe' },
  { value: 'level_achieved', label: 'Level achieved' },
  { value: 'spent_credits', label: 'Spent credits' },
];

const CTA_OPTIONS = [
  { value: 'download', label: 'Download' },
  { value: 'install_now', label: 'Install Now' },
  { value: 'get_offer', label: 'Get Offer' },
  { value: 'get_quote', label: 'Get Quote' },
  { value: 'open_link', label: 'Open Link' },
  { value: 'shop_now', label: 'Shop Now' },
  { value: 'play_game', label: 'Play Game' },
  { value: 'learn_more', label: 'Learn More' },
  { value: 'sign_up', label: 'Sign Up' },
];

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
];

// Labelled form field wrapper
export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text_primary mb-1.5">{label}</span>
    {children}
  </label>
);

// Collapsible section with icon header
export const TemplateSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="bg_primary border border_primary radius_8 p-4">
    <div className="flex items-center gap-2 pb-3 mb-3 border-b border_secondary">
      {icon}
      <h3 className="text-base font-semibold text_primary m-0">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

// Text asset entry (primary text / headlines / descriptions)
export const TextAssetField: React.FC<{ label: string; count: string }> = ({ label, count }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-semibold text_primary">{label} ({count})</span>
      <div className="flex gap-1.5">
        <Button type="button" variant="border" size="s">Bulk Add</Button>
        <Button type="button" variant="border" size="s" className="gap-1"><Plus size={12} /> Add</Button>
      </div>
    </div>
    <Input placeholder={`Add ${label.toLowerCase()}`} />
  </div>
);

interface TemplateEditFormProps {
  activeTemplate: MetaTemplate;
  pages: MetaPage[];
  onTemplateChange: (updater: (t: MetaTemplate) => MetaTemplate) => void;
}

// Full template edit form rendered inside TemplateDrawer when mode === 'edit'
export const TemplateEditForm: React.FC<TemplateEditFormProps> = ({ activeTemplate, pages, onTemplateChange }) => (
  <div className="p-5 pb-24 space-y-4">
    <TemplateSection icon={<Settings size={16} className="fg_blue_accent" />} title="Template setup">
      <Field label="Template Name">
        <Input value={activeTemplate.name} onChange={event => onTemplateChange(t => ({ ...t, name: event.target.value }))} />
      </Field>
      <Field label="Campaign Type">
        <Radio.Group value={activeTemplate.objective} className="flex gap-4" onChange={event => onTemplateChange(t => ({ ...t, objective: event.target.value }))}>
          <Radio value="Sales">Sales</Radio>
          <Radio value="App promotions">App Promotions</Radio>
        </Radio.Group>
      </Field>
    </TemplateSection>

    <TemplateSection icon={<Zap size={16} className="fg_blue_accent" />} title="Optimization & Bidding">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Bid Strategy"><Select defaultValue="highest_volume" options={BID_STRATEGY_OPTIONS} /></Field>
        <Field label="Performance Goal"><Select defaultValue="app_installs" options={PERFORMANCE_GOAL_OPTIONS} /></Field>
      </div>
    </TemplateSection>

    <TemplateSection icon={<MousePointerClick size={16} className="fg_accent_primary" />} title="Conversion Event">
      <Field label="Conversion Event"><Select defaultValue="install" options={CONVERSION_EVENT_OPTIONS} /></Field>
    </TemplateSection>

    <TemplateSection icon={<CalendarDays size={16} className="fg_blue_accent" />} title="Attribution Setting">
      <Radio.Group defaultValue="standard" className="mb-3 flex gap-4">
        <Radio value="standard">Standard</Radio>
        <Radio value="incremental">Incremental</Radio>
      </Radio.Group>
      {['Click-through', 'View-through', 'Engaged-view (Videos only)'].map((name, index) => (
        <div key={name} className="flex items-center justify-between border border_secondary bg_secondary radius_8 px-3 py-2 mb-2">
          <div>
            <div className="text-sm font-semibold text_primary">{name}</div>
            <div className="text-xs text_tertiary">Conversions attributed to {index === 0 ? 'clicks' : index === 1 ? 'views' : 'video engagement'}</div>
          </div>
          <Select className="w-28" defaultValue={index === 0 ? '7d' : '1d'} options={[{ value: '1d', label: '1 day' }, { value: '7d', label: '7 days' }]} />
        </div>
      ))}
    </TemplateSection>

    <TemplateSection icon={<Bot size={16} className="fg_blue_accent" />} title="Audience">
      <Field label="Saved Audiences"><Select placeholder="Select a saved audience to auto-fill targeting" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age Range">
          <div className="flex items-center gap-2">
            <Input defaultValue="18" />
            <span className="text_tertiary">-</span>
            <Input defaultValue="65" />
          </div>
        </Field>
        <Field label="Gender"><Select defaultValue="all" options={[{ value: 'all', label: 'All Genders' }, { value: 'male', label: 'Men' }, { value: 'female', label: 'Women' }]} /></Field>
      </div>
    </TemplateSection>

    <TemplateSection icon={<Layers3 size={16} className="fg_blue_accent" />} title="Placements">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Platform"><Select defaultValue="ios" options={PLATFORM_OPTIONS} /></Field>
        <Field label="Devices & OS"><Select defaultValue="mobile" options={[{ value: 'all', label: 'All devices (Mobile + Desktop)' }, { value: 'mobile', label: 'Mobile' }, { value: 'desktop', label: 'Desktop' }]} /></Field>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs font-semibold text_secondary uppercase">Platforms</div>
        <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => toast.success('Placement OS synced')}>
          <RefreshCcw size={13} />
          Sync OS
        </Button>
      </div>
      <Checkbox.Group
        className="grid grid-cols-2 gap-2 mt-2"
        value={activeTemplate.placements}
        onChange={values => onTemplateChange(t => ({ ...t, placements: values as string[] }))}
      >
        {['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads'].map(platform => (
          <Checkbox key={platform} value={platform}>{platform}</Checkbox>
        ))}
      </Checkbox.Group>
    </TemplateSection>

    <TemplateSection icon={<Zap size={16} className="fg_blue_accent" />} title="Ad Creative">
      <Field label="Facebook Page"><Select placeholder="Select a Facebook Page" options={pages.map(page => ({ value: page.id, label: page.name }))} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Website URL"><Input placeholder="http://www.example.com/page" /></Field>
        <Field label="Display Link"><Input placeholder="Display link shown on your ad" /></Field>
      </div>
      <TextAssetField label="Primary Text" count="0 of 5" />
      <TextAssetField label="Headlines" count="0 of 5" />
      <TextAssetField label="Descriptions" count="0 of 5" />
      <Field label="Call to Action">
        <Select defaultValue="install_now" options={CTA_OPTIONS} />
      </Field>
    </TemplateSection>
  </div>
);
