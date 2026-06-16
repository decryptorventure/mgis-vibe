import React, { useState, useEffect } from 'react';
import { Skeleton } from 'antd';
import { GoogleAdsWorkspace } from './networks/GoogleAdsWorkspace';
import { MetaWorkspace } from './networks/MetaWorkspace';
import { AsaWorkspace } from './networks/AsaWorkspace';
import { AxonWorkspace } from './networks/AxonWorkspace';
import { MolocoWorkspace } from './networks/MolocoWorkspace';
import { NetworkPortfolioWorkspace } from './NetworkPortfolioWorkspace';

import { useParams } from 'react-router-dom';

interface NetworkWorkspaceProps {
  network?: string;
  networkLabel?: string;
}

const NETWORK_LABELS_MAP: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta': 'Meta',
  'asa': 'Apple Search Ads',
  'axon': 'Axon / AppLovin',
  'moloco': 'Moloco',
};

export const NetworkWorkspace: React.FC<NetworkWorkspaceProps> = ({
  network: propNetwork,
  networkLabel: propNetworkLabel,
}) => {
  const { appId, networkId } = useParams<{ appId?: string; networkId?: string }>();
  const network = propNetwork || networkId || '';
  const networkLabel = propNetworkLabel || NETWORK_LABELS_MAP[network] || network;

  const [loading, setLoading] = useState(true);

  // Load animation whenever network page changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [network]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton.Input active style={{ width: 320, height: 40 }} />
          <Skeleton.Input active style={{ width: 200, height: 16 }} />
        </div>
        <div className="flex gap-4">
          <Skeleton.Button active style={{ width: 120, height: 32 }} />
          <Skeleton.Button active style={{ width: 120, height: 32 }} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton.Button key={i} active style={{ width: '100%', height: 100 }} />
          ))}
        </div>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!appId) {
    return <NetworkPortfolioWorkspace />;
  }

  switch (network) {
    case 'google-ads':
      return <GoogleAdsWorkspace network={network} networkLabel={networkLabel} />;
    case 'meta':
      return <MetaWorkspace network={network} networkLabel={networkLabel} />;
    case 'asa':
      return <AsaWorkspace network={network} networkLabel={networkLabel} />;
    case 'axon':
      return <AxonWorkspace network={network} networkLabel={networkLabel} />;
    case 'moloco':
      return <MolocoWorkspace network={network} networkLabel={networkLabel} />;
    default:
      return (
        <div className="p-8 text-center text-[var(--status-error)] font-semibold bg-[var(--surface-subtle)] border border-[var(--status-error-border)] rounded-xl">
          Unsupported network workspace: {networkLabel} ({network})
        </div>
      );
  }
};

export default NetworkWorkspace;
