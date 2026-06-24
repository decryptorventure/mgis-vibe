// ─── CampaignCreatePage — full-page wizard for campaign creation ────────────
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Steps } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { ArrowLeft, Rocket } from 'lucide-react';
import { WizardStepBasics } from '@/components/campaign-wizard/wizard-step-basics';
import { WizardStepBudget } from '@/components/campaign-wizard/wizard-step-budget';
import { WizardStepTargeting } from '@/components/campaign-wizard/wizard-step-targeting';
import { WizardStepCreatives } from '@/components/campaign-wizard/wizard-step-creatives';
import { WizardStepTracking } from '@/components/campaign-wizard/wizard-step-tracking';
import { WizardStepReview } from '@/components/campaign-wizard/wizard-step-review';
import { mockProjects } from '@/shared/mock-data';
import { GoogleCampaignBuilderDrawer } from '@/components/networks/google/google-campaign-builder-drawer';

const STEP_LABELS = ['Basics', 'Budget', 'Targeting', 'Creatives', 'Tracking', 'Review'];

const buildInitialState = (appId?: string, networkId?: string) => ({
  projectId: appId ?? '',
  baseName: '',
  objective: 'installs',
  selectedNetworks: networkId ? [networkId] : [],
  lockedNetwork: networkId ?? null,
  budgetMode: 'per-network' as 'per-network' | 'shared',
  sharedBudget: 5000,
  perNetworkBudget: {} as Record<string, number>,
  budgetSplit: {} as Record<string, number>,
  targeting: {} as Record<string, unknown>,
  selectedMediaIds: [] as string[],
  trackingUrl: '',
  postbackEvents: [
    { key: '1', eventName: 'install', sdkEvent: 'af_install' },
    { key: '2', eventName: 'purchase', sdkEvent: 'af_purchase' },
  ],
});

// Generic wizard — used for all networks except Google
const GenericCampaignCreatePage: React.FC<{ appId?: string; networkId?: string }> = ({ appId, networkId }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState(() => buildInitialState(appId, networkId));

  const onChange = (updates: Record<string, unknown>) =>
    setState(prev => ({ ...prev, ...updates }));

  const handleSubmit = () => {
    toast.success('Campaign created successfully');
    navigate(`/apps/${appId}/networks/${networkId}`);
  };

  const stepContent = [
    <WizardStepBasics key="basics" state={state} onChange={onChange} />,
    <WizardStepBudget key="budget" state={state} onChange={onChange} />,
    <WizardStepTargeting key="targeting" state={state} onChange={onChange} />,
    <WizardStepCreatives key="creatives" state={state} onChange={onChange} />,
    <WizardStepTracking key="tracking" state={state} onChange={onChange} />,
    <WizardStepReview key="review" state={state} />,
  ];

  const isLastStep = step === STEP_LABELS.length - 1;

  return (
    <div className="min-h-screen bg-[var(--canvas-secondary)] flex flex-col">
      <div className="h-14 px-6 flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--surface-base)]">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
          <ArrowLeft size={14} />Back to workspace
        </button>
        <span className="text-[var(--text-tertiary)]">/</span>
        <div className="flex items-center gap-1.5">
          <Rocket size={14} className="text-[var(--text-tertiary)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">New Campaign</span>
        </div>
      </div>
      <div className="flex flex-1 max-w-5xl mx-auto w-full gap-8 p-8">
        <div className="w-44 flex-shrink-0">
          <Steps direction="vertical" current={step} size="small"
            items={STEP_LABELS.map(title => ({ title }))} />
        </div>
        <div className="flex-1 bg-[var(--surface-base)] rounded-xl border border-[var(--border-default)] flex flex-col">
          <div className="flex-1 p-6 overflow-auto">{stepContent[step]}</div>
          <div className="flex justify-between items-center px-6 py-4 border-t border-[var(--border-default)]">
            <Button variant="border" size="m"
              onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}>
              {step === 0 ? 'Cancel' : '← Back'}
            </Button>
            <Button variant="primary" size="m"
              onClick={() => isLastStep ? handleSubmit() : setStep(s => s + 1)}>
              {isLastStep ? 'Create Campaign' : 'Next →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Router-level component — delegates based on networkId
export const CampaignCreatePage: React.FC = () => {
  const { appId, networkId } = useParams<{ appId: string; networkId: string }>();
  const navigate = useNavigate();

  if (networkId === 'google-ads') {
    const activeApp = mockProjects.find(p => p.id === appId);
    return (
      <GoogleCampaignBuilderDrawer
        open
        activeApp={activeApp}
        onClose={() => navigate(`/apps/${appId}/networks/google-ads`)}
      />
    );
  }

  return <GenericCampaignCreatePage appId={appId} networkId={networkId} />;
};

export default CampaignCreatePage;
