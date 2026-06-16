import React from 'react';
import { Button, cn } from '@frontend-team/ui-kit';

interface FilterBarProps {
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  applyLabel?: string;
  resetLabel?: string;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  onApply,
  onReset,
  applyLabel = 'Apply',
  resetLabel = 'Reset',
  title,
  actions,
  className,
}) => (
  <div
    className={cn(
      'flex flex-wrap items-center gap-3 radius_8 border border_primary bg_primary px-4 py-3',
      className,
    )}
  >
    {title && <span className="text-xs font-semibold uppercase text_tertiary">{title}</span>}

    {children}

    <div className="ml-auto flex items-center gap-2">
      {actions ?? (
        <>
          {onReset && (
            <Button type="button" variant="subtle" size="s" onClick={onReset} className="text-xs">
              {resetLabel}
            </Button>
          )}
          {onApply && (
            <Button type="button" variant="primary" size="s" onClick={onApply} className="text-xs">
              {applyLabel}
            </Button>
          )}
        </>
      )}
    </div>
  </div>
);

export default FilterBar;
