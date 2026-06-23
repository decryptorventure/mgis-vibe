// Pure metric computation helpers — formatting, synthetic values, heatmap styling
import type { Campaign, AdSet, Ad } from '@/shared/mock-data';
import type { MetaColumnKey, MetaReportRow, HeatmapColor, MetaEntity, TablePreference } from './meta-types';
import { METRIC_POLARITY, createDefaultTablePreferences, TABLE_PREF_STORAGE_KEY } from './meta-table-config';

// --- Type guards ---

export const isCampaign = (row: MetaReportRow): row is Campaign => 'network' in row;
export const isAdSet = (row: MetaReportRow): row is AdSet => 'targeting' in row;
export const isAd = (row: MetaReportRow): row is Ad => 'creativeName' in row;

// --- Number helpers ---

export const formatNumber = (value: number) => value.toLocaleString();
export const safeDivide = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;

// --- Row name lookups ---

export const getAdSetCampaignName = (adSet: AdSet, campaigns: Campaign[]) =>
  campaigns.find(campaign => campaign.id === adSet.campaignId)?.name ?? 'Unknown campaign';

export const getAdSetName = (ad: Ad, adSets: AdSet[]) =>
  adSets.find(adSet => adSet.id === ad.adSetId)?.name ?? 'Unknown ad set';

// --- Synthetic metric computations ---

export const getSyntheticLeads = (row: MetaReportRow) =>
  Math.max(0, Math.round(row.installs * 0.18 + row.clicks * 0.012));

export const getSyntheticPurchases = (row: MetaReportRow) =>
  Math.max(0, Math.round(row.installs * 0.08));

export const getSyntheticCompletedRegistrations = (row: MetaReportRow) =>
  Math.max(0, Math.round(row.installs * 0.36));

// --- Core metric value resolver ---

export const getMetricValue = (row: MetaReportRow, key: MetaColumnKey): number | string => {
  const reach = Math.max(1, Math.round(row.impressions * 0.72));
  const leads = getSyntheticLeads(row);
  const purchases = getSyntheticPurchases(row);
  const completedRegistrations = getSyntheticCompletedRegistrations(row);

  switch (key) {
    case 'account':
      return 'Clean2';
    case 'createdAt':
      return isCampaign(row) ? row.createdAt : '-';
    case 'bidStrategy':
      return isCampaign(row) ? 'Highest volume or value' : 'Using campaign bid strategy';
    case 'budget':
      return isAd(row) ? 0 : row.budget;
    case 'amountSpent':
      return row.spend;
    case 'resultRoas':
      return isCampaign(row) ? row.roas : safeDivide(row.installs * 1.35, Math.max(row.spend, 1));
    case 'appInstalls':
    case 'results':
      return row.installs;
    case 'costPerAppInstall':
    case 'costPerResults':
      return safeDivide(row.spend, row.installs);
    case 'cpm':
      return safeDivide(row.spend, row.impressions) * 1000;
    case 'ctrAll':
      return safeDivide(row.clicks, row.impressions) * 100;
    case 'cpcAll':
    case 'cpcLinkClick':
      return safeDivide(row.spend, row.clicks);
    case 'cvrInstall':
      return safeDivide(row.installs, row.clicks) * 100;
    case 'ctrInstall':
      return safeDivide(row.installs, row.impressions) * 100;
    case 'costPerLead':
      return safeDivide(row.spend, leads);
    case 'leads':
      return leads;
    case 'cvrLeads':
      return safeDivide(leads, row.clicks) * 100;
    case 'impression':
      return row.impressions;
    case 'reach':
      return reach;
    case 'frequency':
      return safeDivide(row.impressions, reach);
    case 'completedRegistration':
      return completedRegistrations;
    case 'costPerCompletedRegistration':
      return safeDivide(row.spend, completedRegistrations);
    case 'purchase':
      return purchases;
    case 'costPerPurchase':
      return safeDivide(row.spend, purchases);
    case 'linkClicks':
      return row.clicks;
    default:
      return '-';
  }
};

// --- Metric display formatting ---

export const formatMetricValue = (key: MetaColumnKey, value: number | string) => {
  if (typeof value === 'string') return value;

  const dollarKeys: MetaColumnKey[] = [
    'budget', 'amountSpent', 'costPerAppInstall', 'costPerResults',
    'cpcAll', 'costPerLead', 'costPerCompletedRegistration', 'costPerPurchase', 'cpcLinkClick',
  ];
  if (dollarKeys.includes(key)) return value > 0 ? `$${value.toFixed(value >= 100 ? 0 : 2)}` : '$0.00';
  if (key === 'resultRoas') return value > 0 ? `${value.toFixed(2)}x` : 'N/A';
  if (['ctrAll', 'cvrInstall', 'ctrInstall', 'cvrLeads'].includes(key)) return `${value.toFixed(2)}%`;
  if (key === 'frequency') return value.toFixed(2);
  return formatNumber(Math.round(value));
};

// --- Heatmap cell styling ---

export const getHeatmapStyle = (
  value: number | string,
  metric: MetaColumnKey,
  color?: HeatmapColor,
  domain?: { min: number; max: number },
): React.CSSProperties | undefined => {
  if (!color || typeof value !== 'number' || value <= 0) return undefined;
  const range = domain ? domain.max - domain.min : 0;
  const raw = range > 0 ? (value - (domain?.min ?? 0)) / range : 1;
  const normalized = METRIC_POLARITY[metric] === 'lower' ? 1 - raw : raw;
  const intensity = Math.min(0.88, Math.max(0.16, 0.16 + normalized * 0.72));
  return {
    backgroundColor: `rgba(${color.rgb}, ${intensity})`,
    color: 'var(--ds-fg-primary)',
  };
};

// --- localStorage helpers ---

export const loadStoredArray = <T,>(storageKey: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as T[]) : [];
  } catch {
    return [];
  }
};

// --- Spend pacing helpers ---

export type PacingStatus = 'on' | 'over' | 'under';

// 70% elapsed through billing period (deterministic for mock data)
const PACING_ELAPSED = 0.70;

export function getPacingStatus(row: MetaReportRow): PacingStatus {
  if (!isCampaign(row)) return 'on';
  const budget = (row as { budget: number }).budget;
  if (!budget || budget <= 0 || row.spend <= 0) return 'on';
  const expected = budget * PACING_ELAPSED;
  const ratio = row.spend / expected;
  if (ratio > 1.10) return 'over';
  if (ratio < 0.90) return 'under';
  return 'on';
}

export const PACING_META: Record<PacingStatus, { label: string; cls: string }> = {
  on:    { label: '✓ On Track',   cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  over:  { label: '⚠ Over Pace',  cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  under: { label: '↓ Under Pace', cls: 'text-sky-600 bg-sky-50 border-sky-200' },
};

export const getInitialTablePreferences = (): Record<MetaEntity, TablePreference> => {
  if (typeof window === 'undefined') return createDefaultTablePreferences();
  try {
    const saved = window.localStorage.getItem(TABLE_PREF_STORAGE_KEY);
    if (!saved) return createDefaultTablePreferences();
    const parsed = JSON.parse(saved) as Partial<Record<MetaEntity, TablePreference>>;
    const defaults = createDefaultTablePreferences();
    return {
      campaigns: { ...defaults.campaigns, ...parsed.campaigns },
      adsets: { ...defaults.adsets, ...parsed.adsets },
      ads: { ...defaults.ads, ...parsed.ads },
    };
  } catch {
    return createDefaultTablePreferences();
  }
};
