import React from 'react';
import { Table, Typography, Card, Row, Col, Progress } from '@/components/ui-kit-compat';
import { TrendingUp, Target, Users } from 'lucide-react';
import { mockAxonROASCohorts } from '@/shared/mock-data';
import type { AxonROASCohort } from '@/shared/mock-data';

const { Text } = Typography;

export const AxonRoasOptimizerTab: React.FC = () => {
  const data = mockAxonROASCohorts;

  const columns = [
    {
      title: 'Cohort Day',
      dataIndex: 'cohort',
      key: 'cohort',
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: 'Predicted ROAS',
      dataIndex: 'predictedROAS',
      key: 'predictedROAS',
      render: (v: number) => <Text type="secondary">{(v * 100).toFixed(1)}%</Text>,
    },
    {
      title: 'Actual ROAS',
      dataIndex: 'actualROAS',
      key: 'actualROAS',
      render: (v: number, record: AxonROASCohort) => {
        const isBetter = v >= record.predictedROAS;
        return (
          <Text className={isBetter ? 'text-[var(--status-success)] font-semibold' : 'text-[var(--status-warning)] font-semibold'}>
            {(v * 100).toFixed(1)}%
          </Text>
        );
      },
    },
    {
      title: 'LTV',
      dataIndex: 'ltv',
      key: 'ltv',
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    {
      title: 'Retention Rate',
      dataIndex: 'retentionRate',
      key: 'retentionRate',
      render: (v: number) => (
        <div className="w-32">
          <div className="flex justify-between text-[10px] mb-1">
            <span>{v}%</span>
          </div>
          <Progress percent={v} size="small" showInfo={false} strokeColor="var(--status-info)" className="m-0" />
        </div>
      ),
    },
    {
      title: 'Active Users',
      dataIndex: 'users',
      key: 'users',
      render: (v: number) => v.toLocaleString(),
    },
  ];

  const currentD7 = data.find(d => d.cohort === 'D7');

  return (
    <div className="p-2 space-y-4">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <Target size={16} /> Target D7 ROAS
            </div>
            <div className="text-2xl font-bold">240%</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Goal set in AppLovin Dashboard</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--status-success)]" /> Actual D7 ROAS
            </div>
            <div className="text-2xl font-bold text-[var(--status-success)]">
              {currentD7 ? (currentD7.actualROAS * 100).toFixed(1) : '-'}%
            </div>
            <div className="text-xs text-[var(--status-success)] mt-1 font-medium">+10.4% above target</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <Users size={16} /> Projected D30 LTV
            </div>
            <div className="text-2xl font-bold">$2.45</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Based on current retention curve</div>
          </Card>
        </Col>
      </Row>

      <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-default)] p-4">
        <h4 className="m-0 text-sm font-semibold mb-4">Cohort Performance & LTV Curve</h4>
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="cohort" 
          pagination={false} 
          size="small"
          className="nms-table"
        />
      </div>
    </div>
  );
};
