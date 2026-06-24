// Google UAC campaign creation wizard — full-page drawer (2-column layout)
import React, { useState } from 'react';
import { Drawer } from 'antd';
import { AlertTriangle, ArrowLeft, CheckCircle2, Rocket } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import type { Project } from '@/shared/mock-data';
import { GOOGLE_COLOR, googleBuilderSteps, defaultBuilderState, type GoogleBuilderState } from './google-types';
import { GoogleObjectiveSection, GoogleSettingsSection, GoogleBudgetSection } from './google-builder-sections';
import { GoogleAdgroupSection } from './google-builder-adgroup-section';

// ─── Steps sidebar ────────────────────────────────────────────────────────────

const StepsSidebar: React.FC<{ state: GoogleBuilderState }> = ({ state }) => {
  const readiness = (() => {
    let pts = 0;
    if (state.campaignName) pts += 25;
    if (state.account) pts += 25;
    if (state.budget) pts += 25;
    if (state.titles.some(Boolean)) pts += 25;
    return pts;
  })();

  const stepState = (key: string): 'done' | 'warn' | 'pending' => {
    if (key === 'objective') return state.campaignName ? 'done' : 'warn';
    if (key === 'settings') return state.account ? 'done' : 'warn';
    if (key === 'budget') return state.budget ? 'done' : 'warn';
    if (key === 'adgroup') return state.titles.some(Boolean) ? 'done' : 'warn';
    return 'pending';
  };

  const stateIcon = (s: 'done' | 'warn' | 'pending', idx: number) => {
    if (s === 'done') return <CheckCircle2 size={14} className="text-white" />;
    if (s === 'warn') return <AlertTriangle size={13} className="text-white" />;
    return <span className="text-sm font-bold">{idx + 1}</span>;
  };
  const stateBg = (s: 'done' | 'warn' | 'pending') => {
    if (s === 'done') return 'bg-emerald-500';
    if (s === 'warn') return 'bg-amber-500';
    return 'bg_tertiary text_secondary';
  };

  return (
    <aside className="w-56 shrink-0 bg_primary border-r border_primary flex flex-col sticky top-0 h-screen overflow-auto">
      <div className="p-4 space-y-0.5">
        <div className="text-[11px] font-semibold text_tertiary uppercase tracking-wide px-2 pb-3">Google UAC setup</div>
        {googleBuilderSteps.map((step, idx) => {
          const s = stepState(step.key);
          return (
            <a key={step.key} href={`#google-${step.key}`}
              className="flex items-center gap-3 px-2 py-2.5 radius_8 no-underline hover:bg_secondary group">
              <span className={cn('w-8 h-8 radius_round flex items-center justify-center shrink-0 text-white transition-colors', stateBg(s))}>
                {stateIcon(s, idx)}
              </span>
              <div className="min-w-0">
                <div className={cn('text-sm truncate', s !== 'pending' ? 'font-semibold text_primary' : 'text_secondary')}>
                  {step.title}
                </div>
                <div className="text-[11px] text_tertiary truncate">{step.hint}</div>
              </div>
            </a>
          );
        })}
      </div>
      <div className="mt-auto p-4 border-t border_secondary">
        <div className="text-xs font-semibold text_tertiary mb-2">Launch readiness</div>
        <div className="h-1.5 radius_round bg_secondary overflow-hidden">
          <div className="h-full radius_round transition-all" style={{ width: `${readiness}%`, backgroundColor: GOOGLE_COLOR }} />
        </div>
        <div className="text-xs text_tertiary mt-1.5">{readiness}% complete</div>
      </div>
    </aside>
  );
};

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  activeApp?: Project;
  onClose: () => void;
}

export const GoogleCampaignBuilderDrawer: React.FC<Props> = ({ open, activeApp, onClose }) => {
  const [form, setForm] = useState<GoogleBuilderState>(defaultBuilderState);
  const patch = (p: Partial<GoogleBuilderState>) => setForm(s => ({ ...s, ...p }));

  const handleLaunch = () => {
    if (!form.campaignName) { toast.error('Campaign name is required'); return; }
    if (!form.budget) { toast.error('Budget is required'); return; }
    onClose();
    toast.success('Google UAC campaign draft created');
  };

  return (
    <Drawer
      width="calc(100vw - 260px)"
      open={open}
      onClose={onClose}
      closable={false}
      destroyOnClose
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' }, header: { display: 'none' } }}
    >
      {/* Header */}
      <div className="h-16 px-6 border-b border_secondary bg_primary flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button type="button" onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text_primary cursor-pointer bg-transparent border-0">
            <ArrowLeft size={17} />Create Google UAC campaign
          </button>
          <div className="h-5 w-px bg_secondary" />
          <div className="text-xs text_tertiary truncate">
            {activeApp?.name ?? 'App'} · {form.account || 'Brain 3'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="border" size="m" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="primary" size="m" className="gap-1.5"
            onClick={handleLaunch}
            style={{ backgroundColor: GOOGLE_COLOR, borderColor: GOOGLE_COLOR }}>
            <Rocket size={15} />Launch campaign
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <StepsSidebar state={form} />
        <main className="flex-1 overflow-auto bg_secondary">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5 pb-16">
            <GoogleObjectiveSection activeApp={activeApp} state={form} onChange={patch} />
            <GoogleSettingsSection state={form} onChange={patch} />
            <GoogleBudgetSection state={form} onChange={patch} />
            <GoogleAdgroupSection state={form} onChange={patch} />
          </div>
        </main>
      </div>
    </Drawer>
  );
};
