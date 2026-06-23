# 02 · Solution Architecture — NMS

<!-- @ssot: HOW hệ thống NMS đang được triển khai trong source hiện tại. -->
<!-- @ref:01_PRD.md -->

```yaml
doc_type: architecture
project_id: nms
version: 0.2.0
status: active
last_updated: 2026-06-04

ownership:
  author: Codex
  reviewers: [FE Lead, BE Lead, Security Owner, DevOps, QA Lead]
  approver: TBD

links:
  prd: ./01_PRD.md
  decisions: ./04_decisions/
  charter: ./00_charter.md
  agents: ./03_AGENTS.md
  tech_debt_redis: ./TECH_DEBT_REDIS_CACHE_INVALIDATION.md
```

---

## 1. Scope

Tài liệu này phản ánh kiến trúc đang được wiring trong source tại thời điểm `2026-06-04`.

Nguyên tắc cập nhật cho bản này:

- Chỉ mô tả những gì đang được import trong `nms-fe/src/routes/appRoutes.tsx`, Redux store FE, `nms-be/src/app.module.ts` và `nms-be/src/modules/api.module.ts`.
- Các thư mục còn tồn tại trong repo nhưng chưa được gắn vào runtime chính (ví dụ một số module thử nghiệm hoặc đang dở) không được xem là kiến trúc runtime chính thức.
- Tài liệu này ưu tiên mô tả implementation hiện tại hơn là target architecture lý tưởng.

## 2. Context

NMS là internal platform cho UA operations, gồm:

- `nms-fe`: SPA chạy trên React/Vite cho operations, permissions, dashboards, media workflows và network workspaces.
- `nms-be`: NestJS API/orchestration layer, tích hợp ad networks, PRMS, Vault, Google Cloud, Redis, queue, websocket, logging và monitoring.

Hiện tại hệ thống đang phục vụ nhiều nhóm nghiệp vụ trong cùng một app:

- Campaign management cho `Google Ads`, `Meta`, `Meta V2`, `ASA`, `Axon/AppLovin`, `Moloco`
- Rule/automation
- Media library và upload monitor
- Activity logs / change logs
- Vault key management / permissions / notifications
- UA dashboard

## 3. High-level Architecture

### 3.1 Runtime Diagram

```text
UA user / Admin
  |
  | Keycloak SSO
  v
nms-fe (React + Vite SPA)
  |-- React Router
  |-- Redux Toolkit + RTK Query
  |-- Ant Design + Tailwind
  |-- Socket.IO client for progress/events
  |
  | HTTP /api/v1 + Bearer token
  | WebSocket :9001 namespaces/*
  v
nms-be (NestJS)
  |-- Controllers / DTO validation
  |-- Services / repositories / adapters
  |-- Redis-backed Socket.IO gateways
  |-- Bull + BullMQ workers
  |-- Scheduled tasks
  |
  +--> PostgreSQL (TypeORM)
  +--> MongoDB (Mongoose)
  +--> Redis master/slave
  +--> Vault
  +--> PRMS
  +--> Google Cloud: GCS / BigQuery / Pub/Sub
  +--> Google Ads / Meta / ASA / Axon / Moloco / Adjust / YouTube
  +--> Sentry / Winston / Slack alerts
```

### 3.2 Main Components

| Component | Trách nhiệm | Tech / Notes |
|---|---|---|
| `nms-fe` | UI, routing, auth bootstrap, tables/forms, realtime progress UI | React 19, Vite, TypeScript |
| `nms-be` | REST API, orchestration, queues, websocket, integrations | NestJS 10, TypeScript |
| Keycloak | SSO / token source cho user login | FE bootstrap + BE auth guard |
| PRMS | Project + permission context | BE outbound integration |
| Vault | Network credential lookup/status | BE only |
| Redis | Cache, queue backend, websocket adapter | Master/slave modules |
| PostgreSQL | Relational persistence | TypeORM |
| MongoDB | Document/log persistence | Mongoose |
| Google Cloud | GCS, BigQuery, Pub/Sub | Uploads, analytics, callbacks |
| Sentry / Winston / Slack | Error tracking, secure logs, alerting | Cross-cutting infra |

## 4. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend runtime | React 19 + TypeScript | SPA only, không SSR |
| Frontend build | Vite | `@vitejs/plugin-react` |
| Frontend routing | React Router DOM 7 | Route tree trong `src/routes/appRoutes.tsx` |
| Frontend state | Redux Toolkit + redux-persist | Persist `auth` slice |
| Frontend data | Mock data + placeholder app/auth slices | Source hiện tại đang chuẩn bị cho API layer, chưa wiring đầy đủ RTK Query runtime |
| Frontend UI | Ant Design + TailwindCSS + Radix | Shared tokens ở `src/shared/tokens.ts`, route/nav metadata ở `src/shared/navigation.ts` |
| Frontend realtime | `socket.io-client` | Dependency có sẵn cho progress/event streams, chưa là realtime source chính trong prototype hiện tại |
| Backend framework | NestJS 10 | Modular monolith |
| Backend persistence | TypeORM + Mongoose | PostgreSQL + MongoDB |
| Backend async | Bull + BullMQ | Mixed usage đang tồn tại |
| Backend realtime | Socket.IO + Redis adapter | Port `9001`, multi-namespace |
| Backend cloud/integration | Google APIs, BigQuery, GCS, Pub/Sub, Vault, PRMS | Network-specific adapters |
| Monitoring | Sentry, Winston, Slack alerts | Secret sanitization enabled |

## 5. Code Structure

### 5.1 Repository Shape

```text
nms/
├── docs/
├── nms-fe/
│   ├── src/assets/app-data/   # Redux store and persisted slices
│   ├── src/components/
│   │   ├── networks/          # Network-specific UI: InlineEditCell, CampaignEditDrawer, etc.
│   │   ├── ui/                # Shared UI atoms: StatCard, StatusBadge, etc.
│   │   ├── layout/            # Layout components: NetworkContextBar, etc.
│   │   └── analytics/         # Analytics-scoped components
│   ├── src/core/              # Keycloak/auth bootstrap, base helpers
│   ├── src/features/          # Main FE feature modules
│   ├── src/modules/           # Legacy/isolated FE modules (notably ASA)
│   ├── src/domains/           # FE domain entities used by some modules
│   ├── src/pages/             # Route-level pages
│   ├── src/routes/            # Router tree
│   ├── src/shared/
│   │   ├── hooks/             # App-wide hooks (usePersistentFilter, etc.)
│   │   ├── tokens.ts          # Semantic CSS tokens
│   │   ├── navigation.ts       # Route/page metadata
│   │   └── mock-data.ts       # Prototype data fixtures
│   └── src/index.css          # Global styles and token definitions
└── nms-be/
    ├── src/infrastructure/    # Auth, config, websocket, logger, cache, queue
    ├── src/modules/           # Runtime business modules
    ├── src/applications/      # Present but used selectively
    ├── src/domains/           # Present but not the primary runtime pattern
    ├── src/scripts/           # One-off migrations/backfills
    ├── src/app.module.ts
    └── src/modules/api.module.ts
```

### 5.2 Architectural Note

Source hiện tại là kiến trúc lai:

- FE nghiêng về `feature-based structure`, nhưng vẫn còn `modules/` và `domains/` từ các phần cũ.
- BE runtime thực tế chủ yếu là `Nest modules + infrastructure`, không còn thuần layered `applications/domains` cho toàn bộ codebase.

Vì vậy mọi tài liệu mới nên xem NMS là một `modular monolith với nhiều bounded contexts`, thay vì giả định toàn hệ thống đang tuân thủ chặt một clean-architecture duy nhất.

## 6. Frontend Architecture

### 6.1 Bootstrap Flow

`nms-fe/src/main.tsx` hiện làm:

1. Load global CSS.
2. Resolve light/dark theme mode từ `localStorage` hoặc system preference.
3. Mount `Redux Provider`.
4. Mount `PersistGate`.
5. Mount `Ant Design ConfigProvider` với semantic theme hiện tại.
6. Render `App`.

`App.tsx` tiếp tục:

1. Wrap app bằng `ErrorBoundary`.
2. Render `RouterProvider`.

### 6.2 Route Topology

Các route chính đang được expose:

| Route | Mục đích |
|---|---|
| `/login` | Login / SSO entry prototype |
| `/`, `/dashboard` | Global dashboard |
| `/apps` | App index |
| `/networks` | Network index |
| `/creatives` | Creative library alias |
| `/automation-settings` | Global automation settings |
| `/insight-settings` | Insights/analytics hub |
| `/apps/:appId/dashboard` | App-scoped dashboard |
| `/apps/:appId/automation-rules`, `/apps/:appId/network-rules` | App-scoped network rules |
| `/apps/:appId/networks/:networkId` | Network workspace under an app |
| `/media-libraries` | Media libraries đa network |
| `/axon-reports` | Axon reporting |
| `/predictions` | Prediction analysis |
| `/change-logs` | Change logs / activity timeline |
| `/meta-errors` | Meta error diagnostics |
| `/upload-monitor` | Theo dõi upload tasks |
| `/network-rules` | Global network rule management |
| `/key-management` | Vault key management |
| `/permissions` | Permissions UI |
| `/automation` | Automation view |

Lưu ý:

- UI hiện theo mô hình Hub+Spokes: global hub -> app workspace -> network workspace.
- Active network workspace keys hiện là `google-ads`, `meta`, `asa`, `axon`, `moloco`.
- Shared navigation/page-title/breadcrumb metadata nằm ở `src/shared/navigation.ts`.

### 6.3 State & Data Access

Redux store hiện gồm:

- Core slices: `app`, `auth`

Đặc điểm hiện tại:

- `auth` là phần duy nhất được persist qua `redux-persist`
- Hầu hết page đang dùng `src/shared/mock-data.ts`
- API/RTK Query layer trong prototype hiện tại chưa phải source dữ liệu chính
- FE giữ một số account context trong browser storage, ví dụ Google Ads, Meta, Moloco account id
- UI-specific state (table filters, form drafts, drawer open/close) mục đích short-lived hoặc session-scoped nên dùng `usePersistentFilter` hook cho localStorage-backed filters, hoặc component-level state cho transient UI state

Security note:

- Tất cả `VITE_*` và `GOOGLE_CLIENT_ID` ở FE là public runtime config
- Secret thật không được đặt trong FE bundle
- localStorage chỉ dùng cho non-sensitive filter preferences, không giữ token, credentials hoặc PII

### 6.4 UI Component Patterns

Shared UI components live in `src/components/` with network-specific variants under `src/components/networks/`:

**Core reusable patterns:**

| Component | Purpose | Path |
|---|---|---|
| `InlineEditCell` | Click-to-edit numeric/text table cells with async save support | `src/components/networks/inline-edit-cell.tsx` |
| `CampaignEditDrawer` | 50%-width slide-in form drawer for editing campaign fields (preserves table context) | `src/components/networks/campaign-edit-drawer.tsx` |
| `StatCard` | Dashboard stat card with trend indicator, now supports `positiveIsGood` prop for metric direction logic | `src/components/ui/StatCard.tsx` |
| `StatusBadge` | Status indicator badge with network-aware styling | `src/components/ui/StatusBadge.tsx` |

**Form patterns:**

- Multi-field forms use Ant Design `<Form>` with `layout="vertical"`
- Network-specific fields render conditionally (e.g., `targetCpa` for Google Ads, `optimizationGoal` for Meta)
- Save handler validates all fields then persists via parent callback

**Hook patterns:**

| Hook | Purpose | Path |
|---|---|---|
| `usePersistentFilter` | localStorage-backed state hook with JSON serialization and quota fallback | `src/shared/hooks/use-persistent-filter.ts` |

### 6.5 Realtime Patterns

FE hiện dùng `socket.io-client` cho các luồng dài hoặc background progress:

- Meta campaign publish/create/upload
- Meta V2 campaign publish
- Axon campaign progress
- Axon creative set batch progress
- Axon draft execute progress
- Asset upload / notification streams

WebSocket backend đang lắng nghe trên `:9001` với nhiều namespace, ví dụ:

- `notifications`
- `meta/campaigns`
- `meta/adcreatives`
- `meta/videos`
- `meta-v2/campaigns`
- `axon/campaigns`
- `axon/assets`
- `axon/creative-set-batch`
- `axon/draft-execute`

## 7. Backend Architecture

### 7.1 Bootstrap

`nms-be/src/main.ts` hiện bootstrap theo flow:

1. Load env qua `dotenv-config`.
2. `createSchemas(...)`.
3. `initializeDatabase(...)`.
4. `NestFactory.create(AppModule)`.
5. Khởi tạo `RedisIoAdapter` cho websocket.
6. Enable `helmet`.
7. Add custom `SecurityHeadersMiddleware`.
8. Add `sentryTracingMiddleware`.
9. Gắn raw-body parser riêng cho các Pub/Sub callback paths:
   - `/api/v1/meta/videos/pubsub`
   - `/api/v1/axon/assets/pubsub`
   - `/api/v1/moloco/creative-assets/pubsub`
   - `/api/v1/youtube/videos/pubsub`
10. Gắn global body parser.
11. Gắn `ValidationPipe`, `HttpExceptionFilter`.
12. Gắn `SecretLeakPreventionInterceptor`, `ResponseSanitizerInterceptor`, `TransformInterceptor`, `TimeoutInterceptor`.
13. Enable CORS.
14. Set global prefix `/api/v1`.
15. Enable Swagger khi `MODE=DEV`.
16. Listen trên `process.env.PORT`.
17. Capture `uncaughtException` và `unhandledRejection` qua Sentry + secure logger.

### 7.2 Root Module Composition

`AppModule` đang import:

- TypeORM
- Mongoose
- Sentry
- shared auth module
- Redis client + Redis master/slave
- global Bull module
- auth stream module
- Slack monitoring module
- `ApiModule`

Điều này cho thấy hạ tầng bắt buộc của backend runtime hiện tại là:

- PostgreSQL
- MongoDB
- Redis
- Vault / external APIs qua env-config

### 7.3 Request Flow

```text
HTTP request
  -> Nest controller
  -> DTO validation / guards / middleware
  -> Service / repository / adapter
  -> DB / Redis / external API / queue
  -> Response interceptors sanitize + transform output
  -> HTTP response
```

Khác với bản doc cũ, flow hiện tại không đi nhất quán qua `applications/*.auc.ts` hay `domains/*.uc.ts`. Phần lớn runtime path đang nằm trực tiếp trong `src/modules/**`.

### 7.4 Async / Event / Worker Flow

Backend hiện có 4 nhóm async pattern cùng tồn tại:

1. Redis-backed websocket gateway cho progress và notifications.
2. Bull processors cho một số queue cũ.
3. BullMQ processors cho các flow mới hơn.
4. Scheduled tasks trong `src/infrastructure/scheduled/`.

Representative async workloads:

- Meta video/pubsub processing
- Axon asset upload progress
- Axon creative set batch operations
- Axon creative draft execution
- Meta warmup queue
- Notification delivery
- Activity log processing
- PRMS queue work
- Upload task cleanup scheduler

### 7.5 Active Module Groups

Bảng dưới đây chỉ liệt kê các module đang được import vào `ApiModule`.

| Group | Modules / phạm vi chính |
|---|---|
| Core platform | `health`, `notification`, `activity-log`, `rule`, `prms`, `vault-key-status`, `gcs`, `ua-dashboard` |
| Meta | `campaign`, `adset`, `ad`, `adcreative`, `permission`, `search`, `video`, `vault`, `warmup`, `error-tracking` |
| Meta V2 | `meta-v2` aggregate module cho campaign/adset/ad/ad-creative/template/saved-audience/saved-location |
| Google Ads | `campaign`, `adgroup`, `geographic-view`, `asset`, `targeting`, `client`, `vault` |
| ASA | `campaign`, `adgroup`, `keywords`, `reports`, `ad`, `creative`, `permission`, `product-page` |
| Axon / AppLovin | `campaign`, `axon-auth`, `asset`, `creative-set`, `report`, `report-preset`, `playable-metrics`, `creative-automation`, `vault` |
| Moloco | `vault`, `permission`, `product`, `campaign`, `adgroup`, `creative-group`, `creative`, `creative-asset`, `tracking-link` |
| Adjust | `report`, `trackers` |
| YouTube | `video`, `vault` |

### 7.6 Persistence Model

Persistence hiện là polyglot:

- `PostgreSQL + TypeORM` cho relational/business data
- `MongoDB + Mongoose` cho một số log/document style models
- `Redis` cho queue state, cache và websocket adapter

Từ source hiện tại không thể khẳng định toàn bộ module nào nằm hoàn toàn ở store nào, nên mọi thiết kế mới phải explicit store choice trong doc/module-level ADR thay vì giả định dùng chung một DB pattern.

## 8. Integration Points

| System | Direction | Purpose |
|---|---|---|
| Keycloak | FE/BE auth | SSO, token/session bootstrap |
| PRMS | BE outbound | Project metadata, permission context |
| Vault | BE outbound | Credential retrieval, vault key status |
| Google Ads API | BE outbound | Campaign/adgroup/asset/targeting operations |
| Google Cloud Storage | BE outbound | Media/file storage |
| BigQuery | BE outbound | Dashboard/reporting queries |
| Google Pub/Sub | BE inbound callback | Async media/video/asset completion |
| Meta Graph API | BE outbound | Meta campaign/ad/adcreative/video operations |
| Apple Search Ads API | BE outbound | ASA campaigns, keywords, reports |
| Axon/AppLovin APIs | BE outbound | Campaign, asset, creative set, reports |
| Moloco APIs | BE outbound | Campaign/adgroup/creative/media workflows |
| Adjust | BE outbound | Tracker/report data |
| YouTube APIs | BE outbound | Video upload and management |
| Slack | BE outbound | Monitoring / alert notification |

## 9. Non-functional Design

### 9.1 Performance

- FE dùng table abstractions, virtualization và local column preferences cho màn hình dữ liệu lớn.
- Long-running operations đã chuyển dần sang queue + websocket progress thay vì block HTTP request.
- Redis là dependency thực tế cho cả queue lẫn realtime, không còn là optional optimization.

### 9.2 Reliability

- Global exception filter và response transform tạo mặt bằng response tương đối đồng nhất.
- Pub/Sub endpoints dùng raw body để hỗ trợ signature verification / replay-safe handling.
- Mixed Bull/BullMQ làm tăng độ phức tạp vận hành và tracing job lifecycle.

### 9.3 Security

- Secrets được chặn ở response path qua `SecretLeakPreventionInterceptor` và `ResponseSanitizerInterceptor`.
- Vault là nguồn credential runtime ở backend.
- FE chỉ giữ token/account context cần thiết cho UX, không giữ network secrets.
- Log và exception handling đã có secure logger + Sentry capture.

### 9.4 Observability

- Backend có Sentry instrumentation.
- App logger middleware chạy trên toàn bộ routes trong `ApiModule`.
- Slack monitoring module đang là một kênh alert bổ sung cho runtime issues.
- FE có `web-vitals`; observability FE vẫn chưa được mô tả thống nhất thành một policy chung.

## 10. Deployment Model

| Component | Local dev | Runtime model |
|---|---|---|
| `nms-fe` | `npm run dev` hoặc `vite --force` | Static build, thường phục vụ qua Nginx/container |
| `nms-be` | `npm run start:dev` | Node/Nest container chạy `dist/main` |
| WebSocket | Cùng backend process, port `9001` namespaces | Redis adapter required |
| Redis | External or containerized | Required |
| PostgreSQL | External or local env-configured | Required |
| MongoDB | External or local env-configured | Required |

Lưu ý thực tế:

- Script `nms-be` local dev hiện giả định có Google credentials file local cho một số flow GCP.
- Deployment architecture chi tiết theo môi trường vẫn nên được giữ ở docs vận hành riêng.

## 11. Developer Commands

| Scope | Command | Purpose |
|---|---|---|
| FE | `npm run dev` | Start Vite dev server |
| FE | `npm run build` | Build frontend |
| FE | `npm run preview` | Preview built FE |
| FE | `npm run test` | Run Vitest |
| FE | `npm run lint` | Lint + prettier check |
| BE | `npm run start:dev` | Start Nest watch mode |
| BE | `npm run build` | Build backend |
| BE | `npm run start:prod` | Run built backend |
| BE | `npm run test` | Run Jest |
| BE | `npm run test:e2e` | Run e2e tests |
| BE | `npm run lint` | ESLint fix |

## 12. Risks And Architectural Debt

| # | Risk / debt | Impact | Ghi chú |
|---|---|---|---|
| 1 | FE/BE đều đang ở trạng thái hybrid giữa kiến trúc cũ và mới | High | Khó chuẩn hóa convention, onboarding chậm |
| 2 | Bull và BullMQ cùng tồn tại | High | Monitoring, retry semantics, operability phức tạp hơn |
| 3 | Meta cũ và Meta V2 cùng sống chung | High | Contract drift, duplicated logic, route/service ambiguity |
| 4 | AppLovin legacy naming và Axon naming cùng tồn tại | Medium | Dễ gây hiểu nhầm ở docs, route, API ownership |
| 5 | Redis là critical dependency cho nhiều flow | High | Mất Redis sẽ ảnh hưởng queue + websocket + có thể cache |
| 6 | Một số module có mặt trong repo nhưng chưa được wiring runtime | Medium | Docs dễ lệch nếu không phân biệt active vs parked code |
| 7 | Local FE giữ account selection trong browser storage | Medium | Cần kiểm soát clear-state và context switching tốt |

## 13. Update Rules

Khi có thay đổi kiến trúc trong tương lai, file này nên được cập nhật theo các trigger sau:

- Thêm hoặc bỏ một network workspace ở FE router
- Thêm hoặc bỏ một module trong `ApiModule`
- Thêm namespace websocket mới
- Thêm Pub/Sub callback mới
- Đổi persistence stack hoặc queue stack
- Thay đổi luồng auth/bootstrap FE hoặc BE

## Changelog

| Version | Ngày | Người | Thay đổi |
|---|---|---|---|
| 0.2.1 | 2026-06-23 | docs-manager | Thêm UI component patterns (InlineEditCell, CampaignEditDrawer, usePersistentFilter, StatCard enhancements), cập nhật folder structure chi tiết, localStorage pattern guidelines |
| 0.2.0 | 2026-06-04 | Codex | Refresh toàn bộ theo source hiện tại: thêm Moloco, Meta V2, websocket/queue flows, upload monitor, change logs, security/observability và sửa lại mô hình BE thực tế |
| 0.1.0 | 2026-05-24 | Codex | Initial root-level architecture draft |
