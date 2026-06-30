import React from 'react';
import { Form, Select, Switch } from '@/components/ui-kit-compat';

interface MolocoTargetingSectionProps {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}

export const MolocoTargetingSection: React.FC<MolocoTargetingSectionProps> = ({
  value,
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const exchanges = value.exchanges || ['admob', 'applovin'];
  const enableBlocklist = value.enableBlocklist !== undefined ? value.enableBlocklist : true;

  return (
    <Form layout="vertical" className="space-y-4">
      <Form.Item label="Ad Exchanges" required>
        <Select
          mode="multiple"
          placeholder="Select exchanges"
          value={exchanges}
          onChange={(val) => updateField('exchanges', val)}
          options={[
            { value: 'admob', label: 'Google AdMob' },
            { value: 'applovin', label: 'AppLovin MAX' },
            { value: 'unity', label: 'Unity Ads' },
            { value: 'ironsource', label: 'IronSource' },
            { value: 'vungle', label: 'Vungle / Liftoff' },
          ]}
          size="small"
        />
      </Form.Item>

      <div className="flex items-center justify-between bg-[var(--surface-subtle)] p-3 rounded-lg border border-[var(--border-subtle)]">
        <div>
          <div className="font-semibold text-xs text-[var(--text-primary)]">Auto-apply Publisher Blocklist</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">Chặn các bundle ID gian lận hoặc kém hiệu quả đã lưu trong hệ thống.</div>
        </div>
        <Switch checked={enableBlocklist} onChange={(val) => updateField('enableBlocklist', val)} />
      </div>
    </Form>
  );
};
