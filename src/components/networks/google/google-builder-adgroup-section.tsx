// Google UAC builder — Adgroup section (titles, descriptions, videos, images, HTML)
import React, { useState } from 'react';
import { Input } from 'antd';
import { ChevronDown, ChevronUp, FileCode, Image, Link2, Type, Video, X } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import { BuilderSection } from '@/components/networks/axon/axon-ui-atoms';
import { GOOGLE_COLOR, type GoogleBuilderState } from './google-types';

// ─── Collapsible panel used for Titles/Descriptions/Videos/Images/HTML ───────

const AdPanel: React.FC<{
  icon: React.ReactNode;
  title: string;
  count: number;
  max: number;
  onClear?: () => void;
  children: React.ReactNode;
}> = ({ icon, title, count, max, onClear, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="radius_8 border border_primary overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg_secondary hover:bg_primary cursor-pointer border-0">
        <div className="flex items-center gap-2 text-sm font-semibold text_primary">
          {open ? <ChevronDown size={15} className="text_tertiary" /> : <ChevronUp size={15} className="text_tertiary" />}
          <span className="text_secondary">{icon}</span>
          {title} <span className="text-xs font-normal text_tertiary">(up to {max})</span>
        </div>
        {onClear && (
          <button type="button" onClick={e => { e.stopPropagation(); onClear(); }}
            className="text-xs text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer">
            Clear All
          </button>
        )}
      </button>
      {open && <div className="p-4 space-y-3 bg_primary">{children}</div>}
    </div>
  );
};

// ─── Char-counted text input ──────────────────────────────────────────────────

const CharInput: React.FC<{
  value: string;
  maxLen: number;
  placeholder: string;
  onChange: (v: string) => void;
}> = ({ value, maxLen, placeholder, onChange }) => (
  <div className="relative">
    <Input value={value} maxLength={maxLen} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} />
    <span className={cn('absolute right-2 bottom-1.5 text-[10px]', value.length >= maxLen ? 'text-red-500' : 'text_tertiary')}>
      {value.length}/{maxLen}
    </span>
  </div>
);

// ─── Adgroup Section ──────────────────────────────────────────────────────────

interface Props { state: GoogleBuilderState; onChange: (patch: Partial<GoogleBuilderState>) => void }

export const GoogleAdgroupSection: React.FC<Props> = ({ state, onChange }) => {
  const setTitle = (i: number, v: string) => {
    const t = [...state.titles]; t[i] = v; onChange({ titles: t });
  };
  const setDesc = (i: number, v: string) => {
    const d = [...state.descriptions]; d[i] = v; onChange({ descriptions: d });
  };
  const addBulkTitles = () => {
    const lines = state.bulkTitles.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 5);
    const merged = [...lines, ...Array(5).fill('')].slice(0, 5);
    onChange({ titles: merged, bulkTitles: '' });
    toast.success(`${lines.length} title(s) added`);
  };
  const addBulkDescriptions = () => {
    const lines = state.bulkDescriptions.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 5);
    const merged = [...lines, ...Array(5).fill('')].slice(0, 5);
    onChange({ descriptions: merged, bulkDescriptions: '' });
    toast.success(`${lines.length} description(s) added`);
  };
  const addBulkVideos = () => {
    const lines = state.bulkVideos.split('\n').map(l => l.trim()).filter(Boolean);
    const valid = lines.filter(l => /youtube\.com\/watch\?v=[\w-]+$/.test(l) || /youtu\.be\/[\w-]+$/.test(l));
    const invalid = lines.length - valid.length;
    onChange({ videoUrls: [...state.videoUrls, ...valid].slice(0, 20), bulkVideos: '' });
    if (invalid > 0) toast.error(`${invalid} URL(s) skipped — playlist links not supported`);
    else toast.success(`${valid.length} video(s) added`);
  };

  return (
    <BuilderSection id="google-adgroup" icon={<Type size={16} />} title="Adgroup"
      subtitle="Name, text assets, videos, images, and HTML." status="warning">
      <div className="space-y-4">
        {/* Adgroup name */}
        <div>
          <label className="text-xs font-semibold text_secondary block mb-1.5">
            Adgroup Name <span className="text-red-500">*</span>
          </label>
          <Input value={state.adgroupName} onChange={e => onChange({ adgroupName: e.target.value })}
            placeholder="e.g. Zego_Draw_US_Adgroup_01" />
        </div>

        {/* Titles */}
        <AdPanel icon={<Type size={13} />} title="Titles" count={state.titles.filter(Boolean).length} max={5}
          onClear={() => onChange({ titles: ['', '', '', '', ''] })}>
          <div>
            <div className="text-xs text_tertiary mb-1.5">Add multiple titles:</div>
            <Input.TextArea rows={3} value={state.bulkTitles} onChange={e => onChange({ bulkTitles: e.target.value })}
              placeholder="Enter titles separated by new lines" />
            <Button type="button" variant="primary" size="s" className="mt-2"
              onClick={addBulkTitles} disabled={!state.bulkTitles.trim()}>
              Add Multiple Titles
            </Button>
          </div>
          <div className="space-y-2">
            {state.titles.slice(0, 5).map((t, i) => (
              <CharInput key={i} value={t} maxLen={30} placeholder={`Title ${i + 1}${i === 0 ? ' *' : ''}`}
                onChange={v => setTitle(i, v)} />
            ))}
          </div>
        </AdPanel>

        {/* Descriptions */}
        <AdPanel icon={<Type size={13} />} title="Descriptions" count={state.descriptions.filter(Boolean).length} max={5}
          onClear={() => onChange({ descriptions: ['', '', '', '', ''] })}>
          <div>
            <div className="text-xs text_tertiary mb-1.5">Add multiple descriptions:</div>
            <Input.TextArea rows={3} value={state.bulkDescriptions} onChange={e => onChange({ bulkDescriptions: e.target.value })}
              placeholder="Enter descriptions separated by new lines" />
            <Button type="button" variant="primary" size="s" className="mt-2"
              onClick={addBulkDescriptions} disabled={!state.bulkDescriptions.trim()}>
              Add Multiple Descriptions
            </Button>
          </div>
          <div className="space-y-2">
            {state.descriptions.slice(0, 5).map((d, i) => (
              <CharInput key={i} value={d} maxLen={90} placeholder={`Description ${i + 1}${i === 0 ? ' *' : ''}`}
                onChange={v => setDesc(i, v)} />
            ))}
          </div>
        </AdPanel>

        {/* Videos */}
        <AdPanel icon={<Video size={13} />} title="Videos" count={state.videoUrls.length} max={20}
          onClear={() => onChange({ videoUrls: [] })}>
          {/* URL format example */}
          <div className="radius_8 border border_secondary bg_secondary p-3 space-y-1.5">
            <div className="text-[11px] font-semibold text_secondary flex items-center gap-1.5">
              <Link2 size={12} />YouTube URL format
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-0.5 radius_4 bg_emerald_subtle fg_emerald_strong border border_emerald text-[11px] font-mono">✓ correct</span>
              <code className="text-[11px] text_primary">youtube.com/watch?v=kI5Dptgzj2Y</code>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 radius_4 bg-red-50 text-red-600 border border-red-200 text-[11px] shrink-0">✕ wrong</span>
              <code className="text-[11px] text_tertiary break-all">youtube.com/watch?v=…&list=PLPhr…&index=2</code>
            </div>
          </div>
          <div>
            <div className="text-xs text_tertiary mb-1.5">Add multiple Videos Link:</div>
            <Input.TextArea rows={3} value={state.bulkVideos} onChange={e => onChange({ bulkVideos: e.target.value })}
              placeholder="Enter YouTube Video URLs separated by new lines" />
            <div className="flex items-center gap-2 mt-2">
              <Button type="button" variant="primary" size="s" onClick={addBulkVideos} disabled={!state.bulkVideos.trim()}>
                Add Videos
              </Button>
              <Button type="button" variant="border" size="s" onClick={() => toast.info('Media Library — coming soon')}>
                Select from Media Library
              </Button>
            </div>
          </div>
          <div className="text-xs text_tertiary">Current Videos: {state.videoUrls.length}/20</div>
          {state.videoUrls.length > 0 ? (
            <div className="space-y-1.5">
              {state.videoUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 radius_8 border border_secondary bg_secondary">
                  <Video size={13} className="text_tertiary shrink-0" />
                  <span className="text-xs text_primary truncate flex-1">{url}</span>
                  <button type="button" onClick={() => onChange({ videoUrls: state.videoUrls.filter((_, j) => j !== i) })}
                    className="text_tertiary hover:text-red-500 bg-transparent border-0 cursor-pointer shrink-0">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text_tertiary">
              <Video size={24} className="mb-2 opacity-30" />
              <div className="text-xs">No videos added</div>
            </div>
          )}
        </AdPanel>

        {/* Images */}
        <AdPanel icon={<Image size={13} />} title="Images" count={0} max={20}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text_tertiary">Accept only:</span>
              {['1:1', '1.91:1', '4:5'].map(r => (
                <span key={r} className="inline-flex px-2 py-0.5 radius_4 bg_blue_subtle fg_blue_strong border border_blue text-[11px] font-semibold">{r}</span>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-xs text_secondary cursor-pointer">
              Crop Mode
              <input type="checkbox" className="w-4 h-4" style={{ accentColor: GOOGLE_COLOR }} />
            </label>
          </div>
          <Button type="button" variant="border" size="s" className="gap-1.5">
            <Image size={13} />Upload Images
          </Button>
        </AdPanel>

        {/* HTML */}
        <AdPanel icon={<FileCode size={13} />} title="Upload HTML" count={0} max={20}>
          <Button type="button" variant="border" size="s" className="gap-1.5">
            <FileCode size={13} />Upload Files
          </Button>
        </AdPanel>
      </div>
    </BuilderSection>
  );
};
