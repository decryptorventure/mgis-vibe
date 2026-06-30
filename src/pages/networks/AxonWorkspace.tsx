// Axon workspace — thin orchestrator, delegates tab rendering to axon/axon-workspace-tabs
import React, { useMemo, useState } from 'react';
import { Input, Segmented, Select, Switch, Tooltip } from '@/components/ui-kit-compat';
import type { ColumnsType } from '@/components/ui-kit-compat';
import { Activity, BarChart3, Gauge, Info, Lightbulb, MousePointerClick, RefreshCcw, Search, Sparkles, Target, Zap } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button, toast } from '@frontend-team/ui-kit';
import { PageHeader, StatCard } from '@/components/ui';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { mockCampaigns, mockAxonCountryBids, mockAxonCreativePerfs, mockProjects } from '@/shared/mock-data';
import { NETWORK_LOGOS } from '@/shared/network-config';
import {
  AXON_COLOR, buildTrend, formatCurrency, formatPercent, getCampaignRows, safeDivide,
  type AxonCampaignRow, type AxonTab, type CampaignBuilderMode, type CampaignStatusFilter, type ReportMode,
} from '@/components/networks/axon/axon-types';
import { RecommendationBadge } from '@/components/networks/axon/axon-ui-atoms';
import { AxonCampaignBuilderDrawer } from '@/components/networks/axon/axon-campaign-builder-drawer';
import { AxonCampaignDetail } from '@/components/networks/axon/axon-campaign-detail';
import type { AxonRunHistory } from '@/components/networks/axon/axon-types';
import { DatePicker } from '@/components/ui-kit-compat';
import { Columns3, Download, Play } from 'lucide-react';
import { AxonWorkspaceTabs } from './axon/axon-workspace-tabs';

const metricTitle = (label: string, help: string) => (
  <span className="inline-flex items-center gap-1">{label}
    <Tooltip title={help}><Info size={11} className="text_tertiary cursor-help" /></Tooltip>
  </span>
);

const AxonWorkspace: React.FC<{ network: string; networkLabel: string }> = ({ network }) => {
  const { appId } = useParams<{ appId?: string }>();
  const activeApp = mockProjects.find(p => p.id === appId);

  const [activeTab, setActiveTab] = useState<AxonTab>('overview');
  const [reportMode, setReportMode] = useState<ReportMode>('cohort');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>('all');
  const [campaignDetail, setCampaignDetail] = useState<AxonCampaignRow | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderMode, setBuilderMode] = useState<CampaignBuilderMode>('create');
  const [builderSource, setBuilderSource] = useState<AxonCampaignRow | null>(null);
  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);
  const [draftDrawerOpen, setDraftDrawerOpen] = useState(false);
  const [evalRun, setEvalRun] = useState<AxonRunHistory | null>(null);

  const campaigns = useMemo(
    () => mockCampaigns.filter(c => c.network === network && (!appId || c.projectId === appId)),
    [appId, network],
  );
  const campaignRows = useMemo(() => getCampaignRows(campaigns), [campaigns]);
  const filteredCampaigns = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return campaignRows.filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || String(c.axonId).includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [campaignRows, searchText, statusFilter]);

  const stats = useMemo(() => {
    const spend = filteredCampaigns.reduce((s, c) => s + c.spend, 0);
    const installs = filteredCampaigns.reduce((s, c) => s + c.installs, 0);
    const impressions = filteredCampaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = filteredCampaigns.reduce((s, c) => s + c.clicks, 0);
    return {
      spend, installs,
      ctr: safeDivide(clicks, impressions) * 100,
      ir: safeDivide(installs, impressions) * 100,
      ecpi: safeDivide(spend, installs),
      roas: safeDivide(filteredCampaigns.reduce((s, c) => s + c.roas * Math.max(c.spend, 1), 0), filteredCampaigns.reduce((s, c) => s + Math.max(c.spend, 1), 0)),
      recommendations: mockAxonCountryBids.filter(c => c.recommendation).length,
      creativeScore: Math.round(safeDivide(mockAxonCreativePerfs.reduce((s, c) => s + c.aiScore, 0), mockAxonCreativePerfs.length)),
    };
  }, [filteredCampaigns]);

  const trendData = useMemo(() => buildTrend(filteredCampaigns), [filteredCampaigns]);

  const openBuilder = (mode: CampaignBuilderMode, src?: AxonCampaignRow | null) => {
    setBuilderMode(mode); setBuilderSource(src ?? null); setBuilderOpen(true);
  };

  const campaignColumns: ColumnsType<AxonCampaignRow> = [
    { title: '', key: 'sel', width: 42, fixed: 'left', render: () => <input type="checkbox" className="w-4 h-4 rounded border border_secondary" /> },
    { title: 'Action', key: 'act', width: 92, fixed: 'left', render: (_v, row) => <Switch size="small" checked={row.status === 'ACTIVE'} /> },
    { title: 'Campaign', key: 'name', width: 260, fixed: 'left', render: (_v, row) => <button type="button" className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate" onClick={() => setCampaignDetail(row)}>{row.name}</button> },
    { title: 'ID', dataIndex: 'axonId', key: 'axonId', width: 110 },
    { title: 'Status', key: 'status', width: 120, render: (_v, row) => <StatusBadge label={row.status} variant={statusToVariant(row.status)} /> },
    { title: 'Goal Type', dataIndex: 'goalType', key: 'goalType', width: 120, render: v => <span className="inline-flex px-2 py-1 radius_6 bg_blue_subtle fg_blue_strong border border_blue text-xs font-semibold">{v}</span> },
    { title: 'ROAS Day', dataIndex: 'roasDay', key: 'roasDay', width: 120, render: v => v === 'N/A' ? <span className="text_tertiary">N/A</span> : <span className="inline-flex px-2 py-1 radius_6 bg_violet_subtle fg_violet_strong border border_violet text-xs font-semibold">{v}</span> },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    { title: 'Platform', dataIndex: 'platform', key: 'platform', width: 110 },
    { title: metricTitle('Impressions', 'Total ad impressions reported by Axon.'), dataIndex: 'impressions', key: 'impressions', width: 140, render: v => v.toLocaleString() },
    { title: metricTitle('Clicks', 'Total clicks recorded from Axon delivery.'), dataIndex: 'clicks', key: 'clicks', width: 110, render: v => v.toLocaleString() },
    { title: metricTitle('Installs', 'Attributed installs generated by this campaign.'), dataIndex: 'installs', key: 'installs', width: 110, render: v => v.toLocaleString() },
    { title: metricTitle('CTR', 'Click-through rate.'), dataIndex: 'ctr', key: 'ctr', width: 100, render: v => formatPercent(v) },
    { title: metricTitle('IR', 'Install rate.'), dataIndex: 'ir', key: 'ir', width: 100, render: v => formatPercent(v) },
    { title: metricTitle('Spend', 'Total spend in window.'), dataIndex: 'spend', key: 'spend', width: 120, render: v => formatCurrency(v), sorter: (a, b) => a.spend - b.spend },
    { title: metricTitle('eCPM', 'Effective cost per mille.'), dataIndex: 'ecpm', key: 'ecpm', width: 110, render: v => formatCurrency(v) },
    { title: metricTitle('eCPC', 'Effective cost per click.'), dataIndex: 'ecpc', key: 'ecpc', width: 110, render: v => formatCurrency(v) },
    { title: metricTitle('eCPI', 'Effective cost per install.'), dataIndex: 'ecpi', key: 'ecpi', width: 110, render: v => formatCurrency(v) },
    { title: metricTitle('D0 ROAS', 'Same-day ROAS estimate.'), dataIndex: 'd0Roas', key: 'd0Roas', width: 120, render: v => `${(v * 100).toFixed(1)}%` },
    { title: 'Signal', key: 'rec', width: 120, fixed: 'right', render: (_v, row) => <RecommendationBadge value={row.recommendation} /> },
  ];

  if (campaignDetail) {
    return (
      <>
        <AxonCampaignDetail campaign={campaignDetail} onBack={() => setCampaignDetail(null)}
          onDuplicate={row => openBuilder('duplicate', row)} onNewRule={() => setRuleDrawerOpen(true)}
          onNewDraftRule={() => setDraftDrawerOpen(true)} />
        <AxonCampaignBuilderDrawer activeApp={activeApp} mode={builderMode} open={builderOpen}
          sourceCampaign={builderSource} onClose={() => setBuilderOpen(false)} />
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <div className="px-5 py-5 border-b border_secondary" style={{ background: `linear-gradient(135deg, ${AXON_COLOR}14 0%, rgba(255,255,255,0) 58%)` }}>
          <PageHeader
            icon={<img src={NETWORK_LOGOS.axon} alt="Axon" className="w-6 h-6 object-contain" />}
            iconBg={AXON_COLOR}
            title={activeApp?.name ?? 'Axon Workspace'}
            subtitle="Axon performance cockpit — campaigns, country bids, creative sets, automation, and draft generation."
            actions={<>
              <Select size="small" className="w-52" value="account_game_381843" options={[{ value: 'account_game_381843', label: 'account_game - 381843' }]} />
              <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => toast.info('Axon sync mocked')}>
                <RefreshCcw size={14} />Sync
              </Button>
            </>}
          />
        </div>
        <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
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
        <Input size="small" prefix={<Search size={14} className="text_tertiary" />} placeholder="Search campaign or Axon ID"
          value={searchText} onChange={e => setSearchText(e.target.value)} className="w-72" allowClear />
        <Select size="small" className="w-36" value={statusFilter} onChange={v => setStatusFilter(v as CampaignStatusFilter)}
          options={[{ value: 'all', label: 'All statuses' }, { value: 'ACTIVE', label: 'Active' }, { value: 'PAUSED', label: 'Paused' }, { value: 'DRAFT', label: 'Draft' }, { value: 'ERROR', label: 'Error' }]} />
        <Segmented size="small" value={reportMode} onChange={v => setReportMode(v as ReportMode)}
          options={[{ label: 'Cohort', value: 'cohort' }, { label: 'Real time', value: 'realtime' }]} />
        <DatePicker.RangePicker size="small" className="w-72" />
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="border" size="s" className="gap-1.5"><Columns3 size={14} />Columns</Button>
          <Button type="button" variant="border" size="s" className="gap-1.5"><Download size={14} />Export</Button>
          <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => toast.success('Report run completed')}><Play size={14} />Run</Button>
        </div>
      </div>

      <AxonWorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        reportMode={reportMode}
        onReportModeChange={setReportMode}
        filteredCampaigns={filteredCampaigns}
        trendData={trendData}
        stats={stats}
        campaignColumns={campaignColumns}
        ruleDrawerOpen={ruleDrawerOpen}
        setRuleDrawerOpen={setRuleDrawerOpen}
        draftDrawerOpen={draftDrawerOpen}
        setDraftDrawerOpen={setDraftDrawerOpen}
        evalRun={evalRun}
        setEvalRun={setEvalRun}
        packageName={activeApp?.package}
        onSetCampaignDetail={setCampaignDetail}
        onOpenBuilder={openBuilder}
      />

      <AxonCampaignBuilderDrawer activeApp={activeApp} mode={builderMode} open={builderOpen}
        sourceCampaign={builderSource} onClose={() => setBuilderOpen(false)} />
    </div>
  );
};

export { AxonWorkspace };
export default AxonWorkspace;
