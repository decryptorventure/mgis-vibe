// ============================
// Central Mock Data Store for NMS Prototype
// ============================

export interface Project {
  id: string;
  name: string;
  package: string;
  os: 'ios' | 'android';
  icon: string;
  status: 'Running' | 'Error' | 'Stop' | 'Update Required';
  spend: number;
  installs: number;
  roas: number;
  networks: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  network: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED' | 'ERROR';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  installs: number;
  cpa: number;
  roas: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  costCenter?: string;
}

export interface AdSet {
  id: string;
  name: string;
  campaignId: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  budget: number;
  spend: number;
  targeting: string;
  impressions: number;
  clicks: number;
  installs: number;
}

export interface Ad {
  id: string;
  name: string;
  adSetId: string;
  campaignId: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'REJECTED';
  type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'PLAYABLE';
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  creativeName: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  size: string;
  dimensions: string;
  uploadedBy: string;
  uploadedAt: string;
  projectId: string;
  network: string;
  status: 'READY' | 'PROCESSING' | 'ERROR';
  spend?: number;
  installs?: number;
  ctr?: number;
  ipm?: number;
}

export interface UploadTask {
  id: string;
  fileName: string;
  type: 'video' | 'image' | 'creative';
  network: string;
  project: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  uploadedBy: string;
}

export interface ChangeLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  timestamp: string;
  network: string;
  project: string;
  details: string;
  before?: string;
  after?: string;
  channel?: string;
}

export interface NetworkRule {
  id: string;
  name: string;
  network: string;
  conditionKey: string;
  conditionParam: number;
  conditionParamExtra?: string;
  actionKey: string;
  actionParam?: number;
  scheduleMinutes: 15 | 60 | 1440;
  status: 'active' | 'paused';
  lastTriggered?: string;
  triggerCount: number;
  // Legacy display fields kept for backward compat
  projects?: string[];
  bidType?: string;
  dayTarget?: string;
  minPercent?: number;
  maxPercent?: number;
  targetCountryOption?: 'all' | 'specific';
  targetCountries?: string[];
}

export interface VaultKey {
  id: string;
  network: string;
  keyType: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
  lastVerified: string;
  expiresAt?: string;
  owner: string;
  project: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  timestamp: string;
  link?: string;
}

// ============================
// Mock Data
// ============================

export const mockUser: User = {
  id: 'u1',
  name: 'Nguyễn Việt Dũng',
  email: 'dungnv@ikameglobal.com',
  role: 'Fullstack Developer',
  avatar: 'D',
  color: '#ff4f0a',
};

export const mockProjects: Project[] = [
  { id: 'p1', name: 'iG_Hot_Pot_IOS', package: '6754552669', os: 'ios', icon: 'I', status: 'Running', spend: 21940, installs: 30800, roas: 3.4, networks: ['meta', 'google-ads', 'moloco'] },
  { id: 'p2', name: 'iG_Hot_Pot', package: 'com.ig.hot.pot', os: 'android', icon: 'I', status: 'Error', spend: 2400, installs: 2300, roas: 1.6, networks: ['google-ads', 'meta', 'moloco'] },
  { id: 'p3', name: 'Clean_Android', package: 'com.aicleaner.clean', os: 'android', icon: 'C', status: 'Stop', spend: 0, installs: 0, roas: 0, networks: [] },
  { id: 'p4', name: 'AI_Home_ios', package: '6754923194', os: 'ios', icon: 'A', status: 'Update Required', spend: 2300, installs: 3700, roas: 3.6, networks: ['asa'] },
  { id: 'p5', name: 'DramaOn', package: 'com.begamob.drama', os: 'android', icon: 'D', status: 'Running', spend: 8500, installs: 14000, roas: 3.5, networks: ['axon'] },
];

export const mockCampaigns: Campaign[] = [
  { id: 'c1', name: 'US_iOS_Search_Brand', network: 'google-ads', status: 'ACTIVE', budget: 5000, spend: 3240, impressions: 450000, clicks: 12500, installs: 3200, cpa: 1.01, roas: 2.8, createdAt: '2026-05-01', updatedAt: '2026-06-04', projectId: 'p1', costCenter: 'UA Team' },
  { id: 'c2', name: 'US_iOS_UAC_Perf', network: 'google-ads', status: 'ACTIVE', budget: 8000, spend: 6100, impressions: 890000, clicks: 24000, installs: 8500, cpa: 0.72, roas: 3.5, createdAt: '2026-05-10', updatedAt: '2026-06-04', projectId: 'p1', costCenter: 'UA Team' },
  { id: 'c3', name: 'JP_Android_Display', network: 'google-ads', status: 'PAUSED', budget: 3000, spend: 1200, impressions: 210000, clicks: 5600, installs: 1100, cpa: 1.09, roas: 1.9, createdAt: '2026-04-20', updatedAt: '2026-06-01', projectId: 'p2', costCenter: 'Growth Team' },
  { id: 'c4', name: 'Meta_US_LAL_Install', network: 'meta', status: 'ACTIVE', budget: 10000, spend: 7800, impressions: 1200000, clicks: 35000, installs: 12000, cpa: 0.65, roas: 4.1, createdAt: '2026-05-15', updatedAt: '2026-06-04', projectId: 'p1', costCenter: 'UA Team' },
  { id: 'c5', name: 'Meta_KR_AEO_Purchase', network: 'meta', status: 'ACTIVE', budget: 6000, spend: 4200, impressions: 680000, clicks: 18000, installs: 5500, cpa: 0.76, roas: 3.2, createdAt: '2026-05-20', updatedAt: '2026-06-04', projectId: 'p1', costCenter: 'Growth Team' },
  { id: 'c6', name: 'Meta_JP_VO_Install', network: 'meta', status: 'DRAFT', budget: 4000, spend: 0, impressions: 0, clicks: 0, installs: 0, cpa: 0, roas: 0, createdAt: '2026-06-03', updatedAt: '2026-06-03', projectId: 'p2', costCenter: 'Brand Team' },
  { id: 'c7', name: 'ASA_US_Brand_Exact', network: 'asa', status: 'ACTIVE', budget: 2000, spend: 1500, impressions: 120000, clicks: 8000, installs: 2800, cpa: 0.54, roas: 5.2, createdAt: '2026-05-05', updatedAt: '2026-06-04', projectId: 'p4', costCenter: 'Brand Team' },
  { id: 'c8', name: 'ASA_JP_Discovery', network: 'asa', status: 'PAUSED', budget: 1500, spend: 800, impressions: 65000, clicks: 3200, installs: 900, cpa: 0.89, roas: 2.1, createdAt: '2026-05-18', updatedAt: '2026-06-02', projectId: 'p4', costCenter: 'Brand Team' },
  { id: 'c9', name: 'Axon_US_CPI_Video', network: 'axon', status: 'ACTIVE', budget: 7000, spend: 5400, impressions: 950000, clicks: 28000, installs: 9200, cpa: 0.59, roas: 3.8, createdAt: '2026-05-12', updatedAt: '2026-06-04', projectId: 'p5', costCenter: 'UA Team' },
  { id: 'c10', name: 'Axon_KR_CPA_Playable', network: 'axon', status: 'ACTIVE', budget: 4500, spend: 3100, impressions: 520000, clicks: 15000, installs: 4800, cpa: 0.65, roas: 3.1, createdAt: '2026-05-22', updatedAt: '2026-06-04', projectId: 'p5', costCenter: 'Growth Team' },
  { id: 'c11', name: 'Moloco_US_ROAS', network: 'moloco', status: 'ACTIVE', budget: 6000, spend: 4800, impressions: 780000, clicks: 22000, installs: 7100, cpa: 0.68, roas: 3.6, createdAt: '2026-05-25', updatedAt: '2026-06-04', projectId: 'p1', costCenter: 'Growth Team' },
  { id: 'c12', name: 'Moloco_JP_Install', network: 'moloco', status: 'ERROR', budget: 3500, spend: 1200, impressions: 180000, clicks: 4500, installs: 1200, cpa: 1.0, roas: 1.5, createdAt: '2026-05-28', updatedAt: '2026-06-03', projectId: 'p2', costCenter: 'Brand Team' },
];

export const mockAdSets: AdSet[] = [
  { id: 'as1', name: 'US_18-45_LAL_1%', campaignId: 'c4', status: 'ACTIVE', budget: 5000, spend: 3900, targeting: 'Lookalike 1% - US - 18-45', impressions: 600000, clicks: 17000, installs: 6000 },
  { id: 'as2', name: 'US_25-55_Interest', campaignId: 'c4', status: 'ACTIVE', budget: 5000, spend: 3900, targeting: 'Interest: Gaming, Casual - US - 25-55', impressions: 600000, clicks: 18000, installs: 6000 },
  { id: 'as3', name: 'KR_18-35_Broad', campaignId: 'c5', status: 'ACTIVE', budget: 3000, spend: 2100, targeting: 'Broad - KR - 18-35', impressions: 340000, clicks: 9000, installs: 2800 },
  { id: 'as4', name: 'KR_18-35_LAL_3%', campaignId: 'c5', status: 'PAUSED', budget: 3000, spend: 2100, targeting: 'Lookalike 3% - KR - 18-35', impressions: 340000, clicks: 9000, installs: 2700 },
];

export const mockAds: Ad[] = [
  { id: 'ad1', name: 'Video_30s_Gameplay_v1', adSetId: 'as1', campaignId: 'c4', status: 'ACTIVE', type: 'VIDEO', impressions: 300000, clicks: 8500, installs: 3000, spend: 1950, creativeName: 'gameplay_30s_v1.mp4' },
  { id: 'ad2', name: 'Image_Banner_1200x628', adSetId: 'as1', campaignId: 'c4', status: 'ACTIVE', type: 'IMAGE', impressions: 300000, clicks: 8500, installs: 3000, spend: 1950, creativeName: 'banner_1200x628.png' },
  { id: 'ad3', name: 'Carousel_Features_5img', adSetId: 'as2', campaignId: 'c4', status: 'PAUSED', type: 'CAROUSEL', impressions: 250000, clicks: 7000, installs: 2400, spend: 1600, creativeName: 'carousel_features' },
  { id: 'ad4', name: 'Playable_Demo_v2', adSetId: 'as3', campaignId: 'c5', status: 'ACTIVE', type: 'PLAYABLE', impressions: 170000, clicks: 4500, installs: 1400, spend: 1050, creativeName: 'playable_demo_v2.html' },
  { id: 'ad5', name: 'Video_15s_Highlight', adSetId: 'as4', campaignId: 'c5', status: 'REJECTED', type: 'VIDEO', impressions: 0, clicks: 0, installs: 0, spend: 0, creativeName: 'highlight_15s.mp4' },
];

export const mockMediaItems: MediaItem[] = [
  { id: 'm1', name: 'gameplay_30s_v1.mp4', type: 'video', url: '', thumbnail: '', size: '12.4 MB', dimensions: '1920x1080', uploadedBy: 'Trần Đức Trọng', uploadedAt: '2026-05-28', projectId: 'p1', network: 'meta', status: 'READY', spend: 4500, installs: 8200, ctr: 2.1, ipm: 8.5 },
  { id: 'm2', name: 'banner_1200x628.png', type: 'image', url: '', thumbnail: '', size: '245 KB', dimensions: '1200x628', uploadedBy: 'Trần Đức Trọng', uploadedAt: '2026-05-29', projectId: 'p1', network: 'meta', status: 'READY', spend: 1200, installs: 1500, ctr: 1.2, ipm: 3.2 },
  { id: 'm3', name: 'playable_demo_v2.html', type: 'video', url: '', thumbnail: '', size: '3.8 MB', dimensions: '1080x1920', uploadedBy: 'Phạm Khánh Toàn', uploadedAt: '2026-05-30', projectId: 'p5', network: 'axon', status: 'READY', spend: 3800, installs: 9100, ctr: 3.4, ipm: 12.1 },
  { id: 'm4', name: 'intro_60s_jp.mp4', type: 'video', url: '', thumbnail: '', size: '24.1 MB', dimensions: '1920x1080', uploadedBy: 'Mạc Văn Hiệp', uploadedAt: '2026-06-01', projectId: 'p2', network: 'google-ads', status: 'PROCESSING', spend: 0, installs: 0, ctr: 0, ipm: 0 },
  { id: 'm5', name: 'icon_app_512.png', type: 'image', url: '', thumbnail: '', size: '89 KB', dimensions: '512x512', uploadedBy: 'Đặng Thị Bắc', uploadedAt: '2026-06-02', projectId: 'p4', network: 'asa', status: 'READY', spend: 850, installs: 400, ctr: 0.8, ipm: 1.5 },
  { id: 'm6', name: 'endcard_landscape.png', type: 'image', url: '', thumbnail: '', size: '320 KB', dimensions: '1920x1080', uploadedBy: 'Tô Đình Tùng', uploadedAt: '2026-06-03', projectId: 'p1', network: 'moloco', status: 'ERROR', spend: 0, installs: 0, ctr: 0, ipm: 0 },
];

export const mockUploadTasks: UploadTask[] = [
  { id: 'ut1', fileName: 'gameplay_30s_v1.mp4', type: 'video', network: 'Meta', project: 'iG_Hot_Pot_IOS', status: 'COMPLETED', progress: 100, createdAt: '2026-06-04 09:12:00', completedAt: '2026-06-04 09:14:23', uploadedBy: 'Trần Đức Trọng' },
  { id: 'ut2', fileName: 'intro_60s_jp.mp4', type: 'video', network: 'Google Ads', project: 'iG_Hot_Pot', status: 'PROCESSING', progress: 67, createdAt: '2026-06-04 10:05:00', uploadedBy: 'Mạc Văn Hiệp' },
  { id: 'ut3', fileName: 'banner_set_kr.zip', type: 'creative', network: 'Meta', project: 'iG_Hot_Pot_IOS', status: 'QUEUED', progress: 0, createdAt: '2026-06-04 10:30:00', uploadedBy: 'Phạm Khánh Toàn' },
  { id: 'ut4', fileName: 'endcard_landscape.png', type: 'image', network: 'Moloco', project: 'iG_Hot_Pot_IOS', status: 'FAILED', progress: 45, createdAt: '2026-06-04 08:50:00', error: 'File size exceeds Moloco limit (5MB max)', uploadedBy: 'Tô Đình Tùng' },
  { id: 'ut5', fileName: 'playable_v3.html', type: 'creative', network: 'Axon', project: 'DramaOn', status: 'PROCESSING', progress: 82, createdAt: '2026-06-04 09:45:00', uploadedBy: 'Trần Đức Trọng' },
  { id: 'ut6', fileName: 'video_highlight_15s.mp4', type: 'video', network: 'Meta', project: 'iG_Hot_Pot_IOS', status: 'COMPLETED', progress: 100, createdAt: '2026-06-04 07:20:00', completedAt: '2026-06-04 07:21:45', uploadedBy: 'Đặng Thị Bắc' },
];

export const mockChangeLogs: ChangeLog[] = [
  { id: 'cl1', action: 'UPDATE_STATUS', entity: 'Campaign', entityId: 'c3', user: 'Trần Đức Trọng', timestamp: '2026-06-04 10:30:00', network: 'Google Ads', project: 'iG_Hot_Pot', details: 'Campaign status changed', before: 'ACTIVE', after: 'PAUSED', channel: 'slack' },
  { id: 'cl2', action: 'UPDATE_BUDGET', entity: 'Campaign', entityId: 'c4', user: 'Phạm Khánh Toàn', timestamp: '2026-06-04 10:15:00', network: 'Meta', project: 'iG_Hot_Pot_IOS', details: 'Daily budget increased', before: '$8,000', after: '$10,000', channel: 'slack' },
  { id: 'cl3', action: 'CREATE', entity: 'AdSet', entityId: 'as4', user: 'Mạc Văn Hiệp', timestamp: '2026-06-04 09:45:00', network: 'Meta', project: 'iG_Hot_Pot_IOS', details: 'New ad set created: KR_18-35_LAL_3%', channel: 'system' },
  { id: 'cl4', action: 'DUPLICATE', entity: 'Campaign', entityId: 'c9', user: 'Trần Đức Trọng', timestamp: '2026-06-04 09:20:00', network: 'Axon', project: 'DramaOn', details: 'Campaign duplicated from Axon_US_CPI_Video', channel: 'slack' },
  { id: 'cl5', action: 'UPLOAD', entity: 'Creative', entityId: 'm1', user: 'Đặng Thị Bắc', timestamp: '2026-06-04 09:10:00', network: 'Meta', project: 'iG_Hot_Pot_IOS', details: 'Video uploaded: gameplay_30s_v1.mp4', channel: 'system' },
  { id: 'cl6', action: 'UPDATE_BID', entity: 'AdGroup', entityId: 'ag1', user: 'Tô Đình Tùng', timestamp: '2026-06-04 08:50:00', network: 'Google Ads', project: 'iG_Hot_Pot_IOS', details: 'Target CPA bid adjusted', before: '$0.80', after: '$0.65', channel: 'slack' },
  { id: 'cl7', action: 'PUBLISH', entity: 'Campaign', entityId: 'c11', user: 'Phạm Khánh Toàn', timestamp: '2026-06-04 08:30:00', network: 'Moloco', project: 'iG_Hot_Pot_IOS', details: 'Campaign published to Moloco', channel: 'slack' },
  { id: 'cl8', action: 'DELETE', entity: 'Ad', entityId: 'ad_old', user: 'Mạc Văn Hiệp', timestamp: '2026-06-04 08:10:00', network: 'Meta', project: 'iG_Hot_Pot', details: 'Underperforming ad removed', channel: 'system' },
];

export const mockNetworkRules: NetworkRule[] = [
  {
    id: 'nr1',
    name: 'Auto-pause high CPA campaigns',
    network: 'Meta',
    conditionKey: 'cpa_gt',
    conditionParam: 2.00,
    actionKey: 'pause_campaign',
    scheduleMinutes: 60,
    status: 'active',
    lastTriggered: '2026-06-03 14:00:00',
    triggerCount: 5,
    projects: ['iG_Hot_Pot_IOS'],
    targetCountryOption: 'all',
  },
  {
    id: 'nr2',
    name: 'Budget increase on good ROAS',
    network: 'Google Ads',
    conditionKey: 'budget_pct_gt',
    conditionParam: 80,
    actionKey: 'increase_budget',
    actionParam: 20,
    scheduleMinutes: 1440,
    status: 'active',
    lastTriggered: '2026-06-04 06:00:00',
    triggerCount: 3,
    projects: ['iG_Hot_Pot_IOS', 'iG_Hot_Pot'],
    targetCountryOption: 'specific',
    targetCountries: ['US', 'CA', 'GB'],
  },
  {
    id: 'nr3',
    name: 'Low ROAS scale down',
    network: 'ASA',
    conditionKey: 'roas_lt',
    conditionParam: 1.5,
    actionKey: 'decrease_budget',
    actionParam: 15,
    scheduleMinutes: 1440,
    status: 'paused',
    triggerCount: 1,
    projects: ['AI_Home_ios'],
    targetCountryOption: 'all',
  },
  {
    id: 'nr4',
    name: 'Axon country bid optimize',
    network: 'Axon',
    conditionKey: 'country_bid_cpa_gt',
    conditionParam: 1.00,
    actionKey: 'adjust_country_bid',
    actionParam: -10,
    scheduleMinutes: 1440,
    status: 'active',
    lastTriggered: '2026-06-03 08:00:00',
    triggerCount: 2,
    projects: ['DramaOn'],
    targetCountryOption: 'specific',
    targetCountries: ['Tier 1', 'Tier 2'],
  },
  {
    id: 'nr5',
    name: 'Meta frequency cap pause',
    network: 'Meta',
    conditionKey: 'frequency_gt',
    conditionParam: 3.5,
    actionKey: 'pause_campaign',
    scheduleMinutes: 60,
    status: 'active',
    triggerCount: 0,
    projects: ['iG_Hot_Pot_IOS'],
    targetCountryOption: 'all',
  },
  {
    id: 'nr6',
    name: 'Moloco blocked publisher alert',
    network: 'Moloco',
    conditionKey: 'blocked_publisher_pct_gt',
    conditionParam: 20,
    actionKey: 'send_alert',
    scheduleMinutes: 60,
    status: 'active',
    triggerCount: 1,
    projects: ['iG_Hot_Pot_IOS'],
    targetCountryOption: 'all',
  },
];

export const mockVaultKeys: VaultKey[] = [
  { id: 'vk1', network: 'Meta', keyType: 'System User Token', status: 'VALID', lastVerified: '2026-06-04 06:00:00', expiresAt: '2026-08-15', owner: 'Backend Service', project: 'All Projects' },
  { id: 'vk2', network: 'Google Ads', keyType: 'OAuth Refresh Token', status: 'VALID', lastVerified: '2026-06-04 06:00:00', owner: 'Trần Đức Trọng', project: 'iG_Hot_Pot_IOS' },
  { id: 'vk3', network: 'ASA', keyType: 'API Certificate', status: 'EXPIRING_SOON', lastVerified: '2026-06-04 06:00:00', expiresAt: '2026-06-15', owner: 'Backend Service', project: 'AI_Home_ios' },
  { id: 'vk4', network: 'Axon', keyType: 'API Key', status: 'VALID', lastVerified: '2026-06-04 06:00:00', owner: 'Backend Service', project: 'DramaOn' },
  { id: 'vk5', network: 'Moloco', keyType: 'API Credential', status: 'EXPIRED', lastVerified: '2026-06-01 06:00:00', expiresAt: '2026-06-01', owner: 'Backend Service', project: 'iG_Hot_Pot' },
  { id: 'vk6', network: 'YouTube', keyType: 'OAuth Token', status: 'VALID', lastVerified: '2026-06-04 06:00:00', owner: 'Mạc Văn Hiệp', project: 'All Projects' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Upload Complete', message: 'gameplay_30s_v1.mp4 uploaded to Meta successfully', type: 'success', read: false, timestamp: '2026-06-04 10:14:23' },
  { id: 'n2', title: 'Campaign Published', message: 'Moloco_US_ROAS published successfully', type: 'success', read: false, timestamp: '2026-06-04 10:00:00' },
  { id: 'n3', title: 'Upload Failed', message: 'endcard_landscape.png failed: File size exceeds limit', type: 'error', read: false, timestamp: '2026-06-04 09:50:00' },
  { id: 'n4', title: 'Key Expiring Soon', message: 'ASA API Certificate for AI_Home_ios expires in 11 days', type: 'warning', read: true, timestamp: '2026-06-04 06:00:00' },
  { id: 'n5', title: 'Rule Triggered', message: 'Auto-pause rule activated for Meta campaign (CPA > $2.00)', type: 'info', read: true, timestamp: '2026-06-03 14:00:00' },
];

// Helper to get network display info
export const networkConfig: Record<string, { label: string; color: string; bg: string }> = {
  'google-ads': { label: 'Google Ads', color: '#4285f4', bg: '#e8f0fe' },
  'meta': { label: 'Meta', color: '#1877f2', bg: '#e7f3ff' },
  'asa': { label: 'Apple Search Ads', color: '#000000', bg: '#f5f5f5' },
  'axon': { label: 'Axon / AppLovin', color: '#8b5cf6', bg: '#ede9fe' },
  'moloco': { label: 'Moloco', color: '#ec4899', bg: '#fce7f3' },
};

export const statusConfig: Record<string, { color: string; bg: string }> = {
  'ACTIVE': { color: '#16a34a', bg: '#dcfce7' },
  'PAUSED': { color: '#ca8a04', bg: '#fef9c3' },
  'DRAFT': { color: '#6b7280', bg: '#f3f4f6' },
  'COMPLETED': { color: '#2563eb', bg: '#dbeafe' },
  'ERROR': { color: '#dc2626', bg: '#fee2e2' },
  'REJECTED': { color: '#dc2626', bg: '#fee2e2' },
  'QUEUED': { color: '#6b7280', bg: '#f3f4f6' },
  'PROCESSING': { color: '#2563eb', bg: '#dbeafe' },
  'FAILED': { color: '#dc2626', bg: '#fee2e2' },
  'VALID': { color: '#16a34a', bg: '#dcfce7' },
  'EXPIRING_SOON': { color: '#ca8a04', bg: '#fef9c3' },
  'EXPIRED': { color: '#dc2626', bg: '#fee2e2' },
  'REVOKED': { color: '#6b7280', bg: '#f3f4f6' },
};

// ============================
// Network-Specific Interfaces
// ============================

export interface GoogleAssetGroup {
  id: string;
  campaignId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  headlines: string[];
  descriptions: string[];
  images: { name: string; size: string; ratio: string }[];
  videos: { name: string; youtubeUrl: string; thumbnail: string }[];
  html5: { name: string; size: string }[];
  spend: number;
  installs: number;
  roas: number;
}

export interface AsaKeyword {
  id: string;
  campaignId: string;
  adGroupId: string;
  keywordText: string;
  matchType: 'EXACT' | 'BROAD';
  status: 'ACTIVE' | 'PAUSED';
  bid: number;
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  cpa: number;
  roas: number;
}

export interface AsaSearchTerm {
  id: string;
  campaignId: string;
  adGroupId: string;
  queryText: string;
  matchType: 'EXACT' | 'BROAD';
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  cpa: number;
  roas: number;
}

export interface AsaNegativeKeyword {
  id: string;
  campaignId: string;
  adGroupId: string;
  keywordText: string;
  matchType: 'EXACT' | 'BROAD';
  status: 'ACTIVE';
  createdAt: string;
}

export interface AxonCountryBid {
  id: string;
  campaignId: string;
  countryCode: string;
  countryName: string;
  status: 'ACTIVE' | 'PAUSED';
  baseBid: number;
  actualCpa: number;
  targetCpa: number;
  actualRoas: number;
  targetRoas: number;
  spend: number;
  installs: number;
  recommendation?: {
    action: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
    percent: number;
    reason: string;
  };
}

export interface MolocoPublisher {
  id: string;
  campaignId: string;
  appName: string;
  bundleId: string;
  os: 'ios' | 'android';
  spend: number;
  installs: number;
  cpa: number;
  roas: number;
  status: 'ALLOWED' | 'BLOCKED';
}

export interface MolocoExchange {
  id: string;
  name: string;
  status: 'ENABLED' | 'DISABLED';
}

// ============================
// Network-Specific Mock Data
// ============================

export const mockGoogleAssetGroups: GoogleAssetGroup[] = [
  {
    id: 'gag1',
    campaignId: 'c1',
    name: 'Asset Group — US Search Brand v1',
    status: 'ACTIVE',
    headlines: ['Hot Pot Story Restaurant', 'Best Hot Pot Game 2026', 'Play Hot Pot Story Now'],
    descriptions: ['Manage your own Hot Pot Restaurant. Cook delicious dishes, serve customers and decorate your store!', 'Download the most addictive cooking simulation game of the year. Free to play on iOS.'],
    images: [
      { name: 'promo_banner_1200x628.png', size: '254 KB', ratio: '1.91:1' },
      { name: 'gameplay_square_1080x1080.png', size: '412 KB', ratio: '1:1' },
    ],
    videos: [
      { name: 'Hot Pot Story Trailer', youtubeUrl: 'https://youtube.com/watch?v=mock1', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg' }
    ],
    html5: [
      { name: 'playable_mini_game.zip', size: '820 KB' }
    ],
    spend: 1800,
    installs: 2100,
    roas: 3.1
  },
  {
    id: 'gag2',
    campaignId: 'c2',
    name: 'Asset Group — iOS Install June',
    status: 'ACTIVE',
    headlines: ['Hot Pot Fever!', 'Cooking Tycoon Game', 'Delicious Recipes', 'Design Your Restaurant', 'Cook & Serve'],
    descriptions: ['Can you run the best Hot Pot place in town? Cook delicious food and hire cute staff!', 'Build your restaurant empire in this fun idle game. Start cooking now!'],
    images: [
      { name: 'feature_graphic.png', size: '512 KB', ratio: '1.91:1' },
      { name: 'ss_cooking_1.png', size: '320 KB', ratio: '16:9' },
      { name: 'ss_store_2.png', size: '298 KB', ratio: '16:9' }
    ],
    videos: [
      { name: 'Gameplay Showcase 30s', youtubeUrl: 'https://youtube.com/watch?v=mock2', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/1.jpg' },
      { name: 'Funny Ads Animation 15s', youtubeUrl: 'https://youtube.com/watch?v=mock3', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/2.jpg' }
    ],
    html5: [],
    spend: 4200,
    installs: 5900,
    roas: 3.8
  }
];

export const mockAsaKeywords: AsaKeyword[] = [
  { id: 'ak1', campaignId: 'c7', adGroupId: 'ag1', keywordText: 'hot pot story', matchType: 'EXACT', status: 'ACTIVE', bid: 1.50, impressions: 50000, clicks: 4200, installs: 1800, spend: 950, cpa: 0.53, roas: 5.8 },
  { id: 'ak2', campaignId: 'c7', adGroupId: 'ag1', keywordText: 'cooking game', matchType: 'EXACT', status: 'ACTIVE', bid: 0.85, impressions: 35000, clicks: 1800, installs: 550, spend: 320, cpa: 0.58, roas: 4.2 },
  { id: 'ak3', campaignId: 'c7', adGroupId: 'ag1', keywordText: 'restaurant simulation', matchType: 'BROAD', status: 'ACTIVE', bid: 0.65, impressions: 20000, clicks: 1100, installs: 290, spend: 150, cpa: 0.52, roas: 3.9 },
  { id: 'ak4', campaignId: 'c7', adGroupId: 'ag1', keywordText: 'idle kitchen', matchType: 'EXACT', status: 'PAUSED', bid: 0.70, impressions: 15000, clicks: 900, installs: 160, spend: 80, cpa: 0.50, roas: 3.5 },
];

export const mockAsaSearchTerms: AsaSearchTerm[] = [
  { id: 'ast1', campaignId: 'c7', adGroupId: 'ag1', queryText: 'hot pot game restaurant', matchType: 'BROAD', impressions: 12000, clicks: 950, installs: 380, spend: 180, cpa: 0.47, roas: 6.2 },
  { id: 'ast2', campaignId: 'c7', adGroupId: 'ag1', queryText: 'my hotpot story codes', matchType: 'BROAD', impressions: 8500, clicks: 640, installs: 120, spend: 110, cpa: 0.92, roas: 2.1 },
  { id: 'ast3', campaignId: 'c7', adGroupId: 'ag1', queryText: 'chinese cooking game', matchType: 'BROAD', impressions: 6400, clicks: 410, installs: 150, spend: 75, cpa: 0.50, roas: 4.8 },
  { id: 'ast4', campaignId: 'c7', adGroupId: 'ag1', queryText: 'cheat hotpot story ios', matchType: 'BROAD', impressions: 3100, clicks: 250, installs: 15, spend: 45, cpa: 3.00, roas: 0.5 },
  { id: 'ast5', campaignId: 'c7', adGroupId: 'ag1', queryText: 'restaurant design 3d', matchType: 'BROAD', impressions: 9800, clicks: 310, installs: 40, spend: 90, cpa: 2.25, roas: 1.1 },
];

export const mockAsaNegativeKeywords: AsaNegativeKeyword[] = [
  { id: 'ank1', campaignId: 'c7', adGroupId: 'ag1', keywordText: 'free cheat', matchType: 'EXACT', status: 'ACTIVE', createdAt: '2026-05-15' },
  { id: 'ank2', campaignId: 'c7', adGroupId: 'ag1', keywordText: 'hacked game', matchType: 'BROAD', status: 'ACTIVE', createdAt: '2026-05-20' },
];

export const mockAxonCountryBids: AxonCountryBid[] = [
  { id: 'acb1', campaignId: 'c9', countryCode: 'US', countryName: 'United States', status: 'ACTIVE', baseBid: 0.85, actualCpa: 0.78, targetCpa: 0.80, actualRoas: 4.1, targetRoas: 3.5, spend: 3200, installs: 4100, recommendation: { action: 'INCREASE', percent: 10, reason: 'ROAS > Target, CPA low. Scale opportunity.' } },
  { id: 'acb2', campaignId: 'c9', countryCode: 'JP', countryName: 'Japan', status: 'ACTIVE', baseBid: 1.20, actualCpa: 1.35, targetCpa: 1.10, actualRoas: 2.8, targetRoas: 3.2, spend: 1100, installs: 810, recommendation: { action: 'DECREASE', percent: 15, reason: 'CPA > Target, ROAS underperforming.' } },
  { id: 'acb3', campaignId: 'c9', countryCode: 'KR', countryName: 'South Korea', status: 'ACTIVE', baseBid: 0.95, actualCpa: 0.92, targetCpa: 0.95, actualRoas: 3.6, targetRoas: 3.5, spend: 850, installs: 920, recommendation: { action: 'MAINTAIN', percent: 0, reason: 'Performance matches targets perfectly.' } },
  { id: 'acb4', campaignId: 'c9', countryCode: 'VN', countryName: 'Vietnam', status: 'PAUSED', baseBid: 0.25, actualCpa: 0.00, targetCpa: 0.20, actualRoas: 0.0, targetRoas: 3.0, spend: 0, installs: 0 },
];

export const mockMolocoPublishers: MolocoPublisher[] = [
  { id: 'mp1', campaignId: 'c11', appName: 'Word Puzzle Fun', bundleId: 'com.word.puzzle.fun', os: 'ios', spend: 1450, installs: 2100, cpa: 0.69, roas: 3.8, status: 'ALLOWED' },
  { id: 'mp2', campaignId: 'c11', appName: 'Bubble Pop Mania', bundleId: 'com.bubble.pop.mania', os: 'ios', spend: 890, installs: 1400, cpa: 0.63, roas: 4.2, status: 'ALLOWED' },
  { id: 'mp3', campaignId: 'c11', appName: 'Cheats & Hacks Store', bundleId: 'com.cheats.hacks.store', os: 'ios', spend: 450, installs: 500, cpa: 0.90, roas: 1.1, status: 'BLOCKED' },
  { id: 'mp4', campaignId: 'c11', appName: 'Solitaire Classic Pro', bundleId: 'com.classic.solitaire.pro', os: 'ios', spend: 1200, installs: 1950, cpa: 0.61, roas: 3.9, status: 'ALLOWED' },
  { id: 'mp5', campaignId: 'c11', appName: 'Flappy Bird Clone', bundleId: 'com.flappyclone.game', os: 'ios', spend: 550, installs: 300, cpa: 1.83, roas: 0.4, status: 'BLOCKED' },
];

export const mockMolocoExchanges: MolocoExchange[] = [
  { id: 'me1', name: 'Google AdMob', status: 'ENABLED' },
  { id: 'me2', name: 'AppLovin MAX', status: 'ENABLED' },
  { id: 'me3', name: 'Unity Ads', status: 'ENABLED' },
  { id: 'me4', name: 'IronSource', status: 'ENABLED' },
  { id: 'me5', name: 'Vungle / Liftoff', status: 'DISABLED' },
];

export interface AutomationRun {
  id: string;
  ruleName: string;
  network: string;
  conditionKey: string;
  conditionParam: number;
  actionKey: string;
  actionParam?: number;
  entity: string;
  status: 'completed' | 'triggered' | 'skipped' | 'error';
  time: string;
}

export const mockAutomationRuns: AutomationRun[] = [
  { id: 'a1', ruleName: 'Budget increase on good ROAS', network: 'Google Ads', conditionKey: 'budget_pct_gt', conditionParam: 80, actionKey: 'increase_budget', actionParam: 20, entity: 'Google_JP_UAC_Perf', status: 'completed', time: '2026-06-04 06:00' },
  { id: 'a2', ruleName: 'Auto-pause high CPA campaigns', network: 'Meta', conditionKey: 'cpa_gt', conditionParam: 2.00, actionKey: 'pause_campaign', entity: 'Meta_US_LAL_Install', status: 'triggered', time: '2026-06-03 14:00' },
  { id: 'a3', ruleName: 'Low ROAS scale down', network: 'ASA', conditionKey: 'roas_lt', conditionParam: 1.5, actionKey: 'decrease_budget', actionParam: 15, entity: 'ASA_US_Brand_Exact', status: 'skipped', time: '2026-06-01 08:00' },
  { id: 'a4', ruleName: 'Axon country bid optimize', network: 'Axon', conditionKey: 'country_bid_cpa_gt', conditionParam: 1.00, actionKey: 'adjust_country_bid', actionParam: -10, entity: 'Axon_US_CPI_Video', status: 'completed', time: '2026-06-03 08:00' },
  { id: 'a5', ruleName: 'Meta frequency cap pause', network: 'Meta', conditionKey: 'frequency_gt', conditionParam: 3.5, actionKey: 'pause_campaign', entity: 'Meta_KR_AEO_Purchase', status: 'triggered', time: '2026-06-04 10:30' },
  { id: 'a6', ruleName: 'Moloco blocked publisher alert', network: 'Moloco', conditionKey: 'blocked_publisher_pct_gt', conditionParam: 20, actionKey: 'send_alert', entity: 'Moloco_US_ROAS', status: 'error', time: '2026-06-04 09:00' },
];

export interface RankData {
  rank: number;
  name: string;
  hash: string;
  total: number;
  create: number;
  update: number;
  pause: number;
  delete: number;
  successRate: number;
}

export const mockRankData: RankData[] = [
  { rank: 1, name: 'duynv', hash: '303bd72c-d4c3-40a2-b91c-728b7762694b', total: 6450, create: 3928, update: 1819, pause: 412, delete: 288, successRate: 100 },
  { rank: 2, name: 'Nguyễn Xuân Thành', hash: '5dbfe34f-ebbe-4e78-9e6b-a25e1df1e6b3', total: 223, create: 81, update: 140, pause: 0, delete: 2, successRate: 100 },
  { rank: 3, name: 'tuannvt', hash: '2c7d35ac-c8b5-47df-bc62-598d1a1bdfd3', total: 187, create: 107, update: 72, pause: 0, delete: 8, successRate: 100 },
  { rank: 4, name: 'vietna', hash: 'c04c84b8-8cc0-4965-ab51-5f891d4e7f8e', total: 132, create: 32, update: 100, pause: 0, delete: 0, successRate: 100 },
  { rank: 5, name: 'thaida', hash: '6d72d71b-8151-44eb-9d18-3a9a7a0bdf45', total: 77, create: 34, update: 22, pause: 21, delete: 0, successRate: 100 },
  { rank: 6, name: 'huyendv', hash: 'c8af5f8f-2566-4c48-8df3-bf7bbf3f4fa8', total: 57, create: 47, update: 10, pause: 0, delete: 0, successRate: 100 },
  { rank: 7, name: 'Tô Vũ Ý Nhi', hash: '6bdb5ff2-2465-48fa-891d-5b8d2d141e6c', total: 11, create: 4, update: 7, pause: 0, delete: 0, successRate: 100 },
];

export interface ActivityLog {
  id: string;
  campaign: string;
  platform: string;
  action: string;
  status: string;
  accountId: string;
  campaignId: string;
  time: string;
  user: string;
}

export const mockActivityLogs: ActivityLog[] = [
  { id: '1', campaign: 'N3_Sexy_Phone_Ver1.3_25-552332_916.mp4', platform: 'META', action: 'CREATE', status: 'SUCCESS', accountId: 'act_2155186641586853', campaignId: '-', time: '11:53 04/06/2026', user: 'duynv' },
  { id: '2', campaign: 'TuanNVT test 20260603 copy', platform: 'META', action: 'CREATE', status: 'SUCCESS', accountId: 'act_2155186641586853', campaignId: '-', time: '11:53 04/06/2026', user: 'tuannvt' },
  { id: '3', campaign: 'N3_Sexy_Phone_Ver1.3_25-552332_916.mp4', platform: 'META', action: 'CREATE', status: 'SUCCESS', accountId: 'act_2155186641586853', campaignId: '-', time: '11:53 04/06/2026', user: 'duynv' },
  { id: '4', campaign: 'Clean_IOS', platform: 'META', action: 'CREATE', status: 'SUCCESS', accountId: 'act_2155186641586853', campaignId: 'd48b39a1-c880-4389-923c-5d64f0fa5a96', time: '11:53 04/06/2026', user: 'duynv' },
  { id: '5', campaign: 'Adset 120251211147490110', platform: 'META', action: 'UPDATE', status: 'SUCCESS', accountId: 'act_2155186641586853', campaignId: '-', time: '11:52 04/06/2026', user: 'Nguyễn Xuân Thành' },
  { id: '6', campaign: 'N3_Sexy_Phone_Ver1.3_25-552332_916.mp4', platform: 'META', action: 'UPDATE', status: 'SUCCESS', accountId: 'act_2531941187142628', campaignId: '-', time: '11:23 04/06/2026', user: 'vietna' },
  { id: '7', campaign: 'Clean_IOS', platform: 'META', action: 'UPDATE', status: 'SUCCESS', accountId: 'act_2531941187142628', campaignId: '991a86c8-873c-4c51-a18d-d180a29ff0dj', time: '11:22 04/06/2026', user: 'thaida' },
  { id: '8', campaign: 'N3_Sexy_Phone_Ver1.3_25-552332_916.mp4', platform: 'META', action: 'UPDATE', status: 'SUCCESS', accountId: 'act_2531941187142628', campaignId: '-', time: '11:21 04/06/2026', user: 'huyendv' },
  { id: '9', campaign: 'N3_Sexy_Phone_Ver1.3_25-552332_916.mp4', platform: 'META', action: 'UPDATE', status: 'SUCCESS', accountId: 'act_2531941187142628', campaignId: '-', time: '11:21 04/06/2026', user: 'Tô Vũ Ý Nhi' },
  { id: '10', campaign: 'Clean_IOS', platform: 'META', action: 'UPDATE', status: 'SUCCESS', accountId: 'act_2531941187142628', campaignId: '991a86c8-873c-4c51-a18d-d180a29ff0dj', time: '11:21 04/06/2026', user: 'thaida' },
];

// ============================
// NEW: Google Ads Extended
// ============================

export interface GoogleBiddingStrategy {
  id: string;
  campaignId: string;
  type: 'TARGET_CPA' | 'TARGET_ROAS' | 'MAXIMIZE_INSTALLS';
  targetValue: number;
  actualValue: number;
  dailyBudget: number;
  spentToday: number;
  status: 'LEARNING' | 'OPTIMIZED' | 'LIMITED';
  lastUpdated: string;
}

export interface GoogleConversionEvent {
  id: string;
  eventName: string;
  sdkEvent: string;
  source: 'Firebase' | 'AppsFlyer' | 'Adjust';
  attributionWindow: '1d' | '7d' | '30d';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  conversionCount: number;
  conversionValue: number;
  isPrimary: boolean;
}

export const mockGoogleBiddingStrategies: GoogleBiddingStrategy[] = [
  { id: 'gbs1', campaignId: 'c1', type: 'TARGET_CPA', targetValue: 1.00, actualValue: 1.01, dailyBudget: 5000, spentToday: 3240, status: 'OPTIMIZED', lastUpdated: '2026-06-04' },
  { id: 'gbs2', campaignId: 'c2', type: 'TARGET_ROAS', targetValue: 3.0, actualValue: 3.5, dailyBudget: 8000, spentToday: 6100, status: 'OPTIMIZED', lastUpdated: '2026-06-04' },
  { id: 'gbs3', campaignId: 'c3', type: 'MAXIMIZE_INSTALLS', targetValue: 0, actualValue: 0, dailyBudget: 3000, spentToday: 1200, status: 'LEARNING', lastUpdated: '2026-06-01' },
];

export const mockGoogleConversionEvents: GoogleConversionEvent[] = [
  { id: 'gce1', eventName: 'App Install', sdkEvent: 'first_open', source: 'Firebase', attributionWindow: '30d', status: 'ACTIVE', conversionCount: 12800, conversionValue: 0, isPrimary: true },
  { id: 'gce2', eventName: 'In-App Purchase', sdkEvent: 'in_app_purchase', source: 'Firebase', attributionWindow: '7d', status: 'ACTIVE', conversionCount: 3200, conversionValue: 48500, isPrimary: false },
  { id: 'gce3', eventName: 'Level Complete', sdkEvent: 'level_up', source: 'Firebase', attributionWindow: '7d', status: 'ACTIVE', conversionCount: 8900, conversionValue: 0, isPrimary: false },
  { id: 'gce4', eventName: 'Registration', sdkEvent: 'sign_up', source: 'AppsFlyer', attributionWindow: '1d', status: 'INACTIVE', conversionCount: 1200, conversionValue: 0, isPrimary: false },
  { id: 'gce5', eventName: 'Add to Cart', sdkEvent: 'add_to_cart', source: 'Firebase', attributionWindow: '7d', status: 'PENDING', conversionCount: 0, conversionValue: 0, isPrimary: false },
];

// ============================
// NEW: Meta Extended
// ============================

export interface MetaAudience {
  id: string;
  name: string;
  type: 'CUSTOM' | 'LOOKALIKE' | 'SAVED';
  source?: string;
  lookalikePercent?: number;
  estimatedReach: number;
  status: 'READY' | 'UPDATING' | 'TOO_SMALL';
  spend: number;
  installs: number;
  cpa: number;
  lastUpdated: string;
}

export interface MetaPlacement {
  id: string;
  name: string;
  platform: 'Instagram' | 'Facebook' | 'Messenger' | 'Audience Network';
  format: string;
  spend: number;
  impressions: number;
  clicks: number;
  installs: number;
  cpa: number;
  ctr: number;
  ipm: number;
}

export interface MetaCreativeAsset {
  id: string;
  name: string;
  format: 'VIDEO' | 'IMAGE' | 'CAROUSEL' | 'PLAYABLE';
  ratio: '9:16' | '1:1' | '16:9' | '4:5';
  status: 'ACTIVE' | 'PAUSED' | 'IN_REVIEW' | 'REJECTED';
  advantagePlus: boolean;
  abVariant?: 'A' | 'B' | 'C';
  spend: number;
  impressions: number;
  installs: number;
  ipm: number;
  ctr: number;
  cpa: number;
}

export const mockMetaAudiences: MetaAudience[] = [
  { id: 'ma1', name: 'Purchase 30d LAL 1%', type: 'LOOKALIKE', source: 'Purchase Pixel', lookalikePercent: 1, estimatedReach: 2400000, status: 'READY', spend: 4500, installs: 6200, cpa: 0.73, lastUpdated: '2026-06-03' },
  { id: 'ma2', name: 'All Installers Custom', type: 'CUSTOM', source: 'SDK Events', estimatedReach: 45000, status: 'READY', spend: 2100, installs: 2800, cpa: 0.75, lastUpdated: '2026-06-04' },
  { id: 'ma3', name: 'Gaming Interest Saved', type: 'SAVED', estimatedReach: 8500000, status: 'READY', spend: 3200, installs: 4100, cpa: 0.78, lastUpdated: '2026-06-02' },
  { id: 'ma4', name: 'High-Value LAL 3%', type: 'LOOKALIKE', source: 'Revenue Events', lookalikePercent: 3, estimatedReach: 7200000, status: 'UPDATING', spend: 1800, installs: 2200, cpa: 0.82, lastUpdated: '2026-06-04' },
  { id: 'ma5', name: 'VN Market Broad', type: 'SAVED', estimatedReach: 12000000, status: 'TOO_SMALL', spend: 0, installs: 0, cpa: 0, lastUpdated: '2026-06-01' },
];

export const mockMetaPlacements: MetaPlacement[] = [
  { id: 'mp_1', name: 'Instagram Feed', platform: 'Instagram', format: 'Feed', spend: 12400, impressions: 3200000, clicks: 89000, installs: 2840, cpa: 4.37, ctr: 2.78, ipm: 0.89 },
  { id: 'mp_2', name: 'Instagram Reels', platform: 'Instagram', format: 'Reels', spend: 6200, impressions: 1800000, clicks: 72000, installs: 1540, cpa: 4.03, ctr: 4.00, ipm: 0.86 },
  { id: 'mp_3', name: 'Instagram Stories', platform: 'Instagram', format: 'Stories', spend: 3400, impressions: 950000, clicks: 38000, installs: 820, cpa: 4.15, ctr: 4.00, ipm: 0.86 },
  { id: 'mp_4', name: 'Facebook Feed', platform: 'Facebook', format: 'Feed', spend: 8900, impressions: 2800000, clicks: 67000, installs: 1960, cpa: 4.54, ctr: 2.39, ipm: 0.70 },
  { id: 'mp_5', name: 'Facebook Reels', platform: 'Facebook', format: 'Reels', spend: 2100, impressions: 620000, clicks: 24800, installs: 580, cpa: 3.62, ctr: 4.00, ipm: 0.94 },
  { id: 'mp_6', name: 'Audience Network', platform: 'Audience Network', format: 'Banner/Native', spend: 3100, impressions: 4500000, clicks: 45000, installs: 890, cpa: 3.48, ctr: 1.00, ipm: 0.20 },
  { id: 'mp_7', name: 'Messenger Inbox', platform: 'Messenger', format: 'Inbox', spend: 800, impressions: 280000, clicks: 5600, installs: 170, cpa: 4.71, ctr: 2.00, ipm: 0.61 },
];

export const mockMetaCreativeAssets: MetaCreativeAsset[] = [
  { id: 'mca1', name: 'Gameplay_30s_Vertical', format: 'VIDEO', ratio: '9:16', status: 'ACTIVE', advantagePlus: true, abVariant: 'A', spend: 4500, impressions: 1200000, installs: 3200, ipm: 2.67, ctr: 3.2, cpa: 1.41 },
  { id: 'mca2', name: 'Cooking_Highlights_15s', format: 'VIDEO', ratio: '9:16', status: 'ACTIVE', advantagePlus: true, abVariant: 'B', spend: 3200, impressions: 980000, installs: 2400, ipm: 2.45, ctr: 2.8, cpa: 1.33 },
  { id: 'mca3', name: 'Banner_Restaurant_1200x628', format: 'IMAGE', ratio: '16:9', status: 'ACTIVE', advantagePlus: false, spend: 1800, impressions: 650000, installs: 1100, ipm: 1.69, ctr: 1.5, cpa: 1.64 },
  { id: 'mca4', name: 'Features_Carousel_5img', format: 'CAROUSEL', ratio: '1:1', status: 'PAUSED', advantagePlus: false, abVariant: 'A', spend: 800, impressions: 320000, installs: 480, ipm: 1.50, ctr: 1.2, cpa: 1.67 },
  { id: 'mca5', name: 'Playable_Demo_Kitchen', format: 'PLAYABLE', ratio: '9:16', status: 'IN_REVIEW', advantagePlus: false, spend: 0, impressions: 0, installs: 0, ipm: 0, ctr: 0, cpa: 0 },
  { id: 'mca6', name: 'UGC_Style_TikTok_Remix', format: 'VIDEO', ratio: '9:16', status: 'ACTIVE', advantagePlus: true, abVariant: 'C', spend: 5100, impressions: 1500000, installs: 4200, ipm: 2.80, ctr: 3.8, cpa: 1.21 },
  { id: 'mca7', name: 'Story_Swipe_Up_Banner', format: 'IMAGE', ratio: '9:16', status: 'REJECTED', advantagePlus: false, spend: 0, impressions: 0, installs: 0, ipm: 0, ctr: 0, cpa: 0 },
];

// ============================
// NEW: ASA Extended
// ============================

export interface AsaCreativeSet {
  id: string;
  name: string;
  adGroupId: string;
  screenshots: string[];
  appPreview?: string;
  cppStatus: 'DEFAULT' | 'CUSTOM';
  ttr: number;
  conversionRate: number;
  impressions: number;
  installs: number;
  status: 'ACTIVE' | 'PAUSED';
}

export interface AsaStorefront {
  id: string;
  countryCode: string;
  countryName: string;
  flag: string;
  status: 'ACTIVE' | 'PAUSED' | 'NOT_CONFIGURED';
  spend: number;
  installs: number;
  cpa: number;
  ttr: number;
  impressions: number;
  campaigns: number;
}

export const mockAsaCreativeSets: AsaCreativeSet[] = [
  { id: 'acs1', name: 'Default Screenshots', adGroupId: 'ag1', screenshots: ['gameplay_main.png', 'cooking_scene.png', 'restaurant_decor.png'], cppStatus: 'DEFAULT', ttr: 8.2, conversionRate: 52.4, impressions: 85000, installs: 2100, status: 'ACTIVE' },
  { id: 'acs2', name: 'Cooking Feature Focus', adGroupId: 'ag1', screenshots: ['recipe_list.png', 'cooking_action.png', 'dish_serve.png'], appPreview: 'cooking_preview_15s.mp4', cppStatus: 'CUSTOM', ttr: 11.5, conversionRate: 58.3, impressions: 42000, installs: 1350, status: 'ACTIVE' },
  { id: 'acs3', name: 'Social Features', adGroupId: 'ag1', screenshots: ['multiplayer.png', 'leaderboard.png', 'chat.png'], cppStatus: 'CUSTOM', ttr: 6.8, conversionRate: 41.2, impressions: 18000, installs: 380, status: 'PAUSED' },
];

export const mockAsaStorefronts: AsaStorefront[] = [
  { id: 'asf1', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', status: 'ACTIVE', spend: 1500, installs: 2800, cpa: 0.54, ttr: 9.4, impressions: 120000, campaigns: 3 },
  { id: 'asf2', countryCode: 'JP', countryName: 'Japan', flag: '🇯🇵', status: 'ACTIVE', spend: 800, installs: 900, cpa: 0.89, ttr: 7.2, impressions: 65000, campaigns: 2 },
  { id: 'asf3', countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', status: 'ACTIVE', spend: 420, installs: 520, cpa: 0.81, ttr: 8.1, impressions: 32000, campaigns: 1 },
  { id: 'asf4', countryCode: 'KR', countryName: 'South Korea', flag: '🇰🇷', status: 'PAUSED', spend: 180, installs: 210, cpa: 0.86, ttr: 6.5, impressions: 15000, campaigns: 1 },
  { id: 'asf5', countryCode: 'AU', countryName: 'Australia', flag: '🇦🇺', status: 'ACTIVE', spend: 320, installs: 380, cpa: 0.84, ttr: 7.8, impressions: 24000, campaigns: 1 },
  { id: 'asf6', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', status: 'NOT_CONFIGURED', spend: 0, installs: 0, cpa: 0, ttr: 0, impressions: 0, campaigns: 0 },
];

// ============================
// NEW: Axon Extended
// ============================

export interface AxonCreativePerf {
  id: string;
  name: string;
  format: 'VIDEO' | 'PLAYABLE' | 'BANNER' | 'ENDCARD' | 'NATIVE';
  duration?: string;
  dimensions: string;
  ipm: number;
  ctr: number;
  cvr: number;
  spend: number;
  installs: number;
  aiScore: number;
  sparkLabsOptimized: boolean;
  status: 'ACTIVE' | 'PAUSED' | 'TESTING';
}

export interface AxonROASCohort {
  cohort: 'D0' | 'D1' | 'D3' | 'D7' | 'D14' | 'D28';
  predictedROAS: number;
  actualROAS: number;
  ltv: number;
  retentionRate: number;
  users: number;
}

export const mockAxonCreativePerfs: AxonCreativePerf[] = [
  { id: 'acp1', name: 'Gameplay_30s_Action', format: 'VIDEO', duration: '30s', dimensions: '1080x1920', ipm: 12.4, ctr: 3.8, cvr: 28.5, spend: 2800, installs: 4200, aiScore: 92, sparkLabsOptimized: true, status: 'ACTIVE' },
  { id: 'acp2', name: 'Playable_Kitchen_Demo', format: 'PLAYABLE', dimensions: '1080x1920', ipm: 15.2, ctr: 5.1, cvr: 32.1, spend: 1900, installs: 3100, aiScore: 96, sparkLabsOptimized: true, status: 'ACTIVE' },
  { id: 'acp3', name: 'Banner_320x50_CTA', format: 'BANNER', dimensions: '320x50', ipm: 2.1, ctr: 0.8, cvr: 8.2, spend: 450, installs: 380, aiScore: 45, sparkLabsOptimized: false, status: 'ACTIVE' },
  { id: 'acp4', name: 'Endcard_CTA_Download', format: 'ENDCARD', dimensions: '1080x1920', ipm: 8.5, ctr: 2.4, cvr: 18.9, spend: 1200, installs: 1800, aiScore: 72, sparkLabsOptimized: false, status: 'ACTIVE' },
  { id: 'acp5', name: 'Video_15s_Highlight_v2', format: 'VIDEO', duration: '15s', dimensions: '1080x1920', ipm: 9.8, ctr: 3.2, cvr: 22.4, spend: 680, installs: 950, aiScore: 78, sparkLabsOptimized: true, status: 'TESTING' },
  { id: 'acp6', name: 'Native_Feed_Square', format: 'NATIVE', dimensions: '1200x1200', ipm: 4.3, ctr: 1.5, cvr: 12.6, spend: 320, installs: 420, aiScore: 55, sparkLabsOptimized: false, status: 'PAUSED' },
];

export const mockAxonROASCohorts: AxonROASCohort[] = [
  { cohort: 'D0', predictedROAS: 0.15, actualROAS: 0.18, ltv: 0.11, retentionRate: 100, users: 9200 },
  { cohort: 'D1', predictedROAS: 0.45, actualROAS: 0.52, ltv: 0.31, retentionRate: 68, users: 6256 },
  { cohort: 'D3', predictedROAS: 1.20, actualROAS: 1.35, ltv: 0.80, retentionRate: 45, users: 4140 },
  { cohort: 'D7', predictedROAS: 2.40, actualROAS: 2.65, ltv: 1.58, retentionRate: 32, users: 2944 },
  { cohort: 'D14', predictedROAS: 3.20, actualROAS: 3.45, ltv: 2.05, retentionRate: 24, users: 2208 },
  { cohort: 'D28', predictedROAS: 3.80, actualROAS: 3.80, ltv: 2.26, retentionRate: 18, users: 1656 },
];

// ============================
// NEW: Moloco Extended
// ============================

export interface MolocoCreativeGroup {
  id: string;
  name: string;
  campaignId: string;
  creatives: { name: string; format: 'BANNER' | 'NATIVE' | 'VIDEO' | 'PLAYABLE' | 'RICH_MEDIA'; size: string }[];
  status: 'ACTIVE' | 'PAUSED';
  spend: number;
  impressions: number;
  installs: number;
  ctr: number;
  cvr: number;
}

export interface MolocoExchangePerf {
  id: string;
  name: string;
  status: 'ENABLED' | 'DISABLED';
  spend: number;
  impressions: number;
  installs: number;
  cpa: number;
  winRate: number;
  trafficShare: number;
  avgBidPrice: number;
  fraudScore: number;
}

export interface MolocoMLStats {
  overallWinRate: number;
  avgBidPrice: number;
  predictedCVR: number;
  actualCVR: number;
  bidRequestsDaily: number;
  avgResponseTimeMs: number;
  modelVersion: string;
  lastTrainedAt: string;
  dailyStats: { date: string; winRate: number; cvr: number; spend: number; installs: number }[];
}

export const mockMolocoCreativeGroups: MolocoCreativeGroup[] = [
  { id: 'mcg1', name: 'US_Install_Video_Pack', campaignId: 'c11', creatives: [
    { name: 'gameplay_30s.mp4', format: 'VIDEO', size: '12.4 MB' },
    { name: 'highlight_15s.mp4', format: 'VIDEO', size: '6.2 MB' },
    { name: 'endcard_cta.png', format: 'BANNER', size: '245 KB' },
  ], status: 'ACTIVE', spend: 2800, impressions: 450000, installs: 4100, ctr: 2.8, cvr: 1.46 },
  { id: 'mcg2', name: 'JP_Native_Bundle', campaignId: 'c12', creatives: [
    { name: 'native_icon.png', format: 'NATIVE', size: '89 KB' },
    { name: 'native_banner_1200.png', format: 'NATIVE', size: '320 KB' },
    { name: 'native_video_6s.mp4', format: 'VIDEO', size: '3.1 MB' },
  ], status: 'ACTIVE', spend: 1200, impressions: 180000, installs: 1200, ctr: 1.5, cvr: 0.95 },
  { id: 'mcg3', name: 'KR_Playable_Group', campaignId: 'c11', creatives: [
    { name: 'playable_kitchen.html', format: 'PLAYABLE', size: '3.8 MB' },
    { name: 'rich_media_interactive.zip', format: 'RICH_MEDIA', size: '2.1 MB' },
  ], status: 'PAUSED', spend: 800, impressions: 95000, installs: 650, ctr: 3.2, cvr: 1.85 },
];

export const mockMolocoExchangePerfs: MolocoExchangePerf[] = [
  { id: 'mep1', name: 'Google AdMob', status: 'ENABLED', spend: 1800, impressions: 320000, installs: 2800, cpa: 0.64, winRate: 34.2, trafficShare: 28.5, avgBidPrice: 0.0056, fraudScore: 2.1 },
  { id: 'mep2', name: 'AppLovin MAX', status: 'ENABLED', spend: 1200, impressions: 180000, installs: 1900, cpa: 0.63, winRate: 28.5, trafficShare: 22.1, avgBidPrice: 0.0067, fraudScore: 1.8 },
  { id: 'mep3', name: 'Unity Ads', status: 'ENABLED', spend: 950, impressions: 210000, installs: 1400, cpa: 0.68, winRate: 31.0, trafficShare: 18.4, avgBidPrice: 0.0045, fraudScore: 3.2 },
  { id: 'mep4', name: 'IronSource', status: 'ENABLED', spend: 680, impressions: 140000, installs: 980, cpa: 0.69, winRate: 25.8, trafficShare: 15.2, avgBidPrice: 0.0049, fraudScore: 2.5 },
  { id: 'mep5', name: 'Vungle / Liftoff', status: 'DISABLED', spend: 0, impressions: 0, installs: 0, cpa: 0, winRate: 0, trafficShare: 0, avgBidPrice: 0, fraudScore: 0 },
  { id: 'mep6', name: 'Mintegral', status: 'ENABLED', spend: 420, impressions: 95000, installs: 620, cpa: 0.68, winRate: 22.1, trafficShare: 10.3, avgBidPrice: 0.0044, fraudScore: 4.8 },
  { id: 'mep7', name: 'InMobi', status: 'ENABLED', spend: 250, impressions: 55000, installs: 350, cpa: 0.71, winRate: 19.5, trafficShare: 5.5, avgBidPrice: 0.0045, fraudScore: 3.1 },
];

export const mockMolocoMLStats: MolocoMLStats = {
  overallWinRate: 28.4,
  avgBidPrice: 0.0052,
  predictedCVR: 1.42,
  actualCVR: 1.38,
  bidRequestsDaily: 48500000,
  avgResponseTimeMs: 42,
  modelVersion: 'v3.2.1-prod',
  lastTrainedAt: '2026-06-04 02:00:00',
  dailyStats: [
    { date: '05/29', winRate: 26.8, cvr: 1.32, spend: 680, installs: 980 },
    { date: '05/30', winRate: 27.5, cvr: 1.35, spend: 720, installs: 1050 },
    { date: '05/31', winRate: 28.1, cvr: 1.38, spend: 750, installs: 1100 },
    { date: '06/01', winRate: 27.9, cvr: 1.36, spend: 710, installs: 1020 },
    { date: '06/02', winRate: 28.5, cvr: 1.40, spend: 760, installs: 1120 },
    { date: '06/03', winRate: 29.2, cvr: 1.42, spend: 810, installs: 1180 },
    { date: '06/04', winRate: 28.4, cvr: 1.38, spend: 780, installs: 1150 },
  ],
};

