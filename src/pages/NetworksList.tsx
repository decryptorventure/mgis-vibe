import React from 'react';
import { Card, Row, Col, Progress } from 'antd';
import { Badge, Button } from '@frontend-team/ui-kit';
import { Network, ShieldCheck, ShieldAlert, Key, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatCard } from '@/components/ui';
import { mockCampaigns, mockVaultKeys, mockProjects } from '@/shared/mock-data';
import { NETWORK_LOGOS } from '@/shared/network-config';
import { ACTIVE_NETWORKS, ACTIVE_NETWORK_KEYS, type ActiveNetworkKey } from '@/shared/navigation';

const NETWORK_DESCRIPTIONS: Record<ActiveNetworkKey, string> = {
  'google-ads': 'Google Universal App Campaigns, Search, and Display network ads.',
  meta: 'Facebook, Instagram, Audience Network, and Messenger placements.',
  asa: 'App Store search ads driven by high-intent keywords.',
  axon: 'Mobile ad network specializing in programmatic video and playables.',
  moloco: 'Operational DSP powered by machine learning for global user acquisition.',
};

export const NetworksList: React.FC = () => {
  const navigate = useNavigate();

  // Aggregate stats per network
  const networkStats = ACTIVE_NETWORK_KEYS.map((networkKey) => {
    const net = ACTIVE_NETWORKS[networkKey];
    // Campaigns under this network
    const relatedCampaigns = mockCampaigns.filter((c) => c.network === net.key);
    const totalSpend = relatedCampaigns.reduce((s, c) => s + c.spend, 0);
    const totalInstalls = relatedCampaigns.reduce((s, c) => s + c.installs, 0);
    const activeCampaigns = relatedCampaigns.filter((c) => c.status === 'ACTIVE').length;

    // Apps connected
    const connectedApps = mockProjects.filter((p) => p.networks.includes(net.key));

    // API Key status matching this network
    const keys = mockVaultKeys.filter((vk) => vk.network.toLowerCase() === net.key.replace('-ads', '').replace('apple ', ''));
    const isApiValid = keys.length > 0 && keys.every((k) => k.status === 'VALID' || k.status === 'EXPIRING_SOON');
    const apiStatus = keys.length === 0 ? 'Not Connected' : isApiValid ? 'Active' : 'Error';

    return {
      ...net,
      name: net.label,
      desc: NETWORK_DESCRIPTIONS[net.key],
      totalSpend,
      totalInstalls,
      activeCampaigns,
      connectedAppsCount: connectedApps.length,
      connectedApps,
      apiStatus,
      keysCount: keys.length,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Network size={20} />}
        iconBg="var(--color-primary-500)"
        title="Danh sách các Network"
        subtitle="Tổng hợp hiệu suất, trạng thái kết nối API, và cấu hình các mạng quảng cáo"
      />

      <Row gutter={[16, 16]}>
        {networkStats.map((net) => {
          const apiValid = net.apiStatus === 'Active';
          const apiNotConnected = net.apiStatus === 'Not Connected';

          return (
            <Col xs={24} lg={12} key={net.key}>
              <Card
                className="rounded-lg border-[var(--border-default)] bg-[var(--surface-base)] overflow-hidden transition-colors hover:border-primary-500"
                styles={{ body: { padding: '20px' } }}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white p-1.5 border border-[var(--border-subtle)]"
                    >
                      <img
                        src={NETWORK_LOGOS[net.key]}
                        alt={net.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">
                        {net.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)] max-w-[300px] mt-0.5 line-clamp-1">
                        {net.desc}
                      </div>
                    </div>
                  </div>

                  <span
                    className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                    style={{
                      background: apiNotConnected ? 'var(--surface-muted)' : apiValid ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
                      color: apiNotConnected ? 'var(--text-secondary)' : apiValid ? 'var(--status-success)' : 'var(--status-error)',
                      borderColor: apiNotConnected ? 'var(--border-default)' : apiValid ? 'var(--status-success-border)' : 'var(--status-error-border)',
                    }}
                  >
                    {apiNotConnected ? (
                      <Key size={10} />
                    ) : apiValid ? (
                      <ShieldCheck size={10} className="text-[var(--status-success)]" />
                    ) : (
                      <ShieldAlert size={10} className="text-[var(--status-error)]" />
                    )}
                    {net.apiStatus}
                  </span>
                </div>

                {/* Aggregated performance specs */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <StatCard title="Spend" value={`$${net.totalSpend.toLocaleString()}`} variant="info" />
                  <StatCard title="Installs" value={net.totalInstalls.toLocaleString()} variant="success" />
                  <StatCard title="Active" value={net.activeCampaigns} variant="primary" />
                </div>

                {/* Progress bar to represent weight of network spend */}
                <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Tỷ trọng ngân sách của hệ thống:</span>
                  <span className="font-bold">
                    {net.totalSpend > 0
                      ? `${Math.round((net.totalSpend / 40000) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <Progress
                  percent={net.totalSpend > 0 ? Math.round((net.totalSpend / 40000) * 100) : 0}
                  strokeColor={net.color}
                  trailColor="var(--border-subtle)"
                  showInfo={false}
                  size="small"
                  className="mt-1"
                />

                {/* Connected apps list */}
                <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mr-1">
                    Connected Apps ({net.connectedAppsCount}):
                  </span>
                  {net.connectedApps.length > 0 ? (
                    net.connectedApps.map((app) => (
                      <Badge
                        key={app.id}
                        rounded
                        className="bg_tertiary text_secondary border border_secondary text-[10px] font-semibold px-2 py-0.5 cursor-pointer hover:state_bg_button_tertiary_soft"
                        onClick={() => navigate(`/apps/${app.id}/dashboard`)}
                      >
                        {app.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-[var(--text-disabled)] italic">Chưa kết nối ứng dụng nào</span>
                  )}
                </div>

                {/* Footer action buttons */}
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-semibold flex items-center gap-1">
                    <Key size={11} /> {net.keysCount} API keys configured
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="border"
                      size="s"
                      onClick={() => navigate('/automation-settings')}
                      className="text-xs gap-1"
                    >
                      <Zap size={11} />
                      Automation Rules
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="s"
                      style={{ background: net.color, borderColor: net.color }}
                      onClick={() => {
                        // Navigating into the first connected app's network workspace
                        if (net.connectedApps.length > 0) {
                          navigate(`/apps/${net.connectedApps[0].id}/networks/${net.key}`);
                        } else {
                          // Fallback to AppsList
                          navigate('/apps');
                        }
                      }}
                      className="text-xs gap-0.5"
                    >
                      <ChevronRight size={11} />
                      Enter Workspace
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default NetworksList;
