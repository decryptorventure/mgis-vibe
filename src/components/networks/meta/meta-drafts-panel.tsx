// Draft campaigns panel — collapsible list of in-progress campaign drafts
import React from 'react';
import { ChevronDown, Edit3, FileText, Trash2 } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { DraftCampaign } from './meta-types';

const ProgressChip: React.FC<{ label: string; count: number; total: number }> = ({ label, count, total }) => (
  <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium bg_secondary border border_secondary text_secondary">
    <span className={cn('w-2 h-2 radius_round', count === total ? 'bg_emerald_medium' : 'bg_quaternary')} />
    {label} {count}/{total}
  </span>
);

interface DraftCampaignsPanelProps {
  drafts: DraftCampaign[];
  collapsed: boolean;
  onToggle: () => void;
  onContinue: (draft: DraftCampaign) => void;
  onDelete: (draftId: string) => void;
}

export const DraftCampaignsPanel: React.FC<DraftCampaignsPanelProps> = ({
  drafts,
  collapsed,
  onToggle,
  onContinue,
  onDelete,
}) => (
  <div className="radius_8 overflow-hidden border border_blue bg_blue_subtle">
    <div className="flex items-center justify-between px-4 py-3 border-b border_blue">
      <div className="flex items-center gap-2 text-sm font-semibold fg_blue_strong">
        <FileText size={16} />
        {drafts.length} Draft Campaigns
        {collapsed && <span className="text-xs font-medium text_secondary">hidden for focus</span>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="bg-transparent border-0 cursor-pointer text_primary inline-flex items-center gap-1 text-xs font-semibold"
        aria-label={collapsed ? 'Expand draft campaigns' : 'Collapse draft campaigns'}
      >
        {collapsed ? 'Show' : 'Hide'}
        <ChevronDown size={16} className={cn('transition-transform', collapsed ? '' : 'rotate-180')} />
      </button>
    </div>
    {!collapsed && (
      <div className="p-3 space-y-2">
        {drafts.map(draft => (
          <div key={draft.id} className="bg_primary border border_primary radius_8 px-3 py-2.5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text_primary">{draft.name}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 radius_4 bg_emerald_subtle fg_emerald_strong border border_emerald">
                  {draft.objective}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 radius_4 bg_secondary border border_secondary text_secondary">
                  DRAFT
                </span>
                <span className="text-xs text_tertiary">{draft.budget}</span>
                <span className="text-xs text_tertiary">{draft.updatedAt}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <ProgressChip label="Campaign" count={draft.progress.campaign} total={draft.progress.campaignTotal ?? 1} />
                <ProgressChip label="Adsets" count={draft.progress.adsets} total={draft.progress.adsetsTotal ?? 1} />
                <ProgressChip label="Creatives" count={draft.progress.creatives} total={draft.progress.creativesTotal ?? 1} />
                <ProgressChip label="Ads" count={draft.progress.ads} total={draft.progress.adsTotal ?? 1} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => onContinue(draft)}>
                <Edit3 size={13} />
                Continue
              </Button>
              <Button type="button" variant="danger" size="icon-s" aria-label={`Delete ${draft.name}`} onClick={() => onDelete(draft.id)}>
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
