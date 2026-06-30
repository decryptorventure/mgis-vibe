// KPI strip: top stat cards + header pills for NetworkPortfolioWorkspace
import React from 'react';
import { Badge } from '@frontend-team/ui-kit';
import { StatCard, PageHeader } from '@/components/ui';
import {
  Activity, BarChart3, FolderKanban, LayoutGrid,
  MousePointerClick, ShieldAlert, Target, TrendingUp, Zap,
} from 'lucide-react';
import { NETWORK_LOGOS } from '@/shared/network-config';
import type { NetworkConfig } from '@/shared/network-config';
import {
  formatCurrency, formatMultiplier, formatPercent,
  type CampaignPerformanceRow,
} from './use-network-portfolio';

interface Props {
  activeNetwork: string;
  config: NetworkConfig;
  portfolioStats: {
    spend: number;
    budget: number;
    installs: number;
    roas: number;
    cpi: number;
    ctr: number;
    impressions: number;
    coverageRate: number;
    connectedApps: number;
    activeCampaigns: number;
    pausedCampaigns: number;
    draftCampaigns: number;
    errorCampaigns: number;
    activeApps: number;
  };
  filteredCampaigns: CampaignPerformanceRow[];
  spendConcentration: number;
}

const Pill: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="radius_8 border border_primary bg_primary px-3 py-2 min-w-[140px]">
    <div className="flex items-center gap-2 text-xs text_tertiary">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-sm font-semibold text_primary mt-1">{value}</div>
  </div>
);

export const NetworkPortfolioKpiStrip: React.FC<Props> = ({
  activeNetwork,
  config,
  portfolioStats,
  filteredCampaigns,
  spendConcentration,
}) => (
  <div className="bg_primary border border_primary radius_8 overflow-hidden">
    <div
      className="px-5 py-5 border-b border_secondary"
      style={{ background: `linear-gradient(135deg, ${config.color}16 0%, rgba(255,255,255,0) 58%)` }}
    >
      <PageHeader
        icon={<img src={NETWORK_LOGOS[activeNetwork]} alt={config.label} className="w-6 h-6 object-contain" />}
        iconBg={config.color}
        title={`${config.label} Report Center`}
        subtitle="Network-level performance view across connected apps and running campaigns. Use this page to compare apps first, then drill into app workspace only when needed."
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
);
