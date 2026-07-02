// meta-batch-creative-config.tsx — min creatives per adset stepper for batch generator
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { computeSlices } from './meta-batch-types';

const MIN = 5;
const MAX = 9;

interface Props {
  value: number;
  onChange: (v: number) => void;
  sampleFileCount?: number; // preview the slice formula in real terms
}

export const BatchCreativeConfig: React.FC<Props> = ({ value, onChange, sampleFileCount }) => {
  const slices = sampleFileCount && sampleFileCount > 0 ? computeSlices(sampleFileCount, value) : null;

  return (
    <div className="px-4 py-3 border-t border_secondary shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text_secondary">Min creatives / adset</div>
          {slices ? (
            <div className="text-[10px] text_tertiary mt-0.5">
              {sampleFileCount} files →{' '}
              <span className="fg_info font-medium">{slices.length} campaign{slices.length !== 1 ? 's' : ''}</span>
              {' '}[{slices.join(' + ')}]
            </div>
          ) : (
            <div className="text-[10px] text_tertiary mt-0.5">Max is always 9 · auto-splits by theme</div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" aria-label="Decrease min creatives"
            onClick={() => onChange(Math.max(MIN, value - 1))}
            disabled={value <= MIN}
            className="w-6 h-6 flex items-center justify-center radius_8 border border_primary text_secondary disabled:opacity-30 hover:bg_secondary transition-colors">
            <Minus size={10} />
          </button>
          <span className="text-sm font-bold text_primary w-5 text-center tabular-nums">{value}</span>
          <button type="button" aria-label="Increase min creatives"
            onClick={() => onChange(Math.min(MAX, value + 1))}
            disabled={value >= MAX}
            className="w-6 h-6 flex items-center justify-center radius_8 border border_primary text_secondary disabled:opacity-30 hover:bg_secondary transition-colors">
            <Plus size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};
