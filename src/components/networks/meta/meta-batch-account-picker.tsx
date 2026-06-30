// meta-batch-account-picker.tsx — ad account multi-select with search
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { Search, Users } from 'lucide-react';
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
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? accounts.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    : accounts;

  const allFilteredSelected = filtered.length > 0 && filtered.every(a => selected.includes(a.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      filtered.forEach(a => { if (selected.includes(a.id)) onToggle(a.id); });
    } else {
      filtered.forEach(a => { if (!selected.includes(a.id)) onToggle(a.id); });
    }
  };

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <Users size={13} className="shrink-0" />
          Ad Accounts
          <span className="font-normal text_tertiary normal-case tracking-normal">
            ({selected.length}/{accounts.length})
          </span>
        </div>
        <button type="button" onClick={toggleAll}
          className="text-[11px] text_tertiary hover:text_secondary transition-colors px-1">
          {allFilteredSelected ? 'Clear' : 'Select All'}
        </button>
      </div>

      {/* Search */}
      <div className="relative shrink-0">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text_tertiary pointer-events-none" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search accounts…"
          className="w-full border border_primary radius_8 pl-7 pr-2.5 py-1 text-[11px] text_primary bg_secondary outline-none placeholder:text_tertiary focus:border_accent_secondary" />
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {filtered.map(a => {
          const isSelected = selected.includes(a.id);
          return (
            <button key={a.id} type="button" onClick={() => onToggle(a.id)}
              className={cn(
                'w-full text-left border radius_8 px-3 py-2 transition-colors',
                isSelected ? 'border_accent_secondary bg_info' : 'border_primary bg_primary hover:bg_secondary'
              )}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-4 h-4 radius_8 border shrink-0 flex items-center justify-center',
                  isSelected ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary bg_primary'
                )}>
                  {isSelected && <CheckMark />}
                </span>
                <span className="body_s font-medium text_primary truncate">{a.name}</span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">
            {query.trim() ? `No results for "${query}"` : 'No accounts available'}
          </div>
        )}
      </div>
    </div>
  );
};
