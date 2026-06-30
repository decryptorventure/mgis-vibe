// Shell: NetworkPortfolioWorkspace — composes hook + 3 sub-components
import React from 'react';
import { Alert } from '@/components/ui-kit-compat';
import { AlertTriangle } from 'lucide-react';
import { useNetworkPortfolio } from './use-network-portfolio';
import { NetworkPortfolioKpiStrip } from './network-portfolio-kpi-strip';
import { NetworkPortfolioFilters } from './network-portfolio-filters';
import { NetworkPortfolioTable } from './network-portfolio-table';
import { getAppNetworkPath as _getAppNetworkPath } from '@/shared/navigation';
// Widen the second param type so the table prop interface (string) is satisfied
const getAppNetworkPath = (appId: string, network: string) => _getAppNetworkPath(appId, network as Parameters<typeof _getAppNetworkPath>[1]);

export const NetworkPortfolioWorkspace: React.FC = () => {
  const state = useNetworkPortfolio();
  const { activeNetwork, config } = state;

  if (!activeNetwork || !config) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unsupported network"
        description={`Route ${activeNetwork ?? 'unknown'} is not mapped to a network report.`}
      />
    );
  }

  return (
    <div className="space-y-5">
      <NetworkPortfolioKpiStrip
        activeNetwork={activeNetwork}
        config={config}
        portfolioStats={state.portfolioStats}
        filteredCampaigns={state.filteredCampaigns}
        spendConcentration={state.spendConcentration}
      />

      <NetworkPortfolioFilters
        searchText={state.searchText}
        osFilter={state.osFilter}
        statusFilter={state.statusFilter}
        sortMode={state.sortMode}
        onSearchChange={state.setSearchText}
        onOsChange={state.setOsFilter}
        onStatusChange={state.setStatusFilter}
        onSortChange={state.setSortMode}
        onReviewApps={() => state.setActiveTab('apps')}
        onReset={() => {
          state.setSearchText('');
          state.setOsFilter('all');
          state.setStatusFilter('all');
          state.setSortMode('spend');
        }}
      />

      <NetworkPortfolioTable
        activeTab={state.activeTab}
        onTabChange={key => state.setActiveTab(key as typeof state.activeTab)}
        config={config}
        activeNetwork={activeNetwork}
        filteredApps={state.filteredApps}
        filteredCampaigns={state.filteredCampaigns}
        portfolioStats={state.portfolioStats}
        trendData={state.trendData}
        mixRows={state.mixRows}
        topApps={state.topApps}
        topCampaigns={state.topCampaigns}
        topApp={state.topApp}
        scaleCandidate={state.scaleCandidate}
        riskCampaign={state.riskCampaign}
        draftHeavyApp={state.draftHeavyApp}
        spendConcentration={state.spendConcentration}
        insightCards={state.insightCards}
        navigate={state.navigate}
        getAppNetworkPath={getAppNetworkPath}
      />

      {state.portfolioStats.errorCampaigns > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle size={16} />}
          message={`${state.portfolioStats.errorCampaigns} campaign(s) in ${config.label} need attention`}
          description="Use the Campaigns tab to isolate error rows, then open the corresponding app workspace for detailed remediation."
        />
      )}
    </div>
  );
};

export default NetworkPortfolioWorkspace;
