# Phase 3: Advanced — Wizard, ⌘K, Rules UI, Reporting Hub

**Priority:** P2  
**Status:** Pending (blocked by Phase 1 + Phase 2)  
**Effort:** ~5-8 days  
**Parallelism:** After Phase 1 + Phase 2 complete

## Context Links

- Plan overview: [plan.md](./plan.md)
- Current wizard modal: `src/components/campaign-wizard/campaign-wizard-modal.tsx`
- Routes: `src/routes/appRoutes.tsx`
- Navigation config: `src/shared/navigation.ts`
- Automation pages: `src/pages/AppAutomationRules.tsx`
- Dashboard: `src/pages/Dashboard.tsx`
- Network configs: `src/shared/network-configs/`

## Overview

4 advanced improvements với effort cao hơn. Một số phụ thuộc BE API (reporting hub).
Nên validate Phase 0-2 với users trước khi đầu tư vào phase này.

---

## Task 3-A: Full-Page Campaign Creation Wizard

### Problem
`CampaignWizardModal` là modal dialog — multi-step form trong modal bị cramped,
không tận dụng được screen space, không hỗ trợ browser Back button.

### Solution
Chuyển campaign CREATE flow sang **full-page route**. Campaign EDIT vẫn dùng drawer (Phase 2).

```
Route: /apps/:appId/networks/:networkId/campaigns/new
```

Layout:
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to [Network] Workspace                          │
├──────────────────┬──────────────────────────────────────┤
│  Steps Panel     │  Form Panel                          │
│  ─────────────── │  ───────────────────────────────────  │
│  ● 1. Basics     │  Campaign Name *                     │
│  ○ 2. Budget     │  [_________________________]         │
│  ○ 3. Targeting  │                                      │
│  ○ 4. Creatives  │  Objective *                         │
│  ○ 5. Review     │  [App Installs          ▾]           │
│                  │                                      │
│  [────────────]  │  Network: Moloco                     │
│  Progress: 20%   │  App: Clash of Clans                 │
│                  │                                      │
│                  │  [Back]            [Next →]          │
└──────────────────┴──────────────────────────────────────┘
```

### Architecture

```
src/pages/
└── campaign-create-page.tsx    (NEW — full-page wizard shell)

src/components/campaign-wizard/
├── campaign-wizard-modal.tsx   (KEEP — still used for quick create from global context)
├── wizard-step-basics.tsx      (extract from modal if not already split)
├── wizard-step-budget.tsx
├── wizard-step-targeting.tsx
├── wizard-step-creatives.tsx
└── wizard-step-review.tsx
```

```typescript
// pages/campaign-create-page.tsx — NEW
// Thin shell: reads appId + networkId from params, renders wizard steps in full-page layout
export const CampaignCreatePage: React.FC = () => {
  const { appId, networkId } = useParams<{ appId: string; networkId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Campaign>>({});

  const handleComplete = (data: Campaign) => {
    // save + navigate back to workspace
    navigate(`/apps/${appId}/networks/${networkId}`);
    toast.success('Campaign created successfully');
  };

  return (
    <div className="min-h-screen bg_subtle flex flex-col">
      {/* Back header */}
      <div className="h-14 px-6 flex items-center gap-3 border-b border_primary bg_primary">
        <button onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-xs font-medium text_secondary
                           hover:fg_accent_primary transition-colors">
          <ArrowLeft size={14} /> Back to workspace
        </button>
        <span className="text_tertiary">/</span>
        <span className="text-xs font-semibold text_primary">New Campaign</span>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 max-w-5xl mx-auto w-full gap-8 p-8">
        {/* Steps panel */}
        <div className="w-56 flex-shrink-0">
          <WizardStepsPanel currentStep={step} networkKey={networkId ?? ''} />
        </div>
        {/* Form panel */}
        <div className="flex-1">
          <WizardStepRenderer
            step={step}
            networkKey={networkId ?? ''}
            appId={appId ?? ''}
            formData={formData}
            onChange={updates => setFormData(prev => ({ ...prev, ...updates }))}
            onNext={() => setStep(s => s + 1)}
            onBack={() => setStep(s => s - 1)}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
};
```

**Route addition:**
```typescript
// appRoutes.tsx — add inside apps/:appId/networks/:networkId children
{
  path: 'campaigns/new',
  element: <Suspense fallback={<LoadingSpinner />}><CampaignCreatePage /></Suspense>,
}
```

**Network workspace shell — update Create button:**
```typescript
// network-workspace-shell.tsx — thay wizardOpen modal trigger bằng navigate
const navigate = useNavigate();
// ...
onClick={() => navigate(`/apps/${appId}/networks/${config.key}/campaigns/new`)}
```

**Files to create:**
- `src/pages/campaign-create-page.tsx` (<100 lines — delegates step rendering to wizard components)

**Files to modify:**
- `src/routes/appRoutes.tsx` — add new route
- `src/components/networks/network-workspace-shell.tsx` — update Create button to navigate

**Note:** `CampaignWizardModal` vẫn giữ nguyên cho backwards compatibility (global create context không có appId/networkId).

### Acceptance Criteria
- [ ] Click "New Campaign" trong network workspace → navigate đến `/apps/:id/networks/:id/campaigns/new`
- [ ] Full-page layout: steps panel bên trái, form bên phải
- [ ] Browser Back button → về workspace (không về modal state)
- [ ] Hoàn thành wizard → redirect về workspace + toast success
- [ ] Steps reflect đúng network (Moloco steps ≠ Google Ads steps)
- [ ] `campaign-create-page.tsx` < 100 lines (delegates to wizard components)

---

## Task 3-B: Command Palette ⌘K

### Problem
Power users muốn jump nhanh giữa app/network contexts mà không dùng chuột.
Hiện không có keyboard-first navigation.

### Solution
Global command palette triggered bởi `⌘K` (Mac) / `Ctrl+K` (Windows):
- Fuzzy search apps + networks
- Jump đến bất kỳ workspace
- Quick actions: "New Campaign", "Go to Dashboard", "Open Media Library"

```
[⌘K] ──────────────────────────────────────────────────
  Search apps, networks, actions...
  ─────────────────────────────────────────────────────
  APPS
  ▸ Clash of Clans  →  [Google Ads] [Meta] [Moloco]
  ▸ Rise of Kingdoms  →  [ASA] [Axon]
  ─────────────────────────────────────────────────────
  QUICK ACTIONS
  ▸ New Campaign           (current workspace)
  ▸ Go to Dashboard
  ▸ Open Media Library
```

### Architecture

```
src/components/ui/
└── command-palette.tsx    (NEW — ~150 lines, split if needed)

src/components/layout/
└── AppLayout.tsx          (modify — add global keydown listener)
```

```typescript
// command-palette.tsx — uses Ant Design Modal + custom search
export const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({
  open, onClose,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query) return getDefaultItems(); // apps + quick actions
    return fuzzySearch(query, getAllSearchableItems());
  }, [query]);

  const handleSelect = (action: () => void) => {
    action();
    onClose();
    setQuery('');
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={560}
           closable={false} styles={{ body: { padding: 0 } }}>
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border_primary">
          <Search size={16} className="text_tertiary flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search apps, networks, actions..."
            className="flex-1 text-sm bg-transparent outline-none text_primary placeholder:text_tertiary"
          />
          <kbd className="text-[10px] text_tertiary border border_secondary rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {results.map(group => (
            <div key={group.label}>
              <div className="px-4 py-1 text-[10px] font-bold text_tertiary uppercase tracking-wider">
                {group.label}
              </div>
              {group.items.map(item => (
                <button key={item.key}
                        onClick={() => handleSelect(item.action)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs
                                   text_primary hover:bg_button_tertiary text-left transition-colors">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <kbd className="ml-auto text-[10px] text_tertiary border border_secondary
                                    rounded px-1.5 py-0.5">{item.shortcut}</kbd>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
```

**Global keydown hook:**
```typescript
// AppLayout.tsx — thêm palette state + listener
const [paletteOpen, setPaletteOpen] = useState(false);

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setPaletteOpen(prev => !prev);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

**Files to create:**
- `src/components/ui/command-palette.tsx` (<150 lines, split if needed)

**Files to modify:**
- `src/components/layout/AppLayout.tsx` — add palette state + keyboard listener

### Acceptance Criteria
- [ ] `⌘K` / `Ctrl+K` mở palette từ bất kỳ trang nào
- [ ] `ESC` đóng palette
- [ ] Gõ "clash meta" → hiện shortcut đến Clash of Clans > Meta workspace
- [ ] Click item → navigate đúng, palette đóng
- [ ] Palette empty state (không có kết quả): hiện "No results"
- [ ] `command-palette.tsx` < 150 lines

---

## Task 3-C: Automation Rule Card UI + Template Library

### Problem
Rule list hiện là bảng dữ liệu khó đọc — không thấy ngay rule đang làm gì.
Blank-slate problem: tạo rule mới không biết bắt đầu từ đâu.

### Solution

**Rule Card Display:**
```
┌──────────────────────────────────────────────────── ● Active ─┐
│ Pause High CPA Campaigns                                       │
│                                                                │
│ IF  CPA > $8.00  for  3 consecutive days                       │
│ THEN  Pause campaign  +  Notify #ua-alerts                     │
│                                                                │
│ 🕐 Every 60 min  │  Triggered 12x  │  Last: 2h ago   [✏] [⏸] │
└────────────────────────────────────────────────────────────────┘
```

**Template Library (modal khi click "New Rule"):**
```
Choose a template or start from scratch:

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 🔴 Pause High   │ │ 🟢 Scale Winner │ │ 🟡 ROAS Alert   │
│ CPA Campaigns   │ │ Campaigns       │ │                 │
│                 │ │                 │ │ IF ROAS < 1.5x  │
│ IF CPA > $X     │ │ IF ROAS > 3x    │ │ THEN Notify     │
│ THEN Pause      │ │ THEN +20% budget│ │ Slack           │
└─────────────────┘ └─────────────────┘ └─────────────────┘

[ + Start from scratch ]
```

### Architecture

```
src/components/automation/
├── rule-card.tsx               (NEW — single rule card display)
├── rule-template-picker.tsx    (NEW — template selection modal)
└── rule-editor-modal.tsx       (existing — keep, integrate template pre-fill)
```

```typescript
// rule-card.tsx — NEW
interface RuleCardProps {
  rule: NetworkRule;
  onEdit: (rule: NetworkRule) => void;
  onToggle: (ruleId: string, newStatus: 'active' | 'paused') => void;
}

// Renders human-readable "IF ... THEN ..." summary
const formatCondition = (rule: NetworkRule): string => {
  const conditionLabels: Record<string, string> = {
    ROAS_DROP: `ROAS < ${rule.conditionParam}x`,
    HIGH_CPA: `CPA > $${rule.conditionParam}`,
    LOW_CTR: `CTR < ${rule.conditionParam}%`,
  };
  return conditionLabels[rule.conditionKey] ?? rule.conditionKey;
};
```

```typescript
// rule-template-picker.tsx — NEW
const RULE_TEMPLATES = [
  {
    id: 'pause-high-cpa',
    title: 'Pause High CPA',
    description: 'Pause campaigns when CPA exceeds threshold',
    conditionKey: 'HIGH_CPA',
    conditionParam: 8,
    actionKey: 'PAUSE_CAMPAIGN',
    scheduleMinutes: 60,
    icon: '🔴',
  },
  {
    id: 'scale-winners',
    title: 'Scale Winner Campaigns',
    description: 'Increase budget when ROAS is strong',
    conditionKey: 'HIGH_ROAS',
    conditionParam: 3,
    actionKey: 'INCREASE_BUDGET',
    actionParam: 20,
    scheduleMinutes: 1440,
    icon: '🟢',
  },
  {
    id: 'roas-alert',
    title: 'ROAS Drop Alert',
    description: 'Notify Slack when ROAS drops below target',
    conditionKey: 'ROAS_DROP',
    conditionParam: 1.5,
    actionKey: 'NOTIFY_SLACK',
    scheduleMinutes: 60,
    icon: '🟡',
  },
];
```

**Files to create:**
- `src/components/automation/rule-card.tsx` (<80 lines)
- `src/components/automation/rule-template-picker.tsx` (<100 lines)

**Files to modify:**
- `src/pages/AppAutomationRules.tsx` — use RuleCard instead of table rows
- `src/components/networks/NetworkWorkspaceAutomationRules.tsx` — add template picker trigger

### Acceptance Criteria
- [ ] Rules list hiện dưới dạng cards, không phải table rows
- [ ] Mỗi card hiện: rule name, human-readable IF/THEN, schedule, trigger count, last triggered
- [ ] Edit/Pause buttons trên card hoạt động
- [ ] "New Rule" button → template picker modal mở
- [ ] Chọn template → rule editor pre-fill với template values
- [ ] "Start from scratch" → rule editor empty
- [ ] `rule-card.tsx` < 80 lines, `rule-template-picker.tsx` < 100 lines

---

## Task 3-D: Unified Reporting Hub

**⚠️ Backend Dependency** — Task này cần unified reporting API endpoint từ BE.
Implement với mock data trước, wire real API khi BE sẵn sàng.

### Solution

New page `/reports` với cross-network aggregated view:

```
src/pages/
└── ReportsPage.tsx    (NEW)

src/components/analytics/
├── cross-network-kpi-summary.tsx    (NEW)
├── network-performance-table.tsx    (NEW — breakdown by network)
└── (existing analytics components)
```

```typescript
// ReportsPage.tsx — thin orchestrator
// Filters: App selector + Network multi-select + Date range
// Sections:
//   1. KPI Summary strip (Spend, Installs, ROAS, CPA) + delta indicators (Phase 0-D)
//   2. Network Comparison Cards (existing component)
//   3. Performance breakdown table: rows = App × Network, cols = metrics
```

**Route:**
```typescript
// appRoutes.tsx
{ path: 'reports', element: <Suspense ...><ReportsPage /></Suspense> }
```

**Navigation:**
```typescript
// navigation.ts — add to GLOBAL_NAV_ITEMS
{ path: '/reports', label: 'Reports', icon: 'reports' }
```

**Files to create:**
- `src/pages/reports-page.tsx` (<100 lines — delegates to analytics components)
- `src/components/analytics/cross-network-kpi-summary.tsx` (<80 lines)
- `src/components/analytics/network-performance-breakdown-table.tsx` (<100 lines)

**Files to modify:**
- `src/routes/appRoutes.tsx` — add route
- `src/shared/navigation.ts` — add nav item
- `src/components/layout/AppSidebar.tsx` — add Reports to global nav icons

### Acceptance Criteria
- [ ] `/reports` route accessible từ sidebar
- [ ] KPI summary hiện aggregated Spend/Installs/ROAS/CPA across all networks
- [ ] Filter by App + Network + Date range
- [ ] Performance breakdown table: sortable by any metric column
- [ ] Mock data cho prev period để test delta indicators
- [ ] Page hoạt động với mock data, sẵn sàng swap BE API
- [ ] `reports-page.tsx` < 100 lines

---

## Execution Order trong Phase 3

```
3-A (Full-page wizard)   ─┐
3-C (Rule cards)         ─┤── parallel (no shared files)
3-D (Reports hub)        ─┘
        │
        └── 3-B (⌘K palette) — last (needs all routes finalized for search index)
```

## Success Criteria (Phase 3 overall)

- [ ] All 4 tasks pass acceptance criteria
- [ ] No regression trên Phase 0-2 features
- [ ] `CampaignWizardModal` không bị break (modal path vẫn hoạt động)
- [ ] TypeScript compile clean
- [ ] Tất cả new files < 200 lines (split nếu cần)

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Full-page wizard state bị mất khi navigate away | Medium | Lưu draft vào sessionStorage hoặc Redux với clear-on-complete |
| ⌘K shortcut conflict với browser/OS | Low | Dùng `e.preventDefault()` + test trên cả Mac/Windows |
| Reports page chậm với large mock data | Low | Virtualize table nếu > 100 rows |
| BE reporting API không sẵn sàng | High | Deploy page với mock, add BE_READY feature flag comment |

## Open Questions

- [ ] Full-page wizard: có cần auto-save draft không? (UX vs complexity tradeoff)
- [ ] ⌘K: có cần keyboard navigation (arrow keys) không? (Phase 3.1 có thể thêm sau)
- [ ] Reports hub: BE unified endpoint ETA là bao lâu?
- [ ] Rule templates: ai là owner để quyết định template library?
