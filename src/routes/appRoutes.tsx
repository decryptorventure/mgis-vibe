/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import LoginPage from '@/pages/LoginPage';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AppsList = lazy(() => import('@/pages/AppsList'));
const NetworksList = lazy(() => import('@/pages/NetworksList'));
const MediaLibraries = lazy(() => import('@/pages/MediaLibraries'));


// App Workspace Pages
const AppDashboard = lazy(() => import('@/pages/app-dashboard'));
const AppAutomationRules = lazy(() => import('@/pages/AppAutomationRules'));
const NetworkWorkspace = lazy(() => import('@/pages/NetworkWorkspace'));
const CampaignCreatePage = lazy(() => import('@/pages/campaign-create-page'));


// Supporting Operations (remained paths)
const AxonReports = lazy(() => import('@/pages/AxonReports'));
const Predictions = lazy(() => import('@/pages/Predictions'));
const ChangeLogs = lazy(() => import('@/pages/ChangeLogs'));
const MetaErrors = lazy(() => import('@/pages/MetaErrors'));
const UploadMonitor = lazy(() => import('@/pages/UploadMonitor'));

const KeyManagement = lazy(() => import('@/pages/KeyManagement'));
const Permissions = lazy(() => import('@/pages/Permissions'));
const Automation = lazy(() => import('@/pages/Automation'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      {children}
    </Suspense>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const appRouter = createBrowserRouter([
  // Login — eager loaded (entry point)
  { path: '/login', element: <LoginPage /> },

  // Main App
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Global Dashboard
      { index: true, element: <SuspenseWrap><Dashboard /></SuspenseWrap> },
      { path: 'dashboard', element: <SuspenseWrap><Dashboard /></SuspenseWrap> },

      // Global Sitemap (Vòng ngoài cùng)
      { path: 'apps', element: <SuspenseWrap><AppsList /></SuspenseWrap> },
      { path: 'networks', element: <SuspenseWrap><NetworksList /></SuspenseWrap> },
      { path: 'networks/:networkId', element: <SuspenseWrap><NetworkWorkspace /></SuspenseWrap> },
      { path: 'creatives', element: <SuspenseWrap><MediaLibraries /></SuspenseWrap> },


      // App Workspace Sitemap (Vòng tiếp theo)
      { path: 'apps/:appId/dashboard', element: <SuspenseWrap><AppDashboard /></SuspenseWrap> },
      { path: 'apps/:appId/automation-rules', element: <SuspenseWrap><AppAutomationRules /></SuspenseWrap> },

      { path: 'apps/:appId/networks/:networkId', element: <SuspenseWrap><NetworkWorkspace /></SuspenseWrap> },
      { path: 'apps/:appId/networks/:networkId/campaigns/new', element: <SuspenseWrap><CampaignCreatePage /></SuspenseWrap> },


      // Supporting Operations
      { path: 'media-libraries', element: <SuspenseWrap><MediaLibraries /></SuspenseWrap> },
      { path: 'axon-reports', element: <SuspenseWrap><AxonReports /></SuspenseWrap> },
      { path: 'predictions', element: <SuspenseWrap><Predictions /></SuspenseWrap> },
      { path: 'change-logs', element: <SuspenseWrap><ChangeLogs /></SuspenseWrap> },
      { path: 'meta-errors', element: <SuspenseWrap><MetaErrors /></SuspenseWrap> },
      { path: 'upload-monitor', element: <SuspenseWrap><UploadMonitor /></SuspenseWrap> },

      // Settings

      { path: 'key-management', element: <SuspenseWrap><KeyManagement /></SuspenseWrap> },
      { path: 'permissions', element: <SuspenseWrap><Permissions /></SuspenseWrap> },
      { path: 'automation', element: <SuspenseWrap><Automation /></SuspenseWrap> },

      // 404 Fallback
      { path: '*', element: <SuspenseWrap><NotFound /></SuspenseWrap> },
    ],
  },
]);

export default appRouter;
