// ─── Google Ads (UAC) network config ─────────────────────────────────────────
import React from 'react';
import { Tag } from '@/components/ui-kit-compat';
import { Video } from 'lucide-react';
import type { NetworkConfig } from './types';
import { mockGoogleAssetGroups } from '@/shared/mock-data';
import { Card, Statistic, Divider, Row, Col } from '@/components/ui-kit-compat';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { networkConfig } from '@/shared/tokens';
import { stableInt } from '@/shared/stable-metrics';

/** Asset Groups extra tab content (static, no hooks needed) */
const AssetGroupsContent: React.FC = () => {
  const assetGroups = mockGoogleAssetGroups;
  return (
    <div className="space-y-4 p-2">
      {assetGroups.map((group, index) => {
        const adStrength = index === 0 ? 'Excellent' : 'Good';
        const strengthColor = adStrength === 'Excellent' ? 'success' : 'processing';
        
        return (
          <Card key={group.id} className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[var(--text-primary)] m-0">{group.name}</h3>
                  <Tag color="green">Active</Tag>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[var(--text-tertiary)]">ID: {group.id}</span>
                  <div className="flex items-center gap-1.5 bg-[var(--surface-subtle)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Ad Strength:</span>
                    <Tag color={strengthColor} className="m-0 text-[10px] border-none font-bold">{adStrength}</Tag>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Statistic title="Spend" value={group.spend} prefix="$" valueStyle={{ fontSize: 16 }} />
                <Statistic title="Installs" value={group.installs} valueStyle={{ fontSize: 16 }} />
                <Statistic title="ROAS" value={group.roas} suffix="x" valueStyle={{ fontSize: 16, color: 'var(--status-success)' }} />
              </div>
            </div>
            <Divider className="my-3" />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="bg-[var(--surface-subtle)] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-secondary)] mb-2">
                    <FileText size={14} className="text-[var(--status-info)]" />
                    TEXT ASSETS ({group.headlines.length + group.descriptions.length}/10)
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-[var(--text-tertiary)] uppercase text-[9px]">Headlines</div>
                    <ul className="list-decimal pl-4 space-y-0.5 font-medium">
                      {group.headlines.map((h, i) => <li key={i} className="truncate">{h}</li>)}
                    </ul>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="bg-[var(--surface-subtle)] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-secondary)] mb-2">
                    <ImageIcon size={14} className="text-[var(--chart-4)]" />
                    IMAGES ({group.images.length}/20)
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {group.images.map((img, i) => (
                      <div key={i} className="flex justify-between items-center bg-[var(--surface-base)] p-1.5 rounded border border-[var(--border-subtle)] text-xs">
                        <span className="font-medium truncate pr-1">{img.name}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{img.ratio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        );
      })}
    </div>
  );
};

/** Google Ads insights tab content */
const GoogleInsightsContent: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
        <Statistic title="Avg Quality Score" value={7.4} suffix="/10" valueStyle={{ color: networkConfig['google-ads'].color }} />
        <div className="text-xs text-[var(--text-tertiary)] mt-1">Across all asset groups</div>
      </Card>
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
        <Statistic title="Total Asset Groups" value={mockGoogleAssetGroups.length} valueStyle={{ color: networkConfig['google-ads'].color }} />
        <div className="text-xs text-[var(--text-tertiary)] mt-1">Active groups</div>
      </Card>
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
        <Statistic title="Top ROAS" value={4.2} suffix="x" valueStyle={{ color: 'var(--status-success)' }} />
        <div className="text-xs text-[var(--text-tertiary)] mt-1">Best performing group</div>
      </Card>
    </div>
  </div>
);

export const googleAdsConfig: NetworkConfig = {
  key: 'google-ads',
  label: 'Google Ads',
  color: networkConfig['google-ads'].color,
  icon: <Video size={20} />,
  createButtonLabel: 'Create UAC Campaign',
  insightsContent: () => <GoogleInsightsContent />,
  extraColumns: [
    {
      dataIndex: 'qualityScore',
      title: 'Quality Score',
      width: 120,
      render: (_value, record) => {
        const score = stableInt(`${record.id}:quality-score`, 6, 9);
        const color = score >= 8 ? 'var(--status-success)' : score >= 6 ? 'var(--status-warning)' : 'var(--status-error)';
        return <span style={{ color, fontWeight: 600 }}>{score}/10</span>;
      },
    },
    {
      dataIndex: 'assetGroupCount',
      title: 'Asset Groups',
      width: 110,
      render: (_value, record) => <Tag color="blue">{stableInt(`${record.id}:asset-groups`, 1, 5)} groups</Tag>,
    },
  ],
  extraTabs: [
    {
      key: 'asset-groups',
      label: `Asset Groups (${mockGoogleAssetGroups.length})`,
      children: <AssetGroupsContent />,
    },
  ],
};
