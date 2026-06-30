---
phase: 1
title: "Types + Mock Data"
status: pending
priority: P1
effort: 3h
dependencies: []
---

# Phase 1: Types + Mock Data

## Overview

Establish all TypeScript interfaces and mock data for the Campaign Factory feature. This is the foundation — all subsequent phases depend on these types compiling cleanly.

## Requirements

- Functional: `CampaignTemplate`, `CreativeSet`, `GenerationConfig`, `GeneratedCampaignPreview` types available app-wide
- Non-functional: `npx tsc --noEmit` passes; existing imports unbroken; new mock data realistic enough to drive UI development

## Architecture

Extend `meta-types.ts` with new factory types. Add mock arrays to `mock-data.ts`. No new files needed this phase — keep everything co-located with existing patterns.

**Naming conflict resolution:** Existing `MetaTemplate` in `meta-types.ts` is a lighter type used by `meta-template-drawer.tsx`. New `CampaignTemplate` is a superset — do NOT rename `MetaTemplate` (would break existing imports). Both types coexist.

## Related Code Files

- Modify: `src/components/networks/meta/meta-types.ts`
- Modify: `src/shared/mock-data.ts`
- Read first: `src/components/networks/meta/meta-types.ts` (existing `MetaTemplate`, `MetaEntity`, `DraftCampaign`)
- Read first: `src/shared/mock-data.ts` (existing `mockMediaItems` to build creative set references)

## Implementation Steps

### 1. Extend `meta-types.ts`

Add after existing types (do not modify existing exports):

```typescript
// ─── Campaign Factory Types ────────────────────────────────────────────────

export type FactoryObjective = 'APP_INSTALLS' | 'CONVERSIONS' | 'REACH';
export type BudgetOptimization = 'CBO' | 'ABO';
export type MetaBidStrategy = 'LOWEST_COST' | 'COST_CAP' | 'BID_CAP';
export type AdFormat = 'IMAGE' | 'VIDEO' | 'CAROUSEL';
export type GenerationStrategy = 'ABO' | 'CBO';

export interface CampaignTemplateTargeting {
  countries: string[];
  ageMin: number;
  ageMax: number;
  genders: ('male' | 'female' | 'all')[];
  placements: string[];
}

export interface CampaignTemplateAdsetShell {
  budget: number;
  budgetType: 'daily' | 'lifetime';
  bidStrategy: MetaBidStrategy;
  targeting: CampaignTemplateTargeting;
  attribution: { clickWindow: 1 | 7 | 28; viewWindow: 0 | 1 };
}

export interface CampaignTemplateAdShell {
  format: AdFormat;
  primaryText: string;
  headline: string;
  description?: string;
  callToAction: string;
  destinationUrl: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  network: 'meta';
  objective: FactoryObjective;
  budgetOptimization: BudgetOptimization;
  adsetShell: CampaignTemplateAdsetShell;
  adShell: CampaignTemplateAdShell;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeSetCriteria {
  network?: string[];
  type?: ('image' | 'video')[];
  minCtr?: number;
  minRoas?: number;
  minSpend?: number;
  googleMark?: 'low' | 'good' | 'all';
  projectIds?: string[];
}

export interface CreativeSet {
  id: string;
  name: string;
  description?: string;
  criteria: CreativeSetCriteria;
  mediaIds: string[];           // static snapshot, confirmed by user
  createdAt: string;
  updatedAt: string;
}

export interface GenerationConfig {
  templateId: string;
  creativeSetIds: string[];
  strategy: GenerationStrategy;
  namingPattern: string;        // e.g. "{template} - {set_name} - W{week}"
}

export interface GeneratedAdPreview {
  mediaId: string;
  adName: string;
}

export interface GeneratedAdSetPreview {
  adsetName: string;
  mediaIds: string[];
  adCount: number;
}

export interface GeneratedCampaignPreview {
  campaignName: string;
  adsets: GeneratedAdSetPreview[];
  totalAds: number;
}

export interface GenerationPreflightIssue {
  type: 'warning' | 'error';
  message: string;
}

export interface GenerationJob {
  id: string;
  config: GenerationConfig;
  preview: GeneratedCampaignPreview[];
  preflightIssues: GenerationPreflightIssue[];
  status: 'preview' | 'generating' | 'completed' | 'failed';
  generatedCampaignIds: string[];
  createdAt: string;
}
```

### 2. Add mock data to `mock-data.ts`

Add after `mockMediaItems`:

```typescript
// ─── Mock Campaign Templates ──────────────────────────────────────────────
export const mockCampaignTemplates: CampaignTemplate[] = [
  {
    id: 'ct-1',
    name: 'App Installs - VN Market',
    description: 'Standard app install campaign for Vietnam, CBO, video-first',
    network: 'meta',
    objective: 'APP_INSTALLS',
    budgetOptimization: 'CBO',
    adsetShell: {
      budget: 500000, budgetType: 'daily',
      bidStrategy: 'LOWEST_COST',
      targeting: { countries: ['VN'], ageMin: 18, ageMax: 40, genders: ['all'], placements: ['feed', 'reels', 'stories'] },
      attribution: { clickWindow: 7, viewWindow: 1 },
    },
    adShell: { format: 'VIDEO', primaryText: 'Tải ngay — miễn phí 100%!', headline: 'Ứng dụng #1 Việt Nam', callToAction: 'INSTALL_MOBILE_APP', destinationUrl: 'https://example.com/app' },
    usageCount: 12, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'ct-2',
    name: 'ROAS Optimization - SEA',
    description: 'ROAS-focused campaign for Southeast Asia, ABO, image ads',
    network: 'meta',
    objective: 'CONVERSIONS',
    budgetOptimization: 'ABO',
    adsetShell: {
      budget: 200000, budgetType: 'daily',
      bidStrategy: 'COST_CAP',
      targeting: { countries: ['VN', 'TH', 'ID', 'PH'], ageMin: 22, ageMax: 45, genders: ['all'], placements: ['feed'] },
      attribution: { clickWindow: 28, viewWindow: 1 },
    },
    adShell: { format: 'IMAGE', primaryText: 'Unlock premium features today', headline: 'Start your free trial', callToAction: 'SIGN_UP', destinationUrl: 'https://example.com/signup' },
    usageCount: 5, createdAt: '2026-05-15T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'ct-3',
    name: 'Retargeting - Lapsed Users',
    description: 'Re-engage users who installed but churned, ABO, carousel',
    network: 'meta',
    objective: 'CONVERSIONS',
    budgetOptimization: 'ABO',
    adsetShell: {
      budget: 100000, budgetType: 'daily',
      bidStrategy: 'BID_CAP',
      targeting: { countries: ['VN'], ageMin: 18, ageMax: 55, genders: ['all'], placements: ['feed', 'stories'] },
      attribution: { clickWindow: 7, viewWindow: 0 },
    },
    adShell: { format: 'CAROUSEL', primaryText: 'Chúng tôi nhớ bạn! Quay lại nhận ưu đãi', headline: 'Quay lại ngay hôm nay', callToAction: 'OPEN_LINK', destinationUrl: 'https://example.com/return' },
    usageCount: 3, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z',
  },
];

// ─── Mock Creative Sets ──────────────────────────────────────────────────
export const mockCreativeSets: CreativeSet[] = [
  {
    id: 'cs-1',
    name: 'Top Meta Videos Q2',
    description: 'High-CTR video creatives from Meta network, Q2 2026',
    criteria: { network: ['meta'], type: ['video'], minCtr: 1.5 },
    mediaIds: ['m1', 'm3'],   // references mockMediaItems ids
    createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'cs-2',
    name: 'Banner Images - Summer',
    description: 'Summer campaign banner images across all networks',
    criteria: { type: ['image'], minSpend: 100 },
    mediaIds: ['m2', 'm4', 'm5'],
    createdAt: '2026-06-10T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'cs-3',
    name: 'Google-Approved Assets',
    description: 'Creatives with good Google mark only',
    criteria: { googleMark: 'good' },
    mediaIds: ['m6', 'm7'],
    createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z',
  },
];
```

### 3. Verify imports

Check that `CampaignTemplate` and `CreativeSet` can be imported from `meta-types.ts` in a test import (just verify tsc passes — no runtime test needed this phase).

## Success Criteria

- [ ] All new types exported from `src/components/networks/meta/meta-types.ts`
- [ ] `mockCampaignTemplates` and `mockCreativeSets` exported from `src/shared/mock-data.ts`
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Existing `MetaTemplate` type unchanged (no import breakage)
- [ ] Mock media IDs in creative sets reference real `mockMediaItems` ids

## Risk Assessment

- **`meta-types.ts` approaching 200 lines:** If total exceeds 200 lines post-extension, split factory types into `src/components/networks/meta/meta-factory-types.ts` and re-export from `meta-types.ts`. Check LOC before starting.
- **MediaItem IDs:** Verify `m1`–`m7` exist in `mockMediaItems` — adjust ids to match actual mock data keys.
