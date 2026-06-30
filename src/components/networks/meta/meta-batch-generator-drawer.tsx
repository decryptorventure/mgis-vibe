// meta-batch-generator-drawer.tsx — Batch Campaign Generator fullscreen drawer shell
// 2-panel layout: left = criteria pickers, right = live campaign preview (always visible)
import React, { useMemo, useState } from 'react';
import { Drawer } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { DEFAULT_AD_COPY } from './meta-batch-types';
import type { BatchAccount, BatchAdCopy, BatchCombination, BatchGeneratorPhase, BatchJob, NamePattern } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';
import { DEFAULT_NAME_PATTERN, MOCK_BATCH_ACCOUNTS, MOCK_MEDIA_FILES, resolveNamePattern, toThemeList } from './meta-theme-parser';
import { BatchTemplatePicker } from './meta-batch-template-picker';
import { BatchThemePicker } from './meta-batch-theme-picker';
import { BatchAccountPicker } from './meta-batch-account-picker';
import { BatchLivePreview } from './meta-batch-matrix-preview';
import { BatchProgressTracker } from './meta-batch-progress-tracker';

interface Props {
  open: boolean;
  onClose: () => void;
  templates: MetaTemplate[];
}

const toggle = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

export const BatchGeneratorDrawer: React.FC<Props> = ({ open, onClose, templates }) => {
  const [phase, setPhase]                             = useState<BatchGeneratorPhase>('setup');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedThemeIds, setSelectedThemeIds]       = useState<string[]>([]);
  const [selectedAccountIds, setSelectedAccountIds]   = useState<string[]>([]);
  const [namePattern, setNamePattern]                 = useState<NamePattern>(DEFAULT_NAME_PATTERN);
  const [adCopy, setAdCopy]                           = useState<BatchAdCopy>(DEFAULT_AD_COPY);
  // Deterministic combo ID: `${t.id}:${th.id}:${a.id}` — excluded state persists across name pattern changes
  const [excludedIds, setExcludedIds]                 = useState<Set<string>>(new Set());
  const [jobs, setJobs]                               = useState<BatchJob[]>([]);

  const themes   = useMemo(() => toThemeList(MOCK_MEDIA_FILES), []);
  const accounts: BatchAccount[] = MOCK_BATCH_ACCOUNTS;

  const selectedTemplates = templates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedThemes    = themes.filter(th => selectedThemeIds.includes(th.id));
  const selectedAccounts  = accounts.filter(a => selectedAccountIds.includes(a.id));

  const canGenerate = selectedTemplates.length > 0 && selectedThemes.length > 0 && selectedAccounts.length > 0;

  // Live preview — reactive to all selections, name pattern, and excluded set
  const liveCombinations = useMemo<BatchCombination[]>(() => {
    if (!canGenerate) return [];
    return selectedTemplates.flatMap(t =>
      selectedThemes.flatMap(th =>
        selectedAccounts.map(a => {
          const id = `${t.id}:${th.id}:${a.id}`;
          return {
            id,
            template: t, theme: th, account: a,
            generatedName: resolveNamePattern(namePattern, { template: t, theme: th, account: a }),
            excluded: excludedIds.has(id),
          };
        })
      )
    );
  }, [selectedTemplates, selectedThemes, selectedAccounts, namePattern, excludedIds]);

  const activeCombinations = liveCombinations.filter(c => !c.excluded);
  const activeCount = activeCombinations.length;
  const totalCount  = liveCombinations.length;

  const toggleExclude = (id: string) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleGenerate = () => {
    setJobs(activeCombinations.map(c => ({ combination: c, status: 'queued' })));
    setPhase('progress');
  };

  const handleClose = () => {
    setPhase('setup');
    setSelectedTemplateIds([]); setSelectedThemeIds([]); setSelectedAccountIds([]);
    setNamePattern(DEFAULT_NAME_PATTERN);
    setAdCopy(DEFAULT_AD_COPY);
    setExcludedIds(new Set());
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
          <div className="text-[11px] text_tertiary">Templates × Themes × Accounts → generate campaigns in bulk</div>
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
            {/* Left panel: stacked criteria pickers — each section gets 1/3 of panel height */}
            <div className="w-[320px] shrink-0 border-r border_primary flex flex-col overflow-hidden">
              <div className="h-1/3 p-4 border-b border_secondary overflow-hidden">
                <BatchTemplatePicker templates={templates} selected={selectedTemplateIds}
                  onToggle={id => setSelectedTemplateIds(prev => toggle(prev, id))} />
              </div>
              <div className="h-1/3 p-4 border-b border_secondary overflow-hidden">
                <BatchThemePicker themes={themes} selected={selectedThemeIds}
                  onToggle={id => setSelectedThemeIds(prev => toggle(prev, id))} />
              </div>
              <div className="h-1/3 p-4 overflow-hidden">
                <BatchAccountPicker accounts={accounts} selected={selectedAccountIds}
                  onToggle={id => setSelectedAccountIds(prev => toggle(prev, id))} />
              </div>
            </div>

            {/* Right panel: live preview — updates instantly as criteria change */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <BatchLivePreview
                combinations={liveCombinations}
                namePattern={namePattern}
                onNamePatternChange={setNamePattern}
                onToggleExclude={toggleExclude}
                adCopy={adCopy}
                onAdCopyChange={setAdCopy}
              />
            </div>
          </div>
        )}
        {phase === 'progress' && (
          <BatchProgressTracker jobs={jobs} onClose={handleClose} />
        )}
      </div>

      {/* Footer — only in setup phase */}
      {phase === 'setup' && (
        <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
          <div className="flex items-center gap-1 text-xs flex-wrap">
            {canGenerate ? (
              <>
                <span className="font-semibold fg_info">{selectedTemplates.length}</span>
                <span className="text_tertiary">templates ×</span>
                <span className="font-semibold fg_info">{selectedThemes.length}</span>
                <span className="text_tertiary">themes ×</span>
                <span className="font-semibold fg_info">{selectedAccounts.length}</span>
                <span className="text_tertiary">accounts =</span>
                <span className="font-semibold text_primary">{activeCount}</span>
                {activeCount < totalCount && <span className="text_tertiary">/ {totalCount}</span>}
                <span className="text_tertiary">campaigns</span>
              </>
            ) : (
              <span className="text_tertiary">Select at least 1 template, 1 theme, and 1 account</span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button type="button" variant="border" size="m" onClick={handleClose}>Cancel</Button>
            <Button type="button" variant="primary" size="m" className="gap-1.5"
              disabled={!canGenerate || activeCount === 0} onClick={handleGenerate}>
              Generate {activeCount > 0 ? `${activeCount} Campaign${activeCount !== 1 ? 's' : ''}` : 'Campaigns'}
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
