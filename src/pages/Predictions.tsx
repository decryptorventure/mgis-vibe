import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Tag, Skeleton, Row, Col, Statistic } from 'antd';
import { TrendingUp, BarChart2, AlertCircle, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts';
import { PageHeader } from '../components/ui';

const chartData = [
  { day: 'Day 1', actual: 1.2, predicted: 1.25 },
  { day: 'Day 3', actual: 2.1, predicted: 2.15 },
  { day: 'Day 7', actual: 3.5, predicted: 3.4 },
  { day: 'Day 14', actual: 4.1, predicted: 4.2 },
  { day: 'Day 30', actual: null, predicted: 5.8 },
  { day: 'Day 60', actual: null, predicted: 7.1 },
  { day: 'Day 90', actual: null, predicted: 8.5 },
];

const campaignsPrediction = [
  { id: 'c1', name: 'US_iOS_Search_Brand', network: 'Google Ads', spend: 5000, d7_actual: '110%', d30_predict: '145%', d90_predict: '210%', status: 'PROFITABLE' },
  { id: 'c4', name: 'Meta_US_LAL_Install', network: 'Meta', spend: 7800, d7_actual: '85%', d30_predict: '115%', d90_predict: '160%', status: 'BREAKEVEN' },
  { id: 'c9', name: 'Axon_US_CPI_Video', network: 'Axon', spend: 5400, d7_actual: '105%', d30_predict: '135%', d90_predict: '190%', status: 'PROFITABLE' },
  { id: 'c12', name: 'Moloco_JP_Install', network: 'Moloco', spend: 1200, d7_actual: '40%', d30_predict: '55%', d90_predict: '70%', status: 'LOSS' },
];

interface PredictionsProps {
  hideHeader?: boolean;
}

export const Predictions: React.FC<PredictionsProps> = ({ hideHeader }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    { title: 'Campaign Name', dataIndex: 'name', key: 'name', render: (t: string) => <span className="font-semibold text-[var(--text-primary)]">{t}</span> },
    { title: 'Network', dataIndex: 'network', key: 'network', width: 120, render: (t: string) => <Tag bordered={false} className="rounded">{t}</Tag> },
    { title: 'Current Spend', dataIndex: 'spend', key: 'spend', width: 120, render: (v: number) => `$${v.toLocaleString()}` },
    { title: 'D7 ROAS (Actual)', dataIndex: 'd7_actual', key: 'd7_actual', width: 140, render: (t: string) => <span className="font-medium text-[var(--text-secondary)]">{t}</span> },
    { title: 'D30 ROAS (Predicted)', dataIndex: 'd30_predict', key: 'd30_predict', width: 160, render: (t: string) => <span className="font-bold text-[var(--status-info)]">{t}</span> },
    { title: 'D90 ROAS (Predicted)', dataIndex: 'd90_predict', key: 'd90_predict', width: 160, render: (t: string) => <span className="font-bold text-[var(--chart-4)]">{t}</span> },
    { 
      title: 'Forecast', 
      dataIndex: 'status', 
      key: 'status', 
      width: 120,
      render: (s: string) => {
        let color = 'default';
        if (s === 'PROFITABLE') color = 'green';
        if (s === 'BREAKEVEN') color = 'orange';
        if (s === 'LOSS') color = 'red';
        return <Tag color={color} className="font-bold rounded">{s}</Tag>;
      }
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {!hideHeader && <Skeleton.Input active style={{ width: 300, height: 40 }} />}
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 5 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <PageHeader
          icon={<Sparkles size={20} />}
          iconBg="var(--chart-4)"
          title="AI Predictions"
          subtitle="Dự báo LTV & ROAS dựa trên mô hình Machine Learning"
          actions={
            <div className="flex gap-3">
              <Select defaultValue="all" className="w-40" options={[{ value: 'all', label: 'All Projects' }, { value: 'p1', label: 'iG_Hot_Pot_IOS' }]} />
              <Select defaultValue="roas" className="w-40" options={[{ value: 'roas', label: 'Predictive ROAS' }, { value: 'ltv', label: 'Predictive LTV' }]} />
            </div>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-[var(--border-default)]">
            <Statistic title="Predicted D30 ROAS (Avg)" value="128%" valueStyle={{ color: 'var(--status-success)', fontWeight: 'bold' }} prefix={<TrendingUp size={20} className="mr-2" />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-[var(--border-default)]">
            <Statistic title="Predicted D90 ROAS (Avg)" value="185%" valueStyle={{ color: 'var(--status-success)', fontWeight: 'bold' }} prefix={<TrendingUp size={20} className="mr-2" />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-[var(--border-default)]">
            <Statistic title="Loss Risk Campaigns" value="1" valueStyle={{ color: 'var(--status-error)', fontWeight: 'bold' }} prefix={<AlertCircle size={20} className="mr-2" />} />
          </Card>
        </Col>
      </Row>

      <Card 
        className="rounded-xl" 
        title={
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-[var(--chart-4)]" />
            <span>LTV Prediction Curve (Actual vs Forecast)</span>
          </div>
        }
      >
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)' }}
                formatter={(value: any) => [`$${value}`, '']}
              />
              <Legend />
              
              {/* Highlight Future Prediction Area */}
              <ReferenceArea x1="Day 14" x2="Day 90" fill="var(--chart-4)" fillOpacity={0.05} />
              
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual LTV" 
                stroke="var(--chart-2)"
                strokeWidth={3} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                name="AI Predicted LTV" 
                stroke="var(--chart-4)"
                strokeWidth={3} 
                strokeDasharray="5 5" 
                dot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="rounded-xl" title="Campaign Level Predictions" styles={{ body: { padding: 0 } }}>
        <Table 
          className="nms-table" 
          columns={columns} 
          dataSource={campaignsPrediction} 
          rowKey="id" 
          pagination={false} 
        />
      </Card>
    </div>
  );
};

export default Predictions;
