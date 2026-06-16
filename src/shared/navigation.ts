import { networkConfig } from './tokens';

export const ACTIVE_NETWORK_KEYS = ['google-ads', 'meta', 'asa', 'axon', 'moloco'] as const;
export type ActiveNetworkKey = (typeof ACTIVE_NETWORK_KEYS)[number];

export type NavIconKey =
  | 'dashboard'
  | 'apps'
  | 'networks'
  | 'creatives'
  | 'network-rules'
  | 'automation'
  | 'insights'
  | 'change-logs';

export interface NavigationItem {
  key: string;
  path: string;
  label: string;
  title: string;
  icon: NavIconKey;
}

export const ACTIVE_NETWORKS: Record<ActiveNetworkKey, {
  key: ActiveNetworkKey;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
}> = {
  'google-ads': {
    key: 'google-ads',
    label: networkConfig['google-ads'].label,
    shortLabel: 'Google Ads',
    color: networkConfig['google-ads'].color,
    bgColor: networkConfig['google-ads'].bgColor,
  },
  meta: {
    key: 'meta',
    label: networkConfig.meta.label,
    shortLabel: 'Meta',
    color: networkConfig.meta.color,
    bgColor: networkConfig.meta.bgColor,
  },
  asa: {
    key: 'asa',
    label: networkConfig.asa.label,
    shortLabel: 'ASA',
    color: networkConfig.asa.color,
    bgColor: networkConfig.asa.bgColor,
  },
  axon: {
    key: 'axon',
    label: networkConfig.axon.label,
    shortLabel: 'Axon',
    color: networkConfig.axon.color,
    bgColor: networkConfig.axon.bgColor,
  },
  moloco: {
    key: 'moloco',
    label: networkConfig.moloco.label,
    shortLabel: 'Moloco',
    color: networkConfig.moloco.color,
    bgColor: networkConfig.moloco.bgColor,
  },
};

export const GLOBAL_NAV_ITEMS: NavigationItem[] = [
  { key: 'dashboard', path: '/', label: 'Dashboard', title: 'Global Dashboard', icon: 'dashboard' },
  { key: 'apps', path: '/apps', label: 'Apps', title: 'Apps', icon: 'apps' },
  { key: 'networks', path: '/networks', label: 'Networks', title: 'Networks', icon: 'networks' },
  { key: 'creatives', path: '/creatives', label: 'Creatives', title: 'Creative Library', icon: 'creatives' },
  { key: 'network-rules', path: '/network-rules', label: 'Network Rules', title: 'Network Rules', icon: 'network-rules' },
  { key: 'automation', path: '/automation-settings', label: 'Automation', title: 'Automation Settings', icon: 'automation' },
  { key: 'insights', path: '/insight-settings', label: 'Insights', title: 'Insights', icon: 'insights' },
  { key: 'change-logs', path: '/change-logs', label: 'Change Logs', title: 'Change Logs', icon: 'change-logs' },
];

export const SUPPORTING_ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Global Dashboard',
  '/media-libraries': 'Media Libraries',
  '/axon-reports': 'Axon Reports',
  '/predictions': 'Predictions',
  '/meta-errors': 'Meta Error Diagnostics',
  '/upload-monitor': 'Upload Monitor',
  '/key-management': 'Key Management',
  '/permissions': 'Permissions',
  '/automation': 'Automation',
};

export function isActiveNetworkKey(value?: string | null): value is ActiveNetworkKey {
  return ACTIVE_NETWORK_KEYS.includes(value as ActiveNetworkKey);
}

export function getNetworkMeta(networkId?: string | null) {
  return isActiveNetworkKey(networkId) ? ACTIVE_NETWORKS[networkId] : null;
}

export function getAppNetworkPath(appId: string, networkId: ActiveNetworkKey): string {
  return `/apps/${appId}/networks/${networkId}`;
}

export function getSelectedNavPath(pathname: string): string {
  if (pathname === '/' || pathname === '/dashboard') return '/';
  if (pathname === '/media-libraries') return '/creatives';

  const globalItem = GLOBAL_NAV_ITEMS.find(item => item.path === pathname);
  if (globalItem) return globalItem.path;

  return pathname;
}

export function getPageTitle(pathname: string): string {
  if (pathname === '/' || pathname === '/dashboard') return 'Global Dashboard';

  const globalItem = GLOBAL_NAV_ITEMS.find(item => item.path === pathname);
  if (globalItem) return globalItem.title;

  if (SUPPORTING_ROUTE_TITLES[pathname]) return SUPPORTING_ROUTE_TITLES[pathname];

  if (/^\/apps\/[^/]+\/dashboard$/.test(pathname)) return 'App Dashboard';
  if (/^\/apps\/[^/]+\/(automation-rules|network-rules)$/.test(pathname)) return 'App Network Rules';

  const networkMatch = pathname.match(/^\/apps\/[^/]+\/networks\/([^/]+)$/);
  const networkMeta = getNetworkMeta(networkMatch?.[1]);
  if (networkMeta) return `${networkMeta.label} Workspace`;

  return 'MGIS Portal';
}

export function getBreadcrumbItems(
  pathname: string,
  context: { appName?: string; networkLabel?: string } = {},
): string[] {
  if (pathname === '/' || pathname === '/dashboard') return [];

  const appScoped = pathname.match(/^\/apps\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (appScoped) {
    const crumbs = ['Apps'];
    if (context.appName) crumbs.push(context.appName);
    if (pathname.includes('/networks/')) {
      crumbs.push('Networks');
      if (context.networkLabel) crumbs.push(context.networkLabel);
    }
    if (pathname.includes('/network-rules') || pathname.includes('/automation-rules')) {
      crumbs.push('Network Rules');
    }
    return crumbs;
  }

  return [];
}
