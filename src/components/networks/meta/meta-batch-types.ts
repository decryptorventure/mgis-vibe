// meta-batch-types.ts — shared interfaces for Batch Campaign Generator
import type { MetaTemplate } from './meta-types';
import type { MediaFile } from './meta-media-library-modal';

// Theme — auto-detected group of MediaFiles sharing a naming pattern
export interface BatchTheme {
  id: string;       // kebab-slug of name e.g. "sexy-phone"
  name: string;     // parsed display name e.g. "Sexy_Phone"
  files: MediaFile[];
}

// Ad account (mock for Phase 1+2; Phase 3 will fetch from API)
export interface BatchAccount {
  id: string;
  name: string;
}

// One cell in the Templates × Themes × Accounts matrix
export interface BatchCombination {
  id: string;
  template: MetaTemplate;
  theme: BatchTheme;
  account: BatchAccount;
  generatedName: string;  // resolved from NamePattern tokens
  excluded: boolean;
}

export type BatchJobStatus = 'queued' | 'running' | 'done' | 'error';

export interface BatchJob {
  combination: BatchCombination;
  status: BatchJobStatus;
  error?: string;
}

// Phase state for the drawer shell
export type BatchGeneratorPhase = 'setup' | 'matrix' | 'progress';

// Name pattern string with substitution tokens: {template} {theme} {account} {date}
export type NamePattern = string;

export const DEFAULT_NAME_PATTERN: NamePattern = '[{template}] {theme} | {account}';
