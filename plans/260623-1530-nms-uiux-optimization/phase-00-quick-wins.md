# Phase 0: Quick Wins

**Priority:** P0 — Highest impact, lowest risk, deployable independently  
**Status:** Completed  
**Effort:** ~2-3 days  
**Parallelism:** Independent — can deploy before other phases

## Context Links

- Plan overview: [plan.md](./plan.md)
- Shell: `src/components/networks/network-workspace-shell.tsx` (247 lines)
- Campaign table: `src/components/networks/network-campaign-table.tsx`
- StatusBadge: `src/components/ui/StatusBadge.tsx`
- Mock data: `src/shared/mock-data.ts`

## Overview

5 improvements không đụng tới navigation architecture, deployable independently.
Tất cả đều là pure UI enhancements trên existing components.

---

## Task 0-A: Tab Overflow → "More" Dropdown

### Problem
Moloco workspace có **9 tabs** (Overview + 5 extraTabs + Automation Rules + Insights + Settings).
Tab bar bị overflow, các tab cuối bị ẩn hoặc scroll.

### Solution
Thêm logic vào `network-workspace-shell.tsx`:
- Luôn hiện 3 primary tabs: **Overview**, **Insights**, **Settings**
- Các tab còn lại (extraTabs + Automation Rules) vào dropdown **"More ▾"**
- Cho phép user "pin" tab lên primary bar (lưu preference vào localStorage)

### Implementation

```typescript
// network-workspace-shell.tsx — add tab overflow logic
const PRIMARY_TAB_KEYS = ['campaigns', 'insights', 'settings'];
const MAX_VISIBLE_TABS = 4; // 3 primary + 1 pinned slot

// Separate primary vs overflow tabs
const primaryTabs = allTabs.filter(t => PRIMARY_TAB_KEYS.includes(t.key as string));
const overflowTabs = allTabs.filter(t => !PRIMARY_TAB_KEYS.includes(t.key as string));

// "More" dropdown tab using Ant Design Dropdown + custom tab node
const moreTabNode = overflowTabs.length > 0 ? {
  key: 'more-overflow',
  label: (
    <Dropdown menu={{ items: overflowTabs.map(t => ({ key: t.key, label: t.label })) }}
              onOpenChange={...} trigger={['click']}>
      <span>More <ChevronDown size={12} /></span>
    </Dropdown>
  ),
  children: overflowTabs.find(t => t.key === activeOverflowTab)?.children ?? null,
} : null;
```

**Files to modify:**
- `src/components/networks/network-workspace-shell.tsx` — add overflow logic (~30 lines added)

**Files to create:**
- None (inline logic in shell)

### Acceptance Criteria
- [x] Moloco: hiện 3 primary tabs + "More ▾" dropdown
- [x] Click item trong "More" → tab content renders correctly
- [x] Tab bar không bị horizontal scroll
- [x] Workspaces có ≤4 tabs: không hiện "More" dropdown

---

## Task 0-B: Bulk Actions Floating Toolbar

### Problem
Không có cách chọn nhiều campaigns và thực hiện action hàng loạt.
UA operator phải pause/resume từng campaign một → 10 campaigns = 10 lần click.

### Solution
Thêm row selection vào campaign table. Khi chọn ≥1 row, hiện floating bar ở bottom viewport:
```
┌─────────────────────────────────────────────────────────────────┐
│  ☑ 3 campaigns selected    [▶ Resume]  [⏸ Pause]  [✕ Clear]   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// network-campaign-table.tsx — add row selection + bulk bar
const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

const rowSelection = {
  selectedRowKeys,
  onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
};

const BulkActionBar: React.FC = () => {
  if (selectedRowKeys.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                    flex items-center gap-3 px-5 py-3
                    bg_primary border border_primary radius_8 shadow-lg">
      <span className="text-xs font-semibold text_secondary">
        {selectedRowKeys.length} selected
      </span>
      <div className="w-px h-4 bg_border_secondary" />
      <Button size="s" variant="border" onClick={handleBulkResume}>
        <Play size={12} /> Resume
      </Button>
      <Button size="s" variant="border" onClick={handleBulkPause}>
        <Pause size={12} /> Pause
      </Button>
      <Button size="s" variant="subtle" onClick={() => setSelectedRowKeys([])}>
        <X size={12} /> Clear
      </Button>
    </div>
  );
};
```

**Files to modify:**
- `src/components/networks/network-campaign-table.tsx` — add rowSelection + BulkActionBar

### Acceptance Criteria
- [ ] Checkbox column xuất hiện trên campaign table
- [ ] Chọn ≥1 row → floating bar hiện ở bottom viewport
- [ ] Pause bulk: tất cả selected campaigns chuyển sang PAUSED, toast success
- [ ] Resume bulk: tất cả selected campaigns chuyển sang ACTIVE, toast success
- [ ] Clear: deselect all, bar ẩn
- [ ] Bar không che content khi không có selection

---

## Task 0-C: Status Chip Quick Toggle + Undo Toast

### Problem
Đổi status campaign (ACTIVE ↔ PAUSED) cần mở modal confirm → 3-4 clicks.
Với UA operator đổi status 10-20 campaigns/ngày, rất tốn thời gian.

### Solution
StatusBadge trong campaign table trở thành clickable toggle.
Sau khi toggle: hiện toast với **Undo** button (3 giây timeout).

```typescript
// network-campaign-table.tsx — make status cell clickable
{
  title: 'Status',
  dataIndex: 'status',
  render: (status: string, record: Campaign) => (
    <StatusBadge
      label={status}
      variant={statusToVariant(status)}
      onClick={() => handleStatusToggle(record)}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    />
  ),
}

// handleStatusToggle với undo support
const handleStatusToggle = (campaign: Campaign) => {
  const prevStatus = campaign.status;
  const nextStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
  updateCampaignStatus(campaign.id, nextStatus);
  
  toast.custom(({ id }) => (
    <div className="flex items-center gap-3">
      <span>{campaign.name}: {nextStatus}</span>
      <button onClick={() => { updateCampaignStatus(campaign.id, prevStatus); toast.dismiss(id); }}>
        Undo
      </button>
    </div>
  ), { duration: 3000 });
};
```

**Files to modify:**
- `src/components/networks/network-campaign-table.tsx` — add click handler on status cell
- `src/components/ui/StatusBadge.tsx` — add optional `onClick` prop

### Acceptance Criteria
- [x] Click vào status badge → toggle ACTIVE↔PAUSED
- [x] Toast hiện với "Undo" button, tự dismiss sau 3 giây
- [x] Click Undo → status revert về original, toast dismiss
- [x] DRAFT/ERROR/COMPLETED status: không toggle (disabled state)
- [x] StatusBadge không onClick: render như cũ (no regression)

---

## Task 0-D: Delta Indicators trên KPI Metrics

### Problem
Dashboard và Insights tab hiện số tuyệt đối (Spend: $45,230) nhưng không có context.
UA operator không biết ngay đây là tốt hay xấu so với hôm qua/tuần trước.

### Solution
Thêm delta chip bên cạnh mỗi KPI metric:
```
Spend: $45,230  ↑ +12.3%    ROAS: 2.3x  ↓ -5.1%
```
Color-coded: xanh = cải thiện (ROAS/Installs tăng, CPA giảm), đỏ = xấu đi.

```typescript
// components/ui/DeltaChip.tsx — NEW small component
interface DeltaChipProps {
  delta: number;        // e.g. 12.3 for +12.3%
  positiveIsGood?: boolean;  // default true; set false for CPA (lower = better)
}

export const DeltaChip: React.FC<DeltaChipProps> = ({ delta, positiveIsGood = true }) => {
  const isPositive = delta > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  const color = isGood ? 'fg_emerald_strong' : 'fg_red_strong';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${color}`}>
      <Icon size={10} />
      {isPositive ? '+' : ''}{delta.toFixed(1)}%
    </span>
  );
};
```

**Files to create:**
- `src/components/ui/delta-chip.tsx` — DeltaChip component (<40 lines)

**Files to modify:**
- `src/components/analytics/funnel-kpi-strip.tsx` — add DeltaChip next to each metric
- `src/components/networks/network-insights-tab.tsx` — add DeltaChip to KPI stats

**Note:** Dùng mock delta data trong `mock-data.ts` (add `prevSpend`, `prevRoas` etc.).
Khi BE có real prev-period API, chỉ cần swap mock với real data.

### Acceptance Criteria
- [x] KPI strip hiện delta % bên cạnh Spend, Installs, ROAS, CPA
- [x] Màu xanh khi: Spend tăng (hoặc neutral), ROAS tăng, Installs tăng, CPA giảm
- [x] Màu đỏ khi ngược lại
- [x] Khi không có prev data: delta chip ẩn (không show "--" hay "0%")
- [x] DeltaChip component < 50 lines, standalone, reusable

---

## Task 0-E: Persistent Filter State

### Problem
Mỗi khi navigate đi rồi quay lại workspace, filter bị reset.
UA operator phải re-apply filter "ACTIVE only" mỗi lần → annoying daily.

### Solution
Lưu filter state vào localStorage với key theo network+appId.
Khi mount component, đọc saved filter và apply.

```typescript
// shared/hooks/use-persistent-filter.ts — NEW hook
export function usePersistentFilter<T>(key: string, defaultValue: T) {
  const storageKey = `nms-filter:${key}`;
  
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  });

  const setAndPersist = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  return [state, setAndPersist] as const;
}
```

**Files to create:**
- `src/shared/hooks/use-persistent-filter.ts` — hook (<30 lines)

**Files to modify:**
- `src/components/networks/network-workspace-shell.tsx` — replace `useState` for filter với `usePersistentFilter`

### Acceptance Criteria
- [x] Set filter "Status: ACTIVE" trong Moloco workspace
- [x] Navigate đến Dashboard, quay lại Moloco → filter vẫn còn
- [x] Filter key là unique per network: moloco và google-ads có filter state riêng
- [x] "Reset" button trong Filter Drawer: clear filter + clear localStorage
- [x] Hook < 35 lines

---

## Success Criteria (Phase 0 overall)

- [x] All 5 tasks pass acceptance criteria
- [x] Không có TypeScript compile errors
- [x] Moloco workspace tab bar không overflow
- [x] Không có regression trên network workspaces khác
- [x] Filter state persist qua page navigation

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Tab "More" active state confusing khi overflow tab đang selected | Medium | Highlight "More" button khi active tab đang trong overflow list |
| localStorage bị stale nếu filter schema thay đổi | Low | Wrap parse trong try/catch, fallback về defaultValue |
| Bulk action gọi mock update không sync với table state | Low | Dùng local state update (optimistic), đủ cho mock phase |

## Next Steps

Sau Phase 0 deploy → unblock Phase 1 (Context Switcher) và Phase 2 (Campaign Ops UX) chạy song song.
