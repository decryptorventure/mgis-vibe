import React from 'react';
import { Form, Input, InputNumber, Select, Row, Col } from '@/components/ui-kit-compat';

interface AsaTargetingSectionProps {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}

export const AsaTargetingSection: React.FC<AsaTargetingSectionProps> = ({
  value,
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const keywords = value.keywords || '';
  const matchType = value.matchType || 'EXACT';
  const defaultBid = value.defaultBid !== undefined ? value.defaultBid : 1.50;
  const deviceType = value.deviceType || 'both';

  return (
    <Form layout="vertical" className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Default Keyword Bid ($)" required>
            <InputNumber
              className="w-full"
              min={0.01}
              step={0.1}
              value={defaultBid}
              onChange={(val) => updateField('defaultBid', val)}
              size="small"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Keyword Match Type" required>
            <Select
              value={matchType}
              onChange={(val) => updateField('matchType', val)}
              options={[
                { value: 'EXACT', label: 'Exact Match' },
                { value: 'BROAD', label: 'Broad Match' },
              ]}
              size="small"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Keywords (one per line)" required>
        <Input.TextArea
          placeholder="e.g.&#10;hot pot story&#10;cooking game&#10;restaurant simulation"
          value={keywords}
          rows={3}
          onChange={(e) => updateField('keywords', e.target.value)}
        />
      </Form.Item>

      <Form.Item label="Target Devices" required>
        <Select
          value={deviceType}
          onChange={(val) => updateField('deviceType', val)}
          options={[
            { value: 'both', label: 'iPhone and iPad' },
            { value: 'iphone', label: 'iPhone only' },
            { value: 'ipad', label: 'iPad only' },
          ]}
          size="small"
        />
      </Form.Item>
    </Form>
  );
};
