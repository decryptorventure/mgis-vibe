export type ThemeMode = 'light' | 'dark';

export const THEME_KEY = 'nms-theme';
export const THEME_CHANGE_EVENT = 'nms-theme-change';

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeMode(themeMode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', themeMode);
}

export function setStoredThemeMode(themeMode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, themeMode);
  window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_CHANGE_EVENT, { detail: themeMode }));
}
