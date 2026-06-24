// Axon workspace — thin orchestrator, delegates to axon/* sub-modules
import React, { useMemo, useState } from 'react';
import { DatePicker, Dropdown, Input, Segmented, Select, Switch, Tabs, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Activity, BarChart3, Bot, CalendarDays, Columns3, Copy, Download, Gauge, Globe2, Info, Lightbulb, MoreHorizontal, MousePointerClick, Play, Plus, RefreshCcw, Search, Sparkles, Target, Zap } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { useParams } from 'react-router-dom';
import { Button, Card, toast } from '@frontend-team/ui-kit';
import { DataTable, PageHeader, StatCard } from '@/components/ui';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { mockAxonCountryBids, mockAxonCreativePerfs, mockAxonROASCohorts, mockCampaigns, mockProjects } from '@/shared/mock-data';
import { NETWORK_LOGOS } from '@/shared/network-config';
import {
  AXON_COLOR, automationRules, buildTrend, formatCurrency, formatPercent, getCampaignRows, runHistory, safeDivide,
  type AxonCampaignRow, type AxonTab, type CampaignBuilderMode, type CampaignStatusFilter, type ReportMode,
} from '@/components/networks/axon/axon-types';
import { PanelTitle, RecommendationBadge } from '@/components/networks/axon/axon-ui-atoms';
import { AxonCampaignBuilderDrawer } from '@/components/networks/axon/axon-campaign-builder-drawer';
import { AutomationRuleDrawer, DraftRuleDrawer, EvaluationModal, makeAutomationColumns, makeHistoryColumns } from '@/components/networks/axon/axon-automation-panels';
import { AxonCampaignDetail } from '@/components/networks/axon/axon-campaign-detail';
import type { AxonRunHistory } from '@/components/networks/axon/axon-types';

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
  const topCountries = [...mockAxonCountryBids].sort((a, b) => b.spend - a.spend);
  const topCreatives = [...mockAxonCreativePerfs].sort((a, b) => b.aiScore - a.aiScore);
  const selectedRoas = mockAxonROASCohorts.find(r => r.cohort === 'D7');

  const openBuilder = (mode: CampaignBuilderMode, src?: AxonCampaignRow | null) => {
    setBuilderMode(mode); setBuilderSource(src ?? null); setBuilderOpen(true);
  };

  const campaignColumns: ColumnsType<AxonCampaignRow> = [
    { title: '', key: 'sel', width: 42, fixed: 'left', render: () => <input type="checkbox" className="w-4 h-4 rounded border border_secondary" /> },
    { title: 'Action', key: 'act', width: 92, fixed: 'left', render: (_v, row) => <Switch size="small" checked={row.status === 'ACTIVE'} /> },
    { title: 'Campaign', key: 'name', width: 260, fixed: 'left', render: (_v, row) => (
      <button type="button" className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate"
        onClick={() => setCampaignDetail(row)}>{row.name}</button>
    )},
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

  const automationCols = makeAutomationColumns(() => setRuleDrawerOpen(true));
  const historyCols = makeHistoryColumns(setEvalRun);

  if (campaignDetail) {
    return (
      <>
        <AxonCampaignDetail
          campaign={campaignDetail}
          onBack={() => setCampaignDetail(null)}
          onDuplicate={row => openBuilder('duplicate', row)}
          onNewRule={() => setRuleDrawerOpen(true)}
          onNewDraftRule={() => setDraftDrawerOpen(true)}
        />
        <AxonCampaignBuilderDrawer activeApp={activeApp} mode={builderMode} open={builderOpen}
          sourceCampaign={builderSource} onClose={() => setBuilderOpen(false)} />
        <AutomationRuleDrawer open={ruleDrawerOpen} onClose={() => setRuleDrawerOpen(false)} />
        <DraftRuleDrawer open={draftDrawerOpen} onClose={() => setDraftDrawerOpen(false)}
          packageName={activeApp?.package} />
        <EvaluationModal run={evalRun} onClose={() => setEvalRun(null)} />
      </>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + KPI bar */}
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <div className="px-5 py-5 border-b border_secondary" style={{ background: `linear-gradient(135deg, ${AXON_COLOR}14 0%, rgba(255,255,255,0) 58%)` }}>
          <PageHeader
            icon={<img src={NETWORK_LOGOS.axon} alt="Axon" className="w-6 h-6 object-contain" />}
            iconBg={AXON_COLOR}
            title={activeApp?.name ?? 'Axon Workspace'}
            subtitle="Axon performance cockpit — campaigns, country bids, creative sets, automation, and draft generation."
            actions={<>
              <Select size="small" className="w-52" value="account_game_381843"
                options={[{ value: 'account_game_381843', label: 'account_game - 381843' }]} />
              <Button type="button" variant="border" size="s" className="gap-1.5"
                onClick={() => toast.info('Axon sync mocked')}>
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

      {/* Filter bar */}
      <div className="radius_8 border border_primary bg_primary px-4 py-3 flex flex-wrap items-center gap-3">
        <Input size="small" prefix={<Search size={14} className="text_tertiary" />} placeholder="Search campaign or Axon ID"
          value={searchText} onChange={e => setSearchText(e.target.value)} className="w-72" allowClear />
        <Select size="small" className="w-36" value={statusFilter} onChange={setStatusFilter}
          options={[{ value: 'all', label: 'All statuses' }, { value: 'ACTIVE', label: 'Active' }, { value: 'PAUSED', label: 'Paused' }, { value: 'DRAFT', label: 'Draft' }, { value: 'ERROR', label: 'Error' }]} />
        <Segmented size="small" value={reportMode} onChange={v => setReportMode(v as ReportMode)}
          options={[{ label: 'Cohort', value: 'cohort' }, { label: 'Real time', value: 'realtime' }]} />
        <DatePicker.RangePicker size="small" className="w-72" />
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="border" size="s" className="gap-1.5"><Columns3 size={14} />Columns</Button>
          <Button type="button" variant="border" size="s" className="gap-1.5"><Download size={14} />Export</Button>
          <Button type="button" variant="primary" size="s" className="gap-1.5"
            onClick={() => toast.success('Report run completed')}><Play size={14} />Run</Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={k => setActiveTab(k as AxonTab)} items={[
        {
          key: 'overview', label: 'Overview',
          children: (
            <div className="space-y-5">
              <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-5">
                <Card className="radius_8 border border_primary p-5">
                  <PanelTitle icon={<BarChart3 size={16} />} title="Campaign delivery trend" subtitle={`${reportMode === 'cohort' ? 'Cohort' : 'Real-time'} view`} />
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
                        <RTooltip formatter={(v: number, name: string) => [name === 'spend' ? formatCurrency(v) : v.toLocaleString(), name === 'spend' ? 'Spend' : 'Installs']} />
                        <Area type="monotone" dataKey="spend" stroke={AXON_COLOR} fill="url(#axonSpend)" strokeWidth={2.5} />
                        <Area type="monotone" dataKey="installs" stroke={`${AXON_COLOR}99`} fill="transparent" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card className="radius_8 border border_primary p-5">
                  <PanelTitle icon={<Globe2 size={16} />} title="Country bid priorities" subtitle="Top geos by spend" />
                  <div className="h-[270px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topCountries.map(c => ({ name: c.countryCode, spend: c.spend }))} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.18)" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                        <RTooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="spend" radius={[0, 8, 8, 0]}>
                          {topCountries.map((c, i) => <Cell key={c.id} fill={i === 0 ? AXON_COLOR : `${AXON_COLOR}${i === 1 ? 'B0' : '78'}`} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
                <Card className="radius_8 border border_primary p-4">
                  <PanelTitle icon={<Target size={16} />} title="Campaign health" subtitle="Top campaigns by spend" />
                  <div className="mt-4 space-y-3">
                    {filteredCampaigns.slice(0, 5).map(c => (
                      <button key={c.id} type="button" onClick={() => setCampaignDetail(c)}
                        className="w-full bg_primary border border_primary radius_8 px-3 py-3 text-left cursor-pointer hover:bg_secondary">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0"><div className="font-semibold fg_blue_accent truncate">{c.name}</div>
                            <div className="text-xs text_tertiary mt-0.5">ID {c.axonId} | {c.platform} | {c.goalType}</div>
                          </div>
                          <RecommendationBadge value={c.recommendation} />
                        </div>
                        <div className="grid grid-cols-4 gap-3 mt-2.5 text-sm">
                          {[['Spend', formatCurrency(c.spend)], ['Installs', c.installs.toLocaleString()], ['eCPI', formatCurrency(c.ecpi)], ['ROAS', `${c.roas.toFixed(2)}x`]].map(([l, v]) => (
                            <div key={l}><div className="text-[11px] text_tertiary">{l}</div><div className="font-semibold text_primary">{v}</div></div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
                <div className="space-y-4">
                  <Card className="radius_8 border border_primary p-4">
                    <PanelTitle icon={<Lightbulb size={16} />} title="Operational signals" subtitle="What to inspect next" />
                    <div className="space-y-2.5 mt-4">
                      {[
                        ['Manage campaigns', `${filteredCampaigns.length} campaigns`, () => setActiveTab('campaigns')],
                        ['Review bid signals', `${stats.recommendations} ready`, () => filteredCampaigns[0] && setCampaignDetail(filteredCampaigns[0])],
                        ['Check creative scores', `Top: ${topCreatives[0]?.aiScore ?? 0}/100`, () => filteredCampaigns[0] && setCampaignDetail(filteredCampaigns[0])],
                        ['Run automation', 'Country + creative rules', () => setActiveTab('automation')],
                      ].map(([title, sub, onClick]) => (
                        <button key={title as string} type="button" onClick={onClick as () => void}
                          className="w-full text-left border border_primary radius_8 px-3 py-2.5 bg_secondary cursor-pointer hover:bg_primary">
                          <div className="text-sm font-semibold text_primary">{title as string}</div>
                          <div className="text-xs text_tertiary mt-0.5">{sub as string}</div>
                        </button>
                      ))}
                    </div>
                  </Card>
                  <Card className="radius_8 border border_primary p-4">
                    <PanelTitle icon={<Target size={16} />} title="ROAS cohort snapshot" subtitle="D7 cohort health" />
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[['Predicted', selectedRoas ? `${(selectedRoas.predictedROAS * 100).toFixed(0)}%` : '-', ''],
                        ['Actual', selectedRoas ? `${(selectedRoas.actualROAS * 100).toFixed(0)}%` : '-', 'fg_emerald_strong'],
                        ['Users', selectedRoas?.users.toLocaleString() ?? '-', '']
                      ].map(([l, v, cls]) => (
                        <div key={l} className="radius_8 bg_secondary border border_secondary p-3">
                          <div className="text-xs text_tertiary">{l}</div>
                          <div className={`text-lg font-semibold mt-1 ${cls || 'text_primary'}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ),
        },
        {
          key: 'campaigns', label: 'Campaigns',
          children: (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text_primary m-0">CAMPAIGN</h2>
                  <Dropdown trigger={['click']} menu={{ items: [
                    { key: 'create', label: <span className="inline-flex items-center gap-2"><Plus size={14} />Create Campaign</span> },
                    { key: 'duplicate', label: <span className="inline-flex items-center gap-2"><Copy size={14} />Duplicate Campaign</span> },
                    { type: 'divider' },
                    { key: 'pause', label: 'Pause Campaigns', disabled: true },
                  ], onClick: ({ key }) => { if (key === 'create') openBuilder('create'); if (key === 'duplicate') openBuilder('duplicate', filteredCampaigns[0]); } }}>
                    <Button type="button" variant="border" size="s" className="gap-1.5">Actions <MoreHorizontal size={14} /></Button>
                  </Dropdown>
                </div>
                <Segmented size="small" value={reportMode} onChange={v => setReportMode(v as ReportMode)}
                  options={[{ label: 'Cohort', value: 'cohort' }, { label: 'Real time', value: 'realtime' }]} />
              </div>
              <DataTable<AxonCampaignRow> panel rowKey="id" columns={campaignColumns} dataSource={filteredCampaigns}
                pagination={{ pageSize: 10 }} scroll={{ x: 'max-content', y: 560 }}
                emptyTitle="No Axon campaigns" emptyDescription="No campaigns match the current filters." />
            </div>
          ),
        },
        {
          key: 'automation', label: 'Automation',
          children: (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <PanelTitle icon={<Bot size={16} />} title="Automation Rules"
                  subtitle="Rules evaluate country and creative performance using cohort or real-time reports." />
                <Button type="button" variant="primary" size="s" className="gap-1.5"
                  onClick={() => setRuleDrawerOpen(true)}><Plus size={14} />New Rule</Button>
              </div>
              <Card className="radius_8 border border_blue bg_blue_subtle p-3 text-sm text_primary">
                When triggered, Axon fetches fresh reports for each condition date range. Review matched countries or creatives before applying changes.
              </Card>
              <DataTable panel rowKey="id" columns={automationCols} dataSource={automationRules}
                pagination={false} scroll={{ x: 'max-content' }} />
              <PanelTitle icon={<CalendarDays size={16} />} title="Run History" subtitle={`${runHistory.length} mock runs`} />
              <DataTable panel rowKey="id" columns={historyCols} dataSource={runHistory}
                pagination={false} scroll={{ x: 'max-content' }} />
            </div>
          ),
        },
      ]} />

      <AxonCampaignBuilderDrawer activeApp={activeApp} mode={builderMode} open={builderOpen}
        sourceCampaign={builderSource} onClose={() => setBuilderOpen(false)} />
      <AutomationRuleDrawer open={ruleDrawerOpen} onClose={() => setRuleDrawerOpen(false)} />
      <DraftRuleDrawer open={draftDrawerOpen} onClose={() => setDraftDrawerOpen(false)}
        packageName={activeApp?.package} />
      <EvaluationModal run={evalRun} onClose={() => setEvalRun(null)} />
    </div>
  );
};

export { AxonWorkspace };
export default AxonWorkspace;
