import React from 'react';
import { Button, cn } from '@frontend-team/ui-kit';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick, className }) => (
  <Button
    type="button"
    variant={active ? 'secondary' : 'border'}
    size="sm"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'radius_round px-3 text-[11px] font-semibold',
      active
        ? 'bg_accent_primary_subtle fg_accent_primary border_accent_primary_contrast'
        : 'bg_primary text_secondary border_secondary hover:state_bg_button_tertiary_soft',
      className,
    )}
  >
    {label}
  </Button>
);

interface FilterChipGroupProps {
  label: string;
  options: { key: string; label: string }[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
  onClear: () => void;
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  label,
  options,
  selectedKeys,
  onToggle,
  onClear,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="w-16 text-[11px] font-semibold text_tertiary">{label}:</span>
    <FilterChip label="All" active={selectedKeys.length === 0} onClick={onClear} />
    {options.map((opt) => (
      <FilterChip
        key={opt.key}
        label={opt.label}
        active={selectedKeys.includes(opt.key)}
        onClick={() => onToggle(opt.key)}
      />
    ))}
  </div>
);

export default FilterChip;
