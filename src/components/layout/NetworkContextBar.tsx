import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@frontend-team/ui-kit';
import { NETWORK_LOGOS } from '@/shared/network-config';
import {
  ACTIVE_NETWORKS,
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
    navigate('/networks');
  };

  return (
    <div className="h-10 flex items-center justify-between px-5 flex-shrink-0 bg_primary border-b border_secondary">
      {/* Active network badge */}
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 radius_round border border_secondary bg_primary p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm">
          <img
            src={NETWORK_LOGOS[activeNetwork]}
            alt={activeNetwork}
            className="w-full h-full object-contain"
          />
        </span>
        <span className="text-xs font-bold text_primary">
          {activeApp?.name ?? 'App workspace'}
        </span>
      </div>

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
