// Task 6 — Creative grid card with inline performance metrics and preview affordance
import React from 'react';
import { Tag, Tooltip } from 'antd';
import { Button as AntButton } from 'antd';
import { Download, Eye, Play, Trash2 } from 'lucide-react';
import { toast } from '@frontend-team/ui-kit';
import { statusConfig, type MediaItem } from '@/shared/mock-data';

interface Props {
  item: MediaItem;
  onPreview: (item: MediaItem) => void;
}

const GOOGLE_LOW_TAG = (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 radius_4 bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold">
    ↓ LOW
  </span>
);

export const CreativeGridCard: React.FC<Props> = ({ item, onPreview }) => {
  const isHtml = item.name.endsWith('.html') || item.name.endsWith('.zip');
  const hasPerf = item.spend !== undefined && item.spend > 0;

  return (
    <div className="rounded-xl overflow-hidden cursor-pointer group bg-[var(--surface-base)] border border-[var(--border-default)]">
      {/* Thumbnail */}
      <div className="relative h-36 bg-[var(--surface-muted)] flex items-center justify-center overflow-hidden"
        onClick={() => onPreview(item)}>
        {isHtml ? (
          <div className="absolute inset-0 bg-indigo-50/50 flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-black text-indigo-500 font-mono tracking-widest uppercase">HTML5</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-1 font-semibold truncate max-w-full">{item.name}</span>
          </div>
        ) : item.type === 'video' ? (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <Play size={32} className="text-white/80 drop-shadow-md" />
          </div>
        ) : (
          <img src={`https://picsum.photos/seed/${item.id}/400/300`} alt={item.name} className="w-full h-full object-cover" />
        )}

        {/* Status + Google mark badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Tag style={{ color: statusConfig[item.status]?.color, backgroundColor: statusConfig[item.status]?.bg, borderColor: 'transparent' }}
            className="rounded text-[9px] border-0 font-bold m-0">{item.status}</Tag>
          {item.googleMark === 'low' && GOOGLE_LOW_TAG}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <AntButton aria-label="Preview" size="small" shape="circle" icon={<Eye size={14} />} className="bg-[var(--surface-base)]/90" />
          <AntButton aria-label="Download" size="small" shape="circle" icon={<Download size={14} />} className="bg-[var(--surface-base)]/90"
            onClick={e => { e.stopPropagation(); toast.info('Download started'); }} />
          <AntButton aria-label="Delete" size="small" shape="circle" icon={<Trash2 size={14} />} danger className="bg-[var(--surface-base)]/90"
            onClick={e => { e.stopPropagation(); toast.info('Delete action triggered'); }} />
        </div>
      </div>

      {/* Info row */}
      <div className="p-3">
        <Tooltip title={item.name}>
          <p className="font-bold text-xs text-[var(--text-primary)] truncate mb-1">{item.name}</p>
        </Tooltip>

        {hasPerf ? (
          <div className="mb-2 bg-[var(--surface-subtle)] p-1.5 rounded text-[10px] border border-[var(--border-subtle)]">
            <div className="flex justify-between text-[var(--text-secondary)] font-bold">
              <span>${item.spend!.toLocaleString()} Spend</span>
              <span>{item.installs?.toLocaleString()} Inst</span>
            </div>
            <div className="flex justify-between text-[var(--text-tertiary)] mt-0.5">
              <span>CTR {item.ctr}%</span>
              {item.roas !== undefined && (
                <span className={item.roas < 1 ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>
                  ROAS {item.roas.toFixed(1)}×
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-2 h-10 border border-dashed border-[var(--border-subtle)] rounded flex items-center justify-center text-[10px] text-[var(--text-tertiary)] italic">
            No Performance Data
          </div>
        )}

        <div className="flex justify-between items-center text-[10px] text-[var(--text-tertiary)] font-semibold">
          <span>{item.size} · {item.dimensions}</span>
          <Tag bordered={false} className="text-[9px] font-bold rounded m-0 uppercase">{item.network}</Tag>
        </div>
        <p className="text-[9px] text-[var(--text-tertiary)] mt-1 truncate">{item.uploadedBy} · {item.uploadedAt}</p>
      </div>
    </div>
  );
};
