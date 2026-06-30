// Hook: data, state, and derived values for AppDashboard
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCampaigns, mockProjects } from '@/shared/mock-data';

export const NETWORK_COLORS: Record<string, string> = {
  'google-ads': '#4285F4',
  'meta': '#1877F2',
  'asa': '#6b7280',
  'axon': '#FF6B35',
  'moloco': '#7C3AED',
};

export const NETWORK_LABELS: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta': 'Meta',
  'asa': 'Apple Search Ads',
  'axon': 'Axon / AppLovin',
  'moloco': 'Moloco',
};

export const STOREFRONTS_DATA: Record<string, {
  name: string;
  flag: string;
  spend: string;
  spendPercent: string;
  spendRaw: number;
  avgSov: number;
  paidKeywords: number;
  paidKeywordsPercent: string;
  competitors: { name: string; bg: string; letter: string }[];
  spendDescription: string;
  keywordsDescription: string;
}> = {
  US: { name: 'United States', flag: '🇺🇸', spend: '$24K', spendPercent: '34%', spendRaw: 24000, avgSov: 35, paidKeywords: 12436, paidKeywordsPercent: '11.5%', competitors: [{ name: 'FitTrack', bg: '#10B981', letter: 'F' }, { name: 'Strava', bg: '#EF4444', letter: 'S' }, { name: 'Nike Run', bg: '#000000', letter: 'N' }, { name: 'Peloton', bg: '#E11D48', letter: 'P' }, { name: 'MyFitnessPal', bg: '#3B82F6', letter: 'M' }], spendDescription: '34.4% from total: $280K - 300K', keywordsDescription: '11.5% from total: 246,490' },
  GB: { name: 'United Kingdom', flag: '🇬🇧', spend: '$18K', spendPercent: '28%', spendRaw: 18000, avgSov: 30, paidKeywords: 9842, paidKeywordsPercent: '9.2%', competitors: [{ name: 'Sweatcoin', bg: '#8B5CF6', letter: 'W' }, { name: 'Zwift', bg: '#F59E0B', letter: 'Z' }, { name: 'Adidas Running', bg: '#111827', letter: 'A' }, { name: 'Strava', bg: '#EF4444', letter: 'S' }], spendDescription: '28.0% from total: $280K - 300K', keywordsDescription: '9.2% from total: 246,490' },
  DE: { name: 'Germany', flag: '🇩🇪', spend: '$9K', spendPercent: '18%', spendRaw: 9000, avgSov: 22, paidKeywords: 6240, paidKeywordsPercent: '5.8%', competitors: [{ name: 'Komoot', bg: '#059669', letter: 'K' }, { name: 'Freeletics', bg: '#1F2937', letter: 'L' }, { name: 'Runtastic', bg: '#D97706', letter: 'R' }], spendDescription: '18.2% from total: $280K - 300K', keywordsDescription: '5.8% from total: 246,490' },
  FR: { name: 'France', flag: '🇫🇷', spend: '$3K', spendPercent: '9%', spendRaw: 3000, avgSov: 12, paidKeywords: 3110, paidKeywordsPercent: '2.9%', competitors: [{ name: 'Decathlon Coach', bg: '#2563EB', letter: 'D' }, { name: 'Yuka', bg: '#10B981', letter: 'Y' }, { name: 'FizzUp', bg: '#EC4899', letter: 'Z' }], spendDescription: '9.1% from total: $280K - 300K', keywordsDescription: '2.9% from total: 246,490' },
  HR: { name: 'Croatia', flag: '🇭🇷', spend: '$2K', spendPercent: '7%', spendRaw: 2000, avgSov: 8, paidKeywords: 1840, paidKeywordsPercent: '1.7%', competitors: [{ name: 'Sport Tracker', bg: '#EF4444', letter: 'T' }, { name: 'Runkeeper', bg: '#06B6D4', letter: 'R' }], spendDescription: '7.1% from total: $280K - 300K', keywordsDescription: '1.7% from total: 246,490' },
  FI: { name: 'Finland', flag: '🇫🇮', spend: '$1.8K', spendPercent: '6%', spendRaw: 1800, avgSov: 6, paidKeywords: 1210, paidKeywordsPercent: '1.1%', competitors: [{ name: 'Polar Flow', bg: '#DC2626', letter: 'O' }, { name: 'Suunto', bg: '#000000', letter: 'U' }], spendDescription: '6.4% from total: $280K - 300K', keywordsDescription: '1.1% from total: 246,490' },
};

export function useAppDashboard() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [zoomScale, setZoomScale] = useState(1.0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [appId, refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  const project = useMemo(() => mockProjects.find(p => p.id === appId), [appId]);
  const appCampaigns = useMemo(() => mockCampaigns.filter(c => c.projectId === appId), [appId]);

  const stats = useMemo(() => {
    const totalSpend = appCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalInstalls = appCampaigns.reduce((sum, c) => sum + c.installs, 0);
    const avgCpa = totalInstalls > 0 ? totalSpend / totalInstalls : 0;
    const avgRoas = appCampaigns.length > 0
      ? appCampaigns.reduce((sum, c) => sum + c.roas, 0) / appCampaigns.length
      : 0;
    return { totalSpend, totalInstalls, avgCpa, avgRoas };
  }, [appCampaigns]);

  const networkData = useMemo(() => {
    const groups: Record<string, number> = {};
    appCampaigns.forEach(c => { groups[c.network] = (groups[c.network] || 0) + c.spend; });
    return Object.entries(groups).map(([name, spend]) => ({
      name: NETWORK_LABELS[name] || name,
      key: name,
      value: spend,
      color: NETWORK_COLORS[name] || '#ccc',
    }));
  }, [appCampaigns]);

  const trendData = useMemo(() => {
    const factor = project ? project.spend / 20000 : 1;
    return [
      { date: '28/05', Cost: Math.round(800 * factor), Installs: Math.round(1100 * factor) },
      { date: '29/05', Cost: Math.round(1200 * factor), Installs: Math.round(1500 * factor) },
      { date: '30/05', Cost: Math.round(1400 * factor), Installs: Math.round(1900 * factor) },
      { date: '31/05', Cost: Math.round(1100 * factor), Installs: Math.round(1600 * factor) },
      { date: '01/06', Cost: Math.round(1500 * factor), Installs: Math.round(2100 * factor) },
      { date: '02/06', Cost: Math.round(1800 * factor), Installs: Math.round(2600 * factor) },
      { date: '03/06', Cost: Math.round(2100 * factor), Installs: Math.round(3100 * factor) },
      { date: '04/06', Cost: Math.round(2300 * factor), Installs: Math.round(3400 * factor) },
    ];
  }, [project]);

  return {
    appId,
    navigate,
    loading,
    refresh,
    project,
    appCampaigns,
    stats,
    networkData,
    trendData,
    selectedCountry,
    setSelectedCountry,
    zoomScale,
    setZoomScale,
  };
}
