// Google UAC builder — Objective, Campaign Settings, Budget sections
import React from 'react';
import { Input, Select } from '@/components/ui-kit-compat';
import { Download, Gauge, MousePointerClick, TrendingUp, WandSparkles } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import { BuilderSection } from '@/components/networks/axon/axon-ui-atoms';
import type { Project } from '@/shared/mock-data';
import { GOOGLE_COLOR, GOOGLE_ACCOUNTS, BIDDING_GOALS, type GoogleBuilderState, type GoogleLocationMode, type GoogleBiddingFocus } from './google-types';

// ─── Reusable Google-colored SelectTile ──────────────────────────────────────

export const GSelectTile: React.FC<{
  active?: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}> = ({ active, title, subtitle, icon, onClick }) => (
  <button type="button" onClick={onClick}
    className={cn('min-h-[52px] radius_8 border px-4 py-3 bg_primary text-left flex items-center gap-3 transition-colors cursor-pointer w-full',
      active ? '' : 'border_primary hover:bg_secondary')}
    style={active ? { borderColor: GOOGLE_COLOR, backgroundColor: `${GOOGLE_COLOR}0F` } : undefined}
  >
    {icon && <span className="shrink-0 text_secondary">{icon}</span>}
    <span className={cn('w-4 h-4 radius_round border flex items-center justify-center shrink-0', active ? '' : 'border_secondary')}
      style={active ? { borderColor: GOOGLE_COLOR } : undefined}>
      {active && <span className="w-2 h-2 radius_round" style={{ backgroundColor: GOOGLE_COLOR }} />}
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text_primary truncate">{title}</span>
      {subtitle && <span className="block text-xs text_tertiary mt-0.5 truncate">{subtitle}</span>}
    </span>
  </button>
);

// ─── Objective Section ────────────────────────────────────────────────────────

interface ObjectiveProps {
  activeApp?: Project;
  state: GoogleBuilderState;
  onChange: (patch: Partial<GoogleBuilderState>) => void;
}

export const GoogleObjectiveSection: React.FC<ObjectiveProps> = ({ activeApp, state, onChange }) => (
  <BuilderSection id="google-objective" icon={<Download size={16} />} title="Objective"
    subtitle="App, campaign type, name, and OS platform.">
    <div className="space-y-4">
      {/* App card */}
      <div className="radius_8 border border_primary bg_secondary p-3 flex items-center gap-3">
        <span className="w-10 h-10 radius_8 bg_primary border border_secondary flex items-center justify-center font-bold text-lg shrink-0"
          style={{ color: GOOGLE_COLOR }}>
          {activeApp?.icon ?? 'G'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text_primary truncate">{activeApp?.name ?? 'Select an app'}</div>
          <div className="text-xs text_tertiary truncate">{activeApp?.package ?? '—'}</div>
        </div>
        <span className="inline-flex px-2 py-0.5 radius_6 bg_blue_subtle fg_blue_strong border border_blue text-xs font-semibold shrink-0">Selected</span>
      </div>

      {/* Campaign type — read-only */}
      <div className="radius_8 border border_primary bg_primary p-3 flex items-center gap-3">
        <span className="w-9 h-9 radius_8 flex items-center justify-center bg_secondary border border_secondary shrink-0">
          <Download size={16} className="text_secondary" />
        </span>
        <div>
          <div className="text-sm font-semibold text_primary">App promotion</div>
          <div className="text-xs text_tertiary">Universal App Campaign (UAC)</div>
        </div>
      </div>

      {/* Campaign name */}
      <div>
        <label className="text-xs font-semibold text_secondary block mb-1.5">
          Campaign name <span className="fg_error">*</span>
        </label>
        <div className="flex">
          <Input value={state.campaignName} onChange={e => onChange({ campaignName: e.target.value })}
            placeholder="e.g. Zego_Draw_US_Install_Q2" className="rounded-r-none" />
          <Button type="button" variant="border" size="m" className="rounded-l-none gap-1.5 shrink-0"
            onClick={() => onChange({ campaignName: `${activeApp?.name ?? 'App'}_UAC_${new Date().toISOString().slice(0, 10)}` })}>
            <WandSparkles size={14} />Auto Gen
          </Button>
        </div>
      </div>

      {/* OS */}
      <div>
        <label className="text-xs font-semibold text_secondary block mb-1.5">OS <span className="fg_error">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          <GSelectTile active={state.os === 'ios'} title="iOS" subtitle="App Store tracking"
            onClick={() => onChange({ os: 'ios' })} />
          <GSelectTile active={state.os === 'android'} title="Android" subtitle="Google Play tracking"
            onClick={() => onChange({ os: 'android' })} />
        </div>
      </div>
    </div>
  </BuilderSection>
);

// ─── Campaign Settings Section ────────────────────────────────────────────────

interface SettingsProps { state: GoogleBuilderState; onChange: (patch: Partial<GoogleBuilderState>) => void }

const LOCATION_MODES: { value: GoogleLocationMode; label: string; desc: string }[] = [
  { value: 'all', label: 'All countries and territories', desc: 'Maximum global reach' },
  { value: 'enter', label: 'Enter another location', desc: 'Specify countries manually' },
  { value: 'bulk-include', label: 'Bulk include', desc: 'Upload country list' },
  { value: 'bulk-exclude', label: 'Bulk exclude', desc: 'Exclude specific countries' },
];

export const GoogleSettingsSection: React.FC<SettingsProps> = ({ state, onChange }) => (
  <BuilderSection id="google-settings" icon={<Gauge size={16} />} title="Campaign Settings"
    subtitle="Account, location targeting, and location options.">
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text_secondary block mb-1.5">Account <span className="fg_error">*</span></label>
        <Select value={state.account} onChange={v => onChange({ account: v as string })} className="w-full"
          options={GOOGLE_ACCOUNTS} />
      </div>

      {/* Location targeting */}
      <div>
        <label className="text-xs font-semibold text_secondary block mb-2">Location</label>
        <div className="grid grid-cols-2 gap-2">
          {LOCATION_MODES.map(m => (
            <GSelectTile key={m.value} active={state.locationMode === m.value}
              title={m.label} subtitle={m.desc} onClick={() => onChange({ locationMode: m.value as GoogleLocationMode })} />
          ))}
        </div>
      </div>

      {/* Location options */}
      <div className="radius_8 border border_primary overflow-hidden">
        <div className="px-4 py-2 bg_secondary border-b border_secondary text-xs font-semibold text_tertiary">
          Location options
        </div>
        <div className="divide-y divide-[var(--ds-border-secondary)]">
          <div className="p-3">
            <div className="text-[11px] text_tertiary mb-2 font-semibold">— Include —</div>
            {[
              { label: 'Presence or interest', desc: "People in, regularly in, or who've shown interest in your included locations (recommended)", val: true },
              { label: 'Presence only', desc: 'People in or regularly in your included locations', val: false },
            ].map(opt => (
              <label key={opt.label} className="flex items-start gap-2.5 cursor-pointer mb-2 last:mb-0">
                <input type="radio" name="include-presence" checked={state.locationIncludePresence === opt.val}
                  onChange={() => onChange({ locationIncludePresence: opt.val })}
                  className="mt-1 shrink-0" style={{ accentColor: GOOGLE_COLOR }} />
                <span className="text-xs text_secondary leading-5">
                  <span className="font-semibold text_primary">{opt.label}: </span>{opt.desc}
                </span>
              </label>
            ))}
          </div>
          <div className="p-3">
            <div className="text-[11px] text_tertiary mb-2 font-semibold">— Exclude —</div>
            {[
              { label: 'Presence', desc: 'People in your excluded locations (recommended)', val: true },
              { label: 'Presence or interest', desc: "People in, regularly in, or who've shown interest in your excluded locations", val: false },
            ].map(opt => (
              <label key={opt.label} className="flex items-start gap-2.5 cursor-pointer mb-2 last:mb-0">
                <input type="radio" name="exclude-presence" checked={state.locationExcludePresence === opt.val}
                  onChange={() => onChange({ locationExcludePresence: opt.val })}
                  className="mt-1 shrink-0" style={{ accentColor: GOOGLE_COLOR }} />
                <span className="text-xs text_secondary leading-5">
                  <span className="font-semibold text_primary">{opt.label}: </span>{opt.desc}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  </BuilderSection>
);

// ─── Budget and Bidding Section ───────────────────────────────────────────────

interface BudgetProps { state: GoogleBuilderState; onChange: (patch: Partial<GoogleBuilderState>) => void }

const biddingIcons: Record<string, React.ReactNode> = {
  installs: <MousePointerClick size={16} />,
  actions: <TrendingUp size={16} />,
  roas: <Gauge size={16} />,
};

export const GoogleBudgetSection: React.FC<BudgetProps> = ({ state, onChange }) => {
  const activeGoal = BIDDING_GOALS.find(g => g.value === state.biddingFocus);
  return (
    <BuilderSection id="google-budget" icon={<TrendingUp size={16} />} title="Budget and Bidding"
      subtitle="Daily budget cap and bidding goal strategy." status="warning">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text_secondary block mb-1.5">
            Budget <span className="fg_error">*</span>
          </label>
          <Input addonBefore="$" value={state.budget} onChange={e => onChange({ budget: e.target.value })}
            placeholder="0.00" type="number" min={1} />
          <div className="text-[11px] text_tertiary mt-1">Daily budget — Google may spend up to 2× on high-conversion days.</div>
        </div>

        <div>
          <label className="text-xs font-semibold text_secondary block mb-2">
            What do you want to focus on? <span className="fg_error">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BIDDING_GOALS.map(g => (
              <GSelectTile key={g.value} active={state.biddingFocus === g.value}
                title={g.label} subtitle={g.desc} icon={biddingIcons[g.value]}
                onClick={() => onChange({ biddingFocus: g.value as GoogleBiddingFocus })} />
            ))}
          </div>
        </div>

        {activeGoal && activeGoal.value !== 'installs' && (
          <div>
            <label className="text-xs font-semibold text_secondary block mb-1.5">
              {activeGoal.hint} <span className="fg_error">*</span>
            </label>
            <Input addonBefore={activeGoal.value === 'roas' ? '×' : '$'} value={state.targetValue}
              onChange={e => onChange({ targetValue: e.target.value })} placeholder="e.g. 0.50" />
          </div>
        )}

        <div className="radius_8 border border_blue bg_blue_subtle p-3 text-xs fg_blue_strong">
          Smart Bidding automatically adjusts bids in real-time. Set a target, and Google optimizes delivery toward your goal.
        </div>
      </div>
    </BuilderSection>
  );
};
