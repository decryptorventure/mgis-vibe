# Phase 4: Unified Campaign Wizard

**Priority:** P2  
**Status:** Pending  
**Effort:** ~8h  
**Parallelism:** Runs after Phase 3 completes

## Context Links

- Plan overview: [plan.md](./plan.md)
- Phase 3 (dependency): [phase-03-network-workspace-standardization.md](./phase-03-network-workspace-standardization.md)
- Current Google wizard: `src/pages/networks/GoogleAdsWorkspace.tsx` (lines 18–358, `GoogleUacWizard`)
- Current Meta wizard: `src/pages/networks/MetaWorkspace.tsx` (lines 18–129, `MetaCampaignWizard`)
- Network config: `src/shared/network-config.ts` (created in Phase 3)
- Mock data: `src/shared/mock-data.ts`

## Overview

Extract all per-network campaign wizards into a **unified 6-step campaign creation wizard** system. The wizard has a shared step structure (Basics → Budget → Targeting → Creatives → Tracking → Review) with network-specific sections that collapse/expand per selected networks. Each network's unique fields are isolated in a `NetworkWizardSection` plugin.

## Key Insights

- Google wizard (340 lines): 5-step modal with live ad preview. Heavy — has phone mockup, YouTube URL management, image selection
- Meta wizard (112 lines): Single-form modal (no steps), Meta-specific: CBO toggle, lookalike targeting, placement type radio
- ASA/Axon/Moloco: Currently no dedicated wizards (just table + "create" button with `message.success` mock)
- Progressive disclosure pattern: Step 1 selects networks → subsequent steps show only relevant network sections
- Draft save: local state in wizard, `localStorage` persistence for in-progress campaigns
- Live preview (Google's phone mockup): keep as network-specific `previewPanel` in Google's section

## Requirements

### Functional
- Single "Create Campaign" entry point accessible from: Campaign Labs page, each network workspace toolbar
- Step 1 (Basics): App/project selector, campaign objective, **network multi-select** (which networks to create for)
- Step 2 (Budget): Per-network budget OR shared budget with % split slider
- Step 3 (Targeting): Collapsible section per selected network with network-specific fields
- Step 4 (Creatives): Media library picker + upload; validates format per network requirements
- Step 5 (Tracking): Attribution URL, postback event mappings (shared across networks)
- Step 6 (Review): Per-network summary cards; shows validation errors per network; confirm & launch
- "Save Draft" button available on all steps
- Step navigation: can go back freely; forward validates current step
- Clone campaign: pre-fills wizard from existing campaign data

### Non-Functional
- Wizard renders in `Modal` (width: 1100px) or full-screen drawer on mobile
- Max 200 lines per wizard section file
- No new npm dependencies

## Architecture

```
src/components/campaign-wizard/       (NEW directory)
├── campaign-wizard-modal.tsx         (main wizard: Steps, navigation, state mgmt)
├── wizard-step-basics.tsx            (Step 1: project, objective, network select)
├── wizard-step-budget.tsx            (Step 2: per-network or shared budget)
├── wizard-step-targeting.tsx         (Step 3: shell — renders network sections)
├── wizard-step-creatives.tsx         (Step 4: media library + upload)
├── wizard-step-tracking.tsx          (Step 5: attribution + postback)
├── wizard-step-review.tsx            (Step 6: per-network summary + launch)
├── network-sections/
│   ├── google-targeting-section.tsx  (extracted from GoogleUacWizard steps 0-3)
│   ├── meta-targeting-section.tsx    (extracted from MetaCampaignWizard)
│   ├── asa-targeting-section.tsx     (new: keyword bid, geo targeting)
│   ├── axon-targeting-section.tsx    (new: country bid config)
│   └── moloco-targeting-section.tsx  (new: publisher filter, exchange selection)
└── google-ad-preview-panel.tsx       (extracted live preview from GoogleUacWizard)
```

### Wizard State Shape

```typescript
interface WizardState {
  // Step 1
  projectId: string;
  objective: 'installs' | 'roas' | 'events';
  selectedNetworks: string[];          // ['google-ads', 'meta', ...]

  // Step 2
  budgetMode: 'per-network' | 'shared';
  sharedBudget?: number;
  perNetworkBudget: Record<string, number>;  // { 'google-ads': 1000, 'meta': 2000 }

  // Step 3 (network-specific — each section manages own sub-state)
  targeting: Record<string, unknown>;   // { 'google-ads': { countries, bidStrategy, ... } }

  // Step 4
  selectedMediaIds: string[];
  networkMediaValidation: Record<string, { valid: boolean; errors: string[] }>;

  // Step 5
  trackingUrl: string;
  postbackEvents: { event: string; url: string }[];

  // Meta
  isDraft: boolean;
  draftSavedAt?: string;
}
```

### NetworkWizardSection Interface

```typescript
// Each network section implements this interface
interface NetworkWizardSectionProps {
  networkKey: string;
  value: Record<string, unknown>;           // network-specific targeting state
  onChange: (v: Record<string, unknown>) => void;
  previewPanel?: React.ReactNode;           // Google provides live preview here
}
```

### Step 3 Targeting Layout

```
Step 3: Targeting
┌─────────────────────────────────────────────────────┐
│ ▼ Google Ads  [brand color header]                  │
│   Countries: [US, JP, KR]                           │
│   Bid strategy: [Target CPI ▼]  Target CPI: [$0.85]│
│   [Live Preview Panel →]                            │
├─────────────────────────────────────────────────────┤
│ ▼ Meta        [brand color header]                  │
│   CBO: [ON]   Budget: [$5,000/day]                  │
│   Lookalike: [1% Purchasers ×] [3% Active Users ×] │
│   Placements: [Advantage+ ●] [Manual ○]             │
├─────────────────────────────────────────────────────┤
│ ▼ ASA         [brand color header]  (if selected)  │
│   ...                                               │
└─────────────────────────────────────────────────────┘
```

## Related Code Files

### Create
- `src/components/campaign-wizard/campaign-wizard-modal.tsx`
- `src/components/campaign-wizard/wizard-step-basics.tsx`
- `src/components/campaign-wizard/wizard-step-budget.tsx`
- `src/components/campaign-wizard/wizard-step-targeting.tsx`
- `src/components/campaign-wizard/wizard-step-creatives.tsx`
- `src/components/campaign-wizard/wizard-step-tracking.tsx`
- `src/components/campaign-wizard/wizard-step-review.tsx`
- `src/components/campaign-wizard/network-sections/google-targeting-section.tsx`
- `src/components/campaign-wizard/network-sections/meta-targeting-section.tsx`
- `src/components/campaign-wizard/network-sections/asa-targeting-section.tsx`
- `src/components/campaign-wizard/network-sections/axon-targeting-section.tsx`
- `src/components/campaign-wizard/network-sections/moloco-targeting-section.tsx`
- `src/components/campaign-wizard/google-ad-preview-panel.tsx`

### Modify
- `src/shared/network-config.ts` — update `createButtonAction` in each config to use `CampaignWizardModal` with `defaultNetwork` prop
- `src/pages/networks/GoogleAdsWorkspace.tsx` — remove `GoogleUacWizard` (extracted); use `CampaignWizardModal`
- `src/pages/networks/MetaWorkspace.tsx` — remove `MetaCampaignWizard` (extracted); use `CampaignWizardModal`
- `src/pages/CampaignLabs.tsx` — add "Create Campaign" button triggering `CampaignWizardModal`

### Delete (after extraction)
- `GoogleUacWizard` component block from `GoogleAdsWorkspace.tsx`
- `MetaCampaignWizard` component block from `MetaWorkspace.tsx`

## Implementation Steps

1. **Create `google-ad-preview-panel.tsx`**
   - Extract the phone mockup preview from `GoogleUacWizard` (lines ~241–334)
   - Props: `headline: string`, `description: string`, `previewTab: 'play'|'search'|'youtube'|'discover'`
   - Pure presentational component

2. **Create `google-targeting-section.tsx`**
   - Extract Google-specific targeting fields from `GoogleUacWizard` steps 0-3
   - Implements `NetworkWizardSectionProps`
   - Provides `previewPanel={<GoogleAdPreviewPanel ... />}` as side panel

3. **Create `meta-targeting-section.tsx`**
   - Extract Meta-specific form fields from `MetaCampaignWizard`
   - CBO toggle, budget fields, optimization goal, location, lookalike, placements
   - Implements `NetworkWizardSectionProps`

4. **Create `asa-targeting-section.tsx`**
   - New: keyword bidding (match type + bid amount), geo targeting, age/gender demographics
   - Simple form, no live preview

5. **Create `axon-targeting-section.tsx`**
   - New: country-level bid table (country + bid amount + optimization target)
   - "Apply Axon Recommendation" button (mocked)

6. **Create `moloco-targeting-section.tsx`**
   - New: exchange selection (multi-select), publisher filter toggle (allowlist/blocklist), category targeting

7. **Create `wizard-step-basics.tsx`**
   - Project selector (Select from `mockProjects`)
   - Objective: `installs | roas | events` (Radio.Group)
   - Network multi-select: checkbox group with network brand colors

8. **Create `wizard-step-budget.tsx`**
   - Mode toggle: "Per Network" / "Shared Budget with Split"
   - Per-network: InputNumber per selected network
   - Shared: single InputNumber + Slider showing % per network (auto-equal split, adjustable)

9. **Create `wizard-step-targeting.tsx`**
   - For each selected network: render `<Collapse.Panel>` with the appropriate `NetworkWizardSection`
   - Google panel includes split layout (form left, preview right)

10. **Create `wizard-step-creatives.tsx`**
    - Media library grid (from `mockMediaItems`, filterable by network format)
    - Upload drop zone
    - Per-network format validation badges (show which assets are valid for which networks)

11. **Create `wizard-step-tracking.tsx`**
    - Attribution tracking URL input
    - Postback event table (event name + URL, addable rows)
    - Simple, shared across all networks

12. **Create `wizard-step-review.tsx`**
    - One summary card per selected network
    - Shows: campaign name (auto-generated from objective + network + date), budget, targeting summary
    - Validation errors highlighted in red per network
    - "Launch Campaign" button → `message.success` per network

13. **Create `campaign-wizard-modal.tsx`**
    - Modal (width: 1100px) with Ant Design `Steps` (6 steps)
    - State: `WizardState` managed with `useReducer`
    - Navigation: prev/next buttons, step click (only if valid)
    - "Save Draft" → `localStorage.setItem('campaign-draft', JSON.stringify(state))`
    - Props: `open`, `onClose`, `defaultNetwork?: string` (pre-selects a network)

14. **Update `network-config.ts` `createButtonAction`**
    - Replace placeholder with `(onClose) => <CampaignWizardModal open onClose={onClose} defaultNetwork={config.key} />`

15. **Remove extracted wizards** from `GoogleAdsWorkspace.tsx` and `MetaWorkspace.tsx`

## Todo List

- [ ] Create `google-ad-preview-panel.tsx`
- [ ] Create `google-targeting-section.tsx` (extract from GoogleUacWizard)
- [ ] Create `meta-targeting-section.tsx` (extract from MetaCampaignWizard)
- [ ] Create `asa-targeting-section.tsx` (new)
- [ ] Create `axon-targeting-section.tsx` (new)
- [ ] Create `moloco-targeting-section.tsx` (new)
- [ ] Create `wizard-step-basics.tsx`
- [ ] Create `wizard-step-budget.tsx` with shared/per-network mode
- [ ] Create `wizard-step-targeting.tsx` with Collapse sections per network
- [ ] Create `wizard-step-creatives.tsx` with media library + format validation
- [ ] Create `wizard-step-tracking.tsx`
- [ ] Create `wizard-step-review.tsx`
- [ ] Create `campaign-wizard-modal.tsx` (main orchestrator)
- [ ] Update `network-config.ts` `createButtonAction` for all 5 networks
- [ ] Remove `GoogleUacWizard` from `GoogleAdsWorkspace.tsx`
- [ ] Remove `MetaCampaignWizard` from `MetaWorkspace.tsx`
- [ ] Add "Create Campaign" button to `CampaignLabs.tsx`
- [ ] Verify draft save/restore from localStorage

## Success Criteria

- "Create Campaign" from any network workspace opens wizard pre-selected to that network
- "Create Campaign" from Campaign Labs opens wizard with no pre-selection
- All 6 steps navigable; back/forward works
- Google targeting section shows live ad preview panel
- Budget step: switching shared/per-network mode doesn't lose entered values
- Review step shows per-network summary with correct budget totals
- Draft saves to localStorage; reopening wizard restores draft
- No TypeScript compile errors; all files < 200 lines

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Wizard state becomes complex with 5 networks | Medium | Use `useReducer` with typed action; each step owns its slice of state |
| Google live preview loses real-time binding when extracted | Low | Pass `headline`/`description` as props; parent step manages state |
| `localStorage` draft conflicts between sessions | Low | Key by user ID (mock: `'campaign-draft-user1'`); add "Discard Draft" option |
| Modal width (1100px) overflows on 1280px screens | Low | Add `overflow-y: auto` on modal body; `max-height: 85vh` |

## Security Considerations

- Draft saved to `localStorage` — contains campaign configuration only, no credentials
- No server calls in this phase — all mock
