import React from 'react';
import { Table, Tag, Progress, Card, Statistic, Row, Col, Typography } from '@/components/ui-kit-compat';
import { TrendingUp, Crosshair, Download } from 'lucide-react';
import { mockGoogleBiddingStrategies } from '@/shared/mock-data';
import type { GoogleBiddingStrategy } from '@/shared/mock-data';

const { Text } = Typography;

export const GoogleAdsBiddingTab: React.FC = () => {
  const data = mockGoogleBiddingStrategies;

  const columns = [
    {
      title: 'Campaign ID',
      dataIndex: 'campaignId',
      key: 'campaignId',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Bidding Strategy',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'TARGET_ROAS' ? 'purple' : type === 'TARGET_CPA' ? 'blue' : 'cyan';
        return <Tag color={color}>{type.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Target vs Actual',
      key: 'performance',
      render: (_: any, record: GoogleBiddingStrategy) => {
        if (record.type === 'MAXIMIZE_INSTALLS') return <Text type="secondary">â€”</Text>;
        const isROAS = record.type === 'TARGET_ROAS';
        const prefix = isROAS ? '' : '$';
        const suffix = isROAS ? 'x' : '';
        const isGood = isROAS 
          ? record.actualValue >= record.targetValue 
          : record.actualValue <= record.targetValue;
          
        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-xs">
              <Text type="secondary">Target: {prefix}{record.targetValue.toFixed(2)}{suffix}</Text>
              <Text strong className={isGood ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}>
                Actual: {prefix}{record.actualValue.toFixed(2)}{suffix}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Daily Budget Pacing',
      key: 'budget',
      render: (_: any, record: GoogleBiddingStrategy) => {
        const percent = Math.round((record.spentToday / record.dailyBudget) * 100);
        return (
          <div className="w-48">
            <div className="flex justify-between text-xs mb-1">
              <span>${record.spentToday}</span>
              <span className="text-[var(--text-tertiary)]">${record.dailyBudget}</span>
            </div>
            <Progress percent={percent} size="small" status={percent >= 90 ? 'exception' : 'normal'} showInfo={false} />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          LEARNING: 'warning',
          OPTIMIZED: 'success',
          LIMITED: 'error'
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text: string) => <Text type="secondary" className="text-xs">{text}</Text>
    }
  ];

  return (
    <div className="space-y-4 p-2">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title={<span className="flex items-center gap-2"><Crosshair size={16} className="text-[var(--status-info)]" /> Target CPA Campaigns</span>} 
              value={data.filter(d => d.type === 'TARGET_CPA').length} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title={<span className="flex items-center gap-2"><TrendingUp size={16} className="text-[var(--status-success)]" /> Target ROAS Campaigns</span>} 
              value={data.filter(d => d.type === 'TARGET_ROAS').length} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title={<span className="flex items-center gap-2"><Download size={16} className="text-[var(--status-warning)]" /> Max Installs Campaigns</span>} 
              value={data.filter(d => d.type === 'MAXIMIZE_INSTALLS').length} 
            />
          </Card>
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        pagination={false} 
        size="small"
        className="nms-table"
      />
    </div>
  );
};
