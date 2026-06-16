import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Select, Statistic, Row, Col, Skeleton, Segmented } from 'antd';
import { Download, Filter, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PageHeader } from '../components/ui';

// Phase 7: Move static data outside component
interface ReportRow {
  country: string;
  spend: number;
  installs: number;
  clicks: number;
  impressions: number;
  cpi: number;
  roas: number;
}

const fullReportData: Record<string, ReportRow[]> = {
  '7d': [
    { country: 'US', spend: 12500, installs: 8200, clicks: 45000, impressions: 520000, cpi: 1.52, roas: 3.8 },
    { country: 'JP', spend: 8200, installs: 4100, clicks: 28000, impressions: 320000, cpi: 2.0, roas: 2.9 },
    { country: 'KR', spend: 6800, installs: 5500, clicks: 32000, impressions: 410000, cpi: 1.24, roas: 4.1 },
    { country: 'TH', spend: 3200, installs: 3800, clicks: 18000, impressions: 220000, cpi: 0.84, roas: 3.2 },
    { country: 'ID', spend: 2100, installs: 2900, clicks: 14000, impressions: 180000, cpi: 0.72, roas: 2.5 },
  ],
  '14d': [
    { country: 'US', spend: 24800, installs: 16200, clicks: 89000, impressions: 1040000, cpi: 1.53, roas: 3.7 },
    { country: 'JP', spend: 16100, installs: 8000, clicks: 55000, impressions: 640000, cpi: 2.01, roas: 2.8 },
    { country: 'KR', spend: 13500, installs: 10800, clicks: 63000, impressions: 810000, cpi: 1.25, roas: 4.0 },
    { country: 'TH', spend: 6300, installs: 7500, clicks: 35000, impressions: 430000, cpi: 0.84, roas: 3.1 },
    { country: 'ID', spend: 4100, installs: 5700, clicks: 27000, impressions: 350000, cpi: 0.72, roas: 2.4 },
  ],
  '30d': [
    { country: 'US', spend: 52000, installs: 34000, clicks: 188000, impressions: 2200000, cpi: 1.53, roas: 3.6 },
    { country: 'JP', spend: 33500, installs: 16800, clicks: 115000, impressions: 1350000, cpi: 1.99, roas: 2.7 },
    { country: 'KR', spend: 28000, installs: 22600, clicks: 132000, impressions: 1700000, cpi: 1.24, roas: 3.9 },
    { country: 'TH', spend: 13100, installs: 15600, clicks: 73000, impressions: 900000, cpi: 0.84, roas: 3.0 },
    { country: 'ID', spend: 8500, installs: 11900, clicks: 56000, impressions: 730000, cpi: 0.71, roas: 2.3 },
  ],
};

const chartData = [
  { name: 'Mon', spend: 3200, installs: 1800 }, { name: 'Tue', spend: 2800, installs: 1600 },
  { name: 'Wed', spend: 4100, installs: 2400 }, { name: 'Thu', spend: 3600, installs: 2100 },
  { name: 'Fri', spend: 2900, installs: 1900 }, { name: 'Sat', spend: 1800, installs: 1200 },
  { name: 'Sun', spend: 2200, installs: 1400 },
];

export const AxonReports: React.FC = () => {
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  const [chartTab, setChartTab] = useState('daily');

  // Phase 4: Loading state with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Phase 7: Connect period select to actually filter data
  const reportData = useMemo(() => fullReportData[period] || fullReportData['7d'], [period]);

  // Phase 7: Memoize computed stats
  const totalSpend = useMemo(() => reportData.reduce((s, r) => s + r.spend, 0), [reportData]);
  const totalInstalls = useMemo(() => reportData.reduce((s, r) => s + r.installs, 0), [reportData]);

  // Phase 7: Fix sorter types — use proper ReportRow type instead of `any`
  const columns = useMemo(() => [
    { title: 'Country', dataIndex: 'country', key: 'country', width: 80, render: (t: string) => <span className="font-bold">{t}</span> },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', render: (v: number) => `$${v.toLocaleString()}`, sorter: (a: ReportRow, b: ReportRow) => a.spend - b.spend },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', render: (v: number) => v.toLocaleString(), sorter: (a: ReportRow, b: ReportRow) => a.installs - b.installs },
    { title: 'Clicks', dataIndex: 'clicks', key: 'clicks', render: (v: number) => v.toLocaleString() },
    { title: 'Impressions', dataIndex: 'impressions', key: 'impressions', render: (v: number) => v.toLocaleString() },
    { title: 'CPI', dataIndex: 'cpi', key: 'cpi', render: (v: number) => `$${v.toFixed(2)}`, sorter: (a: ReportRow, b: ReportRow) => a.cpi - b.cpi },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', render: (v: number) => <span className="font-bold text-[var(--status-success)]">{v.toFixed(1)}x</span>, sorter: (a: ReportRow, b: ReportRow) => a.roas - b.roas },
  ], []);

  // Phase 4: Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map(i => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phase 8: Use PageHeader */}
      <PageHeader
        icon={<BarChart3 size={20} />}
        iconBg="var(--chart-4)"
        title="Axon Reports"
        subtitle="Báo cáo hiệu suất chiến dịch trên Axon / AppLovin"
        actions={
          <div className="flex gap-3">
            <Select value={period} onChange={setPeriod} className="w-32" options={[
              { value: '7d', label: 'Last 7 days' }, { value: '14d', label: 'Last 14 days' }, { value: '30d', label: 'Last 30 days' },
            ]} />
            <Button icon={<Filter size={14} />}>Filters</Button>
            <Button icon={<Download size={14} />}>Export CSV</Button>
          </div>
        }
      />

      {/* Phase 8: Responsive Col spans */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}><Card className="rounded-xl"><Statistic title="Total Spend" value={totalSpend} prefix="$" /></Card></Col>
        <Col xs={24} sm={12} md={8}><Card className="rounded-xl"><Statistic title="Total Installs" value={totalInstalls} /></Card></Col>
        <Col xs={24} sm={12} md={8}><Card className="rounded-xl"><Statistic title="Avg CPI" value={(totalSpend / totalInstalls).toFixed(2)} prefix="$" /></Card></Col>
      </Row>

      <Card 
        className="rounded-xl" 
        title={
          <div className="flex justify-between items-center w-full mt-1 mb-1">
            <span>Spend & Installs Analysis</span>
            <Segmented
              options={[
                { label: 'Daily Trend', value: 'daily' },
                { label: 'Campaign', value: 'campaign' },
                { label: 'Creative', value: 'creative' },
                { label: 'Country', value: 'country' },
                { label: 'Source App', value: 'source_app' }
              ]}
              value={chartTab}
              onChange={(value) => setChartTab(value as string)}
              className="text-xs font-medium"
            />
          </div>
        }
      >
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'none' }} />
              <Legend />
              <Bar dataKey="spend" fill="var(--chart-4)" radius={[4, 4, 0, 0]} name="Spend ($)" />
              <Bar dataKey="installs" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Installs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="rounded-xl" title="Breakdown by Country" styles={{ body: { padding: 0 } }}>
        <Table className="nms-table" columns={columns} dataSource={reportData} rowKey="country" pagination={false} />
      </Card>
    </div>
  );
};

export default AxonReports;
