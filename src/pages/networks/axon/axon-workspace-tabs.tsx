// Tab panel render logic extracted from AxonWorkspace — delegates Overview; renders Campaigns + Automation inline
import React from 'react';
import { Dropdown, Segmented, Tabs } from '@/components/ui-kit-compat';
import type { ColumnsType } from '@/components/ui-kit-compat';
import { Bot, CalendarDays, Copy, MoreHorizontal, Plus } from 'lucide-react';
import { Button, Card } from '@frontend-team/ui-kit';
import { DataTable } from '@/components/ui';
import {
  automationRules, runHistory,
  type AxonCampaignRow, type AxonTab, type CampaignBuilderMode, type ReportMode,
} from '@/components/networks/axon/axon-types';
import { PanelTitle } from '@/components/networks/axon/axon-ui-atoms';
import {
  AutomationRuleDrawer, DraftRuleDrawer, EvaluationModal,
  makeAutomationColumns, makeHistoryColumns,
} from '@/components/networks/axon/axon-automation-panels';
import type { AxonRunHistory } from '@/components/networks/axon/axon-types';
import { AxonWorkspaceOverviewTab } from './axon-workspace-overview-tab';

interface Props {
  activeTab: AxonTab;
  onTabChange: (key: AxonTab) => void;
  reportMode: ReportMode;
  onReportModeChange: (mode: ReportMode) => void;
  filteredCampaigns: AxonCampaignRow[];
  trendData: { label: string; spend: number; installs: number }[];
  stats: { recommendations: number; creativeScore: number };
  campaignColumns: ColumnsType<AxonCampaignRow>;
  ruleDrawerOpen: boolean;
  setRuleDrawerOpen: (v: boolean) => void;
  draftDrawerOpen: boolean;
  setDraftDrawerOpen: (v: boolean) => void;
  evalRun: AxonRunHistory | null;
  setEvalRun: (v: AxonRunHistory | null) => void;
  packageName: string | undefined;
  onSetCampaignDetail: (row: AxonCampaignRow) => void;
  onOpenBuilder: (mode: CampaignBuilderMode, src?: AxonCampaignRow | null) => void;
}

export const AxonWorkspaceTabs: React.FC<Props> = ({
  activeTab, onTabChange, reportMode, onReportModeChange,
  filteredCampaigns, trendData, stats, campaignColumns,
  ruleDrawerOpen, setRuleDrawerOpen,
  draftDrawerOpen, setDraftDrawerOpen,
  evalRun, setEvalRun, packageName,
  onSetCampaignDetail, onOpenBuilder,
}) => {
  const automationCols = makeAutomationColumns(() => setRuleDrawerOpen(true));
  const historyCols = makeHistoryColumns(setEvalRun);

  return (
    <>
      <Tabs activeKey={activeTab} onChange={k => onTabChange(k as AxonTab)} items={[
        {
          key: 'overview', label: 'Overview',
          children: (
            <AxonWorkspaceOverviewTab
              reportMode={reportMode}
              filteredCampaigns={filteredCampaigns}
              trendData={trendData}
              stats={stats}
              onTabChange={onTabChange}
              onSetCampaignDetail={onSetCampaignDetail}
            />
          ),
        },
        {
          key: 'campaigns', label: 'Campaigns',
          children: (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text_primary m-0">CAMPAIGN</h2>
                  <Dropdown trigger={['click']} menu={{
                    items: [
                      { key: 'create', label: <span className="inline-flex items-center gap-2"><Plus size={14} />Create Campaign</span> },
                      { key: 'duplicate', label: <span className="inline-flex items-center gap-2"><Copy size={14} />Duplicate Campaign</span> },
                      { type: 'divider' },
                      { key: 'pause', label: 'Pause Campaigns', disabled: true },
                    ],
                    onClick: ({ key }) => {
                      if (key === 'create') onOpenBuilder('create');
                      if (key === 'duplicate') onOpenBuilder('duplicate', filteredCampaigns[0]);
                    },
                  }}>
                    <Button type="button" variant="border" size="s" className="gap-1.5">Actions <MoreHorizontal size={14} /></Button>
                  </Dropdown>
                </div>
                <Segmented size="small" value={reportMode} onChange={v => onReportModeChange(v as ReportMode)}
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
                <PanelTitle icon={<Bot size={16} />} title="Automation Rules" subtitle="Rules evaluate country and creative performance using cohort or real-time reports." />
                <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => setRuleDrawerOpen(true)}>
                  <Plus size={14} />New Rule
                </Button>
              </div>
              <Card className="radius_8 border border_blue bg_blue_subtle p-3 text-sm text_primary">
                When triggered, Axon fetches fresh reports for each condition date range. Review matched countries or creatives before applying changes.
              </Card>
              <DataTable panel rowKey="id" columns={automationCols} dataSource={automationRules} pagination={false} scroll={{ x: 'max-content' }} />
              <PanelTitle icon={<CalendarDays size={16} />} title="Run History" subtitle={`${runHistory.length} mock runs`} />
              <DataTable panel rowKey="id" columns={historyCols} dataSource={runHistory} pagination={false} scroll={{ x: 'max-content' }} />
            </div>
          ),
        },
      ]} />

      <AutomationRuleDrawer open={ruleDrawerOpen} onClose={() => setRuleDrawerOpen(false)} />
      <DraftRuleDrawer open={draftDrawerOpen} onClose={() => setDraftDrawerOpen(false)} packageName={packageName} />
      <EvaluationModal run={evalRun} onClose={() => setEvalRun(null)} />
    </>
  );
};
