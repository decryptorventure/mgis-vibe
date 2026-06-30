// CreateForm for Value Rule Sets — options, types, and the form component
import React, { useState } from 'react';
import { Input, Select } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { Plus } from 'lucide-react';

const mkId = () => Math.random().toString(36).slice(2, 8);

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' }, { value: 'JPY', label: 'JPY' },
];

export const ACTION_OPTIONS = [
  { value: 'increase', label: 'Increase bid' },
  { value: 'decrease', label: 'Decrease bid' },
];

export const CRITERIA_TYPE_OPTIONS = [
  { value: 'location', label: 'Location' },
  { value: 'age', label: 'Age' },
  { value: 'gender', label: 'Gender' },
  { value: 'os', label: 'OS' },
  { value: 'device', label: 'Device' },
  { value: 'placement', label: 'Placement' },
  { value: 'conversion_location', label: 'Conversion location' },
];

interface Criterion { id: string; type: string; value: string }
interface Rule { id: string; name: string; action: string; pct: string; criteria: Criterion[] }

const defaultRule = (): Rule => ({
  id: mkId(), name: '', action: 'increase', pct: '20',
  criteria: [{ id: mkId(), type: 'location', value: '' }],
});

interface CreateFormProps { onCancel: () => void; onCreate: (name: string) => void }

export const CreateForm: React.FC<CreateFormProps> = ({ onCancel, onCreate }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [rules, setRules] = useState<Rule[]>([defaultRule()]);

  const patchRule = (id: string, p: Partial<Rule>) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...p } : r));

  const patchCrit = (ruleId: string, critId: string, p: Partial<Criterion>) =>
    setRules(prev => prev.map(r => r.id === ruleId
      ? { ...r, criteria: r.criteria.map(c => c.id === critId ? { ...c, ...p } : c) }
      : r));

  const addCrit = (ruleId: string) =>
    setRules(prev => prev.map(r => r.id === ruleId
      ? { ...r, criteria: [...r.criteria, { id: mkId(), type: 'location', value: '' }] }
      : r));

  const dashedBtn = 'flex items-center gap-1.5 body_s text_secondary border border-dashed border_secondary rounded-md px-3 py-1.5 hover:text_primary transition-colors';

  return (
    <div className="space-y-4">
      <button type="button" onClick={onCancel} className={dashedBtn}>
        <Plus size={13} />Cancel
      </button>

      <div>
        <div className="body_s font-semibold text_primary mb-1.5">
          <span className="fg_error mr-0.5">*</span>Rule set name
        </div>
        <Input placeholder="Example: High Value Users" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div>
        <div className="body_s font-semibold text_primary mb-1.5">
          <span className="fg_error mr-0.5">*</span>Currency
        </div>
        <Select value={currency} onChange={setCurrency} options={CURRENCY_OPTIONS} className="w-36" />
      </div>

      <div>
        <div className="body_s font-semibold text_primary mb-1">Rules</div>
        <p className="text-xs text_tertiary mb-3">
          Each rule must include at least one criteria. Meta rejects value rule sets that do not send 'criterias'.
        </p>

        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="border border_secondary radius_8 p-3 bg_secondary space-y-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Rule name (optional)" value={rule.name} onChange={e => patchRule(rule.id, { name: e.target.value })} className="flex-1 min-w-0" />
                <Select value={rule.action} onChange={v => patchRule(rule.id, { action: v })} options={ACTION_OPTIONS} className="w-36 shrink-0" />
                <Input value={rule.pct} onChange={e => patchRule(rule.id, { pct: e.target.value })} className="w-14 shrink-0" />
                <span className="body_s text_secondary shrink-0">%</span>
              </div>

              <div>
                <div className="text-xs font-semibold text_secondary mb-2">Criteria</div>
                {rule.criteria.map(crit => (
                  <div key={crit.id} className="flex items-center gap-2 mb-2">
                    <Select value={crit.type} onChange={v => patchCrit(rule.id, crit.id, { type: v, value: '' })} options={CRITERIA_TYPE_OPTIONS} className="w-44 shrink-0" />
                    <Input
                      placeholder={crit.type === 'location' ? 'Select country codes' : 'Enter value'}
                      value={crit.value}
                      onChange={e => patchCrit(rule.id, crit.id, { value: e.target.value })}
                      className="flex-1 min-w-0"
                    />
                  </div>
                ))}
                <div className="flex items-start justify-between gap-4 mt-1">
                  <p className="text-[11px] text_tertiary">Location uses country codes. Other criteria types accept raw Meta values.</p>
                  <button type="button" onClick={() => addCrit(rule.id)} className="shrink-0 flex items-center gap-1 text-xs text_secondary hover:text_primary border border_secondary rounded px-2 py-1 transition-colors">
                    <Plus size={11} />Add criteria
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => setRules(prev => [...prev, defaultRule()])} className={`mt-3 ${dashedBtn}`}>
          <Plus size={13} />Add rule
        </button>
      </div>

      <div className="flex justify-end pt-2 border-t border_secondary">
        <Button type="button" variant="primary" disabled={!name.trim()} onClick={() => onCreate(name.trim())}>
          Create rule set
        </Button>
      </div>
    </div>
  );
};
