import React, { useState, useEffect } from 'react';
import { Modal, Steps, Button } from '@/components/ui-kit-compat';
import { toast } from '@frontend-team/ui-kit';
import { Rocket } from 'lucide-react';
import { WizardStepBasics } from './wizard-step-basics';
import { WizardStepBudget } from './wizard-step-budget';
import { WizardStepTargeting } from './wizard-step-targeting';
import { WizardStepCreatives } from './wizard-step-creatives';
import { WizardStepTracking } from './wizard-step-tracking';
import { WizardStepReview } from './wizard-step-review';

interface CampaignWizardModalProps {
  open: boolean;
  onClose: () => void;
  defaultNetwork?: string;
}

const INITIAL_STATE = {
  projectId: 'p1',
  baseName: 'iG_Hot_Pot_Promo',
  objective: 'installs',
  selectedNetworks: [] as string[],
  lockedNetwork: null as string | null,
  budgetMode: 'per-network' as 'per-network' | 'shared',
  sharedBudget: 5000,
  perNetworkBudget: {} as Record<string, number>,
  budgetSplit: {} as Record<string, number>,
  targeting: {} as Record<string, any>,
  selectedMediaIds: [] as string[],
  trackingUrl: 'https://app.appsflyer.com/com.ig.hotpot?pid=campaign_wizard',
  postbackEvents: [
    { key: '1', eventName: 'install', sdkEvent: 'af_install' },
    { key: '2', eventName: 'purchase', sdkEvent: 'af_purchase' },
  ],
};

const getDraftKey = (defaultNetwork?: string) =>
  defaultNetwork ? `nms_campaign_wizard_draft_${defaultNetwork}` : 'nms_campaign_wizard_draft_global';

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({
  open,
  onClose,
  defaultNetwork,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState(INITIAL_STATE);
  const draftKey = getDraftKey(defaultNetwork);

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState(parsed);
          toast.info('Đã khôi phục bản nháp chiến dịch đang tạo dở!');
        } catch {
          // ignore
        }
      }
    }
  }, [draftKey, open]);

  useEffect(() => {
    if (open && defaultNetwork) {
      setState(prev => ({
        ...prev,
        selectedNetworks: [defaultNetwork],
        lockedNetwork: defaultNetwork,
      }));
    }
  }, [open, defaultNetwork]);

  const updateState = (updates: Record<string, any>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify(state));
    toast.success('Đã lưu bản nháp chiến dịch!');
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(draftKey);
    setState(defaultNetwork
      ? { ...INITIAL_STATE, selectedNetworks: [defaultNetwork], lockedNetwork: defaultNetwork }
      : INITIAL_STATE
    );
    setCurrentStep(0);
    toast.info('Đã xóa bản nháp!');
  };

  const handleFinish = () => {
    // Add mock campaigns to state/logs
    toast.success('Tất cả chiến dịch đã được phát hành và đồng bộ thành công!');
    localStorage.removeItem(draftKey);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WizardStepBasics state={state} onChange={updateState} />;
      case 1:
        return <WizardStepBudget state={state} onChange={updateState} />;
      case 2:
        return <WizardStepTargeting state={state} onChange={updateState} />;
      case 3:
        return <WizardStepCreatives state={state} onChange={updateState} />;
      case 4:
        return <WizardStepTracking state={state} onChange={updateState} />;
      case 5:
        return <WizardStepReview state={state} />;
      default:
        return null;
    }
  };

  const isStepValid = (step: number) => {
    if (step === 0) {
      return !state.baseName || state.selectedNetworks.length === 0;
    }
    if (step === 3) {
      return state.selectedMediaIds.length === 0;
    }
    if (step === 4) {
      return !state.trackingUrl || !/^https?:\/\//.test(state.trackingUrl);
    }
    return false;
  };

  const isNextDisabled = () => isStepValid(currentStep);
  const firstBlockedStep = [0, 1, 2, 3, 4].find(step => isStepValid(step));
  const maxAllowedStep = firstBlockedStep === undefined ? 5 : firstBlockedStep;
  const canPublish = firstBlockedStep === undefined;
  const handleStepChange = (step: number) => {
    if (step <= currentStep || step <= maxAllowedStep) {
      setCurrentStep(step);
      return;
    }
    toast.warning('Vui lòng hoàn tất các bước bắt buộc trước khi tiếp tục.');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1100}
      title={<span className="text-sm font-bold text-[var(--text-primary)]">Unified Campaign Wizard</span>}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-1.5">
            <Button size="small" onClick={handleSaveDraft} className="text-xs">Save Draft</Button>
            <Button size="small" danger onClick={handleDiscardDraft} className="text-xs">Discard Draft</Button>
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && <Button size="small" onClick={() => setCurrentStep(s => s - 1)}>Back</Button>}
            {currentStep < 5 ? (
              <Button size="small" type="primary" disabled={isNextDisabled()} onClick={() => setCurrentStep(s => s + 1)}>Next</Button>
            ) : (
              <Button size="small" type="primary" disabled={!canPublish} icon={<Rocket size={13} />} onClick={handleFinish}>Publish Campaigns</Button>
            )}
          </div>
        </div>
      }
      destroyOnClose
    >
      <Steps
        current={currentStep}
        onChange={handleStepChange}
        size="small"
        className="mb-6 mt-4"
        items={[
          { title: 'Basics', status: isStepValid(0) && currentStep >= 0 ? 'process' : undefined },
          { title: 'Budget', disabled: maxAllowedStep < 1 },
          { title: 'Targeting', disabled: maxAllowedStep < 2 },
          { title: 'Creatives', disabled: maxAllowedStep < 3 },
          { title: 'Tracking', disabled: maxAllowedStep < 4 },
          { title: 'Review', disabled: maxAllowedStep < 5 },
        ]}
      />
      <div className="min-h-[360px] max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1 py-1">
        <div key={currentStep} className="step-animate">
          {renderStepContent()}
        </div>
      </div>
    </Modal>
  );
};
export default CampaignWizardModal;
