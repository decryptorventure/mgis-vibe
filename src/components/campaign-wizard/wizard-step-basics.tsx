import React from 'react';
import { Form, Input, Select, Radio, Checkbox, Card } from 'antd';
import { mockProjects } from '@/shared/mock-data';
import { ACTIVE_NETWORKS, ACTIVE_NETWORK_KEYS } from '@/shared/navigation';

interface WizardStepBasicsProps {
  state: any;
  onChange: (updates: Record<string, any>) => void;
}

export const WizardStepBasics: React.FC<WizardStepBasicsProps> = ({
  state,
  onChange,
}) => {
  const networks = ACTIVE_NETWORK_KEYS.map(key => ACTIVE_NETWORKS[key]);

  return (
    <Form layout="vertical" className="space-y-4">
      <Form.Item label="Project / App" required>
        <Select
          value={state.projectId}
          onChange={(val) => onChange({ projectId: val })}
          options={mockProjects.map(p => ({
            value: p.id,
            label: (
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[var(--surface-muted)] flex items-center justify-center text-[10px] font-bold">
                  {p.icon}
                </span>
                <span className="text-xs font-medium">{p.name} ({p.os.toUpperCase()})</span>
              </div>
            )
          }))}
          size="small"
        />
      </Form.Item>

      <Form.Item label="Base Campaign Name" required>
        <Input
          value={state.baseName}
          placeholder="e.g. CookingStory_US_Install"
          onChange={(e) => onChange({ baseName: e.target.value })}
          size="small"
        />
        <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
          Hệ thống sẽ tự động ghép thêm hậu tố của từng Ad Network tương ứng (ví dụ: {state.baseName || 'CookingStory_US_Install'}_Meta)
        </div>
      </Form.Item>

      <Form.Item label="Campaign Objective" required>
        <Radio.Group
          value={state.objective}
          onChange={(e) => onChange({ objective: e.target.value })}
          className="flex gap-4"
        >
          <Radio value="installs">
            <span className="text-xs font-semibold">Maximize Installs</span>
          </Radio>
          <Radio value="roas">
            <span className="text-xs font-semibold">Optimize Revenue (ROAS)</span>
          </Radio>
          <Radio value="events">
            <span className="text-xs font-semibold">Optimize In-App Events</span>
          </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Ad Networks (multi-select)" required>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-1">
          {networks.map(n => {
            const isSelected = state.selectedNetworks.includes(n.key);
            return (
              <Card
                key={n.key}
                hoverable
                className="cursor-pointer transition-colors border rounded-lg"
                style={{
                  borderColor: isSelected ? n.color : 'var(--border-default)',
                  background: isSelected ? `${n.color}08` : 'var(--surface-base)',
                  boxShadow: isSelected ? `0 0 0 1px ${n.color}20` : 'none',
                  opacity: state.lockedNetwork && state.lockedNetwork !== n.key ? 0.5 : 1,
                  pointerEvents: state.lockedNetwork && state.lockedNetwork !== n.key ? 'none' : 'auto',
                }}
                styles={{ body: { padding: '12px 14px' } }}
                onClick={() => {
                  if (state.lockedNetwork) return; // locked to default network
                  let list = [...state.selectedNetworks];
                  if (list.includes(n.key)) {
                    list = list.filter(k => k !== n.key);
                  } else {
                    list.push(n.key);
                  }
                  onChange({ selectedNetworks: list });
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: n.color }}
                    />
                    <span className="text-xs font-bold" style={{ color: isSelected ? n.color : 'var(--text-primary)' }}>
                      {n.label}
                    </span>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    disabled={!!state.lockedNetwork}
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </Form.Item>
    </Form>
  );
};
export default WizardStepBasics;
