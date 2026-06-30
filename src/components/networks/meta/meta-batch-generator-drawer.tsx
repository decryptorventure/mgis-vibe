// meta-batch-generator-drawer.tsx — Batch Campaign Generator fullscreen drawer shell
import React, { useMemo, useState } from 'react';
import { Drawer } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import type { BatchAccount, BatchCombination, BatchGeneratorPhase, BatchJob, NamePattern } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';
import { DEFAULT_NAME_PATTERN, MOCK_BATCH_ACCOUNTS, MOCK_MEDIA_FILES, resolveNamePattern, toThemeList } from './meta-theme-parser';
import { BatchTemplatePicker } from './meta-batch-template-picker';
import { BatchThemePicker } from './meta-batch-theme-picker';
import { BatchAccountPicker } from './meta-batch-account-picker';

import { BatchMatrixPreview } from './meta-batch-matrix-preview';
import { BatchProgressTracker } from './meta-batch-progress-tracker';

interface Props {
  open: boolean;
  onClose: () => void;
  templates: MetaTemplate[];
}

const mkId = () => Math.random().toString(36).slice(2, 8);

const toggle = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

export const BatchGeneratorDrawer: React.FC<Props> = ({ open, onClose, templates }) => {
  const [phase, setPhase]                           = useState<BatchGeneratorPhase>('setup');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedThemeIds, setSelectedThemeIds]       = useState<string[]>([]);
  const [selectedAccountIds, setSelectedAccountIds]   = useState<string[]>([]);
  const [namePattern, setNamePattern]                 = useState<NamePattern>(DEFAULT_NAME_PATTERN);
  const [combinations, setCombinations]               = useState<BatchCombination[]>([]);
  const [jobs, setJobs]                               = useState<BatchJob[]>([]);

  const themes   = useMemo(() => toThemeList(MOCK_MEDIA_FILES), []);
  const accounts: BatchAccount[] = MOCK_BATCH_ACCOUNTS;

  const selectedTemplates = templates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedThemes    = themes.filter(th => selectedThemeIds.includes(th.id));
  const selectedAccounts  = accounts.filter(a => selectedAccountIds.includes(a.id));

  const totalCombos = selectedTemplates.length * selectedThemes.length * selectedAccounts.length;
  const canPreview  = selectedTemplates.length > 0 && selectedThemes.length > 0 && selectedAccounts.length > 0;

  const handlePreviewMatrix = () => {
    const combos: BatchCombination[] = selectedTemplates.flatMap(t =>
      selectedThemes.flatMap(th =>
        selectedAccounts.map(a => ({
          id: `${t.id}-${th.id}-${a.id}-${mkId()}`,
          template: t, theme: th, account: a,
          generatedName: resolveNamePattern(namePattern, { template: t, theme: th, account: a }),
          excluded: false,
        }))
      )
    );
    setCombinations(combos);
    setPhase('matrix');
  };

  const handleGenerate = (activeCombos: BatchCombination[]) => {
    setJobs(activeCombos.map(c => ({ combination: c, status: 'queued' })));
    setPhase('progress');
  };

  const handleClose = () => {
    setPhase('setup');
    setSelectedTemplateIds([]); setSelectedThemeIds([]); setSelectedAccountIds([]);
    setCombinations([]); setJobs([]);
    onClose();
  };

  const updateNamePattern = (p: NamePattern) => {
    setNamePattern(p);
    setCombinations(prev => prev.map(c => ({
      ...c,
      generatedName: resolveNamePattern(p, { template: c.template, theme: c.theme, account: c.account }),
    })));
  };

  const toggleExclude = (id: string) =>
    setCombinations(prev => prev.map(c => c.id === id ? { ...c, excluded: !c.excluded } : c));

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
          <div className="grid grid-cols-3 gap-4 p-6 h-full">
            <div className="bg_primary border border_primary radius_8 p-4 overflow-hidden flex flex-col">
              <BatchTemplatePicker templates={templates} selected={selectedTemplateIds}
                onToggle={id => setSelectedTemplateIds(prev => toggle(prev, id))} />
            </div>
            <div className="bg_primary border border_primary radius_8 p-4 overflow-hidden flex flex-col">
              <BatchThemePicker themes={themes} selected={selectedThemeIds}
                onToggle={id => setSelectedThemeIds(prev => toggle(prev, id))} />
            </div>
            <div className="bg_primary border border_primary radius_8 p-4 overflow-hidden flex flex-col">
              <BatchAccountPicker accounts={accounts} selected={selectedAccountIds}
                onToggle={id => setSelectedAccountIds(prev => toggle(prev, id))} />
            </div>
          </div>
        )}
        {phase === 'matrix' && (
          <BatchMatrixPreview
            combinations={combinations}
            namePattern={namePattern}
            onNamePatternChange={updateNamePattern}
            onToggleExclude={toggleExclude}
            onGenerate={handleGenerate}
            onBack={() => setPhase('setup')}
          />
        )}
        {phase === 'progress' && (
          <BatchProgressTracker jobs={jobs} onClose={handleClose} />
        )}
      </div>

      {/* Setup footer */}
      {phase === 'setup' && (
        <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
          <div className="flex items-center gap-1 text-xs text_secondary flex-wrap">
            {canPreview ? (
              <>
                <span className="font-semibold fg_info">{selectedTemplates.length}</span>
                <span className="text_tertiary">templates ×</span>
                <span className="font-semibold fg_info">{selectedThemes.length}</span>
                <span className="text_tertiary">themes ×</span>
                <span className="font-semibold fg_info">{selectedAccounts.length}</span>
                <span className="text_tertiary">accounts =</span>
                <span className="font-semibold text_primary">{totalCombos} campaigns</span>
              </>
            ) : (
              <span className="text_tertiary">Select at least 1 template, 1 theme, and 1 account</span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button type="button" variant="border" size="m" onClick={handleClose}>Cancel</Button>
            <Button type="button" variant="primary" size="m" disabled={!canPreview}
              onClick={handlePreviewMatrix} className="gap-1.5">
              Preview Matrix <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
