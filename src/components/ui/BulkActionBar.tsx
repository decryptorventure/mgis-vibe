// BulkActionBar — shared floating selection toolbar, slides in when count > 0
import React from 'react';
import { X } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface BulkActionBarProps {
  count: number;
  itemLabel?: string;
  actions: BulkAction[];
  onClear: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  count,
  itemLabel = 'items',
  actions,
  onClear,
}) => (
  <div
    role="toolbar"
    aria-label="Bulk actions"
    aria-hidden={count === 0}
    className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]',
      'flex items-center gap-3 px-5 py-3 rounded-full',
      'bg_primary border border_secondary',
      'transition-all duration-200 ease-out select-none',
      count > 0
        ? 'translate-y-0 opacity-100 pointer-events-auto'
        : 'translate-y-4 opacity-0 pointer-events-none'
    )}
    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}
  >
    <span className="text-xs font-semibold text_secondary whitespace-nowrap">
      {count} {itemLabel} selected
    </span>
    <div className="w-px h-4 bg_secondary shrink-0" />
    <div className="flex items-center gap-2">
      {actions.map((action, i) => (
        <Button
          key={i}
          size="s"
          variant="border"
          onClick={action.onClick}
          className={cn('flex items-center gap-1.5', action.danger && 'fg_error border_error')}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
    <button
      type="button"
      onClick={onClear}
      aria-label="Clear selection"
      className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text_tertiary hover:text_primary hover:bg_secondary transition-colors cursor-pointer bg-transparent border-0 shrink-0"
    >
      <X size={12} />
    </button>
  </div>
);

export default BulkActionBar;
