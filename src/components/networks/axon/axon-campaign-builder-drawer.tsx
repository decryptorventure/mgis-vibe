// Axon campaign creation wizard — 2-column layout (steps sidebar + form area)
import React from 'react';
import { Drawer, Input, Select, Segmented } from 'antd';
import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, Download, Gauge, Globe2, MousePointerClick, Rocket, Target, WandSparkles, Zap } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import type { Project } from '@/shared/mock-data';
import { AXON_COLOR, builderSteps, regionGroups, type CampaignBuilderMode, type AxonCampaignRow } from './axon-types';
import { BuilderSection, SelectTile } from './axon-ui-atoms';

const StepsSidebar: React.FC<{ mode: CampaignBuilderMode }> = ({ mode }) => {
  const stateIcon = (state: 'done' | 'warn' | 'pending', idx: number) => {
    if (state === 'done') return <CheckCircle2 size={14} className="text-[var(--text-inverse)]" />;
    if (state === 'warn') return <AlertTriangle size={13} className="text-[var(--text-inverse)]" />;
    return <span className="text-sm font-bold">{idx + 1}</span>;
  };
  const stateBg = (state: 'done' | 'warn' | 'pending') => {
    if (state === 'done') return 'bg-emerald-500';
    if (state === 'warn') return 'bg-amber-500';
    return 'bg_tertiary text_secondary';
  };
  const readiness = mode === 'duplicate' ? 78 : 64;

  return (
    <aside className="w-56 shrink-0 bg_primary border-r border_primary flex flex-col sticky top-0 h-screen overflow-auto">
      <div className="p-4 space-y-0.5">
        <div className="text-[11px] font-semibold text_tertiary uppercase tracking-wide px-2 pb-3">Campaign setup</div>
        {builderSteps.map((step, idx) => (
          <a key={step.key} href={`#axon-${step.key}`}
            className="flex items-center gap-3 px-2 py-2.5 radius_8 no-underline hover:bg_secondary group"
          >
            <span className={cn('w-8 h-8 radius_round flex items-center justify-center shrink-0 text-[var(--text-inverse)] transition-colors', stateBg(step.state))}>
              {stateIcon(step.state, idx)}
            </span>
            <div className="min-w-0">
              <div className={cn('text-sm truncate', step.state !== 'pending' ? 'font-semibold text_primary' : 'text_secondary')}>{step.title}</div>
              <div className="text-[11px] text_tertiary truncate">{step.hint}</div>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-auto p-4 border-t border_secondary">
        <div className="text-xs font-semibold text_tertiary mb-2">Launch readiness</div>
        <div className="h-1.5 radius_round bg_secondary overflow-hidden">
          <div className="h-full radius_round transition-all" style={{ width: `${readiness}%`, backgroundColor: AXON_COLOR }} />
        </div>
        <div className="text-xs text_tertiary mt-1.5">{readiness}% complete</div>
      </div>
    </aside>
  );
};

interface Props {
  activeApp?: Project;
  mode: CampaignBuilderMode;
  open: boolean;
  sourceCampaign?: AxonCampaignRow | null;
  onClose: () => void;
}

export const AxonCampaignBuilderDrawer: React.FC<Props> = ({ activeApp, mode, open, sourceCampaign, onClose }) => {
  const isdup = mode === 'duplicate';
  const campaignName = isdup
    ? `Copy ${sourceCampaign?.name ?? 'Axon campaign'}`
    : `Campaign_${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/-/g, '_')}`;

  return (
    <Drawer width="calc(100vw - 260px)" open={open} onClose={onClose} closable={false}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' }, header: { display: 'none' } }} destroyOnClose
    >
      {/* Header */}
      <div className="h-16 px-6 border-b border_secondary bg_primary flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-sm font-semibold text_primary cursor-pointer">
            <ArrowLeft size={17} />{isdup ? 'Duplicate campaign' : 'Create a campaign'}
          </button>
          <div className="h-5 w-px bg_secondary" />
          <div className="text-xs text_tertiary truncate">{activeApp?.name ?? 'Axon app'} · account_game - 381843</div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="border" size="m" className="gap-1.5"
            onClick={() => toast.info('Imported settings from another project')}
          ><Copy size={14} />Import from project</Button>
          <Button type="button" variant="primary" size="m" className="gap-1.5"
            onClick={() => { onClose(); toast.success(isdup ? 'Duplicate campaign queued' : 'Campaign draft created'); }}
          ><Rocket size={15} />{isdup ? 'Launch duplicate' : 'Launch campaign'}</Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <StepsSidebar mode={mode} />

        <main className="flex-1 overflow-auto bg_secondary">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5 pb-16">
            <BuilderSection id="axon-objective" icon={<Target size={16} />} title="Objective"
              subtitle="Confirm app, campaign type, OS, and naming."
            >
              <div className="space-y-4">
                <div className="radius_8 border border_primary bg_secondary p-4 flex items-center gap-3">
                  <span className="w-11 h-11 radius_8 bg_blue_subtle border border_blue flex items-center justify-center font-semibold fg_blue_strong text-lg shrink-0">
                    {activeApp?.icon ?? 'A'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text_primary">{activeApp?.name ?? 'Axon app'}</div>
                    <div className="text-xs text_tertiary">{activeApp?.package ?? 'com.example.app'}</div>
                  </div>
                  <span className="inline-flex px-2 py-1 radius_6 bg_emerald_subtle fg_emerald_strong border border_emerald text-xs font-semibold shrink-0">Selected</span>
                </div>

                <div className="radius_8 border border_primary p-4 bg_primary flex items-center gap-3">
                  <span className="w-9 h-9 radius_8 bg_emerald_subtle fg_emerald_strong flex items-center justify-center shrink-0">
                    <Download size={16} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text_primary">App promotion</div>
                    <div className="text-xs text_tertiary">Axon CPI/ROAS app install flow</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text_secondary" htmlFor="axon-name">Campaign name <span className="text-[var(--status-error)]">*</span></label>
                  <div className="mt-1.5 flex">
                    <Input id="axon-name" defaultValue={campaignName} className="rounded-r-none" />
                    <Button type="button" variant="border" size="m" className="rounded-l-none gap-1.5"
                      onClick={() => toast.info('Auto name generated')}
                    ><WandSparkles size={14} />Auto Gen</Button>
                  </div>
                  <div className="text-[11px] text_tertiary mt-1">Recommended: App_Geo_Goal_Creative_Date</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SelectTile active={activeApp?.os === 'ios'} title="iOS" subtitle="iTunes app ID tracking" />
                  <SelectTile active={activeApp?.os !== 'ios'} title="Android" subtitle="Package name tracking" />
                </div>
              </div>
            </BuilderSection>

            <BuilderSection id="axon-targeting" icon={<Globe2 size={16} />} title="Targeting"
              subtitle="Select countries by region or by Axon tier."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <SelectTile title="All countries/regions" subtitle="Broadest launch" />
                  <SelectTile active title="Specific regions" subtitle="Pick groups below" />
                  <SelectTile title="By tier" subtitle="Tier 1 / 2 / 3 / 4" />
                </div>
                <div className="radius_8 border border_primary overflow-hidden">
                  {regionGroups.map((region, idx) => (
                    <div key={region.name} className="px-4 py-3 border-b border_secondary last:border-b-0 flex items-center justify-between bg_primary">
                      <label className="flex items-center gap-3 cursor-pointer min-w-0">
                        <input type="checkbox" defaultChecked={idx < 3} className="w-4 h-4 rounded border border_secondary" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text_primary truncate">{region.name}</span>
                          <span className="block text-xs text_tertiary">{region.count} countries</span>
                        </span>
                      </label>
                      <Button type="button" variant="border" size="s">Review</Button>
                    </div>
                  ))}
                </div>
                <div className="radius_8 bg_blue_subtle border border_blue px-3 py-2 text-xs fg_blue_strong">
                  3 regions selected · 130 countries · Bid and goal edits happen inside campaign Countries workspace after launch.
                </div>
              </div>
            </BuilderSection>

            <BuilderSection id="axon-budget" icon={<Gauge size={16} />} title="Budget"
              subtitle="Budget allocation before country-level bid review."
              status="warning"
            >
              <div className="space-y-3">
                <SelectTile title="Combined daily budget" subtitle="One shared daily cap for all countries" />
                <SelectTile active title="Daily budget by country/region" subtitle="Per-country budget rows" />
                <div className="radius_8 border border_primary bg_secondary p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text_primary">Apply default daily budget</div>
                    <div className="text-xs text_tertiary mt-0.5">Pre-fills all selected countries. Adjustable after creation.</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Input addonBefore="$" defaultValue="20.00" className="w-36" />
                    <Button type="button" variant="primary" size="s">Apply all</Button>
                  </div>
                </div>
                <div className="radius_8 border border_amber bg_amber_subtle p-3 text-xs fg_amber_strong">
                  Daily cap: $2,600 · 130 countries · Avg $20/country. Review before aggressive scale.
                </div>
              </div>
            </BuilderSection>

            <BuilderSection id="axon-optimization" icon={<Zap size={16} />} title="Optimization"
              subtitle="Billing goal, report mode, and bidding behavior."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text_secondary">Report mode</div>
                    <div className="text-[11px] text_tertiary mt-0.5">Matches automation rule mode for consistent data.</div>
                  </div>
                  <Segmented defaultValue="cohort" options={[{ label: 'Cohort', value: 'cohort' }, { label: 'Real time', value: 'realtime' }]} />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[['CPI', 'Cost Per Install'], ['CPP', 'Cost Per Purchaser'], ['CPE', 'Cost Per Event'], ['ROAS (IAP)', 'In-App purchase ROAS'], ['ROAS (IAA)', 'Advertising ROAS'], ['ROAS (Blended)', 'Total return on ad spend']].map(([t, s]) => (
                    <SelectTile key={t} active={t === 'CPI'} title={t} subtitle={s} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text_secondary mb-1.5">Set goal</div>
                    <div className="space-y-2">
                      <SelectTile active title="Goal for all countries" />
                      <SelectTile title="Goal by country/region" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text_secondary mb-1.5">Target CPI <span className="text-[var(--status-error)]">*</span></div>
                    <Input addonBefore="$" defaultValue="0.35" />
                    <div className="text-[11px] text_tertiary mt-1">Min $0.01, max $10,000</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text_secondary mb-1.5">Bidding strategy</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <SelectTile active title="Spend as fast as possible" subtitle="CPI billing" />
                    <SelectTile title="Spend evenly throughout the day" subtitle="CPM billing" />
                  </div>
                </div>
              </div>
            </BuilderSection>

            <BuilderSection id="axon-tracking" icon={<MousePointerClick size={16} />} title="Tracking"
              subtitle="Generate or paste MMP links before launch."
              status="warning"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text_secondary">Tracking platform <span className="text-[var(--status-error)]">*</span></label>
                  <div className="mt-1.5 flex gap-2">
                    <Select defaultValue="adjust" className="flex-1" options={[{ value: 'adjust', label: 'Adjust' }, { value: 'appsflyer', label: 'AppsFlyer' }]} />
                    <Button type="button" variant="border" size="m" className="gap-1.5 shrink-0">
                      <WandSparkles size={14} />Get Link
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text_secondary">Impression link <span className="text-[var(--status-error)]">*</span></label>
                  <Input.TextArea className="mt-1.5" rows={2} placeholder="Paste impression link" />
                </div>
                <div>
                  <label className="text-xs font-semibold text_secondary">Click link <span className="text-[var(--status-error)]">*</span></label>
                  <Input.TextArea className="mt-1.5" rows={2} placeholder="Paste click link" />
                </div>
              </div>
            </BuilderSection>
          </div>
        </main>
      </div>
    </Drawer>
  );
};
