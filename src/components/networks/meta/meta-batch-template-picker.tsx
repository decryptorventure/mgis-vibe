// meta-batch-template-picker.tsx — MetaTemplate multi-select with search + inline detail expand
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { ChevronDown, LayoutGrid, Search } from 'lucide-react';
import type { MetaTemplate } from './meta-types';

interface Props {
  templates: MetaTemplate[];
  selected: string[];
  onToggle: (id: string) => void;
}

const CheckMark = () => (
  <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
    <path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BatchTemplatePicker: React.FC<Props> = ({ templates, selected, onToggle }) => {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? templates.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : templates;

  const allFilteredSelected = filtered.length > 0 && filtered.every(t => selected.includes(t.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      filtered.forEach(t => { if (selected.includes(t.id)) onToggle(t.id); });
    } else {
      filtered.forEach(t => { if (!selected.includes(t.id)) onToggle(t.id); });
    }
  };

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <LayoutGrid size={13} className="shrink-0" />
          Templates
          <span className="font-normal text_tertiary normal-case tracking-normal">
            ({selected.length}/{templates.length})
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
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search templates…"
          aria-label="Search templates"
          className="w-full border border_primary radius_8 pl-7 pr-2.5 py-1 text-[11px] text_primary bg_secondary outline-none placeholder:text_tertiary focus:border_accent_secondary" />
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {filtered.map(t => {
          const isSelected = selected.includes(t.id);
          const isOpen = previewId === t.id;
          return (
            <div key={t.id}
              className={cn(
                'border radius_8 transition-colors',
                isSelected ? 'border_accent_secondary bg_info' : 'border_primary bg_primary'
              )}>
              <div className="flex items-center gap-1.5 px-3 py-2">
                <button type="button" onClick={() => onToggle(t.id)} role="checkbox" aria-checked={isSelected}
                  aria-label={`${isSelected ? 'Deselect' : 'Select'} template ${t.name}`}
                  className="flex items-center gap-2 flex-1 text-left min-w-0">
                  <span className={cn(
                    'w-4 h-4 radius_8 border shrink-0 flex items-center justify-center',
                    isSelected ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary bg_primary'
                  )}>
                    {isSelected && <CheckMark />}
                  </span>
                  <span className="body_s font-medium text_primary truncate">{t.name}</span>
                </button>
                <span className="text-[10px] bg_secondary border border_secondary radius_8 px-1.5 py-0.5 text_tertiary shrink-0">
                  {t.objective}
                </span>
                <button type="button" aria-label="Toggle template details"
                  onClick={() => setPreviewId(isOpen ? null : t.id)}
                  className={cn('shrink-0 p-0.5 transition-colors', isOpen ? 'fg_info' : 'text_tertiary hover:text_secondary')}>
                  <ChevronDown size={12} className={cn('transition-transform duration-150', isOpen && 'rotate-180')} />
                </button>
              </div>

              {isOpen && (
                <div className="px-3 pb-2.5 border-t border_secondary pt-2 space-y-1.5">
                  {t.account && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text_tertiary">Account</span>
                      <span className="text-[10px] bg_info border border_accent_secondary radius_8 px-1.5 py-0.5 fg_info font-medium">{t.account.name}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[56px_1fr] gap-x-2 gap-y-0.5 text-[10px]">
                    <span className="text_tertiary">Age</span>
                    <span className="text_secondary">{t.age}</span>
                    <span className="text_tertiary">Attribution</span>
                    <span className="text_secondary">{t.attribution}</span>
                  </div>
                  {t.placements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.placements.map(p => (
                        <span key={p}
                          className="text-[10px] bg_secondary border border_secondary radius_8 px-1.5 py-0.5 text_secondary">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">
            {query.trim() ? `No results for "${query}"` : 'No templates available'}
          </div>
        )}
      </div>
    </div>
  );
};
