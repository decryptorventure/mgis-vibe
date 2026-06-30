// meta-batch-generator-drawer.tsx — Batch Campaign Generator fullscreen drawer shell
// 2-panel layout: left = criteria pickers, right = live campaign preview (always visible)
import React, { useMemo, useState } from 'react';
import { Drawer } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { computeSlices, DEFAULT_AD_COPY } from './meta-batch-types';
import type { BatchAdCopy, BatchCombination, BatchGeneratorPhase, BatchJob, BatchRun, NamePattern } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';
import { DEFAULT_NAME_PATTERN, MOCK_MEDIA_FILES, resolveNamePattern, toThemeList } from './meta-theme-parser';
import { BatchTemplatePicker } from './meta-batch-template-picker';
import { BatchThemePicker } from './meta-batch-theme-picker';
import { BatchCreativeConfig } from './meta-batch-creative-config';
import { BatchLivePreview } from './meta-batch-matrix-preview';
import { BatchProgressTracker } from './meta-batch-progress-tracker';

interface Props {
  open: boolean;
  onClose: () => void;
  templates: MetaTemplate[];
  onBatchComplete?: (run: BatchRun) => void;
  onViewHistory?: () => void;
  regenerateJobs?: BatchJob[];
}

const toggle = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

export const BatchGeneratorDrawer: React.FC<Props> = ({ open, onClose, templates, onBatchComplete, onViewHistory, regenerateJobs }) => {
  const isRegen = Boolean(regenerateJobs && regenerateJobs.length > 0);
  const [phase, setPhase]                             = useState<BatchGeneratorPhase>(isRegen ? 'progress' : 'setup');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedThemeIds, setSelectedThemeIds]       = useState<string[]>([]);
  const [minCreatives, setMinCreatives]               = useState(5);
  const [namePattern, setNamePattern]                 = useState<NamePattern>(DEFAULT_NAME_PATTERN);
  const [adCopy, setAdCopy]                           = useState<BatchAdCopy>(DEFAULT_AD_COPY);
  const [excludedCampaigns, setExcludedCampaigns]     = useState<Set<string>>(new Set());
  const [jobs, setJobs]                               = useState<BatchJob[]>(regenerateJobs ?? []);

  // Templates must have an account bound; filter others out
  const batchableTemplates = templates.filter(t => t.account);
  const themes   = useMemo(() => toThemeList(MOCK_MEDIA_FILES), []);

  const selectedTemplates = batchableTemplates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedThemes    = themes.filter(th => selectedThemeIds.includes(th.id));
  const canGenerate       = selectedTemplates.length > 0 && selectedThemes.length > 0;

  // Live combinations — T×Th matrix with creative slicing.
  // excluded = true only when ALL slices of a combo are excluded (for styling).
  const liveCombinations = useMemo<BatchCombination[]>(() => {
    if (!canGenerate) return [];
    return selectedTemplates.flatMap(t =>
      selectedThemes.map(th => {
        const id = `${t.id}:${th.id}`;
        const slices = computeSlices(th.files.length, minCreatives);
        return {
          id,
          template: t,
          theme: th,
          slices,
          generatedNames: slices.map((_, i) => resolveNamePattern(namePattern, { template: t, theme: th }, i)),
          excluded: slices.every((_, i) => excludedCampaigns.has(`${id}:${i}`)),
        };
      })
    );
  }, [selectedTemplates, selectedThemes, minCreatives, namePattern, excludedCampaigns, canGenerate]);

  // Count non-excluded individual campaigns (per slice)
  const totalCampaignCount = liveCombinations.reduce((sum, c) =>
    sum + c.slices.filter((_, i) => !excludedCampaigns.has(`${c.id}:${i}`)).length, 0);
  const totalCombCount  = liveCombinations.length;
  const activeCombCount = liveCombinations.filter(c => !c.excluded).length;

  const toggleExclude = (key: string) => {
    setExcludedCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Exclude or include all campaigns at once (used by select-all checkbox in preview)
  const handleToggleAll = (excludeAll: boolean) => {
    if (excludeAll) {
      setExcludedCampaigns(new Set(
        liveCombinations.flatMap(c => c.slices.map((_, i) => `${c.id}:${i}`))
      ));
    } else {
      setExcludedCampaigns(new Set());
    }
  };

  const handleGenerate = () => {
    const newJobs: BatchJob[] = liveCombinations.flatMap(c =>
      c.slices
        .map((_, i) => ({ combination: c, sliceIndex: i, status: 'queued' as const }))
        .filter((_, i) => !excludedCampaigns.has(`${c.id}:${i}`))
    );
    setJobs(newJobs);
    setPhase('progress');
  };

  const handleBatchComplete = (finalJobs: BatchJob[]) => {
    if (onBatchComplete) {
      const run: BatchRun = {
        id: `run-${Date.now()}`,
        createdAt: new Date().toISOString(),
        totalCampaigns: finalJobs.length,
        jobs: finalJobs,
      };
      onBatchComplete(run);
    }
  };

  const handleClose = () => {
    setPhase('setup');
    setSelectedTemplateIds([]); setSelectedThemeIds([]);
    setMinCreatives(5);
    setNamePattern(DEFAULT_NAME_PATTERN);
    setAdCopy(DEFAULT_AD_COPY);
    setExcludedCampaigns(new Set());
    setJobs([]);
    onClose();
  };

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
        {phase === 'setup' && (
          <div className="flex h-full">
            {/* Left panel: templates + themes + creative config */}
            <div className="w-[300px] shrink-0 border-r border_primary flex flex-col overflow-hidden">
              <div className="flex-1 p-4 border-b border_secondary overflow-hidden min-h-0">
                <BatchTemplatePicker templates={batchableTemplates} selected={selectedTemplateIds}
                  onToggle={id => setSelectedTemplateIds(prev => toggle(prev, id))} />
              </div>
              <div className="flex-1 p-4 overflow-hidden min-h-0">
                <BatchThemePicker themes={themes} selected={selectedThemeIds}
                  onToggle={id => setSelectedThemeIds(prev => toggle(prev, id))} />
              </div>
              <BatchCreativeConfig value={minCreatives} onChange={setMinCreatives} />
            </div>

            {/* Right panel: live preview */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <BatchLivePreview
                combinations={liveCombinations}
                excludedCampaigns={excludedCampaigns}
                namePattern={namePattern}
                onNamePatternChange={setNamePattern}
                onToggleExclude={toggleExclude}
                onToggleAll={handleToggleAll}
                adCopy={adCopy}
                onAdCopyChange={setAdCopy}
              />
            </div>
          </div>
        )}
        {phase === 'progress' && (
          <BatchProgressTracker jobs={jobs} onClose={handleClose} onBatchComplete={handleBatchComplete} onViewHistory={onViewHistory} />
        )}
      </div>

      {/* Footer — setup phase only */}
      {phase === 'setup' && (
        <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
          <div className="flex items-center gap-1 text-xs flex-wrap">
            {canGenerate ? (
              <>
                <span className="font-semibold fg_info">{selectedTemplates.length}</span>
                <span className="text_tertiary">templates ×</span>
                <span className="font-semibold fg_info">{selectedThemes.length}</span>
                <span className="text_tertiary">themes =</span>
                <span className="font-semibold text_primary">{totalCampaignCount}</span>
                {activeCombCount < totalCombCount && (
                  <span className="text_tertiary">campaigns ({activeCombCount}/{totalCombCount} combos)</span>
                )}
                {activeCombCount === totalCombCount && (
                  <span className="text_tertiary">campaigns</span>
                )}
              </>
            ) : (
              <span className="text_tertiary">Select at least 1 template and 1 theme to preview</span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button type="button" variant="border" size="m" onClick={handleClose}>Cancel</Button>
            <Button type="button" variant="primary" size="m" className="gap-1.5"
              disabled={!canGenerate || totalCampaignCount === 0} onClick={handleGenerate}>
              Generate {totalCampaignCount > 0 ? `${totalCampaignCount} Campaign${totalCampaignCount !== 1 ? 's' : ''}` : 'Campaigns'}
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
