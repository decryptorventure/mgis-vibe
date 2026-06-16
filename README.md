# NMS Frontend

Frontend SPA for the Marketing Growth Intelligence System (MGIS/NMS). The app is built for UA operations across apps, ad networks, creatives, automation rules, analytics, upload monitoring, permissions, and key management.

## Runtime Stack

- React + TypeScript + Vite
- React Router
- Redux Toolkit + redux-persist
- Ant Design + Tailwind CSS
- Socket.IO client dependency reserved for realtime progress/event streams

## Current UI Architecture

The active frontend route tree is defined in `src/routes/appRoutes.tsx`.

```text
/login
/
/dashboard
/apps
/networks
/creatives
/automation-settings
/insight-settings
/apps/:appId/dashboard
/apps/:appId/automation-rules
/apps/:appId/network-rules
/apps/:appId/networks/:networkId
/media-libraries
/axon-reports
/predictions
/change-logs
/meta-errors
/upload-monitor
/network-rules
/key-management
/permissions
/automation
```

Shared IA/navigation metadata lives in `src/shared/navigation.ts`. Layout components should use this metadata instead of duplicating route labels, page titles, breadcrumbs, or active network definitions.

## Design System Notes

- Semantic tokens live in `src/shared/tokens.ts` and `src/index.css`.
- Ant Design theme integration lives in `src/theme/antd-theme.ts`.
- Theme mode helpers live in `src/theme/theme-mode.ts`.
- Shared UI wrappers such as page headers, data tables, filters, status badges, and chart containers should be preferred over page-local one-off card/table patterns.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Documentation

Project-level context is under `docs/`. Read these first when changing runtime architecture or UX flows:

1. `docs/03_AGENTS.md`
2. `docs/00_charter.md`
3. `docs/01_PRD.md`
4. `docs/02_architecture.md`

The UI/UX upgrade planning context is under `plans/260610-1705-nms-fe-uiux-upgrade/` and `plans/reports/`.
