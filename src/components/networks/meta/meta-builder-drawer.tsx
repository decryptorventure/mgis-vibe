// MetaBuilderDrawer — full-screen campaign creation/edit drawer with tab navigation
import React, { useEffect, useState } from 'react';
import { Drawer, Select, Tabs } from 'antd';
import { CheckCircle2, Layers3, Megaphone, PanelRightOpen, Plus, Sparkles } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import { Progress } from 'antd';
import type { MetaPage, MetaTemplate, BuilderContext } from './meta-types';
import {
  BuilderTreeItem,
  CampaignSettingsForm,
  AdsetSettingsForm,
  AdCreativeForm,
} from './meta-builder-forms';

// Sidebar checklist showing required fields completion status
const RequiredChecklist: React.FC<{ context: BuilderContext }> = ({ context }) => {
  const campaignTitle = context.campaign?.name ?? context.draft?.name ?? 'Campaign';
  const adSetTitle = context.adSet?.name ?? 'Ad Set';
  const adTitle = context.ad?.name ?? 'Ad';
  const groups = [
    { title: campaignTitle, progress: '6/6', complete: true, items: ['Campaign Name', 'Objective', 'Budget Strategy', 'Bid Strategy'] },
    { title: adSetTitle, progress: '7/9', complete: false, items: ['Ad Set Name', 'Performance Goal', 'Attribution', 'Locations', 'Age Range', 'Gender', 'Platforms', 'Conversion Event'] },
    { title: adTitle, progress: '4/8', complete: false, items: ['Ad Name', 'Headlines', 'Primary Texts', 'Call to Action', 'Facebook Page', 'Media', 'Website URL'] },
  ];

  return (
    <aside className="w-full xl:w-80 shrink-0 bg_primary border border_primary radius_8 p-4 h-fit sticky top-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text_primary">Required Fields</div>
          <div className="text-xs text_tertiary">17/23 completed</div>
        </div>
        <Progress type="circle" size={48} percent={74} />
      </div>
      <Progress percent={74} showInfo={false} className="mt-4" />
      <div className="mt-4 divide-y divide-[var(--ds-border-secondary)]">
        {groups.map(group => (
          <div key={group.title} className="py-3">
            <div className="flex items-center justify-between">
              <span className={cn('text-sm font-semibold', group.complete ? 'fg_emerald_accent' : 'text_primary')}>{group.title}</span>
              <span className={cn('text-[11px] font-semibold px-2 py-0.5 radius_round', group.complete ? 'bg_emerald_subtle fg_emerald_strong' : 'bg_red_subtle fg_red_strong')}>{group.progress}</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {group.items.map((item, index) => {
                const done = group.complete || index < 5;
                return (
                  <div key={item} className={cn('flex items-center gap-2 text-xs', done ? 'text_tertiary line-through' : 'text_primary')}>
                    <span className={cn('w-3 h-3 radius_round flex items-center justify-center', done ? 'bg_emerald_medium' : 'bg_red_medium')} />
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

interface MetaBuilderDrawerProps {
  open: boolean;
  onClose: () => void;
  context: BuilderContext;
  pages: MetaPage[];
  templates: MetaTemplate[];
}

export const MetaBuilderDrawer: React.FC<MetaBuilderDrawerProps> = ({ open, onClose, context, pages, templates }) => {
  const initialTab = context.entity === 'campaigns' ? 'campaign' : context.entity === 'adsets' ? 'adset' : 'creative';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(context.initialStep ?? initialTab);
    setSelectedTemplateId(undefined);
  }, [initialTab, context.initialStep, open]);

  const campaignLabel = context.campaign?.name ?? context.draft?.name ?? 'New Campaign';
  const adSetLabel = context.adSet?.name ?? 'New Ad Set';
  const adLabel = context.ad?.name ?? 'New Ad';
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width="calc(100vw - 72px)"
      title={<span className="text-base font-semibold text_primary">Meta Campaign Builder</span>}
      styles={{ body: { padding: 0, background: 'var(--ds-bg-canvas-secondary)' }, footer: { padding: 12 } }}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text_secondary">
            <CheckCircle2 size={14} className="fg_emerald_accent" />
            Auto-saved draft at 04:51:31 PM
          </div>
          <Button type="button" variant="primary" size="m" disabled>Launch Campaign</Button>
        </div>
      }
    >
      <div className="grid grid-cols-[280px_1fr] min-h-full">
        <div className="bg_primary border-r border_primary p-4">
          <div className="flex items-center gap-2 text-base font-semibold text_primary mb-4">
            <img src="/logo/meta.png" alt="Meta" className="w-7 h-7 object-contain" />
            Meta
          </div>
          <div className="space-y-2">
            <BuilderTreeItem active={activeTab === 'campaign'} icon={<Megaphone size={15} />} label={campaignLabel} onClick={() => setActiveTab('campaign')} />
            <BuilderTreeItem active={activeTab === 'adset'} icon={<Layers3 size={15} />} label={adSetLabel} onClick={() => setActiveTab('adset')} />
            <BuilderTreeItem active={activeTab === 'creative'} icon={<PanelRightOpen size={15} />} label={adLabel} onClick={() => setActiveTab('creative')} />
            <Button type="button" variant="border" size="m" className="w-full gap-1.5 mt-2">
              <Plus size={14} /> Add Ad Set
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-auto">
          <div className="max-w-[1180px] mx-auto">
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
              { key: 'campaign', label: 'Campaign Settings' },
              { key: 'adset', label: 'Ad Set' },
              { key: 'creative', label: 'Ad Creative' },
            ]} />
            <div className="flex flex-col xl:flex-row gap-6 mt-4">
              <div className="flex-1 space-y-4">
                <div className="border border_blue bg_blue_subtle radius_8 p-3 flex items-center gap-3">
                  <Sparkles size={16} className="fg_blue_accent" />
                  <span className="text-sm font-semibold text_primary">Apply Template</span>
                  <Select className="flex-1" placeholder="Select a template..." value={selectedTemplateId} onChange={setSelectedTemplateId} allowClear options={templates.map(t => ({ value: t.id, label: t.name }))} />
                  <Button type="button" variant="border" size="m" onClick={() => setSelectedTemplateId(undefined)}>Reset Template Fields</Button>
                </div>
                {activeTab === 'campaign' && <CampaignSettingsForm key={`campaign-${selectedTemplate?.id ?? 'default'}`} context={context} template={selectedTemplate} />}
                {activeTab === 'adset' && <AdsetSettingsForm key={`adset-${selectedTemplate?.id ?? 'default'}`} context={context} template={selectedTemplate} />}
                {activeTab === 'creative' && <AdCreativeForm key={`creative-${selectedTemplate?.id ?? 'default'}`} context={context} pages={pages} template={selectedTemplate} />}
              </div>
              <RequiredChecklist context={context} />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
