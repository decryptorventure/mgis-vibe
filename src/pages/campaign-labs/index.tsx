// Shell: CampaignLabs — composes editor (filters) + preview (app grid)
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Skeleton, Card } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { RefreshCw, LayoutGrid, Plus } from 'lucide-react';
import { mockProjects } from '../../shared/mock-data';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui';
import { CampaignWizardModal } from '../../components/campaign-wizard/campaign-wizard-modal';
import { CampaignLabsEditor } from './campaign-labs-editor';
import { CampaignLabsPreview } from './campaign-labs-preview';

const PLATFORMS = [{ key: 'ios', label: 'iOS' }, { key: 'android', label: 'Android' }];
const NETWORKS = [
  { key: 'google-ads', label: 'Google Ads' }, { key: 'meta', label: 'Meta Ads' },
  { key: 'axon', label: 'AppLovin' }, { key: 'asa', label: 'Apple Search Ads' },
];
const STATUSES = [
  { key: 'Running', label: 'Running' }, { key: 'Error', label: 'Error' },
  { key: 'Stop', label: 'Stop' }, { key: 'Update Required', label: 'Update Required' },
];

export const CampaignLabs: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['ios', 'android']);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(['google-ads', 'meta']);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [syncingAppId, setSyncingAppId] = useState<string | null>(null);
  const [globalSyncing, setGlobalSyncing] = useState<string | null>(null);
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      if (appSyncTimerRef.current) clearTimeout(appSyncTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedPlatforms([]);
    setSelectedNetworks([]);
    setSelectedStatuses([]);
    setSearchQuery('');
  }, []);

  const filteredApps = useMemo(() =>
    mockProjects.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase())
        || app.package.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(app.os);
      const matchesNetwork = selectedNetworks.length === 0
        || app.networks.some(net => selectedNetworks.includes(net));
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(app.status);
      return matchesSearch && matchesPlatform && matchesNetwork && matchesStatus;
    }),
    [searchQuery, selectedPlatforms, selectedNetworks, selectedStatuses],
  );

  const copyToClipboard = useCallback(async (pkg: string, id: string) => {
    try {
      await navigator.clipboard.writeText(pkg);
      setCopiedAppId(id);
      toast.success(`Đã sao chép Package ID: ${pkg}`);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedAppId(null), 2000);
    } catch {
      toast.error('Không thể sao chép. Vui lòng sao chép thủ công.');
    }
  }, []);

  const handleGlobalSync = useCallback((type: 'google' | 'projects') => {
    setGlobalSyncing(type);
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      setGlobalSyncing(null);
      toast.success(type === 'google' ? 'Đồng bộ chiến dịch từ Google Ads thành công!' : 'Đồng bộ danh sách ứng dụng thành công!');
    }, 1500);
  }, []);

  const handleAppSync = useCallback((appId: string, appName: string) => {
    setSyncingAppId(appId);
    if (appSyncTimerRef.current) clearTimeout(appSyncTimerRef.current);
    appSyncTimerRef.current = setTimeout(() => {
      setSyncingAppId(null);
      toast.success(`Đồng bộ dữ liệu của ứng dụng ${appName} thành công!`);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 3 }} /></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="rounded-xl"><Skeleton active paragraph={{ rows: 4 }} /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutGrid size={20} />}
        title="All Apps"
        subtitle="Manage and monitor your applications across all platforms"
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="primary" size="m" onClick={() => setWizardOpen(true)} className="font-bold text-xs gap-1.5">
              <Plus size={14} />Create Campaign
            </Button>
            <Button type="button" variant="border" size="m" onClick={() => handleGlobalSync('google')} className="font-bold text-xs gap-1.5">
              <RefreshCw size={14} className={globalSyncing === 'google' ? 'animate-spin' : ''} />Sync Google Ads
            </Button>
            <Button type="button" variant="border" size="m" onClick={() => handleGlobalSync('projects')} className="font-bold text-xs gap-1.5">
              <RefreshCw size={14} className={globalSyncing === 'projects' ? 'animate-spin' : ''} />Sync Projects
            </Button>
          </div>
        }
      />

      <CampaignLabsEditor
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        platforms={PLATFORMS}
        networks={NETWORKS}
        statuses={STATUSES}
        selectedPlatforms={selectedPlatforms}
        selectedNetworks={selectedNetworks}
        selectedStatuses={selectedStatuses}
        onTogglePlatform={key => setSelectedPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])}
        onToggleNetwork={key => setSelectedNetworks(prev => prev.includes(key) ? prev.filter(n => n !== key) : [...prev, key])}
        onToggleStatus={key => setSelectedStatuses(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])}
        onClearPlatforms={() => setSelectedPlatforms([])}
        onClearNetworks={() => setSelectedNetworks([])}
        onClearStatuses={() => setSelectedStatuses([])}
        onReset={resetFilters}
      />

      <CampaignLabsPreview
        apps={filteredApps}
        syncingAppId={syncingAppId}
        copiedAppId={copiedAppId}
        onCopy={copyToClipboard}
        onAppSync={handleAppSync}
        onNavigate={navigate}
        onReset={resetFilters}
      />

      <CampaignWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default CampaignLabs;
