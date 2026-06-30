// Hook: all state, sort, filter, and derived data for NetworkPortfolioWorkspace
// Types + pure utils live in network-portfolio-utils.ts
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockCampaigns, mockProjects } from '@/shared/mock-data';
import { NETWORK_CONFIGS } from '@/shared/network-config';
import { isActiveNetworkKey } from '@/shared/navigation';
import {
  buildMixRows, buildPortfolioTrend, formatCurrency, formatMultiplier, formatPercent, safeDivide,
  type AppPerformanceRow, type CampaignPerformanceRow, type NetworkInsight,
  type OsFilter, type PortfolioTab, type SortMode, type StatusFilter,
} from './network-portfolio-utils';

// Re-export so consumers can import from one location
export type { SortMode, StatusFilter, OsFilter, PortfolioTab, AppPerformanceRow, CampaignPerformanceRow, NetworkInsight };
export { formatCurrency, formatPercent, formatMultiplier, safeDivide, buildPortfolioTrend, buildMixRows };

export function useNetworkPortfolio() {
  const navigate = useNavigate();
  const { networkId } = useParams<{ networkId?: string }>();
  const activeNetwork = isActiveNetworkKey(networkId) ? networkId : null;

  const [searchText, setSearchText] = useState('');
  const [osFilter, setOsFilter] = useState<OsFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('spend');
  const [activeTab, setActiveTab] = useState<PortfolioTab>('overview');

  const config = activeNetwork ? NETWORK_CONFIGS[activeNetwork] : null;

  const networkCampaigns = useMemo(() => {
    if (!activeNetwork) return [];
    return mockCampaigns.filter(c => c.network === activeNetwork);
  }, [activeNetwork]);

  const networkApps = useMemo(() => {
    if (!activeNetwork) return [];
    const totalSpend = networkCampaigns.reduce((sum, c) => sum + c.spend, 0);
    return mockProjects
      .filter(p => p.networks.includes(activeNetwork))
      .map(project => {
        const campaigns = networkCampaigns.filter(c => c.projectId === project.id);
        const spend = campaigns.reduce((sum, c) => sum + c.spend, 0);
        const installs = campaigns.reduce((sum, c) => sum + c.installs, 0);
        const impressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
        const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
        const budget = campaigns.reduce((sum, c) => sum + c.budget, 0);
        const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
        const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED').length;
        const draftCampaigns = campaigns.filter(c => c.status === 'DRAFT').length;
        const errorCampaigns = campaigns.filter(c => c.status === 'ERROR').length;
        const weightedRoas = safeDivide(
          campaigns.reduce((sum, c) => sum + c.roas * Math.max(c.spend, 1), 0),
          campaigns.reduce((sum, c) => sum + Math.max(c.spend, 1), 0),
        );
        return {
          key: project.id, project, campaigns, spend, installs,
          roas: weightedRoas, cpi: safeDivide(spend, installs), budget,
          impressions, clicks, ctr: safeDivide(clicks, impressions) * 100,
          activeCampaigns, pausedCampaigns, draftCampaigns, errorCampaigns,
          shareOfSpend: safeDivide(spend, totalSpend) * 100,
          momentum: weightedRoas * 100 - safeDivide(spend, Math.max(installs, 1)) * 35 + activeCampaigns * 6 - draftCampaigns * 4,
        } satisfies AppPerformanceRow;
      })
      .sort((a, b) => b.spend - a.spend);
  }, [activeNetwork, networkCampaigns]);

  const filteredApps = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const rows = networkApps.filter(row => {
      const matchSearch = !q || row.project.name.toLowerCase().includes(q) || row.project.package.toLowerCase().includes(q) || row.campaigns.some(c => c.name.toLowerCase().includes(q));
      const matchOs = osFilter === 'all' || row.project.os === osFilter;
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'active' && row.activeCampaigns > 0)
        || (statusFilter === 'paused' && row.pausedCampaigns > 0)
        || (statusFilter === 'draft' && row.draftCampaigns > 0)
        || (statusFilter === 'error' && (row.errorCampaigns > 0 || row.project.status === 'Error'));
      return matchSearch && matchOs && matchStatus;
    });
    return [...rows].sort((a, b) => {
      if (sortMode === 'installs') return b.installs - a.installs;
      if (sortMode === 'roas') return b.roas - a.roas;
      if (sortMode === 'cpi') return a.cpi - b.cpi;
      return b.spend - a.spend;
    });
  }, [networkApps, osFilter, searchText, sortMode, statusFilter]);

  const filteredCampaigns = useMemo(() => {
    const totalSpend = networkCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const includedIds = new Set(filteredApps.map(r => r.project.id));
    return networkCampaigns
      .filter(c => includedIds.has(c.projectId))
      .filter(c => {
        if (statusFilter === 'active') return c.status === 'ACTIVE';
        if (statusFilter === 'paused') return c.status === 'PAUSED';
        if (statusFilter === 'draft') return c.status === 'DRAFT';
        if (statusFilter === 'error') return c.status === 'ERROR';
        return true;
      })
      .map(c => {
        const app = mockProjects.find(p => p.id === c.projectId);
        return {
          ...c,
          appName: app?.name ?? c.projectId,
          appOs: app?.os ?? 'ios',
          ctr: safeDivide(c.clicks, c.impressions) * 100,
          shareOfSpend: safeDivide(c.spend, totalSpend) * 100,
          efficiencyScore: c.roas * 100 - c.cpa * 28 + safeDivide(c.clicks, Math.max(c.impressions, 1)) * 100,
        } satisfies CampaignPerformanceRow;
      })
      .sort((a, b) => {
        if (sortMode === 'installs') return b.installs - a.installs;
        if (sortMode === 'roas') return b.roas - a.roas;
        if (sortMode === 'cpi') return a.cpa - b.cpa;
        return b.spend - a.spend;
      });
  }, [filteredApps, networkCampaigns, sortMode, statusFilter]);

  const portfolioStats = useMemo(() => {
    const spend = filteredCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const installs = filteredCampaigns.reduce((sum, c) => sum + c.installs, 0);
    const impressions = filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const clicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const budget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0);
    const activeCampaigns = filteredCampaigns.filter(c => c.status === 'ACTIVE').length;
    const pausedCampaigns = filteredCampaigns.filter(c => c.status === 'PAUSED').length;
    const draftCampaigns = filteredCampaigns.filter(c => c.status === 'DRAFT').length;
    const errorCampaigns = filteredCampaigns.filter(c => c.status === 'ERROR').length;
    const roas = safeDivide(
      filteredCampaigns.reduce((sum, c) => sum + c.roas * Math.max(c.spend, 1), 0),
      filteredCampaigns.reduce((sum, c) => sum + Math.max(c.spend, 1), 0),
    );
    return {
      spend, installs, impressions, clicks, budget, roas,
      cpi: safeDivide(spend, installs), ctr: safeDivide(clicks, impressions) * 100,
      activeCampaigns, pausedCampaigns, draftCampaigns, errorCampaigns,
      connectedApps: filteredApps.length,
      activeApps: filteredApps.filter(r => r.activeCampaigns > 0).length,
      coverageRate: safeDivide(filteredApps.filter(r => r.activeCampaigns > 0).length, Math.max(filteredApps.length, 1)) * 100,
    };
  }, [filteredApps, filteredCampaigns]);

  const trendData = useMemo(() => buildPortfolioTrend(filteredCampaigns), [filteredCampaigns]);
  const mixRows = useMemo(() => buildMixRows(filteredApps), [filteredApps]);
  const topApps = filteredApps.slice(0, 5);
  const topCampaigns = filteredCampaigns.slice(0, 5);
  const topApp = filteredApps[0];
  const scaleCandidate = [...filteredApps].sort((a, b) => b.momentum - a.momentum)[0];
  const riskCampaign = [...filteredCampaigns].sort((a, b) => b.cpa - a.cpa)[0];
  const draftHeavyApp = [...filteredApps].sort((a, b) => b.draftCampaigns - a.draftCampaigns)[0];
  const spendConcentration = topApps.slice(0, 3).reduce((sum, r) => sum + r.shareOfSpend, 0);

  const insightCards = useMemo<NetworkInsight[]>(() => {
    const cards: NetworkInsight[] = [];
    if (topApp) cards.push({ id: 'top-earner', title: 'Top earner', tone: 'green', body: `${topApp.project.name} is leading ${config?.label ?? 'this network'} with ${formatCurrency(topApp.spend)} spend and ${topApp.installs.toLocaleString()} installs.`, meta: `${topApp.activeCampaigns} active campaigns | ${formatMultiplier(topApp.roas)} ROAS` });
    if (scaleCandidate) cards.push({ id: 'scale-candidate', title: 'Scale candidate', tone: 'blue', body: `${scaleCandidate.project.name} has the cleanest blended efficiency profile and is the strongest candidate for incremental budget.`, meta: `CPI ${formatCurrency(scaleCandidate.cpi)} | ${formatPercent(scaleCandidate.ctr)} CTR` });
    if (riskCampaign) cards.push({ id: 'risk-campaign', title: 'Cost risk', tone: 'amber', body: `${riskCampaign.name} is the most expensive campaign in the current slice and should be reviewed before further scaling.`, meta: `${formatCurrency(riskCampaign.cpa)} CPI | ${formatMultiplier(riskCampaign.roas)} ROAS` });
    if (draftHeavyApp && draftHeavyApp.draftCampaigns > 0) cards.push({ id: 'draft-backlog', title: 'Draft backlog', tone: 'red', body: `${draftHeavyApp.project.name} carries the largest draft queue in this network view.`, meta: `${draftHeavyApp.draftCampaigns} draft campaigns awaiting review` });
    return cards;
  }, [config?.label, draftHeavyApp, riskCampaign, scaleCandidate, topApp]);

  return {
    navigate, activeNetwork, config,
    searchText, setSearchText, osFilter, setOsFilter,
    statusFilter, setStatusFilter, sortMode, setSortMode,
    activeTab, setActiveTab,
    filteredApps, filteredCampaigns, portfolioStats,
    trendData, mixRows, topApps, topCampaigns,
    topApp, scaleCandidate, riskCampaign, draftHeavyApp,
    spendConcentration, insightCards,
  };
}
