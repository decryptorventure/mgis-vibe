// Thumbnail extractor — pick thumbnail frames from selected videos before bulk upload
import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui-kit-compat';
import { Button, cn } from '@frontend-team/ui-kit';
import { Camera, Film, Play } from 'lucide-react';
import type { MediaFile } from './meta-media-library-modal';

export interface VideoWithThumb { file: MediaFile; thumbTime: number }

interface Props {
  open: boolean;
  videos: MediaFile[];
  onClose: () => void;
  onConfirm: (items: VideoWithThumb[]) => void;
}

export const ThumbnailExtractorModal: React.FC<Props> = ({ open, videos, onClose, onConfirm }) => {
  const [stage, setStage] = useState<'extracting' | 'review'>('extracting');
  const [progress, setProgress] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [thumbTimes, setThumbTimes] = useState<number[]>([]);

  useEffect(() => {
    if (!open || videos.length === 0) return;
    setStage('extracting'); setProgress(0); setCurrentIdx(0);
    setThumbTimes(videos.map(() => 2.0));
    const timer = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(timer); setStage('review'); return 100; } return p + 25; });
    }, 200);
    return () => clearInterval(timer);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = videos[currentIdx];
  const duration = current ? parseFloat(current.duration ?? '30') : 30;
  const thumbTime = thumbTimes[currentIdx] ?? 2.0;
  const setThumbTime = (t: number) => setThumbTimes(prev => { const n = [...prev]; n[currentIdx] = t; return n; });
  const confirmedCount = thumbTimes.filter(t => t !== undefined).length;

  return (
    <Modal open={open} onCancel={onClose} title={null} width={760} footer={null}
      styles={{ body: { padding: '24px' } }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 radius_8 bg_info flex items-center justify-center">
          <Camera size={15} className="fg_info" />
        </div>
        <div className="body_s font-semibold text_primary">
          Extract Thumbnails from Videos ({Math.min(currentIdx + 1, videos.length)}/{videos.length})
        </div>
      </div>

      {/* Extracting stage */}
      {stage === 'extracting' && (
        <div className="flex flex-col items-center py-10 gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 radius_round bg_accent_primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div className="body_s text_secondary">Extracting thumbnails from {videos.length} video(s)...</div>
          <div className="w-full max-w-xs">
            <div className="bg_secondary radius_round h-1.5 overflow-hidden">
              <div className="h-full bg_accent_primary transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text_tertiary mt-1 text-right">{progress}%</div>
          </div>
          <div className="text-xs text_tertiary">{Math.round(progress / 100 * videos.length)} of {videos.length} completed</div>
          <div className="text-[11px] fg_info">This may take a few seconds. Please wait...</div>
          <div className="flex items-center gap-2 mt-2">
            <Button type="button" variant="border" size="s" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="border" size="s" disabled>Next</Button>
            <Button type="button" variant="subtle" size="s" disabled>... Upload &amp; Confirm All</Button>
          </div>
        </div>
      )}

      {/* Review stage */}
      {stage === 'review' && current && (
        <>
          {/* Current file info */}
          <div className="flex items-center justify-between border border_primary radius_8 px-3 py-2 bg_secondary mb-4">
            <div>
              <div className="body_s font-semibold text_primary truncate max-w-[420px]">{current.name}</div>
              <div className="text-xs text_tertiary">Duration: {current.duration ?? '?'}</div>
            </div>
            <span className="text-xs fg_info border border_accent_secondary px-2 py-0.5 radius_8 shrink-0 ml-3">
              Current thumbnail at: {thumbTime.toFixed(1)}s
            </span>
          </div>

          {/* Preview grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text_secondary mb-1.5">Video Preview</div>
              {/* Video player dark bg is intentional — not a DS surface */}
              <div className="aspect-video radius_8 flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0a0a' }}>
                <Film size={32} className="text-gray-600" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <button type="button" aria-label="Play video"
                    className="flex items-center gap-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    <Play size={9} fill="white" />Play
                  </button>
                  <span className="text-white text-xs bg-black/60 px-1.5 py-0.5 rounded">
                    {thumbTime.toFixed(1)}s / {duration.toFixed(1)}s
                  </span>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="text-[10px] text_tertiary">Select time:</div>
                <input type="range" min={0} max={duration} step={0.1} value={thumbTime}
                  onChange={e => setThumbTime(parseFloat(e.target.value))}
                  className="w-full h-1 accent-[var(--status-info)]" />
                <Button type="button" variant="primary" size="s" className="w-full gap-1.5 mt-1" onClick={() => {}}>
                  <Camera size={12} />Extract Thumbnail at Current Time
                </Button>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text_secondary mb-1.5">Thumbnail Preview</div>
              <div className="aspect-video radius_8 bg_secondary border-2 border-dashed border_accent_secondary flex flex-col items-center justify-center gap-1.5">
                <Film size={24} className="text_tertiary" />
                <span className="text-[11px] text_tertiary">{thumbTime.toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* All videos strip */}
          <div className="mb-4">
            <div className="text-xs font-semibold text_secondary mb-2">All Videos ({videos.length})</div>
            <div className="flex gap-2 flex-wrap">
              {videos.map((v, i) => (
                <button key={v.id} type="button" onClick={() => setCurrentIdx(i)}
                  aria-label={`Select video ${v.name}`}
                  className={cn('relative w-16 aspect-video bg_secondary radius_8 border-2 overflow-hidden transition-colors',
                    i === currentIdx ? 'border_accent_secondary' : 'border_secondary')}>
                  <Film size={14} className="text_tertiary absolute inset-0 m-auto" />
                  <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/70 text-white px-1 rounded">
                    {(thumbTimes[i] ?? 2).toFixed(1)}s
                  </span>
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 radius_round flex items-center justify-center"
                    style={{ background: 'var(--status-success, #22c55e)' }}>
                    <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
                      <path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border_secondary pt-3">
            <span className="text-xs text_tertiary">{confirmedCount}/{videos.length} videos with thumbnails</span>
            <div className="flex gap-2">
              <Button type="button" variant="border" size="s" onClick={onClose}>Cancel</Button>
              {currentIdx < videos.length - 1 && (
                <Button type="button" variant="border" size="s" onClick={() => setCurrentIdx(i => i + 1)}>Next</Button>
              )}
              <Button type="button" variant="primary" size="s" className="gap-1.5"
                onClick={() => onConfirm(videos.map((file, i) => ({ file, thumbTime: thumbTimes[i] ?? 2.0 })))}>
                <Camera size={12} />Upload &amp; Confirm All
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};
