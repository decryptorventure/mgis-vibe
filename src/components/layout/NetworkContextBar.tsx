import { useNavigate, useParams } from 'react-router-dom';
import { Dropdown } from 'antd';
import { cn } from '@frontend-team/ui-kit';
import { ChevronDown } from 'lucide-react';
import { NETWORK_LOGOS } from '@/shared/network-config';
import {
  ACTIVE_NETWORKS,
  getNetworkPath,
  getAppNetworkPath,
  type ActiveNetworkKey,
} from '@/shared/navigation';
import { mockProjects } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// NetworkContextBar — persistent strip shown when inside a network workspace.
// Displays the active network name + quick-switch tabs for all 5 networks.
// ─────────────────────────────────────────────────────────────────────────────

interface NetworkContextBarProps {
  /** Active network key, e.g. 'google-ads' | 'meta' | 'asa' | 'axon' | 'moloco' */
  activeNetwork: ActiveNetworkKey;
}

export const NetworkContextBar: React.FC<NetworkContextBarProps> = ({ activeNetwork }) => {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId?: string }>();
  const activeApp = mockProjects.find(project => project.id === appId);
  const networks = Object.values(ACTIVE_NETWORKS);

  const handleNetworkClick = (networkKey: ActiveNetworkKey) => {
    if (appId) {
      navigate(getAppNetworkPath(appId, networkKey));
      return;
    }
    navigate(getNetworkPath(networkKey));
  };

  return (
    <div className="h-10 flex items-center justify-between px-5 flex-shrink-0 bg_primary border-b border_secondary">
      {/* App switcher dropdown — click to switch app while keeping current network */}
      <Dropdown
        trigger={['click']}
        menu={{
          selectedKeys: appId ? [appId] : [],
          items: mockProjects.map(p => ({
            key: p.id,
            label: (
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-base leading-none">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text_primary truncate">{p.name}</div>
                  <div className="text-[10px] text_tertiary font-mono truncate">{p.package}</div>
                </div>
              </div>
            ),
            onClick: () => navigate(getAppNetworkPath(p.id, activeNetwork)),
          })),
        }}
      >
        <button className="flex items-center gap-2 cursor-pointer hover:bg_button_tertiary px-2 py-1 radius_6 transition-colors">
          <span className="w-5 h-5 radius_round border border_secondary bg_primary p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src={NETWORK_LOGOS[activeNetwork]} alt={activeNetwork} className="w-full h-full object-contain" />
          </span>
          <span className="text-xs font-bold text_primary">
            {activeApp?.name ?? `${ACTIVE_NETWORKS[activeNetwork].label} report`}
          </span>
          <ChevronDown size={11} className="text_tertiary" />
        </button>
      </Dropdown>

      {/* Quick-switch tabs */}
      <div className="flex items-center gap-1.5">
        {networks.map(network => {
          const isActive = network.key === activeNetwork;
          return (
            <button
              key={network.key}
              onClick={() => handleNetworkClick(network.key)}
              className={cn(
                'h-[26px] px-2 radius_6 cursor-pointer transition-colors text-xs inline-flex items-center gap-1.5 border',
                isActive
                  ? 'font-semibold'
                  : 'font-normal text_tertiary border-transparent hover:state_bg_button_tertiary_soft',
              )}
              style={isActive ? {
                background: `${network.color}18`,
                color: network.color,
                borderColor: `${network.color}30`,
              } : undefined}
            >
              <span className="w-3.5 h-3.5 radius_round bg_primary p-0.5 flex items-center justify-center overflow-hidden border border_secondary shrink-0">
                <img src={NETWORK_LOGOS[network.key]} alt={network.label} className="w-full h-full object-contain" />
              </span>
              <span>{network.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkContextBar;
