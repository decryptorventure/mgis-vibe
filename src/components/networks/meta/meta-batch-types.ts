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

export interface BatchJob {
  combination: BatchCombination;
  sliceIndex: number;
  status: BatchJobStatus;
  error?: string;
}

// Session-only batch run record (resets on page refresh)
export interface BatchRun {
  id: string;
  createdAt: string;
  totalCampaigns: number;
  jobs: BatchJob[];
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
