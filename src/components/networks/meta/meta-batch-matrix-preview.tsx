// meta-batch-matrix-preview.tsx — combination table with name pattern editor + exclude toggles
import React from 'react';
import { Button, cn } from '@frontend-team/ui-kit';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { BatchCombination, NamePattern } from './meta-batch-types';

interface Props {
  combinations: BatchCombination[];
  namePattern: NamePattern;
  onNamePatternChange: (p: NamePattern) => void;
  onToggleExclude: (id: string) => void;
  onGenerate: (activeCombos: BatchCombination[]) => void;
  onBack: () => void;
}

const PATTERN_TOKENS = ['{template}', '{theme}', '{account}', '{date}'];

export const BatchMatrixPreview: React.FC<Props> = ({
  combinations, namePattern, onNamePatternChange, onToggleExclude, onGenerate, onBack,
}) => {
  const active = combinations.filter(c => !c.excluded);

  return (
    <div className="flex flex-col h-full">
      {/* Name pattern editor */}
      <div className="px-6 pt-5 pb-4 border-b border_primary shrink-0">
        <div className="text-xs font-semibold text_secondary mb-2">Campaign Name Pattern</div>
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
        <div className="text-[10px] text_tertiary mt-1.5">
          Preview: <span className="text_secondary font-mono">{active[0]?.generatedName ?? '—'}</span>
        </div>
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
                    combinations.forEach(c => { if (allActive ? !c.excluded : c.excluded) onToggleExclude(c.id); });
                  }}
                  className="w-3.5 h-3.5 accent-[var(--status-info)]" />
              </th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Template</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Theme</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Account</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Generated Name</th>
            </tr>
          </thead>
          <tbody>
            {combinations.map(c => (
              <tr key={c.id}
                className={cn(
                  'border-b border_secondary transition-colors',
                  c.excluded ? 'opacity-40 bg_secondary' : 'hover:bg_secondary'
                )}>
                <td className="px-3 py-2">
                  <input type="checkbox" checked={!c.excluded} onChange={() => onToggleExclude(c.id)}
                    className="w-3.5 h-3.5 accent-[var(--status-info)]" />
                </td>
                <td className="px-3 py-2 text_primary font-medium max-w-[140px]">
                  <span className="truncate block">{c.template.name}</span>
                </td>
                <td className="px-3 py-2 text_secondary max-w-[140px]">
                  <span className="truncate block">{c.theme.name}</span>
                </td>
                <td className="px-3 py-2 text_secondary max-w-[120px]">
                  <span className="truncate block">{c.account.name}</span>
                </td>
                <td className="px-3 py-2 text_primary max-w-[260px]">
                  <span className="truncate block font-mono text-[11px]">{c.generatedName}</span>
                </td>
              </tr>
            ))}
            {combinations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text_tertiary">No combinations</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
        <div className="flex items-center gap-3">
          <Button type="button" variant="border" size="m" onClick={onBack} className="gap-1.5">
            <ArrowLeft size={14} /> Back
          </Button>
          <span className="text-xs text_tertiary">
            Selected: <span className="text_primary font-medium">{active.length}</span>/{combinations.length}
          </span>
        </div>
        <Button type="button" variant="primary" size="m"
          disabled={active.length === 0} onClick={() => onGenerate(active)} className="gap-1.5">
          Generate {active.length} Campaign{active.length !== 1 ? 's' : ''} <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};
