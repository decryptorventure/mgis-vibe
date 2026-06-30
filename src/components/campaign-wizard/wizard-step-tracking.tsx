import React from 'react';
import { Form, Input, Button, Table } from '@/components/ui-kit-compat';
import { Plus, Trash2 } from 'lucide-react';

interface WizardStepTrackingProps {
  state: any;
  onChange: (updates: Record<string, any>) => void;
}

export const WizardStepTracking: React.FC<WizardStepTrackingProps> = ({
  state,
  onChange,
}) => {
  const trackingUrl = state.trackingUrl || '';
  const postbackEvents = state.postbackEvents || [
    { key: '1', eventName: 'install', sdkEvent: 'af_install' },
    { key: '2', eventName: 'purchase', sdkEvent: 'af_purchase' },
  ];

  const handleTrackingUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ trackingUrl: e.target.value });
  };

  const handleAddEvent = () => {
    const newEvent = {
      key: `event_${Date.now()}`,
      eventName: '',
      sdkEvent: '',
    };
    onChange({ postbackEvents: [...postbackEvents, newEvent] });
  };

  const handleRemoveEvent = (key: string) => {
    const next = postbackEvents.filter((item: any) => item.key !== key);
    onChange({ postbackEvents: next });
  };

  const handleFieldChange = (key: string, field: string, val: string) => {
    const next = postbackEvents.map((item: any) => {
      if (item.key === key) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onChange({ postbackEvents: next });
  };

  const columns = [
    {
      title: 'Event Name (System)',
      dataIndex: 'eventName',
      key: 'eventName',
      render: (text: string, record: any) => (
        <Input
          placeholder="e.g. purchase"
          value={text}
          onChange={(e) => handleFieldChange(record.key, 'eventName', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'SDK Event (Attribution SDK)',
      dataIndex: 'sdkEvent',
      key: 'sdkEvent',
      render: (text: string, record: any) => (
        <Input
          placeholder="e.g. af_purchase"
          value={text}
          onChange={(e) => handleFieldChange(record.key, 'sdkEvent', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => handleRemoveEvent(record.key)}
          size="small"
        />
      ),
    },
  ];

  return (
    <Form layout="vertical" className="space-y-4">
      <Form.Item label="Attribution Tracking URL" required>
        <Input
          placeholder="https://app.appsflyer.com/com.ig.hotpot?pid=external_ads..."
          value={trackingUrl}
          onChange={handleTrackingUrlChange}
          size="small"
        />
        <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
          Hệ thống sẽ tự động chèn thêm macro click/impression ID của các Ad Network khi phát hành chiến dịch
        </div>
      </Form.Item>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Postback Events</span>
          <Button
            type="dashed"
            icon={<Plus size={12} />}
            onClick={handleAddEvent}
            size="small"
            className="text-xs"
          >
            Add Event
          </Button>
        </div>
        <Table
          className="nms-table"
          dataSource={postbackEvents}
          columns={columns}
          pagination={false}
          size="small"
        />
      </div>
    </Form>
  );
};
export default WizardStepTracking;
