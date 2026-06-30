// Task 4 — Performance metric filter bar for creative library (ROAS, CTR, CVR, IR, RR, spend, Google mark)
import React from 'react';
import { InputNumber, Select, Slider } from '@/components/ui-kit-compat';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@frontend-team/ui-kit';

export interface CreativePerformanceFilters {
  minSpend: number;
  minRoas: number;
  minCtr: number;
  minCvr: number;
  googleMark: 'all' | 'low' | 'good';
  usedInCampaign: string;
  activeOnly: boolean;
}

export const DEFAULT_PERF_FILTERS: CreativePerformanceFilters = {
  minSpend: 0,
  minRoas: 0,
  minCtr: 0,
  minCvr: 0,
  googleMark: 'all',
  usedInCampaign: '',
  activeOnly: false,
};

interface Props {
  filters: CreativePerformanceFilters;
  onChange: (f: Partial<CreativePerformanceFilters>) => void;
  onReset: () => void;
}

export const CreativePerformanceFilterBar: React.FC<Props> = ({ filters, onChange, onReset }) => {
  const isDirty =
    filters.minSpend > 0 ||
    filters.minRoas > 0 ||
    filters.minCtr > 0 ||
    filters.minCvr > 0 ||
    filters.googleMark !== 'all' ||
    filters.activeOnly;

  return (
    <div className="flex flex-wrap items-end gap-3 px-4 py-3 radius_8 border border_primary bg_secondary">
      <div className="flex items-center gap-1.5 text-xs font-semibold text_tertiary shrink-0">
        <SlidersHorizontal size={14} />Performance filters
      </div>

      <div className="flex flex-wrap gap-3 flex-1">
        <div className="min-w-[120px]">
          <div className="text-[10px] text_tertiary mb-1">Min Spend ($)</div>
          <InputNumber
            size="small" min={0} value={filters.minSpend} className="w-full"
            onChange={v => onChange({ minSpend: v ?? 0 })}
            placeholder="0"
          />
        </div>

        <div className="min-w-[100px]">
          <div className="text-[10px] text_tertiary mb-1">Min ROAS</div>
          <InputNumber
            size="small" min={0} step={0.1} value={filters.minRoas} className="w-full"
            onChange={v => onChange({ minRoas: v ?? 0 })}
            placeholder="0.0"
          />
        </div>

        <div className="min-w-[100px]">
          <div className="text-[10px] text_tertiary mb-1">Min CTR (%)</div>
          <Slider
            min={0} max={10} step={0.1} value={filters.minCtr}
            onChange={v => onChange({ minCtr: v })}
            tooltip={{ formatter: v => `${v}%` }}
            className="w-24"
          />
        </div>

        <div className="min-w-[100px]">
          <div className="text-[10px] text_tertiary mb-1">Min CVR (%)</div>
          <Slider
            min={0} max={20} step={0.1} value={filters.minCvr}
            onChange={v => onChange({ minCvr: v })}
            tooltip={{ formatter: v => `${v}%` }}
            className="w-24"
          />
        </div>

        <div className="min-w-[130px]">
          <div className="text-[10px] text_tertiary mb-1">Google Mark</div>
          <Select
            size="small" value={filters.googleMark} className="w-full"
            onChange={v => onChange({ googleMark: v as 'all' | 'low' | 'good' })}
            options={[
              { value: 'all', label: 'All' },
              { value: 'good', label: '✓ Good' },
              { value: 'low', label: '↓ Low (remove candidates)' },
            ]}
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-1.5 text-xs text_secondary cursor-pointer pb-0.5">
            <input
              type="checkbox"
              checked={filters.activeOnly}
              onChange={e => onChange({ activeOnly: e.target.checked })}
              className="w-3.5 h-3.5"
            />
            Active only
          </label>
        </div>
      </div>

      {isDirty && (
        <Button type="button" variant="subtle" size="s" onClick={onReset} className="gap-1 shrink-0">
          <X size={12} />Reset
        </Button>
      )}
    </div>
  );
};
