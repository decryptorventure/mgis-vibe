// rule-logic-builder.tsx — IF/THEN multi-condition/action visual block builder
import React from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@frontend-team/ui-kit';
import { RuleConditionBuilder } from './rule-condition-builder';
import { RuleActionBuilder, type ActionValue } from './rule-action-builder';
import { getConditionsForNetwork, getActionsForNetwork } from '@/shared/rule-conditions';

export interface ConditionValue {
  conditionKey: string;
  conditionParam: number;
}

interface Props {
  network: string;
  conditions: ConditionValue[];
  actions: ActionValue[];
  onConditionsChange: (v: ConditionValue[]) => void;
  onActionsChange: (v: ActionValue[]) => void;
}

const ROW_BTN = 'flex items-center justify-center w-6 h-6 radius_6 border border_secondary text_tertiary hover:fg_error hover:border_error hover:bg_red_subtle transition-colors cursor-pointer bg-transparent shrink-0';

export const RuleLogicBuilder: React.FC<Props> = ({ network, conditions, actions, onConditionsChange, onActionsChange }) => {
  const addCondition = () => {
    const conds = getConditionsForNetwork(network);
    onConditionsChange([...conditions, { conditionKey: conds[0]?.key ?? 'cpa_gt', conditionParam: conds[0]?.defaultValue ?? 0 }]);
  };

  const removeCondition = (idx: number) => onConditionsChange(conditions.filter((_, i) => i !== idx));

  const updateCondition = (idx: number, val: ConditionValue) =>
    onConditionsChange(conditions.map((c, i) => (i === idx ? val : c)));

  const addAction = () => {
    const acts = getActionsForNetwork(network);
    onActionsChange([...actions, { actionKey: acts[0]?.key ?? 'pause_campaign', actionParam: undefined }]);
  };

  const removeAction = (idx: number) => onActionsChange(actions.filter((_, i) => i !== idx));

  const updateAction = (idx: number, val: ActionValue) =>
    onActionsChange(actions.map((a, i) => (i === idx ? val : a)));

  return (
    <div className="bg-[var(--surface-subtle)] border border-[var(--border-default)] p-4 rounded-2xl relative shadow-sm space-y-3">
      <div className="absolute top-4 right-4 text-[10px] font-bold text_tertiary uppercase tracking-widest">Logic Builder</div>

      {/* IF block */}
      <div className="bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-xl p-4 shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase fg_error">
          <span className="bg_red_subtle border border_error px-2.5 py-1 rounded">IF</span>
          <span className="text_secondary">All conditions are met (AND)</span>
        </div>
        <div className="space-y-2">
          {conditions.map((cond, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && (
                <span className="text-[10px] font-bold text_tertiary w-8 shrink-0 text-right">AND</span>
              )}
              {idx === 0 && <span className="w-8 shrink-0" />}
              <RuleConditionBuilder network={network} value={cond} onChange={v => updateCondition(idx, v)} />
              {conditions.length > 1 && (
                <button type="button" onClick={() => removeCondition(idx)} className={ROW_BTN} aria-label="Remove condition">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCondition}
          className={cn('mt-3 flex items-center gap-1.5 text-xs font-semibold text_secondary hover:text_primary transition-colors cursor-pointer bg-transparent border-0 p-0')}
        >
          <Plus size={13} className="fg_link" /> Add Condition
        </button>
      </div>

      {/* Connector dot */}
      <div className="flex justify-center pointer-events-none -my-1 relative z-10">
        <div className="w-7 h-7 rounded-full bg-[var(--surface-base)] border-2 border-[var(--border-strong)] flex items-center justify-center shadow-sm">
          <div className="w-0.5 h-3 bg-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* THEN block */}
      <div className="bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase fg_success">
          <span className="bg_emerald_subtle border border_emerald px-2.5 py-1 rounded">THEN</span>
          <span className="text_secondary">Execute actions</span>
        </div>
        <div className="space-y-2">
          {actions.map((act, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-8 shrink-0" />
              <RuleActionBuilder network={network} value={act} onChange={v => updateAction(idx, v)} />
              {actions.length > 1 && (
                <button type="button" onClick={() => removeAction(idx)} className={ROW_BTN} aria-label="Remove action">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAction}
          className={cn('mt-3 flex items-center gap-1.5 text-xs font-semibold text_secondary hover:text_primary transition-colors cursor-pointer bg-transparent border-0 p-0')}
        >
          <Plus size={13} className="fg_link" /> Add Action
        </button>
      </div>
    </div>
  );
};

export default RuleLogicBuilder;
