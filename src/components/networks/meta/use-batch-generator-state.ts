// use-batch-generator-state.ts — state, derived values, and handlers for BatchGeneratorDrawer.
// Mirrors the useMetaWorkspace pattern: hook owns logic, component stays a thin JSX shell.
import { useMemo, useState } from 'react';
import { computeBatchPreflightIssues, computeSlices, DEFAULT_AD_COPY } from './meta-batch-types';
import type {
  BatchAdCopy, BatchCombination, BatchGeneratorPhase, BatchJob, BatchPreset,
  BatchRegenerateRequest, BatchRun, NamePattern,
} from './meta-batch-types';
import type { MetaTemplate } from './meta-types';
import { buildLiveCombinations, DEFAULT_NAME_PATTERN, MOCK_MEDIA_FILES, resolveNamePattern, toThemeList } from './meta-theme-parser';
import type { PromptCriteriaResult } from './meta-batch-prompt-parser';

const toggle = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

export interface UseBatchGeneratorStateArgs {
  templates: MetaTemplate[];
  existingCampaignNames: string[];
  onSavePreset: (preset: BatchPreset) => void;
  onBatchComplete?: (run: BatchRun) => void;
  onGenerateDrafts?: (jobs: BatchJob[], adCopy: BatchAdCopy) => void;
  regenerateRequest?: BatchRegenerateRequest;
}

export function useBatchGeneratorState({
  templates, existingCampaignNames, onSavePreset, onBatchComplete, onGenerateDrafts, regenerateRequest,
}: UseBatchGeneratorStateArgs) {
  // Templates must have an account bound; filter others out
  const batchableTemplates = templates.filter(t => t.account);
  const themes = useMemo(() => toThemeList(MOCK_MEDIA_FILES), []);

  const [phase, setPhase] = useState<BatchGeneratorPhase>('setup');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>(() => regenerateRequest?.criteria.selectedTemplateIds ?? []);
  const [selectedThemeIds, setSelectedThemeIds]       = useState<string[]>(() => regenerateRequest?.criteria.selectedThemeIds ?? []);
  const [minCreatives, setMinCreatives]               = useState(() => regenerateRequest?.criteria.minCreatives ?? 5);
  const [namePattern, setNamePattern]                 = useState<NamePattern>(() => regenerateRequest?.criteria.namePattern ?? DEFAULT_NAME_PATTERN);
  const [adCopy, setAdCopy]                           = useState<BatchAdCopy>(() => regenerateRequest?.criteria.adCopy ?? DEFAULT_AD_COPY);
  const [excludedCampaigns, setExcludedCampaigns]     = useState<Set<string>>(() => {
    if (!regenerateRequest) return new Set();
    const initialTemplates = batchableTemplates.filter(t => regenerateRequest.criteria.selectedTemplateIds.includes(t.id));
    const initialThemes    = themes.filter(th => regenerateRequest.criteria.selectedThemeIds.includes(th.id));
    const combos = buildLiveCombinations(initialTemplates, initialThemes, regenerateRequest.criteria.minCreatives, regenerateRequest.criteria.namePattern);
    const allKeys = combos.flatMap(c => c.slices.map((_, i) => `${c.id}:${i}`));
    return new Set(allKeys.filter(k => !regenerateRequest.keepKeys.includes(k)));
  });
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const totalCampaignCount = liveCombinations.reduce((sum, c) =>
    sum + c.slices.filter((_, i) => !excludedCampaigns.has(`${c.id}:${i}`)).length, 0);
  const totalCombCount  = liveCombinations.length;
  const activeCombCount = liveCombinations.filter(c => !c.excluded).length;
  const hasSlicing = liveCombinations.some(c => c.slices.length > 1);

  const preflightIssues = useMemo(
    () => computeBatchPreflightIssues({ combinations: liveCombinations, excludedCampaigns, adCopy, existingCampaignNames }),
    [liveCombinations, excludedCampaigns, adCopy, existingCampaignNames]
  );

  const toggleExclude = (key: string) => {
    setExcludedCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleToggleAll = (excludeAll: boolean) => {
    setExcludedCampaigns(excludeAll
      ? new Set(liveCombinations.flatMap(c => c.slices.map((_, i) => `${c.id}:${i}`)))
      : new Set());
  };

  const handleApplyPromptCriteria = (result: PromptCriteriaResult) => {
    if (result.templateIds.length > 0) setSelectedTemplateIds(prev => Array.from(new Set([...prev, ...result.templateIds])));
    if (result.themeIds.length > 0) setSelectedThemeIds(prev => Array.from(new Set([...prev, ...result.themeIds])));
    if (result.minCreatives) setMinCreatives(result.minCreatives);
    if (result.cta) setAdCopy(prev => ({ ...prev, cta: result.cta! }));
  };

  const handleSavePreset = (name: string) => {
    onSavePreset({
      id: `preset-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      criteria: { selectedTemplateIds, selectedThemeIds, minCreatives, namePattern, adCopy },
    });
  };

  const handleLoadPreset = (preset: BatchPreset) => {
    setSelectedTemplateIds(preset.criteria.selectedTemplateIds);
    setSelectedThemeIds(preset.criteria.selectedThemeIds);
    setMinCreatives(preset.criteria.minCreatives);
    setNamePattern(preset.criteria.namePattern);
    setAdCopy(preset.criteria.adCopy);
  };

  const handleGenerate = () => {
    const newJobs: BatchJob[] = liveCombinations.flatMap(c =>
      c.slices
        .map((_, i) => ({ combination: c, sliceIndex: i, status: 'queued' as const }))
        .filter((_, i) => !excludedCampaigns.has(`${c.id}:${i}`))
    );
    setJobs(newJobs);
    setConfirmOpen(false);
    setPhase('progress');
  };

  const handleBatchComplete = (finalJobs: BatchJob[]) => {
    onGenerateDrafts?.(finalJobs, adCopy);
    if (onBatchComplete) {
      onBatchComplete({
        id: `run-${Date.now()}`,
        createdAt: new Date().toISOString(),
        totalCampaigns: finalJobs.length,
        jobs: finalJobs,
        criteriaSnapshot: { selectedTemplateIds, selectedThemeIds, minCreatives, namePattern, adCopy },
      });
    }
  };

  const resetAll = () => {
    setPhase('setup');
    setSelectedTemplateIds([]); setSelectedThemeIds([]);
    setMinCreatives(5);
    setNamePattern(DEFAULT_NAME_PATTERN);
    setAdCopy(DEFAULT_AD_COPY);
    setExcludedCampaigns(new Set());
    setJobs([]);
  };

  return {
    batchableTemplates, themes, phase, jobs, confirmOpen, setConfirmOpen,
    selectedTemplateIds, selectedThemeIds, minCreatives, namePattern, adCopy, excludedCampaigns,
    selectedTemplates, selectedThemes, canGenerate, liveCombinations,
    totalCampaignCount, totalCombCount, activeCombCount, hasSlicing, preflightIssues,
    setNamePattern, setAdCopy, setMinCreatives,
    onToggleTemplate: (id: string) => setSelectedTemplateIds(prev => toggle(prev, id)),
    onToggleTheme: (id: string) => setSelectedThemeIds(prev => toggle(prev, id)),
    toggleExclude, handleToggleAll, handleApplyPromptCriteria,
    handleSavePreset, handleLoadPreset, handleGenerate, handleBatchComplete, resetAll,
  };
}
