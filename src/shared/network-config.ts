// ─── network-config.ts — single entry point for network config system ────────
// Re-exports everything from the split per-network config modules.
// Import from here, not from sub-files, for stable import paths.

export type { NetworkConfig, NetworkColumnConfig } from './network-configs/types';
export { NETWORK_ROUTES, getNetworkFromPath } from './network-configs/types';
export { googleAdsConfig } from './network-configs/google-ads-config';
export { metaConfig } from './network-configs/meta-config';
export { asaConfig } from './network-configs/asa-config';
export { axonConfig } from './network-configs/axon-config';
export { molocoConfig } from './network-configs/moloco-config';

import { googleAdsConfig } from './network-configs/google-ads-config';
import { metaConfig } from './network-configs/meta-config';
import { asaConfig } from './network-configs/asa-config';
import { axonConfig } from './network-configs/axon-config';
import { molocoConfig } from './network-configs/moloco-config';
import type { NetworkConfig } from './network-configs/types';

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  'google-ads': googleAdsConfig,
  'meta': metaConfig,
  'asa': asaConfig,
  'axon': axonConfig,
  'moloco': molocoConfig,
};

export const NETWORK_LOGOS: Record<string, string> = {
  'google-ads': '/logo/google-ads.png',
  'meta': '/logo/meta.png',
  'asa': '/logo/asa.svg',
  'axon': '/logo/axon.svg',
  'moloco': '/logo/moloco.png',
};
