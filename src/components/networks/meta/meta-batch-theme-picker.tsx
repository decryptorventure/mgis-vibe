// meta-batch-theme-picker.tsx — auto-detected theme multi-select for batch generator
import React from 'react';
import { cn } from '@frontend-team/ui-kit';
import { Film, Layers3 } from 'lucide-react';
import type { BatchTheme } from './meta-batch-types';

interface Props {
  themes: BatchTheme[];
  selected: string[];
  onToggle: (id: string) => void;
}

const CheckMark = () => (
  <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
    <path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BatchThemePicker: React.FC<Props> = ({ themes, selected, onToggle }) => {
  const allSelected = themes.length > 0 && selected.length === themes.length;

  const toggleAll = () => {
    if (allSelected) {
      themes.forEach(t => { if (selected.includes(t.id)) onToggle(t.id); });
    } else {
      themes.forEach(t => { if (!selected.includes(t.id)) onToggle(t.id); });
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text_secondary uppercase tracking-wide">
          <Layers3 size={13} className="shrink-0" />
          Themes
          <span className="font-normal text_tertiary normal-case tracking-normal">
            ({selected.length}/{themes.length})
          </span>
        </div>
        <button type="button" onClick={toggleAll}
          className="text-[11px] text_tertiary hover:text_secondary transition-colors">
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {themes.map(t => {
          const isSelected = selected.includes(t.id);
          const videoCount = t.files.filter(f => f.type === 'video').length;
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
              <div className="mt-1 pl-6 flex items-center gap-2">
                <Film size={10} className="text_tertiary shrink-0" />
                <span className="text-[11px] text_tertiary">
                  {videoCount} video{videoCount !== 1 ? 's' : ''}
                </span>
                {t.files.length !== videoCount && (
                  <span className="text-[10px] text_tertiary">({t.files.length} total)</span>
                )}
              </div>
            </button>
          );
        })}
        {themes.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">No themes detected</div>
        )}
      </div>
    </div>
  );
};
