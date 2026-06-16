import type { ThemeConfig } from 'antd';
import { theme as antdAlgorithm } from 'antd';
import {
  primary,
  surface,
  border,
  text,
  nav,
  shadow,
  fontFamily,
  borderRadius,
  darkColors,
} from '@/shared/tokens';
import type { ThemeMode } from './theme-mode';

// ─────────────────────────────────────────────────────────────────────────────
// NMS Ant Design Theme
// Core DS rule: brand orange (#ff4f0a) is the primary action color only.
// Navigation active states, tabs, pagination → use neutral tokens, not orange.
// Shadow → only for floating layers (modal, popover, dropdown, tooltip, drawer).
//
// Dark mode is applied in two layers:
// 1. CSS custom properties on <html data-theme="dark">
// 2. Ant Design darkAlgorithm + matching semantic tokens in ConfigProvider
// ─────────────────────────────────────────────────────────────────────────────
export function createAntdTheme(themeMode: ThemeMode = 'light'): ThemeConfig {
  const semantic = themeMode === 'dark'
    ? {
        surface: darkColors.surface,
        border: darkColors.border,
        text: darkColors.text,
        nav: darkColors.nav,
        shadow: darkColors.shadow,
      }
    : { surface, border, text, nav, shadow };

  return {
    algorithm: themeMode === 'dark' ? antdAlgorithm.darkAlgorithm : antdAlgorithm.defaultAlgorithm,
    token: {
      colorPrimary:         primary[500],
      colorPrimaryHover:    primary[600],
      borderRadius:         borderRadius.md,
      fontFamily,
      fontSize:             13,
      colorBgContainer:     semantic.surface.base,
      colorBgLayout:        semantic.surface.subtle,
      colorBorder:          semantic.border.default,
      colorBorderSecondary: semantic.border.subtle,
      colorText:            semantic.text.primary,
      colorTextSecondary:   semantic.text.secondary,
      colorTextTertiary:    semantic.text.tertiary,
      colorTextDisabled:    semantic.text.disabled,
      colorFillAlter:       semantic.surface.fill,
      // Shadows only for floating layers
      boxShadow:            semantic.shadow.float,
      boxShadowSecondary:   semantic.shadow.dropdown,
    },
    components: {
      Button: {
        borderRadius:  borderRadius.md,
        controlHeight: 36,
        fontWeight:    500,
      },
      Input: {
        borderRadius:  borderRadius.md,
        controlHeight: 36,
      },
      Select: {
        borderRadius:  borderRadius.md,
        controlHeight: 36,
      },
      Table: {
        headerBg:           semantic.surface.fill,
        headerColor:        semantic.text.tertiary,   // muted uppercase header
        headerSplitColor:   semantic.border.default,
        borderRadius:       borderRadius.lg,
        rowHoverBg:         semantic.surface.fill,
        // Core DS: data-grid row height ≥ 64px
        // Antd uses cellPaddingBlock to control row height;
        // combined with min content height this achieves ≥64px
        cellPaddingBlock:   14,
        cellPaddingInline:  16,
        headerBorderRadius: borderRadius.lg,
        // Core DS: no shadow on table
        boxShadow:          shadow.none,
      },
      Card: {
        // Core DS: no shadow on cards — border only
        boxShadow:    shadow.none,
        borderRadius: borderRadius.xl,
      },
      // Core DS rule: no brand orange for navigation active states
      Menu: {
        itemBorderRadius:  borderRadius.md,
        itemHoverBg:       semantic.nav.itemHoverBg,
        itemSelectedBg:    semantic.nav.itemActiveBg,
        itemSelectedColor: semantic.nav.itemActiveText,   // neutral, NOT orange
        itemColor:         semantic.nav.itemText,
        itemHoverColor:    semantic.nav.itemHoverText,
        subMenuItemBg:     'transparent',
        iconSize:          16,
        itemHeight:        36,
      },
      Badge: {
        colorBgContainer: primary[500],
      },
      Tabs: {
        // Core DS: no brand orange for tabs active state
        inkBarColor:       semantic.nav.itemActiveText,
        itemSelectedColor: semantic.nav.itemActiveText,
        itemHoverColor:    semantic.text.primary,
        itemColor:         semantic.text.secondary,
      },
      DatePicker: {
        borderRadius:  borderRadius.md,
        controlHeight: 36,
      },
      Alert: {
        borderRadius: borderRadius.lg,
      },
    },
  };
}

export const antdTheme: ThemeConfig = createAntdTheme('light');
