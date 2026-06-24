// MetaBuilderDrawer — full-screen Meta campaign wizard with step sidebar + form content
import React, { useEffect, useState } from 'react';
import { Drawer, Select } from 'antd';
import { ArrowLeft, ArrowRight, CheckCircle2, Layers3, Megaphone, PanelRightOpen, Plus, Rocket, Sparkles, X } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { MetaPage, MetaTemplate, BuilderContext } from './meta-types';
import { CampaignSettingsForm, AdsetSettingsForm, AdCreativeForm } from './meta-builder-forms';

type StepKey = 'campaign' | 'adset' | 'creative';

const WIZARD_STEPS: { key: StepKey; icon: React.ElementType; label: string; desc: string }[] = [
  { key: 'campaign', icon: Megaphone, label: 'Campaign', desc: 'Objective & budget' },
  { key: 'adset', icon: Layers3, label: 'Ad Set', desc: 'Audience & placements' },
  { key: 'creative', icon: PanelRightOpen, label: 'Ad Creative', desc: 'Media & copy' },
];

interface WizardNavProps {
  active: StepKey;
  onSelect: (k: StepKey) => void;
  context: BuilderContext;
}

const WizardNav: React.FC<WizardNavProps> = ({ active, onSelect, context }) => {
  const activeIdx = WIZARD_STEPS.findIndex(s => s.key === active);
  const names: Record<StepKey, string> = {
    campaign: context.campaign?.name ?? context.draft?.name ?? 'New Campaign',
    adset: context.adSet?.name ?? 'New Ad Set',
    creative: context.ad?.name ?? 'New Ad',
  };

  return (
    <aside className="w-64 shrink-0 bg_primary border-r border_primary p-4 flex flex-col">
      {/* Brand header */}
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border_secondary">
        <div className="w-9 h-9 radius_8 bg_secondary border border_secondary flex items-center justify-center">
          <img src="/logo/meta.png" alt="Meta" className="w-5 h-5 object-contain" />
        </div>
        <div>
          <div className="text-sm font-bold text_primary leading-tight">Meta Ads</div>
          <div className="text-[11px] text_tertiary">Campaign Builder</div>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-1 flex-1">
        {WIZARD_STEPS.map(({ key, desc, label }, idx) => {
          const isActive = key === active;
          const isDone = idx < activeIdx;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                'w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border cursor-pointer transition-colors',
                isActive ? 'bg_blue_subtle border_blue' : 'border-transparent hover:bg_secondary',
              )}
            >
              <div className={cn('w-7 h-7 radius_round flex items-center justify-center text-[10px] font-bold z-10',
                isDone ? 'bg-[var(--status-success)] text-[var(--text-inverse)]' : isActive ? 'bg-[var(--status-info)] text-[var(--text-inverse)]' : 'bg_secondary text_tertiary',
              )}>
                {isDone ? '✓' : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-semibold leading-tight truncate', isActive ? 'fg_blue_strong' : isDone ? 'text-[var(--status-success)]' : 'text_primary')}>
                  {names[key]}
                </div>
                <div className="text-[11px] text_tertiary mt-0.5">{label} · {desc}</div>
              </div>
              {isDone && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Add Ad Set */}
      <div className="mt-4 pt-3 border-t border_secondary">
        <Button type="button" variant="border" size="s" className="w-full gap-1.5 text-xs justify-center">
          <Plus size={12} />Add Ad Set
        </Button>
      </div>
    </aside>
  );
};

interface MetaBuilderDrawerProps {
  open: boolean;
  onClose: () => void;
  context: BuilderContext;
  pages: MetaPage[];
  templates: MetaTemplate[];
}

export const MetaBuilderDrawer: React.FC<MetaBuilderDrawerProps> = ({ open, onClose, context, pages, templates }) => {
  const toStep = (entity: string): StepKey =>
    entity === 'campaigns' ? 'campaign' : entity === 'adsets' ? 'adset' : 'creative';

  const [activeTab, setActiveTab] = useState<StepKey>(toStep(context.entity));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab((context.initialStep as StepKey | undefined) ?? toStep(context.entity));
    setSelectedTemplateId(undefined);
  }, [context.entity, context.initialStep, open]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const activeIdx = WIZARD_STEPS.findIndex(s => s.key === activeTab);
  const prevKey = activeIdx > 0 ? WIZARD_STEPS[activeIdx - 1].key : null;
  const nextKey = activeIdx < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[activeIdx + 1].key : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width="calc(100vw - 72px)"
      title={null}
      closable={false}
      styles={{
        body: { padding: 0, display: 'flex', background: 'var(--ds-bg-canvas-secondary)', overflow: 'hidden', height: '100%' },
        header: { display: 'none' },
        footer: { padding: '10px 16px' },
      }}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button type="button" variant="border" size="s" className="gap-1.5" onClick={onClose}>
              <X size={13} />Close
            </Button>
            {prevKey && (
              <Button type="button" variant="border" size="m" className="gap-1.5" onClick={() => setActiveTab(prevKey)}>
                <ArrowLeft size={14} />Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text_secondary">
            <CheckCircle2 size={13} className="fg_emerald_accent" />Auto-saved draft
          </div>
          <div>
            {nextKey ? (
              <Button type="button" variant="primary" size="m" className="gap-1.5" onClick={() => setActiveTab(nextKey)}>
                Next <ArrowRight size={14} />
              </Button>
            ) : (
              <Button type="button" variant="primary" size="m" className="gap-1.5">
                <Rocket size={14} />Launch Campaign
              </Button>
            )}
          </div>
        </div>
      }
    >
      <WizardNav active={activeTab} onSelect={setActiveTab} context={context} />

      {/* Form content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-4">
          {/* Template picker */}
          <div className="border border_blue bg_blue_subtle radius_8 px-3 py-2.5 flex items-center gap-3">
            <Sparkles size={15} className="fg_blue_accent shrink-0" />
            <span className="text-sm font-semibold text_primary whitespace-nowrap">Apply Template</span>
            <Select
              size="small"
              className="flex-1"
              placeholder="Choose a template to auto-fill..."
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
              allowClear
              options={templates.map(t => ({ value: t.id, label: t.name }))}
            />
          </div>

          {activeTab === 'campaign' && (
            <CampaignSettingsForm key={`campaign-${selectedTemplate?.id ?? 'none'}`} context={context} template={selectedTemplate} />
          )}
          {activeTab === 'adset' && (
            <AdsetSettingsForm key={`adset-${selectedTemplate?.id ?? 'none'}`} context={context} template={selectedTemplate} />
          )}
          {activeTab === 'creative' && (
            <AdCreativeForm key={`creative-${selectedTemplate?.id ?? 'none'}`} context={context} pages={pages} template={selectedTemplate} />
          )}
        </div>
      </div>
    </Drawer>
  );
};
