import React from 'react';
import { Form, Select, InputNumber, Row, Col } from '@/components/ui-kit-compat';

interface AxonTargetingSectionProps {
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}

export const AxonTargetingSection: React.FC<AxonTargetingSectionProps> = ({
  value,
  onChange,
}) => {
  const updateField = (field: string, val: any) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const optimization = value.optimization || 'cpi';
  const baseBid = value.baseBid !== undefined ? value.baseBid : 0.85;
  const targetCpa = value.targetCpa !== undefined ? value.targetCpa : 1.00;

  return (
    <Form layout="vertical" className="space-y-4">
      <Form.Item label="Optimization Goal" required>
        <Select
          value={optimization}
          onChange={(val) => updateField('optimization', val)}
          options={[
            { value: 'cpi', label: 'Optimize for Cost Per Install (CPI)' },
            { value: 'cpa', label: 'Optimize for Cost Per Action (CPA)' },
            { value: 'roas', label: 'Optimize for Return on Ad Spend (ROAS)' },
          ]}
          size="small"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Base CPI Bid ($)" required>
            <InputNumber
              className="w-full"
              min={0.01}
              step={0.05}
              value={baseBid}
              onChange={(val) => updateField('baseBid', val)}
              size="small"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Target CPA ($)" required>
            <InputNumber
              className="w-full"
              min={0.01}
              step={0.1}
              value={targetCpa}
              onChange={(val) => updateField('targetCpa', val)}
              size="small"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
