// MetaBuilderDrawer — Meta campaign wizard shell (tree nav extracted to meta-builder-wizard-nav)
import React, { useEffect, useState } from 'react';
import { Drawer, Select } from '@/components/ui-kit-compat';
import { ArrowLeft, ArrowRight, CheckCircle2, Rocket, Sparkles, X } from 'lucide-react';
import { Button } from '@frontend-team/ui-kit';
import type { MetaPage, MetaTemplate, BuilderContext } from './meta-types';
import { MetaCampaignTypeModal, type CampaignType } from './meta-campaign-type-modal';
import { CampaignSettingsForm } from './meta-campaign-settings-form';
import { AdsetSettingsForm } from './meta-adset-settings-form';
import { AdCreativeForm } from './meta-creative-form';
import { MetaBuilderRequiredFields, DEFAULT_REQUIRED_SECTIONS } from './meta-builder-required-fields';
import { WizardNav, type NavAdset, type NavSelection } from './meta-builder-wizard-nav';
import { BulkCreateAdsModal } from './meta-bulk-create-ads-modal';

type Phase = 'type' | 'builder';

const mkId = () => Math.random().toString(36).slice(2, 8);

const defaultAdsets = (): NavAdset[] => {
  const adsetId = mkId();
  return [{ id: adsetId, name: 'New Ad Set', ads: [{ id: mkId(), name: 'New Ad' }] }];
};

interface MetaBuilderDrawerProps {
  open: boolean;
  onClose: () => void;
  context: BuilderContext;
  pages: MetaPage[];
  templates: MetaTemplate[];
}

export const MetaBuilderDrawer: React.FC<MetaBuilderDrawerProps> = ({ open, onClose, context, pages, templates }) => {
  const [phase, setPhase] = useState<Phase>('type');
  const [campaignType, setCampaignType] = useState<CampaignType>('app_promotion');
  const [adsets, setAdsets] = useState<NavAdset[]>(defaultAdsets);
  const [selection, setSelection] = useState<NavSelection>({ level: 'campaign' });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [bulkAdsetId, setBulkAdsetId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('type');
      const fresh = defaultAdsets();
      setAdsets(fresh);
      const init: NavSelection = context.entity === 'adsets'
        ? { level: 'adset', adsetId: fresh[0].id }
        : context.entity === 'ads'
        ? { level: 'ad', adsetId: fresh[0].id, adId: fresh[0].ads[0].id }
        : { level: 'campaign' };
      setSelection(init);
      setSelectedTemplateId(undefined);
    }
  }, [open]);

  const handleAddAd = (adsetId: string) => {
    const adId = mkId();
    setAdsets(prev => prev.map(a => a.id !== adsetId ? a : {
      ...a, ads: [...a.ads, { id: adId, name: `New Ad ${a.ads.length + 1}` }],
    }));
    setSelection({ level: 'ad', adsetId, adId });
  };

  const handleBulkCreate = (adsetId: string, count: number) => {
    setAdsets(prev => prev.map(a => {
      if (a.id !== adsetId) return a;
      const newAds = Array.from({ length: count }, (_, i) => ({
        id: mkId(), name: `New Ad ${a.ads.length + i + 1}`,
      }));
      return { ...a, ads: [...a.ads, ...newAds] };
    }));
    setBulkAdsetId(null);
    setSelection({ level: 'adset', adsetId });
  };

  const handleAddAdset = () => {
    const adsetId = mkId();
    const next: NavAdset = { id: adsetId, name: `New Ad Set ${adsets.length + 1}`, ads: [{ id: mkId(), name: 'New Ad' }] };
    setAdsets(prev => [...prev, next]);
    setSelection({ level: 'adset', adsetId });
  };

  // Flatten tree to linear sequence for Next/Back navigation
  const sequence: NavSelection[] = [
    { level: 'campaign' },
    ...adsets.flatMap(a => [
      { level: 'adset' as const, adsetId: a.id },
      ...a.ads.map(d => ({ level: 'ad' as const, adsetId: a.id, adId: d.id })),
    ]),
  ];
  const selIdx = sequence.findIndex(s => s.level === selection.level && s.adsetId === selection.adsetId && s.adId === selection.adId);
  const prevSel = selIdx > 0 ? sequence[selIdx - 1] : null;
  const nextSel = selIdx < sequence.length - 1 ? sequence[selIdx + 1] : null;

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const campaignName = context.campaign?.name ?? context.draft?.name ?? 'New Campaign';
  const initialObjective = campaignType === 'app_promotion' ? 'app_installs' : 'sales';

  return (
    <>
      <MetaCampaignTypeModal
        open={open && phase === 'type'}
        onSelect={(t) => { setCampaignType(t); setPhase('builder'); }}
        onCancel={onClose}
      />

      <Drawer
        open={open && phase === 'builder'}
        onClose={onClose}
        placement="right"
        width="calc(100vw - 72px)"
        title={null}
        closable={false}
        styles={{
          body: { padding: 0, display: 'flex', overflow: 'hidden', height: '100%' },
          header: { display: 'none' },
          footer: { padding: '10px 16px' },
        }}
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button type="button" variant="border" size="s" className="gap-1.5" onClick={onClose}><X size={13} />Close</Button>
              {prevSel && <Button type="button" variant="border" size="m" className="gap-1.5" onClick={() => setSelection(prevSel)}><ArrowLeft size={14} />Back</Button>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text_secondary">
              <CheckCircle2 size={13} className="fg_emerald_accent" />Auto-saved draft
            </div>
            <div>
              {nextSel
                ? <Button type="button" variant="primary" size="m" className="gap-1.5" onClick={() => setSelection(nextSel)}>Next <ArrowRight size={14} /></Button>
                : <Button type="button" variant="primary" size="m" className="gap-1.5"><Rocket size={14} />Launch Campaign</Button>}
            </div>
          </div>
        }
      >
        <WizardNav
          campaignName={campaignName}
          adsets={adsets}
          selection={selection}
          onSelectCampaign={() => setSelection({ level: 'campaign' })}
          onSelectAdset={(id) => setSelection({ level: 'adset', adsetId: id })}
          onSelectAd={(adsetId, adId) => setSelection({ level: 'ad', adsetId, adId })}
          onAddAdset={handleAddAdset}
          onAddAd={handleAddAd}
          onBulkCreateAds={(id) => setBulkAdsetId(id)}
        />

        <div className="flex-1 overflow-auto bg_canvas_secondary">
          <div className="max-w-2xl mx-auto p-6 space-y-4">
            <div className="border border_blue bg_blue_subtle radius_8 px-3 py-2.5 flex items-center gap-3">
              <Sparkles size={15} className="fg_blue_accent shrink-0" />
              <span className="body_s font-semibold text_primary whitespace-nowrap">Apply Template</span>
              <Select
                size="small"
                className="flex-1"
                placeholder="Choose a template to auto-fill..."
                value={selectedTemplateId}
                onChange={(v) => setSelectedTemplateId(v as string)}
                allowClear
                options={templates.map(t => ({ value: t.id, label: t.name }))}
              />
            </div>

            {selection.level === 'campaign' && (
              <CampaignSettingsForm key={`campaign-${selectedTemplate?.id ?? 'none'}`} context={context} template={selectedTemplate} initialObjective={initialObjective} />
            )}
            {selection.level === 'adset' && (
              <AdsetSettingsForm key={`adset-${selection.adsetId}-${selectedTemplate?.id ?? 'none'}`} context={context} template={selectedTemplate} />
            )}
            {selection.level === 'ad' && (
              <AdCreativeForm key={`ad-${selection.adId}-${selectedTemplate?.id ?? 'none'}`} context={context} pages={pages} template={selectedTemplate} />
            )}
          </div>
        </div>

        <MetaBuilderRequiredFields sections={DEFAULT_REQUIRED_SECTIONS} />
      </Drawer>

      {bulkAdsetId && (
        <BulkCreateAdsModal
          open={!!bulkAdsetId}
          adsetId={bulkAdsetId}
          adsetName={adsets.find(a => a.id === bulkAdsetId)?.name ?? ''}
          onClose={() => setBulkAdsetId(null)}
          onCreate={handleBulkCreate}
        />
      )}
    </>
  );
};
