import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Button } from 'antd';
import { toast } from '@frontend-team/ui-kit';
import { Zap } from 'lucide-react';
import { RuleConditionBuilder } from './rule-condition-builder';
import { RuleActionBuilder, type ActionValue } from './rule-action-builder';
import { RuleTemplatePicker } from './rule-template-picker';
import { getConditionsForNetwork, getActionsForNetwork, type RuleTemplate } from '@/shared/rule-conditions';
import type { NetworkRule } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// RuleEditorModal — full rule creation/editing form with template support
// ─────────────────────────────────────────────────────────────────────────────

const NETWORKS = ['Google Ads', 'Meta', 'ASA', 'Axon', 'Moloco'];

interface RuleEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: Omit<NetworkRule, 'id' | 'triggerCount'>) => void;
  initialValues?: Partial<NetworkRule>;
}

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  open,
  onClose,
  onSave,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [network, setNetwork] = useState(initialValues?.network ?? 'Meta');
  const [conditionVal, setConditionVal] = useState(() => {
    const conds = getConditionsForNetwork(initialValues?.network ?? 'Meta');
    return {
      conditionKey: initialValues?.conditionKey ?? conds[0]?.key ?? 'cpa_gt',
      conditionParam: initialValues?.conditionParam ?? conds[0]?.defaultValue ?? 2,
    };
  });
  const [actionVal, setActionVal] = useState<ActionValue>(() => {
    const acts = getActionsForNetwork(initialValues?.network ?? 'Meta');
    return {
      actionKey: initialValues?.actionKey ?? acts[0]?.key ?? 'pause_campaign',
      actionParam: initialValues?.actionParam,
    };
  });
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // Sync form network field on open
  useEffect(() => {
    if (open) {
      const net = initialValues?.network ?? 'Meta';
      setNetwork(net);
      form.setFieldsValue({ name: initialValues?.name ?? '', scheduleMinutes: initialValues?.scheduleMinutes ?? 60 });
    }
  }, [open, initialValues, form]);

  const handleNetworkChange = (net: string) => {
    setNetwork(net);
    const conds = getConditionsForNetwork(net);
    const acts = getActionsForNetwork(net);
    setConditionVal({ conditionKey: conds[0]?.key ?? 'cpa_gt', conditionParam: conds[0]?.defaultValue ?? 0 });
    setActionVal({ actionKey: acts[0]?.key ?? 'pause_campaign', actionParam: undefined });
  };

  const handleApplyTemplate = (tpl: RuleTemplate) => {
    const net = tpl.network === 'All' ? network : tpl.network;
    setNetwork(net);
    form.setFieldsValue({ scheduleMinutes: tpl.scheduleMinutes });
    setConditionVal({ conditionKey: tpl.conditionKey, conditionParam: tpl.conditionParam });
    setActionVal({ actionKey: tpl.actionKey, actionParam: tpl.actionParam });
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      onSave({
        name: values.name,
        network,
        conditionKey: conditionVal.conditionKey,
        conditionParam: conditionVal.conditionParam,
        actionKey: actionVal.actionKey,
        actionParam: actionVal.actionParam,
        scheduleMinutes: values.scheduleMinutes,
        status: 'active',
        lastTriggered: undefined,
      });
      toast.success('Rule saved successfully!');
      form.resetFields();
      onClose();
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
            <Button
              size="small"
              icon={<Zap size={12} />}
              onClick={() => setTemplatePickerOpen(true)}
              className="font-semibold text-xs cursor-pointer"
            >
              Use Template
            </Button>
          </div>
        }
        open={open}
        onCancel={onClose}
        onOk={handleOk}
        okText="Save Rule"
        cancelText="Cancel"
        width={600}
        okButtonProps={{ className: 'bg-primary-500 border-0 text-[var(--text-inverse)] font-bold cursor-pointer' }}
      >
        <Form form={form} layout="vertical" className="mt-4 space-y-6"
          initialValues={{ scheduleMinutes: 60 }}>

          {/* Rule Name & Network */}
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label={<span className="text-xs font-bold text-[var(--text-secondary)]">Rule Name</span>}
              name="name"
              rules={[{ required: true, message: 'Enter a rule name' }]}
              className="mb-0 col-span-2"
            >
              <Input placeholder="e.g. Pause high CPA campaigns" className="h-10 rounded-lg" />
            </Form.Item>
            
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)] mb-2">Network</div>
              <Select
                value={network}
                onChange={handleNetworkChange}
                options={NETWORKS.map(n => ({ value: n, label: n }))}
                className="w-full h-10"
              />
            </div>
          </div>

          {/* Visual Block Builder for Logic */}
          <div className="bg-[var(--surface-subtle)] border border-[var(--border-default)] p-4 rounded-2xl relative shadow-sm">
            <div className="absolute top-4 right-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Logic Builder</div>
            
            {/* Trigger condition Block */}
            <div className="bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-xl p-4 relative shadow-sm mt-4 hover:border-[var(--color-primary-300)] transition-colors">
              <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase text-[var(--status-error)]">
                <span className="bg-[var(--status-error-bg)] border border-[var(--status-error-border)] px-2.5 py-1 rounded">IF</span>
                <span className="text-[var(--text-secondary)]">Condition is met</span>
              </div>
              <RuleConditionBuilder
                network={network}
                value={conditionVal}
                onChange={setConditionVal}
              />
            </div>

            <div className="flex justify-center -my-3 relative z-10 pointer-events-none">
               <div className="w-7 h-7 rounded-full bg-[var(--surface-base)] border-2 border-[var(--border-strong)] flex items-center justify-center shadow-sm">
                  <div className="w-0.5 h-3 bg-[var(--text-tertiary)]" />
               </div>
            </div>

            {/* Action Block */}
            <div className="bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-xl p-4 relative shadow-sm hover:border-[var(--color-primary-300)] transition-colors">
              <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase text-[var(--status-success)]">
                <span className="bg-[var(--status-success-bg)] border border-[var(--status-success-border)] px-2.5 py-1 rounded">THEN</span>
                <span className="text-[var(--text-secondary)]">Execute Action</span>
              </div>
              <RuleActionBuilder
                network={network}
                value={actionVal}
                onChange={setActionVal}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-[var(--surface-base)] border border-[var(--border-default)] p-4 rounded-2xl shadow-sm">
            <div className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-3">
              Schedule — check frequency
            </div>
            <Form.Item name="scheduleMinutes" className="mb-0">
              <Radio.Group className="flex gap-4">
                <Radio value={15} className="text-xs font-semibold">Every 15 min</Radio>
                <Radio value={60} className="text-xs font-semibold">Hourly</Radio>
                <Radio value={1440} className="text-xs font-semibold">Daily</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <RuleTemplatePicker
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={handleApplyTemplate}
      />
    </>
  );
};

export default RuleEditorModal;
