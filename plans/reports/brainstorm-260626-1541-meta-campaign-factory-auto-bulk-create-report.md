# Brainstorm Report: Meta Campaign Factory — Auto Bulk Campaign Creation

**Date:** 2026-06-26  
**Scope:** nms-fe (Meta network workspace)  
**Status:** Approved for planning

---

## Problem Statement

Performance marketers cần tạo hàng loạt Meta campaigns theo pattern lặp đi lặp lại (template settings × creative groups). Hiện tại không có tool nào (kể cả native Meta Ads Manager) làm được flow: chọn template → chọn creative set → auto-generate campaign hierarchy. Đây là competitive differentiator nếu implement đúng.

---

## Requirements (Confirmed)

| Item | Decision |
|------|----------|
| Template scope | Full hierarchy: campaign settings + adset shell + ad shell (copy/CTA) |
| Creative Set | Hybrid: filter criteria → preview resolved → confirm as static snapshot |
| Generation output | Configurable: ABO (1 campaign/set) or CBO (1 campaign, N adsets) |
| Template management | Templates tab riêng trong Meta workspace + quick-create trong Factory wizard |
| Sprint scope | Full flow: Template CRUD + Creative Set CRUD + Factory Wizard + Preview + Result |

---

## Industry Research

### Landscape
- **Meta Ads Manager (native):** Không có template-based bulk creation. Workflow: tạo 1-by-1 hoặc duplicate thủ công.
- **Meta Marketing API:** Hỗ trợ batch creation qua `/act_{id}/campaigns` nhưng code-only, không có UX.
- **Smartly.io / AdEspresso:** Có template-based creation với creative matrix nhưng là paid SaaS riêng biệt.
- **TikTok Ads Manager:** Có "Campaign Templates" + "Creative Library" nhưng tách biệt, không generate matrix.
- **ASA (Apple Search Ads):** Có formal "Creative Sets" concept — codebase hiện tại đã có `asa-creative-sets-tab.tsx` làm reference.

**Kết luận:** Không có tool nào implement đúng exact flow Template × CreativeSet matrix generation với UX smooth → đây là unique value add.

### Meta Campaign Hierarchy (Real API)
```
Campaign   → objective, budgetOptimization (CBO/ABO), status
  └── Ad Set  → targeting, bid_strategy, budget (nếu ABO), attribution
        └── Ad  → creative (media hash + copy + CTA)
```

Template full hierarchy mapping trực tiếp vào cấu trúc này.

---

## Evaluated Approaches

### ❌ Option A: Extend `meta-bulk-create-drawer` hiện tại
Thêm "Template mode" vào flow NLP/criteria hiện tại.  
**Rejected:** Two completely different mental models (NLP-driven vs template-driven). Gộp vào tạo UX conflict và tech debt.

### ✅ Option B: Dedicated "Campaign Factory" (Recommended)
Wizard riêng biệt 3 steps: Template → Creative Sets → Config + Preview → Generate.  
**Chosen:** Clean separation, reuses existing components, không ảnh hưởng flows hiện tại.

### ❌ Option C: Tab trong Meta Builder Drawer
Thêm "Batch Create" tab vào `meta-builder-drawer.tsx`.  
**Rejected:** Builder phục vụ edit 1 entity; factory logic sai abstraction layer; drawer đã nặng.

---

## Final Solution Design

### Data Models (New / Extended)

**`CampaignTemplate`** (extends MetaTemplate hiện tại):
```typescript
interface CampaignTemplate {
  id: string; name: string; description?: string;
  network: 'meta';
  // Campaign level
  objective: 'APP_INSTALLS' | 'CONVERSIONS' | 'REACH';
  budgetOptimization: 'CBO' | 'ABO';
  // AdSet shell (defaults, overridable per creative set)
  adsetShell: {
    budget: number; budgetType: 'daily' | 'lifetime';
    bidStrategy: 'LOWEST_COST' | 'COST_CAP' | 'BID_CAP';
    targeting: { countries: string[]; ageMin: number; ageMax: number; placements: string[] };
    attribution: { clickWindow: 1|7|28; viewWindow: 0|1 };
  };
  // Ad shell (copy defaults)
  adShell: {
    format: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
    primaryText: string; headline: string;
    callToAction: string; destinationUrl: string;
  };
  usageCount: number; createdAt: string; updatedAt: string;
}
```

**`CreativeSet`** (new):
```typescript
interface CreativeSet {
  id: string; name: string; description?: string;
  criteria: {
    network?: string[]; type?: ('image'|'video')[];
    minCtr?: number; minRoas?: number; minSpend?: number;
    googleMark?: 'low'|'good'|'all'; projectIds?: string[];
  };
  mediaIds: string[];   // static snapshot confirmed by user
  createdAt: string; updatedAt: string;
}
```

**`GenerationConfig + Result`** (new):
```typescript
interface GenerationConfig {
  templateId: string; creativeSetIds: string[];
  strategy: 'ABO' | 'CBO';
  namingPattern: string; // e.g. "{template} - {set_name} - W{week}"
}

interface GeneratedCampaignPreview {
  campaignName: string;
  adsets: { adsetName: string; adCount: number; mediaIds: string[] }[];
}
```

---

### UX Flow

#### 3-Step Factory Wizard (Drawer, ~800px wide)

```
Step 1: Template
  [Browse templates grid: cards with objective badge, usageCount, edit button]
  [+ Quick Create button → opens simplified form inline/sub-drawer]
  [→ Full Template Management: "Manage Templates ↗"]

Step 2: Creative Sets (multi-select)
  [Browse sets: name, creative count, thumbnail strip]
  [+ New Set → Creative Set Builder sub-drawer]
     Filter: network, type, min CTR, min ROAS
     Preview matched creatives (grid)
     Add/remove individual items
     [Save as Set]
  [Select multiple sets ☑]

Step 3: Config + Preview
  Strategy: ● ABO (N campaigns) | ○ CBO (1 campaign, N adsets)
  Naming: {template} - {set_name} - W{week}
  
  Preview tree (collapsible):
  ▼ Campaign: "App Installs - Top Videos - W26"
    └── AdSet: "targeting: VN age 18-35"
          ├── Ad: video_1.mp4
          └── Ad: video_3.mp4
  ▼ Campaign: "App Installs - Q2 Banners - W26"
    ...
  
  Total: 2 campaigns · 2 ad sets · 7 ads
  [Generate →]

Result Screen:
  Progress bar (mock async)
  Generated campaigns list with links
  [View in Meta Workspace →] [Create Another]
```

#### Templates Tab (Meta Workspace — new tab)
- Table: Name | Objective | Budget type | Bid strategy | Targeting preview | Usage count | Last used | Actions
- Toolbar: [Search] [+ New Template] [Delete selected]
- Clicking row → opens template edit drawer (full form)

---

### Component Architecture

```
src/
├── components/
│   └── networks/
│       └── meta/
│           ├── campaign-factory/
│           │   ├── campaign-factory-drawer.tsx         # Main wizard container (3 steps + result)
│           │   ├── factory-step-template.tsx           # Step 1: template browser + quick-create
│           │   ├── factory-step-creative-sets.tsx      # Step 2: set picker (multi-select)
│           │   ├── factory-step-generate-config.tsx    # Step 3: ABO/CBO toggle + naming + preview
│           │   ├── factory-generation-result.tsx       # Result: progress + generated list
│           │   ├── creative-set-builder-drawer.tsx     # Nested: filter → preview → confirm
│           │   ├── creative-set-card.tsx               # Reusable set card UI
│           │   └── generation-preview-tree.tsx         # Campaign > AdSet > Ad collapsible tree
│           │
│           ├── meta-template-tab.tsx                   # NEW: Templates management tab (table + CRUD)
│           └── use-campaign-factory.ts                 # Hook: full factory state + generation logic
│
├── shared/
│   └── mock-data.ts                                    # + mockCampaignTemplates[], mockCreativeSets[]
│
└── components/networks/meta/meta-types.ts              # + CampaignTemplate, CreativeSet, GenerationConfig
```

**Entry points:**
- Meta workspace toolbar: [+ Campaign] [Bulk Create] [**Campaign Factory** ← NEW]
- Meta workspace tabs: Campaigns | Ad Sets | Ads | Insights | **Templates** ← NEW | Settings

---

### Reusable Existing Components

| Existing | Reused in |
|----------|-----------|
| `creative-performance-filter-bar.tsx` | Creative Set criteria builder |
| `creative-grid-card.tsx` | Creative preview in set builder |
| `meta-template-forms.tsx` | Template full-hierarchy form (extended) |
| `meta-template-drawer.tsx` | Template edit drawer (extended) |
| `meta-drafts-panel.tsx` | Show generated campaigns as drafts |
| `meta-bulk-generation.ts` | Partial: generation logic adapted for template input |
| `creative-preview-modal.tsx` | Preview individual creative in set builder |

---

### Generation Logic (Pseudo-code)

```typescript
// ABO strategy
function generateABO(template: CampaignTemplate, sets: CreativeSet[], naming: string): GeneratedCampaignPreview[] {
  return sets.map(set => ({
    campaignName: renderPattern(naming, { template: template.name, set_name: set.name }),
    adsets: [{
      adsetName: `${set.name} - ${template.adsetShell.targeting.countries.join(',')}`,
      adCount: set.mediaIds.length,
      mediaIds: set.mediaIds,
    }],
  }));
}

// CBO strategy  
function generateCBO(template: CampaignTemplate, sets: CreativeSet[], naming: string): GeneratedCampaignPreview[] {
  return [{
    campaignName: renderPattern(naming, { template: template.name }),
    adsets: sets.map(set => ({
      adsetName: set.name,
      adCount: set.mediaIds.length,
      mediaIds: set.mediaIds,
    })),
  }];
}
```

---

### Naming Pattern Engine (simple token substitution)
```
Variables: {template}, {set_name}, {objective}, {week}, {date}, {counter}
Example:   "Meta - {template} - {set_name} - W{week}"
Output:    "Meta - App Installs - Top Videos - W26"
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Templates tab làm Meta workspace nặng hơn | Tab chỉ load khi active (lazy render) |
| Creative Set snapshot bị stale | Add "Refresh Set" button → re-apply criteria + show diff |
| Naming conflicts khi generate | Preflight check: warn nếu campaign name đã tồn tại trong mock data |
| Meta hierarchy complexity trong preview | Collapsible tree + limit hiển thị 3 levels deep |
| Quick-create trong wizard vs full form conflict | Quick-create là simplified (5 fields); link "Full edit" mở drawer đầy đủ |

---

## Success Metrics

- [ ] User có thể tạo template đầy đủ (campaign + adset + ad shell) trong < 2 phút
- [ ] User có thể tạo creative set từ filter criteria, review và confirm trong < 1 phút
- [ ] Wizard generate preview đúng hierarchy (ABO/CBO) trước khi confirm
- [ ] Generated campaigns xuất hiện trong Meta workspace Campaigns tab
- [ ] Templates tab hiển thị đủ CRUD (list, create, edit, delete)

---

## Implementation Phases (suggested)

**Phase 1 — Types + Mock Data**
- Extend `meta-types.ts`: `CampaignTemplate`, `CreativeSet`, `GenerationConfig`
- Add `mockCampaignTemplates`, `mockCreativeSets` to `mock-data.ts`
- Unit: verify types compile

**Phase 2 — Templates Management Tab**
- `meta-template-tab.tsx`: table with search + CRUD
- Extend `meta-template-drawer.tsx` + `meta-template-forms.tsx` for full hierarchy form
- Wire into Meta workspace `extraTabs`

**Phase 3 — Creative Set Builder**
- `creative-set-builder-drawer.tsx`: filter → preview → confirm
- `creative-set-card.tsx`: reusable display card
- State: localStorage persistence for saved sets

**Phase 4 — Campaign Factory Wizard**
- `campaign-factory-drawer.tsx`: 3-step wizard shell
- `factory-step-template.tsx`: template browser + quick-create
- `factory-step-creative-sets.tsx`: multi-select set picker
- `factory-step-generate-config.tsx`: ABO/CBO toggle + naming + preview tree
- `generation-preview-tree.tsx`: collapsible hierarchy

**Phase 5 — Generation + Result**
- `use-campaign-factory.ts`: generation logic (ABO + CBO)
- `factory-generation-result.tsx`: progress + result screen
- Integration: generated campaigns → mock campaigns list

**Phase 6 — Integration + Polish**
- Add "Campaign Factory" button to Meta workspace toolbar
- Link generated campaigns to Meta workspace
- Naming pattern validation
- Preflight warnings (empty sets, naming conflicts)

---

## Unresolved Questions

1. **Ad copy per creative set:** Template adShell có 1 primaryText/headline. Nếu user muốn ad copy khác nhau per creative set → cần override mechanism ở step 2 hay 3?
2. **Targeting override per creative set:** Template targeting là default. Có cần cho phép override targeting (VD: set A dành cho VN, set B dành cho ID) không?
3. **Template versioning:** Khi template bị edit sau khi đã generate, các campaigns cũ có bị ảnh hưởng không? (Cần snapshot ID?)
4. **Backend integration timeline:** Factory UI này khi nào sẽ kết nối với real Meta API? Ảnh hưởng đến data model design (job queue, async status tracking).
