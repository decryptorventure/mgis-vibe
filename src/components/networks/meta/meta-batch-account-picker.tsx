// meta-batch-account-picker.tsx — ad account multi-select list for batch generator
import React from 'react';
import { cn } from '@frontend-team/ui-kit';
import { Users } from 'lucide-react';
import type { BatchAccount } from './meta-batch-types';

interface Props {
  accounts: BatchAccount[];
  selected: string[];
  onToggle: (id: string) => void;
}

const CheckMark = () => (
  <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
    <path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BatchAccountPicker: React.FC<Props> = ({ accounts, selected, onToggle }) => {
  const allSelected = accounts.length > 0 && selected.length === accounts.length;

  const toggleAll = () => {
    if (allSelected) {
      accounts.forEach(a => { if (selected.includes(a.id)) onToggle(a.id); });
    } else {
      accounts.forEach(a => { if (!selected.includes(a.id)) onToggle(a.id); });
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <Users size={13} className="shrink-0" />
          Ad Accounts
          <span className="font-normal text_tertiary normal-case tracking-normal">
            ({selected.length}/{accounts.length})
          </span>
        </div>
        <button type="button" onClick={toggleAll}
          className="text-[11px] text_tertiary hover:text_secondary transition-colors">
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {accounts.map(a => {
          const isSelected = selected.includes(a.id);
          return (
            <button key={a.id} type="button" onClick={() => onToggle(a.id)}
              className={cn(
                'w-full text-left border radius_8 px-3 py-2 transition-colors',
                isSelected
                  ? 'border_accent_secondary bg_info'
                  : 'border_primary bg_primary hover:bg_secondary'
              )}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-4 h-4 radius_8 border shrink-0 flex items-center justify-center',
                  isSelected
                    ? 'border-[var(--status-info)] bg-[var(--status-info)]'
                    : 'border_secondary bg_primary'
                )}>
                  {isSelected && <CheckMark />}
                </span>
                <span className="body_s font-medium text_primary">{a.name}</span>
              </div>
            </button>
          );
        })}
        {accounts.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">No accounts available</div>
        )}
      </div>
    </div>
  );
};
