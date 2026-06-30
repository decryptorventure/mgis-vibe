// Overview tab content for NetworkPortfolioWorkspace
import React from 'react';
import { Badge, Button, Card } from '@frontend-team/ui-kit';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import type { NetworkConfig } from '@/shared/network-config';
import {
  formatCurrency, formatMultiplier, formatPercent,
  type AppPerformanceRow, type CampaignPerformanceRow, type NetworkInsight,
} from './use-network-portfolio';

// Inline InsightCard — used only within portfolio overview
const InsightCard: React.FC<NetworkInsight & { className?: string }> = ({ title, tone, body, meta }) => {
  const toneClass = {
    blue: 'bg_blue_subtle border_blue',
    green: 'bg_emerald_subtle border_emerald',
    amber: 'bg_amber_subtle border_amber',
    red: 'bg_red_subtle border_red',
  }[tone];
  return (
    <Card className={`radius_8 border p-4 ${toneClass}`}>
      <div className="text-sm font-semibold text_primary">{title}</div>
      <div className="text-xs text_secondary mt-2 leading-5">{body}</div>
      <div className="text-[11px] font-semibold text_tertiary mt-3 uppercase tracking-wide">{meta}</div>
    </Card>
  );
};

interface Props {
  config: NetworkConfig;
  activeNetwork: string;
  trendData: { label: string; spend: number; installs: number; clicks: number }[];
  mixRows: { key: string; label: string; spendShare: number; appCount: number }[];
  portfolioStats: {
    activeCampaigns: number; pausedCampaigns: number;
    draftCampaigns: number; errorCampaigns: number;
  };
  topApps: AppPerformanceRow[];
  topCampaigns: CampaignPerformanceRow[];
  insightCards: NetworkInsight[];
  onOpenAppTable: () => void;
  navigate: (path: string) => void;
  getAppNetworkPath: (appId: string, network: string) => string;
}

export const NetworkPortfolioOverviewTab: React.FC<Props> = ({
  config, activeNetwork, trendData, mixRows, portfolioStats,
  topApps, topCampaigns, insightCards, onOpenAppTable, navigate, getAppNetworkPath,
}) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-5">
      <Card className="radius_8 border border_primary p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text_primary">Network performance trend</div>
            <div className="text-xs text_tertiary mt-1">Portfolio-first reporting surface: network summary first, then app and campaign drilldown.</div>
          </div>
          <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">Last 7 days</Badge>
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
              <RechartsTooltip formatter={(value: number, name: string) => [name === 'spend' ? formatCurrency(value) : value.toLocaleString(), name === 'spend' ? 'Spend' : name === 'installs' ? 'Installs' : 'Clicks']} />
              <Area type="monotone" dataKey="spend" stroke={config.color} fill="url(#networkSpend)" strokeWidth={2.6} />
              <Area type="monotone" dataKey="installs" stroke={`${config.color}99`} fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="clicks" stroke={`${config.color}66`} fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="radius_8 border border_primary p-5">
        <div className="text-sm font-semibold text_primary mb-1">Network mix</div>
        <div className="text-xs text_tertiary mb-4">Spend concentration and draft review status across apps.</div>
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
          {[
            ['Active campaigns', portfolioStats.activeCampaigns],
            ['Paused campaigns', portfolioStats.pausedCampaigns],
            ['Draft campaigns', portfolioStats.draftCampaigns],
            ['Error campaigns', portfolioStats.errorCampaigns],
          ].map(([label, val]) => (
            <div key={label as string} className="radius_8 border border_primary bg_secondary px-3 py-3">
              <div className="text-xs text_tertiary">{label as string}</div>
              <div className="text-lg font-semibold text_primary mt-1">{val as number}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
      <Card className="radius_8 border border_primary p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border_secondary flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text_primary">App leaderboard</div>
            <div className="text-xs text_tertiary mt-1">First stop before opening any app workspace.</div>
          </div>
          <Button type="button" variant="border" size="s" onClick={onOpenAppTable}>Open app table</Button>
        </div>
        <div className="p-5 space-y-3">
          {topApps.map((row, index) => (
            <div key={row.key} className="border border_primary radius_8 p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 radius_round flex items-center justify-center text-xs font-bold fg_on_accent" style={{ background: index === 0 ? config.color : 'var(--ds-bg-secondary)' }}>{index + 1}</div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text_primary truncate">{row.project.name}</div>
                  <div className="text-xs text_tertiary truncate">{row.activeCampaigns} active | {formatCurrency(row.spend)} spend | {row.installs.toLocaleString()} installs</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge rounded className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-1">{formatMultiplier(row.roas)} ROAS</Badge>
                <Button type="button" variant="primary" size="s" onClick={() => navigate(getAppNetworkPath(row.project.id, activeNetwork))}>Drill in</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-4">{insightCards.map(card => <InsightCard key={card.id} {...card} />)}</div>
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
          {topCampaigns.map(c => (
            <button key={c.id} type="button" onClick={() => navigate(getAppNetworkPath(c.projectId, activeNetwork))} className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text_primary truncate">{c.name}</div>
                  <div className="text-xs text_tertiary truncate">{c.appName}</div>
                </div>
                <StatusBadge label={c.status} variant={statusToVariant(c.status)} />
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text_secondary">
                <span>{formatCurrency(c.spend)} spend</span>
                <span>{c.installs.toLocaleString()} installs</span>
                <span>{formatMultiplier(c.roas)} ROAS</span>
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
                {topApps.map((row, index) => <Cell key={row.key} fill={index === 0 ? config.color : `${config.color}${index === 1 ? 'B0' : '78'}`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  </div>
);
