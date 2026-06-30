// Apps tab: summary cards + app performance table with column definitions
import React from 'react';
import { Badge, Button, Card } from '@frontend-team/ui-kit';
import { DataTable } from '@/components/ui';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import type { NetworkConfig } from '@/shared/network-config';
import { formatCurrency, formatMultiplier, formatPercent, type AppPerformanceRow } from './use-network-portfolio';

interface Props {
  config: NetworkConfig;
  activeNetwork: string;
  filteredApps: AppPerformanceRow[];
  topApp: AppPerformanceRow | undefined;
  scaleCandidate: AppPerformanceRow | undefined;
  draftHeavyApp: AppPerformanceRow | undefined;
  portfolioStats: { draftCampaigns: number };
  navigate: (path: string) => void;
  getAppNetworkPath: (appId: string, network: string) => string;
}

export const NetworkPortfolioAppsTab: React.FC<Props> = ({
  config, activeNetwork, filteredApps, topApp, scaleCandidate, draftHeavyApp, navigate, getAppNetworkPath,
}) => {
  const appColumns = [
    { title: 'App', key: 'app', width: 280, fixed: 'left' as const, render: (_v: unknown, row: AppPerformanceRow) => (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 radius_8 bg_secondary border border_secondary flex items-center justify-center text-xs font-bold text_primary">{row.project.icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text_primary truncate">{row.project.name}</div>
          <div className="text-xs text_tertiary truncate">{row.project.package}</div>
        </div>
      </div>
    )},
    { title: 'State', key: 'state', width: 150, render: (_v: unknown, row: AppPerformanceRow) => (
      <div className="space-y-1">
        <StatusBadge label={row.project.status} variant={statusToVariant(row.project.status)} />
        <div className="text-xs text_tertiary">{row.project.os.toUpperCase()}</div>
      </div>
    )},
    { title: 'Campaign Mix', key: 'campaignMix', width: 180, render: (_v: unknown, row: AppPerformanceRow) => (
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between"><span className="text_secondary">Active</span><span className="font-semibold text_primary">{row.activeCampaigns}</span></div>
        <div className="flex items-center justify-between"><span className="text_secondary">Draft</span><span className="font-semibold text_primary">{row.draftCampaigns}</span></div>
        <div className="flex items-center justify-between"><span className="text_secondary">Paused</span><span className="font-semibold text_primary">{row.pausedCampaigns}</span></div>
      </div>
    )},
    { title: 'Spend', key: 'spend', width: 120, render: (_v: unknown, row: AppPerformanceRow) => formatCurrency(row.spend) },
    { title: 'Installs', key: 'installs', width: 120, render: (_v: unknown, row: AppPerformanceRow) => row.installs.toLocaleString() },
    { title: 'ROAS', key: 'roas', width: 100, render: (_v: unknown, row: AppPerformanceRow) => formatMultiplier(row.roas) },
    { title: 'CPI', key: 'cpi', width: 100, render: (_v: unknown, row: AppPerformanceRow) => formatCurrency(row.cpi) },
    { title: 'CTR', key: 'ctr', width: 100, render: (_v: unknown, row: AppPerformanceRow) => formatPercent(row.ctr) },
    { title: 'Impressions', key: 'impressions', width: 140, render: (_v: unknown, row: AppPerformanceRow) => row.impressions.toLocaleString() },
    { title: 'Share of Spend', key: 'share', width: 160, render: (_v: unknown, row: AppPerformanceRow) => (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text_secondary">Share</span>
          <span className="font-semibold text_primary">{formatPercent(row.shareOfSpend)}</span>
        </div>
        <div className="h-2 radius_round bg_secondary overflow-hidden">
          <div className="h-full radius_round" style={{ width: `${Math.min(100, row.shareOfSpend)}%`, background: config.color }} />
        </div>
      </div>
    )},
    { title: '', key: 'actions', width: 190, fixed: 'right' as const, render: (_v: unknown, row: AppPerformanceRow) => (
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="border" size="s" onClick={() => navigate(`/apps/${row.project.id}/dashboard`)}>App</Button>
        <Button type="button" variant="primary" size="s" onClick={() => navigate(getAppNetworkPath(row.project.id, activeNetwork))}>Open workspace</Button>
      </div>
    )},
  ];

  return (
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
                <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">{formatMultiplier(scaleCandidate.roas)} ROAS</Badge>
                <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">{formatCurrency(scaleCandidate.cpi)} CPI</Badge>
              </div>
            </div>
          ) : <div className="text-sm text_secondary mt-4">No app available in this slice.</div>}
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
          ) : <div className="text-sm text_secondary mt-4">No app available in this slice.</div>}
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
          ) : <div className="text-sm text_secondary mt-4">No draft signal available.</div>}
        </Card>
      </div>
      <DataTable<AppPerformanceRow>
        panel rowKey="key" columns={appColumns} dataSource={filteredApps}
        pagination={{ pageSize: 8 }} scroll={{ x: 'max-content', y: 560 }}
        emptyTitle="No apps in this network slice"
        emptyDescription="Try clearing filters or connect more apps to this adnetwork."
      />
    </div>
  );
};
