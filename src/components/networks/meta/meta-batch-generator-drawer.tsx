// meta-batch-generator-drawer.tsx — Batch Campaign Generator fullscreen drawer shell
// 2-panel layout: left = step-gated criteria pickers, right = live campaign preview (always visible)
// All state/logic lives in useBatchGeneratorState; this file is a thin JSX shell.
import React from 'react';
import { Drawer } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { BatchAdCopy, BatchJob, BatchPreset, BatchRegenerateRequest, BatchRun } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';
import { BatchSetupStepper } from './meta-batch-setup-stepper';
import { BatchLivePreview } from './meta-batch-matrix-preview';
import { BatchPreflightPanel } from './meta-batch-preflight-panel';
import { BatchProgressTracker } from './meta-batch-progress-tracker';
import { useBatchGeneratorState } from './use-batch-generator-state';

interface Props {
  open: boolean;
  onClose: () => void;
  templates: MetaTemplate[];
  existingCampaignNames: string[];
  presets: BatchPreset[];
  onSavePreset: (preset: BatchPreset) => void;
  onBatchComplete?: (run: BatchRun) => void;
  onGenerateDrafts?: (jobs: BatchJob[], adCopy: BatchAdCopy, runId: string) => void;
  onViewHistory?: () => void;
  regenerateRequest?: BatchRegenerateRequest;
}

export const BatchGeneratorDrawer: React.FC<Props> = ({
  open, onClose, templates, existingCampaignNames, presets, onSavePreset,
  onBatchComplete, onGenerateDrafts, onViewHistory, regenerateRequest,
}) => {
  const s = useBatchGeneratorState({ templates, existingCampaignNames, onSavePreset, onBatchComplete, onGenerateDrafts, regenerateRequest });

  const handleClose = () => { s.resetAll(); onClose(); };

  return (
    <Drawer open={open} onClose={handleClose} placement="right"
      width="calc(100vw - 72px)" title={null} closable={false}
      styles={{
        body: { padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' },
        header: { display: 'none' },
      }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border_primary shrink-0">
        <div className="w-9 h-9 radius_8 bg_info flex items-center justify-center">
          <Sparkles size={16} className="fg_info" />
        </div>
        <div>
          <div className="body_s font-bold text_primary">Batch Campaign Generator</div>
          <div className="text-[11px] text_tertiary">Templates × Themes → generate campaigns in bulk</div>
        </div>
        <button type="button" onClick={handleClose} aria-label="Close batch generator"
          className="ml-auto text_tertiary hover:text_primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {s.phase === 'setup' && (
          <div className="flex h-full">
            {/* Left panel: prompt + presets + step-gated pickers */}
            <div className="w-[320px] shrink-0 border-r border_primary overflow-hidden">
              <BatchSetupStepper
                templates={s.batchableTemplates}
                themes={s.themes}
                selectedTemplateIds={s.selectedTemplateIds}
                selectedThemeIds={s.selectedThemeIds}
                minCreatives={s.minCreatives}
                onToggleTemplate={s.onToggleTemplate}
                onToggleTheme={s.onToggleTheme}
                onMinCreativesChange={s.setMinCreatives}
                sampleFileCount={s.selectedThemes[0]?.files.length}
                onApplyPromptCriteria={s.handleApplyPromptCriteria}
                presets={presets}
                onSavePreset={s.handleSavePreset}
                onLoadPreset={s.handleLoadPreset}
              />
            </div>

            {/* Right panel: live preview */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <BatchLivePreview
                  combinations={s.liveCombinations}
                  excludedCampaigns={s.excludedCampaigns}
                  namePattern={s.namePattern}
                  onNamePatternChange={s.setNamePattern}
                  onToggleExclude={s.toggleExclude}
                  onToggleAll={s.handleToggleAll}
                  adCopy={s.adCopy}
                  onAdCopyChange={s.setAdCopy}
                />
              </div>
              {s.canGenerate && <BatchPreflightPanel issues={s.preflightIssues} />}
            </div>
          </div>
        )}
        {s.phase === 'progress' && (
          <BatchProgressTracker jobs={s.jobs} onClose={handleClose} onBatchComplete={s.handleBatchComplete} onViewHistory={onViewHistory} />
        )}
      </div>

      {/* Footer — setup phase only */}
      {s.phase === 'setup' && (
        <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
          <div className="flex items-center gap-1 text-xs flex-wrap">
            {s.canGenerate ? (
              <>
                <span className="font-semibold fg_info">{s.selectedTemplates.length}</span>
                <span className="text_tertiary">templates ×</span>
                <span className="font-semibold fg_info">{s.selectedThemes.length}</span>
                <span className="text_tertiary">themes →</span>
                <span className="font-semibold text_primary">{s.totalCampaignCount}</span>
                <span className="text_tertiary">campaign{s.totalCampaignCount !== 1 ? 's' : ''}{s.hasSlicing ? ' (creative-split)' : ''}</span>
                {s.activeCombCount < s.totalCombCount && (
                  <span className="text_tertiary">· {s.activeCombCount}/{s.totalCombCount} groups active</span>
                )}
              </>
            ) : (
              <span className="text_tertiary">Select at least 1 template and 1 theme to preview</span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button type="button" variant="border" size="m" onClick={handleClose}>Cancel</Button>
            <Button type="button" variant="primary" size="m" className="gap-1.5"
              disabled={!s.canGenerate || s.totalCampaignCount === 0} onClick={() => s.setConfirmOpen(true)}>
              Generate {s.totalCampaignCount > 0 ? `${s.totalCampaignCount} Campaign${s.totalCampaignCount !== 1 ? 's' : ''}` : 'Campaigns'}
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={s.confirmOpen}
        onConfirm={s.handleGenerate}
        onCancel={() => s.setConfirmOpen(false)}
        title={`Generate ${s.totalCampaignCount} campaign${s.totalCampaignCount !== 1 ? 's' : ''}?`}
        description={
          s.totalCampaignCount > 10
            ? `This is a large batch — ${s.totalCampaignCount} campaigns will be created across ${s.selectedTemplates.length} template(s) and ${s.selectedThemes.length} theme(s). This cannot be undone from here.`
            : `${s.totalCampaignCount} campaign${s.totalCampaignCount !== 1 ? 's' : ''} will be created as drafts.`
        }
        confirmLabel="Generate"
        danger={s.totalCampaignCount > 10}
      />
    </Drawer>
  );
};
