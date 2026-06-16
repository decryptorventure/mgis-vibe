import React, { useMemo, useState } from 'react';
import { Alert, Input, Select, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CircleAlert,
  FolderKanban,
  LayoutGrid,
  MousePointerClick,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, cn } from '@frontend-team/ui-kit';
import { DataTable, PageHeader, StatCard } from '@/components/ui';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { mockCampaigns, mockProjects, type Campaign, type Project } from '@/shared/mock-data';
import { NETWORK_CONFIGS, NETWORK_LOGOS } from '@/shared/network-config';
import { getAppNetworkPath, isActiveNetworkKey } from '@/shared/navigation';

type SortMode = 'spend' | 'installs' | 'roas' | 'cpi';
type StatusFilter = 'all' | 'active' | 'paused' | 'draft' | 'error';
type OsFilter = 'all' | 'ios' | 'android';
type PortfolioTab = 'overview' | 'apps' | 'campaigns' | 'watchlist';

interface AppPerformanceRow {
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

interface CampaignPerformanceRow extends Campaign {
  appName: string;
  appOs: Project['os'];
  ctr: number;
  shareOfSpend: number;
  efficiencyScore: number;
}

interface NetworkInsight {
  id: string;
  title: string;
  tone: 'blue' | 'green' | 'amber' | 'red';
  body: string;
  meta: string;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 100 ? 0 : 2 })}`;

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatMultiplier = (value: number) => `${value.toFixed(2)}x`;

const safeDivide = (top: number, bottom: number) => (bottom > 0 ? top / bottom : 0);

const buildPortfolioTrend = (campaigns: Campaign[]) => {
  const labels = ['Jun 10', 'Jun 11', 'Jun 12', 'Jun 13', 'Jun 14', 'Jun 15', 'Jun 16'];
  const spend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const installs = campaigns.reduce((sum, campaign) => sum + campaign.installs, 0);
  const clicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const multipliers = [0.72, 0.81, 0.88, 0.94, 0.97, 1.04, 1.09];

  return labels.map((label, index) => ({
    label,
    spend: Math.round(spend * multipliers[index] / 7),
    installs: Math.round(installs * (multipliers[index] + 0.06) / 7),
    clicks: Math.round(clicks * (multipliers[index] + 0.03) / 7),
  }));
};

const buildMixRows = (apps: AppPerformanceRow[]) => [
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

const InsightCard: React.FC<NetworkInsight> = ({ title, tone, body, meta }) => {
  const toneClass = {
    blue: 'bg_blue_subtle border_blue',
    green: 'bg_emerald_subtle border_emerald',
    amber: 'bg_amber_subtle border_amber',
    red: 'bg_red_subtle border_red',
  }[tone];

  return (
    <Card className={cn('radius_8 border p-4', toneClass)}>
      <div className="text-sm font-semibold text_primary">{title}</div>
      <div className="text-xs text_secondary mt-2 leading-5">{body}</div>
      <div className="text-[11px] font-semibold text_tertiary mt-3 uppercase tracking-wide">{meta}</div>
    </Card>
  );
};

const Pill: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="radius_8 border border_primary bg_primary px-3 py-2 min-w-[140px]">
    <div className="flex items-center gap-2 text-xs text_tertiary">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-sm font-semibold text_primary mt-1">{value}</div>
  </div>
);

export const NetworkPortfolioWorkspace: React.FC = () => {
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
    return mockCampaigns.filter(campaign => campaign.network === activeNetwork);
  }, [activeNetwork]);

  const networkApps = useMemo(() => {
    if (!activeNetwork) return [];

    const totalSpend = networkCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);

    return mockProjects
      .filter(project => project.networks.includes(activeNetwork))
      .map(project => {
        const campaigns = networkCampaigns.filter(campaign => campaign.projectId === project.id);
        const spend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
        const installs = campaigns.reduce((sum, campaign) => sum + campaign.installs, 0);
        const impressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
        const clicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
        const budget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
        const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ACTIVE').length;
        const pausedCampaigns = campaigns.filter(campaign => campaign.status === 'PAUSED').length;
        const draftCampaigns = campaigns.filter(campaign => campaign.status === 'DRAFT').length;
        const errorCampaigns = campaigns.filter(campaign => campaign.status === 'ERROR').length;
        const weightedRoas = safeDivide(
          campaigns.reduce((sum, campaign) => sum + campaign.roas * Math.max(campaign.spend, 1), 0),
          campaigns.reduce((sum, campaign) => sum + Math.max(campaign.spend, 1), 0),
        );

        return {
          key: project.id,
          project,
          campaigns,
          spend,
          installs,
          roas: weightedRoas,
          cpi: safeDivide(spend, installs),
          budget,
          impressions,
          clicks,
          ctr: safeDivide(clicks, impressions) * 100,
          activeCampaigns,
          pausedCampaigns,
          draftCampaigns,
          errorCampaigns,
          shareOfSpend: safeDivide(spend, totalSpend) * 100,
          momentum: weightedRoas * 100 - safeDivide(spend, Math.max(installs, 1)) * 35 + activeCampaigns * 6 - draftCampaigns * 4,
        } satisfies AppPerformanceRow;
      })
      .sort((a, b) => b.spend - a.spend);
  }, [activeNetwork, networkCampaigns]);

  const filteredApps = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const rows = networkApps.filter(row => {
      const matchesSearch = !normalizedSearch
        || row.project.name.toLowerCase().includes(normalizedSearch)
        || row.project.package.toLowerCase().includes(normalizedSearch)
        || row.campaigns.some(campaign => campaign.name.toLowerCase().includes(normalizedSearch));
      const matchesOs = osFilter === 'all' || row.project.os === osFilter;
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && row.activeCampaigns > 0)
        || (statusFilter === 'paused' && row.pausedCampaigns > 0)
        || (statusFilter === 'draft' && row.draftCampaigns > 0)
        || (statusFilter === 'error' && (row.errorCampaigns > 0 || row.project.status === 'Error'));

      return matchesSearch && matchesOs && matchesStatus;
    });

    const sorted = [...rows];
    sorted.sort((a, b) => {
      if (sortMode === 'installs') return b.installs - a.installs;
      if (sortMode === 'roas') return b.roas - a.roas;
      if (sortMode === 'cpi') return a.cpi - b.cpi;
      return b.spend - a.spend;
    });
    return sorted;
  }, [networkApps, osFilter, searchText, sortMode, statusFilter]);

  const filteredCampaigns = useMemo(() => {
    const totalSpend = networkCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
    const includedAppIds = new Set(filteredApps.map(row => row.project.id));

    return networkCampaigns
      .filter(campaign => includedAppIds.has(campaign.projectId))
      .filter(campaign => {
        if (statusFilter === 'active') return campaign.status === 'ACTIVE';
        if (statusFilter === 'paused') return campaign.status === 'PAUSED';
        if (statusFilter === 'draft') return campaign.status === 'DRAFT';
        if (statusFilter === 'error') return campaign.status === 'ERROR';
        return true;
      })
      .map(campaign => {
        const app = mockProjects.find(project => project.id === campaign.projectId);
        return {
          ...campaign,
          appName: app?.name ?? campaign.projectId,
          appOs: app?.os ?? 'ios',
          ctr: safeDivide(campaign.clicks, campaign.impressions) * 100,
          shareOfSpend: safeDivide(campaign.spend, totalSpend) * 100,
          efficiencyScore: campaign.roas * 100 - campaign.cpa * 28 + safeDivide(campaign.clicks, Math.max(campaign.impressions, 1)) * 100,
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
    const spend = filteredCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
    const installs = filteredCampaigns.reduce((sum, campaign) => sum + campaign.installs, 0);
    const impressions = filteredCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
    const clicks = filteredCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const budget = filteredCampaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
    const activeCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'ACTIVE').length;
    const pausedCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'PAUSED').length;
    const draftCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'DRAFT').length;
    const errorCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'ERROR').length;
    const roas = safeDivide(
      filteredCampaigns.reduce((sum, campaign) => sum + campaign.roas * Math.max(campaign.spend, 1), 0),
      filteredCampaigns.reduce((sum, campaign) => sum + Math.max(campaign.spend, 1), 0),
    );

    return {
      spend,
      installs,
      impressions,
      clicks,
      budget,
      roas,
      cpi: safeDivide(spend, installs),
      ctr: safeDivide(clicks, impressions) * 100,
      activeCampaigns,
      pausedCampaigns,
      draftCampaigns,
      errorCampaigns,
      connectedApps: filteredApps.length,
      activeApps: filteredApps.filter(row => row.activeCampaigns > 0).length,
      coverageRate: safeDivide(filteredApps.filter(row => row.activeCampaigns > 0).length, Math.max(filteredApps.length, 1)) * 100,
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
  const spendConcentration = topApps.slice(0, 3).reduce((sum, row) => sum + row.shareOfSpend, 0);

  const insightCards = useMemo<NetworkInsight[]>(() => {
    const cards: NetworkInsight[] = [];

    if (topApp) {
      cards.push({
        id: 'top-earner',
        title: 'Top earner',
        tone: 'green',
        body: `${topApp.project.name} is leading ${config?.label ?? 'this network'} with ${formatCurrency(topApp.spend)} spend and ${topApp.installs.toLocaleString()} installs.`,
        meta: `${topApp.activeCampaigns} active campaigns | ${formatMultiplier(topApp.roas)} ROAS`,
      });
    }

    if (scaleCandidate) {
      cards.push({
        id: 'scale-candidate',
        title: 'Scale candidate',
        tone: 'blue',
        body: `${scaleCandidate.project.name} has the cleanest blended efficiency profile and is the strongest candidate for incremental budget.`,
        meta: `CPI ${formatCurrency(scaleCandidate.cpi)} | ${formatPercent(scaleCandidate.ctr)} CTR`,
      });
    }

    if (riskCampaign) {
      cards.push({
        id: 'risk-campaign',
        title: 'Cost risk',
        tone: 'amber',
        body: `${riskCampaign.name} is the most expensive campaign in the current slice and should be reviewed before further scaling.`,
        meta: `${formatCurrency(riskCampaign.cpa)} CPI | ${formatMultiplier(riskCampaign.roas)} ROAS`,
      });
    }

    if (draftHeavyApp && draftHeavyApp.draftCampaigns > 0) {
      cards.push({
        id: 'draft-backlog',
        title: 'Draft backlog',
        tone: 'red',
        body: `${draftHeavyApp.project.name} carries the largest draft queue in this network view.`,
        meta: `${draftHeavyApp.draftCampaigns} draft campaigns awaiting review`,
      });
    }

    return cards;
  }, [config?.label, draftHeavyApp, riskCampaign, scaleCandidate, topApp]);

  if (!activeNetwork || !config) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unsupported network"
        description={`Route ${networkId ?? 'unknown'} is not mapped to a network report.`}
      />
    );
  }

  const appColumns: ColumnsType<AppPerformanceRow> = [
    {
      title: 'App',
      key: 'app',
      width: 280,
      fixed: 'left',
      render: (_value, row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 radius_8 bg_secondary border border_secondary flex items-center justify-center text-xs font-bold text_primary">
              {row.project.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text_primary truncate">{row.project.name}</div>
              <div className="text-xs text_tertiary truncate">{row.project.package}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'State',
      key: 'state',
      width: 150,
      render: (_value, row) => (
        <div className="space-y-1">
          <StatusBadge label={row.project.status} variant={statusToVariant(row.project.status)} />
          <div className="text-xs text_tertiary">{row.project.os.toUpperCase()}</div>
        </div>
      ),
    },
    {
      title: 'Campaign Mix',
      key: 'campaignMix',
      width: 180,
      render: (_value, row) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text_secondary">Active</span>
            <span className="font-semibold text_primary">{row.activeCampaigns}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text_secondary">Draft</span>
            <span className="font-semibold text_primary">{row.draftCampaigns}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text_secondary">Paused</span>
            <span className="font-semibold text_primary">{row.pausedCampaigns}</span>
          </div>
        </div>
      ),
    },
    { title: 'Spend', key: 'spend', width: 120, render: (_value, row) => formatCurrency(row.spend) },
    { title: 'Installs', key: 'installs', width: 120, render: (_value, row) => row.installs.toLocaleString() },
    { title: 'ROAS', key: 'roas', width: 100, render: (_value, row) => formatMultiplier(row.roas) },
    { title: 'CPI', key: 'cpi', width: 100, render: (_value, row) => formatCurrency(row.cpi) },
    { title: 'CTR', key: 'ctr', width: 100, render: (_value, row) => formatPercent(row.ctr) },
    { title: 'Impressions', key: 'impressions', width: 140, render: (_value, row) => row.impressions.toLocaleString() },
    {
      title: 'Share of Spend',
      key: 'share',
      width: 160,
      render: (_value, row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text_secondary">Share</span>
            <span className="font-semibold text_primary">{formatPercent(row.shareOfSpend)}</span>
          </div>
          <div className="h-2 radius_round bg_secondary overflow-hidden">
            <div className="h-full radius_round" style={{ width: `${Math.min(100, row.shareOfSpend)}%`, background: config.color }} />
          </div>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 190,
      fixed: 'right',
      render: (_value, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="border" size="s" onClick={() => navigate(`/apps/${row.project.id}/dashboard`)}>
            App
          </Button>
          <Button type="button" variant="primary" size="s" onClick={() => navigate(getAppNetworkPath(row.project.id, activeNetwork))}>
            Open workspace
          </Button>
        </div>
      ),
    },
  ];

  const campaignColumns: ColumnsType<CampaignPerformanceRow> = [
    {
      title: 'Campaign',
      key: 'campaign',
      width: 320,
      fixed: 'left',
      render: (_value, campaign) => (
        <div className="min-w-0">
          <div className="text-sm font-semibold text_primary truncate">{campaign.name}</div>
          <div className="text-xs text_tertiary truncate">{campaign.appName}</div>
        </div>
      ),
    },
    { title: 'Status', key: 'status', width: 120, render: (_value, campaign) => <StatusBadge label={campaign.status} variant={statusToVariant(campaign.status)} /> },
    {
      title: 'App',
      key: 'app',
      width: 180,
      render: (_value, campaign) => (
        <div>
          <div className="text-sm font-medium text_primary">{campaign.appName}</div>
          <div className="text-xs text_tertiary">{campaign.appOs.toUpperCase()}</div>
        </div>
      ),
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 110 },
    { title: 'Budget', key: 'budget', width: 120, render: (_value, campaign) => formatCurrency(campaign.budget) },
    { title: 'Spend', key: 'spend', width: 120, render: (_value, campaign) => formatCurrency(campaign.spend) },
    { title: 'Installs', key: 'installs', width: 120, render: (_value, campaign) => campaign.installs.toLocaleString() },
    { title: 'ROAS', key: 'roas', width: 100, render: (_value, campaign) => formatMultiplier(campaign.roas) },
    { title: 'CPI', key: 'cpa', width: 100, render: (_value, campaign) => formatCurrency(campaign.cpa) },
    { title: 'CTR', key: 'ctr', width: 100, render: (_value, campaign) => formatPercent(campaign.ctr) },
    { title: 'Impressions', key: 'impressions', width: 140, render: (_value, campaign) => campaign.impressions.toLocaleString() },
    {
      title: 'Spend Share',
      key: 'share',
      width: 130,
      render: (_value, campaign) => <span className="text-sm font-semibold text_primary">{formatPercent(campaign.shareOfSpend)}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_value, campaign) => (
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="border" size="s" onClick={() => navigate(`/apps/${campaign.projectId}/dashboard`)}>
            App
          </Button>
          <Button type="button" variant="primary" size="s" onClick={() => navigate(getAppNetworkPath(campaign.projectId, activeNetwork))}>
            Open workspace
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <div
          className="px-5 py-5 border-b border_secondary"
          style={{
            background: `linear-gradient(135deg, ${config.color}16 0%, rgba(255,255,255,0) 58%)`,
          }}
        >
          <PageHeader
            icon={<img src={NETWORK_LOGOS[activeNetwork]} alt={config.label} className="w-6 h-6 object-contain" />}
            iconBg={config.color}
            title={`${config.label} Report Center`}
            subtitle={`Network-level performance view across connected apps and running campaigns. Use this page to compare apps first, then drill into app workspace only when needed.`}
            actions={(
              <>
                <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2.5 py-1">
                  {portfolioStats.connectedApps} apps
                </Badge>
                <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2.5 py-1">
                  {filteredCampaigns.length} campaigns
                </Badge>
                <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2.5 py-1">
                  {portfolioStats.activeCampaigns} active
                </Badge>
              </>
            )}
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <Pill icon={<LayoutGrid size={14} className="icon_secondary" />} label="Coverage" value={`${portfolioStats.activeApps}/${portfolioStats.connectedApps} apps live`} />
            <Pill icon={<FolderKanban size={14} className="icon_secondary" />} label="Draft backlog" value={`${portfolioStats.draftCampaigns} draft campaigns`} />
            <Pill icon={<BarChart3 size={14} className="icon_secondary" />} label="Spend concentration" value={formatPercent(spendConcentration)} />
            <Pill icon={<ShieldAlert size={14} className="icon_secondary" />} label="Error campaigns" value={portfolioStats.errorCampaigns.toString()} />
          </div>
        </div>

        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
          <StatCard title="Spend" value={formatCurrency(portfolioStats.spend)} variant="info" icon={<Activity size={16} />} />
          <StatCard title="Budget" value={formatCurrency(portfolioStats.budget)} variant="default" icon={<Target size={16} />} />
          <StatCard title="Installs" value={portfolioStats.installs.toLocaleString()} variant="success" icon={<TrendingUp size={16} />} />
          <StatCard title="ROAS" value={formatMultiplier(portfolioStats.roas)} variant="primary" icon={<Zap size={16} />} />
          <StatCard title="CPI" value={formatCurrency(portfolioStats.cpi)} variant="warning" icon={<Target size={16} />} />
          <StatCard title="CTR" value={formatPercent(portfolioStats.ctr)} variant="default" icon={<MousePointerClick size={16} />} />
          <StatCard title="Impressions" value={portfolioStats.impressions.toLocaleString()} variant="default" icon={<BarChart3 size={16} />} />
          <StatCard title="Coverage" value={formatPercent(portfolioStats.coverageRate)} variant="default" icon={<LayoutGrid size={16} />} />
        </div>
      </div>

      <div className="radius_8 border border_primary bg_primary px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="text-xs font-semibold uppercase text_tertiary">Portfolio filters</div>
        <Input
          size="small"
          prefix={<Search size={14} className="text_tertiary" />}
          placeholder="Search app, package, or campaign"
          value={searchText}
          onChange={event => setSearchText(event.target.value)}
          className="w-80"
          allowClear
        />
        <Select
          size="small"
          className="w-28"
          value={osFilter}
          onChange={value => setOsFilter(value)}
          options={[
            { value: 'all', label: 'All OS' },
            { value: 'ios', label: 'iOS' },
            { value: 'android', label: 'Android' },
          ]}
        />
        <Select
          size="small"
          className="w-36"
          value={statusFilter}
          onChange={value => setStatusFilter(value)}
          options={[
            { value: 'all', label: 'All states' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
            { value: 'draft', label: 'Draft' },
            { value: 'error', label: 'Error' },
          ]}
        />
        <Select
          size="small"
          className="w-36"
          value={sortMode}
          onChange={value => setSortMode(value)}
          options={[
            { value: 'spend', label: 'Sort by spend' },
            { value: 'installs', label: 'Sort by installs' },
            { value: 'roas', label: 'Sort by ROAS' },
            { value: 'cpi', label: 'Sort by CPI' },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="border" size="s" onClick={() => setActiveTab('apps')}>
            Review apps
          </Button>
          <Button
            type="button"
            variant="border"
            size="s"
            onClick={() => {
              setSearchText('');
              setOsFilter('all');
              setStatusFilter('all');
              setSortMode('spend');
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as PortfolioTab)}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <div className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-5">
                  <Card className="radius_8 border border_primary p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold text_primary">Network performance trend</div>
                        <div className="text-xs text_tertiary mt-1">Built as a portfolio-first reporting surface, following patterns common in large ad platforms: network summary first, then app and campaign drilldown.</div>
                      </div>
                      <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">
                        Last 7 days
                      </Badge>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                          <defs>
                            <linearGradient id="networkSpend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
                              <stop offset="95%" stopColor={config.color} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip
                            formatter={(value: number, name: string) => [
                              name === 'spend' ? formatCurrency(value) : value.toLocaleString(),
                              name === 'spend' ? 'Spend' : name === 'installs' ? 'Installs' : 'Clicks',
                            ]}
                          />
                          <Area type="monotone" dataKey="spend" stroke={config.color} fill="url(#networkSpend)" strokeWidth={2.6} />
                          <Area type="monotone" dataKey="installs" stroke={`${config.color}99`} fill="transparent" strokeWidth={2} />
                          <Area type="monotone" dataKey="clicks" stroke={`${config.color}66`} fill="transparent" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary mb-1">Network mix</div>
                    <div className="text-xs text_tertiary mb-4">How much of this network is concentrated in a few apps or stuck in draft review.</div>
                    <div className="space-y-4">
                      {mixRows.map(row => (
                        <div key={row.key} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text_primary font-medium">{row.label}</span>
                            <span className="text_secondary">{row.appCount} apps | {formatPercent(row.spendShare)}</span>
                          </div>
                          <div className="h-2.5 radius_round bg_secondary overflow-hidden">
                            <div className="h-full radius_round" style={{ width: `${Math.min(100, row.spendShare)}%`, background: config.color }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="radius_8 border border_primary bg_secondary px-3 py-3">
                        <div className="text-xs text_tertiary">Active campaigns</div>
                        <div className="text-lg font-semibold text_primary mt-1">{portfolioStats.activeCampaigns}</div>
                      </div>
                      <div className="radius_8 border border_primary bg_secondary px-3 py-3">
                        <div className="text-xs text_tertiary">Paused campaigns</div>
                        <div className="text-lg font-semibold text_primary mt-1">{portfolioStats.pausedCampaigns}</div>
                      </div>
                      <div className="radius_8 border border_primary bg_secondary px-3 py-3">
                        <div className="text-xs text_tertiary">Draft campaigns</div>
                        <div className="text-lg font-semibold text_primary mt-1">{portfolioStats.draftCampaigns}</div>
                      </div>
                      <div className="radius_8 border border_primary bg_secondary px-3 py-3">
                        <div className="text-xs text_tertiary">Error campaigns</div>
                        <div className="text-lg font-semibold text_primary mt-1">{portfolioStats.errorCampaigns}</div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
                  <Card className="radius_8 border border_primary p-0 overflow-hidden">
                    <div className="px-5 py-4 border-b border_secondary flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text_primary">App leaderboard</div>
                        <div className="text-xs text_tertiary mt-1">The first stop before opening any app workspace.</div>
                      </div>
                      <Button type="button" variant="border" size="s" onClick={() => setActiveTab('apps')}>
                        Open app table
                      </Button>
                    </div>
                    <div className="p-5 space-y-3">
                      {topApps.map((row, index) => (
                        <div key={row.key} className="border border_primary radius_8 p-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 radius_round flex items-center justify-center text-xs font-bold fg_on_accent"
                              style={{ background: index === 0 ? config.color : 'var(--ds-bg-secondary)' }}
                            >
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text_primary truncate">{row.project.name}</div>
                              <div className="text-xs text_tertiary truncate">
                                {row.activeCampaigns} active | {formatCurrency(row.spend)} spend | {row.installs.toLocaleString()} installs
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">
                              {formatMultiplier(row.roas)} ROAS
                            </Badge>
                            <Button type="button" variant="primary" size="s" onClick={() => navigate(getAppNetworkPath(row.project.id, activeNetwork))}>
                              Drill in
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="space-y-4">
                    {insightCards.map(card => (
                      <InsightCard key={card.id} {...card} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-5">
                  <Card className="radius_8 border border_primary p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 size={16} className="icon_secondary" />
                      <div>
                        <div className="text-sm font-semibold text_primary">Campaign leaderboard</div>
                        <div className="text-xs text_tertiary mt-1">Fast network-wide scan of the heaviest campaigns.</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {topCampaigns.map(campaign => (
                        <button
                          key={campaign.id}
                          type="button"
                          onClick={() => navigate(getAppNetworkPath(campaign.projectId, activeNetwork))}
                          className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text_primary truncate">{campaign.name}</div>
                              <div className="text-xs text_tertiary truncate">{campaign.appName}</div>
                            </div>
                            <StatusBadge label={campaign.status} variant={statusToVariant(campaign.status)} />
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text_secondary">
                            <span>{formatCurrency(campaign.spend)} spend</span>
                            <span>{campaign.installs.toLocaleString()} installs</span>
                            <span>{formatMultiplier(campaign.roas)} ROAS</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary mb-1">Spend by top apps</div>
                    <div className="text-xs text_tertiary mb-4">Which apps are carrying most of the network budget right now.</div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topApps.map(row => ({ name: row.project.name, shortName: row.project.name.slice(0, 12), spend: row.spend }))} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.18)" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="shortName" type="category" width={110} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="spend" radius={[0, 8, 8, 0]}>
                            {topApps.map((row, index) => (
                              <Cell key={row.key} fill={index === 0 ? config.color : `${config.color}${index === 1 ? 'B0' : '78'}`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            ),
          },
          {
            key: 'apps',
            label: `Apps (${filteredApps.length})`,
            children: (
              <div className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary">Best scale opportunity</div>
                    <div className="text-xs text_tertiary mt-1">App with the healthiest blended momentum in this slice.</div>
                    {scaleCandidate ? (
                      <div className="mt-4">
                        <div className="text-base font-semibold text_primary">{scaleCandidate.project.name}</div>
                        <div className="text-sm text_secondary mt-1">{formatCurrency(scaleCandidate.spend)} spend | {scaleCandidate.installs.toLocaleString()} installs</div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">
                            {formatMultiplier(scaleCandidate.roas)} ROAS
                          </Badge>
                          <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">
                            {formatCurrency(scaleCandidate.cpi)} CPI
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text_secondary mt-4">No app available in this slice.</div>
                    )}
                  </Card>

                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary">Most concentrated app</div>
                    <div className="text-xs text_tertiary mt-1">Useful for detecting network dependency on a single app.</div>
                    {topApp ? (
                      <div className="mt-4">
                        <div className="text-base font-semibold text_primary">{topApp.project.name}</div>
                        <div className="text-sm text_secondary mt-1">{formatPercent(topApp.shareOfSpend)} of spend share</div>
                        <div className="h-2.5 radius_round bg_secondary overflow-hidden mt-3">
                          <div className="h-full radius_round" style={{ width: `${Math.min(100, topApp.shareOfSpend)}%`, background: config.color }} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text_secondary mt-4">No app available in this slice.</div>
                    )}
                  </Card>

                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary">Backlog pressure</div>
                    <div className="text-xs text_tertiary mt-1">App carrying the most drafts in this network.</div>
                    {draftHeavyApp ? (
                      <div className="mt-4">
                        <div className="text-base font-semibold text_primary">{draftHeavyApp.project.name}</div>
                        <div className="text-sm text_secondary mt-1">{draftHeavyApp.draftCampaigns} draft campaigns</div>
                        <div className="text-xs text_tertiary mt-3">Review drafts before using this route for performance readouts.</div>
                      </div>
                    ) : (
                      <div className="text-sm text_secondary mt-4">No draft signal available.</div>
                    )}
                  </Card>
                </div>

                <DataTable<AppPerformanceRow>
                  panel
                  rowKey="key"
                  columns={appColumns}
                  dataSource={filteredApps}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 'max-content', y: 560 }}
                  emptyTitle="No apps in this network slice"
                  emptyDescription="Try clearing filters or connect more apps to this adnetwork."
                />
              </div>
            ),
          },
          {
            key: 'campaigns',
            label: `Campaigns (${filteredCampaigns.length})`,
            children: (
              <div className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary">Largest active campaign</div>
                    <div className="text-xs text_tertiary mt-1">The campaign currently carrying the most spend.</div>
                    {topCampaigns[0] ? (
                      <div className="mt-4">
                        <div className="text-base font-semibold text_primary">{topCampaigns[0].name}</div>
                        <div className="text-sm text_secondary mt-1">{topCampaigns[0].appName}</div>
                        <div className="text-xs text_tertiary mt-3">{formatCurrency(topCampaigns[0].spend)} spend | {formatMultiplier(topCampaigns[0].roas)} ROAS</div>
                      </div>
                    ) : (
                      <div className="text-sm text_secondary mt-4">No campaign available.</div>
                    )}
                  </Card>

                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary">Draft backlog</div>
                    <div className="text-xs text_tertiary mt-1">Drafts that should not dilute live reporting.</div>
                    <div className="mt-4 text-3xl font-semibold text_primary">{portfolioStats.draftCampaigns}</div>
                    <div className="text-xs text_tertiary mt-2">Campaigns still pending review or publish.</div>
                  </Card>

                  <Card className="radius_8 border border_primary p-5">
                    <div className="text-sm font-semibold text_primary">Error pressure</div>
                    <div className="text-xs text_tertiary mt-1">Signals that need operational follow-up.</div>
                    <div className="mt-4 text-3xl font-semibold text_primary">{portfolioStats.errorCampaigns}</div>
                    <div className="text-xs text_tertiary mt-2">Campaigns currently failing or blocked.</div>
                  </Card>
                </div>

                <DataTable<CampaignPerformanceRow>
                  panel
                  rowKey="id"
                  columns={campaignColumns}
                  dataSource={filteredCampaigns}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content', y: 560 }}
                  emptyTitle="No campaigns in this slice"
                  emptyDescription="No campaign matches the current network filters."
                />
              </div>
            ),
          },
          {
            key: 'watchlist',
            label: 'Watchlist',
            children: (
              <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
                <Card className="radius_8 border border_primary p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="icon_secondary" />
                    <div>
                      <div className="text-sm font-semibold text_primary">Recommended next actions</div>
                      <div className="text-xs text_tertiary mt-1">Designed for a network manager deciding where to drill next.</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {topApp && (
                      <button
                        type="button"
                        className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer"
                        onClick={() => navigate(getAppNetworkPath(topApp.project.id, activeNetwork))}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text_primary">Open top app workspace</div>
                            <div className="text-xs text_tertiary mt-1">{topApp.project.name} is carrying the most spend in this network.</div>
                          </div>
                          <ArrowRight size={16} className="icon_secondary" />
                        </div>
                      </button>
                    )}

                    {riskCampaign && (
                      <button
                        type="button"
                        className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer"
                        onClick={() => setActiveTab('campaigns')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text_primary">Review cost risk campaigns</div>
                            <div className="text-xs text_tertiary mt-1">{riskCampaign.name} is the current highest-CPI signal.</div>
                          </div>
                          <ArrowRight size={16} className="icon_secondary" />
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer"
                      onClick={() => navigate('/network-rules')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text_primary">Check automation guardrails</div>
                          <div className="text-xs text_tertiary mt-1">Review rules if the network is scaling unevenly or carrying too many drafts.</div>
                        </div>
                        <ArrowRight size={16} className="icon_secondary" />
                      </div>
                    </button>
                  </div>
                </Card>

                <div className="space-y-4">
                  <InsightCard
                    id="coverage"
                    title="Coverage signal"
                    tone={portfolioStats.coverageRate >= 60 ? 'green' : 'amber'}
                    body={`Only ${portfolioStats.activeApps} of ${portfolioStats.connectedApps} connected apps currently have active campaigns in this network slice.`}
                    meta={`${formatPercent(portfolioStats.coverageRate)} app coverage`}
                  />
                  <InsightCard
                    id="concentration"
                    title="Concentration signal"
                    tone={spendConcentration >= 70 ? 'amber' : 'blue'}
                    body={`Top 3 apps are carrying ${formatPercent(spendConcentration)} of spend. High concentration is efficient only if those apps remain healthy.`}
                    meta="Portfolio dependency"
                  />
                  <InsightCard
                    id="drafts"
                    title="Draft hygiene"
                    tone={portfolioStats.draftCampaigns > 0 ? 'red' : 'green'}
                    body={portfolioStats.draftCampaigns > 0
                      ? `There are ${portfolioStats.draftCampaigns} draft campaigns in this network. Separate draft review from live performance monitoring.`
                      : 'No draft backlog is currently diluting the network-level readout.'}
                    meta="Operational quality"
                  />

                  <Card className="radius_8 border border_primary p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CircleAlert size={16} className="icon_secondary" />
                      <div>
                        <div className="text-sm font-semibold text_primary">How this page should be used</div>
                        <div className="text-xs text_tertiary mt-1">This route is intentionally not the app workspace.</div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text_secondary leading-6">
                      <div>1. Start with network-wide spend, ROAS, CPI, coverage, and concentration.</div>
                      <div>2. Compare apps inside the network before deciding where to drill in.</div>
                      <div>3. Review campaign-level cost risk and draft backlog separately.</div>
                      <div>4. Open app workspace only after the portfolio view has already narrowed the problem.</div>
                    </div>
                  </Card>
                </div>
              </div>
            ),
          },
        ]}
      />

      {portfolioStats.errorCampaigns > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle size={16} />}
          message={`${portfolioStats.errorCampaigns} campaign(s) in ${config.label} need attention`}
          description="Use the Campaigns tab to isolate error rows, then open the corresponding app workspace for detailed remediation."
        />
      )}
    </div>
  );
};

export default NetworkPortfolioWorkspace;
