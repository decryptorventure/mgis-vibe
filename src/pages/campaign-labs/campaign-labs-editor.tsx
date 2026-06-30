// Filter/config panel for CampaignLabs (search + chip filters + active tag list)
import React from 'react';
import { Card, Input, Tag } from '@/components/ui-kit-compat';
import { Search, X, RotateCcw } from 'lucide-react';
import { FilterChipGroup } from '../../components/ui';

interface FilterOption {
  key: string;
  label: string;
}

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  platforms: FilterOption[];
  networks: FilterOption[];
  statuses: FilterOption[];
  selectedPlatforms: string[];
  selectedNetworks: string[];
  selectedStatuses: string[];
  onTogglePlatform: (key: string) => void;
  onToggleNetwork: (key: string) => void;
  onToggleStatus: (key: string) => void;
  onClearPlatforms: () => void;
  onClearNetworks: () => void;
  onClearStatuses: () => void;
  onReset: () => void;
}

const NETWORK_DISPLAY: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta': 'Meta Ads',
  'axon': 'AppLovin',
  'asa': 'Apple Search Ads',
};

export const CampaignLabsEditor: React.FC<Props> = ({
  searchQuery, onSearchChange,
  platforms, networks, statuses,
  selectedPlatforms, selectedNetworks, selectedStatuses,
  onTogglePlatform, onToggleNetwork, onToggleStatus,
  onClearPlatforms, onClearNetworks, onClearStatuses,
  onReset,
}) => {
  const hasActiveFilters = selectedPlatforms.length > 0
    || selectedNetworks.length > 0
    || selectedStatuses.length > 0
    || !!searchQuery;

  return (
    <Card className="rounded-xl" styles={{ body: { padding: '16px' } }}>
      <div className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Search by name, package ID, app ID or keyword..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            prefix={<Search size={16} className="text-[var(--text-tertiary)] mr-2" />}
            className="h-10 rounded-lg text-sm bg-[var(--surface-subtle)] border-[var(--border-default)]"
            allowClear
          />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mr-1">Active Filters:</span>

            {selectedPlatforms.map(p => (
              <Tag key={p} closable onClose={() => onTogglePlatform(p)}
                className="bg-[var(--surface-muted)] border-[var(--border-default)] text-[var(--text-primary)] rounded-md font-medium text-xs px-2.5 py-0.5 flex items-center gap-1"
                closeIcon={<X size={10} />}>
                {p === 'ios' ? 'iOS' : 'Android'}
              </Tag>
            ))}

            {selectedNetworks.map(n => (
              <Tag key={n} closable onClose={() => onToggleNetwork(n)}
                className="bg-[var(--surface-muted)] border-[var(--border-default)] text-[var(--text-primary)] rounded-md font-medium text-xs px-2.5 py-0.5 flex items-center gap-1"
                closeIcon={<X size={10} />}>
                {NETWORK_DISPLAY[n] ?? n}
              </Tag>
            ))}

            {selectedStatuses.map(s => (
              <Tag key={s} closable onClose={() => onToggleStatus(s)}
                className="bg-[var(--surface-muted)] border-[var(--border-default)] text-[var(--text-primary)] rounded-md font-medium text-xs px-2.5 py-0.5 flex items-center gap-1"
                closeIcon={<X size={10} />}>
                {s}
              </Tag>
            ))}

            {searchQuery && (
              <Tag closable onClose={() => onSearchChange('')}
                className="bg-[var(--surface-muted)] border-[var(--border-default)] text-[var(--text-primary)] rounded-md font-medium text-xs px-2.5 py-0.5 flex items-center gap-1"
                closeIcon={<X size={10} />}>
                "{searchQuery}"
              </Tag>
            )}

            <button onClick={onReset}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-transparent border-0 font-bold ml-1.5 flex items-center gap-0.5 cursor-pointer">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        )}

        <div className="space-y-2.5 pt-1 border-t border-[var(--border-subtle)]">
          <FilterChipGroup label="Platform" options={platforms} selectedKeys={selectedPlatforms} onToggle={onTogglePlatform} onClear={onClearPlatforms} />
          <FilterChipGroup label="Network" options={networks} selectedKeys={selectedNetworks} onToggle={onToggleNetwork} onClear={onClearNetworks} />
          <FilterChipGroup label="Status" options={statuses} selectedKeys={selectedStatuses} onToggle={onToggleStatus} onClear={onClearStatuses} />
        </div>
      </div>
    </Card>
  );
};
