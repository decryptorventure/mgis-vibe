import React from 'react';
import { NetworkWorkspaceShell } from '@/components/networks/network-workspace-shell';
import { NETWORK_CONFIGS } from '@/shared/network-config';
import { mockCampaigns } from '@/shared/mock-data';
import { useParams } from 'react-router-dom';
import { GoogleAdsBiddingTab } from '@/components/networks/google-ads/google-ads-bidding-tab';
import { GoogleAdsConversionsTab } from '@/components/networks/google-ads/google-ads-conversions-tab';

export const GoogleAdsWorkspace: React.FC<{ network: string; networkLabel: string }> = ({ network }) => {
  const { appId } = useParams<{ appId?: string }>();
  const campaigns = mockCampaigns.filter(
    (c) => c.network === network && (!appId || c.projectId === appId)
  );
  
  const baseConfig = NETWORK_CONFIGS['google-ads'];
  const config = {
    ...baseConfig,
    extraTabs: [
      ...(baseConfig.extraTabs || []),
      {
        key: 'bidding',
        label: 'Bidding & Budget',
        children: <GoogleAdsBiddingTab />
      },
      {
        key: 'conversions',
        label: 'Conversion Events',
        children: <GoogleAdsConversionsTab />
      }
    ]
  };

  return <NetworkWorkspaceShell config={config} campaigns={campaigns} />;
};

export default GoogleAdsWorkspace;
