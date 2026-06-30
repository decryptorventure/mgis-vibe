import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tag, Divider } from '@/components/ui-kit-compat';
import { BrainCircuit, Activity, Zap, Server, Target } from 'lucide-react';
import { mockMolocoMLStats } from '@/shared/mock-data';

const { Text } = Typography;

export const MolocoMLTab: React.FC = () => {
  const data = mockMolocoMLStats;

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: 'Win Rate',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: 'CVR',
      dataIndex: 'cvr',
      key: 'cvr',
      render: (v: number) => `${v.toFixed(2)}%`,
    },
    {
      title: 'Spend',
      dataIndex: 'spend',
      key: 'spend',
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: 'Installs',
      dataIndex: 'installs',
      key: 'installs',
      render: (v: number) => v.toLocaleString(),
    },
  ];

  return (
    <div className="p-2 space-y-4">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="m-0 text-base font-semibold flex items-center gap-2">
            <BrainCircuit size={18} className="text-[var(--brand-primary)]" />
            Machine Learning Engine Performance
          </h3>
          <p className="m-0 text-xs text-[var(--text-secondary)] mt-1">
            Real-time deep learning model metrics and bidding transparency
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold mb-1">Active Model</div>
          <Tag color="purple" className="m-0 border-none font-mono">{data.modelVersion}</Tag>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">Last trained: {data.lastTrainedAt}</div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title={<span className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"><Zap size={14} className="text-[var(--status-warning)]" /> Overall Win Rate</span>} 
              value={data.overallWinRate} 
              suffix="%" 
              valueStyle={{ fontSize: 24, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title={<span className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"><Activity size={14} className="text-[var(--status-info)]" /> Avg Bid Price</span>} 
              value={data.avgBidPrice} 
              prefix="$"
              precision={4}
              valueStyle={{ fontSize: 24, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-center justify-between mb-2">
               <span className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"><Target size={14} className="text-[var(--status-success)]" /> CVR Accuracy</span>
            </div>
            <div className="flex justify-between items-end mt-1">
               <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase">Predicted</div>
                  <div className="font-bold text-lg">{data.predictedCVR.toFixed(2)}%</div>
               </div>
               <Divider type="vertical" className="h-8" />
               <div className="text-right">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase">Actual</div>
                  <div className="font-bold text-lg text-[var(--status-success)]">{data.actualCVR.toFixed(2)}%</div>
               </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <Statistic 
              title={<span className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"><Server size={14} className="text-purple-500" /> Processing Speed</span>} 
              value={data.avgResponseTimeMs} 
              suffix="ms" 
              valueStyle={{ fontSize: 24, fontWeight: 700 }}
            />
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{Math.round(data.bidRequestsDaily / 1000000)}M daily requests</div>
          </Card>
        </Col>
      </Row>

      <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-default)] p-4 mt-4">
        <h4 className="m-0 text-sm font-semibold mb-4">7-Day Model Performance Trend</h4>
        <Table 
          columns={columns} 
          dataSource={data.dailyStats} 
          rowKey="date" 
          pagination={false} 
          size="small"
          className="nms-table"
        />
      </div>
    </div>
  );
};
