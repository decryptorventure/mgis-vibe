import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/ui-kit-compat';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { CommandPalette } from '@/components/ui/command-palette';
import { mockProjects, mockNotifications } from '../../shared/mock-data';
import type { Notification } from '../../shared/mock-data';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { NetworkContextBar } from './NetworkContextBar';
import { NotificationDrawer } from './NotificationDrawer';
import { AiAssistantWidget } from '../ui';
import { getBreadcrumbItems, getNetworkMeta, getPageTitle, isActiveNetworkKey } from '@/shared/navigation';

const { Content } = Layout;

// ─────────────────────────────────────────────────────────────────────────────
// AppLayout — main shell composing AppSidebar, AppHeader, NotificationDrawer.
// Manages shared state: notifications, sidebar collapse, and mobile drawer.
// ─────────────────────────────────────────────────────────────────────────────

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { appId, networkId } = useParams<{ appId?: string; networkId?: string }>();
  const activeNetwork = isActiveNetworkKey(networkId) ? networkId : null;
  const activeApp = mockProjects.find(project => project.id === appId);
  const activeNetworkMeta = getNetworkMeta(activeNetwork);

  const NOTIF_READ_KEY = 'nms_notifications_read_v1';

  // ─── State ────────────────────────────────────────────────────────────────
  const [collapsed, setCollapsed]               = useState(false);
  const [notifOpen, setNotifOpen]                = useState(false);
  const [notifications, setNotifications]        = useState<Notification[]>(() => {
    try {
      const readIds: string[] = JSON.parse(localStorage.getItem(NOTIF_READ_KEY) ?? '[]');
      return mockNotifications.map(n => ({ ...n, read: readIds.includes(n.id) || n.read }));
    } catch {
      return mockNotifications;
    }
  });
  const [mobileDrawerOpen, setMobileDrawerOpen]  = useState(false);
  const [paletteOpen, setPaletteOpen]            = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const allIds = mockNotifications.map(n => n.id);
    localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const pageTitle = getPageTitle(location.pathname);
  const breadcrumbs = getBreadcrumbItems(location.pathname, {
    appName: activeApp?.name,
    networkLabel: activeNetworkMeta?.label,
  });

  return (
    <Layout className="h-screen overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <AppSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileDrawerOpen={mobileDrawerOpen}
        onMobileDrawerClose={() => setMobileDrawerOpen(false)}
      />

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <Layout className="flex flex-col h-full overflow-hidden flex-1 min-w-0">

        {/* Header */}
        <AppHeader
          pageTitle={pageTitle}
          breadcrumbs={breadcrumbs}
          notificationCount={unreadCount}
          onNotificationClick={() => setNotifOpen(true)}
          onMobileMenuClick={() => setMobileDrawerOpen(true)}
          onSearchClick={() => setPaletteOpen(true)}
        />

        {/* Network context bar — visible only on network workspace routes */}
        {activeNetwork && <NetworkContextBar activeNetwork={activeNetwork} />}

        {/* Page content */}
        <Content className="p-5 overflow-auto flex-1 bg_canvas_secondary">
          <Outlet />
        </Content>
      </Layout>

      {/* ── Notification drawer (floating layer → shadow OK) ────────────── */}
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={markAllRead}
      />

      {/* ── AI Assistant Widget ─────────────────────────────────────────── */}
      <AiAssistantWidget />

      {/* ── Command Palette ⌘K ──────────────────────────────────────────── */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Layout>
  );
};

export default AppLayout;
