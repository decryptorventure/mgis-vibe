import React from 'react';
import { Card, Tag, Typography, Row, Col, Divider, Button } from 'antd';
import { Folder, Upload, Play, Image as ImageIcon, Layout, Box } from 'lucide-react';
import { mockMolocoCreativeGroups } from '@/shared/mock-data';
import type { MolocoCreativeGroup } from '@/shared/mock-data';

const { Text } = Typography;

export const MolocoCreativeGroupsTab: React.FC = () => {
  const data = mockMolocoCreativeGroups;

  const renderIcon = (format: string) => {
    switch (format) {
      case 'VIDEO': return <Play size={14} className="text-blue-500" />;
      case 'BANNER': return <ImageIcon size={14} className="text-green-500" />;
      case 'NATIVE': return <Layout size={14} className="text-orange-500" />;
      case 'PLAYABLE': return <Box size={14} className="text-purple-500" />;
      default: return <Folder size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="p-2 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Folder size={18} className="text-[var(--text-secondary)]" />
          <h3 className="m-0 text-base font-semibold">Creative Groups</h3>
        </div>
        <Button type="primary" icon={<Upload size={14} />}>Upload Creative Group</Button>
      </div>

      <Row gutter={[16, 16]}>
        {data.map((group: MolocoCreativeGroup) => (
          <Col xs={24} md={12} key={group.id}>
            <Card 
              className="rounded-xl border border-[var(--border-default)] shadow-none h-full flex flex-col"
              styles={{ body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' } }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Text strong className="text-sm block mb-1">{group.name}</Text>
                  <Text type="secondary" className="text-xs font-mono">Campaign ID: {group.campaignId}</Text>
                </div>
                <Tag color={group.status === 'ACTIVE' ? 'success' : 'default'} className="m-0 border-none shrink-0">
                  {group.status}
                </Tag>
              </div>

              <div className="bg-[var(--surface-subtle)] rounded-lg p-3 mb-4 flex-1">
                <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase">Assets in group ({group.creatives.length})</div>
                <div className="space-y-1.5">
                  {group.creatives.map((c, i) => (
                    <div key={i} className="flex justify-between items-center bg-[var(--surface-base)] p-1.5 rounded border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        {renderIcon(c.format)}
                        <span className="text-xs font-medium truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{c.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <Divider className="my-0 mb-3" />
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Spend</div>
                    <div className="text-xs font-medium">${group.spend.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Installs</div>
                    <div className="text-xs font-medium">{group.installs.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">CTR</div>
                    <div className="text-xs font-medium">{group.ctr.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">CVR</div>
                    <div className="text-xs font-medium">{group.cvr.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
