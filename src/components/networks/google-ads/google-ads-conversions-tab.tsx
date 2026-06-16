import React from 'react';
import { Table, Tag, Switch, Card, Row, Col, Typography, Button } from 'antd';
import { Activity, Smartphone, Server } from 'lucide-react';
import { mockGoogleConversionEvents } from '@/shared/mock-data';
import type { GoogleConversionEvent } from '@/shared/mock-data';

const { Text } = Typography;

export const GoogleAdsConversionsTab: React.FC = () => {
  const data = mockGoogleConversionEvents;

  const columns = [
    {
      title: 'Conversion Event',
      key: 'eventName',
      render: (_: any, record: GoogleConversionEvent) => (
        <div>
          <div className="font-semibold text-sm flex items-center gap-2">
            {record.eventName}
            {record.isPrimary && <Tag color="gold" className="ml-2 text-[10px] m-0 border-none">PRIMARY</Tag>}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-mono">{record.sdkEvent}</div>
        </div>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => {
        let icon = <Server size={14} />;
        if (source === 'Firebase') icon = <Smartphone size={14} className="text-[#FFA000]" />;
        else if (source === 'AppsFlyer') icon = <Activity size={14} className="text-[#000]" />;
        
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {icon}
            {source}
          </div>
        );
      },
    },
    {
      title: 'Attribution Window',
      dataIndex: 'attributionWindow',
      key: 'attributionWindow',
      render: (window: string) => <Tag>{window}</Tag>,
    },
    {
      title: 'All Conv.',
      dataIndex: 'conversionCount',
      key: 'conversionCount',
      render: (count: number) => <Text strong>{count.toLocaleString()}</Text>,
    },
    {
      title: 'Conv. Value',
      dataIndex: 'conversionValue',
      key: 'conversionValue',
      render: (value: number) => <Text type="secondary">${value.toLocaleString()}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: GoogleConversionEvent) => (
        <div className="flex items-center gap-2">
          <Switch size="small" checked={record.status === 'ACTIVE'} disabled={record.status === 'PENDING'} />
          <Text className={`text-xs ${record.status === 'ACTIVE' ? 'text-[var(--status-success)]' : record.status === 'PENDING' ? 'text-[var(--status-warning)]' : 'text-[var(--text-tertiary)]'}`}>
            {record.status}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-2">
      <Row gutter={[16, 16]}>
        <Col span={12}>
           <Card className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)] shadow-none" styles={{ body: { padding: '16px' } }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold mb-1">Firebase Integration</div>
                  <div className="text-xs text-[var(--text-secondary)]">Project: ig-hot-pot-firebase</div>
                </div>
                <Tag color="success" className="border-none">Connected</Tag>
              </div>
           </Card>
        </Col>
        <Col span={12}>
           <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '16px' } }}>
              <div className="flex justify-between items-center h-full">
                <div className="text-sm font-semibold">Need a new event?</div>
                <Button size="small" type="primary">Import from Firebase</Button>
              </div>
           </Card>
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        pagination={false} 
        size="small"
        className="nms-table mt-4"
      />
    </div>
  );
};
