// Axon workspace — types, constants, data helpers
import { NETWORK_CONFIGS } from '@/shared/network-config';
import type { Campaign } from '@/shared/mock-data';

export type AxonTab = 'overview' | 'campaigns' | 'automation';
export type ReportMode = 'cohort' | 'realtime';
export type CampaignStatusFilter = 'all' | 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ERROR';
export type CampaignBuilderMode = 'create' | 'duplicate';

export interface AxonCampaignRow extends Campaign {
  axonId: number;
  goalType: 'CPI' | 'BLD ROAS';
  roasDay: 'N/A' | 'DAY7' | 'DAY28';
  platform: 'ANDROID' | 'IOS';
  ctr: number;
  ir: number;
  ecpm: number;
  ecpc: number;
  ecpi: number;
  d0Roas: number;
  recommendation: 'scale' | 'trim' | 'watch';
}

export interface AxonAutomationRule {
  id: string;
  name: string;
  updatedAt?: string;
  scope: 'Countries' | 'Creative Sets';
  condition: string;
  mode: ReportMode;
  status: 'ON' | 'OFF';
  createdAt: string;
  matched: number;
}

export interface AxonRunHistory {
  id: string;
  ruleName: string;
  campaign: string;
  mode: ReportMode;
  status: 'applied' | 'evaluated' | 'triggered';
  matched: number;
  totalActive: number;
  evaluated: number;
  triggeredBy: string;
  time: string;
}

export interface AxonDraftRule {
  id: string;
  name: string;
  tags: string[];
  pools: Array<{ label: string; color: 'blue' | 'emerald' | 'violet'; badge?: string }>;
  combos: number;
  createdAt: string;
  status: 'LIVE' | 'TRIGGERED';
}

export interface EvaluationItem {
  id: string;
  name: string;
  shortId: string;
  condition: string;
  campaign: string;
  actual: string;
}

export const AXON_COLOR = NETWORK_CONFIGS.axon.color;

export const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 100 ? 0 : 2 })}`;
export const formatPercent = (value: number) => `${value.toFixed(2)}%`;
export const safeDivide = (n: number, d: number) => (d > 0 ? n / d : 0);

const TIER_1 = new Set(['US', 'GB', 'CA', 'AU', 'NZ', 'JP', 'DE', 'FR', 'SE', 'NO', 'CH', 'NL', 'DK']);
const TIER_2 = new Set(['KR', 'SG', 'HK', 'TW', 'IT', 'ES', 'PT', 'AT', 'BE', 'FI', 'IE', 'IL']);
const TIER_3 = new Set(['BR', 'MX', 'AR', 'TR', 'RU', 'PL', 'CZ', 'HU', 'RO', 'IN', 'ZA', 'CL', 'CO']);

export const getCountryTier = (code: string): 1 | 2 | 3 | 4 => {
  if (TIER_1.has(code)) return 1;
  if (TIER_2.has(code)) return 2;
  if (TIER_3.has(code)) return 3;
  return 4;
};

export const TIER_STYLE: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  3: 'bg-purple-50 text-purple-700 border-purple-200',
  4: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const builderSteps = [
  { key: 'objective', title: 'Objective', hint: 'App + campaign name + OS', state: 'done' as const },
  { key: 'targeting', title: 'Targeting', hint: '3 regions selected', state: 'done' as const },
  { key: 'budget', title: 'Budget', hint: 'Amount required', state: 'warn' as const },
  { key: 'optimization', title: 'Optimization', hint: 'CPI, spend fast', state: 'done' as const },
  { key: 'tracking', title: 'Tracking', hint: 'Links required', state: 'warn' as const },
];

export const regionGroups = [
  { name: 'Africa', count: 58 },
  { name: 'Asia', count: 48 },
  { name: 'Eastern Europe', count: 24 },
  { name: 'Latin America and the Caribbean', count: 49 },
  { name: 'North America', count: 5 },
  { name: 'Oceania', count: 26 },
  { name: 'Western Europe', count: 28 },
];

export const automationRules: AxonAutomationRule[] = [
  { id: 'ar-1', name: 'test 1234', updatedAt: '6/5/2026, 5:42:42 PM', scope: 'Countries', condition: 'Installs < 50 | Last 7 Days', mode: 'cohort', status: 'ON', createdAt: 'Jun 17, 2026', matched: 238 },
  { id: 'ar-2', name: 'test rules', updatedAt: '6/1/2026, 7:45:08 PM', scope: 'Countries', condition: 'Installs < 50 | Last 7 Days', mode: 'cohort', status: 'ON', createdAt: 'Jun 12, 2026', matched: 64 },
  { id: 'ar-3', name: 'Realtime click spike', scope: 'Creative Sets', condition: 'CTR > 5% | Today', mode: 'realtime', status: 'OFF', createdAt: 'Jun 08, 2026', matched: 18 },
];

export const runHistory: AxonRunHistory[] = [
  { id: 'run-1', ruleName: 'test 1234', campaign: 'test duplicate campaign', mode: 'cohort', status: 'evaluated', matched: 238, totalActive: 6, evaluated: 8, triggeredBy: 'duynv', time: '13 days ago' },
  { id: 'run-2', ruleName: 'test rules', campaign: 'test create acreative', mode: 'cohort', status: 'applied', matched: 64, totalActive: 6, evaluated: 6, triggeredBy: 'duynv', time: '23 days ago' },
  { id: 'run-3', ruleName: 'test', campaign: 'test duplicate campaign', mode: 'cohort', status: 'applied', matched: 18, totalActive: 7, evaluated: 7, triggeredBy: 'duynv', time: '23 days ago' },
];

export const draftRules: AxonDraftRule[] = [
  {
    id: 'draft-1',
    name: 'test 222',
    tags: ['IGGJ'],
    pools: [
      { label: 'PLA win: Top 10 (Last 7 Days)', color: 'emerald', badge: 'Split' },
      { label: 'manual: Recent (Last 7 Days)', color: 'blue', badge: 'Mixed' },
    ],
    combos: 1,
    createdAt: 'Jun 16, 2026',
    status: 'TRIGGERED',
  },
  {
    id: 'draft-2',
    name: 'CPP refresh test',
    tags: ['CPP', 'MIXED'],
    pools: [
      { label: 'HTML (PLA): Top Spend', color: 'blue' },
      { label: 'Video: Top IPM', color: 'violet' },
    ],
    combos: 8,
    createdAt: 'Jun 12, 2026',
    status: 'LIVE',
  },
];

export const getCampaignRows = (campaigns: Campaign[]): AxonCampaignRow[] =>
  campaigns.map((c, i) => {
    const ctr = safeDivide(c.clicks, c.impressions) * 100;
    return {
      ...c,
      axonId: 381843 + i * 117,
      goalType: i % 3 === 1 ? 'BLD ROAS' : 'CPI',
      roasDay: i % 3 === 1 ? 'DAY7' : i % 4 === 0 ? 'DAY28' : 'N/A',
      platform: 'ANDROID',
      ctr,
      ir: safeDivide(c.installs, c.impressions) * 100,
      ecpm: safeDivide(c.spend, c.impressions) * 1000,
      ecpc: safeDivide(c.spend, c.clicks),
      ecpi: safeDivide(c.spend, c.installs),
      d0Roas: Math.max(0, c.roas * 0.18),
      recommendation: c.roas >= 3.6 ? 'scale' : c.cpa > 0.7 ? 'trim' : 'watch',
    };
  });

export const buildTrend = (campaigns: AxonCampaignRow[]) => {
  const spend = campaigns.reduce((s, c) => s + c.spend, 0);
  const installs = campaigns.reduce((s, c) => s + c.installs, 0);
  return ['Jun 12', 'Jun 13', 'Jun 14', 'Jun 15', 'Jun 16', 'Jun 17', 'Jun 18'].map((label, i) => {
    const m = [0.72, 0.78, 0.86, 0.91, 0.98, 1.06, 1.14][i];
    return { label, spend: Math.round(spend * m / 7), installs: Math.round(installs * (m + 0.04) / 7) };
  });
};
