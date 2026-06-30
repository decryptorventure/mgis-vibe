// Filter bar: search input + OS/status/sort dropdowns for NetworkPortfolioWorkspace
import React from 'react';
import { Input, Select } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { Search } from 'lucide-react';
import type { OsFilter, SortMode, StatusFilter } from './use-network-portfolio';

interface Props {
  searchText: string;
  osFilter: OsFilter;
  statusFilter: StatusFilter;
  sortMode: SortMode;
  onSearchChange: (value: string) => void;
  onOsChange: (value: OsFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: SortMode) => void;
  onReviewApps: () => void;
  onReset: () => void;
}

export const NetworkPortfolioFilters: React.FC<Props> = ({
  searchText,
  osFilter,
  statusFilter,
  sortMode,
  onSearchChange,
  onOsChange,
  onStatusChange,
  onSortChange,
  onReviewApps,
  onReset,
}) => (
  <div className="radius_8 border border_primary bg_primary px-4 py-3 flex flex-wrap items-center gap-3">
    <div className="text-xs font-semibold uppercase text_tertiary">Portfolio filters</div>
    <Input
      size="small"
      prefix={<Search size={14} className="text_tertiary" />}
      placeholder="Search app, package, or campaign"
      value={searchText}
      onChange={event => onSearchChange(event.target.value)}
      className="w-80"
      allowClear
    />
    <Select
      size="small"
      className="w-28"
      value={osFilter}
      onChange={value => onOsChange(value as OsFilter)}
      options={[
        { value: 'all', label: 'All OS' },
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
      ]}
    />
    <Select
      size="small"
      className="w-36"
      value={statusFilter}
      onChange={value => onStatusChange(value as StatusFilter)}
      options={[
        { value: 'all', label: 'All states' },
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'draft', label: 'Draft' },
        { value: 'error', label: 'Error' },
      ]}
    />
    <Select
      size="small"
      className="w-36"
      value={sortMode}
      onChange={value => onSortChange(value as SortMode)}
      options={[
        { value: 'spend', label: 'Sort by spend' },
        { value: 'installs', label: 'Sort by installs' },
        { value: 'roas', label: 'Sort by ROAS' },
        { value: 'cpi', label: 'Sort by CPI' },
      ]}
    />
    <div className="ml-auto flex items-center gap-2">
      <Button type="button" variant="border" size="s" onClick={onReviewApps}>
        Review apps
      </Button>
      <Button type="button" variant="border" size="s" onClick={onReset}>
        Reset
      </Button>
    </div>
  </div>
);
