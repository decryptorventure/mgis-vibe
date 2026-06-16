# 01 · Product Requirements Document — NMS

<!-- @ssot: WHO + WHAT + WHY của NMS. HOW nằm ở 02_architecture.md -->
<!-- @ref:00_charter.md -->

```yaml
doc_type: PRD
project_id: nms
version: 0.2.0
status: draft
last_updated: 2026-06-04

ownership:
  author: TBD
  reviewers: [Tech Lead, FE Lead, BE Lead, QA Lead, Security Owner, UA representative]
  approver: TBD

links:
  charter: ./00_charter.md
  architecture: ./02_architecture.md
  agents: ./03_AGENTS.md
  decisions: ./04_decisions/
  network_docs: ./networks/
```

---

## 1. Problem Statement

UA team cần một nơi tập trung để vận hành campaign và workflow marketing xuyên nhiều ad network mà không phải:

- nhảy qua nhiều console
- giữ credential ở browser/script thủ công
- tự nhớ các rule/rate-limit khác nhau của từng network
- debug thủ công khi publish/upload/sync bị lỗi

NMS giải quyết bằng một internal web platform với frontend tập trung và backend orchestration layer bảo vệ secrets, enforce permission, xử lý async work và ghi audit trail.

## 2. Target Users

### 2.1 Primary Persona

```yaml
persona_id: ua_operator
name: UA Manager / Marketing Operator
usage_frequency: daily
goals:
  - Mở đúng network workspace theo project và thao tác campaign nhanh
  - Theo dõi progress của publish/upload/sync mà không chờ request timeout
  - Xem logs, key status, media và dashboard từ cùng một hệ thống
pain_points:
  - Mỗi network có console và rule vận hành riêng
  - Debug thay đổi campaign và lỗi upload/publish tốn thời gian
  - Permission/credential handling không phù hợp để làm thủ công ở FE
```

### 2.2 Secondary Personas

- Admin / Lead: kiểm tra permission, key status, ownership context
- Developer / Support: debug activity logs, change logs, queue, upload monitor, error tracking
- QA: regression các flow campaign/media/rule
- DevOps / Security: runtime health, alerts, secret handling, incident response

## 3. Jobs To Be Done

1. Khi tôi cần vận hành campaign cho một project, tôi muốn mở đúng workspace theo network để không phải dùng nhiều console.
2. Khi tôi submit create/edit/duplicate/publish flow, tôi muốn hệ thống validate đúng theo network và báo lỗi rõ.
3. Khi task chạy lâu, tôi muốn nó chuyển thành async job có progress thay vì timeout.
4. Khi có sự cố hoặc biến động campaign, tôi muốn xem activity/change logs để truy nguyên nhanh.
5. Khi cần kiểm tra key/permission/media workflow, tôi muốn làm trong NMS mà không thấy raw credential.

## 4. Product Goals

### 4.1 Goals

- Tập trung hóa campaign operations đa network
- Giảm thao tác thủ công và giảm phụ thuộc vào console riêng của từng vendor
- Tăng khả năng audit, debug và automation
- Giảm rủi ro secret exposure

### 4.2 Non-goals

- Không thay external ad network làm source of truth cuối cùng
- Không expose secret hoặc biến FE thành nơi quản lý credential thật
- Không cố gắng chuẩn hóa toàn bộ legacy naming/flows ngay trong một đợt
- Không coi frontend validation là lớp bảo mật cuối

## 5. Product Areas

### 5.1 Network Operations

- Google Ads
- Meta
- Meta V2
- ASA
- Axon/AppLovin
- Moloco

### 5.2 Supporting Operations

- Media libraries
- Upload monitor
- Activity logs / change logs
- Notifications
- Key management / permission screens
- UA dashboard
- Automation / network rules

### 5.3 Integration-backed Workflows

- YouTube uploads / video flows
- Adjust reporting/tracker support
- PRMS project/permission context

## 6. User Stories

### Epic 1: Workspace Navigation And Daily Operations

#### US-001: Open The Correct Workspace

As a UA operator, I want to open the correct network workspace by project so that I can manage the right entities in the right context.

Acceptance criteria:

- [ ] User phải đăng nhập thành công trước khi load protected UI
- [ ] Route phải mang đủ project/network context cần thiết
- [ ] User thiếu quyền không được thấy data nhạy cảm

#### US-002: Manage Campaign Entities

As a UA operator, I want to view and mutate campaign-related entities from NMS so that I do not need to switch to vendor consoles for normal operations.

Acceptance criteria:

- [ ] FE gọi đúng API/service layer theo network
- [ ] BE validate và enforce permission server-side
- [ ] UI hiển thị error rõ mà không leak secret/raw payload nhạy cảm

### Epic 2: Async Operations And Progress

#### US-003: Run Long Tasks Asynchronously

As a UA operator, I want long-running operations to continue in background with progress feedback so that my request does not timeout.

Acceptance criteria:

- [ ] Backend có thể enqueue hoặc async-process các task dài
- [ ] FE có progress/queued/running/completed state khi flow hỗ trợ
- [ ] Retry/rate-limit path không làm duplicate user action quá dễ dàng

#### US-004: Track Upload/Publish Issues

As a support user, I want upload and publish workflows to be observable so that I can debug failures quickly.

Acceptance criteria:

- [ ] Có upload monitor hoặc equivalent status view cho các flow liên quan
- [ ] Error tracking/logs đủ để phân biệt lỗi vendor, lỗi validation, lỗi infra
- [ ] Critical async flow có operation/job context nếu cần support

### Epic 3: Audit, Permission And Key Safety

#### US-005: Audit Critical Mutations

As a support or lead user, I want to know who changed what and when so that incident/debug work is faster.

Acceptance criteria:

- [ ] Critical mutation có activity log khi applicable
- [ ] Log không chứa raw secrets/tokens
- [ ] Có filter cơ bản theo project/network/user/time nếu API hỗ trợ

#### US-006: Inspect Permission And Key Status Safely

As an admin/support user, I want permission and key status visibility without exposing real credentials.

Acceptance criteria:

- [ ] UI chỉ hiển thị metadata/status an toàn
- [ ] Backend không trả raw secret
- [ ] Sensitive endpoints cần auth/permission phù hợp

## 7. Functional Requirements

### 7.1 Must-have

- Keycloak-based login bootstrap
- Project-aware, network-aware workspace routing
- FE/BE support cho các network hiện đang active trong source: Google Ads, Meta, Meta V2, ASA, Axon/AppLovin, Moloco
- Media/upload workflows, activity logs, notifications, dashboard, permissions, key management
- Queue/background processing cho long-running workflows
- Realtime progress hoặc equivalent UX cho các flow đã hỗ trợ websocket
- Secret protection ở backend và logging layer

### 7.2 Should-have

- Contract governance rõ hơn cho FE/BE APIs
- Consistent pagination/filter/error conventions
- Reusable realtime abstraction giữa các flow
- Runbooks và regression checklist cho các flow P0

### 7.3 Nice-to-have

- Queue dashboard/ops visibility tốt hơn
- FE design/system conventions thống nhất hơn giữa các network
- E2E regression coverage cho core campaign flows

## 8. Non-functional Requirements

| Loại | Yêu cầu |
|---|---|
| Performance | UI phải chấp nhận được cho bảng dữ liệu lớn và dashboard |
| Reliability | Long-running task không nên phụ thuộc hoàn toàn vào request-response đồng bộ |
| Security | Không leak secret; backend là authority cuối cho authz |
| Auditability | Critical changes cần log khi nghiệp vụ yêu cầu |
| Observability | Error/log/alert đủ để support và điều tra incident |
| Maintainability | Root docs phải được cập nhật cùng khi runtime shape thay đổi lớn |

## 9. Dependencies

### 9.1 Internal

- `nms-fe`
- `nms-be`
- Keycloak/shared auth
- PRMS
- Vault/secret infra

### 9.2 External

- Google Ads API
- Google Cloud: GCS, BigQuery, Pub/Sub
- Meta Graph API
- Apple Search Ads API
- Axon/AppLovin APIs
- Moloco APIs
- Adjust APIs
- YouTube APIs
- Redis, PostgreSQL, MongoDB, Sentry, Slack

## 10. Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | Khác biệt behavior giữa các network làm UI/API khó đồng nhất | High | Module boundary rõ, docs/network notes, contract review |
| 2 | Meta cũ và Meta V2 cùng tồn tại | High | Docs rõ, migration plan, tránh mơ hồ ở contract |
| 3 | Async flows không đủ observability | High | Upload monitor, logs, websocket progress, alerting |
| 4 | Permission context lệch giữa Keycloak/PRMS/backend | High | Chốt source of truth và viết ADR khi đổi |
| 5 | Redis/cache/queue issues gây timeout hoặc stale state | High | Theo dõi tech debt, runbook, kiến trúc invalidation rõ hơn |

## 11. Open Questions

- [ ] Owner chính thức của root docs là ai?
- [ ] Danh sách flow P0 nào cần regression suite đầu tiên?
- [ ] Policy chuẩn cho queue retry/backoff theo network là gì?
- [ ] Permission source of truth cuối cùng là PRMS, Keycloak, hay kết hợp?
- [ ] Kế hoạch dài hạn cho legacy AppLovin naming và Meta cũ là gì?

## 12. References

- [00_charter.md](./00_charter.md)
- [02_architecture.md](./02_architecture.md)
- [03_AGENTS.md](./03_AGENTS.md)
- `nms-fe/docs/*`
- `nms-be/docs/*`
- `docs/networks/*`

## 13. Approval

| Người | Vai trò | Trạng thái | Ngày |
|---|---|---|---|
| TBD | Product/Author | Draft | |
| TBD | Tech Lead | Draft | |
| TBD | QA Lead | Draft | |
| TBD | Approver | Draft | |

---

## Changelog

| Version | Ngày | Người | Thay đổi |
|---|---|---|---|
| 0.2.0 | 2026-06-04 | Codex | Cập nhật PRD theo runtime hiện tại: thêm Moloco, Meta V2, media/upload/audit/realtime workflows và sửa references root docs |
| 0.1.0 | 2026-05-24 | Codex | Initial root-level PRD draft |
