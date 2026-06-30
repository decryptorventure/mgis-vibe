import React from 'react';
import { Card, Tag, Typography, Row, Col, Divider, Button } from '@/components/ui-kit-compat';
import { Image as ImageIcon, Smartphone, CheckCircle2 } from 'lucide-react';
import { mockAsaCreativeSets } from '@/shared/mock-data';
import type { AsaCreativeSet } from '@/shared/mock-data';

const { Text } = Typography;

export const AsaCreativeSetsTab: React.FC = () => {
  const data = mockAsaCreativeSets;

  return (
    <div className="p-2 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="m-0 text-base font-semibold">Creative Sets</h3>
          <p className="m-0 text-xs text-[var(--text-secondary)]">Manage app store preview combinations</p>
        </div>
        <Button type="primary">Create Set</Button>
      </div>

      <Row gutter={[16, 16]}>
        {data.map((set: AsaCreativeSet) => (
          <Col xs={24} md={12} lg={8} key={set.id}>
            <Card 
              className="rounded-xl border border-[var(--border-default)] shadow-none h-full flex flex-col"
              styles={{ body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' } }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Text strong className="text-sm truncate">{set.name}</Text>
                    {set.cppStatus === 'CUSTOM' && <Tag color="purple" className="m-0 text-[10px] border-none shrink-0">CPP</Tag>}
                  </div>
                  <Text type="secondary" className="text-[10px]">Ad Group ID: {set.adGroupId}</Text>
                </div>
                <Tag color={set.status === 'ACTIVE' ? 'success' : 'default'} className="m-0 border-none shrink-0">
                  {set.status}
                </Tag>
              </div>

              {/* Screenshots preview strip */}
              <div className="flex gap-2 mb-4 bg-[var(--surface-muted)] p-2 rounded-lg items-center overflow-hidden">
                {set.appPreview && (
                  <div className="h-16 w-10 bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-sm flex items-center justify-center shrink-0">
                    <Smartphone size={16} className="text-[var(--text-tertiary)]" />
                  </div>
                )}
                {set.screenshots.map((_s, i) => (
                  <div key={i} className="h-16 w-10 bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-sm flex items-center justify-center shrink-0 text-[8px] text-[var(--text-disabled)] overflow-hidden">
                    <ImageIcon size={16} />
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <Divider className="my-3" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Tap-Through Rate</div>
                    <div className="font-semibold text-sm">{set.ttr.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Conversion Rate</div>
                    <div className="font-semibold text-sm flex items-center gap-1">
                      {set.conversionRate.toFixed(1)}%
                      {set.conversionRate > 50 && <CheckCircle2 size={12} className="text-[var(--status-success)]" />}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Impressions</div>
                    <div className="text-xs">{set.impressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Installs</div>
                    <div className="text-xs">{set.installs.toLocaleString()}</div>
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
