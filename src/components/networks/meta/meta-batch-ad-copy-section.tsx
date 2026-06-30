// meta-batch-ad-copy-section.tsx — Ad Copy form with labels, char limits, CTA selector
// Facebook limits: primary text 125 chars (soft), headline 40 chars
import React from 'react';
import { CTA_OPTIONS } from './meta-batch-types';
import type { BatchAdCopy } from './meta-batch-types';

interface Props {
  adCopy: BatchAdCopy;
  onChange: (c: BatchAdCopy) => void;
}

const PRIMARY_MAX = 125;
const HEADLINE_MAX = 40;

export const BatchAdCopySection: React.FC<Props> = ({ adCopy, onChange }) => {
  const primaryCount = adCopy.primaryText.length;
  const headlineCount = adCopy.headline.length;

  return (
    <div className="px-5 pt-4 pb-3 border-b border_primary shrink-0">
      <div className="text-xs font-semibold text_secondary mb-2.5">Ad Copy</div>
      <div className="space-y-2.5">

        {/* Primary text with char counter */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text_tertiary">Primary text</label>
            <span className={`text-[10px] tabular-nums ${primaryCount > PRIMARY_MAX ? 'fg_error' : 'text_tertiary'}`}>
              {primaryCount}/{PRIMARY_MAX}
            </span>
          </div>
          <textarea
            value={adCopy.primaryText}
            onChange={e => onChange({ ...adCopy, primaryText: e.target.value })}
            placeholder="Write something compelling…"
            rows={2}
            className="w-full border border_primary radius_8 px-3 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary resize-none"
          />
        </div>

        {/* Headline + CTA row */}
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text_tertiary">Headline</label>
              {headlineCount > 0 && (
                <span className={`text-[10px] tabular-nums ${headlineCount > HEADLINE_MAX ? 'fg_error' : 'text_tertiary'}`}>
                  {headlineCount}/{HEADLINE_MAX}
                </span>
              )}
            </div>
            <input
              value={adCopy.headline}
              onChange={e => onChange({ ...adCopy, headline: e.target.value })}
              placeholder="Your headline here"
              className="w-full border border_primary radius_8 px-3 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary"
            />
          </div>
          <div className="shrink-0">
            <label className="block text-[10px] text_tertiary mb-1">CTA</label>
            <select
              value={adCopy.cta}
              onChange={e => onChange({ ...adCopy, cta: e.target.value })}
              className="border border_primary radius_8 px-2 py-1.5 text-xs text_secondary bg_primary outline-none focus:border_accent_secondary">
              {CTA_OPTIONS.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
