// meta-batch-matrix-preview.tsx — live preview: name pattern + flat campaign list grouped by template
import React, { useMemo, useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { Tag } from '@/components/ui-kit-compat';
import { AlertTriangle, ChevronDown, LayoutGrid } from 'lucide-react';
import type { BatchAdCopy, BatchCombination, NamePattern } from './meta-batch-types';
import type { MediaFile } from './meta-media-library-modal';
import { BatchAdCopySection } from './meta-batch-ad-copy-section';
import { BatchAdCard } from './meta-batch-ad-card';
import { BatchNamePatternEditor } from './meta-batch-name-pattern-editor';

interface Props {
  combinations: BatchCombination[];
  excludedCampaigns: Set<string>;       // per-campaign key: `${combo.id}:${sliceIndex}`
  namePattern: NamePattern;
  onNamePatternChange: (p: NamePattern) => void;
  onToggleExclude: (key: string) => void;
  onToggleAll: (excludeAll: boolean) => void;
  adCopy: BatchAdCopy;
  onAdCopyChange: (c: BatchAdCopy) => void;
}

// Returns the specific media files assigned to a slice (sequential allocation)
function getSliceFiles(combo: BatchCombination, sliceIndex: number): MediaFile[] {
  const start = combo.slices.slice(0, sliceIndex).reduce((sum, n) => sum + n, 0);
  return combo.theme.files.slice(start, start + combo.slices[sliceIndex]);
}

export const BatchLivePreview: React.FC<Props> = ({
  combinations, excludedCampaigns, namePattern, onNamePatternChange,
  onToggleExclude, onToggleAll, adCopy, onAdCopyChange,
}) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const allKeys = useMemo(
    () => combinations.flatMap(c => c.slices.map((_, i) => `${c.id}:${i}`)),
    [combinations]
  );
  const activeCampaigns = allKeys.filter(k => !excludedCampaigns.has(k)).length;
  const allSelected  = allKeys.length > 0 && activeCampaigns === allKeys.length;
  const allExcluded  = allKeys.length > 0 && activeCampaigns === 0;

  const grouped = useMemo(() => {
    const map = new Map<string, { template: BatchCombination['template']; combos: BatchCombination[] }>();
    combinations.forEach(c => {
      if (!map.has(c.template.id)) map.set(c.template.id, { template: c.template, combos: [] });
      map.get(c.template.id)!.combos.push(c);
    });
    return [...map.values()];
  }, [combinations]);

  const activeNames = useMemo(
    () => combinations.flatMap(c => c.slices.map((_, i) => ({ key: `${c.id}:${i}`, name: c.generatedNames[i] }))
      .filter(({ key }) => !excludedCampaigns.has(key))),
    [combinations, excludedCampaigns]
  );

  if (combinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <div className="w-12 h-12 radius_round bg_secondary flex items-center justify-center">
          <LayoutGrid size={22} className="text_tertiary" />
        </div>
        <div className="text-xs font-semibold text_secondary">No campaigns to preview yet</div>
        <div className="text-[11px] text_tertiary max-w-[280px]">
          Select at least 1 template and 1 theme on the left to see a live preview.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BatchAdCopySection adCopy={adCopy} onChange={onAdCopyChange} />

      <BatchNamePatternEditor
        namePattern={namePattern}
        onNamePatternChange={onNamePatternChange}
        activeCampaigns={activeCampaigns}
        totalCampaigns={allKeys.length}
        activeNames={activeNames}
      />

      {allExcluded && (
        <div role="alert" className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 bg_error_subtle border border-[var(--status-error,#ef4444)]/20 radius_8 shrink-0">
          <AlertTriangle size={12} className="fg_error shrink-0" />
          <span className="text-[11px] fg_error">All campaigns are deselected — none will be generated.</span>
        </div>
      )}

      {/* Flat campaign list grouped by template */}
      <div className="flex-1 overflow-auto mt-2">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg_primary border-b border_primary z-10">
            <tr>
              <th className="w-9 px-3 py-2.5 text-left">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(allSelected)}
                  aria-label={allSelected ? 'Deselect all campaigns' : 'Select all campaigns'}
                  className="w-3.5 h-3.5 accent-[var(--status-info)]" />
              </th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Theme</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Part</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Creatives</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Campaign Name</th>
              <th className="w-8 px-2" />
            </tr>
          </thead>
          <tbody>
            {grouped.map(group => {
              const groupTotal  = group.combos.reduce((s, c) => s + c.slices.length, 0);
              const groupActive = group.combos.reduce((s, c) =>
                s + c.slices.filter((_, i) => !excludedCampaigns.has(`${c.id}:${i}`)).length, 0);
              return (
                <React.Fragment key={group.template.id}>
                  {/* Template group header */}
                  <tr className="border-b border_primary">
                    <td colSpan={6} className="px-3 py-2 bg_secondary border-l-2 border-l-[var(--status-info)]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text_primary">{group.template.name}</span>
                        {group.template.account && (
                          <span className="text-[10px] fg_info bg_info border border_accent_secondary radius_8 px-1.5 py-0.5 font-medium">
                            {group.template.account.name}
                          </span>
                        )}
                        <span className={cn(
                          'text-[10px] radius_8 px-1.5 py-0.5 font-medium ml-auto',
                          groupActive === groupTotal ? 'text-[var(--status-success,#22c55e)] bg-[var(--status-success,#22c55e)]/10' : 'fg_info bg_info'
                        )}>
                          {groupActive}/{groupTotal} campaigns
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* One row per campaign (per slice) */}
                  {group.combos.flatMap(combo =>
                    combo.slices.map((creativeCount, sliceIndex) => {
                      const key        = `${combo.id}:${sliceIndex}`;
                      const isExcluded = excludedCampaigns.has(key);
                      const isExpanded = expandedKey === key;
                      return (
                        <React.Fragment key={key}>
                          <tr className={cn(
                            'border-b border_secondary transition-colors',
                            isExcluded ? 'bg_secondary' : 'hover:bg_secondary'
                          )}>
                            <td className="px-3 py-2">
                              <input type="checkbox" checked={!isExcluded} onChange={() => onToggleExclude(key)}
                                aria-label={isExcluded ? 'Include this campaign' : 'Exclude this campaign'}
                                className="w-3.5 h-3.5 accent-[var(--status-info)]" />
                            </td>
                            <td className="px-3 py-2 text_secondary max-w-[130px]">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{combo.theme.name}</span>
                                {isExcluded && <Tag color="default" className="shrink-0 text-[9px]">Excluded</Tag>}
                              </div>
                              {sliceIndex === 0 && (
                                <span className="text-[10px] text_tertiary">{combo.theme.files.length} files</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span className={cn(
                                'text-[11px] font-semibold px-1.5 py-0.5 radius_8 tabular-nums',
                                combo.slices.length > 1 ? 'fg_info bg_info' : 'text_secondary bg_secondary'
                              )}>
                                {combo.slices.length > 1 ? `${sliceIndex + 1}/${combo.slices.length}` : '1/1'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-[11px] text_secondary font-medium tabular-nums">{creativeCount}</span>
                            </td>
                            <td className="px-3 py-2 max-w-[200px]">
                              <span className="truncate block font-mono text-[11px] text_primary">
                                {combo.generatedNames[sliceIndex]}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <button type="button" aria-label="Preview ad cards"
                                onClick={() => setExpandedKey(isExpanded ? null : key)}
                                className={cn('p-0.5 transition-colors', isExpanded ? 'fg_info' : 'text_tertiary hover:text_secondary')}>
                                <ChevronDown size={12} className={cn('transition-transform duration-150', isExpanded && 'rotate-180')} />
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="border-b border_secondary">
                              <td colSpan={6} className="px-4 py-3 bg_secondary">
                                <div className="text-[10px] text_tertiary mb-2">
                                  {creativeCount} creative{creativeCount !== 1 ? 's' : ''} assigned to this campaign
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-1">
                                  {getSliceFiles(combo, sliceIndex).map(f => (
                                    <BatchAdCard key={f.id} mediaFile={f} adCopy={adCopy}
                                      account={combo.template.account ?? { id: '', name: 'N/A' }} />
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
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
