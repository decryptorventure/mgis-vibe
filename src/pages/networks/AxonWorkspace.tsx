import React, { useMemo, useState } from 'react';
import {
  DatePicker,
  Drawer,
  Dropdown,
  Input,
  Progress,
  Segmented,
  Select,
  Switch,
  Tabs,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Columns3,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  FlaskConical,
  Gauge,
  Globe2,
  Info,
  Layers3,
  Lightbulb,
  MoreHorizontal,
  MousePointerClick,
  Play,
  Plus,
  RefreshCcw,
  Rocket,
  Search,
  Sparkles,
  Target,
  WandSparkles,
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
import { useParams } from 'react-router-dom';
import { Button, Card, cn, toast } from '@frontend-team/ui-kit';
import { DataTable, PageHeader, StatCard } from '@/components/ui';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import {
  mockAxonCountryBids,
  mockAxonCreativePerfs,
  mockAxonROASCohorts,
  mockCampaigns,
  mockProjects,
  type AxonCountryBid,
  type AxonCreativePerf,
  type Campaign,
  type Project,
} from '@/shared/mock-data';
import { NETWORK_CONFIGS, NETWORK_LOGOS } from '@/shared/network-config';

type AxonTab = 'overview' | 'campaigns' | 'automation';
type ReportMode = 'cohort' | 'realtime';
type CampaignStatusFilter = 'all' | 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ERROR';
type CampaignBuilderMode = 'create' | 'duplicate';

interface AxonCampaignRow extends Campaign {
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

interface AxonAutomationRule {
  id: string;
  name: string;
  scope: 'Countries' | 'Creative Sets';
  condition: string;
  mode: ReportMode;
  status: 'ON' | 'OFF';
  createdAt: string;
  matched: number;
}

interface AxonRunHistory {
  id: string;
  ruleName: string;
  campaign: string;
  mode: ReportMode;
  status: 'applied' | 'evaluated' | 'triggered';
  matched: number;
  triggeredBy: string;
  time: string;
}

interface AxonDraftRule {
  id: string;
  name: string;
  tags: string[];
  pools: string[];
  combos: number;
  createdAt: string;
  status: 'LIVE' | 'TRIGGERED';
}

const AXON_COLOR = NETWORK_CONFIGS.axon.color;

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 100 ? 0 : 2 })}`;

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const safeDivide = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : 0);

const metricTitle = (label: string, help: string) => (
  <Tooltip title={<div className="max-w-[260px] text-xs leading-5">{help}</div>}>
    <span className="inline-flex items-center gap-1 cursor-help">
      <span>{label}</span>
      <Info size={12} className="text_tertiary" />
    </span>
  </Tooltip>
);

const getCampaignRows = (campaigns: Campaign[]): AxonCampaignRow[] =>
  campaigns.map((campaign, index) => {
    const ctr = safeDivide(campaign.clicks, campaign.impressions) * 100;
    const ecpm = safeDivide(campaign.spend, campaign.impressions) * 1000;
    const ecpc = safeDivide(campaign.spend, campaign.clicks);
    const ecpi = safeDivide(campaign.spend, campaign.installs);
    const ir = safeDivide(campaign.installs, campaign.impressions) * 100;
    const d0Roas = Math.max(0, campaign.roas * 0.18);
    const recommendation = campaign.roas >= 3.6 ? 'scale' : campaign.cpa > 0.7 ? 'trim' : 'watch';

    return {
      ...campaign,
      axonId: 381843 + index * 117,
      goalType: index % 3 === 1 ? 'BLD ROAS' : 'CPI',
      roasDay: index % 3 === 1 ? 'DAY7' : index % 4 === 0 ? 'DAY28' : 'N/A',
      platform: 'ANDROID',
      ctr,
      ir,
      ecpm,
      ecpc,
      ecpi,
      d0Roas,
      recommendation,
    };
  });

const buildTrend = (campaigns: AxonCampaignRow[]) => {
  const labels = ['Jun 12', 'Jun 13', 'Jun 14', 'Jun 15', 'Jun 16', 'Jun 17', 'Jun 18'];
  const spend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const installs = campaigns.reduce((sum, campaign) => sum + campaign.installs, 0);
  const multipliers = [0.72, 0.78, 0.86, 0.91, 0.98, 1.06, 1.14];

  return labels.map((label, index) => ({
    label,
    spend: Math.round(spend * multipliers[index] / 7),
    installs: Math.round(installs * (multipliers[index] + 0.04) / 7),
  }));
};

const automationRules: AxonAutomationRule[] = [
  { id: 'ar-1', name: 'Low installs countries', scope: 'Countries', condition: 'Installs < 50 | Last 7 Days', mode: 'cohort', status: 'ON', createdAt: 'Jun 17, 2026', matched: 238 },
  { id: 'ar-2', name: 'Predict ROAS D28 below target', scope: 'Countries', condition: 'Predict ROAS D28 < 100% | Last 30 Days', mode: 'cohort', status: 'ON', createdAt: 'Jun 12, 2026', matched: 64 },
  { id: 'ar-3', name: 'Realtime click spike', scope: 'Creative Sets', condition: 'CTR > 5% | Today', mode: 'realtime', status: 'OFF', createdAt: 'Jun 08, 2026', matched: 18 },
];

const runHistory: AxonRunHistory[] = [
  { id: 'run-1', ruleName: 'Low installs countries', campaign: 'test duplicate campaign', mode: 'cohort', status: 'applied', matched: 238, triggeredBy: 'duynv', time: 'a day ago' },
  { id: 'run-2', ruleName: 'Predict ROAS D28 below target', campaign: 'test create acreative', mode: 'cohort', status: 'evaluated', matched: 64, triggeredBy: 'duynv', time: '2 days ago' },
  { id: 'run-3', ruleName: 'Realtime click spike', campaign: 'duynv test 28/4', mode: 'realtime', status: 'triggered', matched: 18, triggeredBy: 'system', time: '7 days ago' },
];

const draftRules: AxonDraftRule[] = [
  {
    id: 'draft-1',
    name: 'VP9 winners x video winners',
    tags: ['VP9', 'WAIT'],
    pools: ['PLA win: Top 10 (Last 7 Days)', 'Video win: Top 10 (Last 7 Days)'],
    combos: 12,
    createdAt: 'Jun 16, 2026',
    status: 'TRIGGERED',
  },
  {
    id: 'draft-2',
    name: 'CPP refresh test',
    tags: ['CPP', 'MIXED'],
    pools: ['HTML (PLA): Top Spend', 'Video: Top IPM'],
    combos: 8,
    createdAt: 'Jun 12, 2026',
    status: 'LIVE',
  },
];

const PanelTitle: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-8 h-8 radius_8 bg_secondary border border_secondary flex items-center justify-center icon_secondary shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text_primary truncate">{title}</div>
        {subtitle && <div className="text-xs text_tertiary mt-0.5 truncate">{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

const RecommendationBadge: React.FC<{ value: AxonCampaignRow['recommendation'] }> = ({ value }) => {
  const map = {
    scale: 'bg_emerald_subtle fg_emerald_strong border_emerald',
    trim: 'bg_amber_subtle fg_amber_strong border_amber',
    watch: 'bg_blue_subtle fg_blue_strong border_blue',
  };
  const label = value === 'scale' ? 'Scale' : value === 'trim' ? 'Trim bid' : 'Watch';

  return <span className={cn('inline-flex px-2 py-1 radius_6 border text-[11px] font-semibold', map[value])}>{label}</span>;
};

const builderSteps = [
  { key: 'objective', title: 'Objective', status: 'Ready' },
  { key: 'targeting', title: 'Targeting', status: '3 regions' },
  { key: 'budget', title: 'Budget', status: 'Needs amount' },
  { key: 'optimization', title: 'Optimization', status: 'CPI' },
  { key: 'tracking', title: 'Tracking', status: 'Needs links' },
];
const regionGroups = [
  { name: 'Africa', count: 58 },
  { name: 'Asia', count: 48 },
  { name: 'Eastern Europe', count: 24 },
  { name: 'Latin America and the Caribbean', count: 49 },
  { name: 'North America', count: 5 },
  { name: 'Oceania', count: 26 },
  { name: 'Western Europe', count: 28 },
];

const SelectTile: React.FC<{ active?: boolean; title: string; subtitle?: string; className?: string }> = ({ active, title, subtitle, className }) => (
  <button
    type="button"
    className={cn(
      'min-h-[58px] radius_8 border px-4 py-3 bg_primary text-left flex items-center gap-3 transition-colors',
      active ? '' : 'border_primary hover:bg_secondary',
      className,
    )}
    style={active ? { borderColor: AXON_COLOR, backgroundColor: `${AXON_COLOR}0F` } : undefined}
  >
    <span
      className={cn('w-4 h-4 radius_round border flex items-center justify-center shrink-0', active ? '' : 'border_secondary')}
      style={active ? { borderColor: AXON_COLOR } : undefined}
    >
      {active && <span className="w-2 h-2 radius_round" style={{ backgroundColor: AXON_COLOR }} />}
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text_primary truncate">{title}</span>
      {subtitle && <span className="block text-xs text_tertiary mt-0.5 truncate">{subtitle}</span>}
    </span>
  </button>
);

const BuilderSection: React.FC<{
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status?: 'ready' | 'warning';
  children: React.ReactNode;
}> = ({ id, icon, title, subtitle, status = 'ready', children }) => (
  <Card id={id} className="radius_8 border border_primary bg_primary p-0 overflow-hidden">
    <div className="px-5 py-4 border-b border_secondary flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 radius_8 bg_secondary border border_secondary flex items-center justify-center icon_secondary shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-base font-semibold text_primary">{title}</div>
          <div className="text-xs text_tertiary mt-0.5 truncate">{subtitle}</div>
        </div>
      </div>
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 radius_round text-xs font-semibold border',
        status === 'ready' ? 'bg_emerald_subtle fg_emerald_strong border_emerald' : 'bg_amber_subtle fg_amber_strong border_amber',
      )}>
        {status === 'ready' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
        {status === 'ready' ? 'Ready' : 'Needs input'}
      </span>
    </div>
    <div className="p-5">{children}</div>
  </Card>
);

const AxonCampaignBuilderDrawer: React.FC<{
  activeApp?: Project;
  mode: CampaignBuilderMode;
  open: boolean;
  sourceCampaign?: AxonCampaignRow | null;
  onClose: () => void;
}> = ({ activeApp, mode, open, sourceCampaign, onClose }) => {
  const title = mode === 'duplicate' ? 'Duplicate campaign' : 'Create a campaign';
  const campaignName = mode === 'duplicate'
    ? `Copy ${sourceCampaign?.name ?? 'Axon campaign'}`
    : `Campaign_${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/-/g, '_')}`;
  const launchReadiness = mode === 'duplicate' ? 78 : 64;

  return (
    <Drawer
      width="calc(100vw - 260px)"
      open={open}
      onClose={onClose}
      closable={false}
      styles={{ body: { padding: 0 }, header: { display: 'none' } }}
      destroyOnClose
    >
      <div className="min-h-screen bg_secondary">
        <div className="h-16 px-7 border-b border_secondary bg_primary flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text_primary bg-transparent border-0 cursor-pointer shrink-0" onClick={onClose}>
              <ArrowLeft size={17} />
              {title}
            </button>
            <div className="h-6 w-px bg_secondary" />
            <div className="min-w-0">
              <div className="text-xs text_tertiary">Axon app promotion setup</div>
              <div className="text-sm font-semibold text_primary truncate">{activeApp?.name ?? 'Axon app'} · account_game - 381843</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="border" size="m" className="gap-1.5" onClick={() => toast.info('Imported settings from another project with mock data')}>
              <Copy size={14} />
              Import from project
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              className="gap-1.5"
              onClick={() => {
                onClose();
                toast.success(mode === 'duplicate' ? 'Duplicate campaign queued with mock data' : 'Campaign draft created with mock data');
              }}
            >
              <Rocket size={15} />
              {mode === 'duplicate' ? 'Launch duplicate' : 'Launch campaign'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-[238px_minmax(760px,1fr)_320px] gap-6 px-7 py-6">
          <aside className="sticky top-24 self-start">
            <Card className="radius_8 border border_primary bg_primary p-3">
              <div className="text-xs font-semibold text_tertiary uppercase px-2 pb-2">Campaign setup</div>
              {builderSteps.map((step, index) => (
                <a
                  key={step.key}
                  href={`#axon-builder-${step.key}`}
                  className="flex items-center gap-3 px-2 py-3 radius_8 no-underline hover:bg_secondary"
                >
                  <span
                    className={cn('w-8 h-8 radius_round flex items-center justify-center text-sm font-semibold shrink-0', index <= 1 ? 'fg_on_accent' : 'bg_tertiary text_secondary')}
                    style={index <= 1 ? { backgroundColor: AXON_COLOR } : undefined}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block text-sm truncate', index <= 1 ? 'font-semibold text_primary' : 'text_secondary')}>{step.title}</span>
                    <span className="block text-[11px] text_tertiary truncate">{step.status}</span>
                  </span>
                </a>
              ))}
            </Card>
          </aside>

          <main className="space-y-6 pb-12">
            <BuilderSection
              id="axon-builder-objective"
              icon={<Target size={16} />}
              title="Objective"
              subtitle="Confirm app, campaign type, OS, and campaign naming."
            >
              <div className="grid grid-cols-[1fr_280px] gap-5">
                <div className="space-y-5">
                  <div className="radius_8 border border_primary bg_secondary p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 radius_8 bg_blue_subtle border border_blue flex items-center justify-center font-semibold fg_blue_strong">
                        {activeApp?.icon ?? 'A'}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text_primary truncate">{activeApp?.name ?? 'Axon app'}</div>
                        <div className="text-xs text_tertiary truncate">{activeApp?.package ?? 'com.example.app'} · {activeApp?.os === 'ios' ? 'iOS' : 'Android'}</div>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-1 radius_6 bg_emerald_subtle fg_emerald_strong border border_emerald text-xs font-semibold">Selected</span>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text_secondary" htmlFor="axon-campaign-name">Campaign name</label>
                    <div className="mt-2 flex">
                      <Input id="axon-campaign-name" defaultValue={campaignName} className="rounded-r-none" />
                      <Button type="button" variant="border" size="m" className="rounded-l-none gap-1.5" onClick={() => toast.info('Auto name generated with mock data')}>
                        <WandSparkles size={15} />
                        Auto Gen
                      </Button>
                    </div>
                    <div className="text-xs text_tertiary mt-1">Recommended pattern: App_Geo_Goal_Creative_Date.</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SelectTile active={activeApp?.os === 'ios'} title="iOS" subtitle="Use iTunes app ID tracking" />
                    <SelectTile active={activeApp?.os !== 'ios'} title="Android" subtitle="Use package name tracking" />
                  </div>
                </div>
                <div className="radius_8 border border_primary p-4 bg_primary">
                  <div className="text-sm font-semibold text_primary">Campaign type</div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="w-10 h-10 radius_8 bg_emerald_subtle fg_emerald_strong flex items-center justify-center">
                      <Download size={18} />
                    </span>
                    <div>
                      <div className="font-semibold text_primary">App promotion</div>
                      <div className="text-xs text_tertiary">Axon CPI/ROAS app install flow</div>
                    </div>
                  </div>
                  <div className="mt-4 radius_8 bg_blue_subtle border border_blue px-3 py-2 text-xs fg_blue_strong">
                    Duplicate keeps source campaign objective and OS locked to prevent accidental network mismatch.
                  </div>
                </div>
              </div>
            </BuilderSection>

            <BuilderSection
              id="axon-builder-targeting"
              icon={<Globe2 size={16} />}
              title="Targeting"
              subtitle="Select countries manually, by region, or by Axon tier."
            >
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-semibold text_secondary">Target countries/regions</div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <SelectTile title="All countries/regions" subtitle="Fastest broad launch" />
                    <SelectTile active title="Specific countries/regions" subtitle="Pick region groups below" />
                    <SelectTile title="Select by countries/tier" subtitle="Tier 1, Tier 2, Tier 3" />
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_240px] gap-4">
                  <div className="radius_8 border border_primary overflow-hidden">
                    {regionGroups.map((region, index) => (
                      <div key={region.name} className="px-4 py-3 border-b border_secondary last:border-b-0 flex items-center justify-between bg_primary">
                        <label className="flex items-center gap-3 cursor-pointer min-w-0">
                          <input type="checkbox" defaultChecked={index < 3} className="w-4 h-4 rounded border border_secondary" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text_primary truncate">{region.name}</span>
                            <span className="block text-xs text_tertiary">{region.count} countries/regions</span>
                          </span>
                        </label>
                        <Button type="button" variant="border" size="s">Review</Button>
                      </div>
                    ))}
                  </div>
                  <Card className="radius_8 border border_primary p-4">
                    <div className="text-sm font-semibold text_primary">Selection summary</div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="radius_8 bg_secondary border border_secondary p-3">
                        <div className="text-xs text_tertiary">Regions</div>
                        <div className="text-lg font-semibold text_primary">3</div>
                      </div>
                      <div className="radius_8 bg_secondary border border_secondary p-3">
                        <div className="text-xs text_tertiary">Countries</div>
                        <div className="text-lg font-semibold text_primary">130</div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text_tertiary leading-5">
                      Campaign creates country rows first. Bid and goal edits happen inside campaign Countries workspace after launch.
                    </div>
                  </Card>
                </div>
              </div>
            </BuilderSection>

            <BuilderSection
              id="axon-builder-budget"
              icon={<Gauge size={16} />}
              title="Budget"
              subtitle="Choose budget allocation before country-level bid review."
              status="warning"
            >
              <div className="grid grid-cols-[1fr_300px] gap-4">
                <div className="space-y-4">
                  <SelectTile title="Combined daily budget across all countries/regions" subtitle="One shared daily cap for launch" />
                  <SelectTile active title="Set daily budget by selected countries/regions" subtitle="Prepare per-country budget rows" />
                  <div className="radius_8 border border_primary bg_secondary p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text_primary">Apply default daily budget</div>
                      <div className="text-xs text_tertiary">Pre-fill all selected countries. Can be adjusted after campaign creation.</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input addonBefore="$" defaultValue="20.00" className="w-36" />
                      <Button type="button" variant="primary" size="s">Apply all</Button>
                    </div>
                  </div>
                </div>
                <Card className="radius_8 border border_amber bg_amber_subtle p-4">
                  <div className="text-sm font-semibold fg_amber_strong">Budget checkpoint</div>
                  <div className="text-xs text_secondary mt-2 leading-5">
                    Axon can launch with default budgets, but country bid automation should be reviewed before aggressive scale.
                  </div>
                  <div className="mt-4 space-y-2 text-xs text_secondary">
                    <div className="flex items-center justify-between"><span>Daily cap</span><span className="font-semibold text_primary">$2,600</span></div>
                    <div className="flex items-center justify-between"><span>Selected countries</span><span className="font-semibold text_primary">130</span></div>
                    <div className="flex items-center justify-between"><span>Avg per country</span><span className="font-semibold text_primary">$20</span></div>
                  </div>
                </Card>
              </div>
            </BuilderSection>

            <BuilderSection
              id="axon-builder-optimization"
              icon={<Zap size={16} />}
              title="Optimization"
              subtitle="Pick billing goal, reporting mode, and launch bidding behavior."
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text_secondary">Report mode</div>
                    <div className="text-xs text_tertiary mt-1">Matches automation rule mode so later rules evaluate the same data window.</div>
                  </div>
                  <Segmented defaultValue="cohort" options={[{ label: 'Cohort', value: 'cohort' }, { label: 'Real time', value: 'realtime' }]} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SelectTile active title="CPI" subtitle="Cost Per Install" />
                  <SelectTile title="CPP" subtitle="Cost Per Purchaser" />
                  <SelectTile title="CPE" subtitle="Cost Per Event" />
                  <SelectTile title="ROAS (IAP)" subtitle="In-App purchase return on ad spend" />
                  <SelectTile title="ROAS (IAA)" subtitle="Advertising return on ad spend" />
                  <SelectTile title="ROAS (Blended)" subtitle="Total return on ad spend" />
                </div>
                <div className="grid grid-cols-[1fr_220px] gap-4">
                  <div>
                    <div className="text-sm font-semibold text_secondary mb-2">Set goal</div>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectTile active title="Goal for all countries/regions" />
                      <SelectTile title="Goal by country/region" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text_secondary mb-2">Target CPI</div>
                    <Input addonBefore="$" defaultValue="0.35" />
                    <div className="text-xs text_tertiary mt-1">Min $0.01, max $10.00.</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text_secondary mb-2">Bidding strategy</div>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectTile active title="Spend budget as fast as possible" subtitle="CPI billing" />
                    <SelectTile title="Spend budget evenly throughout the day" subtitle="CPM billing" />
                  </div>
                </div>
              </div>
            </BuilderSection>

            <BuilderSection
              id="axon-builder-tracking"
              icon={<MousePointerClick size={16} />}
              title="Tracking"
              subtitle="Generate or paste MMP links before launch."
              status="warning"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <Select defaultValue="adjust" className="w-full" options={[{ value: 'adjust', label: 'Adjust' }, { value: 'appsflyer', label: 'AppsFlyer' }]} />
                  <Button type="button" variant="border" size="m" className="gap-1.5">
                    <WandSparkles size={14} />
                    Get Link
                  </Button>
                </div>
                <Input.TextArea rows={3} placeholder="Paste impression link" />
                <Input.TextArea rows={3} placeholder="Paste click link" />
                <Card className="radius_8 border border_blue bg_blue_subtle p-4">
                  <div className="text-sm font-semibold text_primary">How it works</div>
                  <div className="text-sm text_secondary mt-2 leading-6">
                    Tracking links are saved with the campaign. Country automation and creative automation use campaign reporting after Axon starts returning delivery data.
                  </div>
                </Card>
              </div>
            </BuilderSection>
          </main>

          <aside className="sticky top-24 self-start">
            <div className="space-y-4">
              <Card className="radius_8 border border_primary p-5">
                <PanelTitle icon={<Rocket size={16} />} title="Launch readiness" subtitle={`${launchReadiness}% complete`} />
                <Progress percent={launchReadiness} size="small" strokeColor={AXON_COLOR} className="mt-4" />
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="fg_emerald_strong" />Objective and app locked</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={15} className="fg_emerald_strong" />Country targeting prepared</div>
                  <div className="flex items-center gap-2"><AlertTriangle size={15} className="fg_amber_strong" />Budget and links need review</div>
                </div>
              </Card>

              <Card className="radius_8 border border_primary p-5">
                <PanelTitle icon={<Bot size={16} />} title="Post-launch automation" subtitle="Available after campaign is created" />
                <div className="mt-4 space-y-3">
                  <div className="radius_8 border border_secondary bg_secondary p-3">
                    <div className="text-sm font-semibold text_primary">Countries Automation</div>
                    <div className="text-xs text_tertiary mt-1">Adjust bids and goals from country reports.</div>
                  </div>
                  <div className="radius_8 border border_secondary bg_secondary p-3">
                    <div className="text-sm font-semibold text_primary">Creative Set Automation</div>
                    <div className="text-xs text_tertiary mt-1">Evaluate creative sets and draft new mixes.</div>
                  </div>
                </div>
              </Card>

              <Card className="radius_8 border border_primary p-5 text-center">
                <div className="w-14 h-14 radius_8 border border_secondary bg_secondary mx-auto flex items-center justify-center text_tertiary">
                  <FileText size={28} />
                </div>
                <div className="text-sm font-semibold text_primary mt-4">No creative sets attached</div>
                <div className="text-xs text_tertiary mt-1">Creative sets can be managed after launch inside campaign workspace.</div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </Drawer>
  );
};

const AxonWorkspace: React.FC<{ network: string; networkLabel: string }> = ({ network }) => {
  const { appId } = useParams<{ appId?: string }>();
  const activeApp = mockProjects.find(project => project.id === appId);
  const [activeTab, setActiveTab] = useState<AxonTab>('overview');
  const [reportMode, setReportMode] = useState<ReportMode>('cohort');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>('all');
  const [campaignDetail, setCampaignDetail] = useState<AxonCampaignRow | null>(null);
  const [campaignBuilderOpen, setCampaignBuilderOpen] = useState(false);
  const [campaignBuilderMode, setCampaignBuilderMode] = useState<CampaignBuilderMode>('create');
  const [builderSourceCampaign, setBuilderSourceCampaign] = useState<AxonCampaignRow | null>(null);
  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);
  const [draftDrawerOpen, setDraftDrawerOpen] = useState(false);

  const campaigns = useMemo(
    () => mockCampaigns.filter(campaign => campaign.network === network && (!appId || campaign.projectId === appId)),
    [appId, network],
  );
  const campaignRows = useMemo(() => getCampaignRows(campaigns), [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();
    return campaignRows.filter(campaign => {
      const matchesSearch = !normalized || campaign.name.toLowerCase().includes(normalized) || String(campaign.axonId).includes(normalized);
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaignRows, searchText, statusFilter]);

  const stats = useMemo(() => {
    const spend = filteredCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
    const installs = filteredCampaigns.reduce((sum, campaign) => sum + campaign.installs, 0);
    const impressions = filteredCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
    const clicks = filteredCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const activeCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'ACTIVE').length;
    const roas = safeDivide(
      filteredCampaigns.reduce((sum, campaign) => sum + campaign.roas * Math.max(campaign.spend, 1), 0),
      filteredCampaigns.reduce((sum, campaign) => sum + Math.max(campaign.spend, 1), 0),
    );

    return {
      spend,
      installs,
      impressions,
      clicks,
      ctr: safeDivide(clicks, impressions) * 100,
      ir: safeDivide(installs, impressions) * 100,
      ecpi: safeDivide(spend, installs),
      roas,
      activeCampaigns,
      recommendations: mockAxonCountryBids.filter(country => country.recommendation).length,
      creativeScore: Math.round(safeDivide(mockAxonCreativePerfs.reduce((sum, creative) => sum + creative.aiScore, 0), mockAxonCreativePerfs.length)),
    };
  }, [filteredCampaigns]);

  const trendData = useMemo(() => buildTrend(filteredCampaigns), [filteredCampaigns]);
  const topCountries = [...mockAxonCountryBids].sort((a, b) => b.spend - a.spend);
  const topCreatives = [...mockAxonCreativePerfs].sort((a, b) => b.aiScore - a.aiScore);
  const selectedRoas = mockAxonROASCohorts.find(row => row.cohort === 'D7');

  const campaignColumns: ColumnsType<AxonCampaignRow> = [
    {
      title: '',
      key: 'select',
      width: 42,
      fixed: 'left',
      render: () => <input type="checkbox" className="w-4 h-4 rounded border border_secondary" />,
    },
    {
      title: 'Action',
      key: 'action',
      width: 92,
      fixed: 'left',
      render: (_value, row) => <Switch size="small" checked={row.status === 'ACTIVE'} />,
    },
    {
      title: 'Campaign',
      key: 'campaign',
      width: 260,
      fixed: 'left',
      render: (_value, row) => (
        <button
          type="button"
          className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate"
          onClick={() => setCampaignDetail(row)}
        >
          {row.name}
        </button>
      ),
    },
    { title: 'ID', dataIndex: 'axonId', key: 'axonId', width: 110 },
    { title: 'Status', key: 'status', width: 120, render: (_value, row) => <StatusBadge label={row.status} variant={statusToVariant(row.status)} /> },
    {
      title: 'Goal Type',
      dataIndex: 'goalType',
      key: 'goalType',
      width: 120,
      render: value => <span className="inline-flex px-2 py-1 radius_6 bg_blue_subtle fg_blue_strong border border_blue text-xs font-semibold">{value}</span>,
    },
    {
      title: 'ROAS Day',
      dataIndex: 'roasDay',
      key: 'roasDay',
      width: 120,
      render: value => value === 'N/A' ? <span className="text_tertiary">N/A</span> : <span className="inline-flex px-2 py-1 radius_6 bg_violet_subtle fg_violet_strong border border_violet text-xs font-semibold">{value}</span>,
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    { title: 'Platform', dataIndex: 'platform', key: 'platform', width: 120 },
    { title: metricTitle('Impressions', 'Total ad impressions reported by Axon.'), dataIndex: 'impressions', key: 'impressions', width: 140, render: value => value.toLocaleString() },
    { title: metricTitle('Clicks', 'Total clicks recorded from Axon delivery.'), dataIndex: 'clicks', key: 'clicks', width: 110, render: value => value.toLocaleString() },
    { title: metricTitle('Installs', 'Attributed installs generated by this campaign.'), dataIndex: 'installs', key: 'installs', width: 110, render: value => value.toLocaleString() },
    { title: metricTitle('CTR', 'Click-through rate: clicks divided by impressions.'), dataIndex: 'ctr', key: 'ctr', width: 100, render: value => formatPercent(value) },
    { title: metricTitle('IR', 'Install rate: installs divided by impressions.'), dataIndex: 'ir', key: 'ir', width: 100, render: value => formatPercent(value) },
    { title: metricTitle('Spend', 'Total spend in the selected reporting window.'), dataIndex: 'spend', key: 'spend', width: 120, render: value => formatCurrency(value), sorter: (a, b) => a.spend - b.spend },
    { title: metricTitle('eCPM', 'Effective cost per thousand impressions.'), dataIndex: 'ecpm', key: 'ecpm', width: 110, render: value => formatCurrency(value) },
    { title: metricTitle('eCPC', 'Effective cost per click.'), dataIndex: 'ecpc', key: 'ecpc', width: 110, render: value => formatCurrency(value) },
    { title: metricTitle('eCPI', 'Effective cost per install.'), dataIndex: 'ecpi', key: 'ecpi', width: 110, render: value => formatCurrency(value) },
    { title: metricTitle('D0 ROAS', 'Same-day ROAS estimate from Axon cohort data.'), dataIndex: 'd0Roas', key: 'd0Roas', width: 120, render: value => `${(value * 100).toFixed(1)}%` },
    { title: 'Signal', key: 'recommendation', width: 120, fixed: 'right', render: (_value, row) => <RecommendationBadge value={row.recommendation} /> },
  ];

  const countryColumns: ColumnsType<AxonCountryBid> = [
    {
      title: 'Country',
      dataIndex: 'countryName',
      key: 'countryName',
      width: 180,
      fixed: 'left',
      render: (value, row) => (
        <div>
          <div className="font-semibold text_primary">{value}</div>
          <div className="text-xs text_tertiary">{row.countryCode}</div>
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: value => <StatusBadge label={value} variant={statusToVariant(value)} /> },
    { title: 'Base Bid', dataIndex: 'baseBid', key: 'baseBid', width: 110, render: value => formatCurrency(value) },
    { title: 'Target CPA', dataIndex: 'targetCpa', key: 'targetCpa', width: 120, render: value => formatCurrency(value) },
    {
      title: 'Actual CPA',
      dataIndex: 'actualCpa',
      key: 'actualCpa',
      width: 120,
      render: (value, row) => <span className={value > row.targetCpa ? 'fg_red_strong font-semibold' : 'text_primary'}>{formatCurrency(value)}</span>,
    },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 120, render: value => formatCurrency(value) },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 120, render: value => value.toLocaleString() },
    { title: 'Actual ROAS', dataIndex: 'actualRoas', key: 'actualRoas', width: 130, render: value => `${value.toFixed(2)}x` },
    { title: 'Target ROAS', dataIndex: 'targetRoas', key: 'targetRoas', width: 130, render: value => `${value.toFixed(2)}x` },
    {
      title: 'Recommendation',
      key: 'recommendation',
      width: 240,
      render: (_value, row) => {
        if (!row.recommendation) return <span className="text_tertiary">No recommendation</span>;
        const isIncrease = row.recommendation.action === 'INCREASE';
        return (
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex px-2 py-1 radius_6 border text-xs font-semibold', isIncrease ? 'bg_emerald_subtle fg_emerald_strong border_emerald' : 'bg_amber_subtle fg_amber_strong border_amber')}>
              {isIncrease ? '+' : '-'}{row.recommendation.percent}%
            </span>
            <Tooltip title={row.recommendation.reason}>
              <Button type="button" variant="border" size="s" onClick={() => toast.success(`Applied ${row.countryName} recommendation`)}>
                Apply
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const creativeColumns: ColumnsType<AxonCreativePerf> = [
    {
      title: 'Creative Set',
      key: 'creative',
      width: 260,
      fixed: 'left',
      render: (_value, row) => (
        <div className="min-w-0">
          <div className="text-sm font-semibold text_primary truncate">{row.name}</div>
          <div className="text-xs text_tertiary truncate">{row.format} | {row.dimensions}{row.duration ? ` | ${row.duration}` : ''}</div>
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: value => <StatusBadge label={value} variant={statusToVariant(value)} /> },
    { title: 'AI Score', dataIndex: 'aiScore', key: 'aiScore', width: 140, render: value => <Progress percent={value} size="small" strokeColor={value >= 80 ? '#16a34a' : value >= 60 ? '#f59e0b' : '#ef4444'} /> },
    { title: 'IPM', dataIndex: 'ipm', key: 'ipm', width: 100, render: value => value.toFixed(1) },
    { title: 'CTR', dataIndex: 'ctr', key: 'ctr', width: 100, render: value => formatPercent(value) },
    { title: 'CVR', dataIndex: 'cvr', key: 'cvr', width: 100, render: value => formatPercent(value) },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 120, render: value => formatCurrency(value) },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 120, render: value => value.toLocaleString() },
    {
      title: 'SparkLabs',
      dataIndex: 'sparkLabsOptimized',
      key: 'sparkLabsOptimized',
      width: 130,
      render: value => value ? <span className="inline-flex px-2 py-1 radius_6 bg_emerald_subtle fg_emerald_strong border border_emerald text-xs font-semibold">Optimized</span> : <span className="text_tertiary">Not yet</span>,
    },
  ];

  const automationColumns: ColumnsType<AxonAutomationRule> = [
    {
      title: 'Rule',
      key: 'rule',
      render: (_value, row) => (
        <div>
          <div className="font-semibold text_primary">{row.name}</div>
          <div className="text-xs text_tertiary mt-1">{row.scope}</div>
        </div>
      ),
    },
    { title: 'Conditions', dataIndex: 'condition', key: 'condition', render: value => <span className="inline-flex px-2 py-1 radius_6 bg_blue_subtle fg_blue_strong border border_blue text-xs">{value}</span> },
    { title: 'Mode', dataIndex: 'mode', key: 'mode', width: 110, render: value => <span className="inline-flex px-2 py-1 radius_6 bg_secondary border border_secondary text-xs capitalize">{value}</span> },
    { title: 'Matched', dataIndex: 'matched', key: 'matched', width: 100, render: value => <span className="inline-flex min-w-7 h-6 px-2 radius_round bg_blue_medium fg_on_accent items-center justify-center text-xs font-semibold">{value}</span> },
    { title: 'Status', key: 'status', width: 110, render: (_value, row) => <Switch size="small" checked={row.status === 'ON'} checkedChildren="On" unCheckedChildren="Off" /> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 130 },
    {
      title: 'Actions',
      key: 'actions',
      width: 170,
      render: () => (
        <div className="flex items-center gap-2">
          <Button type="button" variant="primary" size="s" className="gap-1" onClick={() => toast.success('Rule triggered with mock data')}>
            <Zap size={13} />
            Trigger
          </Button>
          <Button type="button" variant="border" size="s" aria-label="Edit rule">
            <Edit3 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  const historyColumns: ColumnsType<AxonRunHistory> = [
    { title: 'Rule', dataIndex: 'ruleName', key: 'ruleName', render: value => <span className="font-semibold text_primary">{value}</span> },
    { title: 'Campaigns', dataIndex: 'campaign', key: 'campaign', render: value => <span className="inline-flex px-2 py-1 radius_6 border border_secondary bg_secondary text-xs">{value}</span> },
    { title: 'Mode', dataIndex: 'mode', key: 'mode', width: 110, render: value => <span className="capitalize">{value}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120, render: value => <StatusBadge label={value} variant={value === 'applied' ? 'success' : value === 'triggered' ? 'warning' : 'info'} /> },
    { title: 'Matched', dataIndex: 'matched', key: 'matched', width: 100 },
    { title: 'Triggered By', dataIndex: 'triggeredBy', key: 'triggeredBy', width: 130 },
    { title: 'Time', dataIndex: 'time', key: 'time', width: 120 },
    { title: '', key: 'view', width: 90, render: () => <Button type="button" variant="border" size="s" className="gap-1"><Eye size={13} />View</Button> },
  ];

  const draftColumns: ColumnsType<AxonDraftRule> = [
    {
      title: 'Rule',
      key: 'rule',
      render: (_value, row) => (
        <div>
          <div className="font-semibold text_primary">{row.name}</div>
          <div className="flex items-center gap-1 mt-2">
            {row.tags.map(tag => <span key={tag} className="inline-flex px-2 py-0.5 radius_6 bg_violet_subtle fg_violet_strong border border_violet text-[11px]">{tag}</span>)}
          </div>
        </div>
      ),
    },
    {
      title: 'Pools',
      dataIndex: 'pools',
      key: 'pools',
      render: pools => (
        <div className="space-y-1">
          {pools.map((pool: string) => <div key={pool} className="inline-flex mr-1 px-2 py-1 radius_6 bg_blue_subtle fg_blue_strong border border_blue text-xs">{pool}</div>)}
        </div>
      ),
    },
    { title: 'Combos', dataIndex: 'combos', key: 'combos', width: 100, render: value => <span className="inline-flex min-w-7 h-6 px-2 radius_round bg_blue_medium fg_on_accent items-center justify-center text-xs font-semibold">{value}</span> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 130 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120, render: value => <StatusBadge label={value} variant={value === 'LIVE' ? 'success' : 'info'} /> },
    { title: 'Actions', key: 'actions', width: 140, render: () => <Button type="button" variant="primary" size="s" className="gap-1"><Zap size={13} />Trigger</Button> },
  ];

  const openCampaignBuilder = (mode: CampaignBuilderMode, sourceCampaign?: AxonCampaignRow | null) => {
    setCampaignBuilderMode(mode);
    setBuilderSourceCampaign(sourceCampaign ?? null);
    setCampaignBuilderOpen(true);
  };

  const campaignActionItems = [
    { key: 'create', label: <span className="inline-flex items-center gap-2"><Plus size={14} />Create Campaign</span> },
    { key: 'duplicate', label: <span className="inline-flex items-center gap-2"><Copy size={14} />Duplicate Campaign</span> },
    { type: 'divider' as const },
    { key: 'pause', label: 'Pause Campaigns', disabled: true },
    { key: 'active', label: 'Active Campaigns', disabled: true },
  ];

  if (campaignDetail) {
    return (
      <div className="space-y-5">
        <div className="bg_primary border border_primary radius_8 overflow-hidden">
          <div
            className="px-5 py-5 border-b border_secondary"
            style={{ background: `linear-gradient(135deg, ${AXON_COLOR}14 0%, rgba(255,255,255,0) 58%)` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text_secondary bg-transparent border-0 p-0 cursor-pointer hover:text_primary"
                  onClick={() => setCampaignDetail(null)}
                >
                  <ArrowLeft size={16} />
                  Back to campaigns
                </button>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text_tertiary">Projects</span>
                  <span className="text_tertiary">/</span>
                  <span className="text_tertiary">Campaigns</span>
                  <span className="text_tertiary">/</span>
                  <span className="font-semibold text_primary">{campaignDetail.name}</span>
                  <StatusBadge label={campaignDetail.status} variant={statusToVariant(campaignDetail.status)} />
                </div>
                <div className="mt-2 text-2xl font-semibold text_primary">{campaignDetail.name}</div>
                <div className="text-sm text_tertiary mt-1">Axon ID {campaignDetail.axonId} | {campaignDetail.platform} | {campaignDetail.goalType}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => openCampaignBuilder('duplicate', campaignDetail)}>
                  <Copy size={14} />
                  Duplicate
                </Button>
                <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => toast.success('Campaign changes saved with mock data')}>
                  <Zap size={14} />
                  Apply changes
                </Button>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Spend" value={formatCurrency(campaignDetail.spend)} variant="info" icon={<Activity size={16} />} />
            <StatCard title="Installs" value={campaignDetail.installs.toLocaleString()} variant="success" icon={<Target size={16} />} />
            <StatCard title="eCPI" value={formatCurrency(campaignDetail.ecpi)} variant="warning" icon={<Gauge size={16} />} />
            <StatCard title="ROAS" value={`${campaignDetail.roas.toFixed(2)}x`} variant="primary" icon={<Zap size={16} />} />
          </div>
        </div>

        <Tabs
          defaultActiveKey="countries"
          items={[
            {
              key: 'countries',
              label: 'Countries',
              children: (
                <Tabs
                  defaultActiveKey="overview"
                  items={[
                    {
                      key: 'overview',
                      label: 'Overview',
                      children: (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            <Card className="radius_8 border border_primary p-4">
                              <PanelTitle icon={<Globe2 size={16} />} title="Active countries" subtitle={`${mockAxonCountryBids.filter(country => country.status === 'ACTIVE').length} active geos`} />
                            </Card>
                            <Card className="radius_8 border border_primary p-4">
                              <PanelTitle icon={<AlertTriangle size={16} />} title="CPA over target" subtitle={`${mockAxonCountryBids.filter(country => country.actualCpa > country.targetCpa).length} countries need review`} />
                            </Card>
                            <Card className="radius_8 border border_primary p-4">
                              <PanelTitle icon={<Lightbulb size={16} />} title="Bid recommendations" subtitle={`${stats.recommendations} recommendations ready`} />
                            </Card>
                          </div>
                          <DataTable<AxonCountryBid>
                            panel
                            rowKey="id"
                            columns={countryColumns}
                            dataSource={mockAxonCountryBids}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'automation',
                      label: 'Automation',
                      children: (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <PanelTitle icon={<Bot size={16} />} title="Countries Automation" subtitle="Rules evaluate country reports and prepare bid changes for review." />
                            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => setRuleDrawerOpen(true)}>
                              <Plus size={14} />
                              New Rule
                            </Button>
                          </div>
                          <Card className="radius_8 border border_blue bg_blue_subtle p-3 text-sm text_primary">
                            Country automation runs against this campaign only. Results should be reviewed before applying bid changes.
                          </Card>
                          <DataTable<AxonAutomationRule>
                            panel
                            rowKey="id"
                            columns={automationColumns}
                            dataSource={automationRules.filter(rule => rule.scope === 'Countries')}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                          />
                          <PanelTitle icon={<CalendarDays size={16} />} title="Run History" subtitle="Country rule executions" />
                          <DataTable<AxonRunHistory>
                            panel
                            rowKey="id"
                            columns={historyColumns}
                            dataSource={runHistory.filter(run => run.mode === reportMode || run.campaign === campaignDetail.name)}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              key: 'creative-sets',
              label: 'Creative Sets',
              children: (
                <Tabs
                  defaultActiveKey="overview"
                  items={[
                    {
                      key: 'overview',
                      label: 'Overview',
                      children: (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            {topCreatives.slice(0, 3).map(creative => (
                              <Card key={creative.id} className="radius_8 border border_primary p-4">
                                <PanelTitle
                                  icon={creative.format === 'PLAYABLE' ? <Layers3 size={16} /> : <FileText size={16} />}
                                  title={creative.name}
                                  subtitle={`${creative.format} | ${creative.installs.toLocaleString()} installs`}
                                  action={<span className="text-lg font-semibold text_primary">{creative.aiScore}</span>}
                                />
                              </Card>
                            ))}
                          </div>
                          <DataTable<AxonCreativePerf>
                            panel
                            rowKey="id"
                            columns={creativeColumns}
                            dataSource={mockAxonCreativePerfs}
                            pagination={{ pageSize: 8 }}
                            scroll={{ x: 'max-content' }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'automation',
                      label: 'Automation',
                      children: (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <PanelTitle icon={<Bot size={16} />} title="Creative Set Automation" subtitle="Rules evaluate creative set performance for this campaign." />
                            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => setRuleDrawerOpen(true)}>
                              <Plus size={14} />
                              New Rule
                            </Button>
                          </div>
                          <DataTable<AxonAutomationRule>
                            panel
                            rowKey="id"
                            columns={automationColumns}
                            dataSource={automationRules.filter(rule => rule.scope === 'Creative Sets')}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                          />
                          <PanelTitle icon={<CalendarDays size={16} />} title="Run History" subtitle="Creative set rule executions" />
                          <DataTable<AxonRunHistory>
                            panel
                            rowKey="id"
                            columns={historyColumns}
                            dataSource={runHistory}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'draft',
                      label: 'Creative Draft',
                      children: (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <PanelTitle icon={<FlaskConical size={16} />} title="Creative Draft Rules" subtitle="Generate creative set drafts from winning asset pools." />
                            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => setDraftDrawerOpen(true)}>
                              <Plus size={14} />
                              New Draft Rule
                            </Button>
                          </div>
                          <DataTable<AxonDraftRule>
                            panel
                            rowKey="id"
                            columns={draftColumns}
                            dataSource={draftRules}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        <AxonCampaignBuilderDrawer
          activeApp={activeApp}
          mode={campaignBuilderMode}
          open={campaignBuilderOpen}
          sourceCampaign={builderSourceCampaign}
          onClose={() => setCampaignBuilderOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <div
          className="px-5 py-5 border-b border_secondary"
          style={{ background: `linear-gradient(135deg, ${AXON_COLOR}14 0%, rgba(255,255,255,0) 58%)` }}
        >
          <PageHeader
            icon={<img src={NETWORK_LOGOS.axon} alt="Axon" className="w-6 h-6 object-contain" />}
            iconBg={AXON_COLOR}
            title={activeApp?.name ?? 'Axon Workspace'}
            subtitle="Axon performance cockpit for campaign delivery, country bids, creative sets, automation, and draft generation."
            actions={(
              <>
                <Select
                  size="small"
                  className="w-52"
                  value="account_game_381843"
                  options={[{ value: 'account_game_381843', label: 'account_game - 381843' }]}
                />
                <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => toast.info('Axon sync mocked for this UI pass')}>
                  <RefreshCcw size={14} />
                  Sync
                </Button>
              </>
            )}
          />
        </div>

        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
          <StatCard title="Spend" value={formatCurrency(stats.spend)} variant="info" icon={<Activity size={16} />} />
          <StatCard title="Installs" value={stats.installs.toLocaleString()} variant="success" icon={<Target size={16} />} />
          <StatCard title="eCPI" value={formatCurrency(stats.ecpi)} variant="warning" icon={<Gauge size={16} />} />
          <StatCard title="ROAS" value={`${stats.roas.toFixed(2)}x`} variant="primary" icon={<Zap size={16} />} />
          <StatCard title="CTR" value={formatPercent(stats.ctr)} variant="default" icon={<MousePointerClick size={16} />} />
          <StatCard title="IR" value={formatPercent(stats.ir)} variant="default" icon={<BarChart3 size={16} />} />
          <StatCard title="Bid signals" value={stats.recommendations} variant="warning" icon={<Lightbulb size={16} />} />
          <StatCard title="Creative score" value={stats.creativeScore} variant="success" icon={<Sparkles size={16} />} />
        </div>
      </div>

      <div className="radius_8 border border_primary bg_primary px-4 py-3 flex flex-wrap items-center gap-3">
        <Input
          size="small"
          prefix={<Search size={14} className="text_tertiary" />}
          placeholder="Search campaign or Axon ID"
          value={searchText}
          onChange={event => setSearchText(event.target.value)}
          className="w-72"
          allowClear
        />
        <Select
          size="small"
          className="w-36"
          value={statusFilter}
          onChange={value => setStatusFilter(value)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'PAUSED', label: 'Paused' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'ERROR', label: 'Error' },
          ]}
        />
        <Segmented
          size="small"
          value={reportMode}
          onChange={value => setReportMode(value as ReportMode)}
          options={[
            { label: 'Cohort', value: 'cohort' },
            { label: 'Real time', value: 'realtime' },
          ]}
        />
        <DatePicker.RangePicker size="small" className="w-72" />
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="border" size="s" className="gap-1.5">
            <Columns3 size={14} />
            Columns
          </Button>
          <Button type="button" variant="border" size="s" className="gap-1.5">
            <Download size={14} />
            Export
          </Button>
          <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => toast.success('Report run completed with mock data')}>
            <Play size={14} />
            Run
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as AxonTab)}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <div className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-5">
                  <Card className="radius_8 border border_primary p-5">
                    <PanelTitle
                      icon={<BarChart3 size={16} />}
                      title="Campaign delivery trend"
                      subtitle={`${reportMode === 'cohort' ? 'Cohort' : 'Real-time'} reporting view`}
                    />
                    <div className="h-[270px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                          <defs>
                            <linearGradient id="axonSpend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={AXON_COLOR} stopOpacity={0.34} />
                              <stop offset="95%" stopColor={AXON_COLOR} stopOpacity={0.04} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip formatter={(value: number, name: string) => [name === 'spend' ? formatCurrency(value) : value.toLocaleString(), name === 'spend' ? 'Spend' : 'Installs']} />
                          <Area type="monotone" dataKey="spend" stroke={AXON_COLOR} fill="url(#axonSpend)" strokeWidth={2.5} />
                          <Area type="monotone" dataKey="installs" stroke={`${AXON_COLOR}99`} fill="transparent" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="radius_8 border border_primary p-5">
                    <PanelTitle icon={<Globe2 size={16} />} title="Country bid priorities" subtitle="Top geos by spend and bid pressure" />
                    <div className="h-[270px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topCountries.map(country => ({ name: country.countryCode, spend: country.spend, cpa: country.actualCpa }))} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.18)" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="spend" radius={[0, 8, 8, 0]}>
                            {topCountries.map((country, index) => <Cell key={country.id} fill={index === 0 ? AXON_COLOR : `${AXON_COLOR}${index === 1 ? 'B0' : '78'}`} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
                  <Card className="radius_8 border border_primary p-4">
                    <PanelTitle icon={<Layers3 size={16} />} title="Campaign health summary" subtitle="Top campaigns by spend and delivery health" />
                    <div className="mt-4 space-y-3">
                      {filteredCampaigns.slice(0, 5).map(campaign => (
                        <button
                          key={campaign.id}
                          type="button"
                          className="w-full bg_primary border border_primary radius_8 px-3 py-3 text-left cursor-pointer hover:bg_secondary"
                          onClick={() => setCampaignDetail(campaign)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold fg_blue_accent truncate">{campaign.name}</div>
                              <div className="text-xs text_tertiary mt-1">Axon ID {campaign.axonId} | {campaign.platform} | {campaign.goalType}</div>
                            </div>
                            <RecommendationBadge value={campaign.recommendation} />
                          </div>
                          <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                            <div><div className="text-[11px] text_tertiary">Spend</div><div className="font-semibold text_primary">{formatCurrency(campaign.spend)}</div></div>
                            <div><div className="text-[11px] text_tertiary">Installs</div><div className="font-semibold text_primary">{campaign.installs.toLocaleString()}</div></div>
                            <div><div className="text-[11px] text_tertiary">eCPI</div><div className="font-semibold text_primary">{formatCurrency(campaign.ecpi)}</div></div>
                            <div><div className="text-[11px] text_tertiary">ROAS</div><div className="font-semibold text_primary">{campaign.roas.toFixed(2)}x</div></div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <Card className="radius_8 border border_primary p-4">
                      <PanelTitle icon={<Lightbulb size={16} />} title="Operational signals" subtitle="What to inspect next" />
                      <div className="space-y-3 mt-4">
                        <button type="button" className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer" onClick={() => setActiveTab('campaigns')}>
                          <div className="text-sm font-semibold text_primary">Manage {filteredCampaigns.length} campaigns</div>
                          <div className="text-xs text_tertiary mt-1">Create, duplicate, pause, and inspect campaign-level performance.</div>
                        </button>
                        <button type="button" className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer" onClick={() => setCampaignDetail(filteredCampaigns[0] ?? null)}>
                          <div className="text-sm font-semibold text_primary">Review {stats.recommendations} country bid recommendations</div>
                          <div className="text-xs text_tertiary mt-1">Open a campaign workspace to manage Countries and country automation.</div>
                        </button>
                        <button type="button" className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer" onClick={() => setCampaignDetail(filteredCampaigns[0] ?? null)}>
                          <div className="text-sm font-semibold text_primary">Check SparkLabs creative score</div>
                          <div className="text-xs text_tertiary mt-1">Open Creative Sets inside a campaign workspace. Top score is {topCreatives[0]?.aiScore ?? 0}/100.</div>
                        </button>
                        <button type="button" className="w-full text-left border border_primary radius_8 px-3 py-3 bg_secondary cursor-pointer" onClick={() => setActiveTab('automation')}>
                          <div className="text-sm font-semibold text_primary">Run automation guardrails</div>
                          <div className="text-xs text_tertiary mt-1">Country and creative rules can be evaluated from this workspace.</div>
                        </button>
                      </div>
                    </Card>

                    <Card className="radius_8 border border_primary p-4">
                      <PanelTitle icon={<Target size={16} />} title="ROAS cohort snapshot" subtitle="D7 cohort health" />
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="radius_8 bg_secondary border border_secondary p-3">
                          <div className="text-xs text_tertiary">Predicted</div>
                          <div className="text-lg font-semibold text_primary mt-1">{selectedRoas ? `${(selectedRoas.predictedROAS * 100).toFixed(0)}%` : '-'}</div>
                        </div>
                        <div className="radius_8 bg_secondary border border_secondary p-3">
                          <div className="text-xs text_tertiary">Actual</div>
                          <div className="text-lg font-semibold fg_emerald_strong mt-1">{selectedRoas ? `${(selectedRoas.actualROAS * 100).toFixed(0)}%` : '-'}</div>
                        </div>
                        <div className="radius_8 bg_secondary border border_secondary p-3">
                          <div className="text-xs text_tertiary">Users</div>
                          <div className="text-lg font-semibold text_primary mt-1">{selectedRoas?.users.toLocaleString() ?? '-'}</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'campaigns',
            label: 'Campaigns',
            children: (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text_primary m-0">CAMPAIGN</h2>
                    <Dropdown
                      trigger={['click']}
                      menu={{
                        items: campaignActionItems,
                        onClick: ({ key }) => {
                          if (key === 'create') openCampaignBuilder('create');
                          if (key === 'duplicate') openCampaignBuilder('duplicate', filteredCampaigns[0] ?? null);
                        },
                      }}
                    >
                      <Button type="button" variant="border" size="s" className="gap-1.5">
                        Actions
                        <MoreHorizontal size={14} />
                      </Button>
                    </Dropdown>
                  </div>
                  <div className="flex items-center gap-2">
                    <Segmented
                      size="small"
                      value={reportMode}
                      onChange={value => setReportMode(value as ReportMode)}
                      options={[
                        { label: 'Cohort', value: 'cohort' },
                        { label: 'Real time', value: 'realtime' },
                      ]}
                    />
                    <Button type="button" variant="border" size="s" className="gap-1.5">
                      <Columns3 size={14} />
                      Columns
                    </Button>
                  </div>
                </div>

                <DataTable<AxonCampaignRow>
                  panel
                  rowKey="id"
                  columns={campaignColumns}
                  dataSource={filteredCampaigns}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content', y: 560 }}
                  emptyTitle="No Axon campaigns"
                  emptyDescription="No campaigns match the current filters."
                />
              </div>
            ),
          },
          {
            key: 'automation',
            label: 'Automation',
            children: (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <PanelTitle icon={<Bot size={16} />} title={`Manage Automation Rules`} subtitle="Rules evaluate country and creative performance using cohort or real-time reports." />
                  <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => setRuleDrawerOpen(true)}>
                    <Plus size={14} />
                    New Rule
                  </Button>
                </div>
                <Card className="radius_8 border border_blue bg_blue_subtle p-3 text-sm text_primary">
                  When trigger runs, Axon fetches fresh reports using each condition date range and report mode. Matching countries or creatives can then be reviewed before applying changes.
                </Card>
                <DataTable<AxonAutomationRule>
                  panel
                  rowKey="id"
                  columns={automationColumns}
                  dataSource={automationRules}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                />
                <PanelTitle icon={<CalendarDays size={16} />} title="Run History" subtitle={`${runHistory.length} mock runs`} />
                <DataTable<AxonRunHistory>
                  panel
                  rowKey="id"
                  columns={historyColumns}
                  dataSource={runHistory}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            ),
          },
        ]}
      />

      <AxonCampaignBuilderDrawer
        activeApp={activeApp}
        mode={campaignBuilderMode}
        open={campaignBuilderOpen}
        sourceCampaign={builderSourceCampaign}
        onClose={() => setCampaignBuilderOpen(false)}
      />

      <Drawer
        title="Create Automation Rule"
        width={760}
        open={ruleDrawerOpen}
        onClose={() => setRuleDrawerOpen(false)}
        extra={<Button type="button" variant="primary" size="s" onClick={() => { setRuleDrawerOpen(false); toast.success('Automation rule created'); }}>Create Rule</Button>}
      >
        <div className="space-y-5">
          <Input placeholder="e.g. Low installs countries" />
          <Segmented value={reportMode} onChange={value => setReportMode(value as ReportMode)} options={[{ label: 'Cohort', value: 'cohort' }, { label: 'Real time', value: 'realtime' }]} />
          <Card className="radius_8 border border_primary p-4">
            <div className="grid grid-cols-4 gap-3">
              <Select defaultValue="installs" options={[{ value: 'installs', label: 'Installs' }, { value: 'ctr', label: 'CTR' }, { value: 'roasD28', label: 'Predict ROAS D28' }]} />
              <Select defaultValue="lt" options={[{ value: 'lt', label: '< less than' }, { value: 'gt', label: '> greater than' }]} />
              <Input defaultValue="50" />
              <Select defaultValue="last7" options={[{ value: 'last7', label: 'Last 7 Days' }, { value: 'last30', label: 'Last 30 Days' }, { value: 'today', label: 'Today' }]} />
            </div>
          </Card>
          <Card className="radius_8 border border_blue bg_blue_subtle p-4">
            <div className="text-sm font-semibold text_primary">How it works</div>
            <div className="text-sm text_secondary mt-2 leading-6">
              Date range is computed at trigger time. Cohort groups metrics by install day, while real-time uses the freshest delivery window available.
            </div>
          </Card>
        </div>
      </Drawer>

      <Drawer
        title="Create Draft Rule"
        width={820}
        open={draftDrawerOpen}
        onClose={() => setDraftDrawerOpen(false)}
        extra={<Button type="button" variant="primary" size="s" onClick={() => { setDraftDrawerOpen(false); toast.success('Draft rule created'); }}>Create</Button>}
      >
        <div className="space-y-5">
          <Input placeholder="e.g. iGGJ Mix Creative Q2" />
          <Select mode="tags" className="w-full" placeholder="Project filters, package, or campaign labels" defaultValue={activeApp?.package ? [activeApp.package] : []} />
          <Card className="radius_8 border border_primary p-4">
            <PanelTitle icon={<FlaskConical size={16} />} title="Asset Pools" subtitle="Combine winning HTML, video, image, and CPP assets." />
            {[1, 2].map(pool => (
              <div key={pool} className="mt-4 radius_8 border border_secondary p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text_primary">Pool {pool}</span>
                  <div className="flex items-center gap-3 text-xs text_secondary">
                    Mixed <Switch size="small" />
                    Group Concept <Switch size="small" />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <Input placeholder="Label" />
                  <Select defaultValue={pool === 1 ? 'html' : 'video'} options={[{ value: 'html', label: 'HTML (PLA)' }, { value: 'video', label: 'Video' }, { value: 'image', label: 'Image' }]} />
                  <Select defaultValue="topSpend" options={[{ value: 'topSpend', label: 'Top Spend' }, { value: 'topIpm', label: 'Top IPM' }]} />
                  <Select defaultValue="top10" options={[{ value: 'top10', label: 'Top 10' }, { value: 'top20', label: 'Top 20' }]} />
                  <Select defaultValue="last7" options={[{ value: 'last7', label: 'Last 7 Days' }, { value: 'last30', label: 'Last 30 Days' }]} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </Drawer>
    </div>
  );
};

export { AxonWorkspace };
export default AxonWorkspace;
