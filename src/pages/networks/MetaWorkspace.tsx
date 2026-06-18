import React, { useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  DatePicker,
  Drawer,
  Input,
  Modal,
  Popover,
  Progress,
  Radio,
  Select,
  Segmented,
  Switch,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ChevronDown,
  Columns3,
  Copy,
  Edit3,
  FileText,
  Filter,
  Folder,
  GitBranch,
  Layers3,
  Megaphone,
  MoreHorizontal,
  MousePointerClick,
  Palette,
  PanelRightOpen,
  Play,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';
import { Button, Card, cn, toast } from '@frontend-team/ui-kit';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { MetaBulkCreateDrawer } from './meta-bulk-create-drawer';
import type {
  MetaAutomationRun,
  MetaBulkCriteria,
  MetaBulkGenerationResult,
  MetaCreationRecipe,
} from './meta-bulk-generation';
import {
  mockAds,
  mockAdSets,
  mockCampaigns,
  mockProjects,
  type Ad,
  type AdSet,
  type Campaign,
} from '@/shared/mock-data';
import { useParams } from 'react-router-dom';

type MetaEntity = 'campaigns' | 'adsets' | 'ads';
type MetaReportRow = Campaign | AdSet | Ad;
type FilterField = 'entity' | 'status' | 'account';
type FilterOperator = 'is' | 'is not' | 'contains' | 'in';
type MetaColumnKey =
  | 'action'
  | 'entity'
  | 'status'
  | 'account'
  | 'createdAt'
  | 'bidStrategy'
  | 'budget'
  | 'amountSpent'
  | 'resultRoas'
  | 'appInstalls'
  | 'costPerAppInstall'
  | 'cpm'
  | 'results'
  | 'costPerResults'
  | 'ctrAll'
  | 'cpcAll'
  | 'cvrInstall'
  | 'ctrInstall'
  | 'costPerLead'
  | 'leads'
  | 'cvrLeads'
  | 'impression'
  | 'reach'
  | 'frequency'
  | 'completedRegistration'
  | 'costPerCompletedRegistration'
  | 'purchase'
  | 'costPerPurchase'
  | 'linkClicks'
  | 'cpcLinkClick';

interface MetaColumnConfig {
  key: MetaColumnKey;
  label: string;
  width: number;
  fixed?: 'left' | 'right';
  metric?: boolean;
  defaultVisible?: boolean;
}

interface HeatmapColor {
  id: string;
  label: string;
  rgb: string;
}

interface MetaWorkspaceProps {
  network: string;
  networkLabel: string;
}

interface MetaTemplate {
  id: string;
  name: string;
  objective: 'Sales' | 'App promotions';
  age: string;
  attribution: string;
  placements: string[];
}

interface MetaPage {
  id: string;
  name: string;
  instagramId: string;
  status: 'Synced' | 'Needs review';
}

interface DraftCampaign {
  id: string;
  name: string;
  objective: string;
  budget: string;
  updatedAt: string;
  campaignId?: string;
  progress: {
    campaign: number;
    adsets: number;
    creatives: number;
    ads: number;
    campaignTotal?: number;
    adsetsTotal?: number;
    creativesTotal?: number;
    adsTotal?: number;
  };
}

interface FilterRule {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string;
}

interface BuilderContext {
  mode: 'create' | 'edit' | 'draft';
  entity: MetaEntity;
  campaign?: Campaign | null;
  adSet?: AdSet | null;
  ad?: Ad | null;
  draft?: DraftCampaign | null;
}

interface TablePreference {
  visibleKeys: MetaColumnKey[];
  heatmapColors: Partial<Record<MetaColumnKey, string>>;
}

const META_ACCOUNT_OPTIONS = [
  { value: 'act_2155186641586053', label: 'Clean2 - act_2155186641586053' },
  { value: 'act_2531941187142628', label: 'Clean backup - act_2531941187142628' },
];

const META_TEMPLATES: MetaTemplate[] = [
  {
    id: 'tpl-sales-ios',
    name: 'Clean iOS Sales',
    objective: 'Sales',
    age: '18-65',
    attribution: '7d click / 1d view',
    placements: ['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads'],
  },
  {
    id: 'tpl-install-broad',
    name: 'Broad App Install',
    objective: 'App promotions',
    age: '18-55',
    attribution: '7d click',
    placements: ['Facebook', 'Instagram', 'Messenger'],
  },
];

const META_PAGES: MetaPage[] = [
  { id: '105774139182217', name: 'Kai Krypton - Simp for Gadgets', instagramId: '17841459691905085', status: 'Synced' },
  { id: '119426224469734', name: 'Limpiador: Liberar espacio', instagramId: '17841465225860539', status: 'Synced' },
  { id: '110244858724859', name: 'Volume Booster - Begamob Global', instagramId: '17841459088022798', status: 'Synced' },
  { id: '103538695995551', name: 'Word Office - PDF, Word, Excel', instagramId: '17841457868248868', status: 'Needs review' },
  { id: '100458496125693', name: 'Global APP Developer', instagramId: '17841454564501090', status: 'Synced' },
];

const META_DRAFTS: DraftCampaign[] = [
  {
    id: 'draft-1',
    name: 'New Campaign Sales',
    objective: 'Sales',
    budget: '$1 / day',
    updatedAt: '4 days ago',
    progress: { campaign: 1, adsets: 0, creatives: 0, ads: 0 },
  },
  {
    id: 'draft-2',
    name: 'New Campaign Sales Copy',
    objective: 'Sales',
    budget: '$1 / day',
    updatedAt: '4 days ago',
    progress: { campaign: 1, adsets: 0, creatives: 0, ads: 0 },
  },
];

const ENTITY_META: Record<MetaEntity, { title: string; singular: string; createLabel: string; icon: React.ReactNode }> = {
  campaigns: { title: 'CAMPAIGN', singular: 'Campaign', createLabel: 'Create Campaign', icon: <Megaphone size={16} /> },
  adsets: { title: 'ADSET', singular: 'Ad Set', createLabel: 'Create Ad Set', icon: <Layers3 size={16} /> },
  ads: { title: 'ADS', singular: 'Ad', createLabel: 'Create Ad', icon: <PanelRightOpen size={16} /> },
};

const META_REPORT_COLUMNS: MetaColumnConfig[] = [
  { key: 'action', label: 'Action', width: 112, fixed: 'left', defaultVisible: true },
  { key: 'entity', label: 'Campaign', width: 300, fixed: 'left', defaultVisible: true },
  { key: 'status', label: 'Status', width: 120, defaultVisible: true },
  { key: 'account', label: 'Account', width: 160, defaultVisible: true },
  { key: 'createdAt', label: 'Created At', width: 140, defaultVisible: true },
  { key: 'bidStrategy', label: 'Bid Strategy', width: 190, defaultVisible: true },
  { key: 'budget', label: 'Budget', width: 150, metric: true, defaultVisible: true },
  { key: 'amountSpent', label: 'Amount spent', width: 150, metric: true, defaultVisible: true },
  { key: 'resultRoas', label: 'Result ROAS', width: 140, metric: true, defaultVisible: true },
  { key: 'appInstalls', label: 'App installs', width: 140, metric: true, defaultVisible: true },
  { key: 'costPerAppInstall', label: 'Cost per app install', width: 190, metric: true, defaultVisible: true },
  { key: 'cpm', label: 'CPM', width: 120, metric: true, defaultVisible: true },
  { key: 'results', label: 'Results', width: 120, metric: true, defaultVisible: true },
  { key: 'costPerResults', label: 'Cost per results', width: 170, metric: true, defaultVisible: true },
  { key: 'ctrAll', label: 'CTR(all)', width: 130, metric: true, defaultVisible: true },
  { key: 'cpcAll', label: 'CPC(all)', width: 130, metric: true, defaultVisible: true },
  { key: 'cvrInstall', label: 'CVR(install)', width: 140, metric: true, defaultVisible: true },
  { key: 'ctrInstall', label: 'CTR(install)', width: 140, metric: true, defaultVisible: true },
  { key: 'costPerLead', label: 'Cost per lead', width: 140, metric: true, defaultVisible: true },
  { key: 'leads', label: 'Leads', width: 110, metric: true, defaultVisible: true },
  { key: 'cvrLeads', label: 'CVR leads', width: 130, metric: true, defaultVisible: true },
  { key: 'impression', label: 'Impression', width: 140, metric: true, defaultVisible: true },
  { key: 'reach', label: 'Reach', width: 120, metric: true, defaultVisible: true },
  { key: 'frequency', label: 'Frequency', width: 130, metric: true, defaultVisible: true },
  { key: 'completedRegistration', label: 'Completed registration', width: 210, metric: true, defaultVisible: true },
  { key: 'costPerCompletedRegistration', label: 'Cost per completed registration', width: 240, metric: true, defaultVisible: true },
  { key: 'purchase', label: 'Purchase', width: 120, metric: true, defaultVisible: true },
  { key: 'costPerPurchase', label: 'Cost per purchase', width: 170, metric: true, defaultVisible: true },
  { key: 'linkClicks', label: 'Link clicks', width: 130, metric: true, defaultVisible: true },
  { key: 'cpcLinkClick', label: 'CPC(cost per link click)', width: 220, metric: true, defaultVisible: true },
];

const META_COLUMN_HELP: Partial<Record<MetaColumnKey, string>> = {
  action: 'Bat hoac tat nhanh trang thai phan phoi cua campaign, ad set hoac ad.',
  entity: 'Ten doi tuong dang duoc hien thi trong bang. Tuy theo tang hien tai se la Campaign, Ad Set hoac Ad.',
  status: 'Trang thai van hanh hien tai cua doi tuong tren Meta nhu Active, Paused, Draft hoac Error.',
  account: 'Tai khoan quang cao Meta dang so huu va phan phoi doi tuong nay.',
  createdAt: 'Thoi diem campaign duoc tao. Ad set va ad co the khong co du lieu tao trong mock hien tai.',
  bidStrategy: 'Chien luoc dau gia Meta dang ap dung de toi uu phan phoi cho muc tieu da chon.',
  budget: 'Ngan sach duoc cap cho campaign hoac ad set trong chu ky van hanh.',
  amountSpent: 'Tong chi tieu da ghi nhan trong khoang thoi gian dang xem.',
  resultRoas: 'Ty le doanh thu tren chi tieu quang cao. Gia tri cao hon thuong tot hon.',
  appInstalls: 'So luot cai dat app duoc quy ve cho doi tuong nay.',
  costPerAppInstall: 'Chi phi trung binh de tao ra mot luot cai dat app.',
  cpm: 'Chi phi trung binh cho moi 1.000 lan hien thi.',
  results: 'Tong so ket qua chinh theo muc tieu toi uu hien tai. Trong mock nay dang map voi installs.',
  costPerResults: 'Chi phi trung binh cho moi ket qua chinh duoc ghi nhan.',
  ctrAll: 'Ty le nhap chuot tren tong so lan hien thi, tinh tren tat ca click.',
  cpcAll: 'Chi phi trung binh cho moi click, tinh tren tat ca click.',
  cvrInstall: 'Ty le chuyen doi tu click thanh install.',
  ctrInstall: 'Ty le install tren tong so impression.',
  costPerLead: 'Chi phi trung binh de tao ra mot lead.',
  leads: 'Tong so lead ghi nhan duoc tu doi tuong nay.',
  cvrLeads: 'Ty le chuyen doi tu click thanh lead.',
  impression: 'Tong so lan quang cao duoc hien thi.',
  reach: 'Tong so nguoi dung duy nhat da nhin thay quang cao.',
  frequency: 'So lan hien thi trung binh tren moi nguoi da duoc reach.',
  completedRegistration: 'So luot dang ky hoan tat sau khi nguoi dung tuong tac voi quang cao.',
  costPerCompletedRegistration: 'Chi phi trung binh cho moi luot dang ky hoan tat.',
  purchase: 'So luot mua hang hoac giao dich mua duoc ghi nhan.',
  costPerPurchase: 'Chi phi trung binh de tao ra mot purchase.',
  linkClicks: 'So click vao lien ket dich den.',
  cpcLinkClick: 'Chi phi trung binh cho moi click vao lien ket dich den.',
};

const HEATMAP_COLORS: HeatmapColor[] = [
  { id: 'sand', label: 'Sand', rgb: '213, 154, 128' },
  { id: 'yellow', label: 'Yellow', rgb: '245, 176, 37' },
  { id: 'orange', label: 'Orange', rgb: '244, 142, 70' },
  { id: 'coral', label: 'Coral', rgb: '255, 132, 132' },
  { id: 'rose', label: 'Rose', rgb: '211, 140, 180' },
  { id: 'violet', label: 'Violet', rgb: '163, 121, 238' },
  { id: 'indigo', label: 'Indigo', rgb: '124, 151, 238' },
  { id: 'sky', label: 'Sky', rgb: '70, 174, 222' },
  { id: 'teal', label: 'Teal', rgb: '70, 190, 174' },
  { id: 'green', label: 'Green', rgb: '100, 190, 126' },
  { id: 'lime', label: 'Lime', rgb: '148, 190, 86' },
  { id: 'olive', label: 'Olive', rgb: '190, 194, 38' },
];

const DEFAULT_VISIBLE_BY_ENTITY: Record<MetaEntity, MetaColumnKey[]> = {
  campaigns: ['action', 'entity', 'status', 'account', 'createdAt', 'bidStrategy', 'budget', 'amountSpent', 'resultRoas', 'appInstalls', 'costPerAppInstall', 'results', 'costPerResults', 'ctrAll', 'cpm', 'linkClicks', 'cpcLinkClick'],
  adsets: ['action', 'entity', 'status', 'account', 'bidStrategy', 'budget', 'amountSpent', 'appInstalls', 'costPerAppInstall', 'results', 'costPerResults', 'ctrAll', 'cvrInstall', 'reach', 'frequency', 'linkClicks', 'cpcLinkClick'],
  ads: ['action', 'entity', 'status', 'account', 'amountSpent', 'resultRoas', 'appInstalls', 'costPerAppInstall', 'ctrAll', 'cpcAll', 'cpm', 'purchase', 'costPerPurchase', 'linkClicks', 'cpcLinkClick'],
};

const TABLE_PREF_STORAGE_KEY = 'nms_meta_workspace_table_preferences_v2';
const META_CREATION_RECIPES_STORAGE_KEY = 'nms_meta_creation_recipes_v1';
const META_CREATION_RUNS_STORAGE_KEY = 'nms_meta_creation_runs_v1';

const TABLE_VIEW_PRESETS: Record<MetaEntity, { id: string; label: string; keys: MetaColumnKey[]; heatmaps: Partial<Record<MetaColumnKey, string>> }[]> = {
  campaigns: [
    { id: 'performance', label: 'Performance', keys: ['action', 'entity', 'status', 'account', 'budget', 'amountSpent', 'resultRoas', 'appInstalls', 'costPerAppInstall', 'cpm', 'ctrAll', 'cpcAll'], heatmaps: { resultRoas: 'green', costPerAppInstall: 'orange', amountSpent: 'indigo' } },
    { id: 'install', label: 'Install Funnel', keys: ['action', 'entity', 'status', 'budget', 'amountSpent', 'appInstalls', 'costPerAppInstall', 'cvrInstall', 'ctrInstall', 'impression', 'reach', 'frequency'], heatmaps: { appInstalls: 'green', costPerAppInstall: 'orange', cvrInstall: 'teal' } },
    { id: 'purchase', label: 'Purchase', keys: ['action', 'entity', 'status', 'amountSpent', 'purchase', 'costPerPurchase', 'resultRoas', 'linkClicks', 'cpcLinkClick'], heatmaps: { purchase: 'green', costPerPurchase: 'orange', resultRoas: 'lime' } },
  ],
  adsets: [
    { id: 'delivery', label: 'Delivery', keys: ['action', 'entity', 'status', 'account', 'budget', 'amountSpent', 'impression', 'reach', 'frequency', 'cpm', 'linkClicks', 'cpcLinkClick'], heatmaps: { frequency: 'coral', cpm: 'orange', reach: 'sky' } },
    { id: 'install', label: 'Install Funnel', keys: ['action', 'entity', 'status', 'budget', 'amountSpent', 'appInstalls', 'costPerAppInstall', 'ctrAll', 'cvrInstall', 'ctrInstall'], heatmaps: { appInstalls: 'green', costPerAppInstall: 'orange', cvrInstall: 'teal' } },
    { id: 'lead', label: 'Lead', keys: ['action', 'entity', 'status', 'amountSpent', 'leads', 'costPerLead', 'cvrLeads', 'linkClicks', 'cpcLinkClick'], heatmaps: { leads: 'green', costPerLead: 'orange', cvrLeads: 'teal' } },
  ],
  ads: [
    { id: 'creative', label: 'Creative', keys: ['action', 'entity', 'status', 'amountSpent', 'impression', 'ctrAll', 'cpcAll', 'appInstalls', 'costPerAppInstall'], heatmaps: { ctrAll: 'green', cpcAll: 'orange', appInstalls: 'teal' } },
    { id: 'purchase', label: 'Purchase', keys: ['action', 'entity', 'status', 'amountSpent', 'purchase', 'costPerPurchase', 'resultRoas', 'cpm'], heatmaps: { purchase: 'green', costPerPurchase: 'orange', resultRoas: 'lime' } },
    { id: 'clicks', label: 'Clicks', keys: ['action', 'entity', 'status', 'amountSpent', 'linkClicks', 'cpcLinkClick', 'ctrAll', 'cpcAll', 'impression'], heatmaps: { linkClicks: 'green', cpcLinkClick: 'orange', ctrAll: 'sky' } },
  ],
};

const createDefaultTablePreferences = (): Record<MetaEntity, TablePreference> => ({
  campaigns: { visibleKeys: DEFAULT_VISIBLE_BY_ENTITY.campaigns, heatmapColors: {} },
  adsets: { visibleKeys: DEFAULT_VISIBLE_BY_ENTITY.adsets, heatmapColors: {} },
  ads: { visibleKeys: DEFAULT_VISIBLE_BY_ENTITY.ads, heatmapColors: {} },
});

const getInitialTablePreferences = () => {
  if (typeof window === 'undefined') return createDefaultTablePreferences();
  try {
    const saved = window.localStorage.getItem(TABLE_PREF_STORAGE_KEY);
    if (!saved) return createDefaultTablePreferences();
    const parsed = JSON.parse(saved) as Partial<Record<MetaEntity, TablePreference>>;
    const defaults = createDefaultTablePreferences();
    return {
      campaigns: { ...defaults.campaigns, ...parsed.campaigns },
      adsets: { ...defaults.adsets, ...parsed.adsets },
      ads: { ...defaults.ads, ...parsed.ads },
    };
  } catch {
    return createDefaultTablePreferences();
  }
};

const loadStoredArray = <T,>(storageKey: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) as T[] : [];
  } catch {
    return [];
  }
};

const METRIC_POLARITY: Partial<Record<MetaColumnKey, 'higher' | 'lower'>> = {
  budget: 'higher',
  amountSpent: 'higher',
  resultRoas: 'higher',
  appInstalls: 'higher',
  costPerAppInstall: 'lower',
  cpm: 'lower',
  results: 'higher',
  costPerResults: 'lower',
  ctrAll: 'higher',
  cpcAll: 'lower',
  cvrInstall: 'higher',
  ctrInstall: 'higher',
  costPerLead: 'lower',
  leads: 'higher',
  cvrLeads: 'higher',
  impression: 'higher',
  reach: 'higher',
  frequency: 'lower',
  completedRegistration: 'higher',
  costPerCompletedRegistration: 'lower',
  purchase: 'higher',
  costPerPurchase: 'lower',
  linkClicks: 'higher',
  cpcLinkClick: 'lower',
};

const formatNumber = (value: number) => value.toLocaleString();

const getAdSetCampaignName = (adSet: AdSet, campaigns: Campaign[]) =>
  campaigns.find(campaign => campaign.id === adSet.campaignId)?.name ?? 'Unknown campaign';

const getAdSetName = (ad: Ad, adSets: AdSet[]) =>
  adSets.find(adSet => adSet.id === ad.adSetId)?.name ?? 'Unknown ad set';

const isCampaign = (row: MetaReportRow): row is Campaign => 'network' in row;
const isAdSet = (row: MetaReportRow): row is AdSet => 'targeting' in row;
const isAd = (row: MetaReportRow): row is Ad => 'creativeName' in row;

const safeDivide = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : 0);

const getSyntheticLeads = (row: MetaReportRow) => Math.max(0, Math.round(row.installs * 0.18 + row.clicks * 0.012));
const getSyntheticPurchases = (row: MetaReportRow) => Math.max(0, Math.round(row.installs * 0.08));
const getSyntheticCompletedRegistrations = (row: MetaReportRow) => Math.max(0, Math.round(row.installs * 0.36));

const getMetricValue = (row: MetaReportRow, key: MetaColumnKey): number | string => {
  const reach = Math.max(1, Math.round(row.impressions * 0.72));
  const leads = getSyntheticLeads(row);
  const purchases = getSyntheticPurchases(row);
  const completedRegistrations = getSyntheticCompletedRegistrations(row);

  switch (key) {
    case 'account':
      return 'Clean2';
    case 'createdAt':
      return isCampaign(row) ? row.createdAt : '-';
    case 'bidStrategy':
      return isCampaign(row) ? 'Highest volume or value' : 'Using campaign bid strategy';
    case 'budget':
      return isAd(row) ? 0 : row.budget;
    case 'amountSpent':
      return row.spend;
    case 'resultRoas':
      return isCampaign(row) ? row.roas : safeDivide(row.installs * 1.35, Math.max(row.spend, 1));
    case 'appInstalls':
    case 'results':
      return row.installs;
    case 'costPerAppInstall':
    case 'costPerResults':
      return safeDivide(row.spend, row.installs);
    case 'cpm':
      return safeDivide(row.spend, row.impressions) * 1000;
    case 'ctrAll':
      return safeDivide(row.clicks, row.impressions) * 100;
    case 'cpcAll':
    case 'cpcLinkClick':
      return safeDivide(row.spend, row.clicks);
    case 'cvrInstall':
      return safeDivide(row.installs, row.clicks) * 100;
    case 'ctrInstall':
      return safeDivide(row.installs, row.impressions) * 100;
    case 'costPerLead':
      return safeDivide(row.spend, leads);
    case 'leads':
      return leads;
    case 'cvrLeads':
      return safeDivide(leads, row.clicks) * 100;
    case 'impression':
      return row.impressions;
    case 'reach':
      return reach;
    case 'frequency':
      return safeDivide(row.impressions, reach);
    case 'completedRegistration':
      return completedRegistrations;
    case 'costPerCompletedRegistration':
      return safeDivide(row.spend, completedRegistrations);
    case 'purchase':
      return purchases;
    case 'costPerPurchase':
      return safeDivide(row.spend, purchases);
    case 'linkClicks':
      return row.clicks;
    default:
      return '-';
  }
};

const formatMetricValue = (key: MetaColumnKey, value: number | string) => {
  if (typeof value === 'string') return value;

  if (['budget', 'amountSpent', 'costPerAppInstall', 'costPerResults', 'cpcAll', 'costPerLead', 'costPerCompletedRegistration', 'costPerPurchase', 'cpcLinkClick'].includes(key)) {
    return value > 0 ? `$${value.toFixed(value >= 100 ? 0 : 2)}` : '$0.00';
  }

  if (['resultRoas'].includes(key)) return value > 0 ? `${value.toFixed(2)}x` : 'N/A';
  if (['ctrAll', 'cvrInstall', 'ctrInstall', 'cvrLeads'].includes(key)) return `${value.toFixed(2)}%`;
  if (['frequency'].includes(key)) return value.toFixed(2);
  return formatNumber(Math.round(value));
};

const getHeatmapStyle = (
  value: number | string,
  metric: MetaColumnKey,
  color?: HeatmapColor,
  domain?: { min: number; max: number },
): React.CSSProperties | undefined => {
  if (!color || typeof value !== 'number' || value <= 0) return undefined;
  const range = domain ? domain.max - domain.min : 0;
  const raw = range > 0 ? (value - (domain?.min ?? 0)) / range : 1;
  const normalized = METRIC_POLARITY[metric] === 'lower' ? 1 - raw : raw;
  const intensity = Math.min(0.88, Math.max(0.16, 0.16 + normalized * 0.72));
  return {
    backgroundColor: `rgba(${color.rgb}, ${intensity})`,
    color: 'var(--ds-fg-primary)',
  };
};

const MetaToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <Button
    type="button"
    variant={active ? 'primary' : 'border'}
    size="s"
    onClick={onClick}
    className="gap-1.5 whitespace-nowrap"
  >
    {icon}
    {label}
  </Button>
);

const ProgressChip: React.FC<{ label: string; count: number; total: number }> = ({ label, count, total }) => (
  <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium bg_secondary border border_secondary text_secondary">
    <span className={cn('w-2 h-2 radius_round', count === total ? 'bg_emerald_medium' : 'bg_quaternary')} />
    {label} {count}/{total}
  </span>
);

const DraftCampaignsPanel: React.FC<{
  drafts: DraftCampaign[];
  collapsed: boolean;
  onToggle: () => void;
  onContinue: (draft: DraftCampaign) => void;
  onDelete: (draftId: string) => void;
}> = ({ drafts, collapsed, onToggle, onContinue, onDelete }) => (
  <div className="radius_8 overflow-hidden border border_blue bg_blue_subtle">
    <div className="flex items-center justify-between px-4 py-3 border-b border_blue">
      <div className="flex items-center gap-2 text-sm font-semibold fg_blue_strong">
        <FileText size={16} />
        {drafts.length} Draft Campaigns
        {collapsed && <span className="text-xs font-medium text_secondary">hidden for focus</span>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="bg-transparent border-0 cursor-pointer text_primary inline-flex items-center gap-1 text-xs font-semibold"
        aria-label={collapsed ? 'Expand draft campaigns' : 'Collapse draft campaigns'}
      >
        {collapsed ? 'Show' : 'Hide'}
        <ChevronDown size={16} className={cn('transition-transform', collapsed ? '' : 'rotate-180')} />
      </button>
    </div>
    {!collapsed && <div className="p-3 space-y-2">
      {drafts.map(draft => (
        <div key={draft.id} className="bg_primary border border_primary radius_8 px-3 py-2.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text_primary">{draft.name}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 radius_4 bg_emerald_subtle fg_emerald_strong border border_emerald">
                {draft.objective}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 radius_4 bg_secondary border border_secondary text_secondary">
                DRAFT
              </span>
              <span className="text-xs text_tertiary">{draft.budget}</span>
              <span className="text-xs text_tertiary">{draft.updatedAt}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <ProgressChip label="Campaign" count={draft.progress.campaign} total={draft.progress.campaignTotal ?? 1} />
              <ProgressChip label="Adsets" count={draft.progress.adsets} total={draft.progress.adsetsTotal ?? 1} />
              <ProgressChip label="Creatives" count={draft.progress.creatives} total={draft.progress.creativesTotal ?? 1} />
              <ProgressChip label="Ads" count={draft.progress.ads} total={draft.progress.adsTotal ?? 1} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => onContinue(draft)}>
              <Edit3 size={13} />
              Continue
            </Button>
            <Button type="button" variant="danger" size="icon-s" aria-label={`Delete ${draft.name}`} onClick={() => onDelete(draft.id)}>
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      ))}
    </div>}
  </div>
);

const EntityTabs: React.FC<{
  entity: MetaEntity;
  setEntity: (entity: MetaEntity) => void;
  campaignCount: number;
  adSetCount: number;
  adCount: number;
  selectedCampaign?: Campaign | null;
  selectedAdSet?: AdSet | null;
}> = ({ entity, setEntity, campaignCount, adSetCount, adCount, selectedCampaign, selectedAdSet }) => {
  const items = [
    {
      key: 'campaigns' as const,
      title: 'Campaigns',
      subtitle: `${campaignCount} campaigns`,
      icon: <Megaphone size={16} />,
    },
    {
      key: 'adsets' as const,
      title: selectedCampaign ? `Ad sets for 1 campaign` : 'Ad sets',
      subtitle: selectedCampaign?.name ?? `${adSetCount} ad sets`,
      icon: <Layers3 size={16} />,
    },
    {
      key: 'ads' as const,
      title: selectedAdSet ? `Ads for 1 ad set` : selectedCampaign ? 'Ads for selected campaign' : 'Ads',
      subtitle: selectedAdSet?.name ?? selectedCampaign?.name ?? `${adCount} ads`,
      icon: <PanelRightOpen size={16} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      {items.map(item => {
        const isActive = entity === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setEntity(item.key)}
            className={cn(
              'text-left bg_primary border radius_8 px-4 py-3 cursor-pointer transition-colors',
              isActive ? 'border_blue bg_blue_subtle' : 'border_primary hover:state_bg_button_tertiary_soft',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn('w-8 h-8 radius_8 flex items-center justify-center shrink-0', isActive ? 'bg_info_contrast fg_on_contrast' : 'bg_secondary icon_secondary')}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className={cn('text-sm font-semibold truncate', isActive ? 'fg_blue_strong' : 'text_primary')}>{item.title}</div>
                  <div className="text-xs text_tertiary truncate">{item.subtitle}</div>
                </div>
              </div>
              {isActive && <CheckCircle2 size={16} className="fg_blue_accent shrink-0" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const SelectionInspector: React.FC<{
  entity: MetaEntity;
  selectedRows: MetaReportRow[];
  campaigns: Campaign[];
  adSets: AdSet[];
  ads: Ad[];
  onEdit: (row: MetaReportRow) => void;
  onDrillDown: (row: MetaReportRow) => void;
}> = ({ entity, selectedRows, campaigns, adSets, ads, onEdit, onDrillDown }) => {
  if (selectedRows.length === 0) return null;

  const first = selectedRows[0];
  const level = ENTITY_META[entity].singular;
  const amountSpent = getMetricValue(first, 'amountSpent');
  const installs = getMetricValue(first, 'appInstalls');
  const cpa = getMetricValue(first, 'costPerAppInstall');
  const childAdSets = isCampaign(first) ? adSets.filter(adSet => adSet.campaignId === first.id).length : 0;
  const childAds = isCampaign(first) ? ads.filter(ad => ad.campaignId === first.id).length : isAdSet(first) ? ads.filter(ad => ad.adSetId === first.id).length : 0;
  const parentCampaignName = isAdSet(first) || isAd(first) ? campaigns.find(campaign => campaign.id === first.campaignId)?.name : undefined;
  const warnings = [
    first.status === 'DRAFT' ? 'Draft not launched' : '',
    first.status === 'ERROR' || first.status === 'REJECTED' ? 'Needs review' : '',
    !isAd(first) && first.budget <= 0 ? 'Missing budget' : '',
    isAd(first) && !first.creativeName ? 'Missing creative' : '',
  ].filter(Boolean);

  return (
    <div className="bg_primary border border_primary radius_8 p-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase text_tertiary">Selection Inspector</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_blue_subtle fg_blue_strong border border_blue">{selectedRows.length} selected</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_secondary border border_secondary text_secondary">{level}</span>
          </div>
          <div className="text-sm font-semibold text_primary mt-1 truncate">{first.name}</div>
          <div className="text-xs text_tertiary mt-1">
            Spend {formatMetricValue('amountSpent', amountSpent)} · Installs {formatMetricValue('appInstalls', installs)} · CPI {formatMetricValue('costPerAppInstall', cpa)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isCampaign(first) && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{childAdSets} ad sets</span>}
          {isCampaign(first) && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{childAds} ads</span>}
          {isAdSet(first) && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{childAds} ads</span>}
          {parentCampaignName && <span className="text-xs text_secondary px-2 py-1 bg_secondary border border_secondary radius_4">{parentCampaignName}</span>}
          {warnings.length === 0 ? (
            <span className="text-xs fg_emerald_strong px-2 py-1 bg_emerald_subtle border border_emerald radius_4">No obvious blockers</span>
          ) : warnings.map(warning => (
            <span key={warning} className="text-xs fg_amber_strong px-2 py-1 bg_amber_subtle border border_amber radius_4">{warning}</span>
          ))}
          <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => onEdit(first)}>
            <Edit3 size={13} />
            Edit
          </Button>
          {!isAd(first) && (
            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => onDrillDown(first)}>
              <GitBranch size={13} />
              Drill down
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const ColumnSettingsDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  entity: MetaEntity;
  visibleKeys: MetaColumnKey[];
  heatmapColors: Partial<Record<MetaColumnKey, string>>;
  onVisibleKeysChange: (keys: MetaColumnKey[]) => void;
  onHeatmapColorsChange: (colors: Partial<Record<MetaColumnKey, string>>) => void;
}> = ({ open, onClose, entity, visibleKeys, heatmapColors, onVisibleKeysChange, onHeatmapColorsChange }) => {
  const metricColumns = META_REPORT_COLUMNS.filter(column => column.metric);
  const defaultHeatmapColor = HEATMAP_COLORS.find(color => color.id === 'orange') ?? HEATMAP_COLORS[0];

  const toggleVisible = (key: MetaColumnKey, checked: boolean) => {
    if (checked) {
      onVisibleKeysChange(Array.from(new Set([...visibleKeys, key])));
      return;
    }
    if (['action', 'entity'].includes(key)) return;
    onVisibleKeysChange(visibleKeys.filter(item => item !== key));
  };

  const toggleHeatmap = (key: MetaColumnKey, checked: boolean) => {
    if (checked) {
      onHeatmapColorsChange({ ...heatmapColors, [key]: defaultHeatmapColor.id });
      return;
    }
    const next = { ...heatmapColors };
    delete next[key];
    onHeatmapColorsChange(next);
  };

  return (
    <Drawer
      title="Customize columns"
      open={open}
      onClose={onClose}
      width={420}
      extra={(
        <Button
          type="button"
          variant="border"
          size="s"
          onClick={() => {
            onVisibleKeysChange(DEFAULT_VISIBLE_BY_ENTITY[entity]);
            onHeatmapColorsChange({});
          }}
        >
          Reset
        </Button>
      )}
    >
      <div className="space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase text_tertiary mb-2">Visible columns</div>
          <div className="space-y-1.5">
            {META_REPORT_COLUMNS.map(column => (
              <label key={column.key} className="flex items-center justify-between gap-3 p-2 radius_6 hover:bg_secondary cursor-pointer">
                <span className="text-sm text_primary">{column.label}</span>
                <Checkbox
                  checked={visibleKeys.includes(column.key)}
                  disabled={['action', 'entity'].includes(column.key)}
                  onChange={event => toggleVisible(column.key, event.target.checked)}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase text_tertiary mb-2">Color heatmap</div>
          <div className="space-y-1.5">
            {metricColumns.map(column => (
              <label key={column.key} className="flex items-center justify-between gap-3 p-2 radius_6 hover:bg_secondary cursor-pointer">
                <span className="text-sm text_primary">{column.label}</span>
                <Switch
                  size="small"
                  checked={Boolean(heatmapColors[column.key])}
                  onChange={checked => toggleHeatmap(column.key, checked)}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

const HeatmapColorPicker: React.FC<{
  column: MetaColumnConfig;
  selectedColor?: HeatmapColor;
  onSelect: (colorId: string) => void;
  onRemove: () => void;
}> = ({ column, selectedColor, onSelect, onRemove }) => {
  const content = (
    <div className="w-[180px]">
      <div className="px-1 pb-3 text-xs font-bold uppercase tracking-wide text_tertiary">Color heatmap</div>
      <div className="grid grid-cols-4 gap-3 px-1 pb-4">
        {HEATMAP_COLORS.map(color => {
          const isSelected = selectedColor?.id === color.id;
          return (
            <button
              key={color.id}
              type="button"
              aria-label={`Use ${color.label} heatmap for ${column.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(color.id);
              }}
              className={cn(
                'w-6 h-6 radius_round border cursor-pointer transition-shadow',
                isSelected ? 'border_blue shadow-[0_0_0_3px_var(--ds-border-focus)]' : 'border-transparent hover:shadow-sm',
              )}
              style={{ backgroundColor: `rgb(${color.rgb})` }}
            />
          );
        })}
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="w-full border-0 border-t border_secondary bg-transparent px-1 pt-3 flex items-center gap-2 text-sm font-semibold text_secondary cursor-pointer hover:text_primary"
      >
        <X size={14} />
        Remove Heatmap
      </button>
    </div>
  );

  return (
    <Popover placement="bottomRight" trigger="click" content={content} overlayInnerStyle={{ padding: 12 }}>
      <button
        type="button"
        className={cn(
          'border-0 bg-transparent p-0 cursor-pointer inline-flex items-center icon_tertiary hover:fg_blue_accent',
          selectedColor && 'fg_accent_primary',
        )}
        aria-label={`Choose heatmap color for ${column.label}`}
        onClick={event => event.stopPropagation()}
      >
        <Palette size={14} />
      </button>
    </Popover>
  );
};

const ManagePagesModal: React.FC<{
  open: boolean;
  onClose: () => void;
  pages: MetaPage[];
  onChange: (pages: MetaPage[]) => void;
}> = ({ open, onClose, pages, onChange }) => {
  const [draftPage, setDraftPage] = useState({ id: '', name: '', instagramId: '' });
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  const resetForm = () => {
    setDraftPage({ id: '', name: '', instagramId: '' });
    setEditingPageId(null);
  };

  const handleSubmit = () => {
    if (!draftPage.id.trim() || !draftPage.name.trim()) {
      toast.error('Page ID and Page Name are required');
      return;
    }

    if (editingPageId) {
      onChange(pages.map(page => page.id === editingPageId ? { ...page, ...draftPage, status: 'Needs review' } : page));
      toast.success('Page updated');
    } else {
      onChange([
        {
          id: draftPage.id.trim(),
          name: draftPage.name.trim(),
          instagramId: draftPage.instagramId.trim(),
          status: 'Needs review',
        },
        ...pages,
      ]);
      toast.success('Page added to mock list');
    }
    resetForm();
  };

  const columns: ColumnsType<MetaPage> = [
    { title: 'Page ID', dataIndex: 'id', key: 'id', width: 160 },
    { title: 'Page Name', dataIndex: 'name', key: 'name' },
    { title: 'Instagram User ID', dataIndex: 'instagramId', key: 'instagramId', width: 180 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: MetaPage['status']) => (
        <span className={cn('text-[11px] font-semibold px-2 py-0.5 radius_4', status === 'Synced' ? 'bg_emerald_subtle fg_emerald_strong' : 'bg_amber_subtle fg_amber_strong')}>
          {status}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 88,
      render: (_: unknown, record) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="dim"
            size="icon-s"
            aria-label="Edit page"
            onClick={() => {
              setEditingPageId(record.id);
              setDraftPage({ id: record.id, name: record.name, instagramId: record.instagramId });
            }}
          >
            <Edit3 size={13} />
          </Button>
          <Button
            type="button"
            variant="danger"
            size="icon-s"
            aria-label="Delete page"
            onClick={() => onChange(pages.filter(page => page.id !== record.id))}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={<span className="text-base font-semibold text_primary">Manage Pages</span>}
      open={open}
      onCancel={onClose}
      width={820}
      footer={
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="border"
            size="m"
            className="gap-1.5"
            onClick={() => {
              onChange(pages.map(page => ({ ...page, status: 'Synced' })));
              toast.success('Pages synced from Meta');
            }}
          >
            <RefreshCcw size={14} />
            Sync from Meta
          </Button>
          <Button type="button" variant="border" size="m" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold text_primary mb-2">{editingPageId ? 'Edit Page' : 'Add New Page'}</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
            <Input placeholder="Page ID" value={draftPage.id} onChange={event => setDraftPage(page => ({ ...page, id: event.target.value }))} />
            <Input placeholder="Page Name" value={draftPage.name} onChange={event => setDraftPage(page => ({ ...page, name: event.target.value }))} />
            <Input placeholder="Instagram User ID (optional)" value={draftPage.instagramId} onChange={event => setDraftPage(page => ({ ...page, instagramId: event.target.value }))} />
            <Button type="button" variant="primary" size="m" className="gap-1.5" onClick={handleSubmit}>
              <Plus size={14} />
              {editingPageId ? 'Save Page' : 'Add Page'}
            </Button>
          </div>
          {editingPageId && (
            <button type="button" className="mt-2 border-0 bg-transparent text-xs font-semibold fg_blue_accent cursor-pointer" onClick={resetForm}>
              Cancel editing
            </button>
          )}
        </div>
        <DataTable<MetaPage>
          columns={columns}
          dataSource={pages}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ y: 320 }}
        />
      </div>
    </Modal>
  );
};

const TemplateDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  templates: MetaTemplate[];
  pages: MetaPage[];
  onChange: (templates: MetaTemplate[]) => void;
}> = ({ open, onClose, templates, pages, onChange }) => {
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [activeTemplate, setActiveTemplate] = useState<MetaTemplate>(templates[0] ?? META_TEMPLATES[0]);

  const openEdit = (template: MetaTemplate) => {
    setActiveTemplate(template);
    setMode('edit');
  };

  useEffect(() => {
    if (templates.length > 0 && !templates.some(template => template.id === activeTemplate.id)) {
      setActiveTemplate(templates[0]);
    }
  }, [activeTemplate.id, templates]);

  const saveTemplate = () => {
    const exists = templates.some(template => template.id === activeTemplate.id);
    const next = exists
      ? templates.map(template => template.id === activeTemplate.id ? activeTemplate : template)
      : [{ ...activeTemplate, id: `tpl-${Date.now()}` }, ...templates];
    onChange(next);
    toast.success('Template changes saved');
    setMode('list');
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <button type="button" className="bg-transparent border-0 cursor-pointer text_secondary" onClick={() => setMode('list')} aria-label="Back to templates">
              <X size={16} />
            </button>
          )}
          <span className="text-base font-semibold text_primary">Campaign Templates</span>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
      styles={{
        body: { padding: 0, background: 'var(--ds-bg-canvas-secondary)' },
        footer: { padding: 12 },
      }}
      footer={mode === 'edit' ? (
        <div className="flex items-center justify-between">
          <Button type="button" variant="border" size="m" className="gap-1.5" onClick={() => setMode('list')}>
            <X size={14} />
            Back to list
          </Button>
          <Button type="button" variant="primary" size="m" className="gap-1.5" onClick={saveTemplate}>
            <FileText size={14} />
            Save Changes
          </Button>
        </div>
      ) : undefined}
      extra={mode === 'list' ? (
        <Button
          type="button"
          variant="primary"
          size="m"
          className="gap-1.5"
          onClick={() => {
            setActiveTemplate({
              id: `tpl-new-${Date.now()}`,
              name: 'New Meta Template',
              objective: 'Sales',
              age: '18-65',
              attribution: '7d click / 1d view',
              placements: ['Facebook', 'Instagram'],
            });
            setMode('edit');
          }}
        >
          <Plus size={14} />
          Create Template
        </Button>
      ) : null}
    >
      {mode === 'list' ? (
        <div className="p-5 space-y-3">
          {templates.map(template => (
            <Card key={template.id} className="radius_8 border border_primary bg_primary overflow-hidden p-0">
              <div className="p-4 bg_blue_subtle border-b border_blue">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 radius_8 bg_info_contrast fg_on_contrast flex items-center justify-center font-bold">
                      {template.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text_primary truncate">{template.name}</div>
                      <div className="text-xs text_tertiary">Created 6/12/2026</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="dim" size="icon-s" aria-label="Edit template" onClick={() => openEdit(template)}><Edit3 size={13} /></Button>
                    <Button
                      type="button"
                      variant="dim"
                      size="icon-s"
                      aria-label="Duplicate template"
                      onClick={() => onChange([{ ...template, id: `${template.id}-copy-${Date.now()}`, name: `${template.name} Copy` }, ...templates])}
                    >
                      <Copy size={13} />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="icon-s"
                      aria-label="Delete template"
                      onClick={() => onChange(templates.filter(item => item.id !== template.id))}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-medium px-2 py-1 radius_4 bg_amber_subtle fg_amber_strong border border_amber">{template.objective}</span>
                <span className="text-[11px] font-medium px-2 py-1 radius_4 bg_blue_subtle fg_blue_strong border border_blue">Age {template.age}</span>
                <span className="text-[11px] font-medium px-2 py-1 radius_4 bg_secondary border border_secondary text_secondary">{template.attribution}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-5 pb-24 space-y-4">
          <TemplateSection icon={<Settings size={16} className="fg_blue_accent" />} title="Template setup">
            <Field label="Template Name"><Input value={activeTemplate.name} onChange={event => setActiveTemplate(template => ({ ...template, name: event.target.value }))} /></Field>
            <Field label="Campaign Type">
              <Radio.Group value={activeTemplate.objective} className="flex gap-4" onChange={event => setActiveTemplate(template => ({ ...template, objective: event.target.value }))}>
                <Radio value="Sales">Sales</Radio>
                <Radio value="App promotions">App Promotions</Radio>
              </Radio.Group>
            </Field>
          </TemplateSection>

          <TemplateSection icon={<Zap size={16} className="fg_blue_accent" />} title="Optimization & Bidding">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bid Strategy"><Select placeholder="Select bid strategy" options={[{ value: 'highest_volume', label: 'Highest volume or value' }, { value: 'cost_cap', label: 'Cost cap' }]} /></Field>
              <Field label="Performance Goal"><Select placeholder="Select goal" options={[{ value: 'installs', label: 'Maximize installs' }, { value: 'value', label: 'Maximize value' }]} /></Field>
            </div>
          </TemplateSection>

          <TemplateSection icon={<MousePointerClick size={16} className="fg_accent_primary" />} title="Conversion Event">
            <Field label="Conversion Event"><Select placeholder="Select an event" options={[{ value: 'install', label: 'App install' }, { value: 'purchase', label: 'Purchase' }]} /></Field>
          </TemplateSection>

          <TemplateSection icon={<CalendarDays size={16} className="fg_blue_accent" />} title="Attribution Setting">
            <Radio.Group defaultValue="standard" className="mb-3 flex gap-4">
              <Radio value="standard">Standard</Radio>
              <Radio value="incremental">Incremental</Radio>
            </Radio.Group>
            {['Click-through', 'View-through', 'Engaged-view (Videos only)'].map((name, index) => (
              <div key={name} className="flex items-center justify-between border border_secondary bg_secondary radius_8 px-3 py-2 mb-2">
                <div>
                  <div className="text-sm font-semibold text_primary">{name}</div>
                  <div className="text-xs text_tertiary">Conversions attributed to {index === 0 ? 'clicks' : index === 1 ? 'views' : 'video engagement'}</div>
                </div>
                <Select className="w-28" defaultValue={index === 0 ? '7d' : '1d'} options={[{ value: '1d', label: '1 day' }, { value: '7d', label: '7 days' }]} />
              </div>
            ))}
          </TemplateSection>

          <TemplateSection icon={<Bot size={16} className="fg_blue_accent" />} title="Audience">
            <Field label="Saved Audiences"><Select placeholder="Select a saved audience to auto-fill targeting" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age Range">
                <div className="flex items-center gap-2">
                  <Input defaultValue="18" />
                  <span className="text_tertiary">-</span>
                  <Input defaultValue="65" />
                </div>
              </Field>
              <Field label="Gender"><Select defaultValue="all" options={[{ value: 'all', label: 'All Genders' }, { value: 'male', label: 'Men' }, { value: 'female', label: 'Women' }]} /></Field>
            </div>
          </TemplateSection>

          <TemplateSection icon={<Layers3 size={16} className="fg_blue_accent" />} title="Placements">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Platform"><Select placeholder="Select platform" /></Field>
              <Field label="Device"><Select defaultValue="all" options={[{ value: 'all', label: 'All Devices' }, { value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]} /></Field>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs font-semibold text_secondary uppercase">Platforms</div>
              <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => toast.success('Placement OS synced')}>
                <RefreshCcw size={13} />
                Sync OS
              </Button>
            </div>
            <Checkbox.Group className="grid grid-cols-2 gap-2 mt-2" value={activeTemplate.placements} onChange={values => setActiveTemplate(template => ({ ...template, placements: values as string[] }))}>
              {['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads'].map(platform => (
                <Checkbox key={platform} value={platform}>{platform}</Checkbox>
              ))}
            </Checkbox.Group>
          </TemplateSection>

          <TemplateSection icon={<Zap size={16} className="fg_blue_accent" />} title="Ad Creative">
            <Field label="Facebook Page"><Select placeholder="Select a Facebook Page" options={pages.map(page => ({ value: page.id, label: page.name }))} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Website URL"><Input placeholder="http://www.example.com/page" /></Field>
              <Field label="Display Link"><Input placeholder="Display link shown on your ad" /></Field>
            </div>
            <TextAssetField label="Primary Text" count="0 of 5" />
            <TextAssetField label="Headlines" count="0 of 5" />
            <TextAssetField label="Descriptions" count="0 of 5" />
            <Field label="Call to Action"><Select defaultValue="download" options={[{ value: 'download', label: 'Download' }, { value: 'install_now', label: 'Install Now' }, { value: 'learn_more', label: 'Learn More' }]} /></Field>
          </TemplateSection>
        </div>
      )}
    </Drawer>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text_primary mb-1.5">{label}</span>
    {children}
  </label>
);

const TemplateSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="bg_primary border border_primary radius_8 p-4">
    <div className="flex items-center gap-2 pb-3 mb-3 border-b border_secondary">
      {icon}
      <h3 className="text-base font-semibold text_primary m-0">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const TextAssetField: React.FC<{ label: string; count: string }> = ({ label, count }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-semibold text_primary">{label} ({count})</span>
      <div className="flex gap-1.5">
        <Button type="button" variant="border" size="s">Bulk Add</Button>
        <Button type="button" variant="border" size="s" className="gap-1"><Plus size={12} /> Add</Button>
      </div>
    </div>
    <Input placeholder={`Add ${label.toLowerCase()}`} />
  </div>
);

const RequiredChecklist: React.FC<{ context: BuilderContext }> = ({ context }) => {
  const campaignTitle = context.campaign?.name ?? context.draft?.name ?? 'Campaign';
  const adSetTitle = context.adSet?.name ?? 'Ad Set';
  const adTitle = context.ad?.name ?? 'Ad';
  const groups = [
    { title: campaignTitle, progress: '6/6', complete: true, items: ['Campaign Name', 'Objective', 'Budget Strategy', 'Bid Strategy'] },
    { title: adSetTitle, progress: '7/9', complete: false, items: ['Ad Set Name', 'Performance Goal', 'Attribution', 'Locations', 'Age Range', 'Gender', 'Platforms', 'Conversion Event'] },
    { title: adTitle, progress: '4/8', complete: false, items: ['Ad Name', 'Headlines', 'Primary Texts', 'Call to Action', 'Facebook Page', 'Media', 'Website URL'] },
  ];

  return (
    <aside className="w-full xl:w-80 shrink-0 bg_primary border border_primary radius_8 p-4 h-fit sticky top-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text_primary">Required Fields</div>
          <div className="text-xs text_tertiary">17/23 completed</div>
        </div>
        <Progress type="circle" size={48} percent={74} />
      </div>
      <Progress percent={74} showInfo={false} className="mt-4" />
      <div className="mt-4 divide-y divide-[var(--ds-border-secondary)]">
        {groups.map(group => (
          <div key={group.title} className="py-3">
            <div className="flex items-center justify-between">
              <span className={cn('text-sm font-semibold', group.complete ? 'fg_emerald_accent' : 'text_primary')}>{group.title}</span>
              <span className={cn('text-[11px] font-semibold px-2 py-0.5 radius_round', group.complete ? 'bg_emerald_subtle fg_emerald_strong' : 'bg_red_subtle fg_red_strong')}>{group.progress}</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {group.items.map((item, index) => {
                const done = group.complete || index < 5;
                return (
                  <div key={item} className={cn('flex items-center gap-2 text-xs', done ? 'text_tertiary line-through' : 'text_primary')}>
                    <span className={cn('w-3 h-3 radius_round flex items-center justify-center', done ? 'bg_emerald_medium' : 'bg_red_medium')} />
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

const MetaBuilderDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  context: BuilderContext;
  pages: MetaPage[];
  templates: MetaTemplate[];
}> = ({ open, onClose, context, pages, templates }) => {
  const initialTab = context.entity === 'campaigns' ? 'campaign' : context.entity === 'adsets' ? 'adset' : 'creative';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(initialTab);
    setSelectedTemplateId(undefined);
  }, [initialTab, open]);

  const campaignLabel = context.campaign?.name ?? context.draft?.name ?? 'New Campaign';
  const adSetLabel = context.adSet?.name ?? 'New Ad Set';
  const adLabel = context.ad?.name ?? 'New Ad';
  const selectedTemplate = templates.find(template => template.id === selectedTemplateId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width="calc(100vw - 72px)"
      title={<span className="text-base font-semibold text_primary">Meta Campaign Builder</span>}
      styles={{
        body: { padding: 0, background: 'var(--ds-bg-canvas-secondary)' },
        footer: { padding: 12 },
      }}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text_secondary">
            <CheckCircle2 size={14} className="fg_emerald_accent" />
            Auto-saved draft at 04:51:31 PM
          </div>
          <Button type="button" variant="primary" size="m" disabled>
            Launch Campaign
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-[280px_1fr] min-h-full">
        <div className="bg_primary border-r border_primary p-4">
          <div className="flex items-center gap-2 text-base font-semibold text_primary mb-4">
            <img src="/logo/meta.png" alt="Meta" className="w-7 h-7 object-contain" />
            Meta
          </div>
          <div className="space-y-2">
            <BuilderTreeItem active={activeTab === 'campaign'} icon={<Megaphone size={15} />} label={campaignLabel} onClick={() => setActiveTab('campaign')} />
            <BuilderTreeItem active={activeTab === 'adset'} icon={<Layers3 size={15} />} label={adSetLabel} onClick={() => setActiveTab('adset')} />
            <BuilderTreeItem active={activeTab === 'creative'} icon={<PanelRightOpen size={15} />} label={adLabel} onClick={() => setActiveTab('creative')} />
            <Button type="button" variant="border" size="m" className="w-full gap-1.5 mt-2">
              <Plus size={14} />
              Add Ad Set
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-auto">
          <div className="max-w-[1180px] mx-auto">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: 'campaign', label: 'Campaign Settings' },
                { key: 'adset', label: 'Ad Set' },
                { key: 'creative', label: 'Ad Creative' },
              ]}
            />
            <div className="flex flex-col xl:flex-row gap-6 mt-4">
              <div className="flex-1 space-y-4">
                <div className="border border_blue bg_blue_subtle radius_8 p-3 flex items-center gap-3">
                  <Sparkles size={16} className="fg_blue_accent" />
                  <span className="text-sm font-semibold text_primary">Apply Template</span>
                  <Select className="flex-1" placeholder="Select a template..." value={selectedTemplateId} onChange={setSelectedTemplateId} allowClear options={templates.map(t => ({ value: t.id, label: t.name }))} />
                  <Button type="button" variant="border" size="m" onClick={() => setSelectedTemplateId(undefined)}>Reset Template Fields</Button>
                </div>
                {activeTab === 'campaign' && <CampaignSettingsForm key={`campaign-${selectedTemplate?.id ?? 'default'}`} context={context} template={selectedTemplate} />}
                {activeTab === 'adset' && <AdsetSettingsForm key={`adset-${selectedTemplate?.id ?? 'default'}`} context={context} template={selectedTemplate} />}
                {activeTab === 'creative' && <AdCreativeForm key={`creative-${selectedTemplate?.id ?? 'default'}`} context={context} pages={pages} template={selectedTemplate} />}
              </div>
              <RequiredChecklist context={context} />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

const BuilderTreeItem: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-2 text-left px-3 py-2 radius_8 border cursor-pointer',
      active ? 'bg_blue_subtle border_blue fg_blue_strong' : 'bg_primary border-transparent text_primary hover:state_bg_button_tertiary_soft',
    )}
  >
    {icon}
    <span className="text-sm font-medium truncate">{label}</span>
  </button>
);

const BuilderCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg_primary border border_primary radius_8 p-5 space-y-4">{children}</div>
);

const CampaignSettingsForm: React.FC<{ context: BuilderContext; template?: MetaTemplate }> = ({ context, template }) => (
  <>
    <BuilderCard>
      <Field label="Account ID"><Select defaultValue="Clean2" options={[{ value: 'Clean2', label: 'Clean2' }]} /></Field>
    </BuilderCard>
    <BuilderCard>
      <Field label="Campaign Name"><Input defaultValue={context.campaign?.name ?? context.draft?.name ?? 'New Campaign Sales'} /></Field>
    </BuilderCard>
    <BuilderCard>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Campaign Objective"><Select defaultValue={template?.objective === 'App promotions' ? 'app_installs' : 'sales'} options={[{ value: 'sales', label: 'Sales' }, { value: 'app_installs', label: 'App Installs' }]} /></Field>
        <Field label="Buying Type"><Select disabled defaultValue="auction" options={[{ value: 'auction', label: 'AUCTION' }]} /></Field>
      </div>
    </BuilderCard>
    <BuilderCard>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text_primary">Budget Strategy</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_emerald_subtle fg_emerald_strong">Advantage+ On</span>
      </div>
      <Radio.Group defaultValue="campaign" className="flex gap-5">
        <Radio value="campaign">Campaign Budget</Radio>
        <Radio value="adset">Ad Set Budget</Radio>
      </Radio.Group>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Budget Amount">
          <div className="grid grid-cols-[130px_1fr] gap-2">
            <Select defaultValue="daily" options={[{ value: 'daily', label: 'Daily' }, { value: 'lifetime', label: 'Lifetime' }]} />
            <Input defaultValue="$100" />
          </div>
        </Field>
        <Field label="Bid Strategy"><Select defaultValue="highest" options={[{ value: 'highest', label: 'Highest volume or value' }]} /></Field>
      </div>
    </BuilderCard>
  </>
);

const AdsetSettingsForm: React.FC<{ context: BuilderContext; template?: MetaTemplate }> = ({ context, template }) => (
  <>
    <BuilderCard>
      <Field label="Ad Set Name"><Input defaultValue={context.adSet?.name ?? 'New Adset Sales'} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Performance Goal"><Select defaultValue="installs" options={[{ value: 'installs', label: 'Maximize app installs' }, { value: 'value', label: 'Maximize value' }]} /></Field>
        <Field label="Conversion Event"><Select placeholder="Select event" options={[{ value: 'install', label: 'App install' }, { value: 'purchase', label: 'Purchase' }]} /></Field>
      </div>
    </BuilderCard>
    <BuilderCard>
      <div className="text-base font-semibold text_primary">Audience</div>
        <Field label="Saved Audiences"><Select placeholder="Select a saved audience to auto-fill targeting..." defaultValue={template ? 'template-audience' : undefined} options={template ? [{ value: 'template-audience', label: `${template.name} audience seed` }] : undefined} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Locations"><Select mode="multiple" defaultValue={['Worldwide']} options={[{ value: 'Worldwide', label: 'Worldwide' }, { value: 'US', label: 'United States' }, { value: 'JP', label: 'Japan' }]} /></Field>
        <Field label="Gender"><Select defaultValue="all" options={[{ value: 'all', label: 'All Genders' }, { value: 'male', label: 'Men' }, { value: 'female', label: 'Women' }]} /></Field>
      </div>
      <Field label="Age Range">
        <div className="flex items-center gap-2 max-w-72">
          <Input defaultValue="18" />
          <span className="text_tertiary">-</span>
          <Input defaultValue={template?.age.split('-')[1] ?? '65'} />
        </div>
      </Field>
    </BuilderCard>
    <BuilderCard>
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text_primary">Placements</div>
        <Button type="button" variant="border" size="s" className="gap-1.5"><RefreshCcw size={13} /> Sync OS</Button>
      </div>
      <Checkbox.Group defaultValue={template?.placements ?? ['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads']} className="grid grid-cols-2 gap-2">
        {['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads'].map(platform => <Checkbox key={platform} value={platform}>{platform}</Checkbox>)}
      </Checkbox.Group>
    </BuilderCard>
  </>
);

const AdCreativeForm: React.FC<{ context: BuilderContext; pages: MetaPage[]; template?: MetaTemplate }> = ({ context, pages, template }) => (
  <>
    <BuilderCard>
      <div className="grid grid-cols-3 gap-3">
        {['9:16', '1:1', '16:9'].map(ratio => (
          <div key={ratio} className="border border_primary radius_8 p-3">
            <div className="text-xs text_tertiary mb-2">{ratio}</div>
            <div className="h-40 bg_secondary radius_8 flex items-center justify-center text_tertiary">
              <Folder size={24} />
            </div>
            <Button type="button" variant="primary" size="m" className="w-full mt-3 gap-1.5"><Upload size={14} /> Select Video</Button>
          </div>
        ))}
      </div>
    </BuilderCard>
    <BuilderCard>
      <Field label="Ad Name"><Input defaultValue={context.ad?.name ?? 'New Ad Sales'} /></Field>
      <Field label="Facebook Page"><Select placeholder="Select a Facebook Page" options={pages.map(page => ({ value: page.id, label: page.name }))} /></Field>
      <TextAssetField label="Primary Text" count={template ? '1 of 5' : '2 of 5'} />
      <TextAssetField label="Headline" count={template ? '2 of 5' : '1 of 5'} />
      <TextAssetField label="Description" count="0 of 5" />
      <Field label="Call to Action"><Select defaultValue={template?.objective === 'App promotions' ? 'install_now' : 'download'} options={[{ value: 'download', label: 'Download' }, { value: 'install_now', label: 'Install Now' }]} /></Field>
    </BuilderCard>
  </>
);

export const MetaWorkspace: React.FC<MetaWorkspaceProps> = ({ network }) => {
  const { appId } = useParams<{ appId?: string }>();
  const activeApp = mockProjects.find(project => project.id === appId);
  const initialCampaigns = useMemo(
    () => mockCampaigns.filter(campaign => campaign.network === network && (!appId || campaign.projectId === appId)),
    [appId, network],
  );
  const initialCampaignIds = useMemo(() => new Set(initialCampaigns.map(campaign => campaign.id)), [initialCampaigns]);
  const initialAdSets = useMemo(() => mockAdSets.filter(adSet => initialCampaignIds.has(adSet.campaignId)), [initialCampaignIds]);
  const initialAds = useMemo(() => mockAds.filter(ad => initialCampaignIds.has(ad.campaignId)), [initialCampaignIds]);

  const [accountId, setAccountId] = useState(META_ACCOUNT_OPTIONS[0].value);
  const [entity, setEntity] = useState<MetaEntity>('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [draftsCollapsed, setDraftsCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [adSets, setAdSets] = useState<AdSet[]>(initialAdSets);
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [pages, setPages] = useState<MetaPage[]>(META_PAGES);
  const [templates, setTemplates] = useState<MetaTemplate[]>(META_TEMPLATES);
  const [recipes, setRecipes] = useState<MetaCreationRecipe[]>(() => loadStoredArray<MetaCreationRecipe>(META_CREATION_RECIPES_STORAGE_KEY));
  const [automationRuns, setAutomationRuns] = useState<MetaAutomationRun[]>(() => loadStoredArray<MetaAutomationRun>(META_CREATION_RUNS_STORAGE_KEY));
  const [drafts, setDrafts] = useState<DraftCampaign[]>(() => META_DRAFTS.map((draft, index) => ({ ...draft, campaignId: initialCampaigns[index]?.id ?? initialCampaigns[0]?.id })));
  const [draftFilters, setDraftFilters] = useState<FilterRule[]>([
    { id: 'filter-entity', field: 'entity', operator: 'contains', value: '' },
    { id: 'filter-status', field: 'status', operator: 'in', value: '' },
  ]);
  const [appliedFilters, setAppliedFilters] = useState<FilterRule[]>([]);
  const [tablePreferences, setTablePreferences] = useState<Record<MetaEntity, TablePreference>>(getInitialTablePreferences);
  const [activePresetByEntity, setActivePresetByEntity] = useState<Record<MetaEntity, string>>({
    campaigns: 'custom',
    adsets: 'custom',
    ads: 'custom',
  });
  const [bulkAction, setBulkAction] = useState('actions');
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [builderContext, setBuilderContext] = useState<BuilderContext>({ mode: 'create', entity: 'campaigns' });

  useEffect(() => {
    setCampaigns(initialCampaigns);
    setAdSets(initialAdSets);
    setAds(initialAds);
    setDrafts(META_DRAFTS.map((draft, index) => ({ ...draft, campaignId: initialCampaigns[index]?.id ?? initialCampaigns[0]?.id })));
    setSelectedCampaignId(null);
    setSelectedAdSetId(null);
    setSelectedRowKeys([]);
  }, [initialAds, initialAdSets, initialCampaigns]);

  useEffect(() => {
    window.localStorage.setItem(TABLE_PREF_STORAGE_KEY, JSON.stringify(tablePreferences));
  }, [tablePreferences]);

  useEffect(() => {
    window.localStorage.setItem(META_CREATION_RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    window.localStorage.setItem(META_CREATION_RUNS_STORAGE_KEY, JSON.stringify(automationRuns));
  }, [automationRuns]);

  useEffect(() => {
    if (selectedCampaignId && !campaigns.some(campaign => campaign.id === selectedCampaignId)) {
      setSelectedCampaignId(null);
      setSelectedAdSetId(null);
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    if (selectedAdSetId && !adSets.some(adSet => adSet.id === selectedAdSetId)) {
      setSelectedAdSetId(null);
    }
  }, [adSets, selectedAdSetId]);

  const campaignIds = useMemo(() => new Set(campaigns.map(campaign => campaign.id)), [campaigns]);
  const selectedCampaign = campaigns.find(campaign => campaign.id === selectedCampaignId) ?? null;
  const normalizedAdSets = useMemo(() => adSets.filter(adSet => campaignIds.has(adSet.campaignId)), [adSets, campaignIds]);
  const selectedAdSet = normalizedAdSets.find(adSet => adSet.id === selectedAdSetId) ?? null;
  const normalizedAds = useMemo(() => ads.filter(ad => campaignIds.has(ad.campaignId)), [ads, campaignIds]);

  const applyFilterRules = <T extends MetaReportRow>(rows: T[]) =>
    rows.filter(row => appliedFilters.every(rule => {
      if (!rule.value.trim()) return true;
      const normalizedValue = rule.value.toLowerCase().trim();
      const fieldValue = (() => {
        if (rule.field === 'entity') return row.name.toLowerCase();
        if (rule.field === 'status') return row.status.toLowerCase();
        return 'clean2';
      })();

      switch (rule.operator) {
        case 'is':
          return fieldValue === normalizedValue;
        case 'is not':
          return fieldValue !== normalizedValue;
        case 'contains':
          return fieldValue.includes(normalizedValue);
        case 'in':
          return normalizedValue.split(',').map(item => item.trim()).filter(Boolean).includes(fieldValue);
        default:
          return true;
      }
    }));

  const visibleCampaigns = useMemo(
    () => applyFilterRules(campaigns.filter(campaign => campaign.name.toLowerCase().includes(searchText.toLowerCase()))),
    [campaigns, searchText, appliedFilters],
  );
  const visibleAdSets = useMemo(() => {
    const base = selectedCampaignId ? normalizedAdSets.filter(adSet => adSet.campaignId === selectedCampaignId) : normalizedAdSets;
    return applyFilterRules(base.filter(adSet => adSet.name.toLowerCase().includes(searchText.toLowerCase())));
  }, [normalizedAdSets, searchText, selectedCampaignId, appliedFilters]);
  const visibleAds = useMemo(() => {
    const base = selectedAdSetId
      ? normalizedAds.filter(ad => ad.adSetId === selectedAdSetId)
      : selectedCampaignId
        ? normalizedAds.filter(ad => ad.campaignId === selectedCampaignId)
        : normalizedAds;
    return applyFilterRules(base.filter(ad => ad.name.toLowerCase().includes(searchText.toLowerCase())));
  }, [normalizedAds, searchText, selectedAdSetId, selectedCampaignId, appliedFilters]);

  const currentPreferences = tablePreferences[entity];
  const visibleColumnKeys = currentPreferences.visibleKeys;
  const heatmapColors = currentPreferences.heatmapColors;

  const handleEntityChange = (next: MetaEntity) => {
    setEntity(next);
    setSelectedRowKeys([]);
  };

  const updateTablePreferences = (target: MetaEntity, patch: Partial<TablePreference>) => {
    setTablePreferences(previous => ({
      ...previous,
      [target]: {
        ...previous[target],
        ...patch,
      },
    }));
    setActivePresetByEntity(previous => ({ ...previous, [target]: 'custom' }));
  };

  const applyTablePreset = (target: MetaEntity, presetId: string) => {
    setActivePresetByEntity(previous => ({ ...previous, [target]: presetId }));
    if (presetId === 'custom') return;
    const preset = TABLE_VIEW_PRESETS[target].find(item => item.id === presetId);
    if (!preset) return;
    setTablePreferences(previous => ({
      ...previous,
      [target]: {
        visibleKeys: preset.keys,
        heatmapColors: preset.heatmaps,
      },
    }));
  };

  const openBuilder = (target: MetaEntity = entity, context?: Partial<BuilderContext>) => {
    setEntity(target);
    setBuilderContext({
      mode: context?.mode ?? 'create',
      entity: target,
      campaign: context?.campaign ?? selectedCampaign,
      adSet: context?.adSet ?? selectedAdSet,
      ad: context?.ad ?? null,
      draft: context?.draft ?? null,
    });
    setBuilderOpen(true);
  };

  const clearCampaignScope = () => {
    setSelectedCampaignId(null);
    setSelectedAdSetId(null);
    setEntity('campaigns');
  };

  const clearAdSetScope = () => {
    setSelectedAdSetId(null);
    setEntity('adsets');
  };

  const renderColumnTitle = (column: MetaColumnConfig, label = column.label) => (
    <div className="flex items-center justify-between gap-1 min-w-0">
      {META_COLUMN_HELP[column.key] ? (
        <Tooltip
          placement="top"
          title={<div className="max-w-[280px] text-xs leading-5">{META_COLUMN_HELP[column.key]}</div>}
        >
          <span className="inline-flex items-center gap-1 min-w-0 cursor-help">
            <span className="truncate">{label}</span>
            <CircleAlert size={13} className="text_tertiary shrink-0" />
          </span>
        </Tooltip>
      ) : (
        <span className="truncate">{label}</span>
      )}
      <div className="shrink-0">
        {column.metric && (
          <HeatmapColorPicker
            column={column}
            selectedColor={HEATMAP_COLORS.find(color => color.id === heatmapColors[column.key])}
            onSelect={colorId => updateTablePreferences(entity, { heatmapColors: { ...heatmapColors, [column.key]: colorId } })}
            onRemove={() => {
              const next = { ...heatmapColors };
              delete next[column.key];
              updateTablePreferences(entity, { heatmapColors: next });
            }}
          />
        )}
      </div>
    </div>
  );

  const renderEntityName = (record: MetaReportRow) => {
    if (isCampaign(record)) {
      return (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate"
            onClick={() => {
              setSelectedCampaignId(record.id);
              setSelectedAdSetId(null);
              handleEntityChange('adsets');
            }}
          >
            {record.name}
          </button>
          <button
            type="button"
            className="border-0 bg-transparent p-0 cursor-pointer text_tertiary shrink-0"
            onClick={() => openBuilder('campaigns', { mode: 'edit', campaign: record })}
            aria-label={`Edit ${record.name}`}
          >
            <Edit3 size={13} />
          </button>
        </div>
      );
    }

    if (isAdSet(record)) {
      return (
        <div className="min-w-0">
          <button
            type="button"
            className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate"
            onClick={() => {
              setSelectedAdSetId(record.id);
              setSelectedCampaignId(record.campaignId);
              handleEntityChange('ads');
            }}
          >
            {record.name}
          </button>
          <div className="text-xs text_tertiary truncate">{getAdSetCampaignName(record, campaigns)}</div>
          <button
            type="button"
            className="mt-1 border-0 bg-transparent p-0 text-xs font-semibold fg_blue_accent cursor-pointer"
            onClick={() => openBuilder('adsets', { mode: 'edit', adSet: record, campaign: campaigns.find(campaign => campaign.id === record.campaignId) ?? null })}
          >
            Edit ad set
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 radius_8 bg_secondary border border_secondary flex items-center justify-center icon_tertiary shrink-0">
          {record.type === 'VIDEO' ? <Play size={16} /> : <Folder size={16} />}
        </div>
        <div className="min-w-0">
          <button
            type="button"
            className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate max-w-60"
            onClick={() => openBuilder('ads', { mode: 'edit', ad: record, adSet: normalizedAdSets.find(adSet => adSet.id === record.adSetId) ?? null, campaign: campaigns.find(campaign => campaign.id === record.campaignId) ?? null })}
          >
            {record.name}
          </button>
          <div className="text-xs text_tertiary truncate">{getAdSetName(record, adSets)}</div>
        </div>
      </div>
    );
  };

  const getHeatmapDomains = (rows: MetaReportRow[]) => {
    const domains: Partial<Record<MetaColumnKey, { min: number; max: number }>> = {};

    META_REPORT_COLUMNS.forEach(column => {
      if (!column.metric) return;
      const values = rows
        .map(row => getMetricValue(row, column.key))
        .filter((value): value is number => typeof value === 'number' && value > 0);

      if (values.length === 0) return;
      domains[column.key] = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return domains;
  };

  const buildColumns = <T extends MetaReportRow>(targetEntity: MetaEntity, rows: T[]): ColumnsType<T> => {
    const entityLabel = targetEntity === 'campaigns' ? 'Campaign' : targetEntity === 'adsets' ? 'Ad Set' : 'Ad';
    const heatmapDomains = getHeatmapDomains(rows);

    return META_REPORT_COLUMNS
      .filter(column => visibleColumnKeys.includes(column.key))
      .map(column => {
        if (column.key === 'action') {
          return {
            title: renderColumnTitle(column),
            key: column.key,
            width: column.width,
            fixed: column.fixed,
            render: (_: unknown, record: T) => (
              <Switch
                size="small"
                checked={record.status === 'ACTIVE'}
                onChange={checked => updateEntityStatus(targetEntity, record.id, checked)}
              />
            ),
          };
        }

        if (column.key === 'entity') {
          return {
            title: renderColumnTitle(column, entityLabel),
            key: column.key,
            width: column.width,
            fixed: column.fixed,
            render: (_: unknown, record: T) => renderEntityName(record),
          };
        }

        if (column.key === 'status') {
          return {
            title: renderColumnTitle(column),
            key: column.key,
            width: column.width,
            render: (_: unknown, record: T) => <StatusBadge label={record.status} variant={statusToVariant(record.status)} />,
          };
        }

        return {
          title: renderColumnTitle(column),
          key: column.key,
          width: column.width,
          align: column.metric ? 'right' : 'left',
          render: (_: unknown, record: T) => {
            const value = getMetricValue(record, column.key);
            const selectedHeatmapColor = HEATMAP_COLORS.find(color => color.id === heatmapColors[column.key]);
            return (
              <span
                className="inline-flex min-w-0 justify-end px-2 py-1 radius_4"
                style={getHeatmapStyle(value, column.key, selectedHeatmapColor, heatmapDomains[column.key])}
              >
                {formatMetricValue(column.key, value)}
              </span>
            );
          },
        };
      }) as ColumnsType<T>;
  };

  const campaignColumns = useMemo(() => buildColumns<Campaign>('campaigns', visibleCampaigns), [visibleColumnKeys, heatmapColors, campaigns, adSets, visibleCampaigns]);
  const adSetColumns = useMemo(() => buildColumns<AdSet>('adsets', visibleAdSets), [visibleColumnKeys, heatmapColors, campaigns, adSets, visibleAdSets]);
  const adColumns = useMemo(() => buildColumns<Ad>('ads', visibleAds), [visibleColumnKeys, heatmapColors, campaigns, adSets, visibleAds]);

  const currentTitle = ENTITY_META[entity].title;
  const activeRows = entity === 'campaigns' ? visibleCampaigns : entity === 'adsets' ? visibleAdSets : visibleAds;
  const selectedRows = activeRows.filter(row => selectedRowKeys.includes(row.id));
  const breadcrumbItems = [
    { key: 'adnetwork', label: 'Adnetwork', onClick: clearCampaignScope },
    { key: 'meta', label: 'Meta', onClick: clearCampaignScope },
    { key: 'app-root', label: 'App', onClick: clearCampaignScope },
    { key: 'app', label: activeApp?.name ?? 'All Apps', onClick: clearCampaignScope, emphasis: true },
    { key: 'campaign-root', label: 'Campaign', onClick: () => setEntity('campaigns') },
    ...(selectedCampaign ? [{ key: 'campaign', label: selectedCampaign.name, onClick: () => { setEntity('adsets'); setSelectedAdSetId(null); }, emphasis: true }] : []),
    ...(entity === 'adsets' || entity === 'ads' || selectedAdSet ? [{ key: 'adset-root', label: 'Ad Set', onClick: () => setEntity('adsets') }] : []),
    ...(selectedAdSet ? [{ key: 'adset', label: selectedAdSet.name, onClick: () => setEntity('ads'), emphasis: true }] : []),
    ...(entity === 'ads' ? [{ key: 'ads-root', label: 'Ads', onClick: () => setEntity('ads') }] : []),
  ];

  const updateEntityStatus = (target: MetaEntity, id: string, enabled: boolean) => {
    const nextStatus = enabled ? 'ACTIVE' : 'PAUSED';
    if (target === 'campaigns') setCampaigns(items => items.map(item => item.id === id ? { ...item, status: nextStatus as Campaign['status'] } : item));
    if (target === 'adsets') setAdSets(items => items.map(item => item.id === id ? { ...item, status: nextStatus as AdSet['status'] } : item));
    if (target === 'ads') setAds(items => items.map(item => item.id === id ? { ...item, status: nextStatus as Ad['status'] } : item));
  };

  const duplicateSelected = () => {
    if (selectedRows.length === 0) {
      toast.info('Select rows to duplicate');
      return;
    }
    const timestamp = Date.now();
    if (entity === 'campaigns') {
      const clones = (selectedRows as Campaign[]).map((item, index) => ({ ...item, id: `${item.id}-copy-${timestamp}-${index}`, name: `${item.name} Copy`, status: 'DRAFT' as Campaign['status'] }));
      setCampaigns(items => [...clones, ...items]);
    }
    if (entity === 'adsets') {
      const clones = (selectedRows as AdSet[]).map((item, index) => ({ ...item, id: `${item.id}-copy-${timestamp}-${index}`, name: `${item.name} Copy`, status: 'DRAFT' as AdSet['status'] }));
      setAdSets(items => [...clones, ...items]);
    }
    if (entity === 'ads') {
      const clones = (selectedRows as Ad[]).map((item, index) => ({ ...item, id: `${item.id}-copy-${timestamp}-${index}`, name: `${item.name} Copy`, status: 'DRAFT' as Ad['status'] }));
      setAds(items => [...clones, ...items]);
    }
    toast.success(`Duplicated ${selectedRows.length} ${ENTITY_META[entity].singular.toLowerCase()}(s)`);
  };

  const deleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.info('Select rows to delete');
      return;
    }
    const selectedIds = new Set(selectedRowKeys.map(String));
    if (entity === 'campaigns') {
      setCampaigns(items => items.filter(item => !selectedIds.has(item.id)));
      setAdSets(items => items.filter(item => !selectedIds.has(item.campaignId)));
      setAds(items => items.filter(item => !selectedIds.has(item.campaignId)));
    }
    if (entity === 'adsets') {
      setAdSets(items => items.filter(item => !selectedIds.has(item.id)));
      setAds(items => items.filter(item => !selectedIds.has(item.adSetId)));
    }
    if (entity === 'ads') setAds(items => items.filter(item => !selectedIds.has(item.id)));
    setSelectedRowKeys([]);
    toast.success(`Deleted ${selectedIds.size} ${ENTITY_META[entity].singular.toLowerCase()}(s)`);
  };

  const applyBulkStatus = (status: 'ACTIVE' | 'PAUSED') => {
    if (selectedRows.length === 0) {
      toast.info('Select rows first');
      return;
    }
    const selectedIds = new Set(selectedRowKeys.map(String));
    if (entity === 'campaigns') setCampaigns(items => items.map(item => selectedIds.has(item.id) ? { ...item, status: status as Campaign['status'] } : item));
    if (entity === 'adsets') setAdSets(items => items.map(item => selectedIds.has(item.id) ? { ...item, status: status as AdSet['status'] } : item));
    if (entity === 'ads') setAds(items => items.map(item => selectedIds.has(item.id) ? { ...item, status: status as Ad['status'] } : item));
    toast.success(`${status === 'ACTIVE' ? 'Activated' : 'Paused'} ${selectedIds.size} row(s)`);
  };

  const runBulkAction = () => {
    if (bulkAction === 'actions') {
      toast.info('Choose a bulk action');
      return;
    }
    if (bulkAction === 'duplicate') duplicateSelected();
    if (bulkAction === 'pause') applyBulkStatus('PAUSED');
    if (bulkAction === 'activate') applyBulkStatus('ACTIVE');
    if (bulkAction === 'delete') deleteSelected();
    setBulkAction('actions');
  };

  const editInspectedRow = (row: MetaReportRow) => {
    if (isCampaign(row)) openBuilder('campaigns', { mode: 'edit', campaign: row });
    if (isAdSet(row)) openBuilder('adsets', { mode: 'edit', adSet: row, campaign: campaigns.find(campaign => campaign.id === row.campaignId) ?? null });
    if (isAd(row)) openBuilder('ads', { mode: 'edit', ad: row, adSet: normalizedAdSets.find(adSet => adSet.id === row.adSetId) ?? null, campaign: campaigns.find(campaign => campaign.id === row.campaignId) ?? null });
  };

  const drillDownInspectedRow = (row: MetaReportRow) => {
    if (isCampaign(row)) {
      setSelectedCampaignId(row.id);
      setSelectedAdSetId(null);
      handleEntityChange('adsets');
    }
    if (isAdSet(row)) {
      setSelectedCampaignId(row.campaignId);
      setSelectedAdSetId(row.id);
      handleEntityChange('ads');
    }
  };

  const saveCreationRecipe = (recipe: MetaCreationRecipe) => {
    setRecipes(items => {
      const exists = items.some(item => item.id === recipe.id);
      return exists ? items.map(item => item.id === recipe.id ? recipe : item) : [recipe, ...items];
    });
  };

  const handleBulkDraftGeneration = (result: MetaBulkGenerationResult, criteria: MetaBulkCriteria) => {
    const generatedCampaigns = result.campaigns.map(campaign => campaign.campaign);
    const generatedAdSets = result.campaigns.flatMap(campaign => campaign.adSets.map(adSet => adSet.adSet));
    const generatedAds = result.campaigns.flatMap(campaign => campaign.adSets.flatMap(adSet => adSet.ads.map(ad => ad.ad)));

    setCampaigns(items => [...generatedCampaigns, ...items]);
    setAdSets(items => [...generatedAdSets, ...items]);
    setAds(items => [...generatedAds, ...items]);
    setDrafts(items => [
      {
        id: result.runId,
        name: `${criteria.name} batch`,
        objective: criteria.objective,
        budget: `$${result.summary.totalDailyBudget} / day`,
        updatedAt: 'just now',
        campaignId: generatedCampaigns[0]?.id,
        progress: {
          campaign: result.summary.campaigns,
          adsets: result.summary.adSets,
          creatives: Math.max(1, criteria.creativeGroups.length),
          ads: result.summary.ads,
          campaignTotal: result.summary.campaigns,
          adsetsTotal: result.summary.adSets,
          creativesTotal: Math.max(1, criteria.creativeGroups.length),
          adsTotal: result.summary.ads,
        },
      },
      ...items,
    ]);
    setAutomationRuns(items => [
      {
        id: result.runId,
        recipeName: criteria.name || 'Untitled Meta recipe',
        createdAt: result.createdAt,
        summary: result.summary,
        status: 'drafted',
      },
      ...items,
    ]);
    setSelectedCampaignId(null);
    setSelectedAdSetId(null);
    setSelectedRowKeys([]);
    setEntity('campaigns');
    setDraftsCollapsed(false);
    setBulkCreateOpen(false);
    toast.success(`Generated ${result.summary.campaigns} campaign draft(s), ${result.summary.adSets} ad set(s), ${result.summary.ads} ad(s)`);
  };

  const discardDrafts = () => {
    if (drafts.length === 0) {
      toast.info('No drafts to discard');
      return;
    }
    setDrafts([]);
    toast.success('All drafts discarded');
  };

  const summaryRows = useMemo(() => {
    const metrics = ['amountSpent', 'appInstalls', 'results', 'purchase', 'linkClicks'] as MetaColumnKey[];
    return metrics.map(metric => ({
      label: META_REPORT_COLUMNS.find(column => column.key === metric)?.label ?? metric,
      value: formatMetricValue(metric, activeRows.reduce((sum, row) => {
        const metricValue = getMetricValue(row, metric);
        return sum + (typeof metricValue === 'number' ? metricValue : 0);
      }, 0)),
    }));
  }, [activeRows]);

  const aggregateMetric = (rows: MetaReportRow[], metric: MetaColumnKey) => {
    const values = rows
      .map(row => getMetricValue(row, metric))
      .filter((value): value is number => typeof value === 'number');

    if (values.length === 0) return '-';
    const averageMetrics: MetaColumnKey[] = ['resultRoas', 'costPerAppInstall', 'cpm', 'costPerResults', 'ctrAll', 'cpcAll', 'cvrInstall', 'ctrInstall', 'costPerLead', 'cvrLeads', 'frequency', 'costPerCompletedRegistration', 'costPerPurchase', 'cpcLinkClick'];
    const total = values.reduce((sum, value) => sum + value, 0);
    return formatMetricValue(metric, averageMetrics.includes(metric) ? total / values.length : total);
  };

  const renderTableSummary = (rows: MetaReportRow[]) => (
    <Table.Summary fixed>
      <Table.Summary.Row className="bg_secondary">
        {META_REPORT_COLUMNS.filter(column => visibleColumnKeys.includes(column.key)).map((column, index) => (
          <Table.Summary.Cell key={column.key} index={index}>
            {column.key === 'action' ? 'T.' :
              column.key === 'entity' ? 'Total' :
              column.metric ? aggregateMetric(rows, column.key) : '-'}
          </Table.Summary.Cell>
        ))}
      </Table.Summary.Row>
    </Table.Summary>
  );

  return (
    <div className="space-y-4">
      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <div className="px-4 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border_secondary">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 radius_8 bg_secondary border border_secondary flex items-center justify-center overflow-hidden">
              <img src="/logo/meta.png" alt="Meta" className="w-7 h-7 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text_primary m-0 leading-none">{activeApp?.name ?? 'Meta Workspace'}</h1>
                <Select className="min-w-64" size="small" value={accountId} onChange={setAccountId} options={META_ACCOUNT_OPTIONS} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text_secondary">
                <span className="inline-flex items-center gap-1 px-2 py-1 radius_4 bg_secondary border border_secondary">
                  <img src="/logo/meta.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  Meta
                </span>
                <span>{activeApp?.package ?? 'App package'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <MetaToolbarButton icon={<RefreshCcw size={14} />} label="Sync page" onClick={() => toast.success('Meta pages synced')} />
            <MetaToolbarButton icon={<Settings size={14} />} label="Manage Pages" onClick={() => setPagesOpen(true)} />
            <MetaToolbarButton icon={<FileText size={14} />} label="Templates" onClick={() => setTemplatesOpen(true)} />
            <MetaToolbarButton icon={<WandSparkles size={14} />} label="AI Bulk Create" onClick={() => setBulkCreateOpen(true)} active={bulkCreateOpen} />
            <Button type="button" variant="border" size="s" className="gap-1.5 fg_accent_primary border_accent_primary_contrast" onClick={() => toast.info('API warm-up is mocked')}>
              <Zap size={14} />
              API Warm-up
            </Button>
          </div>
        </div>
        <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="text-sm text_secondary flex items-center gap-1.5 flex-wrap">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <span className="text_tertiary">/</span>}
                <button
                  type="button"
                  className={cn(
                    'border-0 bg-transparent p-0 text-sm cursor-pointer',
                    item.emphasis ? 'font-medium text_primary' : 'text_secondary',
                  )}
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button type="button" variant="dim" size="s">Today</Button>
            <DatePicker.RangePicker size="small" className="min-w-72" />
          </div>
        </div>
      </div>

      <div className="bg_primary border border_primary radius_8 overflow-hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(open => !open)}
          className="w-full bg-transparent border-0 px-4 py-3 flex items-center justify-between cursor-pointer"
        >
          <span className="text-sm font-semibold text_primary">Customize filters</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="border-0 bg-transparent text-xs text_secondary cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                setDraftFilters([{ id: 'filter-entity', field: 'entity', operator: 'contains', value: '' }, { id: 'filter-status', field: 'status', operator: 'in', value: '' }]);
                setAppliedFilters([]);
              }}
            >
              Clear
            </button>
            <Button
              type="button"
              variant="dim"
              size="s"
              className="gap-1.5"
              onClick={(event) => {
                event.stopPropagation();
                setAppliedFilters(draftFilters.filter(rule => rule.value.trim()));
                toast.success('Filters applied');
              }}
            >
              <Play size={13} />
              Run
            </Button>
            <ChevronDown size={15} className={cn('transition-transform', filtersOpen ? 'rotate-180' : '')} />
          </div>
        </button>
        {filtersOpen && (
          <div className="border-t border_secondary p-4 space-y-3">
            {draftFilters.map(rule => (
              <div key={rule.id} className="grid grid-cols-1 lg:grid-cols-[180px_200px_1fr_auto] gap-3 items-center">
                <Select
                  value={rule.field}
                  options={[
                    { value: 'entity', label: ENTITY_META[entity].singular },
                    { value: 'status', label: 'Status' },
                    { value: 'account', label: 'Account' },
                  ]}
                  onChange={value => setDraftFilters(filters => filters.map(item => item.id === rule.id ? { ...item, field: value } : item))}
                />
                <Segmented
                  size="small"
                  value={rule.operator}
                  options={['is', 'is not', 'contains', 'in']}
                  onChange={value => setDraftFilters(filters => filters.map(item => item.id === rule.id ? { ...item, operator: value as FilterOperator } : item))}
                />
                <Input
                  value={rule.value}
                  placeholder={rule.operator === 'in' ? 'Value 1, Value 2' : 'Type filter value'}
                  onChange={event => setDraftFilters(filters => filters.map(item => item.id === rule.id ? { ...item, value: event.target.value } : item))}
                />
                <Button type="button" variant="danger" size="icon-s" onClick={() => setDraftFilters(filters => filters.filter(item => item.id !== rule.id))}>
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="border"
              size="s"
              className="gap-1.5"
              onClick={() => setDraftFilters(filters => [...filters, { id: `filter-${Date.now()}`, field: 'entity', operator: 'contains', value: '' }])}
            >
              <Plus size={13} />
              Add filter rule
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-semibold text_primary m-0">{currentTitle}</h2>
            <Select
              size="small"
              value={bulkAction}
              className="w-40"
              options={[{ value: 'actions', label: 'Bulk actions' }, { value: 'duplicate', label: 'Duplicate' }, { value: 'pause', label: 'Pause' }, { value: 'activate', label: 'Activate' }, { value: 'delete', label: 'Delete' }]}
              onChange={setBulkAction}
            />
            <Button type="button" variant="border" size="s" onClick={runBulkAction}>Apply</Button>
            {selectedCampaign && entity !== 'campaigns' && (
              <Button type="button" variant="border" size="s" onClick={clearCampaignScope}>Clear campaign scope</Button>
            )}
            {selectedAdSet && entity === 'ads' && (
              <Button type="button" variant="border" size="s" onClick={clearAdSetScope}>Clear ad set scope</Button>
            )}
          </div>
          <div className="flex items-center gap-2 justify-end flex-wrap">
            <Button type="button" variant="border" size="s" className="gap-1.5" onClick={discardDrafts}><Trash2 size={14} /> Discard Drafts ({drafts.length})</Button>
            <Select
              size="small"
              className="w-44"
              value={activePresetByEntity[entity]}
              options={[
                { value: 'custom', label: 'Custom view' },
                ...TABLE_VIEW_PRESETS[entity].map(preset => ({ value: preset.id, label: preset.label })),
              ]}
              onChange={value => applyTablePreset(entity, value)}
            />
            <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => setColumnsOpen(true)}>
              <Columns3 size={14} />
              Columns
            </Button>
            <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => setBulkCreateOpen(true)}>
              <WandSparkles size={14} />
              AI Bulk
            </Button>
            <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => openBuilder(entity)}>
              <Plus size={14} />
              {ENTITY_META[entity].createLabel}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedCampaign && (
            <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg_blue_subtle border border_blue fg_blue_strong">
              Campaign scope: {selectedCampaign.name}
            </span>
          )}
          {selectedAdSet && (
            <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg_amber_subtle border border_amber fg_amber_strong">
              Ad set scope: {selectedAdSet.name}
            </span>
          )}
          {appliedFilters.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg_secondary border border_secondary text_secondary">
              {appliedFilters.length} active filter(s)
            </span>
          )}
        </div>

        <DraftCampaignsPanel
          drafts={drafts}
          collapsed={draftsCollapsed}
          onToggle={() => setDraftsCollapsed(collapsed => !collapsed)}
          onContinue={draft => openBuilder('campaigns', { mode: 'draft', draft, campaign: campaigns.find(campaign => campaign.id === draft.campaignId) ?? null })}
          onDelete={draftId => setDrafts(items => items.filter(item => item.id !== draftId))}
        />

        <EntityTabs
          entity={entity}
          setEntity={handleEntityChange}
          campaignCount={visibleCampaigns.length}
          adSetCount={visibleAdSets.length}
          adCount={visibleAds.length}
          selectedCampaign={selectedCampaign}
          selectedAdSet={selectedAdSet}
        />

        <SelectionInspector
          entity={entity}
          selectedRows={selectedRows}
          campaigns={campaigns}
          adSets={normalizedAdSets}
          ads={normalizedAds}
          onEdit={editInspectedRow}
          onDrillDown={drillDownInspectedRow}
        />

        <div className="bg_primary border border_primary radius_8 overflow-hidden">
          <div className="px-3 py-2 border-b border_secondary flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => openBuilder(entity)}>
                <Plus size={14} />
                Create
              </Button>
              <Button type="button" variant="border" size="s" className="gap-1.5" onClick={duplicateSelected}><Copy size={14} /> Duplicate</Button>
              <Button
                type="button"
                variant="border"
                size="s"
                className="gap-1.5"
                onClick={() => {
                  const first = selectedRows[0];
                  if (!first) return toast.info('Select one row to edit');
                  if (entity === 'campaigns') openBuilder('campaigns', { mode: 'edit', campaign: first as Campaign });
                  if (entity === 'adsets') openBuilder('adsets', { mode: 'edit', adSet: first as AdSet, campaign: campaigns.find(campaign => campaign.id === (first as AdSet).campaignId) ?? null });
                  if (entity === 'ads') openBuilder('ads', { mode: 'edit', ad: first as Ad, adSet: normalizedAdSets.find(adSet => adSet.id === (first as Ad).adSetId) ?? null, campaign: campaigns.find(campaign => campaign.id === (first as Ad).campaignId) ?? null });
                }}
              >
                <Edit3 size={14} /> Edit
              </Button>
              <Button type="button" variant={analysisOpen ? 'primary' : 'border'} size="s" className="gap-1.5" onClick={() => setAnalysisOpen(open => !open)}><BarChart3 size={14} /> Analyze</Button>
              <Button type="button" variant="border" size="s" className="gap-1.5" onClick={deleteSelected}>More <MoreHorizontal size={14} /></Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                size="small"
                prefix={<Search size={13} className="text_tertiary" />}
                placeholder={`Search ${ENTITY_META[entity].singular.toLowerCase()}s`}
                value={searchText}
                onChange={event => setSearchText(event.target.value)}
                allowClear
                className="w-64"
              />
              <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => setColumnsOpen(true)}>
                <Filter size={14} />
                Columns: {visibleColumnKeys.length}
              </Button>
            </div>
          </div>

          {analysisOpen && (
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 px-3 py-3 border-b border_secondary bg_secondary">
              {summaryRows.map(item => (
                <div key={item.label} className="bg_primary border border_primary radius_8 px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase text_tertiary">{item.label}</div>
                  <div className="text-base font-semibold text_primary mt-1">{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {entity === 'campaigns' && (
            <DataTable<Campaign>
              columns={campaignColumns}
              dataSource={visibleCampaigns}
              rowKey="id"
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              pagination={{ pageSize: 50 }}
              scroll={{ x: 'max-content', y: 430 }}
              summary={() => renderTableSummary(visibleCampaigns)}
            />
          )}

          {entity === 'adsets' && (
            <DataTable<AdSet>
              columns={adSetColumns}
              dataSource={visibleAdSets}
              rowKey="id"
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              pagination={{ pageSize: 50 }}
              scroll={{ x: 'max-content', y: 430 }}
              summary={() => renderTableSummary(visibleAdSets)}
              emptyTitle={selectedCampaign ? 'No ad sets in this campaign' : 'No ad sets'}
              emptyDescription="Create or select a campaign to manage Meta ad sets."
            />
          )}

          {entity === 'ads' && (
            <DataTable<Ad>
              columns={adColumns}
              dataSource={visibleAds}
              rowKey="id"
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              pagination={{ pageSize: 50 }}
              scroll={{ x: 'max-content', y: 430 }}
              summary={() => renderTableSummary(visibleAds)}
              emptyTitle={selectedAdSet ? 'No ads in this ad set' : 'No ads'}
              emptyDescription="Create or select an ad set to manage Meta ads."
            />
          )}
        </div>

        <div className="text-xs text_secondary">
          {selectedRowKeys.length} of {activeRows.length} row(s) selected
        </div>
      </div>

      <ManagePagesModal open={pagesOpen} onClose={() => setPagesOpen(false)} pages={pages} onChange={setPages} />
      <TemplateDrawer open={templatesOpen} onClose={() => setTemplatesOpen(false)} templates={templates} pages={pages} onChange={setTemplates} />
      <ColumnSettingsDrawer
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        entity={entity}
        visibleKeys={visibleColumnKeys}
        heatmapColors={heatmapColors}
        onVisibleKeysChange={keys => updateTablePreferences(entity, { visibleKeys: keys })}
        onHeatmapColorsChange={colors => updateTablePreferences(entity, { heatmapColors: colors })}
      />
      <MetaBuilderDrawer open={builderOpen} onClose={() => setBuilderOpen(false)} context={builderContext} pages={pages} templates={templates} />
      <MetaBulkCreateDrawer
        open={bulkCreateOpen}
        onClose={() => setBulkCreateOpen(false)}
        appName={activeApp?.name ?? 'Meta App'}
        projectId={activeApp?.id ?? appId ?? 'p1'}
        accountName={META_ACCOUNT_OPTIONS.find(account => account.value === accountId)?.label ?? 'Clean2'}
        pages={pages}
        existingCampaignNames={campaigns.map(campaign => campaign.name)}
        recipes={recipes}
        runs={automationRuns}
        onSaveRecipe={saveCreationRecipe}
        onGenerate={handleBulkDraftGeneration}
      />
    </div>
  );
};

export default MetaWorkspace;
