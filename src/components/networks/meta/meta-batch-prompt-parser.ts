// meta-batch-prompt-parser.ts — mock keyword-matching parser for the "describe your batch" box.
// Third-party AI model integration is future work (see plan); this stays deterministic for now.
import type { BatchTheme } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';

export interface PromptCriteriaResult {
  templateIds: string[];
  themeIds: string[];
  minCreatives?: number;
  cta?: string;
  assumptions: string[];
}

const CTA_KEYWORDS: Record<string, string> = {
  install: 'INSTALL_NOW', download: 'DOWNLOAD', 'learn more': 'LEARN_MORE',
  shop: 'SHOP_NOW', 'sign up': 'SIGN_UP', quote: 'GET_QUOTE', book: 'BOOK_NOW', apply: 'APPLY_NOW',
};

export function parseBatchPrompt(prompt: string, templates: MetaTemplate[], themes: BatchTheme[]): PromptCriteriaResult {
  const normalized = prompt.toLowerCase();
  const assumptions: string[] = [];

  const templateIds = templates.filter(t => normalized.includes(t.name.toLowerCase())).map(t => t.id);
  const themeIds = themes.filter(th => normalized.includes(th.name.toLowerCase().replace(/_/g, ' '))).map(th => th.id);

  assumptions.push(templateIds.length > 0
    ? `Matched ${templateIds.length} template(s) by name.`
    : 'No template name matched — pick manually below.');
  assumptions.push(themeIds.length > 0
    ? `Matched ${themeIds.length} theme(s) by name.`
    : 'No theme name matched — pick manually below.');

  const minMatch = normalized.match(/(?:min|at least)\s*(\d+)\s*creativ/);
  const minCreatives = minMatch ? Math.max(5, Math.min(9, Number(minMatch[1]))) : undefined;
  if (minCreatives) assumptions.push(`Detected minimum ${minCreatives} creatives per ad set.`);

  const ctaKey = Object.keys(CTA_KEYWORDS).find(k => normalized.includes(k));
  const cta = ctaKey ? CTA_KEYWORDS[ctaKey] : undefined;
  if (cta) assumptions.push(`Detected call-to-action: ${cta.replace(/_/g, ' ')}.`);

  return { templateIds, themeIds, minCreatives, cta, assumptions };
}
