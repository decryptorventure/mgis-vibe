// meta-batch-template-picker.tsx — MetaTemplate multi-select with inline detail expand
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { ChevronDown, LayoutGrid } from 'lucide-react';
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
  const allSelected = templates.length > 0 && selected.length === templates.length;

  const toggleAll = () => {
    if (allSelected) {
      templates.forEach(t => { if (selected.includes(t.id)) onToggle(t.id); });
    } else {
      templates.forEach(t => { if (!selected.includes(t.id)) onToggle(t.id); });
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <LayoutGrid size={13} className="shrink-0" />
          Templates
          <span className="font-normal text_tertiary normal-case tracking-normal">
            ({selected.length}/{templates.length})
          </span>
        </div>
        <button type="button" onClick={toggleAll}
          className="text-[11px] text_tertiary hover:text_secondary transition-colors">
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {templates.map(t => {
          const isSelected = selected.includes(t.id);
          const isOpen = previewId === t.id;
          return (
            <div key={t.id}
              className={cn(
                'border radius_8 transition-colors',
                isSelected ? 'border_accent_secondary bg_info' : 'border_primary bg_primary'
              )}>
              <div className="flex items-center gap-1.5 px-3 py-2">
                {/* Selection button */}
                <button type="button" onClick={() => onToggle(t.id)}
                  className="flex items-center gap-2 flex-1 text-left min-w-0">
                  <span className={cn(
                    'w-4 h-4 radius_8 border shrink-0 flex items-center justify-center',
                    isSelected ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary bg_primary'
                  )}>
                    {isSelected && <CheckMark />}
                  </span>
                  <span className="body_s font-medium text_primary truncate">{t.name}</span>
                </button>
                {/* Objective chip */}
                <span className="text-[10px] bg_secondary border border_secondary radius_8 px-1.5 py-0.5 text_tertiary shrink-0">
                  {t.objective}
                </span>
                {/* Detail expand toggle */}
                <button type="button" aria-label="Toggle template details"
                  onClick={() => setPreviewId(isOpen ? null : t.id)}
                  className={cn('shrink-0 p-0.5 transition-colors', isOpen ? 'fg_info' : 'text_tertiary hover:text_secondary')}>
                  <ChevronDown size={12} className={cn('transition-transform duration-150', isOpen && 'rotate-180')} />
                </button>
              </div>

              {/* Inline detail section */}
              {isOpen && (
                <div className="px-3 pb-2.5 border-t border_secondary pt-2 space-y-1.5">
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
        {templates.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">No templates available</div>
        )}
      </div>
    </div>
  );
};
