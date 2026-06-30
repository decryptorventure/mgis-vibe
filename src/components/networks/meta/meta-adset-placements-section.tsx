// Placements section — Platform/Device/OS filters + per-platform Position Controls
import React, { useState } from 'react';
import { Checkbox, Select } from '@/components/ui-kit-compat';
import { ChevronDown, ChevronRight, RefreshCcw, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import { BuilderCard } from './meta-builder-forms';

// Per-platform position options
const PLATFORM_POSITIONS: Record<string, string[]> = {
  Facebook: ['Feed', 'Marketplace', 'Search', 'Facebook Reels', 'Profile Feed', 'Right Hand Column', 'Story', 'Instream Video', 'Facebook Reels Overlay', 'Notification'],
  Instagram: ['Stream', 'Explore', 'Reels', 'Ig Search', 'Story', 'Explore Home', 'Profile Feed', 'Profile Reels'],
  Threads: ['Threads Stream'],
  Audience_network: ['Classic', 'Rewarded Video'],
  Messenger: ['Story'],
};

const PLATFORM_LIST = Object.keys(PLATFORM_POSITIONS);

// iOS versions min: 2.0 → 18.7
const IOS_MIN_OPTIONS = [
  '2.0','2.1','2.2','3.0','3.1','3.2','4.0','4.1','4.2','4.3',
  '5.0','5.1','6.0','6.1','7.0','7.1','8.0','8.1','8.2','8.3','8.4',
  '9.0','9.1','9.2','9.3','10.0','10.1','10.2','10.3',
  '11.0','11.1','11.2','11.3','11.4','12.0','12.1','12.2','12.3','12.4',
  '13.0','13.1','13.2','13.3','13.4','13.5','13.6','13.7',
  '14.0','14.1','14.2','14.3','14.4','14.5','14.6','14.7','14.8',
  '15.0','15.1','15.2','15.3','15.4','15.5','15.6','15.7','15.8',
  '16.0','16.1','16.2','16.3','16.4','16.5','16.6','16.7',
  '17.0','17.1','17.2','17.3','17.4','17.5','17.6','17.7',
  '18.0','18.1','18.2','18.3','18.4','18.5','18.6','18.7',
].map(v => ({ value: v, label: v }));

// iOS versions max: 18.1 → 26.0 (26.0 = latest released)
const IOS_MAX_OPTIONS = [
  '18.1','18.2','18.3','18.4','18.5','18.6','18.7','26.0',
].map(v => ({ value: v, label: v }));

const DEVICE_OPTIONS = [
  { value: 'iphones_all', label: 'iPhones (all)' },
  { value: 'ipads_all', label: 'iPads (all)' },
];

interface PositionGroupProps {
  platform: string;
  selectedPositions: Set<string>;
  onChange: (platform: string, pos: string, checked: boolean) => void;
}

const PositionGroup: React.FC<PositionGroupProps> = ({ platform, selectedPositions, onChange }) => {
  const [open, setOpen] = useState(false);
  const positions = PLATFORM_POSITIONS[platform] ?? [];
  const selectedCount = positions.filter(p => selectedPositions.has(`${platform}:${p}`)).length;

  return (
    <div className="border border_secondary radius_8 overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg_secondary transition-colors text-left">
        {open ? <ChevronDown size={13} className="text_tertiary" /> : <ChevronRight size={13} className="text_tertiary" />}
        <span className="flex-1 text-xs font-semibold text_primary">{platform} positions</span>
        <span className="text-[11px] text_tertiary">{selectedCount}/{positions.length}</span>
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 pb-3 pt-1">
          {positions.map(pos => (
            <Checkbox key={pos} checked={selectedPositions.has(`${platform}:${pos}`)}
              onChange={e => onChange(platform, pos, e.target.checked)} className="text-xs">
              {pos}
            </Checkbox>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdsetPlacementsSection: React.FC = () => {
  const [advantagePlus, setAdvantagePlus] = useState(false);
  const [showPositions, setShowPositions] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(PLATFORM_LIST));
  const allPositionKeys = PLATFORM_LIST.flatMap(pl => PLATFORM_POSITIONS[pl].map(pos => `${pl}:${pos}`));
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set(allPositionKeys));

  const togglePlatform = (p: string, checked: boolean) =>
    setSelectedPlatforms(prev => { const s = new Set(prev); checked ? s.add(p) : s.delete(p); return s; });
  const togglePosition = (platform: string, pos: string, checked: boolean) =>
    setSelectedPositions(prev => { const s = new Set(prev); const k = `${platform}:${pos}`; checked ? s.add(k) : s.delete(k); return s; });

  return (
    <BuilderCard title="Placements">
      {/* Advantage+ toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text_primary">Placements</span>
          <span className={cn('text-[11px] px-1.5 py-0.5 radius_8',
            advantagePlus ? 'bg_blue_subtle fg_blue_strong' : 'bg_secondary text_tertiary')}>
            Advantage+ {advantagePlus ? 'On' : 'Off'}
          </span>
        </div>
        <button type="button" onClick={() => setAdvantagePlus(v => !v)}>
          {advantagePlus
            ? <ToggleRight size={26} className="text-[var(--status-info)]" />
            : <ToggleLeft size={26} className="text_tertiary" />}
        </button>
      </div>

      {/* Platform + Devices & OS */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] font-semibold text_tertiary mb-1">Platform</div>
          <Select defaultValue="ios" options={[
            { value: 'all', label: 'All Platforms' },
            { value: 'ios', label: 'Ios' },
            { value: 'android', label: 'Android' },
          ]} />
        </div>
        <div>
          <div className="text-[11px] font-semibold text_tertiary mb-1">Devices & OS</div>
          <Select defaultValue="mobile" options={[
            { value: 'all', label: 'All devices (Mobile + Desktop)' },
            { value: 'desktop', label: 'Desktop' },
            { value: 'mobile', label: 'Mobile' },
          ]} />
        </div>
      </div>

      {/* Included / Excluded Devices */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] font-semibold text_tertiary mb-1">Included Devices</div>
          <Select mode="multiple" defaultValue={['iphones_all']} options={DEVICE_OPTIONS} />
        </div>
        <div>
          <div className="text-[11px] font-semibold text_tertiary mb-1">Excluded Devices</div>
          <Select mode="multiple" placeholder="e.g. Samsung Galaxy S22" options={DEVICE_OPTIONS} />
        </div>
      </div>

      {/* OS Versions */}
      <div>
        <div className="text-[11px] font-semibold text_tertiary mb-1">OS Versions</div>
        <div className="flex items-center gap-2">
          <Select defaultValue="2.0" size="small" className="flex-1" options={IOS_MIN_OPTIONS} />
          <span className="text_tertiary text-xs shrink-0">–</span>
          <Select defaultValue="26.0" size="small" className="flex-1" options={IOS_MAX_OPTIONS} />
          <Button type="button" variant="border" size="s" className="gap-1 shrink-0">
            <RefreshCcw size={11} />Sync
          </Button>
        </div>
      </div>

      <Checkbox defaultChecked={false}>
        <span className="text-xs text_secondary">Only when connected to Wi-Fi</span>
      </Checkbox>

      {/* Platforms */}
      <div>
        <div className="text-[11px] font-semibold text_tertiary mb-2">Platforms</div>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_LIST.map(p => (
            <Checkbox key={p} checked={selectedPlatforms.has(p)} onChange={e => togglePlatform(p, e.target.checked)}>
              <span className="text-xs">{p}</span>
            </Checkbox>
          ))}
        </div>
      </div>

      {/* Position Controls */}
      <div>
        <button type="button" onClick={() => setShowPositions(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text_secondary hover:text_primary transition-colors">
          {showPositions ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          Position Controls
        </button>
        {showPositions && (
          <div className="mt-2 space-y-2">
            {PLATFORM_LIST.filter(p => selectedPlatforms.has(p)).map(platform => (
              <PositionGroup key={platform} platform={platform}
                selectedPositions={selectedPositions} onChange={togglePosition} />
            ))}
          </div>
        )}
      </div>
    </BuilderCard>
  );
};
