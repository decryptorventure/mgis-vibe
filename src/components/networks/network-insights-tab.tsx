// ─── NetworkInsightsTab — base wrapper that renders config.insightsContent ────
import React from 'react';
import type { NetworkConfig } from '@/shared/network-config';

interface NetworkInsightsTabProps {
  config: NetworkConfig;
}

export const NetworkInsightsTab: React.FC<NetworkInsightsTabProps> = ({ config }) => (
  <div className="network-insights-tab">
    {config.insightsContent()}
  </div>
);

export default NetworkInsightsTab;
