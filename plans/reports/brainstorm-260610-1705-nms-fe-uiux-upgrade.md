# Brainstorm Report: NMS-FE UI/UX Upgrade

**Date:** 2026-06-10  
**Type:** Architecture Brainstorm  
**Status:** Approved — proceeding to implementation plan

---

## Problem Statement

NMS-FE là internal ad management platform quản lý 5 ad networks (Google, Meta, ASA, Axon, Moloco). Cần nâng cấp toàn bộ UI/UX với trọng tâm:
- Tổ chức lại flow vận hành theo từng network (network-specific workflows + shared core)
- Thêm Cost Center, Split Metrics, Budget Pacing, Cross-network Comparison
- Redesign Navigation, Dashboard, Campaign Wizard, Automation & Rules

**Product model:** Internal tool  
**Backend status:** Cần xác nhận (hiện tại mock data)

---

## Evaluated Approaches

### Option A: Hub + Spokes (CHOSEN)
- Hub: Unified Analytics/Dashboard/Cost Center
- Spokes: Per-network workspace với network-specific config
- **Pros:** DRY, scale tốt, network identity rõ, match pattern của Smartly.io/Singular/AppsFlyer
- **Cons:** Refactor lớn, cần chuẩn hóa data model

### Option B: Giữ 5 workspaces riêng biệt
- **Pros:** Ít refactor
- **Cons:** Duplicate code, không có cross-network view, khó scale

### Option C: Unified single workspace
- **Pros:** Consistent UX
- **Cons:** Quá generic, mất network-specific features

---

## Final Recommended Solution

### Architecture: Hub + Spokes

```
┌─────────────────────────────────────────────────────────┐
│                     HUB (Shared Core)                    │
│   Dashboard │ Analytics │ Cost Center │ Split Metrics    │
└─────────────┬───────────────────────────────────────────┘
              │
    ┌─────────┴──────────────────────────┐
    ▼         ▼         ▼         ▼      ▼
 [Google]  [Meta]   [ASA]    [Axon]  [Moloco]
  Spoke     Spoke    Spoke    Spoke   Spoke
```

### Shared Core Components (DRY)
- `CampaignTable` — configurable columns per network
- `MetricCards` — shared KPI cards
- `BudgetPacingBar` — shared budget indicator
- `FilterBar` — shared filters with network-specific extensions
- `NetworkBadge`, `StatusBadge` — shared badges

### Network Plugin Pattern
```typescript
networkConfig[network] = {
  columns: [...sharedColumns, ...networkSpecificColumns],
  wizard: NetworkSpecificWizard,
  metrics: [...sharedMetrics, ...networkSpecificMetrics],
  ruleConditions: [...sharedConditions, ...networkConditions],
}
```

---

## Redesign Pillars

### 1. Navigation & Shell
- Sidebar: Overview | Campaign Labs (with network switcher) | Analytics | Media | Automation | Settings
- **Network Context Bar:** Persistent bar khi ở network workspace — quick-switch không cần sidebar
- Breadcrumb system

### 2. Dashboard & Analytics (3 Views)
- **Funnel View:** Spend → Installs → CPA → ROAS → Predicted LTV + cross-network comparison cards
- **Cost Center View:** Team/Project × Network × Spend × Budget % × Pacing (NEW)
- **Split Metrics Pivot:** Metric × Dimension × Dimension table — drag-and-drop axes (NEW)

### 3. Per-Network Workspace (3 Tabs each)
- `Campaigns` — table với network-specific columns
- `Insights` — network-specific analytics
- `Settings` — API key, sync config

### 4. Campaign Creation Wizard (6 Steps)
1. Basics (App, Objective, Networks multi-select)
2. Budget (per-network hoặc shared với auto-split)
3. Targeting (collapse per network)
4. Creatives (media library + format validation)
5. Tracking (attribution, postback)
6. Review (per-network summary)

### 5. Network-Aware Automation & Rules
- Network selector → conditions thay đổi theo network
- Network-specific conditions: Google impression share, Meta relevance score, Axon country bids, etc.
- Shared template library

---

## Implementation Phases

| Phase | Scope | Complexity | Value |
|---|---|---|---|
| Phase 1 | Navigation shell + Network Context Bar | Low | Foundation |
| Phase 2 | Dashboard Funnel + Cost Center + Split Metrics | High | Highest |
| Phase 3 | Per-network workspace standardization + Plugin config | Medium | High |
| Phase 4 | Campaign Wizard (unified 6-step) | High | Medium |
| Phase 5 | Network-aware Automation & Rules | Medium | Medium |

---

## Market Research Findings

Based on Smartly.io, Singular, AppsFlyer, Revealbot, Meta Ads Manager analysis:
- Hub+Spokes is the dominant enterprise pattern
- Pivot table breakdown analysis replaces pre-baked reports
- Progressive disclosure wizard reduces form abandonment
- Cost attribution transparency is critical for finance team trust

Full research report: `plans/reports/researcher-260610-1708-mobile-ad-network-ux-patterns.md`

---

## Success Metrics

- Reduced navigation clicks: target 40% reduction to reach cross-network data
- Campaign creation time: target 30% reduction via wizard
- Dashboard load time: target < 2s for pivot table with 3 dimensions
- Code duplication: reduce network workspace code by ~60% via shared components

---

## Unresolved Questions

1. Backend status — API ready hay build song song với UI?
2. Cost Center hierarchy — by team (user) hay by project (app) hay both?
3. Multi-app cross comparison — cần thiết ở phase này không?
4. Data retention scope cho analytics views
5. Budget pacing — realtime hay T-1?
