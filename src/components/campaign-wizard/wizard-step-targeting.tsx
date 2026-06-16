import React from 'react';
import { Collapse } from 'antd';
import { GoogleTargetingSection } from './network-sections/google-targeting-section';
import { MetaTargetingSection } from './network-sections/meta-targeting-section';
import { AsaTargetingSection } from './network-sections/asa-targeting-section';
import { AxonTargetingSection } from './network-sections/axon-targeting-section';
import { MolocoTargetingSection } from './network-sections/moloco-targeting-section';

interface WizardStepTargetingProps {
  state: any;
  onChange: (updates: Record<string, any>) => void;
}

const NETWORK_LABELS: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta': 'Meta',
  'asa': 'Apple Search Ads',
  'axon': 'Axon',
  'moloco': 'Moloco',
};

const NETWORK_COLORS: Record<string, string> = {
  'google-ads': '#4285F4',
  'meta': '#1877F2',
  'asa': '#6b7280',
  'axon': '#FF6B35',
  'moloco': '#7C3AED',
};

export const WizardStepTargeting: React.FC<WizardStepTargetingProps> = ({
  state,
  onChange,
}) => {
  const selectedNetworks = state.selectedNetworks || [];
  const targeting = state.targeting || {};

  const handleNetworkTargetingChange = (network: string, value: Record<string, any>) => {
    const next = {
      ...targeting,
      [network]: value,
    };
    onChange({ targeting: next });
  };

  if (selectedNetworks.length === 0) {
    return (
      <div className="text-center p-8 text-[var(--status-warning)] font-semibold bg-[var(--status-warning-bg)] rounded-xl border border-[var(--status-warning-border)]">
        Vui lòng chọn ít nhất một mạng quảng cáo ở Bước 1
      </div>
    );
  }

  // Pre-expand all selected networks
  const activeKeys = selectedNetworks;

  const items = selectedNetworks.map((n: string) => {
    const sectionValue = targeting[n] || {};

    const renderContent = () => {
      switch (n) {
        case 'google-ads':
          return (
            <GoogleTargetingSection
              value={sectionValue}
              onChange={(val) => handleNetworkTargetingChange(n, val)}
            />
          );
        case 'meta':
          return (
            <MetaTargetingSection
              value={sectionValue}
              onChange={(val) => handleNetworkTargetingChange(n, val)}
            />
          );
        case 'asa':
          return (
            <AsaTargetingSection
              value={sectionValue}
              onChange={(val) => handleNetworkTargetingChange(n, val)}
            />
          );
        case 'axon':
          return (
            <AxonTargetingSection
              value={sectionValue}
              onChange={(val) => handleNetworkTargetingChange(n, val)}
            />
          );
        case 'moloco':
          return (
            <MolocoTargetingSection
              value={sectionValue}
              onChange={(val) => handleNetworkTargetingChange(n, val)}
            />
          );
        default:
          return <div className="text-[var(--status-error)]">Mạng quảng cáo không được hỗ trợ</div>;
      }
    };

    return {
      key: n,
      label: (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NETWORK_COLORS[n] }} />
          <span className="text-xs font-bold text-[var(--text-primary)]">{NETWORK_LABELS[n]} targeting</span>
        </div>
      ),
      children: <div className="py-2">{renderContent()}</div>,
    };
  });

  return (
    <Collapse
      activeKey={activeKeys}
      className="bg-[var(--surface-base)] rounded-xl overflow-hidden border border-[var(--border-default)]"
      items={items}
      expandIconPosition="end"
      ghost
    />
  );
};
export default WizardStepTargeting;
