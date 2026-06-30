// ─── NetworkConfig types — shared across all network workspace modules ───────
import React from 'react';
import type { TabsProps } from '@/components/ui-kit-compat';
import type { Campaign } from '@/shared/mock-data';
import { ACTIVE_NETWORK_KEYS, isActiveNetworkKey } from '@/shared/navigation';

export interface NetworkColumnConfig {
  dataIndex: string;
  title: string;
  width?: number;
  render?: (value: unknown, record: Campaign) => React.ReactNode;
}

export interface NetworkConfig {
  /** Unique key: 'google-ads' | 'meta' | 'asa' | 'axon' | 'moloco' */
  key: string;
  /** Display label */
  label: string;
  /** Brand accent color */
  color: string;
  /** Icon element for PageHeader */
  icon: React.ReactNode;
  /** Extra columns appended after base columns in the campaign table */
  extraColumns: NetworkColumnConfig[];
  /** Additional tabs beyond Campaigns / Insights / Settings */
  extraTabs?: TabsProps['items'];
  /** Label for the primary create button */
  createButtonLabel: string;
  /**
   * Render function for the Insights tab body.
   * Use a function (not static element) so hooks inside work correctly.
   */
  insightsContent: () => React.ReactNode;
}

export const NETWORK_ROUTES = ACTIVE_NETWORK_KEYS;

export function getNetworkFromPath(pathname: string): string | null {
  const appScopedMatch = pathname.match(/^\/apps\/[^/]+\/networks\/([^/]+)/);
  const networkKey = appScopedMatch?.[1];
  return isActiveNetworkKey(networkKey) ? networkKey : null;
}
