# NMS · Root Docs

> Bộ tài liệu cấp project cho monorepo `nms`.
> Phạm vi của thư mục này là context chung cho cả `nms-fe` và `nms-be`.

---

## 1. Document Map

| Layer | File | Vai trò | Status |
|---|---|---|---|
| L0 | `README.md` | Index của bộ root docs | Active |
| L1 | `00_charter.md` | Vision, scope, glossary, stakeholder map | Draft, cần human approve |
| L2 | `01_PRD.md` | Product requirements ở mức project | Draft, cần human approve |
| L3 | `02_architecture.md` | Runtime architecture hiện tại của NMS | Active |
| L4 | `03_AGENTS.md` | Operating rules cho AI agents trong NMS | Active |
| L5 | `04_decisions/README.md` | Quy ước ADR và decision log | Active |
| Debt | `TECH_DEBT_REDIS_CACHE_INVALIDATION.md` | Tech debt/risk note đang mở | Active |
| Network | `networks/*` | Tài liệu chi tiết theo ad network/workflow | Mixed |

## 2. Repository Map

```text
nms/
├── docs/                    # Project-level docs
├── nms-fe/                  # React + Vite frontend
├── nms-be/                  # NestJS backend
├── network-changes-logs/    # Operational/network change logs
└── scripts/                 # Support scripts
```

## 3. Suggested Reading Order

Khi cần nắm context cấp project, đọc theo thứ tự:

1. `docs/03_AGENTS.md`
2. `docs/00_charter.md`
3. `docs/01_PRD.md`
4. `docs/02_architecture.md`
5. `docs/04_decisions/*.md` có `status: Accepted`
6. `docs/TECH_DEBT_REDIS_CACHE_INVALIDATION.md` nếu task chạm Redis/cache/queue
7. `docs/networks/*` nếu task chạm network cụ thể
8. `nms-fe/docs/*` hoặc `nms-be/docs/*` nếu task chạm module/API chuyên sâu

## 4. Scope Rules

- Root `docs/` là source of truth ở mức project và runtime shape của toàn hệ thống.
- Docs ở `nms-fe/docs` và `nms-be/docs` được phép chi tiết hơn, nhưng không nên mâu thuẫn với root docs.
- Khi runtime thay đổi mà root docs chưa cập nhật, ưu tiên sửa root docs trước hoặc cùng lúc với code.
- Không đưa secret, token, private key, service account hoặc credential thật vào bất kỳ file nào trong `docs/`.

## 5. Current Reality

Bộ docs này hiện phản ánh các phần runtime chính sau:

- FE: React/Vite SPA, Redux Toolkit, redux-persist, Ant Design/Tailwind, Socket.IO client dependency
  - UI patterns: reusable components (InlineEditCell, CampaignEditDrawer, StatCard), localStorage-backed filters via hooks
  - Component structure: `src/components/{networks,ui,layout,analytics}` for organized UI reuse
  - State management: Redux for app/auth, component-level state for transient UI, localStorage for filter preferences
- BE: NestJS modular monolith, Redis, Bull + BullMQ, Socket.IO gateway, PostgreSQL, MongoDB
- Active network/workflow areas: Google Ads, Meta, Meta V2, ASA, Axon/AppLovin, Moloco, YouTube, Adjust
- Cross-cutting flows: permissions, vault key status, media libraries, upload monitor, notifications, activity logs, change logs, dashboard

## 6. Status

```yaml
project_id: nms
doc_set_version: 0.2.0
status: active
last_updated: 2026-06-04
scope: project-root
```

## 7. Update Rules

- Cập nhật `00_charter.md` khi scope, stakeholder hoặc glossary thay đổi.
- Cập nhật `01_PRD.md` khi product workflows, personas hoặc functional requirements thay đổi.
- Cập nhật `02_architecture.md` khi router FE, `ApiModule`, websocket namespaces, queue stack hoặc persistence stack thay đổi.
- Tạo ADR trong `04_decisions/` khi có trade-off ảnh hưởng nhiều module hoặc thay đổi một phần đã được chốt ở architecture/PRD.
- Thêm ghi chú riêng ở `docs/networks/` cho behavior đặc thù theo network thay vì nhồi hết vào root docs.
