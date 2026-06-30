// Audience targeting section: Locations + Demographics + Language + Custom Audience
import React, { useState } from 'react';
import { Checkbox, Select, Switch } from '@/components/ui-kit-compat';
import { Globe, RefreshCcw } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { MetaTemplate } from './meta-types';
import { BuilderCard } from './meta-builder-forms';
import {
  COUNTRY_OPTIONS, MIN_AGE_OPTIONS, MAX_AGE_OPTIONS, SUGGEST_AGE_OPTIONS,
  SAVED_AUDIENCE_OPTIONS, CUSTOM_AUDIENCE_OPTIONS, LANGUAGE_OPTIONS,
} from './meta-adset-audience-constants';

type LocationMode = 'all' | 'include' | 'exclude';
type GenderMode = 'all' | 'male' | 'female';
type AudienceTab = 'included' | 'excluded';

// Module-level sub-components avoid remount on every parent render
interface NativeRadioProps { name: string; checked: boolean; onChange: () => void; label: string }
const NativeRadio: React.FC<NativeRadioProps> = ({ name, checked, onChange, label }) => (
  <label className="flex items-center gap-1.5 cursor-pointer">
    <input type="radio" name={name} checked={checked} onChange={onChange} className="w-3.5 h-3.5 cursor-pointer" />
    <span className="body_s text_primary">{label}</span>
  </label>
);

interface LocationCardProps { mode: LocationMode; title: string; desc: string; active: boolean; onSelect: () => void }
const LocationCard: React.FC<LocationCardProps> = ({ mode: _mode, title, desc, active, onSelect }) => (
  <button type="button" onClick={onSelect}
    className={cn(
      'flex items-start gap-2 p-3 radius_8 border-2 text-left transition-all',
      active ? 'border_accent_secondary bg_info' : 'border_primary bg_primary hover:bg_secondary',
    )}
  >
    <div className={cn('w-3.5 h-3.5 radius_round mt-0.5 shrink-0 border-2 flex items-center justify-center',
      active ? 'border_accent_secondary bg_info_contrast' : 'border_secondary',
    )}>
      {active && <div className="w-1.5 h-1.5 bg-white radius_round" />}
    </div>
    <div>
      <div className={cn('text-xs font-semibold', active ? 'fg_info' : 'text_primary')}>{title}</div>
      <div className="text-[10px] text_tertiary mt-0.5">{desc}</div>
    </div>
  </button>
);

interface Props { template?: MetaTemplate }

export const MetaAdsetAudienceSection: React.FC<Props> = ({ template }) => {
  const [locationMode, setLocationMode] = useState<LocationMode>('include');
  const [gender, setGender] = useState<GenderMode>('all');
  const [useSuggestAge, setUseSuggestAge] = useState(true);
  const [langEnabled, setLangEnabled] = useState(false);
  const [audienceTab, setAudienceTab] = useState<AudienceTab>('included');
  const [useIncludedAudiences, setUseIncludedAudiences] = useState(true);

  return (
    <BuilderCard title="Audience Targeting">
      {/* Saved Audiences */}
      <Select
        placeholder="Select a saved audience to auto-fill targeting..."
        options={[
          ...(template ? [{ value: 'seed', label: `${template.name} audience seed` }] : []),
          ...SAVED_AUDIENCE_OPTIONS,
        ]}
      />

      {/* Locations */}
      <div>
        <div className="text-[11px] font-semibold text_tertiary mb-2">Locations</div>
        <Button type="button" variant="border" size="s" className="w-full mb-2 gap-1.5 justify-center">
          <Globe size={12} />Saved Locations
        </Button>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <LocationCard mode="all" title="All Countries" desc="Target all available countries" active={locationMode === 'all'} onSelect={() => setLocationMode('all')} />
          <LocationCard mode="include" title="Include Specific" desc="Choose countries to target" active={locationMode === 'include'} onSelect={() => setLocationMode('include')} />
          <LocationCard mode="exclude" title="Exclude Specific" desc="Choose countries to exclude" active={locationMode === 'exclude'} onSelect={() => setLocationMode('exclude')} />
        </div>
        {locationMode !== 'all' && (
          <Select mode="multiple" placeholder={`Countries to ${locationMode}`} options={COUNTRY_OPTIONS} />
        )}
      </div>

      {/* Demographics */}
      <div>
        <div className="text-[11px] font-semibold text_tertiary mb-2">Demographics</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] text_secondary mb-1">Age Range</div>
            <div className="flex items-center gap-2 mb-1.5">
              <Select defaultValue="21" size="small" className="w-24" options={MIN_AGE_OPTIONS} />
              <span className="text_tertiary text-xs shrink-0">–</span>
              <Select defaultValue="65+" size="small" className="w-24" options={MAX_AGE_OPTIONS} />
            </div>
            <Checkbox checked={useSuggestAge} onChange={e => setUseSuggestAge(e.target.checked)}>
              <span className="text-[11px] text_secondary">Use Suggestion (Age)</span>
            </Checkbox>
            {useSuggestAge && (
              <div className="mt-2 pl-1">
                <div className="text-[10px] text_tertiary mb-1">Minimum age control (≤ 25)</div>
                <Select defaultValue="21" size="small" className="w-24" options={SUGGEST_AGE_OPTIONS} />
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] text_secondary mb-1">Gender</div>
            <div className="space-y-1.5">
              {(['all', 'male', 'female'] as GenderMode[]).map(g => (
                <NativeRadio key={g} name="gender" checked={gender === g} onChange={() => setGender(g)}
                  label={g === 'all' ? 'All' : g === 'male' ? 'Men' : 'Women'} />
              ))}
              <Checkbox defaultChecked>
                <span className="text-[11px] text_secondary">Use Suggestion (Gender)</span>
              </Checkbox>
            </div>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={13} className="text_tertiary" />
          <span className="body_s text_primary">Language Targeting</span>
        </div>
        <Switch checked={langEnabled} onChange={setLangEnabled} size="small" />
      </div>
      {langEnabled && <Select mode="multiple" placeholder="Select languages..." options={LANGUAGE_OPTIONS} />}

      {/* Custom Audience */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="body_s font-semibold text_primary">Custom Audience</span>
          <Button type="button" variant="border" size="s" className="gap-1">
            <RefreshCcw size={11} />Sync
          </Button>
        </div>
        <div className="flex gap-2 mb-2">
          {(['included', 'excluded'] as AudienceTab[]).map(tab => (
            <button key={tab} type="button" onClick={() => setAudienceTab(tab)}
              className={cn(
                'text-xs px-3 py-1 radius_8 border capitalize',
                audienceTab === tab ? 'border_accent_secondary bg_info fg_info' : 'border_primary text_secondary hover:bg_secondary',
              )}
            >{tab}</button>
          ))}
        </div>
        <Checkbox checked={useIncludedAudiences} onChange={e => setUseIncludedAudiences(e.target.checked)}>
          <span className="text-xs font-semibold text_primary capitalize">{audienceTab} Audiences</span>
        </Checkbox>
        {useIncludedAudiences && (
          <div className="mt-2">
            <Select mode="multiple" placeholder={`Select custom audiences to ${audienceTab}...`} options={CUSTOM_AUDIENCE_OPTIONS} />
          </div>
        )}
      </div>
    </BuilderCard>
  );
};
