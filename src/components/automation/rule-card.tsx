// ─── RuleCard — human-readable automation rule display card ──────────────────
import React from 'react';
import { Switch, Tag } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { Pencil, Clock, Zap } from 'lucide-react';
import { CONDITION_DEFS, ACTION_DEFS } from '@/shared/rule-conditions';
import type { NetworkRule } from '@/shared/mock-data';

interface RuleCardProps {
  rule: NetworkRule;
  onEdit: (rule: NetworkRule) => void;
  onToggle: (ruleId: string) => void;
}

function conditionLabel(key: string, param: number): string {
  const def = CONDITION_DEFS.find(c => c.key === key);
  if (!def) return `${key} ${param}`;
  const suffix = def.paramType === 'percent' ? '%' : '';
  return `${def.label} ${param}${suffix}`;
}

function actionLabel(key: string, param?: number): string {
  const def = ACTION_DEFS.find(a => a.key === key);
  if (!def) return key;
  if (param !== undefined && def.paramType !== 'none') {
    const suffix = def.paramType === 'percent' ? '%' : '';
    return `${def.label} ${param}${suffix}`;
  }
  return def.label;
}

function scheduleLabel(mins: number): string {
  if (mins === 15) return 'Every 15 min';
  if (mins === 60) return 'Hourly';
  return 'Daily';
}

const NETWORK_COLORS: Record<string, string> = {
  'Google Ads': 'orange', Meta: 'blue', ASA: 'purple', Axon: 'magenta', Moloco: 'pink',
};

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onEdit, onToggle }) => (
  <div className="bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl p-4 flex flex-col gap-3">
    {/* Header row */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <Switch
          size="small"
          checked={rule.status === 'active'}
          onChange={() => onToggle(rule.id)}
        />
        <span className="font-bold text-sm text-[var(--text-primary)]">{rule.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Tag color={NETWORK_COLORS[rule.network] ?? 'default'} bordered={false} className="rounded text-[10px] font-bold">
          {rule.network}
        </Tag>
        <Tag color={rule.status === 'active' ? 'green' : 'default'} bordered={false} className="rounded text-[10px] font-bold">
          {rule.status.toUpperCase()}
        </Tag>
      </div>
    </div>

    {/* IF / THEN summary */}
    <div className="bg-[var(--surface-muted)] rounded-lg px-3 py-2.5 text-[11px] space-y-1">
      <div className="flex gap-2">
        <span className="text-[var(--text-tertiary)] font-semibold w-12 shrink-0">IF</span>
        <span className="text-[var(--status-error)] font-semibold">
          {conditionLabel(rule.conditionKey, rule.conditionParam)}
        </span>
      </div>
      <div className="flex gap-2">
        <span className="text-[var(--text-tertiary)] font-semibold w-12 shrink-0">THEN</span>
        <span className="text-[var(--status-success)] font-semibold">
          {actionLabel(rule.actionKey, rule.actionParam)}
        </span>
      </div>
    </div>

    {/* Footer meta */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1">
          <Clock size={10} /> {scheduleLabel(rule.scheduleMinutes)}
        </span>
        <span className="flex items-center gap-1">
          <Zap size={10} /> {rule.triggerCount}x triggered
        </span>
        {rule.lastTriggered && (
          <span>Last: {rule.lastTriggered.split(' ')[0]}</span>
        )}
      </div>
      <Button size="s" variant="border" onClick={() => onEdit(rule)} className="gap-1 text-[10px]">
        <Pencil size={10} /> Edit
      </Button>
    </div>
  </div>
);
