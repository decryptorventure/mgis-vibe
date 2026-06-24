// Axon campaign detail view — country/creative tabs with Tier badges + inline bid editing
import React, { useState } from 'react';
import { Input, Progress, Tabs, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Activity, AlertTriangle, ArrowLeft, Bot, CalendarDays, Copy, FileText, FlaskConical, Gauge, Globe2, Layers3, Lightbulb, Plus, Zap } from 'lucide-react';
import { Button, Card, cn, toast } from '@frontend-team/ui-kit';
import { DataTable, StatCard } from '@/components/ui';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import {
  mockAxonCountryBids,
  mockAxonCreativePerfs,
  type AxonCountryBid,
  type AxonCreativePerf,
} from '@/shared/mock-data';
import { AXON_COLOR, formatCurrency, formatPercent, getCountryTier, TIER_STYLE, automationRules, draftRules, runHistory } from './axon-types';
import { PanelTitle } from './axon-ui-atoms';
import { makeAutomationColumns, makeHistoryColumns, draftColumns, EvaluationModal } from './axon-automation-panels';
import type { AxonCampaignRow, AxonRunHistory } from './axon-types';

// ─── Country table column builder ────────────────────────────────────────────

const makeCountryColumns = (): ColumnsType<AxonCountryBid> => [
  {
    title: 'Country', dataIndex: 'countryName', key: 'countryName', width: 200, fixed: 'left',
    render: (value, row) => {
      const tier = getCountryTier(row.countryCode);
      return (
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <div className="font-semibold text_primary truncate">{value}</div>
            <div className="text-xs text_tertiary">{row.countryCode}</div>
          </div>
          <span className={cn('inline-flex px-1.5 py-0.5 radius_4 border text-[10px] font-bold shrink-0', TIER_STYLE[tier])}>
            T{tier}
          </span>
        </div>
      );
    },
  },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: v => <StatusBadge label={v} variant={statusToVariant(v)} /> },
  {
    title: 'Base Bid', dataIndex: 'baseBid', key: 'baseBid', width: 130,
    render: (value, row) => <InlineBidCell value={value} countryCode={row.countryCode} field="baseBid" />,
  },
  { title: 'Target CPA', dataIndex: 'targetCpa', key: 'targetCpa', width: 120, render: v => formatCurrency(v) },
  {
    title: 'Actual CPA', dataIndex: 'actualCpa', key: 'actualCpa', width: 120,
    render: (v, row) => <span className={v > row.targetCpa ? 'fg_red_strong font-semibold' : 'text_primary'}>{formatCurrency(v)}</span>,
  },
  { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 120, sorter: (a, b) => a.spend - b.spend, render: v => formatCurrency(v) },
  { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 110, render: v => v.toLocaleString() },
  { title: 'Actual ROAS', dataIndex: 'actualRoas', key: 'actualRoas', width: 130, render: v => `${v.toFixed(2)}x` },
  { title: 'Target ROAS', dataIndex: 'targetRoas', key: 'targetRoas', width: 130, render: v => `${v.toFixed(2)}x` },
  {
    title: 'Recommendation', key: 'recommendation', width: 230,
    render: (_v, row) => {
      if (!row.recommendation) return <span className="text_tertiary text-xs">No action</span>;
      const isUp = row.recommendation.action === 'INCREASE';
      return (
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex px-2 py-1 radius_6 border text-xs font-semibold', isUp ? 'bg_emerald_subtle fg_emerald_strong border_emerald' : 'bg_amber_subtle fg_amber_strong border_amber')}>
            {isUp ? '+' : '-'}{row.recommendation.percent}%
          </span>
          <Tooltip title={row.recommendation.reason}>
            <Button type="button" variant="border" size="s"
              onClick={() => toast.success(`Applied ${row.countryName} recommendation`)}
            >Apply</Button>
          </Tooltip>
        </div>
      );
    },
  },
];

// ─── Inline bid edit cell ─────────────────────────────────────────────────────

const InlineBidCell: React.FC<{ value: number; countryCode: string; field: string }> = ({ value, countryCode, field }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value.toFixed(4)));

  if (editing) {
    return (
      <Input
        size="small"
        addonBefore="$"
        value={draft}
        autoFocus
        style={{ width: 110 }}
        onChange={e => setDraft(e.target.value)}
        onPressEnter={() => { setEditing(false); toast.success(`${countryCode} ${field} updated to $${draft}`); }}
        onKeyDown={e => { if (e.key === 'Escape') setEditing(false); }}
        onBlur={() => setEditing(false)}
      />
    );
  }
  return (
    <button type="button" onClick={() => setEditing(true)}
      className="px-2 py-1 radius_6 bg-transparent border border-transparent hover:border_primary hover:bg_secondary cursor-pointer text-sm font-semibold text_primary transition-colors"
      title="Click to edit"
    >
      {formatCurrency(value)}
    </button>
  );
};

// ─── Creative columns ─────────────────────────────────────────────────────────

const creativeColumns: ColumnsType<AxonCreativePerf> = [
  {
    title: 'Creative Set', key: 'creative', width: 260, fixed: 'left',
    render: (_v, row) => (
      <div className="min-w-0">
        <div className="text-sm font-semibold text_primary truncate">{row.name}</div>
        <div className="text-xs text_tertiary truncate">{row.format} | {row.dimensions}{row.duration ? ` | ${row.duration}` : ''}</div>
      </div>
    ),
  },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: v => <StatusBadge label={v} variant={statusToVariant(v)} /> },
  {
    title: 'AI Score', dataIndex: 'aiScore', key: 'aiScore', width: 140,
    render: v => <Progress percent={v} size="small" strokeColor={v >= 80 ? '#16a34a' : v >= 60 ? '#f59e0b' : '#ef4444'} />,
  },
  { title: 'IPM', dataIndex: 'ipm', key: 'ipm', width: 100, render: v => v.toFixed(1) },
  { title: 'CTR', dataIndex: 'ctr', key: 'ctr', width: 100, render: v => formatPercent(v) },
  { title: 'CVR', dataIndex: 'cvr', key: 'cvr', width: 100, render: v => formatPercent(v) },
  { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 120, render: v => formatCurrency(v) },
  { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 120, render: v => v.toLocaleString() },
  {
    title: 'SparkLabs', dataIndex: 'sparkLabsOptimized', key: 'sparkLabsOptimized', width: 130,
    render: v => v
      ? <span className="inline-flex px-2 py-1 radius_6 bg_emerald_subtle fg_emerald_strong border border_emerald text-xs font-semibold">Optimized</span>
      : <span className="text_tertiary">Not yet</span>,
  },
];

// ─── Campaign Detail ──────────────────────────────────────────────────────────

interface Props {
  campaign: AxonCampaignRow;
  onBack: () => void;
  onDuplicate: (row: AxonCampaignRow) => void;
  onNewRule: () => void;
  onNewDraftRule: () => void;
}

export const AxonCampaignDetail: React.FC<Props> = ({ campaign, onBack, onDuplicate, onNewRule, onNewDraftRule }) => {
  const [evalRun, setEvalRun] = useState<AxonRunHistory | null>(null);
  const countryColumns = makeCountryColumns();
  const automationCols = makeAutomationColumns(onNewRule);
  const historyCols = makeHistoryColumns(setEvalRun);

  const topCreatives = [...mockAxonCreativePerfs].sort((a, b) => b.aiScore - a.aiScore);
  const activeCountries = mockAxonCountryBids.filter(c => c.status === 'ACTIVE').length;
  const cpaOver = mockAxonCountryBids.filter(c => c.actualCpa > c.targetCpa).length;
  const recoCount = mockAxonCountryBids.filter(c => c.recommendation).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <div className="px-5 py-5 border-b border_secondary"
          style={{ background: `linear-gradient(135deg, ${AXON_COLOR}14 0%, rgba(255,255,255,0) 58%)` }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <button type="button" onClick={onBack}
                className="inline-flex items-center gap-2 text-sm text_secondary bg-transparent border-0 p-0 cursor-pointer hover:text_primary"
              >
                <ArrowLeft size={16} />Back to campaigns
              </button>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text_tertiary text-sm">Campaigns</span>
                <span className="text_tertiary">/</span>
                <span className="font-semibold text_primary text-sm truncate">{campaign.name}</span>
                <StatusBadge label={campaign.status} variant={statusToVariant(campaign.status)} />
              </div>
              <div className="mt-1.5 text-2xl font-semibold text_primary">{campaign.name}</div>
              <div className="text-sm text_tertiary mt-1">Axon ID {campaign.axonId} | {campaign.platform} | {campaign.goalType}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button type="button" variant="border" size="s" className="gap-1.5"
                onClick={() => toast.info('Activity log')}>
                <Activity size={14} />Activity Logs
              </Button>
              <Button type="button" variant="border" size="s" className="gap-1.5"
                onClick={() => onDuplicate(campaign)}>
                <Copy size={14} />Duplicate
              </Button>
              <Button type="button" variant="primary" size="s" className="gap-1.5"
                onClick={() => toast.success('Changes applied')}>
                <Zap size={14} />Apply changes
              </Button>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Spend" value={formatCurrency(campaign.spend)} variant="info" icon={<Activity size={16} />} />
          <StatCard title="Installs" value={campaign.installs.toLocaleString()} variant="success" icon={<Zap size={16} />} />
          <StatCard title="eCPI" value={formatCurrency(campaign.ecpi)} variant="warning" icon={<Gauge size={16} />} />
          <StatCard title="ROAS" value={`${campaign.roas.toFixed(2)}x`} variant="primary" icon={<Zap size={16} />} />
        </div>
      </div>

      {/* Tabs: Countries / Creative Sets */}
      <Tabs defaultActiveKey="countries" items={[
        {
          key: 'countries',
          label: 'Countries',
          children: (
            <Tabs defaultActiveKey="overview" items={[
              {
                key: 'overview',
                label: 'Overview',
                children: (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="radius_8 border border_primary p-4">
                        <PanelTitle icon={<Globe2 size={16} />} title="Active countries" subtitle={`${activeCountries} active geos`} />
                      </Card>
                      <Card className="radius_8 border border_primary p-4">
                        <PanelTitle icon={<AlertTriangle size={16} />} title="CPA over target"
                          subtitle={`${cpaOver} ${cpaOver === 1 ? 'country' : 'countries'} need review`}
                        />
                      </Card>
                      <Card className="radius_8 border border_primary p-4">
                        <PanelTitle icon={<Lightbulb size={16} />} title="Bid recommendations"
                          subtitle={`${recoCount} recommendations ready`}
                        />
                      </Card>
                    </div>
                    <DataTable<AxonCountryBid>
                      panel rowKey="id" columns={countryColumns} dataSource={mockAxonCountryBids}
                      pagination={false} scroll={{ x: 'max-content' }}
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
                      <PanelTitle icon={<Bot size={16} />} title="Countries Automation"
                        subtitle="Rules evaluate country reports and prepare bid changes for review."
                      />
                      <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={onNewRule}>
                        <Plus size={14} />New Rule
                      </Button>
                    </div>
                    <Card className="radius_8 border border_blue bg_blue_subtle p-3 text-sm text_primary">
                      Country automation runs against this campaign only. Review results before applying bid changes.
                    </Card>
                    <DataTable<AxonCampaignRow['recommendation'] | any>
                      panel rowKey="id" columns={automationCols}
                      dataSource={automationRules.filter(r => r.scope === 'Countries')}
                      pagination={false} scroll={{ x: 'max-content' }}
                    />
                    <PanelTitle icon={<CalendarDays size={16} />} title="Run History" subtitle="Country rule executions" />
                    <DataTable
                      panel rowKey="id" columns={historyCols}
                      dataSource={runHistory.filter(r => r.campaign === campaign.name || r.mode === 'cohort')}
                      pagination={false} scroll={{ x: 'max-content' }}
                    />
                  </div>
                ),
              },
            ]} />
          ),
        },
        {
          key: 'creative-sets',
          label: 'Creative Sets',
          children: (
            <Tabs defaultActiveKey="overview" items={[
              {
                key: 'overview',
                label: 'Overview',
                children: (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      {topCreatives.slice(0, 3).map(c => (
                        <Card key={c.id} className="radius_8 border border_primary p-4">
                          <PanelTitle
                            icon={c.format === 'PLAYABLE' ? <Layers3 size={16} /> : <FileText size={16} />}
                            title={c.name} subtitle={`${c.format} | ${c.installs.toLocaleString()} installs`}
                            action={<span className="text-lg font-semibold text_primary">{c.aiScore}</span>}
                          />
                        </Card>
                      ))}
                    </div>
                    <DataTable<AxonCreativePerf>
                      panel rowKey="id" columns={creativeColumns} dataSource={mockAxonCreativePerfs}
                      pagination={{ pageSize: 8 }} scroll={{ x: 'max-content' }}
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
                      <PanelTitle icon={<Bot size={16} />} title="Creative Set Automation"
                        subtitle="Rules evaluate creative set performance for this campaign."
                      />
                      <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={onNewRule}>
                        <Plus size={14} />New Rule
                      </Button>
                    </div>
                    <DataTable
                      panel rowKey="id" columns={automationCols}
                      dataSource={automationRules.filter(r => r.scope === 'Creative Sets')}
                      pagination={false} scroll={{ x: 'max-content' }}
                    />
                    <PanelTitle icon={<CalendarDays size={16} />} title="Run History" subtitle="Creative set rule executions" />
                    <DataTable
                      panel rowKey="id" columns={historyCols} dataSource={runHistory}
                      pagination={false} scroll={{ x: 'max-content' }}
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
                      <PanelTitle icon={<FlaskConical size={16} />} title="Creative Draft Rules"
                        subtitle="Generate creative set drafts from winning asset pools."
                      />
                      <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={onNewDraftRule}>
                        <Plus size={14} />New Draft Rule
                      </Button>
                    </div>
                    <DataTable
                      panel rowKey="id" columns={draftColumns} dataSource={draftRules}
                      pagination={false} scroll={{ x: 'max-content' }}
                    />
                  </div>
                ),
              },
            ]} />
          ),
        },
      ]} />

      <EvaluationModal run={evalRun} onClose={() => setEvalRun(null)} />
    </div>
  );
};
