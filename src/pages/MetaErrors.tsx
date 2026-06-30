import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, Tag, Progress, Select, DatePicker, Row, Col, Skeleton } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { AlertCircle, Filter, RotateCw, Search, TrendingUp, Bug } from 'lucide-react';
import { PageHeader } from '../components/ui';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface MetaErrorRecord {
  key: string;
  time: string; // YYYY-MM-DD HH:mm:ss
  displayTime: string;
  type: 'Logic' | 'Network';
  module: 'ADSET' | 'CAMPAIGN' | 'AD';
  operation: string;
  account: string;
  error: string;
}

const mockMetaErrors: MetaErrorRecord[] = [
  // Ngày 28/05/2026 - 8 lỗi Logic của ADSET: Create adset (khớp hoàn hảo screenshot)
  {
    key: 'm-err-1',
    time: '2026-05-28 10:46:55',
    displayTime: '28/05/2026 10:46:55',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },
  {
    key: 'm-err-2',
    time: '2026-05-28 10:46:53',
    displayTime: '28/05/2026 10:46:53',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },
  {
    key: 'm-err-3',
    time: '2026-05-28 10:45:12',
    displayTime: '28/05/2026 10:45:12',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },
  {
    key: 'm-err-4',
    time: '2026-05-28 10:43:08',
    displayTime: '28/05/2026 10:43:08',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },
  {
    key: 'm-err-5',
    time: '2026-05-28 10:41:22',
    displayTime: '28/05/2026 10:41:22',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },
  {
    key: 'm-err-6',
    time: '2026-05-28 10:39:45',
    displayTime: '28/05/2026 10:39:45',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },
  {
    key: 'm-err-7',
    time: '2026-05-28 10:38:12',
    displayTime: '28/05/2026 10:38:12',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },
  {
    key: 'm-err-8',
    time: '2026-05-28 10:35:50',
    displayTime: '28/05/2026 10:35:50',
    type: 'Logic',
    module: 'ADSET',
    operation: 'Create adset',
    account: 'act_13000354977...',
    error: '[OAuthException] code=100 | subcode=3955011 | message: Invalid parameter | user_title: Ad set campaign attribution type mismatch',
  },

  // Ngày 25/05/2026 - 3 lỗi Logic của CAMPAIGN: Update campaign
  {
    key: 'm-err-9',
    time: '2026-05-25 14:22:10',
    displayTime: '25/05/2026 14:22:10',
    type: 'Logic',
    module: 'CAMPAIGN',
    operation: 'Update campaign',
    account: 'act_987654321...',
    error: '[OAuthException] code=100 | subcode=1885760 | message: Invalid parameter | user_title: Optimization for ad delivery selection is unavailable',
  },
  {
    key: 'm-err-10',
    time: '2026-05-25 14:20:05',
    displayTime: '25/05/2026 14:20:05',
    type: 'Logic',
    module: 'CAMPAIGN',
    operation: 'Update campaign',
    account: 'act_987654321...',
    error: '[OAuthException] code=100 | subcode=1885760 | message: Invalid parameter | user_title: Optimization for ad delivery selection is unavailable',
  },
  {
    key: 'm-err-11',
    time: '2026-05-25 14:18:00',
    displayTime: '25/05/2026 14:18:00',
    type: 'Logic',
    module: 'CAMPAIGN',
    operation: 'Update campaign',
    account: 'act_987654321...',
    error: '[OAuthException] code=100 | subcode=1885760 | message: Invalid parameter | user_title: Optimization for ad delivery selection is unavailable',
  },

  // Ngày 26/05/2026 - 5 lỗi Network của AD: Create ad
  {
    key: 'm-err-12',
    time: '2026-05-26 09:12:30',
    displayTime: '26/05/2026 09:12:30',
    type: 'Network',
    module: 'AD',
    operation: 'Create ad',
    account: 'act_123456789...',
    error: 'Timeout connecting to Meta Graph API. Please retry.',
  },
  {
    key: 'm-err-13',
    time: '2026-05-26 09:11:45',
    displayTime: '26/05/2026 09:11:45',
    type: 'Network',
    module: 'AD',
    operation: 'Create ad',
    account: 'act_123456789...',
    error: 'Timeout connecting to Meta Graph API. Please retry.',
  },
  {
    key: 'm-err-14',
    time: '2026-05-26 09:10:10',
    displayTime: '26/05/2026 09:10:10',
    type: 'Network',
    module: 'AD',
    operation: 'Create ad',
    account: 'act_123456789...',
    error: 'Timeout connecting to Meta Graph API. Please retry.',
  },
  {
    key: 'm-err-15',
    time: '2026-05-26 09:08:22',
    displayTime: '26/05/2026 09:08:22',
    type: 'Network',
    module: 'AD',
    operation: 'Create ad',
    account: 'act_123456789...',
    error: 'Timeout connecting to Meta Graph API. Please retry.',
  },
  {
    key: 'm-err-16',
    time: '2026-05-26 09:05:00',
    displayTime: '26/05/2026 09:05:00',
    type: 'Network',
    module: 'AD',
    operation: 'Create ad',
    account: 'act_123456789...',
    error: 'Timeout connecting to Meta Graph API. Please retry.',
  },
];

export const MetaErrors: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Phase 4: Loading state with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Bộ lọc states
  const [errorType, setErrorType] = useState<string>('All');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [adAccount, setAdAccount] = useState<string>('All');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs('2026-05-28'),
    dayjs('2026-06-04')
  ]);
  const [groupBy, setGroupBy] = useState<string>('day');

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    errorType: 'All',
    moduleFilter: 'All',
    adAccount: 'All',
    dateRange: [dayjs('2026-05-28'), dayjs('2026-06-04')] as [dayjs.Dayjs, dayjs.Dayjs],
    groupBy: 'day'
  });

  // Phase 7: useCallback for handlers
  const handleApply = useCallback(() => {
    if (!dateRange) return;
    setAppliedFilters({
      errorType,
      moduleFilter,
      adAccount,
      dateRange,
      groupBy
    });
    toast.success('Đã áp dụng bộ lọc dữ liệu lỗi');
  }, [errorType, moduleFilter, adAccount, dateRange, groupBy]);

  const handleRefresh = useCallback(() => {
    const defaultRange: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs('2026-05-28'), dayjs('2026-06-04')];
    setErrorType('All');
    setModuleFilter('All');
    setAdAccount('All');
    setDateRange(defaultRange);
    setGroupBy('day');
    
    setAppliedFilters({
      errorType: 'All',
      moduleFilter: 'All',
      adAccount: 'All',
      dateRange: defaultRange,
      groupBy: 'day'
    });
    toast.success('Đã khôi phục bộ lọc mặc định');
  }, []);

  // Phase 7: Memoize filtered data
  const filteredData = useMemo(() => mockMetaErrors.filter(item => {
    if (appliedFilters.errorType !== 'All' && item.type !== appliedFilters.errorType) return false;
    if (appliedFilters.moduleFilter !== 'All' && item.module !== appliedFilters.moduleFilter) return false;
    if (appliedFilters.adAccount !== 'All' && item.account !== appliedFilters.adAccount) return false;
    
    const itemDate = dayjs(item.time, 'YYYY-MM-DD HH:mm:ss');
    const [start, end] = appliedFilters.dateRange;
    if (start && end) {
      if (itemDate.isBefore(start.startOf('day')) || itemDate.isAfter(end.endOf('day'))) return false;
    }
    return true;
  }), [appliedFilters]);

  // Phase 7: Memoize computed stats
  const totalErrors = useMemo(() => filteredData.length, [filteredData]);
  const logicErrors = useMemo(() => filteredData.filter(d => d.type === 'Logic').length, [filteredData]);

  // Chuẩn bị dữ liệu cho biểu đồ LỖI THEO THỜI GIAN
  const [startD, endD] = appliedFilters.dateRange;
  const dateList: string[] = [];
  if (startD && endD) {
    let curr = startD.clone();
    while (curr.isBefore(endD) || curr.isSame(endD, 'day')) {
      dateList.push(curr.format('DD/MM'));
      curr = curr.add(1, 'day');
    }
  }

  const errorsOverTimeData = dateList.map(dateStr => {
    const count = filteredData.filter(d => {
      return dayjs(d.time, 'YYYY-MM-DD HH:mm:ss').format('DD/MM') === dateStr;
    }).length;
    return { date: dateStr, count };
  });

  // Chuẩn bị dữ liệu cho TOP AD ACCOUNTS
  const accountCounts: Record<string, number> = {};
  filteredData.forEach(d => {
    const shortAcc = d.account.length > 13 
      ? `${d.account.substring(0, 6)}...${d.account.substring(d.account.length - 4)}`
      : d.account;
    accountCounts[shortAcc] = (accountCounts[shortAcc] || 0) + 1;
  });

  const topAdAccountsData = Object.entries(accountCounts)
    .map(([account, count]) => ({ account, count }))
    .sort((a, b) => b.count - a.count);

  // Chuẩn bị dữ liệu cho THEO MODULE
  const moduleCounts: Record<string, number> = { ADSET: 0, CAMPAIGN: 0, AD: 0 };
  filteredData.forEach(d => {
    if (moduleCounts[d.module] !== undefined) {
      moduleCounts[d.module]++;
    }
  });

  const moduleColors: Record<string, string> = {
    ADSET: 'var(--chart-1)',
    CAMPAIGN: 'var(--chart-3)',
    AD: 'var(--chart-2)',
  };

  const modulePieData = Object.entries(moduleCounts)
    .map(([name, value]) => ({
      name,
      value,
      color: moduleColors[name]
    }))
    .filter(d => d.value > 0);

  // Chuẩn bị dữ liệu cho TOP OPERATIONS
  const operationCounts: Record<string, number> = {};
  filteredData.forEach(d => {
    operationCounts[d.operation] = (operationCounts[d.operation] || 0) + 1;
  });

  const topOperationsData = Object.entries(operationCounts)
    .map(([operation, count]) => ({ operation, count }))
    .sort((a, b) => b.count - a.count);

  const maxOpCount = topOperationsData.length > 0 ? topOperationsData[0].count : 1;

  // Bảng Columns
  const columns = [
    { title: 'Time', dataIndex: 'displayTime', key: 'displayTime', width: 170 },
    {
      title: 'Error Type',
      dataIndex: 'type', 
      key: 'type', 
      width: 100,
      render: (type: 'Logic' | 'Network') => (
        <Tag color={type === 'Logic' ? 'blue' : 'red'} bordered={false} className="rounded-md px-2.5 py-0.5 text-xs font-bold">
          {type}
        </Tag>
      )
    },
    { 
      title: 'Module', 
      dataIndex: 'module', 
      key: 'module', 
      width: 110,
      render: (module: 'ADSET' | 'CAMPAIGN' | 'AD') => {
        let color = 'blue';
        if (module === 'CAMPAIGN') color = 'orange';
        if (module === 'AD') color = 'green';
        return <Tag color={color} bordered={false} className="rounded-md font-bold text-xs">{module}</Tag>;
      }
    },
    { title: 'Operation', dataIndex: 'operation', key: 'operation', width: 140, render: (op: string) => <span className="font-semibold text-[var(--text-secondary)]">{op}</span> },
    { title: 'Ad Account', dataIndex: 'account', key: 'account', width: 160, className: 'text-[var(--text-secondary)] font-mono text-xs' },
    { 
      title: 'Error Message',
      dataIndex: 'error',
      key: 'error',
      render: (error: string) => (
        <div className="max-w-2xl text-[var(--status-error)] bg-[var(--status-error-bg)] p-2 rounded-lg text-xs break-words border border-[var(--status-error-border)] leading-relaxed">
          <AlertCircle size={13} className="inline mr-1.5 mb-0.5" />
          {error}
        </div>
      )
    },
  ];

  // Phase 4: Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 3 }} /></Card>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} md={6} key={i}>
              <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}><Card className="rounded-xl"><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
          <Col xs={24} lg={12}><Card className="rounded-xl"><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
        </Row>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<AlertCircle size={20} />}
        iconBg="var(--color-primary-500)"
        title="Meta Error Tracking"
        subtitle="Theo dõi và phân tích lỗi từ Meta API"
      />

      {/* Filter Card */}
      <Card 
        className="rounded-xl border-[var(--border-default)]"
        title={
          <div className="flex items-center gap-2 text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider select-none">
            <Filter size={14} className="text-[var(--text-tertiary)]" />
            Filters
          </div>
        }
        styles={{ body: { padding: '16px' } }}
      >
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={4}>
            <div className="text-xs text-[var(--text-secondary)] font-semibold mb-1.5">Error Type</div>
            <Select
              className="w-full rounded-lg"
              value={errorType}
              onChange={setErrorType}
              options={[
                { value: 'All', label: 'All' },
                { value: 'Logic', label: 'Logic' },
                { value: 'Network', label: 'Network' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="text-xs text-[var(--text-secondary)] font-semibold mb-1.5">Module</div>
            <Select 
              className="w-full rounded-lg"
              value={moduleFilter}
              onChange={setModuleFilter}
              options={[
                { value: 'All', label: 'All' },
                { value: 'CAMPAIGN', label: 'CAMPAIGN' },
                { value: 'ADSET', label: 'ADSET' },
                { value: 'AD', label: 'AD' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="text-xs text-[var(--text-secondary)] font-semibold mb-1.5">Ad Account</div>
            <Select 
              className="w-full rounded-lg"
              value={adAccount}
              onChange={setAdAccount}
              options={[
                { value: 'All', label: 'All' },
                { value: 'act_13000354977...', label: 'act_13000354977...' },
                { value: 'act_987654321...', label: 'act_987654321...' },
                { value: 'act_123456789...', label: 'act_123456789...' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-xs text-[var(--text-secondary)] font-semibold mb-1.5">Date Range</div>
            <DatePicker.RangePicker 
              className="w-full rounded-lg"
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={(val) => setDateRange(val as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              allowClear={false}
            />
          </Col>
          <Col xs={24} sm={12} md={3}>
            <div className="text-xs text-[var(--text-secondary)] font-semibold mb-1.5">Group By</div>
            <Select
              className="w-full rounded-lg"
              value={groupBy}
              onChange={setGroupBy}
              options={[
                { value: 'day', label: 'By day' },
                { value: 'hour', label: 'By hour' },
              ]}
            />
          </Col>
          <Col xs={24} md={3} className="flex gap-2">
            <Button 
              type="button"
              variant="primary"
              size="m"
              onClick={handleApply}
              className="flex-1 font-bold gap-1.5"
            >
              <Search size={14} />
              Apply
            </Button>
            <Button
              type="button"
              variant="border"
              size="icon-m"
              aria-label="Refresh data"
              onClick={handleRefresh}
            >
              <RotateCw size={14} />
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className="bg-[var(--color-primary-500)] border-0 rounded-2xl text-[var(--text-inverse)]"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-inverse)] opacity-90 select-none">TOTAL ERRORS</span>
              <div className="w-7 h-7 bg-[var(--surface-base)]/10 rounded-lg flex items-center justify-center text-[var(--text-inverse)]">
                <TrendingUp size={15} />
              </div>
            </div>
            <div className="text-3xl font-extrabold mt-3 tracking-tight">{totalErrors}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className="bg-[var(--status-info-bg)]/60 border border-[var(--status-info-border)] rounded-2xl"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--status-info)] select-none">LOGIC</span>
              <div className="w-7 h-7 bg-[var(--status-info-bg)] rounded-lg flex items-center justify-center text-[var(--status-info)]">
                <Bug size={15} />
              </div>
            </div>
            <div className="text-3xl font-extrabold mt-3 tracking-tight text-[var(--text-primary)]">{logicErrors}</div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="rounded-xl border-[var(--border-default)]" 
          title={<span className="font-semibold text-[var(--text-primary)] text-sm">ERRORS OVER TIME</span>}
        >
          <div className="h-[250px] mt-2 flex items-center justify-center">
            {errorsOverTimeData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={errorsOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'var(--chart-axis-text)', fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'var(--chart-axis-text)', fontSize: 10, fontWeight: 500 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-float)' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '11px' }}
                    itemStyle={{ color: 'var(--color-primary-500)', fontSize: '11px', fontWeight: 'semibold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--color-primary-500)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCount)"
                    dot={{ r: 4, strokeWidth: 1, fill: 'var(--color-primary-500)', stroke: 'var(--surface-base)' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-primary-500)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[var(--text-tertiary)] font-semibold select-none">Không có dữ liệu lỗi theo thời gian</div>
            )}
          </div>
        </Card>

        <Card 
          className="rounded-xl border-[var(--border-default)]" 
          title={<span className="font-semibold text-[var(--text-primary)] text-sm">TOP AD ACCOUNTS</span>}
        >
          <div className="h-[250px] mt-2 flex items-center justify-center">
            {topAdAccountsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topAdAccountsData} 
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                  <XAxis 
                    type="number"
                    allowDecimals={false}
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'var(--chart-axis-text)', fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis 
                    dataKey="account" 
                    type="category"
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'var(--chart-axis-text)', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}
                    width={100}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                    itemStyle={{ color: 'var(--color-primary-500)', fontSize: '11px' }}
                    labelStyle={{ fontSize: '10px', color: 'var(--chart-axis-text)', fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="var(--color-primary-500)" 
                    barSize={16}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[var(--text-tertiary)] font-semibold select-none">Không có dữ liệu tài khoản quảng cáo lỗi</div>
            )}
          </div>
        </Card>
      </div>

      {/* Charts Section 2 */}
      <Card 
        className="rounded-xl border-[var(--border-default)]"
        title={<span className="font-semibold text-[var(--text-primary)] text-sm">DISTRIBUTION BY MODULE & OPERATION</span>}
      >
        <Row gutter={[32, 16]}>
          <Col xs={24} md={12}>
            <div className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-4 text-center md:text-left select-none">BY MODULE</div>
            <div className="h-[200px] flex items-center justify-center">
              {modulePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modulePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {modulePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'semibold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-[var(--text-tertiary)] font-semibold select-none">Không có dữ liệu phân bố theo module</div>
              )}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-4 select-none">TOP OPERATIONS</div>
            <div className="h-[200px] flex flex-col justify-center px-2 space-y-4 overflow-y-auto">
              {topOperationsData.length > 0 ? (
                topOperationsData.map((op, idx) => {
                  const percent = Math.round((op.count / maxOpCount) * 100);
                  return (
                    <div key={op.operation}>
                      <div className="flex justify-between mb-1 text-xs font-semibold text-[var(--text-secondary)]">
                        <span className="font-mono">{op.operation}</span>
                        <span className="text-[var(--text-primary)] font-bold">{op.count}</span>
                      </div>
                      <Progress 
                        percent={percent} 
                        showInfo={false} 
                        strokeColor={idx === 0 ? "var(--color-primary-500)" : idx === 1 ? "var(--chart-3)" : "var(--chart-1)"}
                        strokeWidth={8}
                        className="m-0"
                      />
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-[var(--text-tertiary)] font-semibold select-none">Không có dữ liệu operations</div>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Details Table */}
      <Card 
        className="rounded-xl border-[var(--border-default)] overflow-hidden" 
        title={<span className="font-semibold text-[var(--text-primary)] text-sm">ERROR DETAILS</span>}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          className="nms-table"
          columns={columns}
          dataSource={filteredData} 
          pagination={{ pageSize: 5, showSizeChanger: true }} 
          rowClassName="hover:bg-[var(--surface-muted)]/50 transition-colors"
        />
      </Card>
    </div>
  );
};

export default MetaErrors;
