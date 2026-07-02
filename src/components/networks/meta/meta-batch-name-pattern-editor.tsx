// meta-batch-name-pattern-editor.tsx — campaign name pattern token editor + full resolved-name preview
import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_NAME_PATTERN } from './meta-theme-parser';
import type { NamePattern } from './meta-batch-types';

const PATTERN_TOKENS = ['{template}', '{theme}', '{account}', '{date}', '{slice}'];
const NAME_PREVIEW_LIMIT = 4;

interface Props {
  namePattern: NamePattern;
  onNamePatternChange: (p: NamePattern) => void;
  activeCampaigns: number;
  totalCampaigns: number;
  activeNames: { key: string; name: string }[];
}

export const BatchNamePatternEditor: React.FC<Props> = ({
  namePattern, onNamePatternChange, activeCampaigns, totalCampaigns, activeNames,
}) => {
  const [namesExpanded, setNamesExpanded] = useState(false);
  const visibleNames = namesExpanded ? activeNames : activeNames.slice(0, NAME_PREVIEW_LIMIT);

  return (
    <div className="px-5 pt-3.5 pb-3 border-b border_primary shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text_secondary">Campaign Name Pattern</div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text_tertiary">
            <span className="text_primary font-medium">{activeCampaigns}</span>/{totalCampaigns} campaigns
          </span>
          {namePattern !== DEFAULT_NAME_PATTERN && (
            <button type="button" aria-label="Reset pattern" onClick={() => onNamePatternChange(DEFAULT_NAME_PATTERN)}
              className="text_tertiary hover:text_secondary transition-colors">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PATTERN_TOKENS.map(tok => (
          <button key={tok} type="button" onClick={() => onNamePatternChange(namePattern + tok)}
            className="text-[11px] bg_secondary border border_secondary radius_8 px-2 py-0.5 text_secondary hover:border_primary hover:text_primary transition-colors font-mono">
            {tok}
          </button>
        ))}
      </div>
      <input value={namePattern} onChange={e => onNamePatternChange(e.target.value)}
        placeholder="e.g. [{template}] {theme} — {slice}"
        aria-label="Campaign name pattern"
        className="w-full border border_primary radius_8 px-3 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary font-mono" />
      {activeNames.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <div className="text-[10px] text_tertiary">Preview ({activeNames.length} name{activeNames.length !== 1 ? 's' : ''}):</div>
          {visibleNames.map(({ key, name }) => (
            <div key={key} className="text-[10px] text_secondary font-mono truncate">{name}</div>
          ))}
          {activeNames.length > NAME_PREVIEW_LIMIT && (
            <button type="button" onClick={() => setNamesExpanded(v => !v)}
              className="text-[10px] fg_info hover:underline">
              {namesExpanded ? 'Show less' : `+${activeNames.length - NAME_PREVIEW_LIMIT} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
