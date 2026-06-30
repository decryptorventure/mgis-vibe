import React from 'react';
import { Form, Select, Radio, Checkbox } from '@/components/ui-kit-compat';

interface MetaTargetingSectionProps {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}

export const MetaTargetingSection: React.FC<MetaTargetingSectionProps> = ({
  value,
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const optimization = value.optimization || 'installs';
  const locations = value.locations || ['US'];
  const lookalike = value.lookalike || [];
  const placementType = value.placementType || 'advantage';
  const manualPlacements = value.manualPlacements || ['facebook_feed', 'instagram_feed'];

  const handleManualPlacements = (checkedValues: any[]) => {
    updateField('manualPlacements', checkedValues);
  };

  return (
    <Form layout="vertical" className="space-y-4">
      <Form.Item label="Optimization Goal" required>
        <Select
          value={optimization}
          onChange={(val) => updateField('optimization', val)}
          options={[
            { value: 'installs', label: 'App Installs' },
            { value: 'app_events', label: 'App Events (Purchase / Sign-up)' },
            { value: 'value', label: 'Value (ROAS Optimization)' },
          ]}
          size="small"
        />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="Target Locations" required>
          <Select
            mode="multiple"
            placeholder="Select countries"
            value={locations}
            onChange={(val) => updateField('locations', val)}
            options={[
              { value: 'US', label: 'United States' },
              { value: 'JP', label: 'Japan' },
              { value: 'KR', label: 'South Korea' },
            ]}
            size="small"
          />
        </Form.Item>

        <Form.Item label="Lookalike Audiences">
          <Select
            mode="multiple"
            placeholder="Select lookalike audiences"
            value={lookalike}
            onChange={(val) => updateField('lookalike', val)}
            options={[
              { value: 'lal_1', label: 'Lookalike 1% (Purchasers - US)' },
              { value: 'lal_3', label: 'Lookalike 3% (Active Users - JP)' },
              { value: 'lal_5', label: 'Lookalike 5% (All Installs)' },
            ]}
            size="small"
          />
        </Form.Item>
      </div>

      <Form.Item label="Placements" required>
        <Radio.Group
          value={placementType}
          onChange={(e) => updateField('placementType', e.target.value)}
          className="flex flex-col gap-2"
        >
          <Radio value="advantage">
            <span className="font-semibold text-xs text-[var(--text-primary)]">Advantage+ Placements (Recommended)</span>
            <div className="text-[10px] text-[var(--text-tertiary)] pl-6">Meta tự động phân phối trên toàn hệ thống (Facebook, Instagram, Audience Network, Messenger).</div>
          </Radio>
          <Radio value="manual">
            <span className="font-semibold text-xs text-[var(--text-primary)]">Manual Placements</span>
            <div className="text-[10px] text-[var(--text-tertiary)] pl-6">Chọn chính xác vị trí hiển thị quảng cáo.</div>
          </Radio>
        </Radio.Group>
      </Form.Item>

      {placementType === 'manual' && (
        <div className="pl-6 bg-[var(--surface-muted)]/50 p-3 rounded-lg border border-[var(--border-subtle)] text-xs">
          <Checkbox.Group value={manualPlacements} onChange={handleManualPlacements} className="grid grid-cols-2 gap-2 w-full">
            <Checkbox value="facebook_feed">Facebook Feed & Reels</Checkbox>
            <Checkbox value="instagram_feed">Instagram Feed & Stories</Checkbox>
            <Checkbox value="audience_network">Audience Network (Native/Rewarded Video)</Checkbox>
            <Checkbox value="messenger">Messenger Ads</Checkbox>
          </Checkbox.Group>
        </div>
      )}
    </Form>
  );
};
