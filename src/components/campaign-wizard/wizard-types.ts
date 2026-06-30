import type { ActiveNetworkKey } from '@/shared/navigation';

export type CampaignObjective = 'installs' | 'roas' | 'events';
export type BudgetMode = 'per-network' | 'shared';
export type GoogleBidStrategy = 'target_cpi' | 'target_roas';
export type MetaOptimization = 'installs' | 'app_events' | 'value';
export type MetaPlacementType = 'advantage' | 'manual';
export type MetaManualPlacement =
  | 'facebook_feed'
  | 'instagram_feed'
  | 'audience_network'
  | 'messenger';
export type AsaMatchType = 'EXACT' | 'BROAD';
export type AsaDeviceType = 'both' | 'iphone' | 'ipad';
export type AxonOptimization = 'cpi' | 'cpa' | 'roas';

export interface GoogleTargetingConfig {
  bidStrategy: GoogleBidStrategy;
  targetCpi: number;
  countries: string[];
  headlines: string[];
  descriptions: string[];
}

export interface MetaTargetingConfig {
  optimization: MetaOptimization;
  locations: string[];
  lookalike: string[];
  placementType: MetaPlacementType;
  manualPlacements: MetaManualPlacement[];
}

export interface AsaTargetingConfig {
  keywords: string;
  matchType: AsaMatchType;
  defaultBid: number;
  deviceType: AsaDeviceType;
}

export interface AxonTargetingConfig {
  optimization: AxonOptimization;
  baseBid: number;
  targetCpa: number;
}

export interface MolocoTargetingConfig {
  exchanges: string[];
  enableBlocklist: boolean;
}

export interface CampaignNetworkTargetingMap {
  'google-ads': GoogleTargetingConfig;
  meta: MetaTargetingConfig;
  asa: AsaTargetingConfig;
  axon: AxonTargetingConfig;
  moloco: MolocoTargetingConfig;
}

export type CampaignTargetingState = Partial<CampaignNetworkTargetingMap>;

export interface CampaignPostbackEvent {
  key: string;
  eventName: string;
  sdkEvent: string;
}

export interface CampaignWizardState {
  projectId: string;
  baseName: string;
  objective: CampaignObjective;
  selectedNetworks: ActiveNetworkKey[];
  lockedNetwork: ActiveNetworkKey | null;
  budgetMode: BudgetMode;
  sharedBudget: number;
  perNetworkBudget: Partial<Record<ActiveNetworkKey, number>>;
  budgetSplit: Partial<Record<ActiveNetworkKey, number>>;
  targeting: CampaignTargetingState;
  selectedMediaIds: string[];
  trackingUrl: string;
  postbackEvents: CampaignPostbackEvent[];
}

export type CampaignWizardStateUpdate = Partial<CampaignWizardState>;

const DEFAULT_POSTBACK_EVENTS: CampaignPostbackEvent[] = [
  { key: '1', eventName: 'install', sdkEvent: 'af_install' },
  { key: '2', eventName: 'purchase', sdkEvent: 'af_purchase' },
];

const coerceStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined;

const coerceNetworkList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is ActiveNetworkKey =>
      item === 'google-ads' || item === 'meta' || item === 'asa' || item === 'axon' || item === 'moloco')
    : undefined;

const coerceNumberRecord = (value: unknown) => {
  if (!value || typeof value !== 'object') return undefined;

  const entries = Object.entries(value).filter(([key, item]) =>
    (key === 'google-ads' || key === 'meta' || key === 'asa' || key === 'axon' || key === 'moloco')
    && typeof item === 'number');

  return Object.fromEntries(entries) as Partial<Record<ActiveNetworkKey, number>>;
};

const coercePostbackEvents = (value: unknown) => {
  if (!Array.isArray(value)) return undefined;

  const events = value
    .filter((item): item is CampaignPostbackEvent =>
      !!item
      && typeof item === 'object'
      && typeof item.key === 'string'
      && typeof item.eventName === 'string'
      && typeof item.sdkEvent === 'string');

  return events.length > 0 ? events : undefined;
};

const coerceTargeting = (value: unknown): CampaignTargetingState | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  return value as CampaignTargetingState;
};

export const createInitialCampaignWizardState = (
  defaultNetwork?: ActiveNetworkKey,
): CampaignWizardState => ({
  projectId: 'p1',
  baseName: 'iG_Hot_Pot_Promo',
  objective: 'installs',
  selectedNetworks: defaultNetwork ? [defaultNetwork] : [],
  lockedNetwork: defaultNetwork ?? null,
  budgetMode: 'per-network',
  sharedBudget: 5000,
  perNetworkBudget: {},
  budgetSplit: {},
  targeting: {},
  selectedMediaIds: [],
  trackingUrl: 'https://app.appsflyer.com/com.ig.hotpot?pid=campaign_wizard',
  postbackEvents: DEFAULT_POSTBACK_EVENTS,
});

export const mergeCampaignWizardState = (
  value: unknown,
  defaultNetwork?: ActiveNetworkKey,
): CampaignWizardState | null => {
  if (!value || typeof value !== 'object') return null;

  const draft = value as Partial<CampaignWizardState>;
  const initialState = createInitialCampaignWizardState(defaultNetwork);

  return {
    ...initialState,
    ...(typeof draft.projectId === 'string' ? { projectId: draft.projectId } : {}),
    ...(typeof draft.baseName === 'string' ? { baseName: draft.baseName } : {}),
    ...(draft.objective === 'installs' || draft.objective === 'roas' || draft.objective === 'events'
      ? { objective: draft.objective }
      : {}),
    ...(draft.budgetMode === 'per-network' || draft.budgetMode === 'shared'
      ? { budgetMode: draft.budgetMode }
      : {}),
    ...(typeof draft.sharedBudget === 'number' ? { sharedBudget: draft.sharedBudget } : {}),
    ...(coerceNetworkList(draft.selectedNetworks) ? { selectedNetworks: coerceNetworkList(draft.selectedNetworks)! } : {}),
    ...(draft.lockedNetwork === null
      || draft.lockedNetwork === 'google-ads'
      || draft.lockedNetwork === 'meta'
      || draft.lockedNetwork === 'asa'
      || draft.lockedNetwork === 'axon'
      || draft.lockedNetwork === 'moloco'
      ? { lockedNetwork: draft.lockedNetwork }
      : {}),
    ...(coerceNumberRecord(draft.perNetworkBudget) ? { perNetworkBudget: coerceNumberRecord(draft.perNetworkBudget)! } : {}),
    ...(coerceNumberRecord(draft.budgetSplit) ? { budgetSplit: coerceNumberRecord(draft.budgetSplit)! } : {}),
    ...(coerceTargeting(draft.targeting) ? { targeting: coerceTargeting(draft.targeting)! } : {}),
    ...(coerceStringArray(draft.selectedMediaIds) ? { selectedMediaIds: coerceStringArray(draft.selectedMediaIds)! } : {}),
    ...(typeof draft.trackingUrl === 'string' ? { trackingUrl: draft.trackingUrl } : {}),
    ...(coercePostbackEvents(draft.postbackEvents) ? { postbackEvents: coercePostbackEvents(draft.postbackEvents)! } : {}),
    ...(defaultNetwork
      ? {
          selectedNetworks: [defaultNetwork],
          lockedNetwork: defaultNetwork,
        }
      : {}),
  };
};
