// Task 6 — Enhanced creative preview modal: image / video / HTML playable with fallback
import React, { useState } from 'react';
import { Modal, Tag } from '@/components/ui-kit-compat';
import { AlertTriangle, ExternalLink, Maximize2 } from 'lucide-react';
import { statusConfig, type MediaItem } from '@/shared/mock-data';

interface Props {
  item: MediaItem | null;
  open: boolean;
  onClose: () => void;
}

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><span className="text-[var(--text-secondary)]">{label}:</span> <span className="font-semibold">{value}</span></div>
);

const HtmlPlayable: React.FC<{ name: string }> = ({ name }) => {
  const [iframeError, setIframeError] = useState(false);
  return iframeError ? (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-tertiary)]">
      <AlertTriangle size={32} className="text-amber-400" />
      <p className="text-sm font-semibold">Playable preview unavailable</p>
      <p className="text-xs text-center max-w-xs">The HTML asset requires a server to render. Download to preview locally.</p>
    </div>
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 gap-3">
      <span className="text-4xl font-black text-indigo-500 font-mono tracking-widest">HTML5</span>
      <span className="text-sm text-indigo-400 font-medium">{name}</span>
      <button type="button" onClick={() => setIframeError(true)}
        className="flex items-center gap-1.5 text-xs text-indigo-500 hover:underline bg-transparent border-0 cursor-pointer">
        <ExternalLink size={13} />Simulate load error (demo)
      </button>
    </div>
  );
};

export const CreativePreviewModal: React.FC<Props> = ({ item, open, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  if (!item) return null;

  const isHtml = item.name.endsWith('.html') || item.name.endsWith('.zip');
  const isVideo = item.type === 'video' && !isHtml;

  return (
    <Modal
      title={
        <div className="flex items-center justify-between gap-3 pr-8">
          <span className="font-semibold text-sm truncate max-w-xs">{item.name}</span>
          <button type="button" onClick={() => setExpanded(e => !e)}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-transparent border-0 cursor-pointer shrink-0">
            <Maximize2 size={13} />{expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={expanded ? 900 : 620}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Preview area */}
        <div className="bg-[var(--surface-subtle)] rounded-lg overflow-hidden"
          style={{ height: expanded ? 480 : 300 }}>
          {isHtml ? (
            <HtmlPlayable name={item.name} />
          ) : isVideo ? (
            <video
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              controls
              className="w-full h-full object-contain bg-black"
              onError={() => {}}
            />
          ) : (
            <img
              src={`https://picsum.photos/seed/${item.id}/800/600`}
              alt={item.name}
              className="w-full h-full object-contain"
              onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'; }}
            />
          )}
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 text-sm bg-[var(--surface-muted)] p-4 rounded-xl border border-[var(--border-subtle)]">
          <MetaRow label="Type" value={isHtml ? 'HTML5 Playable' : item.type.toUpperCase()} />
          <MetaRow label="Size" value={item.size} />
          <MetaRow label="Dimensions" value={item.dimensions} />
          <MetaRow label="Network" value={item.network} />
          <MetaRow label="Uploaded by" value={item.uploadedBy} />
          <MetaRow label="Date" value={item.uploadedAt} />
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-[var(--text-secondary)]">Status:</span>
            <Tag style={{ color: statusConfig[item.status]?.color, backgroundColor: statusConfig[item.status]?.bg, borderColor: 'transparent' }}
              className="rounded text-[10px] font-bold border-0 m-0">{item.status}</Tag>
            {item.googleMark === 'low' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 radius_6 bg_red_subtle fg_error border border_error text-[10px] font-bold">
                Google Mark: LOW
              </span>
            )}
          </div>
        </div>

        {/* Performance row (if available) */}
        {item.spend !== undefined && item.spend > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {[
              ['Spend', `$${item.spend.toLocaleString()}`],
              ['CTR', `${item.ctr}%`],
              ['IPM', String(item.ipm)],
              ['ROAS', item.roas != null ? `${item.roas.toFixed(1)}×` : '—'],
              ['CVR', item.cvr != null ? `${item.cvr}%` : '—'],
            ].map(([k, v]) => (
              <div key={k} className="text-center p-2 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-tertiary)]">{k}</div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Campaigns used in */}
        {item.campaigns && item.campaigns.length > 0 && (
          <div>
            <div className="text-[11px] text-[var(--text-tertiary)] mb-1.5 font-semibold">Used in {item.campaigns.length} campaign(s):</div>
            <div className="flex flex-wrap gap-1.5">
              {item.campaigns.map(c => (
                <span key={c} className="inline-flex px-2 py-0.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
