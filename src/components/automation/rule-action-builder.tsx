import React, { useEffect } from 'react';
import { Select, InputNumber } from 'antd';
import { getActionsForNetwork, ACTION_DEFS } from '@/shared/rule-conditions';

// ─────────────────────────────────────────────────────────────────────────────
// RuleActionBuilder — network-filtered action type selector + optional param input
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionValue {
  actionKey: string;
  actionParam?: number;
}

interface RuleActionBuilderProps {
  network: string;
  value: ActionValue;
  onChange: (v: ActionValue) => void;
}

export const RuleActionBuilder: React.FC<RuleActionBuilderProps> = ({
  network,
  value,
  onChange,
}) => {
  const actions = getActionsForNetwork(network);

  // Reset to first valid action when network changes
  useEffect(() => {
    const isValid = actions.some(a => a.key === value.actionKey);
    if (!isValid && actions.length > 0) {
      onChange({ actionKey: actions[0].key, actionParam: undefined });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const selectedDef = ACTION_DEFS.find(a => a.key === value.actionKey);
  const needsParam = selectedDef?.paramType && selectedDef.paramType !== 'none';
  const isPercent = selectedDef?.paramType === 'percent';

  const handleKeyChange = (key: string) => {
    onChange({ actionKey: key, actionParam: undefined });
  };

  const handleParamChange = (param: number | null) => {
    onChange({ ...value, actionParam: param ?? undefined });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={value.actionKey}
        onChange={handleKeyChange}
        className="min-w-[200px]"
        options={actions.map(a => ({ value: a.key, label: a.label }))}
        placeholder="Select action"
        size="middle"
      />
      {needsParam && (
        <InputNumber
          value={value.actionParam}
          onChange={handleParamChange}
          min={isPercent ? -100 : 0}
          max={isPercent ? 100 : undefined}
          step={isPercent ? 5 : 0.01}
          precision={isPercent ? 0 : 2}
          addonAfter={isPercent ? '%' : selectedDef?.paramLabel ?? ''}
          placeholder={selectedDef?.paramLabel ?? 'Value'}
          className="w-36"
          size="middle"
        />
      )}
    </div>
  );
};

export default RuleActionBuilder;
