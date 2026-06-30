# Brainstorm: Meta Batch Campaign Generator
**Date:** 2026-06-29 | **Author:** brainstorm skill | **Status:** Approved → Plan

---

## Problem Statement

**Core problem:** UA team tạo campaigns thủ công từng cái, mỗi campaign mất 5-10 phút. Khi có N themes × M templates × K accounts, số campaigns cần tạo = N×M×K — không scale được.

**Symptom được report:** "phải add thủ công từng media vào camp"  
**Underlying problem:** Không có batch/combinatorial generation — mọi combination phải tạo tay.

---

## Constraints & Decisions

| Question | Answer |
|----------|--------|
| Theme definition | Naming convention trong filename (`N3_{Theme}_Ver...`) |
| Scope | Full Level 3: Templates × Themes × Accounts |
| Copy fields | Inherited from template |
| UI entry point | Separate "Batch Generate" button in workspace header |

---

## Theme Detection Design

**Filename pattern:** `{AppCode}_{ThemeName}_Ver{version}_{dims}_{res}.{ext}`

**Examples:**
- `N3_Sexy_Phone_Ver1.3_25-55_916.mp4` → theme: `Sexy_Phone`
- `N3_Mistakes_Phone_Ver2.3_25-55.mp4` → theme: `Mistakes_Phone`
- `N3_Clean_IOS_Ver1.0_9-16.mp4` → theme: `Clean_IOS`

**Parser regex:** `^[A-Z0-9]+_(.+?)_Ver\d`

**Edge cases:**
- Files không match pattern → bucket `Uncategorized`
- Multiple files same theme → grouped automatically
- UI cho phép rename theme label (display only, không đổi filename)

---

## Recommended Solution: Batch Campaign Generator

### Architecture Overview

```
[Workspace Header: "Batch Generate" button]
  ↓ opens fullscreen drawer
[Phase 1: Setup — 3-column picker]
  ↓
[Phase 2: Matrix Preview — table of all combinations]
  ↓
[Phase 3: Generation Progress — queued job list]
```

---

## Phase 1: Setup UI (3-Column Picker)

3 columns side-by-side: Templates | Themes | Ad Accounts

```
┌────────────────┬───────────────────┬─────────────────────────────┐
│ TEMPLATES      │ THEMES (detected) │ AD ACCOUNTS                 │
│                │                   │                             │
│ ☑ App Promo   │ ☑ Sexy_Phone      │ ☑ FOCUS PT                 │
│   Clean       │   3 videos        │                             │
│               │   [▶][▶][▶]       │ ☑ FOCUS ES                 │
│ ☑ App Promo   │                   │                             │
│   Focus       │ ☑ Mistakes_Phone  │ ☐ Focus EN                 │
│               │   2 videos        │                             │
│ ☐ iOS 14+     │   [▶][▶]          │ ☐ Focus ASIA               │
├────────────────┴───────────────────┴─────────────────────────────┤
│  2 templates × 2 themes × 2 accounts = 8 campaigns              │
│                                           [Preview Matrix →]     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Matrix Preview + Configure

- Table showing all N×M×K combinations
- User can uncheck rows to exclude specific combos
- Campaign name pattern editor: `{template} - {theme} [{account}]`
- Budget: inherited from template (override optional)

```
┌──────────────────────────────────────────────────────────────────┐
│ Preview: 8 campaigns                            [← Back]        │
│                                                                  │
│ Name pattern: [{template}] {theme} | {account}                  │
│                                                                  │
│  ✓  Template          Theme          Account    Generated Name  │
│  ☑  App Promo Clean  Sexy_Phone     FOCUS PT   [App Promo…]    │
│  ☑  App Promo Clean  Sexy_Phone     FOCUS ES   [App Promo…]    │
│  ☑  App Promo Clean  Mistakes       FOCUS PT   [App Promo…]    │
│  ...                                                             │
│                                                                  │
│  Selected: 8/8      [Generate 8 Campaigns →]                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phase 3: Generation Progress

- Queue-based: sequential per account (avoid rate limits)
- Per-row status: Queued → Running → Done / Error
- Failed rows: red badge + "Retry" button (không dừng queue)
- On complete: "View in Campaign List" CTA

```
┌──────────────────────────────────────────────────────────────────┐
│ Generating... 3/8 completed                                      │
│ ████████████░░░░░░░░░  37%                                      │
│                                                                  │
│  ✅  App Promo Clean - Sexy_Phone [FOCUS PT]         Done       │
│  ✅  App Promo Clean - Sexy_Phone [FOCUS ES]         Done       │
│  ✅  App Promo Clean - Mistakes   [FOCUS PT]         Done       │
│  ⟳   App Promo Clean - Mistakes   [FOCUS ES]         Running    │
│  ○   App Promo Focus - Sexy_Phone [FOCUS PT]         Queued     │
│  ...                                                             │
│                                                                  │
│  [Pause]    [Cancel]           Est. ~2 min remaining            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Components to Build

| Component | File | Description |
|-----------|------|-------------|
| Entry button | `meta-workspace-header.tsx` | "Batch Generate" + Sparkles icon |
| Main drawer | `meta-batch-generator-drawer.tsx` | Fullscreen drawer, manages phase state |
| Template picker | `meta-batch-template-picker.tsx` | Multi-select card grid |
| Theme picker | `meta-batch-theme-picker.tsx` | Auto-detected themes with preview |
| Account picker | `meta-batch-account-picker.tsx` | Ad accounts multi-select |
| Matrix preview | `meta-batch-matrix-preview.tsx` | Table of combinations, name pattern editor |
| Progress tracker | `meta-batch-progress-tracker.tsx` | Queue status list + overall progress bar |
| Theme parser util | `meta-theme-parser.ts` | Filename → theme name regex utility |

---

## Phased Implementation

| Phase | Scope | FE Effort | BE Effort | Priority |
|-------|-------|-----------|-----------|----------|
| 1 | Templates × Themes → N campaigns, 1 account | Medium | Low | P1 - now |
| 2 | Matrix exclude cells + name pattern editor | Low | None | P1 - now |
| 3 | Multi-account + job queue | Medium | **High** | P2 - next sprint |

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Inconsistent filename naming → wrong theme parse | High | Show parsed themes for review; allow manual rename before generating |
| Level 3 multi-account needs backend job queue | High | Phase 3 requires BE `/api/meta/batch-generate` endpoint; don't block Phase 1 |
| N×M×K = many API calls, rate limiting | Medium | Sequential queue per account; expose pause/cancel |
| Campaign name collision if run twice | Medium | Append timestamp or check duplicate before create |
| Large theme (100+ media) × many templates = slow | Low | Lazy load media in Phase 3; show progress per file |

---

## Success Metrics

- UA team creates 10-session batch (10 campaigns) in <2 min vs. 50-100 min today
- Zero manual media selection for standard theme-based campaigns
- Error rate <5% on generation (retryable individually)

---

## Open Questions

1. Are ad account credentials already available in the FE state, or need separate fetch?
2. Does "copy from template" cover ALL copy fields (CTA, primary text, headlines), or just some?
3. What's the max campaigns a UA team typically generates in one batch? (affects UX for progress phase)
