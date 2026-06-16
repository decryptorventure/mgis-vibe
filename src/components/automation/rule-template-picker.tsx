import React, { useState } from 'react';
import { Modal, Button, Tag } from 'antd';
import { Zap } from 'lucide-react';
import { RULE_TEMPLATES, CONDITION_DEFS, ACTION_DEFS, type RuleTemplate } from '@/shared/rule-conditions';
import { FilterChip } from '@/components/ui/FilterChip';

// ─────────────────────────────────────────────────────────────────────────────
// RuleTemplatePicker — modal with template cards + network filter
// ─────────────────────────────────────────────────────────────────────────────

interface RuleTemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: RuleTemplate) => void;
}

const NETWORKS = ['All', 'Google Ads', 'Meta', 'ASA', 'Axon', 'Moloco'];

function getConditionLabel(key: string, param: number): string {
  const def = CONDITION_DEFS.find(c => c.key === key);
  if (!def) return key;
  const suffix = def.paramType === 'percent' ? '%' : '';
  return `${def.label} ${param}${suffix}`;
}

function getActionLabel(key: string, param?: number): string {
  const def = ACTION_DEFS.find(a => a.key === key);
  if (!def) return key;
  if (param !== undefined && def.paramType !== 'none') {
    const suffix = def.paramType === 'percent' ? '%' : '';
    return `${def.label} ${param}${suffix}`;
  }
  return def.label;
}

export const RuleTemplatePicker: React.FC<RuleTemplatePickerProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState('All');

  const filtered = RULE_TEMPLATES.filter(t =>
    selectedNetwork === 'All' || t.network === selectedNetwork || t.network === 'All'
  );

  const scheduleLabel = (mins: number) => {
    if (mins === 15) return 'Every 15 min';
    if (mins === 60) return 'Hourly';
    return 'Daily';
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[var(--status-warning)]" />
          <span className="font-bold text-sm">Rule Templates</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
    >
      {/* Network filter chips */}
      <div className="flex flex-wrap gap-2 mb-4 pt-2">
        {NETWORKS.map(net => (
          <FilterChip
            key={net}
            label={net}
            active={selectedNetwork === net}
            onClick={() => setSelectedNetwork(net)}
          />
        ))}
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(tpl => (
          <div
            key={tpl.id}
            className="border border-[var(--border-default)] rounded-xl p-4 bg-[var(--surface-base)] flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-xs text-[var(--text-primary)]">{tpl.name}</span>
              <Tag bordered={false} className="rounded-full text-[10px] font-semibold shrink-0">
                {tpl.network}
              </Tag>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed m-0">{tpl.description}</p>
            <div className="bg-[var(--surface-muted)] rounded-lg px-3 py-2 text-[11px] space-y-0.5">
              <div className="flex gap-1">
                <span className="text-[var(--text-tertiary)] font-medium w-16 shrink-0">IF</span>
                <span className="text-[var(--status-error)] font-semibold">{getConditionLabel(tpl.conditionKey, tpl.conditionParam)}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[var(--text-tertiary)] font-medium w-16 shrink-0">THEN</span>
                <span className="text-[var(--status-success)] font-semibold">{getActionLabel(tpl.actionKey, tpl.actionParam)}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[var(--text-tertiary)] font-medium w-16 shrink-0">CHECK</span>
                <span className="text-[var(--text-secondary)] font-medium">{scheduleLabel(tpl.scheduleMinutes)}</span>
              </div>
            </div>
            <Button
              size="small"
              onClick={() => { onSelect(tpl); onClose(); }}
              className="mt-1 font-bold text-xs cursor-pointer"
            >
              Use Template
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default RuleTemplatePicker;
