import React from 'react';
import { Card, Tag, Typography, Row, Col, Divider, Tooltip } from 'antd';
import { Sparkles, BrainCircuit, Play, Layout, Image as ImageIcon } from 'lucide-react';
import { mockAxonCreativePerfs } from '@/shared/mock-data';
import type { AxonCreativePerf } from '@/shared/mock-data';

const { Text } = Typography;

export const AxonCreativePerfTab: React.FC = () => {
  const data = mockAxonCreativePerfs;

  const renderIcon = (format: string) => {
    switch (format) {
      case 'VIDEO': return <Play size={16} className="text-blue-500" />;
      case 'PLAYABLE': return <Layout size={16} className="text-purple-500" />;
      case 'BANNER': return <ImageIcon size={16} className="text-green-500" />;
      default: return <ImageIcon size={16} className="text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[var(--status-success)]';
    if (score >= 70) return 'text-[var(--status-info)]';
    if (score >= 50) return 'text-[var(--status-warning)]';
    return 'text-[var(--status-error)]';
  };

  return (
    <div className="p-2 space-y-4">
      <div className="flex justify-between items-center bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="m-0 text-sm font-semibold mb-1">SparkLabs Creative Intelligence</h4>
            <p className="text-xs text-[var(--text-secondary)] m-0">
              AI-driven insights on your creatives. Assets optimized by SparkLabs tend to perform better in the Axon ecosystem.
            </p>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {data.map((creative: AxonCreativePerf) => (
          <Col xs={24} sm={12} lg={8} key={creative.id}>
            <Card 
              className="rounded-xl border border-[var(--border-default)] shadow-none h-full hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
              styles={{ body: { padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' } }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {renderIcon(creative.format)}
                  <Text strong className="text-sm truncate w-32" title={creative.name}>{creative.name}</Text>
                </div>
                <Tag 
                  color={
                    creative.status === 'ACTIVE' ? 'success' : 
                    creative.status === 'TESTING' ? 'processing' : 'default'
                  }
                  className="m-0 border-none shrink-0"
                >
                  {creative.status}
                </Tag>
              </div>

              <div className="flex gap-2 mb-3">
                <Tag className="m-0 text-[10px]">{creative.format}</Tag>
                <Tag className="m-0 text-[10px]">{creative.dimensions}</Tag>
                {creative.duration && <Tag className="m-0 text-[10px]">{creative.duration}</Tag>}
              </div>

              <div className="bg-[var(--surface-muted)] p-3 rounded-lg mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={16} className={getScoreColor(creative.aiScore)} />
                  <span className="text-xs font-semibold">AI Match Score</span>
                </div>
                <div className={`font-bold text-lg ${getScoreColor(creative.aiScore)}`}>
                  {creative.aiScore}/100
                </div>
              </div>

              {creative.sparkLabsOptimized && (
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--brand-primary)] font-semibold mb-3">
                  <Sparkles size={12} /> SPARKLABS OPTIMIZED
                </div>
              )}

              <div className="mt-auto">
                <Divider className="my-2" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">IPM</div>
                    <div className="font-semibold text-sm">{creative.ipm.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">CVR</div>
                    <div className="font-semibold text-sm">{creative.cvr.toFixed(1)}%</div>
                  </div>
                  <Tooltip title={`Spend: $${creative.spend} | Installs: ${creative.installs}`}>
                    <div>
                      <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Installs</div>
                      <div className="font-semibold text-sm">{creative.installs.toLocaleString()}</div>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
