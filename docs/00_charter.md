# 00 · Project Charter — NMS

<!-- @ssot: Tại sao NMS tồn tại, scope hiện tại và glossary chung -->
<!-- @human-approve: Nội dung business/ownership cần người duyệt trước khi coi là final -->

```yaml
doc_type: charter
project_id: nms
project_name: Network Marketing System
version: 0.2.0
status: draft
created_date: 2026-05-24
last_updated: 2026-06-04

ownership:
  product_owner: TBD
  tech_lead: TBD
  approver: TBD
  stakeholders:
    - UA team
    - Frontend team
    - Backend team
    - DevOps / Platform team
    - Security owner

links:
  prd: ./01_PRD.md
  architecture: ./02_architecture.md
  agents: ./03_AGENTS.md
  decisions: ./04_decisions/
  network_docs: ./networks/
```

---

## 1. Vision

NMS là internal platform giúp UA team vận hành marketing workflows đa network từ một nơi duy nhất, thay cho việc phụ thuộc vào nhiều console, script rời rạc và credential handling thủ công.

## 2. Mission

NMS cung cấp:

- Web UI tập trung cho campaign, creative, permissions, dashboard, media và audit flows
- Backend orchestration layer để chuẩn hóa business workflows giữa các ad network
- Secret handling server-side qua Vault/runtime infra
- Queue/realtime progress cho các tác vụ dài hoặc nhạy với rate limit

## 3. Core Problem

UA team hiện phải làm việc với nhiều network có:

- Data model khác nhau
- Auth/credential model khác nhau
- API constraints và rate limit khác nhau
- Workflow upload/publish/reporting khác nhau

Nếu không có một lớp orchestration chung:

- Thao tác bị phân tán
- Permission khó kiểm soát
- Audit/debug khó
- Automation khó tái sử dụng giữa các network
- Rủi ro secret leak tăng lên

## 4. Scope

### 4.1 In Scope

- Frontend `nms-fe` cho internal operations
- Backend `nms-be` với REST API `/api/v1`
- Network workspaces cho `Google Ads`, `Meta`, `Meta V2`, `ASA`, `Axon/AppLovin`, `Moloco`
- Hỗ trợ phụ trợ cho `YouTube` và `Adjust`
- Key management, permissions, notifications, activity logs, change logs
- Media libraries, upload monitor, dashboard, automation/rules
- Queue/background jobs, websocket progress, Pub/Sub callbacks
- Sentry, secure logging, response sanitization, security middleware

### 4.2 Out Of Scope

- Thay thế source of truth cuối cùng của từng ad network
- Expose raw credentials cho browser hoặc docs
- Frontend-only authorization
- Chuẩn hóa toàn bộ legacy naming/history nếu chưa có migration plan
- Runtime destructive operations trên production nếu không có explicit approval/runbook

### 4.3 Future Scope

- OpenAPI/contract governance giữa FE và BE
- Queue/runbook/incident handbook chuẩn hóa
- E2E regression suite cho các flow P0
- ADR hóa các quyết định lớn đang tồn tại ngầm trong code

## 5. Success Criteria

| # | Outcome | Đo bằng | Target sơ bộ |
|---|---|---|---|
| 1 | Critical UA workflows chạy được tập trung trong NMS | Product/QA checklist | TBD |
| 2 | Secret không bị leak qua FE/docs/log/response | Security review | 0 leak |
| 3 | Long-running workflows không làm request chính timeout | Queue/job metrics | TBD |
| 4 | Critical mutations có audit trail đủ debug | Activity log coverage | TBD |
| 5 | Team mới có thể hiểu runtime shape của hệ thống nhanh hơn | Onboarding feedback | TBD |

## 6. Constraints

### 6.1 Product / Team

- Internal tool, owner business và owner kỹ thuật chưa được chốt trong file này
- Nhiều network/workflow đã chạy production nhưng codebase vẫn còn legacy naming/history

### 6.2 Technical

- FE: React 19, TypeScript, Vite, React Router, Redux Toolkit, redux-persist, Ant Design, Tailwind
- BE: NestJS 10, TypeORM, PostgreSQL, MongoDB, Redis, Bull, BullMQ, Socket.IO
- Auth: Keycloak/shared auth + PRMS context
- Secret source: Vault/runtime env, không hardcode

### 6.3 Security

- `VITE_*` là public config
- Backend phải là authority cuối cho validation và permission
- Logs/responses phải tiếp tục sanitize để tránh secret leak

## 7. Stakeholders & RACI

| Người / Nhóm | Vai trò | Charter | PRD | Architecture | Release |
|---|---|:---:|:---:|:---:|:---:|
| Product Owner | Product scope | A | A | C | A |
| Tech Lead | Architecture | C | C | A | C |
| FE Lead | Frontend delivery | C | C | C | R |
| BE Lead | Backend delivery | C | C | C | R |
| UA Team | Primary users | C | C | I | I |
| DevOps / Platform | Runtime/deploy | I | I | C | C |
| Security Owner | Security review | C | C | C | C |

## 8. Glossary

| Thuật ngữ | Định nghĩa | Notes |
|---|---|---|
| NMS | Network Marketing System | Internal marketing operations platform |
| UA | User Acquisition | Nhóm người dùng chính |
| Network | Ad platform như Google Ads, Meta, ASA, Axon, Moloco | |
| Project | App/game/project marketing context | Thường lấy từ PRMS |
| PRMS | Internal project/permission system | Upstream context |
| Vault | Secret storage / credential source | FE không nhận raw secret |
| Activity Log | Audit trail cho thao tác | |
| Change Log | Timeline/debug log cho thay đổi campaign/network | |
| Queue Job | Tác vụ async chạy qua Bull/BullMQ | |
| Pub/Sub Callback | Endpoint nhận event async từ cloud/external flow | Raw body preserved |
| Table Version | Route/UI version flag theo network | Ví dụ `v1`, `v3`, `app` |

## 9. Risks

| # | Rủi ro | Impact | Mitigation |
|---|---|---|---|
| 1 | Secret/token bị lộ qua code/docs/logs/responses | Critical | Secret scan, sanitizers, secure logger, rotation policy |
| 2 | API/rate-limit behavior khác nhau giữa network | High | Queue, retry/backoff, async progress |
| 3 | Meta cũ, Meta V2 và legacy Axon/AppLovin naming gây nhầm lẫn | High | Docs rõ ràng, ADR/migration plan |
| 4 | Redis là critical dependency cho queue + websocket + cache | High | Runbook, monitoring, debt tracking |
| 5 | Root docs không được cập nhật khi runtime đổi | Medium | Update rules + review checklist |

## 10. Approval

| Người | Vai trò | Trạng thái | Ngày |
|---|---|---|---|
| TBD | Product Owner | Draft | |
| TBD | Tech Lead | Draft | |
| TBD | Final approver | Draft | |

---

## Changelog

| Version | Ngày | Người | Thay đổi |
|---|---|---|---|
| 0.2.0 | 2026-06-04 | Codex | Cập nhật charter theo runtime hiện tại: thêm Moloco, Meta V2, media/upload/audit/realtime flows và sửa links root docs |
| 0.1.0 | 2026-05-24 | Codex | Initial root-level draft |
