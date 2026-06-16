import React from 'react';
import { Form, Input, Select, InputNumber, Row, Col } from 'antd';
import { GoogleAdPreviewPanel } from '../google-ad-preview-panel';

interface GoogleTargetingSectionProps {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}

export const GoogleTargetingSection: React.FC<GoogleTargetingSectionProps> = ({
  value,
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const bidStrategy = value.bidStrategy || 'target_cpi';
  const targetCpi = value.targetCpi !== undefined ? value.targetCpi : 0.85;
  const countries = value.countries || ['US'];
  const headlines = value.headlines || ['Hot Pot Story Restaurant'];
  const descriptions = value.descriptions || ['Manage your own Hot Pot Restaurant. Cook delicious dishes!'];

  const handleHeadlineChange = (idx: number, val: string) => {
    const list = [...headlines];
    list[idx] = val;
    updateField('headlines', list);
  };

  const handleDescriptionChange = (idx: number, val: string) => {
    const list = [...descriptions];
    list[idx] = val;
    updateField('descriptions', list);
  };

  return (
    <Row gutter={24}>
      <Col xs={24} md={14} className="space-y-4">
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Bid Strategy" required>
                <Select
                  value={bidStrategy}
                  onChange={(val) => updateField('bidStrategy', val)}
                  options={[
                    { value: 'target_cpi', label: 'Target CPI (Maximize Installs)' },
                    { value: 'target_roas', label: 'Target ROAS (Maximize Revenue)' },
                  ]}
                  size="small"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Target CPI Bid ($)" required>
                <InputNumber
                  className="w-full"
                  min={0.01}
                  step={0.05}
                  value={targetCpi}
                  onChange={(val) => updateField('targetCpi', val)}
                  size="small"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Target Countries" required>
            <Select
              mode="multiple"
              placeholder="Select countries"
              value={countries}
              onChange={(val) => updateField('countries', val)}
              options={[
                { value: 'US', label: 'United States' },
                { value: 'JP', label: 'Japan' },
                { value: 'KR', label: 'South Korea' },
                { value: 'VN', label: 'Vietnam' },
              ]}
              size="small"
            />
          </Form.Item>

          <div className="space-y-2">
            <span className="text-[12px] font-bold text-[var(--text-secondary)]">Headlines (max 30 characters)</span>
            <Input
              value={headlines[0] || ''}
              maxLength={30}
              placeholder="Headline 1 (required)"
              onChange={(e) => handleHeadlineChange(0, e.target.value)}
              suffix={<span className="text-[9px] text-[var(--text-tertiary)]">{(headlines[0] || '').length}/30</span>}
              size="small"
            />
            <Input
              value={headlines[1] || ''}
              maxLength={30}
              placeholder="Headline 2 (optional)"
              onChange={(e) => handleHeadlineChange(1, e.target.value)}
              suffix={<span className="text-[9px] text-[var(--text-tertiary)]">{(headlines[1] || '').length}/30</span>}
              size="small"
            />
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[12px] font-bold text-[var(--text-secondary)]">Descriptions (max 90 characters)</span>
            <Input.TextArea
              value={descriptions[0] || ''}
              maxLength={90}
              placeholder="Description 1 (required)"
              rows={2}
              onChange={(e) => handleDescriptionChange(0, e.target.value)}
            />
            <div className="text-right text-[9px] text-[var(--text-tertiary)]">{(descriptions[0] || '').length}/90</div>
          </div>
        </Form>
      </Col>

      <Col xs={24} md={10} className="bg-[var(--surface-muted)]/50 p-3 rounded-xl border border-[var(--border-subtle)]">
        <GoogleAdPreviewPanel
          headline={headlines[0] || ''}
          description={descriptions[0] || ''}
        />
      </Col>
    </Row>
  );
};
