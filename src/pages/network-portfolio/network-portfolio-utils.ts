// Pure utility functions and types shared across network-portfolio sub-components
import type { Campaign, Project } from '@/shared/mock-data';

export type SortMode = 'spend' | 'installs' | 'roas' | 'cpi';
export type StatusFilter = 'all' | 'active' | 'paused' | 'draft' | 'error';
export type OsFilter = 'all' | 'ios' | 'android';
export type PortfolioTab = 'overview' | 'apps' | 'campaigns' | 'watchlist';

export interface AppPerformanceRow {
  key: string;
  project: Project;
  campaigns: Campaign[];
  spend: number;
  installs: number;
  roas: number;
  cpi: number;
  budget: number;
  impressions: number;
  clicks: number;
  ctr: number;
  activeCampaigns: number;
  pausedCampaigns: number;
  draftCampaigns: number;
  errorCampaigns: number;
  shareOfSpend: number;
  momentum: number;
}

export interface CampaignPerformanceRow extends Campaign {
  appName: string;
  appOs: Project['os'];
  ctr: number;
  shareOfSpend: number;
  efficiencyScore: number;
}

export interface NetworkInsight {
  id: string;
  title: string;
  tone: 'blue' | 'green' | 'amber' | 'red';
  body: string;
  meta: string;
}

export const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 100 ? 0 : 2 })}`;

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const formatMultiplier = (value: number) => `${value.toFixed(2)}x`;

export const safeDivide = (top: number, bottom: number) => (bottom > 0 ? top / bottom : 0);

export const buildPortfolioTrend = (campaigns: Campaign[]) => {
  const labels = ['Jun 10', 'Jun 11', 'Jun 12', 'Jun 13', 'Jun 14', 'Jun 15', 'Jun 16'];
  const spend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const installs = campaigns.reduce((sum, c) => sum + c.installs, 0);
  const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const multipliers = [0.72, 0.81, 0.88, 0.94, 0.97, 1.04, 1.09];
  return labels.map((label, index) => ({
    label,
    spend: Math.round(spend * multipliers[index] / 7),
    installs: Math.round(installs * (multipliers[index] + 0.06) / 7),
    clicks: Math.round(clicks * (multipliers[index] + 0.03) / 7),
  }));
};

export const buildMixRows = (apps: AppPerformanceRow[]) => [
  {
    key: 'top-3',
    label: 'Top 3 apps',
    spendShare: apps.slice(0, 3).reduce((sum, row) => sum + row.shareOfSpend, 0),
    appCount: Math.min(3, apps.length),
  },
  {
    key: 'active',
    label: 'Apps with active campaigns',
    spendShare: apps.filter(row => row.activeCampaigns > 0).reduce((sum, row) => sum + row.shareOfSpend, 0),
    appCount: apps.filter(row => row.activeCampaigns > 0).length,
  },
  {
    key: 'draft',
    label: 'Apps carrying draft backlog',
    spendShare: apps.filter(row => row.draftCampaigns > 0).reduce((sum, row) => sum + row.shareOfSpend, 0),
    appCount: apps.filter(row => row.draftCampaigns > 0).length,
  },
];
