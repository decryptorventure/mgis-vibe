import type { Ad, AdSet, Campaign } from '@/shared/mock-data';

export type MetaBulkBudgetLevel = 'campaign' | 'adset';
export type MetaBulkObjective = 'Sales' | 'App promotions';
export type MetaBulkGender = 'All' | 'Men' | 'Women';
export type MetaPreflightSeverity = 'error' | 'warning' | 'info';

export interface MetaBulkCriteria {
  name: string;
  prompt: string;
  campaignNamePattern: string;
  objective: MetaBulkObjective;
  conversionEvent: string;
  countries: string[];
  audiences: string[];
  ageMin: number;
  ageMax: number;
  gender: MetaBulkGender;
  placements: string[];
  budgetLevel: MetaBulkBudgetLevel;
  dailyBudget: number;
  pageId?: string;
  creativeGroups: string[];
  primaryTexts: string[];
  headlines: string[];
  splitCampaignByCountry: boolean;
}

export interface MetaGeneratedAdNode {
  id: string;
  name: string;
  creativeGroup: string;
  primaryText: string;
  headline: string;
  ad: Ad;
}

export interface MetaGeneratedAdSetNode {
  id: string;
  name: string;
  country: string;
  audience: string;
  budget: number;
  adSet: AdSet;
  ads: MetaGeneratedAdNode[];
}

export interface MetaGeneratedCampaignNode {
  id: string;
  name: string;
  countries: string[];
  objective: MetaBulkObjective;
  budget: number;
  campaign: Campaign;
  adSets: MetaGeneratedAdSetNode[];
}

export interface MetaBulkGenerationSummary {
  campaigns: number;
  adSets: number;
  ads: number;
  totalDailyBudget: number;
}

export interface MetaPreflightIssue {
  id: string;
  severity: MetaPreflightSeverity;
  scope: 'Campaign' | 'Ad Set' | 'Ads' | 'Creative' | 'Budget' | 'AI';
  message: string;
}

export interface MetaBulkGenerationResult {
  runId: string;
  createdAt: string;
  campaigns: MetaGeneratedCampaignNode[];
  issues: MetaPreflightIssue[];
  assumptions: string[];
  summary: MetaBulkGenerationSummary;
}

export interface MetaCreationRecipe {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  criteria: MetaBulkCriteria;
}

export interface MetaAutomationRun {
  id: string;
  recipeName: string;
  createdAt: string;
  summary: MetaBulkGenerationSummary;
  status: 'drafted' | 'blocked';
}

export const META_DEFAULT_BULK_CRITERIA: MetaBulkCriteria = {
  name: 'US LAL install scale',
  prompt: '',
  campaignNamePattern: '{app}_{country}_{audience}_{objective}_{date}',
  objective: 'App promotions',
  conversionEvent: 'App install',
  countries: ['US', 'CA', 'AU'],
  audiences: ['LAL 1%', 'Broad'],
  ageMin: 18,
  ageMax: 45,
  gender: 'All',
  placements: ['Facebook', 'Instagram', 'Audience Network', 'Messenger'],
  budgetLevel: 'campaign',
  dailyBudget: 500,
  creativeGroups: ['UGC video', 'Gameplay video'],
  primaryTexts: ['Try our new app today', 'Install now and start faster'],
  headlines: ['Fast cleaner for iPhone', 'Boost your phone in minutes'],
  splitCampaignByCountry: true,
};

const COUNTRY_ALIASES: Record<string, string> = {
  us: 'US',
  usa: 'US',
  ca: 'CA',
  canada: 'CA',
  au: 'AU',
  australia: 'AU',
  uk: 'UK',
  gb: 'UK',
  jp: 'JP',
  japan: 'JP',
  kr: 'KR',
  korea: 'KR',
  br: 'BR',
  mx: 'MX',
  de: 'DE',
  fr: 'FR',
};

const cleanToken = (value: string) => value.trim().replace(/\s+/g, ' ');

const unique = (values: string[]) => Array.from(new Set(values.map(cleanToken).filter(Boolean)));

const formatDateToken = (date: Date) => {
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const normalizeForName = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9%]+/g, '_')
    .replace(/^_+|_+$/g, '');

const expandCampaignName = (
  pattern: string,
  appName: string,
  country: string,
  audience: string,
  objective: string,
  date: Date,
) =>
  pattern
    .replaceAll('{app}', normalizeForName(appName))
    .replaceAll('{country}', normalizeForName(country))
    .replaceAll('{audience}', normalizeForName(audience))
    .replaceAll('{objective}', normalizeForName(objective))
    .replaceAll('{date}', formatDateToken(date));

const buildIssues = (
  criteria: MetaBulkCriteria,
  existingCampaignNames: string[],
  generatedNames: string[],
  totalAdCount: number,
): MetaPreflightIssue[] => {
  const issues: MetaPreflightIssue[] = [];

  if (!criteria.campaignNamePattern.trim()) {
    issues.push({ id: 'missing-pattern', severity: 'error', scope: 'Campaign', message: 'Missing campaign naming convention.' });
  }
  if (criteria.countries.length === 0) {
    issues.push({ id: 'missing-countries', severity: 'error', scope: 'Ad Set', message: 'Select at least one country or geo group.' });
  }
  if (criteria.audiences.length === 0) {
    issues.push({ id: 'missing-audiences', severity: 'error', scope: 'Ad Set', message: 'Select at least one audience segment.' });
  }
  if (!criteria.conversionEvent.trim()) {
    issues.push({ id: 'missing-conversion', severity: 'error', scope: 'Ad Set', message: 'Conversion event is required before generating Meta drafts.' });
  }
  if (!criteria.pageId) {
    issues.push({ id: 'missing-page', severity: 'warning', scope: 'Ads', message: 'Facebook Page is not selected. Ads will need a page before publishing.' });
  }
  if (criteria.creativeGroups.length === 0) {
    issues.push({ id: 'missing-creatives', severity: 'warning', scope: 'Creative', message: 'No creative group selected. Generated ads will use placeholders.' });
  }
  if (criteria.primaryTexts.length === 0 || criteria.headlines.length === 0) {
    issues.push({ id: 'missing-copy', severity: 'warning', scope: 'Creative', message: 'Primary text or headline variants are empty.' });
  }
  if (criteria.ageMin < 13 || criteria.ageMin >= criteria.ageMax) {
    issues.push({ id: 'invalid-age', severity: 'error', scope: 'Ad Set', message: 'Age range is invalid.' });
  }

  const adSetCount = Math.max(1, criteria.countries.length) * Math.max(1, criteria.audiences.length);
  const suggestedMinimum = criteria.budgetLevel === 'campaign' ? criteria.countries.length * 30 : adSetCount * 10;
  if (criteria.dailyBudget < suggestedMinimum) {
    issues.push({
      id: 'low-budget',
      severity: 'warning',
      scope: 'Budget',
      message: `Daily budget is low for this matrix. Suggested minimum is about $${suggestedMinimum}.`,
    });
  }

  if (totalAdCount > 80) {
    issues.push({ id: 'large-run', severity: 'warning', scope: 'AI', message: `${totalAdCount} ads will be generated. Review naming and budget before creating drafts.` });
  }

  const existing = new Set(existingCampaignNames.map(name => name.toLowerCase()));
  const duplicates = generatedNames.filter(name => existing.has(name.toLowerCase()));
  if (duplicates.length > 0) {
    issues.push({ id: 'duplicate-names', severity: 'warning', scope: 'Campaign', message: `${duplicates.length} generated campaign name(s) already exist.` });
  }

  return issues;
};

export const generateMetaBulkPlan = ({
  criteria,
  appName,
  projectId,
  accountName,
  existingCampaignNames,
  now = new Date(),
}: {
  criteria: MetaBulkCriteria;
  appName: string;
  projectId: string;
  accountName: string;
  existingCampaignNames: string[];
  now?: Date;
}): MetaBulkGenerationResult => {
  const runId = `meta-bulk-${now.getTime()}`;
  const safeCountries = criteria.countries.length > 0 ? criteria.countries : ['Worldwide'];
  const safeAudiences = criteria.audiences.length > 0 ? criteria.audiences : ['Broad'];
  const safeCreatives = criteria.creativeGroups.length > 0 ? criteria.creativeGroups : ['Creative placeholder'];
  const safeTexts = criteria.primaryTexts.length > 0 ? criteria.primaryTexts : ['Primary text placeholder'];
  const safeHeadlines = criteria.headlines.length > 0 ? criteria.headlines : ['Headline placeholder'];
  const campaignGroups = criteria.splitCampaignByCountry ? safeCountries.map(country => [country]) : [safeCountries];
  const adVariants = safeCreatives.flatMap((creative, creativeIndex) =>
    safeTexts.flatMap((text, textIndex) =>
      safeHeadlines.map((headline, headlineIndex) => ({
        creative,
        text,
        headline,
        variant: creativeIndex + textIndex + headlineIndex + 1,
      })),
    ),
  );

  const generatedCampaignNames: string[] = [];
  const campaigns: MetaGeneratedCampaignNode[] = campaignGroups.map((countries, campaignIndex) => {
    const countryLabel = countries.join('-');
    const representativeAudience = safeAudiences[0] ?? 'Broad';
    const campaignName = expandCampaignName(criteria.campaignNamePattern, appName, countryLabel, representativeAudience, criteria.objective, now);
    generatedCampaignNames.push(campaignName);

    const campaignBudget = criteria.budgetLevel === 'campaign'
      ? Math.round(criteria.dailyBudget / Math.max(1, campaignGroups.length))
      : 0;

    const campaign: Campaign = {
      id: `${runId}-c-${campaignIndex + 1}`,
      name: campaignName,
      network: 'meta',
      status: 'DRAFT',
      budget: campaignBudget,
      spend: 0,
      impressions: 0,
      clicks: 0,
      installs: 0,
      cpa: 0,
      roas: 0,
      createdAt: now.toISOString().slice(0, 10),
      updatedAt: now.toISOString().slice(0, 10),
      projectId,
      costCenter: 'AI Bulk Draft',
    };

    const adSets: MetaGeneratedAdSetNode[] = countries.flatMap(country =>
      safeAudiences.map((audience, audienceIndex) => {
        const adSetIndex = countries.indexOf(country) * safeAudiences.length + audienceIndex + 1;
        const adSetName = `${normalizeForName(country)}_${normalizeForName(audience)}_${criteria.ageMin}-${criteria.ageMax}`;
        const adSetBudget = criteria.budgetLevel === 'adset'
          ? Math.round(criteria.dailyBudget / Math.max(1, campaignGroups.length * safeAudiences.length))
          : 0;
        const adSetId = `${campaign.id}-as-${adSetIndex}`;
        const adSet: AdSet = {
          id: adSetId,
          name: adSetName,
          campaignId: campaign.id,
          status: 'DRAFT',
          budget: adSetBudget,
          spend: 0,
          targeting: `${audience} - ${country} - ${criteria.ageMin}-${criteria.ageMax} - ${criteria.gender}`,
          impressions: 0,
          clicks: 0,
          installs: 0,
        };

        const ads: MetaGeneratedAdNode[] = adVariants.map((variant, variantIndex) => {
          const adName = `${adSetName}_${normalizeForName(variant.creative)}_v${variantIndex + 1}`;
          const ad: Ad = {
            id: `${adSetId}-ad-${variantIndex + 1}`,
            name: adName,
            adSetId,
            campaignId: campaign.id,
            status: 'DRAFT',
            type: variant.creative.toLowerCase().includes('image') ? 'IMAGE' : 'VIDEO',
            impressions: 0,
            clicks: 0,
            installs: 0,
            spend: 0,
            creativeName: variant.creative,
          };

          return {
            id: ad.id,
            name: adName,
            creativeGroup: variant.creative,
            primaryText: variant.text,
            headline: variant.headline,
            ad,
          };
        });

        return {
          id: adSetId,
          name: adSetName,
          country,
          audience,
          budget: adSetBudget,
          adSet,
          ads,
        };
      }),
    );

    return {
      id: campaign.id,
      name: campaignName,
      countries,
      objective: criteria.objective,
      budget: campaignBudget,
      campaign,
      adSets,
    };
  });

  const summary: MetaBulkGenerationSummary = {
    campaigns: campaigns.length,
    adSets: campaigns.reduce((sum, campaign) => sum + campaign.adSets.length, 0),
    ads: campaigns.reduce((sum, campaign) => sum + campaign.adSets.reduce((inner, adSet) => inner + adSet.ads.length, 0), 0),
    totalDailyBudget: criteria.dailyBudget,
  };

  return {
    runId,
    createdAt: now.toISOString(),
    campaigns,
    summary,
    assumptions: [
      criteria.splitCampaignByCountry ? 'AI split one campaign per country.' : 'AI kept all countries in one campaign.',
      `${criteria.budgetLevel === 'campaign' ? 'Campaign' : 'Ad set'} budget is distributed evenly across generated nodes.`,
      'Generated entities are created as DRAFT only and require review before launch.',
      `Account context: ${accountName}.`,
    ],
    issues: buildIssues(criteria, existingCampaignNames, generatedCampaignNames, summary.ads),
  };
};

export const generateMetaCriteriaFromPrompt = (
  prompt: string,
  base: MetaBulkCriteria,
): { criteria: MetaBulkCriteria; assumptions: string[] } => {
  const normalized = prompt.toLowerCase();
  const countries = unique(
    Object.entries(COUNTRY_ALIASES)
      .filter(([alias]) => new RegExp(`\\b${alias}\\b`, 'i').test(prompt))
      .map(([, country]) => country),
  );
  const budgetMatch = prompt.match(/(?:\$|usd\s*)\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i) ?? prompt.match(/(\d+(?:,\d{3})*)\s*(?:usd|dollars|\/day|per day)/i);
  const parsedBudget = budgetMatch ? Number(budgetMatch[1].replaceAll(',', '')) : base.dailyBudget;
  const audiences = unique([
    ...(normalized.includes('lal') || normalized.includes('lookalike') ? ['LAL 1%'] : []),
    ...(normalized.includes('broad') ? ['Broad'] : []),
    ...(normalized.includes('interest') ? ['Interest stack'] : []),
    ...(normalized.includes('retarget') ? ['Retargeting'] : []),
  ]);
  const objective: MetaBulkObjective = normalized.includes('purchase') || normalized.includes('sales') ? 'Sales' : 'App promotions';
  const conversionEvent = objective === 'Sales' ? 'Purchase' : 'App install';
  const ageRangeMatch = prompt.match(/(\d{2})\s*[-to]+\s*(\d{2})/i);

  const criteria: MetaBulkCriteria = {
    ...base,
    prompt,
    objective,
    conversionEvent,
    countries: countries.length > 0 ? countries : base.countries,
    audiences: audiences.length > 0 ? audiences : base.audiences,
    dailyBudget: Number.isFinite(parsedBudget) && parsedBudget > 0 ? parsedBudget : base.dailyBudget,
    ageMin: ageRangeMatch ? Number(ageRangeMatch[1]) : base.ageMin,
    ageMax: ageRangeMatch ? Number(ageRangeMatch[2]) : base.ageMax,
    splitCampaignByCountry: !normalized.includes('one campaign') && !normalized.includes('single campaign'),
    creativeGroups: normalized.includes('image') ? unique([...base.creativeGroups, 'Image static']) : base.creativeGroups,
  };

  return {
    criteria,
    assumptions: [
      countries.length > 0 ? `Detected countries: ${countries.join(', ')}.` : 'No explicit country found, kept current countries.',
      audiences.length > 0 ? `Detected audience segments: ${audiences.join(', ')}.` : 'No explicit audience found, kept current audience matrix.',
      budgetMatch ? `Detected daily budget $${criteria.dailyBudget}.` : 'No explicit budget found, kept current budget.',
      `Selected objective: ${objective}.`,
    ],
  };
};
