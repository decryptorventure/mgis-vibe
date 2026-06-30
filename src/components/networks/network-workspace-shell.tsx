// ─── NetworkWorkspaceShell — shared layout shell for all network workspaces ───
import React, { useState } from 'react';
import { Input, Dropdown } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { Search, Filter, Download, Plus, ChevronDown } from 'lucide-react';
import { FilterBar, PageHeader } from '@/components/ui';
import { DataFreshnessIndicator } from '@/components/ui/data-freshness-indicator';
import { NetworkCampaignTable } from './network-campaign-table';
import { NetworkInsightsTab } from './network-insights-tab';
import { NetworkSettingsTab } from './network-settings-tab';
import { NetworkWorkspacePanel } from './network-workspace-panel';
import type { NetworkConfig } from '@/shared/network-config';
import { mockProjects, type Campaign } from '@/shared/mock-data';
import { usePersistentFilter, useSessionFilter } from '@/shared/hooks/use-persistent-filter';
import { useParams, useNavigate } from 'react-router-dom';
import { NetworkWorkspaceAutomationRules } from './NetworkWorkspaceAutomationRules';

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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeOverflowKey, setActiveOverflowKey] = useState('');

  const { appId } = useParams<{ appId?: string }>();
  const navigate = useNavigate();
  const filterKey = `${appId ?? 'global'}-${config.key}`;
  const tabKey = `${appId ?? 'global'}-${config.key}-tab`;
  const [activeTabKey, setActiveTabKey] = useSessionFilter(tabKey, 'campaigns');
  const [searchText, setSearchText, clearSearchText] = usePersistentFilter(filterKey, '');
  const activeApp = mockProjects.find(p => p.id === appId);
  const connectedAppsCount = new Set(campaigns.map(c => c.projectId)).size;
  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()));

  // ─── Build tab list ────────────────────────────────────────────────────────
  let allTabs: { key: string; label: React.ReactNode; children: React.ReactNode }[] = [];

  if (appId && activeApp) {
    allTabs.push({
      key: 'campaigns', label: 'Overview',
      children: <NetworkCampaignTable config={config} campaigns={filtered} expandable={expandable} />,
    });
    if (config.extraTabs) config.extraTabs.forEach(t => allTabs.push({ key: t.key as string, label: t.label, children: t.children }));
    allTabs.push({
      key: 'automation-rules', label: 'Automation Rules',
      children: (
        <NetworkWorkspaceAutomationRules
          networkKey={config.key} networkLabel={config.label}
          projectId={appId} appName={activeApp.name}
          activeCampaignsCount={filtered.filter(c => c.status === 'ACTIVE').length}
        />
      ),
    });
    allTabs.push({ key: 'insights', label: 'Insights', children: <NetworkInsightsTab config={config} /> });
    allTabs.push({ key: 'settings', label: 'Settings', children: <NetworkSettingsTab config={config} /> });
  } else {
    const standardTabs = [
      { key: 'campaigns', label: `Campaigns (${filtered.length})`, children: <NetworkCampaignTable config={config} campaigns={filtered} expandable={expandable} /> },
      { key: 'insights', label: 'Insights', children: <NetworkInsightsTab config={config} /> },
      { key: 'settings', label: 'Settings', children: <NetworkSettingsTab config={config} /> },
    ];
    allTabs = config.extraTabs
      ? [...standardTabs, ...config.extraTabs.map(t => ({ key: t.key as string, label: t.label, children: t.children ?? null }))]
      : standardTabs;
  }

  // ─── Tab overflow: extraTabs go into "More" dropdown ──────────────────────
  const ALWAYS_PRIMARY = new Set(['campaigns', 'automation-rules', 'insights', 'settings']);
  const primaryTabs = allTabs.filter(t => ALWAYS_PRIMARY.has(t.key as string));
  const overflowTabs = allTabs.filter(t => !ALWAYS_PRIMARY.has(t.key as string));
  const activeOverflowTab = overflowTabs.find(t => t.key === activeOverflowKey);

  const tabsToRender = overflowTabs.length > 0
    ? [
        ...primaryTabs,
        {
          key: '__overflow__',
          label: (
            <Dropdown
              menu={{
                items: overflowTabs.map(t => ({ key: t.key as string, label: t.label })),
                onClick: ({ key }) => { setActiveOverflowKey(key); setActiveTabKey('__overflow__'); },
                selectedKeys: activeOverflowKey ? [activeOverflowKey] : [],
              }}
              trigger={['click']}
            >
              <span className="flex items-center gap-1.5 select-none">
                {activeTabKey === '__overflow__' && activeOverflowTab ? activeOverflowTab.label : 'More'}
                <ChevronDown size={12} />
              </span>
            </Dropdown>
          ),
          children: activeOverflowTab?.children ?? overflowTabs[0]?.children ?? null,
        },
      ]
    : allTabs;

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

      <DataFreshnessIndicator
        lastSyncedAt="2026-06-24T12:45:00"
        sourceName={`${config.label} API`}
        syncCadence="Every 1 hour"
        staleThresholdMinutes={90}
        criticalThresholdMinutes={360}
      />

      <FilterBar
        title="Workspace filters"
        actions={
          <>
            <Button type="button" variant="border" size="m" onClick={() => setFilterOpen(true)} className="gap-1.5">
              <Filter size={14} />Filter
            </Button>
            <Button type="button" variant="border" size="m" onClick={() => toast.info('Export is mocked for this UI pass.')} className="gap-1.5">
              <Download size={14} />Export
            </Button>
            <Button
              type="button" variant="primary" size="m"
              style={{ background: config.color, borderColor: config.color }}
              onClick={() => appId ? navigate(`/apps/${appId}/networks/${config.key}/campaigns/new`) : setWizardOpen(true)}
              className="gap-1.5"
            >
              <Plus size={14} />{config.createButtonLabel}
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

      <NetworkWorkspacePanel
        config={config}
        tabsToRender={tabsToRender}
        activeTabKey={activeTabKey}
        onTabChange={key => { setActiveTabKey(key); if (key !== '__overflow__') setActiveOverflowKey(''); }}
        filterOpen={filterOpen}
        onFilterClose={() => setFilterOpen(false)}
        onClearFilter={clearSearchText}
        wizardOpen={wizardOpen}
        onWizardClose={() => setWizardOpen(false)}
      />
    </div>
  );
};

export default NetworkWorkspaceShell;
