# Phase 2: Campaign Operations UX

**Priority:** P1  
**Status:** Completed  
**Effort:** ~3-4 days  
**Parallelism:** After Phase 0; can run parallel with Phase 1

## Context Links

- Plan overview: [plan.md](./plan.md)
- Campaign table: `src/components/networks/network-campaign-table.tsx`
- Shell: `src/components/networks/network-workspace-shell.tsx`
- Campaign wizard modal: `src/components/campaign-wizard/campaign-wizard-modal.tsx`
- Mock data types: `src/shared/mock-data.ts` (Campaign interface)
- StatusBadge: `src/components/ui/StatusBadge.tsx`
- DataTable: `src/components/ui/DataTable.tsx`

## Overview

Tối ưu luồng campaign operations hàng ngày — 2 cải thiện chính:
1. **Inline editing** cho budget/bid (không cần mở modal để sửa một số)
2. **Slide-in drawer** cho campaign edit (thay modal, giữ table context visible)

---

## Task 2-A: Campaign Inline Editing (Budget & Daily Budget)

### Problem
Đổi budget/daily budget của 1 campaign = open detail modal → find budget field → edit → save → close = **5 clicks + modal**.
UA operator làm việc này ~10-20 lần/ngày.

### Scope
Inline editing CHỈ cho:
- `budget` (Campaign Budget — $)
- `dailyBudget` (nếu có trong Campaign interface)
- `name` (campaign name)

Complex fields (targeting, bidding strategy, network-specific settings) → vẫn dùng drawer/modal.

### UX Pattern
```
[Bình thường]:  Budget  $2,000
[Hover]:        Budget  $2,000  ✎
[Editing]:      Budget  [___2500___]  ✓  ✗
[Saving]:       Budget  $2,500  (spinner)
[Saved]:        Budget  $2,500  ↑ saved toast
```

### Implementation

```typescript
// components/networks/inline-edit-cell.tsx — NEW reusable component
interface InlineEditCellProps {
  value: number | string;
  onSave: (newValue: number | string) => Promise<void> | void;
  format?: (v: number | string) => string;  // e.g. (v) => `$${Number(v).toLocaleString()}`
  type?: 'number' | 'text';
  min?: number;
  disabled?: boolean;
}

export const InlineEditCell: React.FC<InlineEditCellProps> = ({
  value, onSave, format, type = 'number', min = 0, disabled = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = async () => {
    const parsed = type === 'number' ? Number(draft) : draft;
    if (type === 'number' && (isNaN(parsed as number) || (parsed as number) < min)) {
      setDraft(String(value));
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(parsed);
    setSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }
  };

  if (disabled) {
    return <span className="text-xs">{format ? format(value) : value}</span>;
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          min={min}
          className="w-20 text-xs border border_primary rounded px-1.5 py-0.5
                     focus:outline-none focus:border_accent"
        />
        <button onClick={handleSave} disabled={saving}
                className="text_success hover:opacity-70">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        </button>
        <button onClick={() => { setDraft(String(value)); setEditing(false); }}
                className="text_tertiary hover:opacity-70">
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group cursor-pointer"
         onClick={() => setEditing(true)}>
      <span className="text-xs">{format ? format(value) : value}</span>
      <Pencil size={10} className="text_tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
```

**Integrate vào campaign table:**
```typescript
// network-campaign-table.tsx — update budget column render
{
  title: 'Budget',
  dataIndex: 'budget',
  render: (value: number, record: Campaign) => (
    <InlineEditCell
      value={value}
      format={v => `$${Number(v).toLocaleString()}`}
      onSave={newVal => handleUpdateBudget(record.id, Number(newVal))}
      min={1}
    />
  ),
},
```

**Files to create:**
- `src/components/networks/inline-edit-cell.tsx` (<80 lines)

**Files to modify:**
- `src/components/networks/network-campaign-table.tsx` — use InlineEditCell for budget column

### Acceptance Criteria
- [x] Hover budget cell → pencil icon xuất hiện
- [x] Click cell → input xuất hiện với current value focused
- [x] Enter → save, toast "Budget updated", cell hiện giá trị mới
- [x] Escape → cancel, cell revert
- [x] Nhập số âm hoặc < 1 → validation fail, revert, không save
- [x] Nhập non-number → ignore (input type=number)
- [x] Saving state: spinner thay checkmark
- [x] `InlineEditCell` < 80 lines, standalone, reusable cho bất kỳ field nào

---

## Task 2-B: Campaign Edit Slide-in Drawer

### Problem
Campaign detail/edit hiện dùng full modal → che toàn bộ table context.
Khi edit một campaign, không xem được các campaigns khác để compare.

### Solution
Thay modal bằng **slide-in drawer 50% width** từ bên phải.
Table context vẫn visible ở bên trái (50% còn lại).

```
┌────────────────────────────┬────────────────────────────┐
│                            │  Campaign Edit Drawer       │
│   Campaign Table           │  ─────────────────────────  │
│   (still visible)          │  Name: [_____________]      │
│                            │  Status: [Active    ▾]      │
│   ☑ Campaign Alpha  $2,000 │  Budget: [___2000___]       │
│   ○ Campaign Beta   $1,500 │  Bid Strategy: [Target CPA ▾]│
│                            │  ...                        │
│                            │  [Cancel]      [Save]       │
└────────────────────────────┴────────────────────────────┘
```

### Architecture

```
src/components/networks/
├── campaign-edit-drawer.tsx       (NEW — generic edit drawer)
└── network-campaign-table.tsx     (modify — trigger drawer on row click/edit)
```

```typescript
// campaign-edit-drawer.tsx — NEW component
interface CampaignEditDrawerProps {
  campaign: Campaign | null;
  networkKey: string;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Campaign>) => void;
}

export const CampaignEditDrawer: React.FC<CampaignEditDrawerProps> = ({
  campaign, networkKey, open, onClose, onSave,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (campaign) form.setFieldsValue(campaign);
  }, [campaign, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave(values);
      onClose();
      toast.success('Campaign updated');
    });
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Pencil size={16} />
          <span className="font-bold text-sm">{campaign?.name}</span>
          <StatusBadge label={campaign?.status ?? ''} variant={statusToVariant(campaign?.status ?? '')} />
        </div>
      }
      placement="right"
      width="50%"            // key: 50% width để giữ table visible
      open={open}
      onClose={onClose}
      styles={{ body: { padding: '20px' } }}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="border" size="m" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="m" onClick={handleSave}>Save Changes</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" size="small">
        {/* Common fields — all networks */}
        <Form.Item name="name" label="Campaign Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'PAUSED', label: 'Paused' },
          ]} />
        </Form.Item>
        <Form.Item name="budget" label="Budget ($)" rules={[{ min: 1, type: 'number' }]}>
          <InputNumber min={1} className="w-full" prefix="$" />
        </Form.Item>

        {/* Network-specific fields rendered via networkKey */}
        <NetworkEditFields networkKey={networkKey} />
      </Form>
    </Drawer>
  );
};

// NetworkEditFields — thin conditional renderer for network-specific form fields
const NetworkEditFields: React.FC<{ networkKey: string }> = ({ networkKey }) => {
  if (networkKey === 'google-ads') {
    return (
      <Form.Item name="targetCpa" label="Target CPA ($)">
        <InputNumber min={0} className="w-full" prefix="$" />
      </Form.Item>
    );
  }
  if (networkKey === 'meta') {
    return (
      <Form.Item name="optimizationGoal" label="Optimization Goal">
        <Select options={[
          { value: 'CONVERSIONS', label: 'Conversions' },
          { value: 'LINK_CLICKS', label: 'Link Clicks' },
          { value: 'APP_INSTALLS', label: 'App Installs' },
        ]} />
      </Form.Item>
    );
  }
  // asa, axon, moloco: add as needed — return null for now
  return null;
};
```

**Trigger từ campaign table:**
```typescript
// network-campaign-table.tsx — add edit button + drawer state
const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

// Actions column — thêm Edit button
{
  title: 'Actions',
  render: (_, record: Campaign) => (
    <div className="flex items-center gap-1">
      <Button size="s" variant="dim" onClick={() => setEditingCampaign(record)}>
        <Pencil size={12} />
      </Button>
      {/* existing pause/resume quick action */}
    </div>
  ),
}

// Render drawer
<CampaignEditDrawer
  campaign={editingCampaign}
  networkKey={config.key}
  open={Boolean(editingCampaign)}
  onClose={() => setEditingCampaign(null)}
  onSave={updates => handleUpdateCampaign(editingCampaign!.id, updates)}
/>
```

**Files to create:**
- `src/components/networks/campaign-edit-drawer.tsx` (<150 lines — split if exceeds)

**Files to modify:**
- `src/components/networks/network-campaign-table.tsx` — add edit trigger + drawer render

### Acceptance Criteria
- [x] Edit button (pencil icon) hiện trong Actions column của mỗi row
- [x] Click Edit → drawer slide in từ phải, rộng 50% viewport
- [x] Table vẫn visible ở 50% còn lại (không bị overlay)
- [x] Drawer pre-populate đúng giá trị của campaign được chọn
- [x] Save → campaign update, drawer close, toast success
- [x] Cancel → drawer close, không lưu changes
- [x] Form validation: name required, budget ≥ 1
- [x] Mobile (< 768px): drawer chiếm 100% width (Ant Design default behavior)
- [x] `campaign-edit-drawer.tsx` < 150 lines

---

## Success Criteria (Phase 2 overall)

- [x] InlineEditCell hoạt động cho budget column ở tất cả network workspaces
- [x] Campaign edit drawer hiện đúng, close đúng, save đúng
- [x] Drawer 50% width, table vẫn visible trên desktop
- [x] Không có regression trên CampaignWizardModal (create flow không bị ảnh hưởng)
- [x] TypeScript compile clean
- [x] Files: `inline-edit-cell.tsx` < 80 lines, `campaign-edit-drawer.tsx` < 150 lines

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Drawer 50% width quá hẹp trên laptop (1366px) | Medium | Min-width 480px; nếu viewport < 960px, fallback 80% |
| Network-specific form fields ngày càng nhiều → file phình | Medium | `NetworkEditFields` là separate component, tách file khi > 60 lines |
| Inline edit input bị blur khi click checkmark | Low | `onMouseDown={e => e.preventDefault()}` trên save button |
| Concurrent inline edits (2 cells cùng lúc) | Low | Không cần guard — mỗi InlineEditCell có state riêng |

## Next Steps

Phase 2 hoàn thành → Phase 3 (Advanced) có thể bắt đầu full-page wizard
(vì drawer edit pattern đã rõ, wizard là extension của cùng UX pattern).
