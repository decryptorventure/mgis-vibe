// Inner panel/card section extracted from NetworkWorkspaceShell
// Renders the tab card, advanced filters drawer, and campaign wizard modal
import React from 'react';
import { Card, Tabs, Drawer, Select, DatePicker, Switch } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { ListFilter } from 'lucide-react';
import { CampaignWizardModal } from '../campaign-wizard/campaign-wizard-modal';
import type { NetworkConfig } from '@/shared/network-config';

interface TabItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

interface Props {
  config: NetworkConfig;
  tabsToRender: TabItem[];
  activeTabKey: string;
  onTabChange: (key: string) => void;
  filterOpen: boolean;
  onFilterClose: () => void;
  onClearFilter: () => void;
  wizardOpen: boolean;
  onWizardClose: () => void;
}

export const NetworkWorkspacePanel: React.FC<Props> = ({
  config,
  tabsToRender,
  activeTabKey,
  onTabChange,
  filterOpen,
  onFilterClose,
  onClearFilter,
  wizardOpen,
  onWizardClose,
}) => (
  <>
    {/* Main content card with tabs */}
    <Card className="rounded-lg overflow-hidden" styles={{ body: { padding: 0 } }}>
      <Tabs
        items={tabsToRender}
        activeKey={activeTabKey}
        onChange={onTabChange}
        className="px-4 pt-2"
      />
    </Card>

    {/* Advanced Filters Drawer */}
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <ListFilter size={18} className="text-[var(--text-primary)]" />
          <span className="font-bold">Advanced Filters</span>
        </div>
      }
      placement="right"
      onClose={onFilterClose}
      open={filterOpen}
      width={380}
      styles={{
        header: { padding: '16px 20px' },
        body: { padding: '20px', background: 'var(--surface-subtle)' },
      }}
      footer={
        <div className="flex justify-between items-center w-full">
          <Button variant="subtle" size="m" onClick={() => { onClearFilter(); onFilterClose(); }}>Reset</Button>
          <Button variant="primary" size="m" onClick={() => { onFilterClose(); toast.success('Filters applied'); }}>Apply Filters</Button>
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
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PAUSED', label: 'Paused' },
              { value: 'DELETED', label: 'Deleted' },
            ]}
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
            options={[
              { value: 'all', label: 'All Budgets' },
              { value: 'cbo', label: 'Campaign Budget Optimization (CBO)' },
              { value: 'abo', label: 'AdSet Budget Optimization (ABO)' },
            ]}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">ROAS Target</label>
          <div className="flex items-center gap-3">
            <input placeholder="Min" className="w-full border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm bg-[var(--surface-base)]" type="number" />
            <span className="text-[var(--text-tertiary)] font-bold">-</span>
            <input placeholder="Max" className="w-full border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm bg-[var(--surface-base)]" type="number" />
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

    {/* Campaign wizard */}
    {wizardOpen && (
      <CampaignWizardModal
        open={wizardOpen}
        onClose={onWizardClose}
        defaultNetwork={config.key}
      />
    )}
  </>
);
