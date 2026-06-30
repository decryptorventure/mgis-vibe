// KPI stat cards row for AppDashboard
import React from 'react';
import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

interface Props {
  totalSpend: number;
  totalInstalls: number;
  avgCpa: number;
  avgRoas: number;
}

export const AppDashboardMetrics: React.FC<Props> = ({
  totalSpend,
  totalInstalls,
  avgCpa,
  avgRoas,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      title="App Spend"
      value={`$${totalSpend.toLocaleString()}`}
      icon={<DollarSign size={14} />}
      variant="primary"
    />
    <StatCard
      title="App Installs"
      value={totalInstalls.toLocaleString()}
      icon={<Users size={14} />}
      variant="info"
    />
    <StatCard
      title="Average CPA"
      value={`$${avgCpa.toFixed(2)}`}
      icon={<Activity size={14} />}
      variant="warning"
    />
    <StatCard
      title="Average ROAS"
      value={`${avgRoas.toFixed(2)}x`}
      icon={<TrendingUp size={14} />}
      variant="success"
    />
  </div>
);
