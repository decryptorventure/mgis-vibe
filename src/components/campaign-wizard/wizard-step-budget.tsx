import React from 'react';
import { Form, Radio, InputNumber, Card, Slider, Row, Col } from '@/components/ui-kit-compat';

interface WizardStepBudgetProps {
  state: any;
  onChange: (updates: Record<string, any>) => void;
}

const NETWORK_LABELS: Record<string, string> = {
  'google-ads': 'Google Ads',
  'meta': 'Meta',
  'asa': 'Apple Search Ads',
  'axon': 'Axon',
  'moloco': 'Moloco',
};

const NETWORK_COLORS: Record<string, string> = {
  'google-ads': '#4285F4',
  'meta': '#1877F2',
  'asa': '#6b7280',
  'axon': '#FF6B35',
  'moloco': '#7C3AED',
};

export const WizardStepBudget: React.FC<WizardStepBudgetProps> = ({
  state,
  onChange,
}) => {
  const budgetMode = state.budgetMode || 'per-network';
  const sharedBudget = state.sharedBudget !== undefined ? state.sharedBudget : 5000;
  const perNetworkBudget = state.perNetworkBudget || {};
  const selectedNetworks = state.selectedNetworks || [];

  const handleModeChange = (mode: 'per-network' | 'shared') => {
    onChange({ budgetMode: mode });
  };

  const handlePerNetworkBudgetChange = (network: string, val: number | null) => {
    const next = { ...perNetworkBudget, [network]: val || 100 };
    onChange({ perNetworkBudget: next });
  };

  const handleSharedBudgetChange = (val: number | null) => {
    onChange({ sharedBudget: val || 1000 });
  };

  // Shared budget split percentage (e.g. distributed equally by default)
  const budgetSplit = state.budgetSplit || {};
  
  // Set equal split if missing or mismatching length
  React.useEffect(() => {
    const currentKeys = Object.keys(budgetSplit);
    const hasMismatch = currentKeys.length !== selectedNetworks.length || 
      selectedNetworks.some((n: string) => !currentKeys.includes(n));
      
    if (selectedNetworks.length > 0 && hasMismatch) {
      const pct = Math.floor(100 / selectedNetworks.length);
      const nextSplit: Record<string, number> = {};
      selectedNetworks.forEach((n: string, idx: number) => {
        // last one gets remainder to make sum = 100
        if (idx === selectedNetworks.length - 1) {
          nextSplit[n] = 100 - (pct * (selectedNetworks.length - 1));
        } else {
          nextSplit[n] = pct;
        }
      });
      onChange({ budgetSplit: nextSplit });
    }
  }, [selectedNetworks, budgetSplit, onChange]);

  const handleSplitPercentChange = (network: string, percent: number) => {
    const nextSplit = { ...budgetSplit, [network]: percent };
    
    // Balance others so total is 100%
    const remainingPercent = 100 - percent;
    const otherNetworks = selectedNetworks.filter((n: string) => n !== network);
    
    if (otherNetworks.length > 0) {
      const perOther = Math.floor(remainingPercent / otherNetworks.length);
      otherNetworks.forEach((n: string, idx: number) => {
        if (idx === otherNetworks.length - 1) {
          nextSplit[n] = remainingPercent - (perOther * (otherNetworks.length - 1));
        } else {
          nextSplit[n] = perOther;
        }
      });
    }
    onChange({ budgetSplit: nextSplit });
  };

  if (selectedNetworks.length === 0) {
    return (
      <div className="text-center p-8 text-[var(--status-warning)] font-semibold bg-[var(--status-warning-bg)] rounded-xl border border-[var(--status-warning-border)]">
        Vui lòng chọn ít nhất một mạng quảng cáo ở Bước 1
      </div>
    );
  }

  return (
    <Form layout="vertical" className="space-y-4">
      <Form.Item label="Budget Mode" required>
        <Radio.Group
          value={budgetMode}
          onChange={(e) => handleModeChange(e.target.value)}
          className="flex gap-4"
        >
          <Radio.Button value="per-network" className="text-xs font-semibold">Per-network Budget</Radio.Button>
          {selectedNetworks.length > 1 && (
            <Radio.Button value="shared" className="text-xs font-semibold">Shared Budget (auto % split)</Radio.Button>
          )}
        </Radio.Group>
      </Form.Item>

      {budgetMode === 'per-network' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedNetworks.map((n: string) => (
            <Card
              key={n}
              className="rounded-xl border border-[var(--border-default)] shadow-none"
              styles={{ body: { padding: '16px' } }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NETWORK_COLORS[n] }} />
                  <span className="text-xs font-bold">{NETWORK_LABELS[n]}</span>
                </div>
              </div>
              <Form.Item label="Daily Budget ($)" required className="m-0">
                <InputNumber
                  className="w-full"
                  min={10}
                  value={perNetworkBudget[n] !== undefined ? perNetworkBudget[n] : 1000}
                  onChange={(val) => handlePerNetworkBudgetChange(n, val)}
                  size="small"
                />
              </Form.Item>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Card
            className="rounded-xl border border-[var(--border-default)] shadow-none bg-[var(--surface-muted)]/50"
            styles={{ body: { padding: '16px' } }}
          >
            <Form.Item label="Total Shared Daily Budget ($)" required className="m-0">
              <InputNumber
                className="w-full"
                min={100}
                value={sharedBudget}
                onChange={handleSharedBudgetChange}
                size="small"
              />
            </Form.Item>
          </Card>

          <Card
            className="rounded-xl border border-[var(--border-default)] shadow-none"
            title={<span className="text-xs font-bold text-[var(--text-secondary)]">Budget Allocation (%)</span>}
            styles={{ body: { padding: '16px' } }}
          >
            <div className="space-y-4">
              {selectedNetworks.map((n: string) => {
                const percent = budgetSplit[n] || 0;
                const computed = Math.round((sharedBudget * percent) / 100);
                return (
                  <div key={n} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NETWORK_COLORS[n] }} />
                        <span>{NETWORK_LABELS[n]}</span>
                      </div>
                      <span className="text-[var(--text-secondary)]">
                        {percent}% (${computed.toLocaleString()}/day)
                      </span>
                    </div>
                    <Row gutter={16} align="middle">
                      <Col span={18}>
                        <Slider
                          min={0}
                          max={100}
                          value={percent}
                          onChange={(val) => handleSplitPercentChange(n, val)}
                          tooltip={{ formatter: (v) => `${v}%` }}
                        />
                      </Col>
                      <Col span={6}>
                        <InputNumber
                          className="w-full"
                          min={0}
                          max={100}
                          value={percent}
                          onChange={(val) => handleSplitPercentChange(n, val || 0)}
                          size="small"
                          suffix="%"
                        />
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </Form>
  );
};
export default WizardStepBudget;
