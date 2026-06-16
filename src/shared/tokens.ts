// ─────────────────────────────────────────────────────────────────────────────
// NMS Design Tokens — Single source of truth (TypeScript)
// Must match exactly the CSS custom properties defined in src/index.css :root
// ─────────────────────────────────────────────────────────────────────────────

// ─── Brand Palette ────────────────────────────────────────────────────────────
export const primary = {
  50:  '#fff3ec',
  100: '#ffe5d3',
  200: '#ffc8a5',
  300: '#ffa26d',
  400: '#ff7232',
  500: '#ff4f0a',
  600: '#f03800',
  700: '#c72802',
  800: '#9e210a',
  900: '#7f1e0d',
  950: '#450c04',
} as const;

// ─── Surface ──────────────────────────────────────────────────────────────────
export const surface = {
  base:   '#ffffff',
  subtle: '#f5f7fa',
  muted:  '#f1f5f9',
  fill:   '#f8fafc',
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────
export const border = {
  default: '#e5e7eb',
  subtle:  '#f3f4f6',
  strong:  '#d1d5db',
} as const;

// ─── Text ─────────────────────────────────────────────────────────────────────
export const text = {
  primary:   '#111827',
  secondary: '#4b5563',
  tertiary:  '#9ca3af',
  disabled:  '#d1d5db',
  inverse:   '#ffffff',
} as const;

// ─── Status ───────────────────────────────────────────────────────────────────
export const status = {
  success:       '#16a34a',
  successBg:     '#dcfce7',
  successBorder: '#bbf7d0',
  error:         '#dc2626',
  errorBg:       '#fee2e2',
  errorBorder:   '#fecaca',
  warning:       '#ca8a04',
  warningBg:     '#fef9c3',
  warningBorder: '#fde68a',
  info:          '#2563eb',
  infoBg:        '#dbeafe',
  infoBorder:    '#bfdbfe',
} as const;

// ─── Navigation — Core DS: no brand orange for nav active ─────────────────────
export const nav = {
  itemHoverBg:   '#f8fafc',
  itemActiveBg:  '#f1f5f9',
  itemActiveText:'#0f172a',
  itemText:      '#374151',
  itemHoverText: '#111827',
  itemIconActive:'#0f172a',
} as const;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const sidebar = {
  bg:     '#ffffff',
  border: border.default,
  width:  260,
} as const;

// ─── Elevation — Core DS: shadow ONLY on floating layers ──────────────────────
export const shadow = {
  float:    '0 4px 16px -2px rgb(0 0 0 / 0.10), 0 2px 6px -1px rgb(0 0 0 / 0.06)',
  dropdown: '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 3px 8px -2px rgb(0 0 0 / 0.07)',
  none:     'none',
} as const;

// ─── Typography — Core DS 1.1 ─────────────────────────────────────────────────
export const fontSizes = {
  bodyS:   '13px',  // baseline for UI components
  bodyM:   '16px',  // long-form reading only
  labelXs: '11px',
  labelS:  '12px',
} as const;

export const lineHeights = {
  body: 1.6,
  tight: 1.3,
  none: 1,
} as const;

export const fontWeights = {
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const;

export const fontFamily =
  "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ─── Border Radius ────────────────────────────────────────────────────────────
export const borderRadius = {
  sm:   4,
  md:   6,
  lg:   8,
  xl:   10,
  full: 9999,
} as const;

// ─── Aggregate Colors Export ──────────────────────────────────────────────────
export const colors = {
  primary,
  surface,
  border,
  text,
  status,
  nav,
  sidebar,
} as const;

// ─── Dark Mode Colors ─────────────────────────────────────────────────────────
export const darkColors = {
  surface: {
    base:   '#0f1117',
    subtle: '#161923',
    muted:  '#1e2130',
    fill:   '#1e2130',
  },
  border: {
    default: '#2a2d3a',
    subtle:  '#1e2130',
    strong:  '#3a3d4a',
  },
  text: {
    primary:   '#f1f3f9',
    secondary: '#9ca3b4',
    tertiary:  '#6b7280',
    disabled:  '#4b5060',
    inverse:   '#111827',
  },
  status: {
    success:       '#22c55e',
    successBg:     '#052e16',
    successBorder: '#14532d',
    error:         '#ef4444',
    errorBg:       '#2d0a0a',
    errorBorder:   '#7f1d1d',
    warning:       '#eab308',
    warningBg:     '#2d2505',
    warningBorder: '#713f12',
    info:          '#3b82f6',
    infoBg:        '#0a1a2d',
    infoBorder:    '#1e3a5f',
  },
  nav: {
    itemHoverBg:   '#1e2130',
    itemActiveBg:  '#252838',
    itemActiveText:'#f1f3f9',
    itemText:      '#9ca3b4',
    itemHoverText: '#f1f3f9',
    itemIconActive:'#f1f3f9',
  },
  sidebar: {
    bg:     '#0f1117',
    border: '#2a2d3a',
  },
  shadow: {
    float:    '0 4px 16px -2px rgb(0 0 0 / 0.40), 0 2px 6px -1px rgb(0 0 0 / 0.30)',
    dropdown: '0 8px 24px -4px rgb(0 0 0 / 0.50), 0 3px 8px -2px rgb(0 0 0 / 0.35)',
  },
} as const;

// ─── Network Config ───────────────────────────────────────────────────────────
export const networkConfig = {
  'google-ads': {
    label:   'Google Ads',
    color:   '#1a73e8',
    bgColor: '#e8f0fe',
  },
  meta: {
    label:   'Meta',
    color:   '#1877f2',
    bgColor: '#e7f3ff',
  },
  asa: {
    label:   'Apple Search Ads',
    color:   '#0071e3',
    bgColor: '#e5f1fb',
  },
  axon: {
    label:   'Axon / AppLovin',
    color:   '#6d28d9',
    bgColor: '#ede9fe',
  },
  moloco: {
    label:   'Moloco',
    color:   '#059669',
    bgColor: '#d1fae5',
  },
  adjust: {
    label:   'Adjust',
    color:   '#0d9488',
    bgColor: '#ccfbf1',
  },
  youtube: {
    label:   'YouTube',
    color:   '#dc2626',
    bgColor: '#fee2e2',
  },
} as const;

export type NetworkKey = keyof typeof networkConfig;

// ─── Status Config ────────────────────────────────────────────────────────────
export const statusConfig = {
  // Active states
  active:    { color: status.success, bg: status.successBg },
  running:   { color: status.success, bg: status.successBg },
  enabled:   { color: status.success, bg: status.successBg },

  // Paused states
  paused:    { color: status.warning, bg: status.warningBg },
  stopped:   { color: status.warning, bg: status.warningBg },
  disabled:  { color: status.warning, bg: status.warningBg },

  // Completed states
  completed: { color: status.success, bg: status.successBg },
  success:   { color: status.success, bg: status.successBg },

  // Failed states
  failed:    { color: status.error,   bg: status.errorBg },
  error:     { color: status.error,   bg: status.errorBg },

  // Pending states
  pending:    { color: status.info,      bg: status.infoBg },
  processing: { color: status.info,      bg: status.infoBg },
  queued:     { color: status.info,      bg: status.infoBg },

  // Neutral states
  draft:   { color: text.secondary,  bg: surface.muted },
  unknown: { color: text.tertiary,   bg: surface.muted },
} as const;

export type StatusKey = keyof typeof statusConfig;
