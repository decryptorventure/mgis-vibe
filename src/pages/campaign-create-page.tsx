// campaign-create-page.tsx — full-page wizard with step validation, draft auto-save, and unsaved-changes guard
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, toast, cn } from '@frontend-team/ui-kit';
import { ArrowLeft, Check, Loader2, Rocket } from 'lucide-react';
import { WizardStepBasics } from '@/components/campaign-wizard/wizard-step-basics';
import { WizardStepBudget } from '@/components/campaign-wizard/wizard-step-budget';
import { WizardStepTargeting } from '@/components/campaign-wizard/wizard-step-targeting';
import { WizardStepCreatives } from '@/components/campaign-wizard/wizard-step-creatives';
import { WizardStepTracking } from '@/components/campaign-wizard/wizard-step-tracking';
import { WizardStepReview } from '@/components/campaign-wizard/wizard-step-review';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
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

type WizardState = ReturnType<typeof buildInitialState>;

function isStepComplete(step: number, state: WizardState): boolean {
  if (step === 0) return !!state.baseName.trim() && state.selectedNetworks.length > 0;
  if (step === 3) return state.selectedMediaIds.length > 0;
  if (step === 4) return !!state.trackingUrl && /^https?:\/\//.test(state.trackingUrl);
  return true; // steps 1, 2, 5 always valid
}

const getDraftKey = (appId?: string, networkId?: string) =>
  `nms_campaign_create_${appId ?? 'global'}_${networkId ?? 'all'}`;

// ─── Generic wizard (all networks except Google) ──────────────────────────────

const GenericCampaignCreatePage: React.FC<{ appId?: string; networkId?: string }> = ({ appId, networkId }) => {
  const navigate = useNavigate();
  const draftKey = getDraftKey(appId, networkId);
  const initialState = buildInitialState(appId, networkId);

  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const pendingNavigate = useRef<(() => void) | null>(null);
  const isDirty = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setState(JSON.parse(saved));
        toast.info('Đã khôi phục bản nháp!');
      } catch { /* ignore */ }
    }
  }, [draftKey]);

  // Auto-save draft on state change (debounced 1.5s)
  const saveDraft = useCallback((s: WizardState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(s));
      setLastSaved(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    }, 1500);
  }, [draftKey]);

  const onChange = useCallback((updates: Record<string, unknown>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      isDirty.current = true;
      saveDraft(next);
      return next;
    });
  }, [saveDraft]);

  // Unsaved-changes guard (browser close/refresh)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const requestNavigate = (fn: () => void) => {
    if (isDirty.current) {
      pendingNavigate.current = fn;
      setShowDiscardConfirm(true);
    } else {
      fn();
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem(draftKey);
    isDirty.current = false;
    setShowDiscardConfirm(false);
    pendingNavigate.current?.();
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Campaign created successfully');
      localStorage.removeItem(draftKey);
      isDirty.current = false;
      setIsSubmitting(false);
      navigate(`/apps/${appId}/networks/${networkId}`);
    }, 800);
  };

  const isLastStep = step === STEP_LABELS.length - 1;
  const currentStepComplete = isStepComplete(step, state);
  const allComplete = STEP_LABELS.slice(0, -1).every((_, i) => isStepComplete(i, state));

  const stepContent = [
    <WizardStepBasics key="basics" state={state} onChange={onChange} />,
    <WizardStepBudget key="budget" state={state} onChange={onChange} />,
    <WizardStepTargeting key="targeting" state={state} onChange={onChange} />,
    <WizardStepCreatives key="creatives" state={state} onChange={onChange} />,
    <WizardStepTracking key="tracking" state={state} onChange={onChange} />,
    <WizardStepReview key="review" state={state} />,
  ];

  return (
    <>
      <div className="min-h-screen bg_secondary flex flex-col">
        {/* Header bar */}
        <div className="h-14 px-6 flex items-center gap-3 border-b border_secondary bg_primary">
          <button
            onClick={() => requestNavigate(() => navigate(-1))}
            className="flex items-center gap-1.5 text-xs font-medium text_secondary hover:text_primary transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowLeft size={14} /> Back to workspace
          </button>
          <span className="text_tertiary">/</span>
          <div className="flex items-center gap-1.5">
            <Rocket size={14} className="text_tertiary" />
            <span className="text-xs font-semibold text_primary">New Campaign</span>
          </div>
          {lastSaved && (
            <span className="ml-auto flex items-center gap-1 text-xs text_tertiary">
              <Check size={11} className="fg_success" /> Saved {lastSaved}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 max-w-5xl mx-auto w-full gap-8 p-8">
          {/* Step sidebar */}
          <div className="w-44 flex-shrink-0 space-y-0.5">
            {STEP_LABELS.map((label, i) => {
              const complete = i < step && isStepComplete(i, state);
              const active = i === step;
              const locked = i > step;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !locked && setStep(i)}
                  disabled={locked}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 radius_8 text-xs font-medium transition-colors cursor-pointer bg-transparent border-0',
                    active ? 'bg_blue_subtle fg_blue_strong' : 'text_secondary hover:bg_secondary',
                    locked && 'opacity-40 cursor-default pointer-events-none'
                  )}
                >
                  <span className={cn(
                    'w-5 h-5 radius_round border flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors',
                    active ? 'bg-[var(--ds-color-primary-500)] border-[var(--ds-color-primary-500)] text-white' :
                    complete ? 'bg_emerald_subtle border_emerald fg_success' :
                    'border_secondary text_tertiary'
                  )}>
                    {complete ? <Check size={9} /> : i + 1}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Content panel */}
          <div className="flex-1 bg_primary radius_12 border border_secondary flex flex-col">
            <div className="flex-1 p-6 overflow-auto">{stepContent[step]}</div>
            <div className="flex justify-between items-center px-6 py-4 border-t border_secondary">
              <Button
                variant="border"
                size="m"
                onClick={() => step === 0 ? requestNavigate(() => navigate(-1)) : setStep(s => s - 1)}
              >
                {step === 0 ? 'Cancel' : '← Back'}
              </Button>
              {isLastStep ? (
                <Button
                  variant="primary"
                  size="m"
                  disabled={!allComplete || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting
                    ? <><Loader2 size={14} className="animate-spin" /> Creating…</>
                    : <><Rocket size={14} /> Create Campaign</>}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="m"
                  disabled={!currentStepComplete}
                  onClick={() => setStep(s => s + 1)}
                >
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved changes confirmation */}
      <ConfirmModal
        open={showDiscardConfirm}
        title="Discard changes?"
        description="You have unsaved changes. Your draft has been auto-saved — leaving will not delete it."
        confirmLabel="Leave anyway"
        cancelLabel="Stay"
        danger={false}
        onConfirm={handleDiscard}
        onCancel={() => { setShowDiscardConfirm(false); pendingNavigate.current = null; }}
      />
    </>
  );
};

// ─── Router — delegates to Google drawer or generic wizard ────────────────────

export const CampaignCreatePage: React.FC = () => {
  const { appId, networkId } = useParams<{ appId: string; networkId: string }>();
  const navigate = useNavigate();

  if (networkId === 'google-ads') {
    const activeApp = mockProjects.find(p => p.id === appId);
    return <GoogleCampaignBuilderDrawer open activeApp={activeApp} onClose={() => navigate(`/apps/${appId}/networks/google-ads`)} />;
  }

  return <GenericCampaignCreatePage appId={appId} networkId={networkId} />;
};

export default CampaignCreatePage;
