import React, { useEffect } from 'react';
import { Select, InputNumber } from 'antd';
import { getConditionsForNetwork, CONDITION_DEFS } from '@/shared/rule-conditions';

// ─────────────────────────────────────────────────────────────────────────────
// RuleConditionBuilder — network-filtered condition type selector + threshold input
// ─────────────────────────────────────────────────────────────────────────────

interface ConditionValue {
  conditionKey: string;
  conditionParam: number;
}

interface RuleConditionBuilderProps {
  network: string;
  value: ConditionValue;
  onChange: (v: ConditionValue) => void;
}

export const RuleConditionBuilder: React.FC<RuleConditionBuilderProps> = ({
  network,
  value,
  onChange,
}) => {
  const conditions = getConditionsForNetwork(network);

  // Reset to first valid condition when network changes
  useEffect(() => {
    const isValid = conditions.some(c => c.key === value.conditionKey);
    if (!isValid && conditions.length > 0) {
      onChange({ conditionKey: conditions[0].key, conditionParam: conditions[0].defaultValue });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const selectedDef = CONDITION_DEFS.find(c => c.key === value.conditionKey);

  const handleKeyChange = (key: string) => {
    const def = CONDITION_DEFS.find(c => c.key === key);
    onChange({ conditionKey: key, conditionParam: def?.defaultValue ?? 0 });
  };

  const handleParamChange = (param: number | null) => {
    onChange({ ...value, conditionParam: param ?? 0 });
  };

  const isPercent = selectedDef?.paramType === 'percent';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={value.conditionKey}
        onChange={handleKeyChange}
        className="min-w-[200px]"
        options={conditions.map(c => ({ value: c.key, label: c.label }))}
        placeholder="Select condition"
        size="middle"
      />
      <InputNumber
        value={value.conditionParam}
        onChange={handleParamChange}
        min={0}
        max={isPercent ? 100 : undefined}
        step={isPercent ? 5 : 0.01}
        precision={isPercent ? 0 : 2}
        addonAfter={isPercent ? '%' : selectedDef?.paramLabel ?? ''}
        placeholder={selectedDef?.paramLabel ?? 'Value'}
        className="w-36"
        size="middle"
      />
    </div>
  );
};

export default RuleConditionBuilder;
