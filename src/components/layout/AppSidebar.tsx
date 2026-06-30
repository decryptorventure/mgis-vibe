/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from 'react';
import { Layout, Menu, Drawer, Input } from '@/components/ui-kit-compat';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard, Library,
  Zap, Network, LayoutGrid, ArrowLeft, Search, FileText
} from 'lucide-react';
import { mockProjects } from '../../shared/mock-data';
import { NETWORK_LOGOS } from '../../shared/network-config';
import {
  ACTIVE_NETWORKS,
  GLOBAL_NAV_ITEMS,
  getAppNetworkPath,
  getSelectedNavPath,
  isActiveNetworkKey,
  type ActiveNetworkKey,
  type NavIconKey,
} from '@/shared/navigation';

const { Sider } = Layout;

const GLOBAL_NAV_ICONS: Record<NavIconKey, React.ReactNode> = {
  dashboard: <LayoutDashboard size={15} />,
  apps: <LayoutGrid size={15} />,
  networks: <Network size={15} />,
  creatives: <Library size={15} />,
  'change-logs': <FileText size={15} />,
};

// Small colored dot used as sidebar icon for each network sub-item
const NetworkLogoIcon: React.FC<{ networkKey: ActiveNetworkKey }> = ({ networkKey }) => (
  <span
    className="w-4.5 h-4.5 radius_round border border_secondary bg_primary p-0.5 flex items-center justify-center flex-shrink-0"
    style={{ display: 'inline-flex' }}
  >
    <img
      src={NETWORK_LOGOS[networkKey]}
      alt={networkKey}
      className="w-full h-full object-contain rounded-full"
    />
  </span>
);

/** Resolve current route → menu selectedKey */
function getSelectedKey(pathname: string): string {
  return getSelectedNavPath(pathname);
}

// ─── Logo section (Global context) ───────────────────────────────────────────
const SidebarLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <Link
    to="/"
    className="flex items-center gap-3 h-16 flex-shrink-0 border-b border_secondary"
    style={{
      padding: collapsed ? '0 18px' : '0 16px',
      textDecoration: 'none'
    }}
  >
    <div className="w-8 h-8 radius_8 flex items-center justify-center flex-shrink-0 animate-pulse bg_accent_primary fg_on_accent">
      <Network size={16} />
    </div>
    {!collapsed && (
      <div>
        <div className="font-bold text-sm leading-none text_primary">
          MGIS
        </div>
        <div className="text-[10px] font-medium tracking-wide mt-0.5 leading-none text_tertiary">
          Marketing Growth Intelligence
        </div>
      </div>
    )}
  </Link>
);

// ─── Sidebar content (shared between Sider and Drawer) ─────────────────────
const SidebarContent: React.FC<{
  collapsed: boolean;
  pathname: string;
  onNavigate: (key: string) => void;
}> = ({ collapsed, pathname, onNavigate }) => {
  const { appId } = useParams<{ appId?: string }>();
  const activeApp = mockProjects.find(p => p.id === appId);

  // If we are in the App context, render App Workspace Sidebar Menu
  if (activeApp) {
    const activeAppId = activeApp.id;
    const appMenuItems = [
      {
        key: `/apps/${activeAppId}/dashboard`,
        icon: <LayoutDashboard size={15} />,
        label: 'Dashboard',
      },
      {
        key: 'app-networks-group',
        icon: <Network size={15} />,
        label: 'Networks Connected',
        children: activeApp.networks
          .filter(isActiveNetworkKey)
          .map(netKey => ({
            key: getAppNetworkPath(activeAppId, netKey),
            icon: <NetworkLogoIcon networkKey={netKey} />,
            label: ACTIVE_NETWORKS[netKey].label,
          })),
      },
      {
        key: `/apps/${activeAppId}/automation-rules`,
        icon: <Zap size={15} />,
        label: 'Automation Rules',
      },
    ];

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Back Arrow to Global context */}
        <Link
          to="/apps"
          className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text_secondary hover:fg_accent_primary transition-colors border-b border_secondary"
        >
          <ArrowLeft size={13} />
          <span>Danh sách App</span>
        </Link>

        {/* Active App Identity details */}
        {!collapsed && (
          <div className="flex items-center gap-3 p-4 border-b border_secondary bg_secondary">
            <div className="w-8 h-8 radius_8 flex items-center justify-center font-bold text-sm shadow-sm bg_tertiary text_primary border border_primary">
              {activeApp.icon}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text_primary truncate">{activeApp.name}</div>
              <div className="text-[9px] text_tertiary font-mono truncate">{activeApp.package}</div>
            </div>
          </div>
        )}

        {/* Type to search (Visual) */}
        {!collapsed && (
          <div className="px-3 py-2 border-b border_secondary">
            <Input
              size="small"
              placeholder="Search..."
              prefix={<Search size={12} className="text_tertiary" />}
              className="rounded-md"
            />
          </div>
        )}

        {/* Scoped Menu Items */}
        <div className="flex-1 overflow-auto py-2">
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[getSelectedKey(pathname)]}
            defaultOpenKeys={collapsed ? [] : ['app-networks-group']}
            items={appMenuItems}
            onClick={({ key }) => onNavigate(key)}
            style={{ border: 'none', fontSize: 13 }}
          />
        </div>
      </div>
    );
  }

  // Otherwise, render the Global Sidebar Menu
  const globalMenuItems = GLOBAL_NAV_ITEMS.map(item => ({
    key: item.path,
    icon: GLOBAL_NAV_ICONS[item.icon],
    label: item.label,
  }));

  return (
    <>
      <SidebarLogo collapsed={collapsed} />
      <div className="py-2">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[getSelectedKey(pathname)]}
          items={globalMenuItems}
          onClick={({ key }) => onNavigate(key)}
          style={{ border: 'none', fontSize: 13 }}
        />
      </div>
    </>
  );
};

export interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileDrawerOpen?: boolean;
  onMobileDrawerClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onCollapse,
  mobileDrawerOpen = false,
  onMobileDrawerClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-collapse on screens < 1024px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !collapsed) {
        onCollapse(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, onCollapse]);

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawerOpen]);

  const handleNavigate = (key: string) => {
    navigate(key);
    onMobileDrawerClose?.();
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={onMobileDrawerClose}
        width={260}
        styles={{ body: { padding: 0 } }}
      >
        <SidebarContent
          collapsed={false}
          pathname={location.pathname}
          onNavigate={handleNavigate}
        />
      </Drawer>
    );
  }

  return (
    <Sider
      width={260}
      collapsedWidth={64}
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsible
      theme="light"
      className="bg_primary border-r border_primary"
      style={{
        overflow: 'auto',
        height: '100%',
      }}
    >
      <SidebarContent
        collapsed={collapsed}
        pathname={location.pathname}
        onNavigate={handleNavigate}
      />
    </Sider>
  );
};

export default AppSidebar;
