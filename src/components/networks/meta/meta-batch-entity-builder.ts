// meta-batch-entity-builder.ts — turns completed BatchJobs into draft Campaign/AdSet/Ad records
// (ports the "materialize as drafts" behavior from the retired AI Bulk Create flow)
import type { Campaign, AdSet, Ad } from '@/shared/mock-data';
import type { BatchAdCopy, BatchJob } from './meta-batch-types';

export function buildDraftEntitiesFromBatchJobs(
  jobs: BatchJob[],
  adCopy: BatchAdCopy,
  projectId: string,
  runId: string,
): { campaigns: Campaign[]; adSets: AdSet[]; ads: Ad[] } {
  const now = new Date().toISOString().slice(0, 10);
  const campaigns: Campaign[] = [];
  const adSets: AdSet[] = [];
  const ads: Ad[] = [];

  // runId keeps IDs unique per generation — without it, regenerating the same
  // template/theme/slice combo would collide with the campaign/adset/ad IDs
  // already materialized from the previous run.
  jobs.filter(job => job.status === 'done').forEach(job => {
    const name = job.combination.generatedNames[job.sliceIndex] ?? job.combination.generatedNames[0];
    const campaignId = `batch-${runId}-${job.combination.id}-${job.sliceIndex}-c`;
    const adSetId = `${campaignId}-as`;

    campaigns.push({
      id: campaignId,
      name,
      network: 'meta',
      status: 'DRAFT',
      budget: 0,
      spend: 0,
      impressions: 0,
      clicks: 0,
      installs: 0,
      cpa: 0,
      roas: 0,
      createdAt: now,
      updatedAt: now,
      projectId,
      costCenter: 'Batch Generator',
    });

    adSets.push({
      id: adSetId,
      name: `${name} - AdSet`,
      campaignId,
      status: 'DRAFT',
      budget: 0,
      spend: 0,
      targeting: job.combination.template.attribution,
      impressions: 0,
      clicks: 0,
      installs: 0,
    });

    ads.push({
      id: `${adSetId}-ad-1`,
      name: `${name} - Ad`,
      adSetId,
      campaignId,
      status: 'DRAFT',
      type: 'VIDEO',
      impressions: 0,
      clicks: 0,
      installs: 0,
      spend: 0,
      creativeName: adCopy.headline || 'Batch creative',
    });
  });

  return { campaigns, adSets, ads };
}
