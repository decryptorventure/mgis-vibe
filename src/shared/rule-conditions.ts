// ============================
// Typed condition/action definitions + templates for Network-Aware Automation Rules
// ============================

export interface ConditionDef {
  key: string;
  label: string;
  networks: string[] | 'all';
  paramLabel: string;
  paramType: 'number' | 'percent' | 'country-select';
  defaultValue: number;
}

export interface ActionDef {
  key: string;
  label: string;
  networks: string[] | 'all';
  paramLabel?: string;
  paramType?: 'number' | 'percent' | 'country-select' | 'none';
}

export interface RuleTemplate {
  id: string;
  name: string;
  network: string;
  conditionKey: string;
  conditionParam: number;
  actionKey: string;
  actionParam?: number;
  scheduleMinutes: 15 | 60 | 1440;
  description: string;
}

export const CONDITION_DEFS: ConditionDef[] = [
  // All networks
  { key: 'spend_gt',         label: 'Daily Spend >',          networks: 'all', paramLabel: 'Amount ($)',    paramType: 'number',  defaultValue: 500 },
  { key: 'cpa_gt',           label: 'CPA >',                  networks: 'all', paramLabel: 'CPA ($)',       paramType: 'number',  defaultValue: 2.00 },
  { key: 'roas_lt',          label: 'ROAS <',                 networks: 'all', paramLabel: 'ROAS',          paramType: 'number',  defaultValue: 1.5 },
  { key: 'installs_lt',      label: 'Daily Installs <',       networks: 'all', paramLabel: 'Installs',      paramType: 'number',  defaultValue: 10 },
  { key: 'budget_pct_gt',    label: 'Budget Used >',          networks: 'all', paramLabel: 'Budget %',      paramType: 'percent', defaultValue: 80 },
  // Google-only
  { key: 'impression_share_lt', label: 'Impression Share <', networks: ['Google', 'Google Ads'], paramLabel: 'Share %', paramType: 'percent', defaultValue: 30 },
  { key: 'quality_score_lt',    label: 'Quality Score <',    networks: ['Google', 'Google Ads'], paramLabel: 'Score',   paramType: 'number',  defaultValue: 5 },
  // Meta-only
  { key: 'relevance_score_lt', label: 'Relevance Score <',   networks: ['Meta'], paramLabel: 'Score',      paramType: 'number',  defaultValue: 3 },
  { key: 'frequency_gt',       label: 'Ad Frequency >',      networks: ['Meta'], paramLabel: 'Frequency',  paramType: 'number',  defaultValue: 3.5 },
  // ASA-only
  { key: 'search_match_rate_lt', label: 'Search Match Rate <', networks: ['ASA'], paramLabel: 'Rate %',   paramType: 'percent', defaultValue: 20 },
  { key: 'keyword_cpa_gt',       label: 'Keyword CPA >',       networks: ['ASA'], paramLabel: 'CPA ($)',  paramType: 'number',  defaultValue: 1.50 },
  // Axon-only
  { key: 'country_bid_cpa_gt',     label: 'Country Bid CPA >',      networks: ['Axon'], paramLabel: 'CPA ($)',     paramType: 'number',  defaultValue: 1.00 },
  { key: 'recommendation_count_gt', label: 'Pending Recommendations >', networks: ['Axon'], paramLabel: 'Count',  paramType: 'number',  defaultValue: 3 },
  // Moloco-only
  { key: 'blocked_publisher_pct_gt', label: 'Blocked Publisher % >', networks: ['Moloco'], paramLabel: 'Blocked %', paramType: 'percent', defaultValue: 20 },
  { key: 'exchange_cpa_gt',          label: 'Exchange CPA >',        networks: ['Moloco'], paramLabel: 'CPA ($)',   paramType: 'number',  defaultValue: 2.00 },
];

export const ACTION_DEFS: ActionDef[] = [
  // All networks
  { key: 'pause_campaign',    label: 'Pause Campaign',        networks: 'all', paramType: 'none' },
  { key: 'increase_budget',   label: 'Increase Budget by',    networks: 'all', paramLabel: 'Percent %', paramType: 'percent' },
  { key: 'decrease_budget',   label: 'Decrease Budget by',    networks: 'all', paramLabel: 'Percent %', paramType: 'percent' },
  { key: 'send_alert',        label: 'Send Alert',            networks: 'all', paramType: 'none' },
  // Google-only
  { key: 'adjust_target_cpi', label: 'Adjust Target CPI by',  networks: ['Google', 'Google Ads'], paramLabel: 'Percent %', paramType: 'percent' },
  { key: 'pause_asset_group', label: 'Pause Asset Group',     networks: ['Google', 'Google Ads'], paramType: 'none' },
  // Meta-only
  { key: 'increase_lookalike_pct',   label: 'Increase Lookalike %', networks: ['Meta'], paramLabel: 'Percent %', paramType: 'percent' },
  { key: 'switch_to_advantage_plus', label: 'Switch to Advantage+', networks: ['Meta'], paramType: 'none' },
  // Axon-only
  { key: 'adjust_country_bid',       label: 'Adjust Country Bid by',    networks: ['Axon'], paramLabel: 'Percent %', paramType: 'percent' },
  { key: 'apply_axon_recommendation', label: 'Apply Axon Recommendation', networks: ['Axon'], paramType: 'none' },
  // Moloco-only
  { key: 'add_to_publisher_blocklist', label: 'Add to Publisher Blocklist', networks: ['Moloco'], paramType: 'none' },
  { key: 'adjust_exchange_bid',        label: 'Adjust Exchange Bid by',     networks: ['Moloco'], paramLabel: 'Percent %', paramType: 'percent' },
];

/** Returns conditions available for a given network (includes 'all' conditions) */
export function getConditionsForNetwork(network: string): ConditionDef[] {
  return CONDITION_DEFS.filter(c =>
    c.networks === 'all' ||
    (Array.isArray(c.networks) && c.networks.includes(network))
  );
}

/** Returns actions available for a given network (includes 'all' actions) */
export function getActionsForNetwork(network: string): ActionDef[] {
  return ACTION_DEFS.filter(a =>
    a.networks === 'all' ||
    (Array.isArray(a.networks) && a.networks.includes(network))
  );
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Budget Pacing Alert',
    network: 'All',
    conditionKey: 'budget_pct_gt',
    conditionParam: 80,
    actionKey: 'send_alert',
    scheduleMinutes: 60,
    description: 'Alert when campaign has consumed more than 80% of its daily budget.',
  },
  {
    id: 'tpl-2',
    name: 'High CPA Pause',
    network: 'All',
    conditionKey: 'cpa_gt',
    conditionParam: 2.00,
    actionKey: 'pause_campaign',
    scheduleMinutes: 60,
    description: 'Pause campaign when CPA exceeds threshold to prevent budget waste.',
  },
  {
    id: 'tpl-3',
    name: 'Low ROAS Scale Down',
    network: 'All',
    conditionKey: 'roas_lt',
    conditionParam: 1.5,
    actionKey: 'decrease_budget',
    actionParam: 20,
    scheduleMinutes: 1440,
    description: 'Decrease budget by 20% when ROAS drops below 1.5.',
  },
  {
    id: 'tpl-4',
    name: 'Google Impression Share',
    network: 'Google Ads',
    conditionKey: 'impression_share_lt',
    conditionParam: 30,
    actionKey: 'increase_budget',
    actionParam: 15,
    scheduleMinutes: 1440,
    description: 'Increase budget by 15% when impression share drops below 30%.',
  },
  {
    id: 'tpl-5',
    name: 'Meta Frequency Cap',
    network: 'Meta',
    conditionKey: 'frequency_gt',
    conditionParam: 3.5,
    actionKey: 'pause_campaign',
    scheduleMinutes: 60,
    description: 'Pause campaign when ad frequency exceeds 3.5 to avoid audience fatigue.',
  },
  {
    id: 'tpl-6',
    name: 'Axon Country Bid Optimize',
    network: 'Axon',
    conditionKey: 'country_bid_cpa_gt',
    conditionParam: 1.00,
    actionKey: 'adjust_country_bid',
    actionParam: -10,
    scheduleMinutes: 1440,
    description: 'Decrease country bid by 10% when country-level CPA exceeds threshold.',
  },
];
