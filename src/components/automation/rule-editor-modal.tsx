// rule-editor-modal.tsx — rule creation/editing modal with multi-condition/action support
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { AlertTriangle, Loader2, Zap } from 'lucide-react';
import { RuleLogicBuilder, type ConditionValue } from './rule-logic-builder';
import { RuleTemplatePicker } from './rule-template-picker';
import { getConditionsForNetwork, getActionsForNetwork, type RuleTemplate } from '@/shared/rule-conditions';
import type { ActionValue } from './rule-action-builder';
import type { NetworkRule } from '@/shared/mock-data';

const NETWORKS = ['Google Ads', 'Meta', 'ASA', 'Axon', 'Moloco'];

interface RuleEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: Omit<NetworkRule, 'id' | 'triggerCount'>) => void;
  initialValues?: Partial<NetworkRule>;
}

function defaultConditions(network: string): ConditionValue[] {
  const conds = getConditionsForNetwork(network);
  return [{ conditionKey: conds[0]?.key ?? 'cpa_gt', conditionParam: conds[0]?.defaultValue ?? 2 }];
}

function defaultActions(network: string): ActionValue[] {
  const acts = getActionsForNetwork(network);
  return [{ actionKey: acts[0]?.key ?? 'pause_campaign', actionParam: undefined }];
}

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({ open, onClose, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [network, setNetwork] = useState(initialValues?.network ?? 'Meta');
  const [conditions, setConditions] = useState<ConditionValue[]>(() => {
    if (initialValues?.conditions?.length) return initialValues.conditions;
    const net = initialValues?.network ?? 'Meta';
    return [{ conditionKey: initialValues?.conditionKey ?? defaultConditions(net)[0].conditionKey, conditionParam: initialValues?.conditionParam ?? defaultConditions(net)[0].conditionParam }];
  });
  const [actions, setActions] = useState<ActionValue[]>(() => {
    if (initialValues?.actions?.length) return initialValues.actions;
    const net = initialValues?.network ?? 'Meta';
    return [{ actionKey: initialValues?.actionKey ?? defaultActions(net)[0].actionKey, actionParam: initialValues?.actionParam }];
  });
  const [pendingNetwork, setPendingNetwork] = useState<string | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasLogic = conditions.length > 0 || actions.length > 0;

  useEffect(() => {
    if (open) {
      const net = initialValues?.network ?? 'Meta';
      setNetwork(net);
      setConditions(initialValues?.conditions?.length ? initialValues.conditions : [{ conditionKey: initialValues?.conditionKey ?? defaultConditions(net)[0].conditionKey, conditionParam: initialValues?.conditionParam ?? defaultConditions(net)[0].conditionParam }]);
      setActions(initialValues?.actions?.length ? initialValues.actions : [{ actionKey: initialValues?.actionKey ?? defaultActions(net)[0].actionKey, actionParam: initialValues?.actionParam }]);
      setPendingNetwork(null);
      form.setFieldsValue({ name: initialValues?.name ?? '', scheduleMinutes: initialValues?.scheduleMinutes ?? 60 });
    }
  }, [open, initialValues, form]);

  const applyNetworkChange = (net: string) => {
    setNetwork(net);
    setConditions(defaultConditions(net));
    setActions(defaultActions(net));
    setPendingNetwork(null);
  };

  const handleNetworkChange = (net: string) => {
    if (hasLogic && (conditions[0]?.conditionKey || actions[0]?.actionKey)) {
      setPendingNetwork(net);
    } else {
      applyNetworkChange(net);
    }
  };

  const handleApplyTemplate = (tpl: RuleTemplate) => {
    const net = tpl.network === 'All' ? network : tpl.network;
    setNetwork(net);
    form.setFieldsValue({ scheduleMinutes: tpl.scheduleMinutes });
    setConditions([{ conditionKey: tpl.conditionKey, conditionParam: tpl.conditionParam }]);
    setActions([{ actionKey: tpl.actionKey, actionParam: tpl.actionParam }]);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      setIsSaving(true);
      setTimeout(() => {
        onSave({
          name: values.name,
          network,
          conditionKey: conditions[0]?.conditionKey ?? 'cpa_gt',
          conditionParam: conditions[0]?.conditionParam ?? 0,
          actionKey: actions[0]?.actionKey ?? 'pause_campaign',
          actionParam: actions[0]?.actionParam,
          scheduleMinutes: values.scheduleMinutes,
          status: 'active',
          lastTriggered: undefined,
          conditions,
          actions,
        });
        toast.success('Rule saved successfully!');
        form.resetFields();
        setIsSaving(false);
        onClose();
      }, 600);
    });
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[var(--status-warning)]" />
              <span className="font-bold text-sm">{initialValues?.id ? 'Edit Rule' : 'New Rule'}</span>
            </div>
            <Button size="s" onClick={() => setTemplatePickerOpen(true)} className="font-semibold text-xs cursor-pointer flex items-center gap-1">
              <Zap size={12} /> Use Template
            </Button>
          </div>
        }
        open={open}
        onCancel={onClose}
        okText={isSaving ? 'Saving…' : 'Save Rule'}
        cancelText="Cancel"
        onOk={handleOk}
        width={600}
        okButtonProps={{ disabled: isSaving, className: 'cursor-pointer' }}
      >
        <Form form={form} layout="vertical" className="mt-4 space-y-4" initialValues={{ scheduleMinutes: 60 }}>
          {/* Name + Network */}
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label={<span className="text-xs font-bold text_secondary">Rule Name <span className="fg_error">*</span></span>}
              name="name"
              rules={[{ required: true, message: 'Enter a rule name' }]}
              className="mb-0 col-span-2"
            >
              <Input placeholder="e.g. Pause high CPA campaigns" className="h-10 rounded-lg" />
            </Form.Item>
            <div>
              <div className="text-xs font-bold text_secondary mb-2">Network</div>
              <Select value={network} onChange={handleNetworkChange} options={NETWORKS.map(n => ({ value: n, label: n }))} className="w-full h-10" />
            </div>
          </div>

          {/* Network change warning */}
          {pendingNetwork && (
            <div className="radius_8 border border_amber bg_amber_subtle p-3 flex items-start gap-3">
              <AlertTriangle size={14} className="fg_warning shrink-0 mt-0.5" />
              <span className="text-xs text_secondary flex-1">Changing network will reset your conditions and actions.</span>
              <div className="flex gap-3 shrink-0">
                <button type="button" onClick={() => setPendingNetwork(null)} className="text-xs fg_link font-semibold cursor-pointer bg-transparent border-0 p-0">Cancel</button>
                <button type="button" onClick={() => applyNetworkChange(pendingNetwork)} className="text-xs fg_error font-semibold cursor-pointer bg-transparent border-0 p-0">Reset & Change</button>
              </div>
            </div>
          )}

          {/* IF / THEN logic builder */}
          <RuleLogicBuilder
            network={network}
            conditions={conditions}
            actions={actions}
            onConditionsChange={setConditions}
            onActionsChange={setActions}
          />

          {/* Schedule */}
          <div className="bg-[var(--surface-base)] border border-[var(--border-default)] p-4 rounded-2xl shadow-sm">
            <div className="text-xs font-bold uppercase text_secondary mb-3">Schedule — check frequency</div>
            <Form.Item name="scheduleMinutes" className="mb-0">
              <Radio.Group className="flex gap-4">
                <Radio value={15} className="text-xs font-semibold">Every 15 min</Radio>
                <Radio value={60} className="text-xs font-semibold">Hourly</Radio>
                <Radio value={1440} className="text-xs font-semibold">Daily</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Saving indicator */}
          {isSaving && (
            <div className="flex items-center gap-2 text-xs text_tertiary">
              <Loader2 size={13} className="animate-spin" /> Saving rule…
            </div>
          )}
        </Form>
      </Modal>

      <RuleTemplatePicker open={templatePickerOpen} onClose={() => setTemplatePickerOpen(false)} onSelect={handleApplyTemplate} />
    </>
  );
};

export default RuleEditorModal;
