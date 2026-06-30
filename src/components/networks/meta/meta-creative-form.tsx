// Ad Creative form — step 3 of the Meta builder drawer
// Video Mode toggle (Single/Multiple), Media Library, full CTA options
import React, { useState } from 'react';
import { Input, Select } from '@/components/ui-kit-compat';
import { Folder, ImagePlay, Upload } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { MetaPage, MetaTemplate, BuilderContext } from './meta-types';
import { Field, TextAssetField } from './meta-template-forms';
import { BuilderCard } from './meta-builder-forms';

type VideoMode = 'single' | 'multiple';

const CTA_OPTIONS = [
  { value: 'download', label: 'Download' },
  { value: 'install_now', label: 'Install Now' },
  { value: 'get_offer', label: 'Get Offer' },
  { value: 'get_quote', label: 'Get Quote' },
  { value: 'open_link', label: 'Open Link' },
  { value: 'shop_now', label: 'Shop Now' },
  { value: 'play_game', label: 'Play Game' },
  { value: 'learn_more', label: 'Learn More' },
  { value: 'sign_up', label: 'Sign Up' },
];

const ASPECT_RATIOS = [
  { ratio: '9:16' as const, label: 'Vertical', note: '9:16' },
  { ratio: '1:1' as const, label: 'Square', note: '1:1' },
  { ratio: '16:9' as const, label: 'Horizontal', note: '10:9' },
];

interface UploadSlotProps {
  label: string;
  note: string;
  tall?: boolean;
}

const UploadSlot: React.FC<UploadSlotProps> = ({ label, note, tall }) => (
  <div className="border border_primary radius_8 p-3 flex flex-col">
    <div className="text-xs font-semibold text_secondary mb-1">{label}</div>
    <div className="text-[10px] text_tertiary mb-2">{note}</div>
    <div className={cn(
      'border-2 border-dashed border_secondary radius_8 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[var(--status-info-border)] hover:bg-[var(--status-info-bg)] transition-colors group flex-1',
      tall ? 'min-h-44' : 'min-h-28',
    )}>
      <ImagePlay size={18} className="text_tertiary group-hover:text-[var(--status-info)] transition-colors" />
      <div className="text-[11px] font-medium text_secondary group-hover:text-[var(--status-info)] text-center">No video</div>
    </div>
    <Button type="button" variant="border" size="s" className="w-full mt-2 gap-1 text-xs justify-center">
      <Upload size={11} />Select Video
    </Button>
  </div>
);

interface Props {
  context: BuilderContext;
  pages: MetaPage[];
  template?: MetaTemplate;
}

export const AdCreativeForm: React.FC<Props> = ({ context, pages, template }) => {
  const [videoMode, setVideoMode] = useState<VideoMode>('single');
  const defaultCta = template?.objective === 'App promotions' ? 'install_now' : 'download';

  return (
    <>
      {/* Media Assets */}
      <BuilderCard title="Ad Creative">
        {/* Video Mode toggle */}
        <div>
          <div className="text-[11px] font-semibold text_tertiary mb-2">Video Mode</div>
          <div className="flex items-center gap-4">
            {(['single', 'multiple'] as VideoMode[]).map(mode => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="videoMode"
                  checked={videoMode === mode}
                  onChange={() => setVideoMode(mode)}
                  className="accent-[var(--status-info)]"
                />
                <span className="text-sm text_primary">
                  {mode === 'single' ? 'Single Video' : 'Multiple Videos (Placement)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {videoMode === 'single' ? (
          <div>
            <div className="border-2 border-dashed border_secondary radius_8 p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--status-info-border)] hover:bg-[var(--status-info-bg)] transition-colors group">
              <Upload size={22} className="text_tertiary group-hover:text-[var(--status-info)]" />
              <div className="text-sm font-medium text_secondary group-hover:text-[var(--status-info)]">
                No media selected. Click "Open Media Library" to select videos.
              </div>
            </div>
            <Button type="button" variant="primary" size="m" className="w-full mt-2 gap-2 justify-center">
              <Folder size={14} />Open Media Library
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {ASPECT_RATIOS.map(({ ratio, label, note }) => (
              <UploadSlot key={ratio} label={label} note={note} tall={ratio === '9:16'} />
            ))}
          </div>
        )}
      </BuilderCard>

      {/* Ad Settings */}
      <BuilderCard title="Ad Settings">
        <Field label="Ad Name">
          <Input defaultValue={context.ad?.name ?? 'New Ad Promotions'} />
        </Field>
        <div>
          <div className="text-[11px] font-semibold text_tertiary mb-1.5">Facebook Page</div>
          <div className="flex gap-2">
            <Button type="button" variant="primary" size="s" className="shrink-0">Select</Button>
            <Button type="button" variant="border" size="s" className="shrink-0">Page ID</Button>
            <Select
              className="flex-1"
              placeholder="Select a Facebook Page"
              options={pages.map(page => ({ value: page.id, label: page.name }))}
            />
          </div>
        </div>
      </BuilderCard>

      {/* Copy */}
      <BuilderCard title="Ad Copy">
        <TextAssetField label="Primary Text" count={template ? '1 of 5' : '2 of 5'} />
        <TextAssetField label="Headline" count={template ? '2 of 5' : '1 of 5'} />
        <TextAssetField label="Description" count="0 of 5" />
        <Field label="Call to Action">
          <Select defaultValue={defaultCta} options={CTA_OPTIONS} />
        </Field>
      </BuilderCard>
    </>
  );
};
