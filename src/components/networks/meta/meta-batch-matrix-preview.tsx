// meta-batch-matrix-preview.tsx — live preview panel for batch generator (right side)
// 3 sections: Ad Copy editor → Name Pattern editor → Combinations table
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { CTA_OPTIONS } from './meta-batch-types';
import type { BatchAdCopy, BatchCombination, NamePattern } from './meta-batch-types';
import { BatchAdCard } from './meta-batch-ad-card';

interface Props {
  combinations: BatchCombination[];
  namePattern: NamePattern;
  onNamePatternChange: (p: NamePattern) => void;
  onToggleExclude: (id: string) => void;
  adCopy: BatchAdCopy;
  onAdCopyChange: (c: BatchAdCopy) => void;
}

const PATTERN_TOKENS = ['{template}', '{theme}', '{account}', '{date}'];

export const BatchLivePreview: React.FC<Props> = ({
  combinations, namePattern, onNamePatternChange, onToggleExclude, adCopy, onAdCopyChange,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const active = combinations.filter(c => !c.excluded);

  if (combinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <div className="w-12 h-12 radius_round bg_secondary flex items-center justify-center">
          <LayoutGrid size={22} className="text_tertiary" />
        </div>
        <div className="text-xs font-semibold text_secondary">No campaigns to preview yet</div>
        <div className="text-[11px] text_tertiary max-w-[280px]">
          Select at least 1 template, 1 theme, and 1 account on the left to see a live preview.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Ad Copy section */}
      <div className="px-5 pt-4 pb-3 border-b border_primary shrink-0">
        <div className="text-xs font-semibold text_secondary mb-2.5">Ad Copy</div>
        <div className="space-y-2">
          <textarea
            value={adCopy.primaryText}
            onChange={e => onAdCopyChange({ ...adCopy, primaryText: e.target.value })}
            placeholder="Primary text (appears above media in Feed)"
            rows={2}
            className="w-full border border_primary radius_8 px-3 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary resize-none"
          />
          <div className="flex gap-2">
            <input
              value={adCopy.headline}
              onChange={e => onAdCopyChange({ ...adCopy, headline: e.target.value })}
              placeholder="Headline"
              className="flex-1 border border_primary radius_8 px-3 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary"
            />
            <select
              value={adCopy.cta}
              onChange={e => onAdCopyChange({ ...adCopy, cta: e.target.value })}
              className="border border_primary radius_8 px-2 py-1.5 text-xs text_secondary bg_primary outline-none focus:border_accent_secondary">
              {CTA_OPTIONS.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Name pattern editor */}
      <div className="px-5 pt-3.5 pb-3 border-b border_primary shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text_secondary">Campaign Name Pattern</div>
          <span className="text-[11px] text_tertiary">
            <span className="text_primary font-medium">{active.length}</span>/{combinations.length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {PATTERN_TOKENS.map(tok => (
            <button key={tok} type="button"
              onClick={() => onNamePatternChange(namePattern + tok)}
              className="text-[11px] bg_secondary border border_secondary radius_8 px-2 py-0.5 text_secondary hover:border_primary hover:text_primary transition-colors font-mono">
              {tok}
            </button>
          ))}
        </div>
        <input value={namePattern} onChange={e => onNamePatternChange(e.target.value)}
          placeholder="e.g. [{template}] {theme} | {account}"
          className="w-full border border_primary radius_8 px-3 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary font-mono" />
        {active[0] && (
          <div className="text-[10px] text_tertiary mt-1.5">
            Preview: <span className="text_secondary font-mono">{active[0].generatedName}</span>
          </div>
        )}
      </div>

      {/* Combinations table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg_primary border-b border_primary z-10">
            <tr>
              <th className="w-9 px-3 py-2.5 text-left">
                <input type="checkbox"
                  checked={active.length === combinations.length && combinations.length > 0}
                  onChange={() => {
                    const allActive = active.length === combinations.length;
                    combinations.forEach(c => {
                      if (allActive ? !c.excluded : c.excluded) onToggleExclude(c.id);
                    });
                  }}
                  className="w-3.5 h-3.5 accent-[var(--status-info)]" />
              </th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Template</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Theme</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Account</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Generated Name</th>
              <th className="w-8 px-2" />
            </tr>
          </thead>
          <tbody>
            {combinations.map(c => {
              const isExpanded = expandedRowId === c.id;
              return (
                <React.Fragment key={c.id}>
                  <tr className={cn(
                    'border-b border_secondary transition-colors',
                    c.excluded ? 'opacity-40 bg_secondary' : 'hover:bg_secondary'
                  )}>
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={!c.excluded} onChange={() => onToggleExclude(c.id)}
                        className="w-3.5 h-3.5 accent-[var(--status-info)]" />
                    </td>
                    <td className="px-3 py-2 text_primary font-medium max-w-[120px]">
                      <span className="truncate block">{c.template.name}</span>
                    </td>
                    <td className="px-3 py-2 text_secondary max-w-[110px]">
                      <span className="truncate block">{c.theme.name}</span>
                    </td>
                    <td className="px-3 py-2 text_secondary max-w-[100px]">
                      <span className="truncate block">{c.account.name}</span>
                    </td>
                    <td className="px-3 py-2 text_primary">
                      <span className="truncate block font-mono text-[11px]">{c.generatedName}</span>
                    </td>
                    <td className="px-2 py-2">
                      <button type="button" aria-label="Preview ads for this campaign"
                        onClick={() => setExpandedRowId(isExpanded ? null : c.id)}
                        className={cn('p-0.5 transition-colors', isExpanded ? 'fg_info' : 'text_tertiary hover:text_secondary')}>
                        <ChevronDown size={12} className={cn('transition-transform duration-150', isExpanded && 'rotate-180')} />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded: Facebook-style ad card per media file */}
                  {isExpanded && (
                    <tr className="border-b border_secondary">
                      <td colSpan={6} className="px-4 py-3 bg_secondary">
                        <div className="text-[10px] text_tertiary font-semibold mb-2">
                          {c.theme.files.length} ad{c.theme.files.length !== 1 ? 's' : ''} · 1 per media file
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {c.theme.files.map(f => (
                            <BatchAdCard key={f.id} mediaFile={f} adCopy={adCopy} account={c.account} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
