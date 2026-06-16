import React from 'react';
import { Card, Tabs } from 'antd';
import { Bot, Zap, History } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import NetworkRules from './NetworkRules';
import Automation from './Automation';

export const AutomationSettingsPage: React.FC = () => {
  const tabItems = [
    {
      key: 'rules-directory',
      label: (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Bot size={14} /> Rules Directory
        </span>
      ),
      children: <NetworkRules hideHeader />,
    },
    {
      key: 'execution-history',
      label: (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <History size={14} /> Execution History
        </span>
      ),
      children: <Automation hideHeader />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Zap size={20} />}
        iconBg="var(--color-primary-500)"
        title="Automation Settings"
        subtitle="Thiết lập các quy tắc tự động hóa chiến dịch quảng cáo và theo dõi lịch sử thực thi"
      />

      <Card
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)]"
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Tabs items={tabItems} defaultActiveKey="rules-directory" className="nms-tabs" />
      </Card>
    </div>
  );
};

export default AutomationSettingsPage;
