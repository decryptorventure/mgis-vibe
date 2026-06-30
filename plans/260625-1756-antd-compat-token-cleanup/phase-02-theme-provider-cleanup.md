---
phase: 2
title: "Theme provider cleanup"
status: pending
priority: P1
dependencies: [phase-01]
---

# Phase 2: Theme provider cleanup

## Overview

Remove the AntD `ConfigProvider` + `createAntdTheme` setup from `main.tsx`, delete `src/theme/antd-theme.ts`, and uninstall `antd` from `package.json`. After Phase 1 all component imports are gone; this phase removes the last runtime dependency.

## Related Code Files

- Modify: `src/main.tsx`
- Delete: `src/theme/antd-theme.ts`
- Modify: `package.json` (remove `antd` dependency)

## Implementation Steps

### Step 1 — Rewrite `src/main.tsx`

Remove `ConfigProvider` and `createAntdTheme`. The root already has `TooltipProvider` + `Toaster` from `@frontend-team/ui-kit`. Keep only those.

**Before (relevant lines):**
```tsx
import { ConfigProvider } from 'antd';
import { createAntdTheme } from './theme/antd-theme';

function RootProviders() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  // ...
  return (
    <ConfigProvider theme={createAntdTheme(themeMode)}>
      <TooltipProvider>
        <Toaster />
        {children}
      </TooltipProvider>
    </ConfigProvider>
  );
}
```

**After:**
```tsx
function RootProviders() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  useEffect(() => { applyThemeMode(themeMode); }, [themeMode]);
  // expose themeMode setter via event listener (keep existing THEME_CHANGE_EVENT logic)
  return (
    <TooltipProvider>
      <Toaster />
      {children}
    </TooltipProvider>
  );
}
```

Keep `applyThemeMode`, `getInitialTheme`, `THEME_CHANGE_EVENT`, and `THEME_KEY` imports — these drive the CSS variable theming which is still needed.

### Step 2 — Delete `src/theme/antd-theme.ts`

The file only exports `createAntdTheme`. Once removed from `main.tsx` it is dead code.

```bash
rm src/theme/antd-theme.ts
```

### Step 3 — Remove `antd` from `package.json`

```bash
npm uninstall antd
```

Verify `package.json` no longer lists `antd` under `dependencies` or `devDependencies`.

### Step 4 — Build verification

```bash
npm run build
```

Expected: zero antd-related import errors. If any `Cannot find module 'antd'` surfaces, a Phase 1 swap was missed — fix and re-run.

### Step 5 — Runtime smoke test

Check these surfaces in the browser for visual regressions caused by loss of AntD CSS resets:
- Tables (`/networks`, `/apps/:id/networks/:id`)
- Forms (Campaign Wizard modal)
- Sidebar + header
- Modals and Drawers

AntD global CSS resets (`antd/dist/reset.css`) may have been imported somewhere. Search and remove:

```bash
grep -r "antd/dist/reset\|antd.css\|antd/es" src/
```

## Success Criteria

- [ ] `src/main.tsx` has zero `antd` imports.
- [ ] `src/theme/antd-theme.ts` deleted.
- [ ] `antd` not in `package.json`.
- [ ] `npm run build` passes.
- [ ] No global AntD CSS import anywhere in `src/`.
- [ ] `node_modules/antd` absent after clean install (`npm ci`).

## Risk Assessment

- **AntD CSS reset removal** — may cause minor spacing/box-model regressions on unstyled elements. Mitigate: check `src/index.css` for any compensating resets; add `box-sizing: border-box` if missing.
- **`createAntdTheme` called elsewhere** — unlikely but search before deleting: `grep -r "createAntdTheme\|antd-theme" src/`.
