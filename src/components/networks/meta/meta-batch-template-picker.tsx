// meta-batch-template-picker.tsx — MetaTemplate multi-select grid for batch generator
import React from 'react';
import { cn } from '@frontend-team/ui-kit';
import { LayoutGrid } from 'lucide-react';
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
          return (
            <button key={t.id} type="button" onClick={() => onToggle(t.id)}
              className={cn(
                'w-full text-left border radius_8 px-3 py-2.5 transition-colors',
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
                <span className="body_s font-medium text_primary truncate">{t.name}</span>
              </div>
              <div className="mt-1 pl-6 flex gap-2 flex-wrap">
                <span className="text-[10px] bg_secondary border border_secondary radius_8 px-1.5 py-0.5 text_tertiary">
                  {t.objective}
                </span>
                {t.age && (
                  <span className="text-[10px] text_tertiary">Age: {t.age}</span>
                )}
              </div>
            </button>
          );
        })}
        {templates.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">No templates available</div>
        )}
      </div>
    </div>
  );
};
