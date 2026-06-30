import React from 'react';
import { ChevronDown, Play, Plus, Trash2 } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import { Input, Segmented, Select } from '@/components/ui-kit-compat';
import { FilterChip, SurfaceSection, StatusBadge } from '@/components/ui';
import { FILTER_CHIPS } from './meta-filter-presets';
import { ENTITY_META } from './meta-table-config';
import type { FilterOperator, FilterField, FilterRule, MetaEntity } from './meta-types';

interface MetaWorkspaceFilterPanelProps {
  entity: MetaEntity;
  filtersOpen: boolean;
  draftFilters: FilterRule[];
  appliedFiltersCount: number;
  activeChips: Set<string>;
  onToggleOpen: () => void;
  onReset: () => void;
  onApply: () => void;
  onToggleChip: (chipId: string) => void;
  onUpdateRule: (ruleId: string, patch: Partial<FilterRule>) => void;
  onRemoveRule: (ruleId: string) => void;
  onAddRule: () => void;
}

export const MetaWorkspaceFilterPanel: React.FC<MetaWorkspaceFilterPanelProps> = ({
  entity,
  filtersOpen,
  draftFilters,
  appliedFiltersCount,
  activeChips,
  onToggleOpen,
  onReset,
  onApply,
  onToggleChip,
  onUpdateRule,
  onRemoveRule,
  onAddRule,
}) => (
  <SurfaceSection
    title="Customize filters"
    description="Combine quick chips with rule-based filtering for account, entity, and status."
    action={appliedFiltersCount > 0 ? <StatusBadge label={`${appliedFiltersCount} active`} variant="neutral" /> : null}
    padding="sm"
    className="overflow-hidden p-0"
  >
    <button type="button" onClick={onToggleOpen} className="flex w-full items-center justify-between border-0 bg-transparent px-4 py-3">
      <span className="body_s font-semibold text_primary">Filter builder</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="border-0 bg-transparent body_xs text_secondary"
          onClick={(event) => {
            event.stopPropagation();
            onReset();
          }}
        >
          Clear
        </button>
        <Button
          type="button"
          variant="dim"
          size="s"
          className="gap-1.5"
          onClick={(event) => {
            event.stopPropagation();
            onApply();
            toast.success('Filters applied');
          }}
        >
          <Play size={13} />
          Run
        </Button>
        <ChevronDown size={15} className={cn('transition-transform', filtersOpen ? 'rotate-180' : '')} />
      </div>
    </button>

    <div className="border-t border_secondary px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="body_xs font-semibold text_tertiary">Quick:</span>
        {FILTER_CHIPS.map((chip) => (
          <FilterChip
            key={chip.id}
            label={chip.label}
            active={activeChips.has(chip.id)}
            onClick={() => onToggleChip(chip.id)}
          />
        ))}
      </div>
    </div>

    {filtersOpen && (
      <div className="space-y-3 border-t border_secondary p-4">
        {draftFilters.map((rule) => (
          <div key={rule.id} className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[180px_200px_1fr_auto]">
            <Select
              value={rule.field}
              options={[
                { value: 'entity', label: ENTITY_META[entity].singular },
                { value: 'status', label: 'Status' },
                { value: 'account', label: 'Account' },
              ]}
              onChange={(value) => onUpdateRule(rule.id, { field: value as FilterField })}
            />
            <Segmented
              size="small"
              value={rule.operator}
              options={['is', 'is not', 'contains', 'in']}
              onChange={(value) => onUpdateRule(rule.id, { operator: value as FilterOperator })}
            />
            <Input
              value={rule.value}
              placeholder={rule.operator === 'in' ? 'Value 1, Value 2' : 'Type filter value'}
              onChange={(event) => onUpdateRule(rule.id, { value: event.target.value })}
            />
            <Button type="button" variant="danger" size="icon-s" aria-label="Remove filter rule" onClick={() => onRemoveRule(rule.id)}>
              <Trash2 size={13} />
            </Button>
          </div>
        ))}

        <Button type="button" variant="border" size="s" className="gap-1.5" onClick={onAddRule}>
          <Plus size={13} />
          Add filter rule
        </Button>
      </div>
    )}
  </SurfaceSection>
);

export default MetaWorkspaceFilterPanel;
