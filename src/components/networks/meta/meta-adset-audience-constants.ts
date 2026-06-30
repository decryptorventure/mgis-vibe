// Audience section constants — country options, age ranges, saved/custom audiences
export const COUNTRY_OPTIONS = [
  { label: 'Asia', options: [
    { value: 'VN', label: 'Vietnam' }, { value: 'TH', label: 'Thailand' },
    { value: 'ID', label: 'Indonesia' }, { value: 'PH', label: 'Philippines' },
    { value: 'MY', label: 'Malaysia' }, { value: 'SG', label: 'Singapore' },
    { value: 'JP', label: 'Japan' }, { value: 'KR', label: 'South Korea' },
    { value: 'IN', label: 'India' }, { value: 'TW', label: 'Taiwan' },
  ]},
  { label: 'North America', options: [
    { value: 'US', label: 'United States' }, { value: 'CA', label: 'Canada' }, { value: 'MX', label: 'Mexico' },
  ]},
  { label: 'Europe', options: [
    { value: 'GB', label: 'United Kingdom' }, { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' }, { value: 'ES', label: 'Spain' },
    { value: 'IT', label: 'Italy' }, { value: 'PT', label: 'Portugal' },
  ]},
  { label: 'South America', options: [
    { value: 'BR', label: 'Brazil' }, { value: 'AR', label: 'Argentina' }, { value: 'CO', label: 'Colombia' },
  ]},
  { label: 'Middle East & Africa', options: [
    { value: 'AE', label: 'United Arab Emirates' }, { value: 'SA', label: 'Saudi Arabia' },
    { value: 'NG', label: 'Nigeria' }, { value: 'ZA', label: 'South Africa' },
  ]},
];

export const MIN_AGE_OPTIONS = Array.from({ length: 52 }, (_, i) => ({ value: String(i + 14), label: String(i + 14) }));
export const MAX_AGE_OPTIONS = [
  ...Array.from({ length: 44 }, (_, i) => ({ value: String(i + 22), label: String(i + 22) })),
  { value: '65+', label: '65+' },
];
export const SUGGEST_AGE_OPTIONS = Array.from({ length: 8 }, (_, i) => ({ value: String(i + 18), label: String(i + 18) }));

export const SAVED_AUDIENCE_OPTIONS = [
  { value: 'sa_gamers_sea', label: 'Gamers SEA — 18-35 — Mobile' },
  { value: 'sa_purchasers_us', label: 'US Purchasers — 25-44 — iOS' },
  { value: 'sa_casual_global', label: 'Casual Players — 18-55 — All' },
  { value: 'sa_high_value_apac', label: 'High-value APAC — 21-40' },
  { value: 'sa_retarget_lapsed', label: 'Lapsed Users (30-90d) — Global' },
];

export const CUSTOM_AUDIENCE_OPTIONS = [
  { label: 'Lookalike Audiences', options: [
    { value: 'lal_5_6', label: 'Lookalike (5% to 6%) - Start Trial last 120 days' },
    { value: 'lal_4_5', label: 'Lookalike (4% to 5%) - Start Trial last 120 days' },
    { value: 'lal_3_4', label: 'Lookalike (3% to 4%) - Start Trial last 120 days' },
    { value: 'lal_2_3', label: 'Lookalike (2% to 3%) - Start Trial last 120 days' },
    { value: 'lal_1_2', label: 'Lookalike (1% to 2%) - Start Trial last 120 days' },
    { value: 'lal_1', label: 'Lookalike (1%) - Start Trial last 120 days' },
  ]},
  { label: 'Custom Audiences', options: [
    { value: 'purchase_180d', label: 'purchase_web_180_days (01/04/26)' },
    { value: 'install_180d', label: 'install_web_180_days (01/04/26)' },
    { value: 'ca_purchasers_30d', label: 'Purchasers (30d)' },
    { value: 'ca_visitors_14d', label: 'Website visitors (14d)' },
  ]},
];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' }, { value: 'vi', label: 'Vietnamese' },
  { value: 'th', label: 'Thai' }, { value: 'id', label: 'Indonesian' },
  { value: 'ja', label: 'Japanese' }, { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese (Simplified)' }, { value: 'pt', label: 'Portuguese' },
];
