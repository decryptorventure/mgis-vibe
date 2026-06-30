// Campaigns tab content for NetworkPortfolioWorkspace — summary cards and campaign performance table
import React from 'react';
import { Button, Card } from '@frontend-team/ui-kit';
import type { ColumnsType } from '@/components/ui-kit-compat';
import { DataTable } from '@/components/ui';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import {
  formatCurrency, formatMultiplier, formatPercent,
  type CampaignPerformanceRow,
} from './use-network-portfolio';

interface Props {
  activeNetwork: string;
  filteredCampaigns: CampaignPerformanceRow[];
  topCampaigns: CampaignPerformanceRow[];
  portfolioStats: { draftCampaigns: number; errorCampaigns: number };
  navigate: (path: string) => void;
  getAppNetworkPath: (appId: string, network: string) => string;
}

export const NetworkPortfolioCampaignsTab: React.FC<Props> = ({
  activeNetwork, filteredCampaigns, topCampaigns, portfolioStats, navigate, getAppNetworkPath,
}) => {
  const campaignColumns: ColumnsType<CampaignPerformanceRow> = [
    { title: 'Campaign', key: 'campaign', width: 320, fixed: 'left', render: (_v, c) => (
      <div className="min-w-0">
        <div className="text-sm font-semibold text_primary truncate">{c.name}</div>
        <div className="text-xs text_tertiary truncate">{c.appName}</div>
      </div>
    )},
    { title: 'Status', key: 'status', width: 120, render: (_v, c) => <StatusBadge label={c.status} variant={statusToVariant(c.status)} /> },
    { title: 'App', key: 'app', width: 180, render: (_v, c) => (
      <div>
        <div className="text-sm font-medium text_primary">{c.appName}</div>
        <div className="text-xs text_tertiary">{c.appOs.toUpperCase()}</div>
      </div>
    )},
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 110 },
    { title: 'Budget', key: 'budget', width: 120, render: (_v, c) => formatCurrency(c.budget) },
    { title: 'Spend', key: 'spend', width: 120, render: (_v, c) => formatCurrency(c.spend) },
    { title: 'Installs', key: 'installs', width: 120, render: (_v, c) => c.installs.toLocaleString() },
    { title: 'ROAS', key: 'roas', width: 100, render: (_v, c) => formatMultiplier(c.roas) },
    { title: 'CPI', key: 'cpa', width: 100, render: (_v, c) => formatCurrency(c.cpa) },
    { title: 'CTR', key: 'ctr', width: 100, render: (_v, c) => formatPercent(c.ctr) },
    { title: 'Impressions', key: 'impressions', width: 140, render: (_v, c) => c.impressions.toLocaleString() },
    { title: 'Spend Share', key: 'share', width: 130, render: (_v, c) => (
      <span className="text-sm font-semibold text_primary">{formatPercent(c.shareOfSpend)}</span>
    )},
    { title: '', key: 'actions', width: 180, fixed: 'right', render: (_v, c) => (
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="border" size="s" onClick={() => navigate(`/apps/${c.projectId}/dashboard`)}>App</Button>
        <Button type="button" variant="primary" size="s" onClick={() => navigate(getAppNetworkPath(c.projectId, activeNetwork))}>Open workspace</Button>
      </div>
    )},
  ];

  return (
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
          ) : <div className="text-sm text_secondary mt-4">No campaign available.</div>}
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
        panel rowKey="id" columns={campaignColumns} dataSource={filteredCampaigns}
        pagination={{ pageSize: 10 }} scroll={{ x: 'max-content', y: 560 }}
        emptyTitle="No campaigns in this slice"
        emptyDescription="No campaign matches the current network filters."
      />
    </div>
  );
};
