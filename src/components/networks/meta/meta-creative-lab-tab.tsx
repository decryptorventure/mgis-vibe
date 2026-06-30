import React, { useState } from 'react';
import { Card, Tag, Typography, Row, Col, Divider } from '@/components/ui-kit-compat';
import { PlayCircle, Image as ImageIcon, Layout, Sparkles } from 'lucide-react';
import { mockMetaCreativeAssets, type MetaCreativeAsset } from '@/shared/mock-data';
import { MetaCreativeDetailDrawer } from './meta-creative-detail-drawer';

const { Text } = Typography;

export const MetaCreativeLabTab: React.FC = () => {
  const [creatives, setCreatives] = useState<MetaCreativeAsset[]>(mockMetaCreativeAssets);
  const [selected, setSelected] = useState<MetaCreativeAsset | null>(null);

  const handleStatusChange = (id: string, status: MetaCreativeAsset['status']) => {
    setCreatives(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const renderIcon = (format: string) => {
    switch (format) {
      case 'VIDEO':    return <PlayCircle size={14} className="text-[var(--status-info)]" />;
      case 'IMAGE':    return <ImageIcon size={14} className="text-[var(--status-success)]" />;
      case 'CAROUSEL': return <Layout size={14} className="text-purple-500" />;
      case 'PLAYABLE':
      default:         return <Sparkles size={14} className="text-[var(--status-warning)]" />;
    }
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0 text-base font-semibold">Creative Performance Lab</h3>
        <Tag color="purple" className="flex items-center gap-1 border-none font-medium">
          <Sparkles size={12} /> Advantage+ Creative Enabled
        </Tag>
      </div>

      <Row gutter={[16, 16]}>
        {creatives.map((creative) => (
          <Col xs={24} sm={12} lg={8} key={creative.id}>
            <Card
              onClick={() => setSelected(creative)}
              className="rounded-xl border border-[var(--border-default)] shadow-none h-full hover:border-[var(--brand-primary)] transition-colors cursor-pointer overflow-hidden flex flex-col"
              styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
            >
              {/* Fake thumbnail area */}
              <div className="h-32 bg-[var(--surface-muted)] flex items-center justify-center border-b border-[var(--border-subtle)] relative">
                {renderIcon(creative.format)}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Tag className="m-0 border-none bg-black/50 text-white backdrop-blur-sm text-[10px]">{creative.format}</Tag>
                  <Tag className="m-0 border-none bg-black/50 text-white backdrop-blur-sm text-[10px]">{creative.ratio}</Tag>
                </div>
                {creative.abVariant && (
                  <div className="absolute top-2 right-2 bg-[var(--brand-primary)] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {creative.abVariant}
                  </div>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Text strong className="text-sm truncate pr-2" title={creative.name}>{creative.name}</Text>
                  <Tag
                    color={
                      creative.status === 'ACTIVE' ? 'success' :
                      creative.status === 'PAUSED' ? 'default' :
                      creative.status === 'IN_REVIEW' ? 'processing' : 'error'
                    }
                    className="m-0 border-none shrink-0"
                  >
                    {creative.status.replace('_', ' ')}
                  </Tag>
                </div>

                <div className="mt-auto">
                  <Divider className="my-2" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">IPM</div>
                      <div className="font-medium text-xs">{creative.ipm > 0 ? creative.ipm.toFixed(2) : '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">CTR</div>
                      <div className="font-medium text-xs">{creative.ctr > 0 ? `${creative.ctr.toFixed(1)}%` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">CPA</div>
                      <div className="font-medium text-xs">{creative.cpa > 0 ? `$${creative.cpa.toFixed(2)}` : '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <MetaCreativeDetailDrawer
        creative={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
