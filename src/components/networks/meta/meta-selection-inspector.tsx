// Selection Inspector — summary panel shown when one or more rows are selected
import React from 'react';
import { Edit3, GitBranch } from 'lucide-react';
import { Button } from '@frontend-team/ui-kit';
import type { Campaign, AdSet, Ad } from '@/shared/mock-data';
import type { MetaEntity, MetaReportRow } from './meta-types';
import { ENTITY_META } from './meta-table-config';
import { isCampaign, isAdSet, isAd, getMetricValue, formatMetricValue } from './meta-metric-helpers';

interface SelectionInspectorProps {
  entity: MetaEntity;
  selectedRows: MetaReportRow[];
  campaigns: Campaign[];
  adSets: AdSet[];
  ads: Ad[];
  onEdit: (row: MetaReportRow) => void;
  onDrillDown: (row: MetaReportRow) => void;
}

export const SelectionInspector: React.FC<SelectionInspectorProps> = ({
  entity,
  selectedRows,
  campaigns,
  adSets,
  ads,
  onEdit,
  onDrillDown,
}) => {
  if (selectedRows.length === 0) return null;

  const first = selectedRows[0];
  const level = ENTITY_META[entity].singular;
  const amountSpent = getMetricValue(first, 'amountSpent');
  const installs = getMetricValue(first, 'appInstalls');
  const cpa = getMetricValue(first, 'costPerAppInstall');
  const childAdSets = isCampaign(first) ? adSets.filter(adSet => adSet.campaignId === first.id).length : 0;
  const childAds = isCampaign(first)
    ? ads.filter(ad => ad.campaignId === first.id).length
    : isAdSet(first)
      ? ads.filter(ad => ad.adSetId === first.id).length
      : 0;
  const parentCampaignName =
    isAdSet(first) || isAd(first)
      ? campaigns.find(campaign => campaign.id === first.campaignId)?.name
      : undefined;
  const warnings = [
    first.status === 'DRAFT' ? 'Draft not launched' : '',
    first.status === 'ERROR' || first.status === 'REJECTED' ? 'Needs review' : '',
    !isAd(first) && first.budget <= 0 ? 'Missing budget' : '',
    isAd(first) && !first.creativeName ? 'Missing creative' : '',
  ].filter(Boolean);

  return (
    <div className="bg_primary border border_primary radius_8 p-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase text_tertiary">Selection Inspector</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_blue_subtle fg_blue_strong border border_blue">{selectedRows.length} selected</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_secondary border border_secondary text_secondary">{level}</span>
          </div>
          <div className="text-sm font-semibold text_primary mt-1 truncate">{first.name}</div>
          <div className="text-xs text_tertiary mt-1">
            Spend {formatMetricValue('amountSpent', amountSpent)} · Installs {formatMetricValue('appInstalls', installs)} · CPI {formatMetricValue('costPerAppInstall', cpa)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isCampaign(first) && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{childAdSets} ad sets</span>}
          {isCampaign(first) && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{childAds} ads</span>}
          {isAdSet(first) && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{childAds} ads</span>}
          {parentCampaignName && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{parentCampaignName}</span>}
          {warnings.length === 0 ? (
            <span className="text-xs fg_emerald_strong px-2 py-1 bg_emerald_subtle border border_emerald radius_4">No obvious blockers</span>
          ) : warnings.map(warning => (
            <span key={warning} className="text-xs fg_amber_strong px-2 py-1 bg_amber_subtle border border_amber radius_4">{warning}</span>
          ))}
          <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => onEdit(first)}>
            <Edit3 size={13} />
            Edit
          </Button>
          {!isAd(first) && (
            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => onDrillDown(first)}>
              <GitBranch size={13} />
              Drill down
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
