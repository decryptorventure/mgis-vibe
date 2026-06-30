// meta-creative-detail-drawer.tsx — side drawer showing full creative metrics + status toggle
import React from 'react';
import { Drawer, Switch, Tag } from '@/components/ui-kit-compat';
import { PlayCircle, Image as ImageIcon, Layout, Sparkles } from 'lucide-react';
import type { MetaCreativeAsset } from '@/shared/mock-data';

interface MetaCreativeDetailDrawerProps {
  creative: MetaCreativeAsset | null;
  onClose: () => void;
  onStatusChange: (id: string, status: MetaCreativeAsset['status']) => void;
}

const FORMAT_ICON: Record<string, React.ReactNode> = {
  VIDEO:    <PlayCircle size={16} className="text-[var(--status-info)]" />,
  IMAGE:    <ImageIcon size={16} className="text-[var(--status-success)]" />,
  CAROUSEL: <Layout size={16} className="text-[var(--status-info)]" />,
  PLAYABLE: <Sparkles size={16} className="text-[var(--status-warning)]" />,
};

const MetricRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border_secondary">
    <span className="text-[10px] font-bold text_tertiary uppercase tracking-wider">{label}</span>
    <span className="text-sm font-semibold text_primary">{value}</span>
  </div>
);

export const MetaCreativeDetailDrawer: React.FC<MetaCreativeDetailDrawerProps> = ({
  creative,
  onClose,
  onStatusChange,
}) => (
  <Drawer
    open={!!creative}
    onClose={onClose}
    placement="right"
    width={360}
    title={
      creative ? (
        <div className="flex items-center gap-2">
          {FORMAT_ICON[creative.format]}
          <span className="text-sm font-semibold text_primary truncate">{creative.name}</span>
        </div>
      ) : null
    }
    styles={{ body: { padding: '16px' } }}
  >
    {creative && (
      <div className="space-y-4">
        {/* Thumbnail placeholder */}
        <div className="h-36 bg_secondary border border_primary radius_8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text_tertiary">
            {FORMAT_ICON[creative.format]}
            <span className="text-xs">{creative.format} · {creative.ratio}</span>
          </div>
        </div>

        {/* Status toggle */}
        <div className="flex items-center justify-between bg_secondary border border_primary radius_8 px-3 py-2.5">
          <span className="text-sm font-semibold text_primary">Status</span>
          <div className="flex items-center gap-2">
            <Tag
              color={creative.status === 'ACTIVE' ? 'success' : creative.status === 'IN_REVIEW' ? 'processing' : 'default'}
              className="border-none m-0"
            >
              {creative.status.replace('_', ' ')}
            </Tag>
            {(creative.status === 'ACTIVE' || creative.status === 'PAUSED') && (
              <Switch
                size="small"
                checked={creative.status === 'ACTIVE'}
                onChange={checked => onStatusChange(creative.id, checked ? 'ACTIVE' : 'PAUSED')}
              />
            )}
          </div>
        </div>

        {/* Performance metrics */}
        <div>
          <div className="text-[10px] font-bold text_tertiary uppercase tracking-wider mb-1">Performance</div>
          <MetricRow label="Spend"       value={creative.spend > 0 ? `$${creative.spend.toLocaleString()}` : '-'} />
          <MetricRow label="Impressions" value={creative.impressions > 0 ? creative.impressions.toLocaleString() : '-'} />
          <MetricRow label="Installs"    value={creative.installs > 0 ? creative.installs.toLocaleString() : '-'} />
          <MetricRow label="IPM"         value={creative.ipm > 0 ? creative.ipm.toFixed(2) : '-'} />
          <MetricRow label="CTR"         value={creative.ctr > 0 ? `${creative.ctr.toFixed(1)}%` : '-'} />
          <MetricRow label="CPA"         value={creative.cpa > 0 ? `$${creative.cpa.toFixed(2)}` : '-'} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Tag className="text-xs">{creative.format}</Tag>
          <Tag className="text-xs">{creative.ratio}</Tag>
          {creative.advantagePlus && <Tag color="blue" className="text-xs border-none">Advantage+</Tag>}
          {creative.abVariant && <Tag color="purple" className="text-xs border-none">A/B · {creative.abVariant}</Tag>}
        </div>
      </div>
    )}
  </Drawer>
);
