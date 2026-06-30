// meta-batch-theme-picker.tsx — auto-detected theme multi-select with inline media file expand
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { ChevronDown, FileImage, Film, Layers3 } from 'lucide-react';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
          const isOpen = expandedId === t.id;
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
                {/* File count + expand toggle */}
                <button type="button" aria-label="Preview media files in this theme"
                  onClick={() => setExpandedId(isOpen ? null : t.id)}
                  className={cn(
                    'flex items-center gap-1 shrink-0 p-0.5 transition-colors',
                    isOpen ? 'fg_info' : 'text_tertiary hover:text_secondary'
                  )}>
                  <span className="text-[10px]">{t.files.length} file{t.files.length !== 1 ? 's' : ''}</span>
                  <ChevronDown size={12} className={cn('transition-transform duration-150', isOpen && 'rotate-180')} />
                </button>
              </div>

              {/* Inline media file list */}
              {isOpen && (
                <div className="px-3 pb-2 border-t border_secondary pt-1.5 space-y-1 max-h-28 overflow-y-auto">
                  {t.files.map(f => (
                    <div key={f.id} className="flex items-center gap-1.5 min-w-0">
                      {f.type === 'video'
                        ? <Film size={10} className="fg_info shrink-0" />
                        : <FileImage size={10} className="text_secondary shrink-0" />}
                      <span className="text-[10px] text_secondary truncate flex-1">{f.name}</span>
                      {f.duration !== undefined && (
                        <span className="text-[10px] text_tertiary shrink-0">{f.duration}s</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {themes.length === 0 && (
          <div className="text-xs text_tertiary py-4 text-center">No themes detected</div>
        )}
      </div>
    </div>
  );
};
