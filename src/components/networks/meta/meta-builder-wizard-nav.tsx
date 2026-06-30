// WizardNav — hierarchical tree navigation for Meta campaign builder
import React from 'react';
import { FileText, LayoutGrid, Layers3, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@frontend-team/ui-kit';
import { Dropdown } from '@/components/ui-kit-compat';

export interface NavAd { id: string; name: string }
export interface NavAdset { id: string; name: string; ads: NavAd[] }
export interface NavSelection { level: 'campaign' | 'adset' | 'ad'; adsetId?: string; adId?: string }

interface WizardNavProps {
  campaignName: string;
  adsets: NavAdset[];
  selection: NavSelection;
  onSelectCampaign: () => void;
  onSelectAdset: (id: string) => void;
  onSelectAd: (adsetId: string, adId: string) => void;
  onAddAdset: () => void;
  onAddAd?: (adsetId: string) => void;
  onBulkCreateAds: (adsetId: string) => void;
}

const isMatch = (a: NavSelection, b: NavSelection) =>
  a.level === b.level && a.adsetId === b.adsetId && a.adId === b.adId;

const rowBase = 'w-full flex items-center gap-1.5 text-left rounded-md cursor-pointer transition-colors';

export const WizardNav: React.FC<WizardNavProps> = ({ campaignName, adsets, selection, onSelectCampaign, onSelectAdset, onSelectAd, onAddAdset, onAddAd, onBulkCreateAds }) => (
  <aside className="w-64 shrink-0 bg_primary border-r border_primary p-3 flex flex-col overflow-y-auto">
    {/* Header */}
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border_secondary">
      <div className="w-9 h-9 radius_8 bg_secondary border border_secondary flex items-center justify-center">
        <img src="/logo/meta.png" alt="Meta" className="w-5 h-5 object-contain" />
      </div>
      <div>
        <div className="body_s font-bold text_primary leading-tight">Meta Ads</div>
        <div className="text-[11px] text_tertiary">Campaign Builder</div>
      </div>
    </div>

    {/* Tree */}
    <div className="flex-1 space-y-px">
      {/* Campaign row */}
      <button
        type="button"
        onClick={onSelectCampaign}
        className={cn(rowBase, 'px-2 py-2 body_s font-medium', isMatch(selection, { level: 'campaign' }) ? 'fg_blue_strong' : 'text_primary hover:bg_secondary')}
      >
        {isMatch(selection, { level: 'campaign' }) ? <span className="text-[var(--status-info)] leading-none">•</span> : <span className="w-2" />}
        <LayoutGrid size={14} className="shrink-0" />
        <span className="truncate flex-1">{campaignName}</span>
      </button>

      {/* AdSets + Ads */}
      {adsets.map((adset) => {
        const adsetSel: NavSelection = { level: 'adset', adsetId: adset.id };
        const adsetActive = isMatch(selection, adsetSel);
        return (
          <div key={adset.id} className="group">
            <div className={cn('w-full flex items-center rounded-md transition-colors', adsetActive ? 'fg_blue_strong' : 'text_secondary hover:bg_secondary')}>
              <button
                type="button"
                onClick={() => onSelectAdset(adset.id)}
                className="flex items-center gap-1.5 flex-1 min-w-0 pl-5 py-2 text-left body_s font-medium"
              >
                {adsetActive ? <span className="text-[var(--status-info)] text-xs leading-none">•</span> : <span className="w-2" />}
                <Layers3 size={13} className="shrink-0" />
                <span className="truncate flex-1">{adset.name}</span>
              </button>
              <Dropdown menu={{ items: [
                { key: 'add-ad', label: 'Add Ad', onClick: () => onAddAd?.(adset.id) },
                { key: 'bulk', label: 'Create Multiple Ads', onClick: () => onBulkCreateAds(adset.id) },
                { key: 'dup', label: 'Duplicate', disabled: true },
                { key: 'copy', label: 'Copy', disabled: true },
                { key: 'del-ads', label: 'Delete All Ads', disabled: true },
                { key: 'del', label: 'Delete Ad Set', disabled: true },
              ] }}>
                <button type="button" onClick={e => e.stopPropagation()} aria-label="Adset options"
                  className="w-6 h-6 mr-1 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text_tertiary hover:bg_tertiary shrink-0 transition-opacity">
                  <MoreHorizontal size={13} />
                </button>
              </Dropdown>
            </div>

            {adset.ads.map((ad) => {
              const adSel: NavSelection = { level: 'ad', adsetId: adset.id, adId: ad.id };
              const adActive = isMatch(selection, adSel);
              return (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => onSelectAd(adset.id, ad.id)}
                  className={cn(rowBase, 'pl-9 pr-2 py-1.5 text-xs', adActive ? 'fg_blue_strong' : 'text_tertiary hover:bg_secondary')}
                >
                  <span className={cn('w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center', adActive ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary')}>
                    {adActive && <svg viewBox="0 0 8 6" fill="none" className="w-1.5 h-1.5"><path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  <FileText size={12} className="shrink-0" />
                  <span className="truncate flex-1">{ad.name}</span>
                </button>
              );
            })}
          </div>
        );
      })}

      {/* Add Ad Set */}
      <button
        type="button"
        onClick={onAddAdset}
        className="w-full mt-2 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md border border-dashed border_secondary text_tertiary hover:text_secondary hover:border_primary transition-colors text-xs"
      >
        <Plus size={12} />Add Ad Set
      </button>
    </div>
  </aside>
);
