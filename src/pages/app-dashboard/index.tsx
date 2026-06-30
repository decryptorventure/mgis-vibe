// Shell: AppDashboard — composes hook + metrics + chart sub-components
import React, { useState } from 'react';
import { Alert, Card, Skeleton, Row, Col } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppDashboard } from './use-app-dashboard';
import { AppDashboardMetrics } from './app-dashboard-metrics';
import { AppDashboardChart } from './app-dashboard-chart';

export const AppDashboard: React.FC = () => {
  const {
    project, loading, refresh, appCampaigns, stats,
    networkData, trendData,
    selectedCountry, setSelectedCountry,
    zoomScale, setZoomScale,
    navigate,
  } = useAppDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => { setRefreshing(false); toast.success('Dashboard refreshed'); }, 700);
  };

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
          {[1, 2, 3, 4].map(i => (
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
          <div className="flex items-center gap-2">
            <div className="bg-[var(--surface-muted)] px-3 py-1.5 rounded-full border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: project.status === 'Running' ? 'var(--status-success)' : 'var(--status-warning)' }}
              />
              Status: {project.status}
            </div>
            <Button type="button" variant="border" size="s" onClick={handleRefresh} className="flex items-center gap-1.5" aria-label="Refresh dashboard">
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        }
      />

      <AppDashboardMetrics
        totalSpend={stats.totalSpend}
        totalInstalls={stats.totalInstalls}
        avgCpa={stats.avgCpa}
        avgRoas={stats.avgRoas}
      />

      <AppDashboardChart
        project={project}
        appCampaigns={appCampaigns}
        trendData={trendData}
        networkData={networkData}
        totalSpend={stats.totalSpend}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        zoomScale={zoomScale}
        setZoomScale={setZoomScale}
        navigate={navigate}
      />
    </div>
  );
};

export default AppDashboard;
