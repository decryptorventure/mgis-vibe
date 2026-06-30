// Trend charts, network share pie, storefront intelligence, and campaign table for AppDashboard
import React from 'react';
import { Card, Row, Col } from '@/components/ui-kit-compat';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Activity, ArrowUpRight, Network } from 'lucide-react';
import { NETWORK_LOGOS } from '@/shared/network-config';
import type { Campaign, Project } from '@/shared/mock-data';
import { NETWORK_LABELS } from './use-app-dashboard';
import { AppDashboardStorefront } from './app-dashboard-storefront';
import { AppDashboardCampaignsTable } from './app-dashboard-campaigns-table';

interface NetworkDataEntry {
  name: string;
  key: string;
  value: number;
  color: string;
}

interface Props {
  project: Project;
  appCampaigns: Campaign[];
  trendData: { date: string; Cost: number; Installs: number }[];
  networkData: NetworkDataEntry[];
  totalSpend: number;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  zoomScale: number;
  setZoomScale: (fn: (s: number) => number) => void;
  navigate: (path: string) => void;
}

export const AppDashboardChart: React.FC<Props> = ({
  project,
  appCampaigns,
  trendData,
  networkData,
  totalSpend,
  selectedCountry,
  setSelectedCountry,
  zoomScale,
  setZoomScale,
  navigate,
}) => (
  <>
    {/* Performance trend + network share */}
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={15}>
        <Card
          className="rounded-xl border-[var(--border-default)]"
          title={
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-primary-500" />
              <span className="font-semibold text-sm text-[var(--text-primary)]">Performance Cost & Conversion Trends</span>
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
              <span className="font-semibold text-sm text-[var(--text-primary)]">Network Share (Spend)</span>
            </div>
          }
        >
          {networkData.length > 0 ? (
            <div className="h-[260px] flex flex-col justify-between">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={networkData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {networkData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--border-default)' }} itemStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-xs font-semibold px-2 pb-2">
                {networkData.map(entry => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}</span>
                    </div>
                    <span className="text-[var(--text-primary)]">
                      ${entry.value.toLocaleString()} ({Math.round((entry.value / totalSpend) * 100)}%)
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

    {/* Connected networks shortcuts */}
    <div className="space-y-2">
      <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        Mạng quảng cáo đã kết nối ({project.networks.length})
      </div>
      <Row gutter={[12, 12]}>
        {project.networks.map(netKey => {
          const label = NETWORK_LABELS[netKey] || netKey;
          const networkSpend = appCampaigns.filter(c => c.network === netKey).reduce((s, c) => s + c.spend, 0);
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
                    <span className="w-5 h-5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-base)] p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <img src={NETWORK_LOGOS[netKey]} alt={netKey} className="w-full h-full object-contain rounded-full" />
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

    {/* Market Intelligence / Storefront — extracted to app-dashboard-storefront.tsx */}
    <AppDashboardStorefront
      project={project}
      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
      zoomScale={zoomScale}
      setZoomScale={setZoomScale}
    />

    {/* Campaigns list — extracted to app-dashboard-campaigns-table.tsx */}
    <AppDashboardCampaignsTable appCampaigns={appCampaigns} />
  </>
);
