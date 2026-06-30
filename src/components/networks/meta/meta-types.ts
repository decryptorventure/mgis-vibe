// Meta workspace type definitions — all shared interfaces and union types
import type { Campaign, AdSet, Ad } from '@/shared/mock-data';

export type MetaEntity = 'campaigns' | 'adsets' | 'ads';
export type MetaReportRow = Campaign | AdSet | Ad;
export type FilterField = 'entity' | 'status' | 'account';
export type FilterOperator = 'is' | 'is not' | 'contains' | 'in';
export type MetaColumnKey =
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

export interface MetaColumnConfig {
  key: MetaColumnKey;
  label: string;
  width: number;
  fixed?: 'left' | 'right';
  metric?: boolean;
  defaultVisible?: boolean;
}

export interface HeatmapColor {
  id: string;
  label: string;
  rgb: string;
}

export interface MetaWorkspaceProps {
  network: string;
  networkLabel: string;
}

export interface MetaTemplate {
  id: string;
  name: string;
  objective: 'Sales' | 'App promotions';
  age: string;
  attribution: string;
  placements: string[];
  account?: { id: string; name: string };
}

export interface MetaPage {
  id: string;
  name: string;
  instagramId: string;
  status: 'Synced' | 'Needs review';
}

export interface DraftCampaign {
  id: string;
  name: string;
  objective: string;
  budget: string;
  updatedAt: string;
  campaignId?: string;
  currentStep?: 'campaign' | 'adset' | 'creative';
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

export interface FilterRule {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string;
}

export interface BuilderContext {
  mode: 'create' | 'edit' | 'draft';
  entity: MetaEntity;
  campaign?: Campaign | null;
  adSet?: AdSet | null;
  ad?: Ad | null;
  draft?: DraftCampaign | null;
  initialStep?: string;
}

export interface TablePreference {
  visibleKeys: MetaColumnKey[];
  heatmapColors: Partial<Record<MetaColumnKey, string>>;
}
