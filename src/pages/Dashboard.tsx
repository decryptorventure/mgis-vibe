import React, { useState, useMemo, useCallback } from 'react';
import { Card, Row, Col, Skeleton } from 'antd';
import { ChartContainer, PageHeader } from '../components/ui';
import { FunnelKpiStrip } from '@/components/analytics/funnel-kpi-strip';
import { NetworkComparisonCards } from '@/components/analytics/network-comparison-cards';
import { BudgetPacingBar } from '@/components/analytics/budget-pacing-bar';
import { mockCampaigns, mockRankData, mockActivityLogs } from '@/shared/mock-data';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, TrendingUp, DollarSign } from 'lucide-react';
import { useMockQuery } from '@/shared/hooks/useMockQuery';

// Sub-components
import { DashboardFilters } from './dashboard/DashboardFilters';
import { DashboardMetrics } from './dashboard/DashboardMetrics';
import { DashboardLeaderboard } from './dashboard/DashboardLeaderboard';
import { DashboardLogs } from './dashboard/DashboardLogs';

export const Dashboard: React.FC = () => {
  // Phase 4: Better loading state with custom hook
  const { isLoading } = useMockQuery(true, 600);

  // Filter States
  const [platform, setPlatform] = useState('all');
  const [action, setAction] = useState('all');
  const [status, setStatus] = useState('all');
  const [user, setUser] = useState('all');
  
  // Smart filters state
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(null);

  // Search filter for recent activity log
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Table and metric states
  const [filteredRankData, setFilteredRankData] = useState(mockRankData);
  const [metrics, setMetrics] = useState({
    uniqueCampaigns: 384,
    successRate: 100,
    created: 4233,
    updated: 2170,
    paused: 433,
    deleted: 298,
    totalUsers: 7,
    avgActions: 1019.6,
    mostActive: 'duynv',
    mostActiveCount: 6450,
    highestSuccess: 'duymv'
  });

  const filteredLogs = useMemo(() => mockActivityLogs.filter(log => {
    const matchesSearch = log.campaign.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                          log.accountId.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesPlatform = platform === 'all' || log.platform.toLowerCase() === platform.toLowerCase();
    const activeUser = selectedUserFilter || user;
    const matchesUser = activeUser === 'all' || log.user.toLowerCase() === activeUser.toLowerCase();
    const matchesAction = action === 'all' || log.action.toLowerCase() === action.toLowerCase();
    
    return matchesSearch && matchesPlatform && matchesUser && matchesAction;
  }), [logSearchQuery, platform, selectedUserFilter, user, action]);

  const handleApply = useCallback((userOverride?: string | null) => {
    let rawData = [...mockRankData];
    const activeUser = userOverride !== undefined ? userOverride : (selectedUserFilter || user);

    if (activeUser && activeUser !== 'all') {
      rawData = rawData.filter(d => d.name.toLowerCase().includes(activeUser.toLowerCase()));
    }

    let multiplier = 1.0;
    if (platform === 'meta') multiplier = 0.54;
    else if (platform === 'axon') multiplier = 0.45;
    else if (platform === 'google') multiplier = 0.01;
    else if (platform !== 'all') multiplier = 0.2;

    if (action === 'create') multiplier *= 0.6;
    if (action === 'update') multiplier *= 0.3;
    if (action === 'pause') multiplier *= 0.08;
    if (action === 'delete') multiplier *= 0.05;

    if (activeUser && activeUser !== 'all') {
      const selected = mockRankData.find(d => d.name.toLowerCase() === activeUser.toLowerCase());
      if (selected) {
        multiplier *= (selected.total / 6450);
      } else {
        multiplier *= 0.1;
      }
    }

    let updatedTable = rawData.map((d, index) => {
      const create = Math.round(d.create * multiplier);
      const update = Math.round(d.update * multiplier);
      const pause = Math.round(d.pause * multiplier);
      const del = Math.round(d.delete * multiplier);
      const total = create + update + pause + del;
      return {
        ...d,
        rank: activeUser === 'all' ? index + 1 : 1,
        total,
        create,
        update,
        pause,
        delete: del,
      };
    });

    if (activeUser === 'all') {
       updatedTable.sort((a, b) => b.total - a.total);
       updatedTable.forEach((row, i) => row.rank = i + 1);
    }

    const baseUnique = 384;

    setMetrics({
      uniqueCampaigns: Math.max(1, Math.round(baseUnique * multiplier)),
      successRate: status === 'error' ? 0 : 100,
      created: updatedTable.reduce((s, r) => s + r.create, 0),
      updated: updatedTable.reduce((s, r) => s + r.update, 0),
      paused: updatedTable.reduce((s, r) => s + r.pause, 0),
      deleted: updatedTable.reduce((s, r) => s + r.delete, 0),
      totalUsers: activeUser && activeUser !== 'all' ? 1 : 7,
      avgActions: activeUser && activeUser !== 'all' ? updatedTable[0]?.total || 0 : +(updatedTable.reduce((s, r) => s + r.total, 0) / 7).toFixed(1),
      mostActive: updatedTable.length > 0 ? updatedTable[0].name : 'N/A',
      mostActiveCount: updatedTable.length > 0 ? updatedTable[0].total : 0,
      highestSuccess: 'duymv'
    });
    setFilteredRankData(updatedTable);
  }, [platform, action, status, user, selectedUserFilter]);

  const handleUserRowClick = useCallback((userName: string) => {
    setSelectedUserFilter(userName);
    setUser(userName);
    handleApply(userName);
  }, [handleApply]);

  const handleReset = useCallback(() => {
    setPlatform('all');
    setAction('all');
    setStatus('all');
    setUser('all');
    setSelectedUserFilter(null);
    setLogSearchQuery('');
    setFilteredRankData(mockRankData);
    setMetrics({
      uniqueCampaigns: 384,
      successRate: 100,
      created: 4233,
      updated: 2170,
      paused: 433,
      deleted: 298,
      totalUsers: 7,
      avgActions: 1019.6,
      mostActive: 'duynv',
      mostActiveCount: 6450,
      highestSuccess: 'duymv'
    });
  }, []);

  const clearUserFilter = useCallback(() => {
    setSelectedUserFilter(null);
    setUser('all');
    handleApply('all');
  }, [handleApply]);

  const platformData = useMemo(() => [
    { name: 'Meta', value: 54, color: 'var(--chart-1)' },
    { name: 'Axon', value: 45, color: 'var(--chart-4)' },
    { name: 'Google Ads', value: 1, color: 'var(--chart-2)' },
  ], []);

  const activityTrendData = useMemo(() => [
    { date: '28/05', Create: 120, Update: 80, Pause: 10, Delete: 5 },
    { date: '29/05', Create: 150, Update: 95, Pause: 15, Delete: 8 },
    { date: '30/05', Create: 180, Update: 110, Pause: 20, Delete: 4 },
    { date: '31/05', Create: 220, Update: 140, Pause: 25, Delete: 6 },
    { date: '01/06', Create: 200, Update: 130, Pause: 18, Delete: 12 },
    { date: '02/06', Create: 240, Update: 160, Pause: 30, Delete: 9 },
    { date: '03/06', Create: 290, Update: 195, Pause: 35, Delete: 15 },
    { date: '04/06', Create: 310, Update: 210, Pause: 40, Delete: 18 },
  ], []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 2 }} /></Card>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 2 }} /></Card>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Col xs={12} sm={8} lg={4} key={i}>
              <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}><Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card></Col>
          <Col xs={24} lg={8}><Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card></Col>
        </Row>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 6 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        icon={<Activity size={20} />}
        title="Global Dashboard"
        subtitle="Theo dõi hoạt động chiến dịch trên tất cả nền tảng"
        actions={
          <div className="bg-[var(--status-success-bg)]/50 px-3 py-1.5 rounded-full border border-[var(--status-success-border)] text-[var(--status-success)] text-xs font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] animate-pulse"></span>
            System Stable
          </div>
        }
      />

      <DashboardFilters
        selectedUserFilter={selectedUserFilter}
        clearUserFilter={clearUserFilter}
        platform={platform}
        setPlatform={setPlatform}
        action={action}
        setAction={setAction}
        status={status}
        setStatus={setStatus}
        user={user}
        setUser={setUser}
        handleApply={() => handleApply(null)}
        handleReset={handleReset}
      />

      <DashboardMetrics metrics={metrics} />

      {/* ── Analytics Hub: Funnel KPI Strip ── */}
      <FunnelKpiStrip campaigns={mockCampaigns} />

      {/* ── Analytics Hub: Network Comparison + Budget Pacing ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            className="rounded-xl border-[var(--border-default)]"
            styles={{ body: { padding: '16px' } }}
            title={
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-[var(--color-primary-500)]" />
                <span className="font-semibold text-[var(--text-primary)] text-sm">Network Performance</span>
              </div>
            }
          >
            <NetworkComparisonCards campaigns={mockCampaigns} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="rounded-xl border-[var(--border-default)]"
            styles={{ body: { padding: '16px' } }}
            title={
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-[var(--color-primary-500)]" />
                <span className="font-semibold text-[var(--text-primary)] text-sm">Budget Pacing</span>
              </div>
            }
          >
            <BudgetPacingBar campaigns={mockCampaigns} />
          </Card>
        </Col>
      </Row>

      {/* Activity Trend & Platform Distribution Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ChartContainer
            title="Activity Trends"
            description="Create, update, pause, and delete activity by day"
            height={250}
          >
            <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis-text)', fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis-text)', fontSize: 10 }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '11px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="Create" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.05} strokeWidth={2} />
              <Area type="monotone" dataKey="Update" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.05} strokeWidth={2} />
              <Area type="monotone" dataKey="Pause" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.05} strokeWidth={2} />
              <Area type="monotone" dataKey="Delete" stroke="var(--status-error)" fill="var(--status-error)" fillOpacity={0.05} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </Col>
        <Col xs={24} lg={10}>
          <ChartContainer
            title="Platform Share"
            description="Share of activity by ad platform"
            height={250}
          >
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                itemStyle={{ fontSize: '11px', fontWeight: 'semibold' }}
              />
            </PieChart>
          </ChartContainer>
        </Col>
      </Row>

      <DashboardLeaderboard
        filteredRankData={filteredRankData}
        selectedUserFilter={selectedUserFilter}
        handleUserRowClick={handleUserRowClick}
      />

      <DashboardLogs
        filteredLogs={filteredLogs}
        logSearchQuery={logSearchQuery}
        setLogSearchQuery={setLogSearchQuery}
      />
    </div>
  );
};

export default Dashboard;
