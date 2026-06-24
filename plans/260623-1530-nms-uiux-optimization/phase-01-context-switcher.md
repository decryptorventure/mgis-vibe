# Phase 1: Context Switcher & Navigation Improvements

**Priority:** P1  
**Status:** Completed  
**Effort:** ~2-3 days  
**Parallelism:** Independent after Phase 0; can run parallel with Phase 2

## Context Links

- Plan overview: [plan.md](./plan.md)
- Header: `src/components/layout/AppHeader.tsx` (172 lines)
- Sidebar: `src/components/layout/AppSidebar.tsx` (269 lines)
- Navigation config: `src/shared/navigation.ts`
- Routes: `src/routes/appRoutes.tsx`
- Mock projects: `src/shared/mock-data.ts` (mockProjects)
- Network config: `src/shared/network-config.ts`

## Overview

Giải quyết pain point #1: **navigation phức tạp, quá nhiều clicks**. Hiện tại để chuyển từ Moloco workspace sang Meta workspace của cùng app, operator phải: back to Apps List → click app → click Meta = **3 clicks**. Với Context Switcher trên header, chỉ cần **1 dropdown click**.

---

## Task 1-A: App + Network Context Switcher trong Header

### Current Header Layout
```
[☰ Mobile] [Page Title] [/ breadcrumb]    [🌙] [Feedback] [🔔] [Avatar ▾]
```

### New Header Layout (khi đang ở network workspace)
```
[☰ Mobile] [Clash of Clans ▾] [→] [Moloco ▾]    [🌙] [Feedback] [🔔] [Avatar ▾]
```
Khi ở global routes (Dashboard, Apps list...): header giữ nguyên style cũ (chỉ Page Title).

### Decision: Header vs Separate Context Bar
Dùng **header tích hợp** (không tạo NetworkContextBar riêng như plan cũ đề xuất) vì:
- Tiết kiệm vertical space (không mất 40px cho context bar)
- Consistent với pattern của Linear, Vercel, Figma
- `AppHeader.tsx` hiện có 172 lines — thêm switcher vẫn dưới 200 lines nếu extract component

### Architecture

```
AppHeader.tsx
├── Left section:
│   ├── MobileMenuButton (existing)
│   ├── [IF in network workspace]:
│   │   ├── AppContextSwitcher — dropdown chọn app
│   │   ├── ChevronRight separator
│   │   └── NetworkContextSwitcher — dropdown chọn network
│   └── [ELSE]: PageTitle + breadcrumbs (existing)
└── Right section: (unchanged)
```

Extract 2 sub-components sang file riêng để giữ AppHeader.tsx < 200 lines:

```
src/components/layout/
├── AppHeader.tsx                   (modify — orchestrates switchers)
├── app-context-switcher.tsx        (NEW — app dropdown)
└── network-context-switcher.tsx    (NEW — network dropdown)
```

### app-context-switcher.tsx

```typescript
// Dropdown hiện danh sách apps với icon + name + OS badge
// Khi select → navigate('/apps/:newAppId/networks/:currentNetworkId')
interface AppContextSwitcherProps {
  currentAppId: string;
  currentNetworkId: string;
}

export const AppContextSwitcher: React.FC<AppContextSwitcherProps> = ({ currentAppId, currentNetworkId }) => {
  const navigate = useNavigate();
  const currentApp = mockProjects.find(p => p.id === currentAppId);

  const items = mockProjects.map(app => ({
    key: app.id,
    label: (
      <div className="flex items-center gap-2 min-w-[180px]">
        <span className="text-base">{app.icon}</span>
        <div>
          <div className="text-xs font-semibold text_primary">{app.name}</div>
          <div className="text-[10px] text_tertiary font-mono">{app.package}</div>
        </div>
        <Tag color={app.os === 'ios' ? 'blue' : 'green'} className="ml-auto text-[9px]">
          {app.os.toUpperCase()}
        </Tag>
      </div>
    ),
    onClick: () => navigate(`/apps/${app.id}/networks/${currentNetworkId}`),
  }));

  return (
    <Dropdown menu={{ items, selectedKeys: [currentAppId] }} trigger={['click']}>
      <button className="flex items-center gap-1.5 px-2 py-1 radius_6 hover:bg_button_tertiary
                         text-xs font-semibold text_primary cursor-pointer transition-colors">
        <span>{currentApp?.icon}</span>
        <span className="max-w-[120px] truncate">{currentApp?.name}</span>
        <ChevronDown size={12} className="text_tertiary flex-shrink-0" />
      </button>
    </Dropdown>
  );
};
```

### network-context-switcher.tsx

```typescript
// Dropdown hiện danh sách networks của app hiện tại
// Chỉ hiện networks mà app đó có (app.networks array)
// Khi select → navigate('/apps/:appId/networks/:newNetworkId')
interface NetworkContextSwitcherProps {
  currentAppId: string;
  currentNetworkId: string;
  availableNetworks: string[];  // từ app.networks
}
```

### AppHeader.tsx changes

```typescript
// Thêm logic detect xem có đang trong network workspace không
const { appId, networkId } = useParams<{ appId?: string; networkId?: string }>();
const isNetworkWorkspace = Boolean(appId && networkId);

// Trong JSX left section:
{isNetworkWorkspace ? (
  <div className="flex items-center gap-1">
    <AppContextSwitcher currentAppId={appId!} currentNetworkId={networkId!} />
    <ChevronRight size={14} className="text_tertiary" />
    <NetworkContextSwitcher
      currentAppId={appId!}
      currentNetworkId={networkId!}
      availableNetworks={activeApp?.networks ?? []}
    />
  </div>
) : (
  // existing page title + breadcrumbs
  <h1 ...>{pageTitle}</h1>
)}
```

**Files to create:**
- `src/components/layout/app-context-switcher.tsx` (<80 lines)
- `src/components/layout/network-context-switcher.tsx` (<80 lines)

**Files to modify:**
- `src/components/layout/AppHeader.tsx` — add switcher logic, import new components

**Note về routing:** Plan cũ dùng routes `/google-ads`, `/meta`... (flat). Codebase hiện tại dùng `/apps/:appId/networks/:networkId`. Context switcher cần navigate đúng theo pattern hiện tại.

### Acceptance Criteria
- [x] Đang ở `/apps/clash/networks/moloco` → header hiện `[Clash of Clans ▾] → [Moloco ▾]`
- [x] Click App dropdown → danh sách tất cả apps với icon, tên, OS badge
- [x] Chọn app khác → navigate đến `/apps/newApp/networks/moloco` (giữ nguyên network)
- [x] Click Network dropdown → chỉ hiện networks của app hiện tại
- [x] Chọn network khác → navigate đến `/apps/clash/networks/meta`
- [x] Current app/network được highlight (selected) trong dropdown
- [x] Ở global routes (Dashboard, Apps list): header hiện page title như cũ
- [x] Mobile: switcher vẫn visible (có thể truncate label)

---

## Task 1-B: Sidebar Back Navigation Cải Thiện

### Problem
Khi trong App context, "Danh sách App" back link nhỏ và không prominent.
User hay bị lost navigation.

### Solution
Thay "Danh sách App" text link bằng styled back button với app name:

```typescript
// AppSidebar.tsx — cải thiện back navigation
<button
  onClick={() => navigate('/apps')}
  className="flex items-center gap-2 px-4 py-3 w-full
             text-xs font-medium text_secondary
             hover:fg_accent_primary hover:bg_button_tertiary
             transition-colors border-b border_secondary"
>
  <ArrowLeft size={13} />
  <span>All Apps</span>
</button>
```

Minimal change — chỉ styling, không đổi behavior.

**Files to modify:**
- `src/components/layout/AppSidebar.tsx` — update back link styling

### Acceptance Criteria
- [x] Back button có hover state rõ hơn
- [x] Click vẫn navigate về `/apps`

---

## Success Criteria (Phase 1 overall)

- [x] Context Switcher hiện đúng ở mọi network workspace routes
- [x] Switching app/network với 1 click (từ 3 clicks xuống còn 1)
- [x] Không có regression ở global routes (header vẫn hiện page title bình thường)
- [x] `AppHeader.tsx` < 200 lines sau khi extract sub-components
- [x] `app-context-switcher.tsx` và `network-context-switcher.tsx` < 80 lines mỗi file
- [x] TypeScript compile clean

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `useParams` trả `undefined` ở routes không có appId/networkId | Low | Guard with `Boolean(appId && networkId)` before rendering switchers |
| App không có current network trong network list | Low | Fallback: nếu app.networks không có currentNetworkId, vẫn hiện switcher nhưng disable network option |
| Header too wide trên small screens | Medium | Truncate app name với max-width, hide OS badge trên mobile |

## Next Steps

Phase 1 hoàn thành → unblock Phase 3 (Advanced) hoàn toàn.
Phase 2 (Campaign Ops UX) có thể chạy song song với Phase 1.
