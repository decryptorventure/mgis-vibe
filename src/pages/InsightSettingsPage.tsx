import React from 'react';
import { Card, Tabs } from 'antd';
import { LineChart, DollarSign, PieChart, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import CostCenterPage from './analytics/CostCenterPage';
import SplitMetricsPage from './analytics/SplitMetricsPage';
import Predictions from './Predictions';

export const InsightSettingsPage: React.FC = () => {
  const tabItems = [
    {
      key: 'cost-center',
      label: (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <DollarSign size={14} /> Cost Center
        </span>
      ),
      children: <CostCenterPage hideHeader />,
    },
    {
      key: 'split-metrics',
      label: (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <PieChart size={14} /> Split Metrics
        </span>
      ),
      children: <SplitMetricsPage hideHeader />,
    },
    {
      key: 'predictions',
      label: (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Sparkles size={14} /> AI Predictions
        </span>
      ),
      children: <Predictions hideHeader />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LineChart size={20} />}
        iconBg="var(--color-primary-500)"
        title="Insights"
        subtitle="Theo dõi phân bổ chi phí, split metrics, và dự báo AI cho tối ưu UA"
      />

      <Card
        className="rounded-lg border-[var(--border-default)] bg-[var(--surface-base)]"
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Tabs items={tabItems} defaultActiveKey="cost-center" className="nms-tabs" />
      </Card>
    </div>
  );
};

export default InsightSettingsPage;
