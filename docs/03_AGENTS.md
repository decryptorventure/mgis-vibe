# 03 · AGENTS.md — NMS Root Operating Rules

```yaml
doc_type: AGENTS
project_id: nms
version: 0.2.0
status: active
last_updated: 2026-06-04

compatible_agents:
  - codex
  - claude-code
  - cursor
  - github-copilot

owner: TBD
```

---

## 1. Context Loading Protocol

Khi bắt đầu session trong project `nms`, đọc theo thứ tự:

1. `docs/03_AGENTS.md`
2. `docs/00_charter.md`
3. `docs/01_PRD.md`
4. `docs/02_architecture.md`
5. `docs/04_decisions/*.md` có `status: Accepted`
6. `docs/TECH_DEBT_REDIS_CACHE_INVALIDATION.md` nếu task chạm Redis/cache/queue
7. `docs/networks/*` nếu task chạm network cụ thể
8. `nms-fe/AGENTS.md` hoặc `nms-be/AGENTS.md` nếu task chủ yếu nằm trong repo con tương ứng
9. `nms-fe/docs/*` hoặc `nms-be/docs/*` nếu task chạm API/module chuyên sâu

Nếu yêu cầu của user mâu thuẫn với PRD/architecture hiện tại, agent phải nói rõ mâu thuẫn và ưu tiên cập nhật docs/ADR cùng với thay đổi code nếu thay đổi đó là chủ đích.

## 2. Source Of Truth Rules

- Root `docs/` là source of truth cấp project.
- `docs/02_architecture.md` là source of truth cho runtime shape chung của hệ thống.
- Docs trong `nms-fe/docs` hoặc `nms-be/docs` có thể chi tiết hơn nhưng không nên mâu thuẫn với root docs.
- Khi code đã đổi nhưng docs root chưa đổi, agent nên cập nhật docs root trong cùng task nếu user đang làm thay đổi cấp hệ thống.

## 3. Tag Meanings

| Tag | Ý nghĩa |
|---|---|
| `@ssot` | Source of truth cho phạm vi được chỉ định |
| `@human-approve` | Cần người duyệt trước khi xem là business-approved |
| `@locked` | Không sửa nếu không có lý do rõ hoặc decision tương ứng |
| `@ref:` | Đọc tài liệu được reference trước khi sửa phần liên quan |

## 4. Project Reality

Agent phải làm việc dựa trên reality sau, không dựa vào template cũ:

- FE là React/Vite SPA với Redux Toolkit, RTK Query, Ant Design, Tailwind, Socket.IO client
- BE là NestJS modular monolith với `modules/` + `infrastructure/` là runtime pattern chính
- Codebase hiện là hybrid: có cả legacy naming và flow mới hơn
- Hệ thống đang active trên nhiều network: Google Ads, Meta, Meta V2, ASA, Axon/AppLovin, Moloco
- Async stack hiện là mixed `Bull + BullMQ`

Không được ép mô tả codebase như một clean architecture thuần nếu source hiện tại không như vậy.

## 5. Frontend Rules

- Routing source of truth: `nms-fe/src/routes/appRoutes.tsx`
- Global app state/API source: `nms-fe/src/assets/app-data/`
- Auth bootstrap đi qua Keycloak init hiện có, không tạo auth flow song song tùy tiện
- Không hardcode API URL hoặc secret trong component
- Không log token, raw OAuth payload hoặc credential-like values
- Khi đổi route/network workspace, cập nhật docs root nếu thay đổi ảnh hưởng context loading hoặc architecture

## 6. Backend Rules

- Runtime module shape source of truth: `nms-be/src/app.module.ts` và `nms-be/src/modules/api.module.ts`
- Không giả định tất cả business flow đi qua `applications/` hoặc `domains/`; phải đọc wiring thật trong `modules/`
- Controller chỉ xử lý HTTP/websocket boundary concerns
- Permission/validation quan trọng phải được enforce server-side
- Tác vụ dài, rate-limited hoặc upload/publish lớn nên cân nhắc queue hoặc async pattern hiện có
- Không hardcode secret, token, password, service account path cá nhân
- Không disable security interceptors/sanitizers chỉ để “cho chạy”

## 7. Documentation Rules

- Nếu thêm network route mới ở FE, cập nhật `docs/02_architecture.md`
- Nếu thêm module vào `ApiModule`, cập nhật `docs/02_architecture.md`
- Nếu thay đổi scope/business flow lớn, cập nhật `docs/00_charter.md` hoặc `docs/01_PRD.md`
- Nếu thay đổi có trade-off ảnh hưởng nhiều module, tạo hoặc cập nhật ADR
- Nếu thêm network-specific behavior, cân nhắc ghi vào `docs/networks/<network>/`

## 8. When To Ask Before Proceeding

Agent phải hỏi hoặc ít nhất nêu rõ risk trước khi:

- thêm dependency mới
- đổi auth/permission/secret strategy
- đổi API contract breaking giữa FE/BE
- đổi DB schema, migration strategy hoặc persistence choice
- đổi queue framework, retry/backoff convention, cache strategy
- đổi deployment/runtime config
- chạy script có thể mutate external data hoặc production-like state

## 9. Things Agents Must Not Do

- commit secret/token/private key/service account
- coi FE validation là đủ cho security
- tự ý xoá hoặc vô hiệu hóa audit/security logging
- mô tả docs là “đã approved” khi file vẫn để `draft`/`@human-approve`
- sửa root docs theo template cũ nếu source hiện tại đã khác

## 10. Review Checklist

- [ ] Root docs có còn reference file không tồn tại không?
- [ ] Nếu task đổi runtime shape, docs root đã được cập nhật chưa?
- [ ] Không thêm secret/log nhạy cảm vào code hoặc docs
- [ ] Authz/validation vẫn nằm ở backend cho sensitive flows
- [ ] Async flow có observability/progress path hợp lý khi cần
- [ ] Nếu quyết định có trade-off lớn, đã mở ADR hoặc nêu rõ need for ADR

---

## Changelog

| Version | Ngày | Người | Thay đổi |
|---|---|---|---|
| 0.2.0 | 2026-06-04 | Codex | Cập nhật operating rules theo runtime thực tế, sửa context order và bỏ mô tả backend layering không còn đúng |
| 0.1.0 | 2026-05-24 | Codex | Initial root-level agent rules |
