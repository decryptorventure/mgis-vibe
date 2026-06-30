import React from 'react';
import { Table, Tag, Card, Row, Col, Typography, Progress } from '@/components/ui-kit-compat';
import { Users, UserPlus, Target } from 'lucide-react';
import { mockMetaAudiences } from '@/shared/mock-data';
import type { MetaAudience } from '@/shared/mock-data';

const { Text } = Typography;

export const MetaAudienceTab: React.FC = () => {
  const data = mockMetaAudiences;

  const columns = [
    {
      title: 'Audience Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      key: 'type',
      render: (_: any, record: MetaAudience) => {
        let icon = <Users size={14} />;
        let color = 'default';
        if (record.type === 'CUSTOM') { icon = <UserPlus size={14} />; color = 'blue'; }
        if (record.type === 'LOOKALIKE') { icon = <Target size={14} />; color = 'purple'; }
        return (
          <Tag color={color} className="flex items-center gap-1 w-fit">
            {icon} {record.type}
            {record.lookalikePercent && ` ${record.lookalikePercent}%`}
          </Tag>
        );
      },
    },
    {
      title: 'Estimated Reach',
      dataIndex: 'estimatedReach',
      key: 'estimatedReach',
      render: (reach: number) => {
        if (reach === 0) return <Text type="secondary">—</Text>;
        const m = reach / 1000000;
        return <Text>{m >= 1 ? `${m.toFixed(1)}M` : `${(reach / 1000).toFixed(0)}K`}</Text>;
      },
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
    {
      title: 'CPA',
      dataIndex: 'cpa',
      key: 'cpa',
      render: (v: number) => v > 0 ? `$${v.toFixed(2)}` : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          READY: 'success',
          UPDATING: 'processing',
          TOO_SMALL: 'error'
        };
        return (
          <div className="flex items-center gap-2">
            <Tag color={colorMap[status] || 'default'}>{status.replace('_', ' ')}</Tag>
            {status === 'UPDATING' && <Progress type="circle" percent={45} size={14} showInfo={false} />}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 p-2">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <Target size={16} /> Lookalike Audiences
            </div>
            <div className="text-2xl font-bold">{data.filter(d => d.type === 'LOOKALIKE').length}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <UserPlus size={16} /> Custom Audiences
            </div>
            <div className="text-2xl font-bold">{data.filter(d => d.type === 'CUSTOM').length}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <Users size={16} /> Total Reach
            </div>
            <div className="text-2xl font-bold">~20.1M</div>
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
