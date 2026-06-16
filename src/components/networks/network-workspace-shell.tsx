// ─── NetworkWorkspaceShell — shared layout shell for all network workspaces ───
import React, { useState } from 'react';
import { Card, Tabs, Input, Drawer, Select, DatePicker, Switch } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { Search, Filter, Download, Plus, ListFilter } from 'lucide-react';
import { FilterBar, PageHeader } from '@/components/ui';
import { NetworkCampaignTable } from './network-campaign-table';
import { NetworkInsightsTab } from './network-insights-tab';
import { NetworkSettingsTab } from './network-settings-tab';
import type { NetworkConfig } from '@/shared/network-config';
import { mockProjects, type Campaign } from '@/shared/mock-data';
import { useParams } from 'react-router-dom';
import { NetworkWorkspaceAutomationRules } from './NetworkWorkspaceAutomationRules';

import { CampaignWizardModal } from '../campaign-wizard/campaign-wizard-modal';

interface NetworkWorkspaceShellProps {
  config: NetworkConfig;
  campaigns: Campaign[];
  /** Optional expandable row config forwarded to campaign table (e.g. Meta AdSet hierarchy) */
  expandable?: object;
}

export const NetworkWorkspaceShell: React.FC<NetworkWorkspaceShellProps> = ({
  config,
  campaigns,
  expandable,
}) => {
  const [searchText, setSearchText] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const { appId } = useParams<{ appId?: string }>();
  const activeApp = mockProjects.find((p) => p.id === appId);
  const connectedAppsCount = new Set(campaigns.map(campaign => campaign.projectId)).size;

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  let allTabs = [];
  if (appId && activeApp) {
    allTabs.push({
      key: 'campaigns',
      label: 'Overview',
      children: (
        <NetworkCampaignTable
          config={config}
          campaigns={filtered}
          expandable={expandable}
        />
      ),
    });

    if (config.extraTabs) {
      config.extraTabs.forEach((t) => allTabs.push(t));
    }

    allTabs.push({
      key: 'automation-rules',
      label: 'Automation Rules',
      children: (
        <NetworkWorkspaceAutomationRules
          networkKey={config.key}
          networkLabel={config.label}
          projectId={appId}
          appName={activeApp.name}
          activeCampaignsCount={filtered.filter((c) => c.status === 'ACTIVE').length}
        />
      ),
    });

    allTabs.push({
      key: 'insights',
      label: 'Insights',
      children: <NetworkInsightsTab config={config} />,
    });

    allTabs.push({
      key: 'settings',
      label: 'Settings',
      children: <NetworkSettingsTab config={config} />,
    });
  } else {
    const standardTabs = [
      {
        key: 'campaigns',
        label: `Campaigns (${filtered.length})`,
        children: (
          <NetworkCampaignTable
            config={config}
            campaigns={filtered}
            expandable={expandable}
          />
        ),
      },
      {
        key: 'insights',
        label: 'Insights',
        children: <NetworkInsightsTab config={config} />,
      },
      {
        key: 'settings',
        label: 'Settings',
        children: <NetworkSettingsTab config={config} />,
      },
    ];

    allTabs = config.extraTabs ? [...standardTabs, ...config.extraTabs] : standardTabs;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={config.icon}
        iconBg={config.color}
        title={`${config.label} Workspace`}
        subtitle={appId && activeApp
          ? `Manage ${config.label} campaigns, insights and settings for ${activeApp.name}`
          : `Detailed performance across ${connectedAppsCount} app(s) running on ${config.label}`}
      />

      <FilterBar
        title="Workspace filters"
        actions={
          <>
            <Button
              type="button"
              variant="border"
              size="m"
              onClick={() => setFilterOpen(true)}
              className="gap-1.5"
            >
              <Filter size={14} />
              Filter
            </Button>
            <Button
              type="button"
              variant="border"
              size="m"
              onClick={() => toast.info('Export is mocked for this UI pass.')}
              className="gap-1.5"
            >
              <Download size={14} />
              Export
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              style={{ background: config.color, borderColor: config.color }}
              onClick={() => setWizardOpen(true)}
              className="gap-1.5"
            >
              <Plus size={14} />
              {config.createButtonLabel}
            </Button>
          </>
        }
      >
        <Input
          prefix={<Search size={16} className="text-[var(--text-tertiary)]" />}
          placeholder="Search campaigns..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full sm:w-72"
          allowClear
        />
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {filtered.length} campaigns
        </span>
      </FilterBar>

      {/* Main content card */}
      <Card className="rounded-lg overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Tabs items={allTabs} className="px-4 pt-2" />
      </Card>

      {/* Advanced Filters Drawer */}
      <Drawer
        title={<div className="flex items-center gap-2"><ListFilter size={18} className="text-[var(--text-primary)]" /> <span className="font-bold">Advanced Filters</span></div>}
        placement="right"
        onClose={() => setFilterOpen(false)}
        open={filterOpen}
        width={380}
        styles={{ header: { padding: '16px 20px' }, body: { padding: '20px', background: 'var(--surface-subtle)' } }}
        footer={
          <div className="flex justify-between items-center w-full">
            <Button variant="subtle" size="m" onClick={() => setFilterOpen(false)}>Reset</Button>
            <Button variant="primary" size="m" onClick={() => { setFilterOpen(false); toast.success('Filters applied'); }}>Apply Filters</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Status</label>
            <Select
              mode="multiple"
              className="w-full"
              placeholder="Select statuses"
              defaultValue={['ACTIVE']}
              options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'PAUSED', label: 'Paused' }, { value: 'DELETED', label: 'Deleted' }]}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Date Range</label>
            <DatePicker.RangePicker className="w-full" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Budget Type</label>
            <Select
              className="w-full"
              defaultValue="all"
              options={[{ value: 'all', label: 'All Budgets' }, { value: 'cbo', label: 'Campaign Budget Optimization (CBO)' }, { value: 'abo', label: 'AdSet Budget Optimization (ABO)' }]}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">ROAS Target</label>
            <div className="flex items-center gap-3">
              <Input placeholder="Min" className="w-full" type="number" />
              <span className="text-[var(--text-tertiary)] font-bold">-</span>
              <Input placeholder="Max" className="w-full" type="number" />
            </div>
          </div>
          <div className="bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-[var(--text-primary)]">Only show profitable</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Filter out campaigns with ROAS &lt; 1.0</div>
            </div>
            <Switch />
          </div>
        </div>
      </Drawer>

      {/* Wizard — rendered by unified CampaignWizardModal directly */}
      {wizardOpen && (
        <CampaignWizardModal
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          defaultNetwork={config.key}
        />
      )}
    </div>
  );
};

export default NetworkWorkspaceShell;
