// meta-filter-presets.ts — quick-filter chip definitions and row filter logic
import type { MetaReportRow } from './meta-types';
import { isCampaign } from './meta-metric-helpers';
import type { Campaign } from '@/shared/mock-data';

export interface FilterChip {
  id: string;
  label: string;
}

export const FILTER_CHIPS: FilterChip[] = [
  { id: 'active-only',      label: 'Active only' },
  { id: 'paused-only',      label: 'Paused only' },
  { id: 'budget-over-1k',   label: 'Budget > $1k' },
  { id: 'low-roas',         label: 'ROAS < 1.5' },
];

// Pure row filter — combines all active chips with AND semantics
export function applyChipFilter<T extends MetaReportRow>(rows: T[], activeChips: Set<string>): T[] {
  if (activeChips.size === 0) return rows;
  return rows.filter(row => {
    if (activeChips.has('active-only') && row.status.toUpperCase() !== 'ACTIVE') return false;
    if (activeChips.has('paused-only') && row.status.toUpperCase() !== 'PAUSED') return false;
    if (activeChips.has('budget-over-1k')) {
      const budget = isCampaign(row) ? (row as Campaign).budget : (row as { budget?: number }).budget ?? 0;
      if (budget <= 1000) return false;
    }
    if (activeChips.has('low-roas') && isCampaign(row) && (row as Campaign).roas >= 1.5) return false;
    return true;
  });
}
