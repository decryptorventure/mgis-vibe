/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Button as AntButton, Switch, Modal, Skeleton, Row, Col } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { Plus, Bot, Zap, Clock, Trash2, Edit, CheckCircle2, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react';
import { mockNetworkRules, type NetworkRule } from '../shared/mock-data';
import { CONDITION_DEFS, ACTION_DEFS } from '../shared/rule-conditions';
import { PageHeader } from '../components/ui';
import { FilterChip } from '../components/ui/FilterChip';
import { RuleEditorModal } from '../components/automation/rule-editor-modal';

// ─────────────────────────────────────────────────────────────────────────────
// NetworkRules page — manage per-network automation rules
// ─────────────────────────────────────────────────────────────────────────────

interface AutomationLog {
  key: string;
  time: string;
  ruleName: string;
  entity: string;
  action: string;
  metricValue: string;
  status: 'SUCCESS' | 'FAILED';
}

const mockAutomationLogs: AutomationLog[] = [
  { key: 'log-1', time: '2026-06-05 12:30:15', ruleName: 'Auto-pause high CPA campaigns', entity: 'Meta_US_LAL_Install', action: 'Pause Campaign', metricValue: 'CPA $2.55 > $2.00', status: 'SUCCESS' },
  { key: 'log-2', time: '2026-06-05 06:00:00', ruleName: 'Budget increase on good ROAS', entity: 'Google_JP_UAC_Perf', action: 'Increase Budget by 20%', metricValue: 'Budget Used 82%', status: 'SUCCESS' },
  { key: 'log-3', time: '2026-06-04 14:00:00', ruleName: 'Auto-pause high CPA campaigns', entity: 'Meta_KR_AEO_Purchase', action: 'Pause Campaign', metricValue: 'CPA $2.10 > $2.00', status: 'SUCCESS' },
];

const NETWORK_FILTERS = ['All', 'Google Ads', 'Meta', 'ASA', 'Axon', 'Moloco'];

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

interface NetworkRulesProps {
  hideHeader?: boolean;
}

export const NetworkRules: React.FC<NetworkRulesProps> = ({ hideHeader }) => {
  const [rules, setRules] = useState<NetworkRule[]>(mockNetworkRules);
  const [logs, setLogs] = useState<AutomationLog[]>(mockAutomationLogs);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NetworkRule | undefined>();
  const [loading, setLoading] = useState(true);
  const [filterNetwork, setFilterNetwork] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleActive = useCallback((id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const next = r.status === 'active' ? 'paused' : 'active';
        toast.success(`Rule "${r.name}" set to ${next.toUpperCase()}`);
        return { ...r, status: next as NetworkRule['status'] };
      }
      return r;
    }));
  }, []);

  const handleDeleteRule = useCallback((id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Rule',
      content: `Are you sure you want to delete "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setRules(prev => prev.filter(r => r.id !== id));
        toast.success(`Deleted rule "${name}"`);
      },
    });
  }, []);

  const handleSaveRule = useCallback((data: Omit<NetworkRule, 'id' | 'triggerCount'>) => {
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? { ...editingRule, ...data } : r));
    } else {
      const newRule: NetworkRule = { ...data, id: `nr-${Date.now()}`, triggerCount: 0 };
      setRules(prev => [newRule, ...prev]);
      const newLog: AutomationLog = {
        key: `log-${Date.now()}`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        ruleName: data.name,
        entity: 'All Campaigns',
        action: getActionLabel(data.actionKey, data.actionParam),
        metricValue: getConditionLabel(data.conditionKey, data.conditionParam),
        status: 'SUCCESS',
      };
      setLogs(prev => [newLog, ...prev]);
    }
    setEditorOpen(false);
    setEditingRule(undefined);
  }, [editingRule]);

  const openEdit = (rule: NetworkRule) => {
    setEditingRule(rule);
    setEditorOpen(true);
  };

  const openCreate = () => {
    setEditingRule(undefined);
    setEditorOpen(true);
  };

  const filteredRules = rules.filter(r =>
    filterNetwork === 'All' || r.network === filterNetwork
  );

  const columns = [
    {
      title: 'Rule Name',
      key: 'name',
      render: (_: unknown, r: NetworkRule) => (
        <div className="py-1">
          <div className="font-bold text-[var(--text-primary)] text-xs">{r.name}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(r.projects ?? []).map(p => (
              <Tag key={p} bordered={false} className="rounded bg-[var(--surface-muted)] text-[10px] text-[var(--text-secondary)] font-semibold px-1 py-0 border border-[var(--border-subtle)]">{p}</Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Network',
      dataIndex: 'network',
      key: 'network',
      width: 120,
      render: (net: string) => {
        const colors: Record<string, string> = { 'Google Ads': 'orange', Meta: 'blue', ASA: 'purple', Axon: 'magenta', Moloco: 'pink' };
        return <Tag color={colors[net] ?? 'default'} bordered={false} className="rounded-md font-bold text-xs">{net}</Tag>;
      },
    },
    {
      title: 'Condition → Action',
      key: 'conditionAction',
      render: (_: unknown, r: NetworkRule) => (
        <div className="text-[11px] space-y-0.5">
          <div className="flex gap-1.5">
            <span className="text-[var(--text-tertiary)] w-8 shrink-0">IF</span>
            <span className="text-[var(--status-error)] font-semibold">{getConditionLabel(r.conditionKey, r.conditionParam)}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="text-[var(--text-tertiary)] w-8 shrink-0">THEN</span>
            <span className="text-[var(--status-success)] font-semibold">{getActionLabel(r.actionKey, r.actionParam)}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      width: 100,
      render: (_: unknown, r: NetworkRule) => {
        const label = r.scheduleMinutes === 15 ? '15 min' : r.scheduleMinutes === 60 ? 'Hourly' : 'Daily';
        return <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>;
      },
    },
    {
      title: 'Triggered',
      dataIndex: 'triggerCount',
      key: 'triggerCount',
      width: 90,
      render: (n: number) => <span className="text-xs font-bold text-[var(--text-secondary)]">{n}x</span>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_: unknown, r: NetworkRule) => (
        <div className="flex items-center gap-2">
          <Switch checked={r.status === 'active'} onChange={() => handleToggleActive(r.id)} size="small" />
          <Tag color={r.status === 'active' ? 'green' : 'default'} bordered={false} className="rounded-md text-[10px] font-bold px-1.5">
            {r.status.toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (_: unknown, r: NetworkRule) => (
        <div className="flex gap-1.5">
          <AntButton aria-label="Edit" icon={<Edit size={13} />} onClick={() => openEdit(r)}
            className="h-7 w-7 p-0 flex items-center justify-center rounded-md border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--surface-base)] cursor-pointer" />
          <AntButton aria-label="Delete" icon={<Trash2 size={13} />} onClick={() => handleDeleteRule(r.id, r.name)}
            className="h-7 w-7 p-0 flex items-center justify-center rounded-md border-[var(--status-error-border)] text-[var(--status-error)] bg-[var(--status-error-bg)] cursor-pointer" />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {!hideHeader && <Skeleton.Input active style={{ width: 300, height: 40 }} />}
        <Row gutter={[16, 16]}>{[1, 2, 3].map(i => <Col xs={24} md={8} key={i}><Card className="rounded-xl"><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>)}</Row>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <PageHeader
          icon={<Bot size={20} />}
          iconBg="var(--color-primary-500)"
          title="Network Rules"
          subtitle="Manage automation rules for advertising networks"
          actions={
            <Button type="button" variant="primary" size="m" onClick={openCreate}
              className="font-bold gap-1.5">
              <Plus size={14} />
              New Rule
            </Button>
          }
        />
      )}

      {/* Templates quick-access */}
      <Card
        title={<div className="flex items-center gap-2 text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider select-none"><Zap size={14} className="text-[var(--status-warning)]" />Rule Templates</div>}
        className="rounded-xl border-[var(--border-subtle)]"
        styles={{ body: { padding: '16px' } }}
      >
        <Row gutter={[16, 16]}>
          {[
            { icon: <DollarSign size={14} className="text-[var(--status-success)]" />, title: 'Budget Pacing Alert', desc: 'Alert when budget usage exceeds 80%.', badge: 'All Networks', badgeColor: 'var(--status-success)' },
            { icon: <AlertTriangle size={14} className="text-[var(--status-error)]" />, title: 'High CPA Pause', desc: 'Pause campaign when CPA exceeds threshold.', badge: 'Risk Control', badgeColor: 'var(--status-error)' },
            { icon: <ShieldCheck size={14} className="text-[var(--status-info)]" />, title: 'Low ROAS Scale Down', desc: 'Decrease budget 20% when ROAS drops below 1.5.', badge: 'Optimization', badgeColor: 'var(--status-info)' },
          ].map(tpl => (
            <Col xs={24} md={8} key={tpl.title}>
              <div className="bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl p-4 relative">
                <div className="absolute top-0 right-0 text-[var(--text-inverse)] text-[9px] font-bold px-2 py-0.5 rounded-bl-lg" style={{ background: tpl.badgeColor }}>{tpl.badge}</div>
                <div className="flex items-center gap-2 font-bold text-xs text-[var(--text-primary)] mb-2">{tpl.icon}{tpl.title}</div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-3">{tpl.desc}</p>
                <Button type="button" variant="border" size="s" onClick={openCreate} className="w-full font-bold text-xs">Use Template</Button>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Network filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {NETWORK_FILTERS.map(net => (
          <FilterChip key={net} label={net} active={filterNetwork === net} onClick={() => setFilterNetwork(net)} />
        ))}
      </div>

      {/* Rules table */}
      <Card className="rounded-xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table className="nms-table" columns={columns} dataSource={filteredRules} rowKey="id"
          pagination={{ pageSize: 6 }} scroll={{ x: 900 }}
          rowClassName="hover:bg-[var(--surface-subtle)] transition-colors" />
      </Card>

      {/* Execution log */}
      <Card className="rounded-xl overflow-hidden"
        title={<div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)]"><Clock size={16} className="text-[var(--text-secondary)]" />Automation Execution Log</div>}
        styles={{ body: { padding: 0 } }}>
        <Table className="nms-table" dataSource={logs} pagination={{ pageSize: 5 }}
          rowClassName="hover:bg-[var(--surface-subtle)] transition-colors"
          columns={[
            { title: 'Time', dataIndex: 'time', key: 'time', width: 170, render: (t: string) => <span className="text-xs text-[var(--text-secondary)]">{t}</span> },
            { title: 'Rule', dataIndex: 'ruleName', key: 'ruleName', width: 200, render: (t: string) => <span className="font-bold text-xs text-[var(--text-secondary)]">{t}</span> },
            { title: 'Entity', dataIndex: 'entity', key: 'entity', width: 180, render: (t: string) => <span className="font-mono text-[11px] bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">{t}</span> },
            { title: 'Action Taken', dataIndex: 'action', key: 'action', render: (t: string) => <span className="text-xs font-semibold text-[var(--text-primary)]">{t}</span> },
            { title: 'Trigger Value', dataIndex: 'metricValue', key: 'metricValue', width: 160, render: (t: string) => <span className="text-xs font-bold text-[var(--status-error)]">{t}</span> },
            { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: () => <div className="flex items-center gap-1 text-[var(--status-success)] font-bold text-xs"><CheckCircle2 size={13} />SUCCESS</div> },
          ]} />
      </Card>

      <RuleEditorModal
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingRule(undefined); }}
        onSave={handleSaveRule}
        initialValues={editingRule}
      />
    </div>
  );
};

export default NetworkRules;
