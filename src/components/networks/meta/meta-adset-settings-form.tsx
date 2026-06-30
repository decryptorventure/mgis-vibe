// Ad Set Settings form — step 2 of the Meta builder drawer
// Covers: Ad Set info, Value Rules, Attribution (Standard/Incremental), Audience section, Placements
import React, { useState } from 'react';
import { Checkbox, Input, Select, Switch } from '@/components/ui-kit-compat';
import { RefreshCcw, Settings2 } from 'lucide-react';
import { Button } from '@frontend-team/ui-kit';
import type { MetaTemplate, BuilderContext } from './meta-types';
import { Field } from './meta-template-forms';
import { BuilderCard } from './meta-builder-forms';
import { MetaAdsetAudienceSection } from './meta-adset-audience-section';
import { AdsetPlacementsSection } from './meta-adset-placements-section';
import { MetaValueRulesModal } from './meta-value-rules-modal';

type AttributionMode = 'standard' | 'incremental';

const PERFORMANCE_GOAL_OPTIONS = [
  {
    label: 'App promotion goals',
    options: [
      { value: 'app_events', label: 'Maximize number of app events' },
      { value: 'app_installs', label: 'Maximize number of app installs' },
      { value: 'value_conversions', label: 'Maximize value of conversions' },
    ],
  },
  {
    label: 'Other goals',
    options: [
      { value: 'link_clicks', label: 'Maximize number of link clicks' },
      { value: 'reach', label: 'Maximize reach of ads' },
      { value: 'impressions', label: 'Maximize ad impressions' },
    ],
  },
];

const CONVERSION_EVENT_OPTIONS = [
  { value: 'install', label: 'App install' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'add_to_cart', label: 'Add to cart' },
  { value: 'view_content', label: 'View content' },
  { value: 'complete_registration', label: 'Complete registration' },
  { value: 'start_trial', label: 'Start trial' },
  { value: 'subscribe', label: 'Subscribe' },
];

// Reusable native radio for attribution — accent matches status-info token
const Radio: React.FC<{ name: string; checked: boolean; onChange: () => void; label: string }> =
  ({ name, checked, onChange, label }) => (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange}
        className="accent-[var(--status-info)] w-3.5 h-3.5 cursor-pointer" />
      <span className="text-sm text_primary">{label}</span>
    </label>
  );

interface Props {
  context: BuilderContext;
  template?: MetaTemplate;
}

export const AdsetSettingsForm: React.FC<Props> = ({ context, template }) => {
  const [attribution, setAttribution] = useState<AttributionMode>('standard');
  const [clickthrough, setClickthrough] = useState(true);
  const [showValueRules, setShowValueRules] = useState(false);

  return (
    <>
      {/* Basic info */}
      <BuilderCard>
        <Field label="Ad Set Name">
          <Input defaultValue={context.adSet?.name ?? 'New Adset Promotions'} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Performance Goal">
            <Select defaultValue="app_installs" options={PERFORMANCE_GOAL_OPTIONS} />
          </Field>
          <Field label="Conversion Event">
            <Select defaultValue="install" options={CONVERSION_EVENT_OPTIONS} />
          </Field>
        </div>
      </BuilderCard>

      {/* Value Rules */}
      <BuilderCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text_primary">Value Rules</div>
            <div className="text-[11px] text_tertiary mt-0.5">
              Tell us how much more certain audiences are worth to your business.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="border" size="s" className="gap-1">
              <RefreshCcw size={11} />Sync
            </Button>
            <Button type="button" variant="border" size="s" className="gap-1" onClick={() => setShowValueRules(true)}>
              <Settings2 size={11} />Manage
            </Button>
          </div>
        </div>
        <Checkbox>
          <span className="text-xs text_secondary">Apply a rule set</span>
        </Checkbox>
      </BuilderCard>

      {/* Attribution */}
      <BuilderCard title="Attribution Setting">
        <p className="text-[11px] text_tertiary -mt-2">
          Optimize delivery for a selected time window and interaction type.
        </p>
        <div className="flex items-center gap-6">
          <Radio name="attribution" checked={attribution === 'standard'} onChange={() => setAttribution('standard')} label="Standard" />
          <Radio name="attribution" checked={attribution === 'incremental'} onChange={() => setAttribution('incremental')} label="Incremental" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text_tertiary mb-2">Attribution Windows</div>
          <div className="flex items-center justify-between border border_primary radius_8 px-3 py-2">
            <div className="flex items-center gap-3">
              <Switch checked={clickthrough} onChange={setClickthrough} />
              <div>
                <div className="text-sm font-medium text_primary">Click-through</div>
                <div className="text-[10px] text_tertiary">Conversions attributed to clicks</div>
              </div>
            </div>
            <Select
              defaultValue={template?.attribution?.includes('7d') ? '7d' : '1d'}
              size="small"
              className="w-24 shrink-0"
              disabled={!clickthrough}
              options={[{ value: '1d', label: '1 day' }, { value: '7d', label: '7 days' }]}
            />
          </div>
        </div>
      </BuilderCard>

      {/* Audience (Locations, Demographics, Language, Custom Audience) */}
      <MetaAdsetAudienceSection template={template} />

      {/* Placements */}
      <AdsetPlacementsSection />

      {/* Value Rules manage modal */}
      <MetaValueRulesModal open={showValueRules} onClose={() => setShowValueRules(false)} />
    </>
  );
};
