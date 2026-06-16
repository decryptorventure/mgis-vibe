import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Drawer, Input, Progress, Radio, Select, Switch, Tabs } from 'antd';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  GitBranch,
  Layers3,
  Megaphone,
  PanelRightOpen,
  Plus,
  Save,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import {
  generateMetaBulkPlan,
  generateMetaCriteriaFromPrompt,
  META_DEFAULT_BULK_CRITERIA,
  type MetaAutomationRun,
  type MetaBulkCriteria,
  type MetaBulkGenerationResult,
  type MetaCreationRecipe,
  type MetaPreflightIssue,
} from './meta-bulk-generation';

export interface MetaBulkPageOption {
  id: string;
  name: string;
}

interface MetaBulkCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  appName: string;
  projectId: string;
  accountName: string;
  pages: MetaBulkPageOption[];
  existingCampaignNames: string[];
  recipes: MetaCreationRecipe[];
  runs: MetaAutomationRun[];
  onSaveRecipe: (recipe: MetaCreationRecipe) => void;
  onGenerate: (result: MetaBulkGenerationResult, criteria: MetaBulkCriteria) => void;
}

const PLACEMENTS = ['Facebook', 'Instagram', 'Audience Network', 'Messenger', 'Threads'];

const issueTone: Record<MetaPreflightIssue['severity'], string> = {
  error: 'bg_red_subtle fg_red_strong border_red',
  warning: 'bg_amber_subtle fg_amber_strong border_amber',
  info: 'bg_blue_subtle fg_blue_strong border_blue',
};

const normalizeNumber = (value: string, fallback: number) => {
  const parsed = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const CriteriaSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="bg_primary border border_primary radius_8 p-4">
    <div className="flex items-center gap-2 pb-3 mb-3 border-b border_secondary">
      {icon}
      <h3 className="text-base font-semibold text_primary m-0">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <label className="block">
    <span className="block text-xs font-semibold text_primary mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-xs text_tertiary mt-1">{hint}</span>}
  </label>
);

const SummaryCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg_primary border border_primary radius_8 p-3">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase text_tertiary">{label}</span>
      <span className="icon_secondary">{icon}</span>
    </div>
    <div className="text-xl font-semibold text_primary mt-1">{value}</div>
  </div>
);

const IssueList: React.FC<{ issues: MetaPreflightIssue[] }> = ({ issues }) => (
  <div className="space-y-2">
    {issues.length === 0 ? (
      <div className="flex items-center gap-2 text-sm fg_emerald_strong bg_emerald_subtle border border_emerald radius_8 px-3 py-2">
        <CheckCircle2 size={15} />
        Preflight clean. Drafts are ready to generate.
      </div>
    ) : issues.map(issue => (
      <div key={issue.id} className={cn('border radius_8 px-3 py-2 text-sm', issueTone[issue.severity])}>
        <div className="font-semibold">{issue.scope}</div>
        <div className="text-xs mt-0.5">{issue.message}</div>
      </div>
    ))}
  </div>
);

export const MetaBulkCreateDrawer: React.FC<MetaBulkCreateDrawerProps> = ({
  open,
  onClose,
  appName,
  projectId,
  accountName,
  pages,
  existingCampaignNames,
  recipes,
  runs,
  onSaveRecipe,
  onGenerate,
}) => {
  const [criteria, setCriteria] = useState<MetaBulkCriteria>(() => ({
    ...META_DEFAULT_BULK_CRITERIA,
    pageId: pages[0]?.id,
  }));
  const [prompt, setPrompt] = useState('Create US, CA, AU LAL and broad app install campaigns with $500/day, one campaign per country, use video creatives.');
  const [aiAssumptions, setAiAssumptions] = useState<string[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | undefined>();

  useEffect(() => {
    if (open && !criteria.pageId && pages[0]?.id) {
      setCriteria(current => ({ ...current, pageId: pages[0].id }));
    }
  }, [criteria.pageId, open, pages]);

  const preview = useMemo(
    () => generateMetaBulkPlan({
      criteria,
      appName,
      projectId,
      accountName,
      existingCampaignNames,
    }),
    [accountName, appName, criteria, existingCampaignNames, projectId],
  );

  const blocked = preview.issues.some(issue => issue.severity === 'error');
  const completionPercent = Math.round(((preview.issues.length === 0 ? 6 : Math.max(1, 6 - preview.issues.length)) / 6) * 100);

  const updateCriteria = <K extends keyof MetaBulkCriteria>(key: K, value: MetaBulkCriteria[K]) => {
    setCriteria(current => ({ ...current, [key]: value }));
  };

  const handleAiGenerate = () => {
    const result = generateMetaCriteriaFromPrompt(prompt, criteria);
    setCriteria(result.criteria);
    setAiAssumptions(result.assumptions);
    toast.success('AI criteria generated for review');
  };

  const handleSaveRecipe = () => {
    const now = new Date().toISOString();
    const recipe: MetaCreationRecipe = {
      id: activeRecipeId ?? `recipe-${Date.now()}`,
      name: criteria.name || 'Untitled Meta recipe',
      createdAt: recipes.find(item => item.id === activeRecipeId)?.createdAt ?? now,
      updatedAt: now,
      criteria,
    };
    setActiveRecipeId(recipe.id);
    onSaveRecipe(recipe);
    toast.success('Creation recipe saved');
  };

  const handleLoadRecipe = (recipeId: string) => {
    const recipe = recipes.find(item => item.id === recipeId);
    if (!recipe) return;
    setActiveRecipeId(recipe.id);
    setCriteria(recipe.criteria);
    setPrompt(recipe.criteria.prompt);
  };

  const handleGenerateDrafts = () => {
    const result = generateMetaBulkPlan({
      criteria,
      appName,
      projectId,
      accountName,
      existingCampaignNames,
      now: new Date(),
    });
    if (result.issues.some(issue => issue.severity === 'error')) {
      toast.error('Fix blocking preflight issues before generating drafts');
      return;
    }
    onGenerate(result, criteria);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="calc(100vw - 96px)"
      title={(
        <div className="flex items-center gap-2">
          <WandSparkles size={18} className="fg_blue_accent" />
          <span className="text-base font-semibold text_primary">AI Bulk Create Meta Campaigns</span>
        </div>
      )}
      styles={{
        body: { padding: 0, background: 'var(--ds-bg-canvas-secondary)' },
        footer: { padding: 12 },
      }}
      footer={(
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text_secondary">
            <Progress type="circle" size={34} percent={completionPercent} />
            <span>{blocked ? 'Blocking issues found' : 'Generated drafts will remain unpublished'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="border" size="m" className="gap-1.5" onClick={handleSaveRecipe}>
              <Save size={14} />
              Save Recipe
            </Button>
            <Button type="button" variant="primary" size="m" className="gap-1.5" disabled={blocked} onClick={handleGenerateDrafts}>
              <Plus size={14} />
              Generate Drafts
            </Button>
          </div>
        </div>
      )}
    >
      <div className="grid grid-cols-[minmax(420px,540px)_1fr] min-h-full">
        <div className="bg_primary border-r border_primary p-4 overflow-auto">
          <div className="border border_blue bg_blue_subtle radius_8 p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={16} className="fg_blue_accent" />
              <span className="text-sm font-semibold text_primary">Prompt to criteria</span>
            </div>
            <Input.TextArea
              rows={4}
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              placeholder="Describe campaign matrix, countries, audiences, budget, creatives..."
            />
            <div className="flex justify-end mt-2">
              <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={handleAiGenerate}>
                <Sparkles size={13} />
                Generate Criteria
              </Button>
            </div>
          </div>

          <Tabs
            defaultActiveKey="criteria"
            items={[
              {
                key: 'criteria',
                label: 'Criteria',
                children: (
                  <div className="space-y-4">
                    <CriteriaSection icon={<Megaphone size={16} className="fg_blue_accent" />} title="Campaign">
                      <Field label="Recipe name">
                        <Input value={criteria.name} onChange={event => updateCriteria('name', event.target.value)} />
                      </Field>
                      <Field label="Naming convention" hint="Supported tokens: {app}, {country}, {audience}, {objective}, {date}">
                        <Input value={criteria.campaignNamePattern} onChange={event => updateCriteria('campaignNamePattern', event.target.value)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Objective">
                          <Select
                            value={criteria.objective}
                            onChange={value => updateCriteria('objective', value)}
                            options={[{ value: 'App promotions', label: 'App promotions' }, { value: 'Sales', label: 'Sales' }]}
                          />
                        </Field>
                        <Field label="Conversion event">
                          <Select
                            value={criteria.conversionEvent}
                            onChange={value => updateCriteria('conversionEvent', value)}
                            options={[{ value: 'App install', label: 'App install' }, { value: 'Purchase', label: 'Purchase' }, { value: 'Complete registration', label: 'Complete registration' }]}
                          />
                        </Field>
                      </div>
                      <div className="flex items-center justify-between border border_secondary bg_secondary radius_8 px-3 py-2">
                        <div>
                          <div className="text-sm font-semibold text_primary">One campaign per country</div>
                          <div className="text-xs text_tertiary">Keeps budget, learning and naming easier to control.</div>
                        </div>
                        <Switch checked={criteria.splitCampaignByCountry} onChange={checked => updateCriteria('splitCampaignByCountry', checked)} />
                      </div>
                    </CriteriaSection>

                    <CriteriaSection icon={<Layers3 size={16} className="fg_blue_accent" />} title="Ad Set Matrix">
                      <Field label="Countries">
                        <Select mode="tags" value={criteria.countries} onChange={value => updateCriteria('countries', value)} tokenSeparators={[',', ' ']} />
                      </Field>
                      <Field label="Audiences">
                        <Select mode="tags" value={criteria.audiences} onChange={value => updateCriteria('audiences', value)} tokenSeparators={[',']} />
                      </Field>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Age min">
                          <Input value={criteria.ageMin} onChange={event => updateCriteria('ageMin', normalizeNumber(event.target.value, criteria.ageMin))} />
                        </Field>
                        <Field label="Age max">
                          <Input value={criteria.ageMax} onChange={event => updateCriteria('ageMax', normalizeNumber(event.target.value, criteria.ageMax))} />
                        </Field>
                        <Field label="Gender">
                          <Select
                            value={criteria.gender}
                            onChange={value => updateCriteria('gender', value)}
                            options={[{ value: 'All', label: 'All' }, { value: 'Men', label: 'Men' }, { value: 'Women', label: 'Women' }]}
                          />
                        </Field>
                      </div>
                      <Field label="Placements">
                        <Checkbox.Group value={criteria.placements} onChange={values => updateCriteria('placements', values as string[])} className="grid grid-cols-2 gap-2">
                          {PLACEMENTS.map(placement => <Checkbox key={placement} value={placement}>{placement}</Checkbox>)}
                        </Checkbox.Group>
                      </Field>
                    </CriteriaSection>

                    <CriteriaSection icon={<Zap size={16} className="fg_blue_accent" />} title="Budget">
                      <Radio.Group value={criteria.budgetLevel} onChange={event => updateCriteria('budgetLevel', event.target.value)} className="flex gap-4">
                        <Radio value="campaign">Campaign budget</Radio>
                        <Radio value="adset">Ad set budget</Radio>
                      </Radio.Group>
                      <Field label="Total daily budget">
                        <Input prefix="$" value={criteria.dailyBudget} onChange={event => updateCriteria('dailyBudget', normalizeNumber(event.target.value, criteria.dailyBudget))} />
                      </Field>
                    </CriteriaSection>

                    <CriteriaSection icon={<PanelRightOpen size={16} className="fg_blue_accent" />} title="Ads & Creative">
                      <Field label="Facebook Page">
                        <Select
                          value={criteria.pageId}
                          allowClear
                          placeholder="Select page"
                          onChange={value => updateCriteria('pageId', value)}
                          options={pages.map(page => ({ value: page.id, label: page.name }))}
                        />
                      </Field>
                      <Field label="Creative groups">
                        <Select mode="tags" value={criteria.creativeGroups} onChange={value => updateCriteria('creativeGroups', value)} tokenSeparators={[',']} />
                      </Field>
                      <Field label="Primary text variants">
                        <Select mode="tags" value={criteria.primaryTexts} onChange={value => updateCriteria('primaryTexts', value)} tokenSeparators={['|']} />
                      </Field>
                      <Field label="Headline variants">
                        <Select mode="tags" value={criteria.headlines} onChange={value => updateCriteria('headlines', value)} tokenSeparators={['|']} />
                      </Field>
                    </CriteriaSection>
                  </div>
                ),
              },
              {
                key: 'recipes',
                label: 'Recipes',
                children: (
                  <div className="space-y-4">
                    <CriteriaSection icon={<FileText size={16} className="fg_blue_accent" />} title="Saved Recipes">
                      <Select
                        placeholder="Load a saved recipe"
                        value={activeRecipeId}
                        onChange={handleLoadRecipe}
                        options={recipes.map(recipe => ({ value: recipe.id, label: recipe.name }))}
                      />
                      <div className="space-y-2">
                        {recipes.length === 0 ? (
                          <div className="text-sm text_tertiary">No creation recipes saved yet.</div>
                        ) : recipes.map(recipe => (
                          <button
                            key={recipe.id}
                            type="button"
                            className={cn('w-full text-left border radius_8 bg_primary p-3 cursor-pointer', recipe.id === activeRecipeId ? 'border_blue bg_blue_subtle' : 'border_primary')}
                            onClick={() => handleLoadRecipe(recipe.id)}
                          >
                            <div className="text-sm font-semibold text_primary">{recipe.name}</div>
                            <div className="text-xs text_tertiary mt-1">
                              {recipe.criteria.countries.length} countries · {recipe.criteria.audiences.length} audiences · ${recipe.criteria.dailyBudget}/day
                            </div>
                          </button>
                        ))}
                      </div>
                    </CriteriaSection>
                    <CriteriaSection icon={<GitBranch size={16} className="fg_blue_accent" />} title="Run History">
                      <div className="space-y-2">
                        {runs.length === 0 ? (
                          <div className="text-sm text_tertiary">No bulk draft runs yet.</div>
                        ) : runs.slice(0, 6).map(run => (
                          <div key={run.id} className="border border_primary bg_secondary radius_8 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text_primary">{run.recipeName}</span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_blue_subtle fg_blue_strong">{run.status}</span>
                            </div>
                            <div className="text-xs text_tertiary mt-1">
                              {run.summary.campaigns} campaigns · {run.summary.adSets} ad sets · {run.summary.ads} ads
                            </div>
                          </div>
                        ))}
                      </div>
                    </CriteriaSection>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <div className="p-5 overflow-auto">
          <div className="max-w-[1180px] mx-auto space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <SummaryCard label="Campaigns" value={preview.summary.campaigns} icon={<Megaphone size={16} />} />
              <SummaryCard label="Ad Sets" value={preview.summary.adSets} icon={<Layers3 size={16} />} />
              <SummaryCard label="Ads" value={preview.summary.ads} icon={<PanelRightOpen size={16} />} />
              <SummaryCard label="Daily Budget" value={`$${preview.summary.totalDailyBudget}`} icon={<Zap size={16} />} />
            </div>

            {(aiAssumptions.length > 0 || preview.assumptions.length > 0) && (
              <section className="bg_primary border border_primary radius_8 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="fg_blue_accent" />
                  <h3 className="text-base font-semibold text_primary m-0">AI Assumptions</h3>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {[...aiAssumptions, ...preview.assumptions].map(item => (
                    <div key={item} className="text-sm text_secondary bg_secondary border border_secondary radius_6 px-3 py-2">{item}</div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg_primary border border_primary radius_8 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={blocked ? 'fg_red_accent' : 'fg_amber_accent'} />
                  <h3 className="text-base font-semibold text_primary m-0">Preflight</h3>
                </div>
                <span className="text-xs text_tertiary">Review before generating draft entities</span>
              </div>
              <IssueList issues={preview.issues} />
            </section>

            <section className="bg_primary border border_primary radius_8 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch size={16} className="fg_blue_accent" />
                <h3 className="text-base font-semibold text_primary m-0">Generated Tree Preview</h3>
              </div>
              <div className="space-y-3">
                {preview.campaigns.map(campaign => (
                  <div key={campaign.id} className="border border_primary radius_8 overflow-hidden">
                    <div className="bg_blue_subtle border-b border_blue px-3 py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text_primary truncate">{campaign.name}</div>
                        <div className="text-xs text_tertiary">{campaign.objective} · {campaign.countries.join(', ')} · ${campaign.budget || criteria.dailyBudget}/day</div>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 radius_round bg_secondary border border_secondary text_secondary">DRAFT</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {campaign.adSets.map(adSet => (
                        <div key={adSet.id} className="border border_secondary bg_secondary radius_8 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text_primary">{adSet.name}</div>
                              <div className="text-xs text_tertiary">{adSet.country} · {adSet.audience} · {adSet.ads.length} ads</div>
                            </div>
                            <span className="text-xs text_secondary">${adSet.budget || 'campaign budget'}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-1 xl:grid-cols-2 gap-2">
                            {adSet.ads.slice(0, 4).map(ad => (
                              <div key={ad.id} className="bg_primary border border_primary radius_6 px-3 py-2">
                                <div className="text-xs font-semibold text_primary truncate">{ad.name}</div>
                                <div className="text-[11px] text_tertiary truncate">{ad.creativeGroup} · {ad.headline}</div>
                              </div>
                            ))}
                            {adSet.ads.length > 4 && (
                              <div className="bg_primary border border_primary radius_6 px-3 py-2 text-xs text_secondary">
                                +{adSet.ads.length - 4} more ads
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default MetaBulkCreateDrawer;
