// meta-batch-setup-stepper.tsx — left panel of the batch generator setup phase:
// prompt-to-criteria box, preset load/save, and a 3-step guided picker (Templates → Themes → Creative Split)
// instead of showing all three pickers stacked at once (reduces cognitive load).
import React, { useState } from 'react';
import { Select } from '@/components/ui-kit-compat';
import { Button, cn } from '@frontend-team/ui-kit';
import { Bookmark, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BatchPromptCriteria } from './meta-batch-prompt-criteria';
import type { PromptCriteriaResult } from './meta-batch-prompt-parser';
import { BatchTemplatePicker } from './meta-batch-template-picker';
import { BatchThemePicker } from './meta-batch-theme-picker';
import { BatchCreativeConfig } from './meta-batch-creative-config';
import type { BatchPreset, BatchTheme } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';

const STEPS = [
  { key: 'templates', label: 'Templates' },
  { key: 'themes', label: 'Themes' },
  { key: 'creatives', label: 'Creative Split' },
] as const;

interface Props {
  templates: MetaTemplate[];
  themes: BatchTheme[];
  selectedTemplateIds: string[];
  selectedThemeIds: string[];
  minCreatives: number;
  onToggleTemplate: (id: string) => void;
  onToggleTheme: (id: string) => void;
  onMinCreativesChange: (v: number) => void;
  sampleFileCount?: number;
  onApplyPromptCriteria: (result: PromptCriteriaResult) => void;
  presets: BatchPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: BatchPreset) => void;
}

export const BatchSetupStepper: React.FC<Props> = ({
  templates, themes, selectedTemplateIds, selectedThemeIds, minCreatives,
  onToggleTemplate, onToggleTheme, onMinCreativesChange, sampleFileCount,
  onApplyPromptCriteria, presets, onSavePreset, onLoadPreset,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [savingName, setSavingName] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border_secondary shrink-0">
        <BatchPromptCriteria templates={templates} themes={themes} onApply={onApplyPromptCriteria} />

        {/* Preset load/save row */}
        <div className="flex items-center gap-1.5">
          <Select
            size="small"
            className="flex-1 min-w-0"
            placeholder="Load a saved preset"
            value={undefined}
            options={presets.map(p => ({ value: p.id, label: p.name }))}
            onChange={id => { const p = presets.find(x => x.id === id); if (p) onLoadPreset(p); }}
          />
          {savingName === null ? (
            <button type="button" aria-label="Save current criteria as preset" onClick={() => setSavingName('')}
              className="shrink-0 w-7 h-7 flex items-center justify-center radius_8 border border_secondary text_tertiary hover:text_primary hover:border_primary transition-colors">
              <Bookmark size={13} />
            </button>
          ) : null}
        </div>
        {savingName !== null && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <input value={savingName} onChange={e => setSavingName(e.target.value)}
              placeholder="Preset name" aria-label="Preset name"
              className="flex-1 min-w-0 border border_primary radius_8 px-2.5 py-1 text-[11px] text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary" />
            <button type="button" aria-label="Confirm save preset"
              onClick={() => { if (savingName.trim()) { onSavePreset(savingName.trim()); setSavingName(null); } }}
              className="shrink-0 w-7 h-7 flex items-center justify-center radius_8 bg-[var(--status-info)] text-white">
              <Check size={13} />
            </button>
            <button type="button" aria-label="Cancel save preset" onClick={() => setSavingName(null)}
              className="shrink-0 w-7 h-7 flex items-center justify-center radius_8 border border_secondary text_tertiary">
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Step nav */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border_secondary shrink-0" role="tablist" aria-label="Batch setup steps">
        {STEPS.map((step, i) => (
          <button key={step.key} type="button" role="tab" aria-selected={stepIndex === i}
            onClick={() => setStepIndex(i)}
            className={cn(
              'flex-1 text-[11px] font-semibold px-2 py-1.5 radius_8 border transition-colors truncate',
              stepIndex === i ? 'border_accent_secondary bg_info fg_info' : 'border_secondary text_tertiary hover:text_secondary'
            )}>
            {i + 1}. {step.label}
            {step.key === 'templates' && ` (${selectedTemplateIds.length})`}
            {step.key === 'themes' && ` (${selectedThemeIds.length})`}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 p-3 overflow-hidden min-h-0">
        {stepIndex === 0 && (
          <BatchTemplatePicker templates={templates} selected={selectedTemplateIds} onToggle={onToggleTemplate} />
        )}
        {stepIndex === 1 && (
          <BatchThemePicker themes={themes} selected={selectedThemeIds} onToggle={onToggleTheme} />
        )}
        {stepIndex === 2 && (
          <div className="h-full flex flex-col">
            <div className="text-xs font-semibold text_secondary uppercase tracking-wide mb-2">Creative Split</div>
            <BatchCreativeConfig value={minCreatives} onChange={onMinCreativesChange} sampleFileCount={sampleFileCount} />
          </div>
        )}
      </div>

      {/* Prev/Next */}
      <div className="flex items-center justify-between px-3 py-2 border-t border_secondary shrink-0">
        <Button type="button" variant="border" size="s" className="gap-1"
          disabled={stepIndex === 0} onClick={() => setStepIndex(i => Math.max(0, i - 1))}>
          <ChevronLeft size={12} />Back
        </Button>
        <Button type="button" variant="border" size="s" className="gap-1"
          disabled={stepIndex === STEPS.length - 1} onClick={() => setStepIndex(i => Math.min(STEPS.length - 1, i + 1))}>
          Next<ChevronRight size={12} />
        </Button>
      </div>
    </div>
  );
};
