// Main tabbed table: delegates Overview + Apps tabs; renders Campaigns + Watchlist inline
import React from 'react';
import { Tabs } from '@/components/ui-kit-compat';
import { Card, cn } from '@frontend-team/ui-kit';
import { ArrowRight, CircleAlert, Sparkles } from 'lucide-react';
import type { NetworkConfig } from '@/shared/network-config';
import {
  formatPercent,
  type AppPerformanceRow, type CampaignPerformanceRow, type NetworkInsight,
} from './use-network-portfolio';
import { NetworkPortfolioOverviewTab } from './network-portfolio-overview-tab';
import { NetworkPortfolioAppsTab } from './network-portfolio-apps-tab';
import { NetworkPortfolioCampaignsTab } from './network-portfolio-campaigns-tab';

// InsightCard — used only in Watchlist tab
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

interface Props {
  activeTab: string;
  onTabChange: (key: string) => void;
  config: NetworkConfig;
  activeNetwork: string;
  filteredApps: AppPerformanceRow[];
  filteredCampaigns: CampaignPerformanceRow[];
  portfolioStats: {
    activeCampaigns: number; pausedCampaigns: number;
    draftCampaigns: number; errorCampaigns: number;
    connectedApps: number; activeApps: number; coverageRate: number;
  };
  trendData: { label: string; spend: number; installs: number; clicks: number }[];
  mixRows: { key: string; label: string; spendShare: number; appCount: number }[];
  topApps: AppPerformanceRow[];
  topCampaigns: CampaignPerformanceRow[];
  topApp: AppPerformanceRow | undefined;
  scaleCandidate: AppPerformanceRow | undefined;
  riskCampaign: CampaignPerformanceRow | undefined;
  draftHeavyApp: AppPerformanceRow | undefined;
  spendConcentration: number;
  insightCards: NetworkInsight[];
  navigate: (path: string) => void;
  getAppNetworkPath: (appId: string, network: string) => string;
}

export const NetworkPortfolioTable: React.FC<Props> = ({
  activeTab, onTabChange, config, activeNetwork,
  filteredApps, filteredCampaigns, portfolioStats,
  trendData, mixRows, topApps, topCampaigns,
  topApp, scaleCandidate, riskCampaign, draftHeavyApp,
  spendConcentration, insightCards, navigate, getAppNetworkPath,
}) => (
    <Tabs activeKey={activeTab} onChange={onTabChange} items={[
      {
        key: 'overview', label: 'Overview',
        children: (
          <NetworkPortfolioOverviewTab
            config={config} activeNetwork={activeNetwork}
            trendData={trendData} mixRows={mixRows} portfolioStats={portfolioStats}
            topApps={topApps} topCampaigns={topCampaigns} insightCards={insightCards}
            onOpenAppTable={() => onTabChange('apps')}
            navigate={navigate} getAppNetworkPath={getAppNetworkPath}
          />
        ),
      },
      {
        key: 'apps', label: `Apps (${filteredApps.length})`,
        children: (
          <NetworkPortfolioAppsTab
            config={config} activeNetwork={activeNetwork} filteredApps={filteredApps}
            topApp={topApp} scaleCandidate={scaleCandidate} draftHeavyApp={draftHeavyApp}
            portfolioStats={portfolioStats} navigate={navigate} getAppNetworkPath={getAppNetworkPath}
          />
        ),
      },
      {
        key: 'campaigns', label: `Campaigns (${filteredCampaigns.length})`,
        children: (
          <NetworkPortfolioCampaignsTab
            activeNetwork={activeNetwork}
            filteredCampaigns={filteredCampaigns}
            topCampaigns={topCampaigns}
            portfolioStats={portfolioStats}
            navigate={navigate}
            getAppNetworkPath={getAppNetworkPath}
          />
        ),
      },
      {
        key: 'watchlist', label: 'Watchlist',
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
                  <button type="button" className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer" onClick={() => navigate(getAppNetworkPath(topApp.project.id, activeNetwork))}>
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
                  <button type="button" className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer" onClick={() => onTabChange('campaigns')}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text_primary">Review cost risk campaigns</div>
                        <div className="text-xs text_tertiary mt-1">{riskCampaign.name} is the current highest-CPI signal.</div>
                      </div>
                      <ArrowRight size={16} className="icon_secondary" />
                    </div>
                  </button>
                )}
              </div>
            </Card>
            <div className="space-y-4">
              <InsightCard id="coverage" title="Coverage signal" tone={portfolioStats.coverageRate >= 60 ? 'green' : 'amber'} body={`Only ${portfolioStats.activeApps} of ${portfolioStats.connectedApps} connected apps currently have active campaigns in this network slice.`} meta={`${formatPercent(portfolioStats.coverageRate)} app coverage`} />
              <InsightCard id="concentration" title="Concentration signal" tone={spendConcentration >= 70 ? 'amber' : 'blue'} body={`Top 3 apps are carrying ${formatPercent(spendConcentration)} of spend. High concentration is efficient only if those apps remain healthy.`} meta="Portfolio dependency" />
              <InsightCard id="drafts" title="Draft hygiene" tone={portfolioStats.draftCampaigns > 0 ? 'red' : 'green'} body={portfolioStats.draftCampaigns > 0 ? `There are ${portfolioStats.draftCampaigns} draft campaigns in this network. Separate draft review from live performance monitoring.` : 'No draft backlog is currently diluting the network-level readout.'} meta="Operational quality" />
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
    ]} />
);
