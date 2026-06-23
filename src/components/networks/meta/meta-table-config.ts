// Meta workspace data constants — account options, templates, pages, drafts,
// column definitions, heatmap colors, presets, and storage keys
import React from 'react';
import { Megaphone, Layers3, PanelRightOpen } from 'lucide-react';
import type {
  MetaEntity,
  MetaColumnKey,
  MetaColumnConfig,
  HeatmapColor,
  MetaTemplate,
  MetaPage,
  DraftCampaign,
  TablePreference,
} from './meta-types';
export { META_COLUMN_HELP } from './meta-column-help-text';

export const META_ACCOUNT_OPTIONS = [
  { value: 'act_2155186641586053', label: 'Clean2 - act_2155186641586053' },
  { value: 'act_2531941187142628', label: 'Clean backup - act_2531941187142628' },
];

export const META_TEMPLATES: MetaTemplate[] = [
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

export const META_PAGES: MetaPage[] = [
  { id: '105774139182217', name: 'Kai Krypton - Simp for Gadgets', instagramId: '17841459691905085', status: 'Synced' },
  { id: '119426224469734', name: 'Limpiador: Liberar espacio', instagramId: '17841465225860539', status: 'Synced' },
  { id: '110244858724859', name: 'Volume Booster - Begamob Global', instagramId: '17841459088022798', status: 'Synced' },
  { id: '103538695995551', name: 'Word Office - PDF, Word, Excel', instagramId: '17841457868248868', status: 'Needs review' },
  { id: '100458496125693', name: 'Global APP Developer', instagramId: '17841454564501090', status: 'Synced' },
];

export const META_DRAFTS: DraftCampaign[] = [
  {
    id: 'draft-1',
    name: 'New Campaign Sales',
    objective: 'Sales',
    budget: '$1 / day',
    updatedAt: '4 days ago',
    currentStep: 'adset',
    progress: { campaign: 1, adsets: 0, creatives: 0, ads: 0 },
  },
  {
    id: 'draft-2',
    name: 'New Campaign Sales Copy',
    objective: 'Sales',
    budget: '$1 / day',
    updatedAt: '4 days ago',
    currentStep: 'creative',
    progress: { campaign: 1, adsets: 0, creatives: 0, ads: 0 },
  },
];

export const ENTITY_META: Record<MetaEntity, { title: string; singular: string; createLabel: string; icon: React.ReactNode }> = {
  campaigns: { title: 'CAMPAIGN', singular: 'Campaign', createLabel: 'Create Campaign', icon: React.createElement(Megaphone, { size: 16 }) },
  adsets: { title: 'ADSET', singular: 'Ad Set', createLabel: 'Create Ad Set', icon: React.createElement(Layers3, { size: 16 }) },
  ads: { title: 'ADS', singular: 'Ad', createLabel: 'Create Ad', icon: React.createElement(PanelRightOpen, { size: 16 }) },
};

export const META_REPORT_COLUMNS: MetaColumnConfig[] = [
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

export const HEATMAP_COLORS: HeatmapColor[] = [
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

export const DEFAULT_VISIBLE_BY_ENTITY: Record<MetaEntity, MetaColumnKey[]> = {
  campaigns: ['action', 'entity', 'status', 'account', 'createdAt', 'bidStrategy', 'budget', 'amountSpent', 'resultRoas', 'appInstalls', 'costPerAppInstall', 'results', 'costPerResults', 'ctrAll', 'cpm', 'linkClicks', 'cpcLinkClick'],
  adsets: ['action', 'entity', 'status', 'account', 'bidStrategy', 'budget', 'amountSpent', 'appInstalls', 'costPerAppInstall', 'results', 'costPerResults', 'ctrAll', 'cvrInstall', 'reach', 'frequency', 'linkClicks', 'cpcLinkClick'],
  ads: ['action', 'entity', 'status', 'account', 'amountSpent', 'resultRoas', 'appInstalls', 'costPerAppInstall', 'ctrAll', 'cpcAll', 'cpm', 'purchase', 'costPerPurchase', 'linkClicks', 'cpcLinkClick'],
};

// Storage keys — these strings MUST remain byte-identical for localStorage compatibility
export const TABLE_PREF_STORAGE_KEY = 'nms_meta_workspace_table_preferences_v2';
export const META_CREATION_RECIPES_STORAGE_KEY = 'nms_meta_creation_recipes_v1';
export const META_CREATION_RUNS_STORAGE_KEY = 'nms_meta_creation_runs_v1';

export const TABLE_VIEW_PRESETS: Record<MetaEntity, { id: string; label: string; keys: MetaColumnKey[]; heatmaps: Partial<Record<MetaColumnKey, string>> }[]> = {
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

export const METRIC_POLARITY: Partial<Record<MetaColumnKey, 'higher' | 'lower'>> = {
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

export const createDefaultTablePreferences = (): Record<MetaEntity, TablePreference> => ({
  campaigns: { visibleKeys: DEFAULT_VISIBLE_BY_ENTITY.campaigns, heatmapColors: {} },
  adsets: { visibleKeys: DEFAULT_VISIBLE_BY_ENTITY.adsets, heatmapColors: {} },
  ads: { visibleKeys: DEFAULT_VISIBLE_BY_ENTITY.ads, heatmapColors: {} },
});
