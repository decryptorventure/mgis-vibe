// Google UAC workspace — types, step config, constants
import { NETWORK_CONFIGS } from '@/shared/network-config';

export const GOOGLE_COLOR = NETWORK_CONFIGS['google-ads'].color; // #4285f4

export type GoogleLocationMode = 'all' | 'enter' | 'bulk-include' | 'bulk-exclude';
export type GoogleBiddingFocus = 'installs' | 'actions' | 'roas';

export interface GoogleBuilderState {
  campaignName: string;
  os: 'ios' | 'android';
  account: string;
  locationMode: GoogleLocationMode;
  locationIncludePresence: boolean;
  locationExcludePresence: boolean;
  budget: string;
  biddingFocus: GoogleBiddingFocus;
  targetValue: string;
  adgroupName: string;
  titles: string[];
  descriptions: string[];
  videoUrls: string[];
  bulkTitles: string;
  bulkDescriptions: string;
  bulkVideos: string;
}

export const defaultBuilderState: GoogleBuilderState = {
  campaignName: '',
  os: 'android',
  account: 'Brain 3',
  locationMode: 'all',
  locationIncludePresence: true,
  locationExcludePresence: true,
  budget: '',
  biddingFocus: 'installs',
  targetValue: '',
  adgroupName: '',
  titles: ['', '', '', '', ''],
  descriptions: ['', '', '', '', ''],
  videoUrls: [],
  bulkTitles: '',
  bulkDescriptions: '',
  bulkVideos: '',
};

export const googleBuilderSteps = [
  { key: 'objective', title: 'Objective', hint: 'App + name + OS', state: 'done' as const },
  { key: 'settings', title: 'Campaign Settings', hint: 'Account + location', state: 'done' as const },
  { key: 'budget', title: 'Budget and Bidding', hint: 'Amount required', state: 'warn' as const },
  { key: 'adgroup', title: 'Adgroup', hint: 'Titles + creatives', state: 'warn' as const },
];

export const GOOGLE_ACCOUNTS = [
  { value: 'brain3', label: 'Brain 3' },
  { value: 'brain1', label: 'Brain 1' },
  { value: 'hsv', label: 'HSV Games' },
];

export const BIDDING_GOALS = [
  { value: 'installs', label: 'Installs', desc: 'Maximize app downloads', hint: 'Target CPI' },
  { value: 'actions', label: 'In-App Actions', desc: 'Optimize for specific events', hint: 'Target CPA' },
  { value: 'roas', label: 'ROAS', desc: 'Maximize return on ad spend', hint: 'Target ROAS' },
] as const;
