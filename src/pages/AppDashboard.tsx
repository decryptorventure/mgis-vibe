import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Table, Progress, Alert, Skeleton, Tag, Select, Button, Tooltip } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, DollarSign, TrendingUp, Users, ArrowUpRight, Network, Globe, Minus, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { mockCampaigns, mockProjects } from '@/shared/mock-data';
import { NETWORK_LOGOS } from '@/shared/network-config';

const NETWORK_COLORS: Record<string, string> = {
  'google-ads': '#4285F4',
  'meta': '#1877F2',
  'asa': '#6b7280',
  'axon': '#FF6B35',
  'moloco': '#7C3AED',
};

const NETWORK_LABELS: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta': 'Meta',
  'asa': 'Apple Search Ads',
  'axon': 'Axon / AppLovin',
  'moloco': 'Moloco',
};

const STOREFRONTS_DATA: Record<string, {
  name: string;
  flag: string;
  spend: string;
  spendPercent: string;
  spendRaw: number;
  avgSov: number;
  paidKeywords: number;
  paidKeywordsPercent: string;
  competitors: { name: string; bg: string; letter: string }[];
  spendDescription: string;
  keywordsDescription: string;
}> = {
  US: {
    name: 'United States',
    flag: '🇺🇸',
    spend: '$24K',
    spendPercent: '34%',
    spendRaw: 24000,
    avgSov: 35,
    paidKeywords: 12436,
    paidKeywordsPercent: '11.5%',
    competitors: [
      { name: 'FitTrack', bg: '#10B981', letter: 'F' },
      { name: 'Strava', bg: '#EF4444', letter: 'S' },
      { name: 'Nike Run', bg: '#000000', letter: 'N' },
      { name: 'Peloton', bg: '#E11D48', letter: 'P' },
      { name: 'MyFitnessPal', bg: '#3B82F6', letter: 'M' }
    ],
    spendDescription: '34.4% from total: $280K - 300K',
    keywordsDescription: '11.5% from total: 246,490',
  },
  GB: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    spend: '$18K',
    spendPercent: '28%',
    spendRaw: 18000,
    avgSov: 30,
    paidKeywords: 9842,
    paidKeywordsPercent: '9.2%',
    competitors: [
      { name: 'Sweatcoin', bg: '#8B5CF6', letter: 'W' },
      { name: 'Zwift', bg: '#F59E0B', letter: 'Z' },
      { name: 'Adidas Running', bg: '#111827', letter: 'A' },
      { name: 'Strava', bg: '#EF4444', letter: 'S' }
    ],
    spendDescription: '28.0% from total: $280K - 300K',
    keywordsDescription: '9.2% from total: 246,490',
  },
  DE: {
    name: 'Germany',
    flag: '🇩🇪',
    spend: '$9K',
    spendPercent: '18%',
    spendRaw: 9000,
    avgSov: 22,
    paidKeywords: 6240,
    paidKeywordsPercent: '5.8%',
    competitors: [
      { name: 'Komoot', bg: '#059669', letter: 'K' },
      { name: 'Freeletics', bg: '#1F2937', letter: 'L' },
      { name: 'Runtastic', bg: '#D97706', letter: 'R' }
    ],
    spendDescription: '18.2% from total: $280K - 300K',
    keywordsDescription: '5.8% from total: 246,490',
  },
  FR: {
    name: 'France',
    flag: '🇫🇷',
    spend: '$3K',
    spendPercent: '9%',
    spendRaw: 3000,
    avgSov: 12,
    paidKeywords: 3110,
    paidKeywordsPercent: '2.9%',
    competitors: [
      { name: 'Decathlon Coach', bg: '#2563EB', letter: 'D' },
      { name: 'Yuka', bg: '#10B981', letter: 'Y' },
      { name: 'FizzUp', bg: '#EC4899', letter: 'Z' }
    ],
    spendDescription: '9.1% from total: $280K - 300K',
    keywordsDescription: '2.9% from total: 246,490',
  },
  HR: {
    name: 'Croatia',
    flag: '🇭🇷',
    spend: '$2K',
    spendPercent: '7%',
    spendRaw: 2000,
    avgSov: 8,
    paidKeywords: 1840,
    paidKeywordsPercent: '1.7%',
    competitors: [
      { name: 'Sport Tracker', bg: '#EF4444', letter: 'T' },
      { name: 'Runkeeper', bg: '#06B6D4', letter: 'R' }
    ],
    spendDescription: '7.1% from total: $280K - 300K',
    keywordsDescription: '1.7% from total: 246,490',
  },
  FI: {
    name: 'Finland',
    flag: '🇫🇮',
    spend: '$1.8K',
    spendPercent: '6%',
    spendRaw: 1800,
    avgSov: 6,
    paidKeywords: 1210,
    paidKeywordsPercent: '1.1%',
    competitors: [
      { name: 'Polar Flow', bg: '#DC2626', letter: 'O' },
      { name: 'Suunto', bg: '#000000', letter: 'U' }
    ],
    spendDescription: '6.4% from total: $280K - 300K',
    keywordsDescription: '1.1% from total: 246,490',
  },
};

export const AppDashboard: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [zoomScale, setZoomScale] = useState(1.0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [appId]);

  // Lookup active project
  const project = useMemo(() => mockProjects.find((p) => p.id === appId), [appId]);

  // Scoped campaigns
  const appCampaigns = useMemo(() => mockCampaigns.filter((c) => c.projectId === appId), [appId]);

  // Scoped stats
  const stats = useMemo(() => {
    const totalSpend = appCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalInstalls = appCampaigns.reduce((sum, c) => sum + c.installs, 0);
    const avgCpa = totalInstalls > 0 ? totalSpend / totalInstalls : 0;
    const avgRoas =
      appCampaigns.length > 0
        ? appCampaigns.reduce((sum, c) => sum + c.roas, 0) / appCampaigns.length
        : 0;

    return { totalSpend, totalInstalls, avgCpa, avgRoas };
  }, [appCampaigns]);

  // Group by Network for Chart
  const networkData = useMemo(() => {
    const groups: Record<string, number> = {};
    appCampaigns.forEach((c) => {
      groups[c.network] = (groups[c.network] || 0) + c.spend;
    });

    return Object.entries(groups).map(([name, spend]) => ({
      name: NETWORK_LABELS[name] || name,
      key: name,
      value: spend,
      color: NETWORK_COLORS[name] || '#ccc',
    }));
  }, [appCampaigns]);

  // Simulated Trend Data specific to App
  const trendData = useMemo(() => {
    const factor = project ? project.spend / 20000 : 1;
    return [
      { date: '28/05', Cost: Math.round(800 * factor), Installs: Math.round(1100 * factor) },
      { date: '29/05', Cost: Math.round(1200 * factor), Installs: Math.round(1500 * factor) },
      { date: '30/05', Cost: Math.round(1400 * factor), Installs: Math.round(1900 * factor) },
      { date: '31/05', Cost: Math.round(1100 * factor), Installs: Math.round(1600 * factor) },
      { date: '01/06', Cost: Math.round(1500 * factor), Installs: Math.round(2100 * factor) },
      { date: '02/06', Cost: Math.round(1800 * factor), Installs: Math.round(2600 * factor) },
      { date: '03/06', Cost: Math.round(2100 * factor), Installs: Math.round(3100 * factor) },
      { date: '04/06', Cost: Math.round(2300 * factor), Installs: Math.round(3400 * factor) },
    ];
  }, [project]);

  if (!project) {
    return (
      <Alert
        message="Project Not Found"
        description="Không thể tìm thấy thông tin ứng dụng được yêu cầu."
        type="error"
        showIcon
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-xl"><Skeleton active paragraph={{ rows: 1 }} /></Card>
          ))}
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}><Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card></Col>
          <Col xs={24} lg={8}><Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card></Col>
        </Row>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 6 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={
          <span className="font-bold text-sm" style={{ color: 'var(--text-inverse)' }}>
            {project.icon}
          </span>
        }
        iconBg="var(--color-primary-500)"
        title={`Dashboard: ${project.name}`}
        subtitle={`Báo cáo chung hiệu suất quảng cáo cho ${project.package}`}
        actions={
          <div className="bg-[var(--surface-muted)] px-3 py-1.5 rounded-full border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  project.status === 'Running' ? 'var(--status-success)' : 'var(--status-warning)',
              }}
            />
            Status: {project.status}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="App Spend"
          value={`$${stats.totalSpend.toLocaleString()}`}
          icon={<DollarSign size={14} />}
          variant="primary"
        />
        <StatCard
          title="App Installs"
          value={stats.totalInstalls.toLocaleString()}
          icon={<Users size={14} />}
          variant="info"
        />
        <StatCard
          title="Average CPA"
          value={`$${stats.avgCpa.toFixed(2)}`}
          icon={<Activity size={14} />}
          variant="warning"
        />
        <StatCard
          title="Average ROAS"
          value={`${stats.avgRoas.toFixed(2)}x`}
          icon={<TrendingUp size={14} />}
          variant="success"
        />
      </div>

      {/* Performance trend and platform shares */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            className="rounded-xl border-[var(--border-default)]"
            title={
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-primary-500" />
                <span className="font-semibold text-sm text-[var(--text-primary)]">
                  Performance Cost & Conversion Trends
                </span>
              </div>
            }
          >
            <div className="h-[260px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis-text)', fontSize: 10 }} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis-text)', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis-text)', fontSize: 10 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--text-primary)' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="Cost" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.06} strokeWidth={2} />
                  <Area yAxisId="right" type="monotone" dataKey="Installs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.06} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            className="rounded-xl border-[var(--border-default)]"
            title={
              <div className="flex items-center gap-2">
                <Network size={15} className="text-primary-500" />
                <span className="font-semibold text-sm text-[var(--text-primary)]">
                  Network Share (Spend)
                </span>
              </div>
            }
          >
            {networkData.length > 0 ? (
              <div className="h-[260px] flex flex-col justify-between">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={networkData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {networkData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)' }}
                        itemStyle={{ fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs font-semibold px-2 pb-2">
                  {networkData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.name}</span>
                      </div>
                      <span className="text-[var(--text-primary)]">
                        ${entry.value.toLocaleString()} ({Math.round((entry.value / stats.totalSpend) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-xs text-[var(--text-disabled)] italic">
                Chưa có dữ liệu phân phối mạng quảng cáo
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Connected Networks shortcuts */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          Mạng quảng cáo đã kết nối ({project.networks.length})
        </div>
        <Row gutter={[12, 12]}>
          {project.networks.map((netKey) => {
            const label = NETWORK_LABELS[netKey] || netKey;
            const networkSpend = appCampaigns.filter((c) => c.network === netKey).reduce((s, c) => s + c.spend, 0);

            return (
              <Col xs={24} sm={8} key={netKey}>
                <Card
                  hoverable
                  onClick={() => navigate(`/apps/${project.id}/networks/${netKey}`)}
                  className="rounded-xl border border-[var(--border-default)] hover:border-primary-500 transition-colors bg-[var(--surface-base)] relative overflow-hidden"
                  styles={{ body: { padding: '14px 16px' } }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-[var(--border-subtle)] bg-white p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <img
                          src={NETWORK_LOGOS[netKey]}
                          alt={netKey}
                          className="w-full h-full object-contain rounded-full"
                        />
                      </span>
                      <span className="font-bold text-xs text-[var(--text-primary)]">{label}</span>
                    </div>
                    <ArrowUpRight size={13} className="text-[var(--text-tertiary)]" />
                  </div>
                  <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">
                    Chi tiêu trên app này: <strong className="text-[var(--text-primary)] font-semibold">${networkSpend.toLocaleString()}</strong>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Country Storefront Intelligence Report Section */}
      <Card
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] relative overflow-hidden"
        title={
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                Market Intelligence / App Intelligence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCountry}
                onChange={(v) => setSelectedCountry(v)}
                className="w-40 rounded-lg text-xs"
                size="small"
                options={Object.entries(STOREFRONTS_DATA).map(([key, val]) => ({
                  value: key,
                  label: `${val.flag} ${val.name}`,
                }))}
              />
            </div>
          </div>
        }
      >
        {/* App Metadata Card inside Storefront Report */}
        <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--surface-subtle)]/40 mb-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-sm bg-[var(--surface-base)] border border-[var(--border-default)] text-[var(--color-primary-500)]">
              {project.icon}
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--text-primary)]">
                {project.name}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 flex-wrap">
                <span>Developer of The App</span>
                <span className="text-[var(--text-tertiary)]">|</span>
                <span>5 in Sport category</span>
                <span className="text-[var(--text-tertiary)]">|</span>
                <span>⭐ 4.5</span>
                <span className="text-[var(--text-tertiary)]">|</span>
                <span>💵 $3.99/week</span>
              </div>
            </div>
          </div>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Open in App Store</span>
            <ArrowUpRight size={13} />
          </a>
        </div>

        {/* Selected Country KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <Card
            className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm"
            styles={{ body: { padding: '16px' } }}
          >
            <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Est. Spend in {STOREFRONTS_DATA[selectedCountry].flag} {selectedCountry}
            </div>
            <div className="font-bold text-lg text-[var(--text-primary)] mt-1.5">
              {STOREFRONTS_DATA[selectedCountry].spend}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
              {STOREFRONTS_DATA[selectedCountry].spendDescription}
            </div>
          </Card>

          <Card
            className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm"
            styles={{ body: { padding: '16px' } }}
          >
            <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Est. Avg. Share of Voice in {selectedCountry}
            </div>
            <div className="font-bold text-lg text-[var(--text-primary)] mt-1.5">
              {STOREFRONTS_DATA[selectedCountry].avgSov}%
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
              <Progress percent={STOREFRONTS_DATA[selectedCountry].avgSov} showInfo={false} size="small" strokeColor="var(--color-primary-500)" className="mb-0 mt-0.5" />
            </div>
          </Card>

          <Card
            className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm"
            styles={{ body: { padding: '16px' } }}
          >
            <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Paid Keywords in {selectedCountry}
            </div>
            <div className="font-bold text-lg text-[var(--text-primary)] mt-1.5">
              {STOREFRONTS_DATA[selectedCountry].paidKeywords.toLocaleString()}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
              {STOREFRONTS_DATA[selectedCountry].keywordsDescription}
            </div>
          </Card>

          <Card
            className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm"
            styles={{ body: { padding: '16px' } }}
          >
            <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Top ASA competitors in {selectedCountry}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              {STOREFRONTS_DATA[selectedCountry].competitors.map((comp, idx) => (
                <Tooltip key={idx} title={comp.name}>
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 cursor-help"
                    style={{ background: comp.bg }}
                  >
                    {comp.letter}
                  </span>
                </Tooltip>
              ))}
            </div>
          </Card>
        </div>

        {/* Storefront List & Interactive World Map Grid */}
        <Row gutter={[16, 16]}>
          {/* Left panel list */}
          <Col xs={24} md={8}>
            <div className="border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] p-3 h-[300px] flex flex-col">
              <div className="text-xs font-bold text-[var(--text-primary)] mb-2.5">
                Storefronts by Est. Spend
              </div>
              <div className="flex-1 overflow-auto space-y-1 pr-1">
                {/* Total row */}
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)]">
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} className="text-primary-500" />
                    <span>Total 19</span>
                  </span>
                  <span>$280K / 100%</span>
                </div>

                {/* Country list */}
                {Object.entries(STOREFRONTS_DATA).map(([key, data]) => {
                  const isActive = selectedCountry === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedCountry(key)}
                      className={`flex items-center justify-between text-xs p-2 rounded-lg cursor-pointer border transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 border-primary-300 dark:bg-primary-950/20 dark:border-primary-800 font-bold text-primary-600 dark:text-primary-400'
                          : 'bg-[var(--surface-base)] border-[var(--border-subtle)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{data.flag}</span>
                        <span>{data.name}</span>
                      </span>
                      <span>{data.spend} / {data.spendPercent}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>

          {/* Right panel World Map */}
          <Col xs={24} md={16}>
            <div className="border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative overflow-hidden h-[300px] flex items-center justify-center">
              <svg
                viewBox="0 0 800 450"
                className="w-full h-full p-2 select-none"
              >
                <g style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}>
                  {/* Rest of the world (Greenland, Canada, South America, Africa, etc.) */}
                  <path d="M 230 45 L 270 40 L 285 75 L 250 85 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
                  <path d="M 60 100 L 90 90 L 120 70 L 160 50 L 220 50 L 250 80 L 260 100 L 240 120 L 200 130 L 160 120 L 110 130 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
                  <path d="M 190 205 L 245 200 L 260 220 L 290 280 L 300 340 L 265 420 L 240 440 L 225 390 L 195 280 L 175 220 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
                  <path d="M 370 200 L 440 190 L 490 230 L 515 280 L 475 370 L 440 380 L 420 310 L 365 260 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
                  <path d="M 390 110 L 470 100 L 500 140 L 490 195 L 435 185 L 390 195 L 380 160 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
                  <path d="M 495 100 L 730 90 L 760 210 L 700 270 L 620 280 L 560 280 L 515 235 L 480 200 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
                  <path d="M 680 330 L 755 325 L 780 380 L 720 410 L 685 380 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />

                  {/* Active highlighted storefront countries */}
                  {/* United States */}
                  <path
                    d="M 80 135 L 110 130 L 160 120 L 200 130 L 235 130 L 242 165 L 210 190 L 160 190 L 140 195 L 90 190 Z"
                    fill={selectedCountry === 'US' ? 'var(--color-primary-500)' : '#0284c7'}
                    stroke={selectedCountry === 'US' ? 'var(--color-primary-600)' : 'var(--border-default)'}
                    strokeWidth={selectedCountry === 'US' ? '2' : '1'}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                    onClick={() => setSelectedCountry('US')}
                  />
                  {/* United Kingdom */}
                  <path
                    d="M 365 125 L 372 120 L 375 130 L 368 135 Z"
                    fill={selectedCountry === 'GB' ? 'var(--color-primary-500)' : '#0ea5e9'}
                    stroke={selectedCountry === 'GB' ? 'var(--color-primary-600)' : 'var(--border-default)'}
                    strokeWidth={selectedCountry === 'GB' ? '2' : '1'}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                    onClick={() => setSelectedCountry('GB')}
                  />
                  {/* France */}
                  <path
                    d="M 392 148 L 406 145 L 408 160 L 394 162 Z"
                    fill={selectedCountry === 'FR' ? 'var(--color-primary-500)' : '#7dd3fc'}
                    stroke={selectedCountry === 'FR' ? 'var(--color-primary-600)' : 'var(--border-default)'}
                    strokeWidth={selectedCountry === 'FR' ? '2' : '1'}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                    onClick={() => setSelectedCountry('FR')}
                  />
                  {/* Germany */}
                  <path
                    d="M 408 138 L 420 136 L 422 148 L 410 150 Z"
                    fill={selectedCountry === 'DE' ? 'var(--color-primary-500)' : '#38bdf8'}
                    stroke={selectedCountry === 'DE' ? 'var(--color-primary-600)' : 'var(--border-default)'}
                    strokeWidth={selectedCountry === 'DE' ? '2' : '1'}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                    onClick={() => setSelectedCountry('DE')}
                  />
                  {/* Croatia */}
                  <path
                    d="M 418 162 L 426 160 L 424 168 L 416 170 Z"
                    fill={selectedCountry === 'HR' ? 'var(--color-primary-500)' : '#bae6fd'}
                    stroke={selectedCountry === 'HR' ? 'var(--color-primary-600)' : 'var(--border-default)'}
                    strokeWidth={selectedCountry === 'HR' ? '2' : '1'}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                    onClick={() => setSelectedCountry('HR')}
                  />
                  {/* Finland */}
                  <path
                    d="M 435 95 L 448 92 L 444 114 L 433 118 Z"
                    fill={selectedCountry === 'FI' ? 'var(--color-primary-500)' : '#e0f2fe'}
                    stroke={selectedCountry === 'FI' ? 'var(--color-primary-600)' : 'var(--border-default)'}
                    strokeWidth={selectedCountry === 'FI' ? '2' : '1'}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                    onClick={() => setSelectedCountry('FI')}
                  />
                </g>
              </svg>

              {/* Map Zoom Controls */}
              <div className="absolute bottom-3 left-3 flex flex-col gap-1 shadow-sm">
                <Button
                  size="small"
                  icon={<Plus size={12} />}
                  onClick={() => setZoomScale(s => Math.min(2.0, s + 0.15))}
                  className="w-7 h-7 flex items-center justify-center rounded-md font-bold bg-[var(--surface-base)] border-[var(--border-default)]"
                />
                <Button
                  size="small"
                  icon={<Minus size={12} />}
                  onClick={() => setZoomScale(s => Math.max(0.7, s - 0.15))}
                  className="w-7 h-7 flex items-center justify-center rounded-md font-bold bg-[var(--surface-base)] border-[var(--border-default)]"
                />
              </div>

              {/* Map Legend Bar */}
              <div className="absolute bottom-3 right-3 bg-[var(--surface-base)]/80 backdrop-blur-sm border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg flex flex-col gap-1 text-[9px] font-semibold text-[var(--text-secondary)] shadow-sm">
                <div className="flex justify-between items-center w-28 text-[8px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">
                  <span>Spend</span>
                  <span>Intensity</span>
                </div>
                <div className="w-28 h-2 rounded bg-gradient-to-r from-[#e0f2fe] via-[#38bdf8] to-[#0284c7] border border-[var(--border-subtle)]" />
                <div className="flex justify-between w-28 text-[8px]">
                  <span>$1.8K</span>
                  <span>$9K</span>
                  <span>$24K</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Campaigns Scoped List */}
      <Card
        className="rounded-xl overflow-hidden border-[var(--border-default)] bg-[var(--surface-base)]"
        title={
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              Danh sách Chiến dịch ({appCampaigns.length})
            </span>
          </div>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table
          className="nms-table"
          dataSource={appCampaigns}
          rowKey="id"
          pagination={false}
          size="middle"
          columns={[
            {
              title: 'CAMPAIGN NAME',
              dataIndex: 'name',
              key: 'name',
              render: (name: string, r) => (
                <div>
                  <div className="font-bold text-[13px] text-[var(--text-primary)]">{name}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5 select-all">
                    ID: {r.id}
                  </div>
                </div>
              ),
            },
            {
              title: 'NETWORK',
              dataIndex: 'network',
              key: 'network',
              width: 140,
              render: (net: string) => (
                <Tag
                  color="blue"
                  bordered={false}
                  className="rounded font-semibold text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 py-0.5 px-2"
                  style={{
                    backgroundColor: `${NETWORK_COLORS[net]}15`,
                    color: NETWORK_COLORS[net],
                  }}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden border border-[var(--border-subtle)] shrink-0">
                    <img src={NETWORK_LOGOS[net]} alt={net} className="w-full h-full object-contain" />
                  </span>
                  <span>{NETWORK_LABELS[net] || net}</span>
                </Tag>
              ),
            },
            {
              title: 'STATUS',
              dataIndex: 'status',
              key: 'status',
              width: 110,
              render: (status: string) => (
                <StatusBadge label={status} variant={statusToVariant(status)} />
              ),
            },
            {
              title: 'BUDGET',
              dataIndex: 'budget',
              key: 'budget',
              align: 'right',
              render: (v: number) => (
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  ${v.toLocaleString()}
                </span>
              ),
            },
            {
              title: 'SPEND',
              dataIndex: 'spend',
              key: 'spend',
              align: 'right',
              render: (v: number) => (
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  ${v.toLocaleString()}
                </span>
              ),
            },
            {
              title: 'INSTALLS',
              dataIndex: 'installs',
              key: 'installs',
              align: 'right',
              render: (v: number) => (
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {v.toLocaleString()}
                </span>
              ),
            },
            {
              title: 'ROAS',
              dataIndex: 'roas',
              key: 'roas',
              align: 'right',
              render: (v: number) => (
                <span className="text-xs font-bold text-[var(--status-success)]">{v}x</span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AppDashboard;
