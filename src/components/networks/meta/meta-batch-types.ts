// meta-batch-types.ts — shared interfaces and utilities for Batch Campaign Generator
import type { MetaTemplate } from './meta-types';
import type { MediaFile } from './meta-media-library-modal';

// Theme — auto-detected group of MediaFiles sharing a naming pattern
export interface BatchTheme {
  id: string;
  name: string;
  files: MediaFile[];
}

// Account selection type
export interface BatchAccount {
  id: string;
  name: string;
}

// One cell in the Templates × Themes matrix.
// A combination may produce multiple campaigns (slices) based on minCreatives config.
export interface BatchCombination {
  id: string;                // `${template.id}:${theme.id}`
  template: MetaTemplate;    // template.account holds the bound ad account
  theme: BatchTheme;
  slices: number[];          // creative counts per campaign, e.g. [5, 8]
  generatedNames: string[];  // one name per slice
  excluded: boolean;
}

export type BatchJobStatus = 'queued' | 'running' | 'done' | 'error';

// Mock error taxonomy mimicking common Meta Ads API validation failures.
export type BatchJobErrorCode =
  | 'INVALID_PLACEMENT_COMBO'
  | 'AUDIENCE_TOO_NARROW'
  | 'BUDGET_BELOW_MINIMUM'
  | 'DUPLICATE_CAMPAIGN_NAME'
  | 'MISSING_PAGE_ATTACHMENT'
  | 'CREATIVE_ASSET_REJECTED'
  | 'RATE_LIMITED';

export const BATCH_ERROR_MESSAGES: Record<BatchJobErrorCode, string> = {
  INVALID_PLACEMENT_COMBO: "Selected placements aren't compatible with this campaign's objective",
  AUDIENCE_TOO_NARROW: 'Estimated audience size is too small for this ad set',
  BUDGET_BELOW_MINIMUM: "Daily budget is below the account's minimum for this objective",
  DUPLICATE_CAMPAIGN_NAME: 'A campaign with this name already exists in the ad account',
  MISSING_PAGE_ATTACHMENT: "No Facebook Page attached for this ad's call-to-action",
  CREATIVE_ASSET_REJECTED: 'A media file failed creative policy pre-check (aspect ratio/duration)',
  RATE_LIMITED: 'Meta API rate limit hit — retry after a short delay',
};

export const BATCH_ERROR_CODES = Object.keys(BATCH_ERROR_MESSAGES) as BatchJobErrorCode[];

export interface BatchJob {
  combination: BatchCombination;
  sliceIndex: number;
  status: BatchJobStatus;
  error?: BatchJobErrorCode;
}

// Snapshot of the setup-phase criteria that produced a run — enables "Edit & Regenerate".
export interface BatchRunCriteriaSnapshot {
  selectedTemplateIds: string[];
  selectedThemeIds: string[];
  minCreatives: number;
  namePattern: NamePattern;
  adCopy: BatchAdCopy;
}

// Batch run record — persisted to localStorage (see MetaWorkspace).
export interface BatchRun {
  id: string;
  createdAt: string;
  totalCampaigns: number;
  jobs: BatchJob[];
  criteriaSnapshot: BatchRunCriteriaSnapshot;
}

// Request to reopen the setup phase pre-filled, keeping only a subset of campaigns active.
export interface BatchRegenerateRequest {
  criteria: BatchRunCriteriaSnapshot;
  keepKeys: string[]; // `${combo.id}:${sliceIndex}` to keep active; everything else starts excluded
}

// Saved batch configuration for reuse — persisted to localStorage.
export interface BatchPreset {
  id: string;
  name: string;
  createdAt: string;
  criteria: BatchRunCriteriaSnapshot;
}

export type BatchGeneratorPhase = 'setup' | 'progress';
export type NamePattern = string;

export const DEFAULT_NAME_PATTERN: NamePattern = '[{template}] {theme}';

export interface BatchAdCopy {
  primaryText: string;
  headline: string;
  cta: string;
}

export const DEFAULT_AD_COPY: BatchAdCopy = {
  primaryText: '',
  headline: '',
  cta: 'DOWNLOAD',
};

export const CTA_OPTIONS = [
  'DOWNLOAD', 'INSTALL_NOW', 'LEARN_MORE', 'SHOP_NOW',
  'SIGN_UP', 'GET_QUOTE', 'BOOK_NOW', 'APPLY_NOW',
];

// Compute how many campaigns to create given total media files and min/max per campaign.
// Greedy: take minCreatives-sized slices while remaining > max; if last remainder < min,
// pop and redistribute until distributable.
function canDistribute(n: number, min: number, max: number): boolean {
  const groups = Math.ceil(n / max);
  return Math.floor(n / groups) >= min;
}

export function computeSlices(totalFiles: number, minCreatives: number, maxCreatives = 9): number[] {
  if (totalFiles <= maxCreatives) return [totalFiles];

  const slices: number[] = [];
  let remaining = totalFiles;

  while (remaining > maxCreatives) {
    slices.push(minCreatives);
    remaining -= minCreatives;
  }

  if (remaining < minCreatives) {
    while (!canDistribute(remaining, minCreatives, maxCreatives) && slices.length > 0) {
      remaining += slices.pop()!;
    }
  }

  const numGroups = Math.ceil(remaining / maxCreatives);
  const base = Math.floor(remaining / numGroups);
  const extra = remaining - base * numGroups;
  for (let i = 0; i < numGroups; i++) {
    slices.push(i < extra ? base + 1 : base);
  }

  return slices;
}

// ----- Preflight validation (merged from the former AI Bulk Create flow) --------

export type MetaPreflightSeverity = 'error' | 'warning' | 'info';

export interface MetaBatchPreflightIssue {
  id: string;
  severity: MetaPreflightSeverity;
  message: string;
}

export function computeBatchPreflightIssues(params: {
  combinations: BatchCombination[];
  excludedCampaigns: Set<string>;
  adCopy: BatchAdCopy;
  existingCampaignNames: string[];
}): MetaBatchPreflightIssue[] {
  const { combinations, excludedCampaigns, adCopy, existingCampaignNames } = params;
  const issues: MetaBatchPreflightIssue[] = [];

  const activeNames: string[] = [];
  combinations.forEach(c => c.slices.forEach((_, i) => {
    if (!excludedCampaigns.has(`${c.id}:${i}`)) activeNames.push(c.generatedNames[i]);
  }));

  const existingLower = new Set(existingCampaignNames.map(n => n.toLowerCase()));
  const dupCount = activeNames.filter(n => existingLower.has(n.toLowerCase())).length;
  if (dupCount > 0) {
    issues.push({ id: 'dup-names', severity: 'warning', message: `${dupCount} generated campaign name(s) already exist in this ad account.` });
  }

  if (!adCopy.primaryText.trim() && !adCopy.headline.trim()) {
    issues.push({ id: 'no-copy', severity: 'warning', message: 'No ad copy provided — ads will use placeholder text.' });
  }

  if (activeNames.length > 50) {
    issues.push({ id: 'large-batch', severity: 'warning', message: `Large batch — ${activeNames.length} campaigns will be created. Review before generating.` });
  }

  const thinThemes = combinations.filter(c => !c.excluded && c.theme.files.length < 5);
  if (thinThemes.length > 0) {
    issues.push({ id: 'thin-theme', severity: 'info', message: `${thinThemes.length} theme(s) have fewer than 5 creatives — campaigns may under-deliver.` });
  }

  return issues;
}
