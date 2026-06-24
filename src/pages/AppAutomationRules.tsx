import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Alert, Skeleton } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { useParams } from 'react-router-dom';
import { Zap, Bot, Clock, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RuleCard } from '@/components/automation/rule-card';
import { RuleTemplatePicker } from '@/components/automation/rule-template-picker';
import { RuleEditorModal } from '@/components/automation/rule-editor-modal';
import { mockNetworkRules, mockAutomationRuns, mockProjects } from '@/shared/mock-data';
import type { NetworkRule } from '@/shared/mock-data';
import type { RuleTemplate } from '@/shared/rule-conditions';
import { Table, Tag } from 'antd';

const statusTagColor: Record<string, string> = {
  completed: 'green', triggered: 'orange', skipped: 'default', error: 'red',
};

export const AppAutomationRules: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const [loading, setLoading] = useState(true);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<NetworkRule> | undefined>();

  const project = useMemo(() => mockProjects.find(p => p.id === appId), [appId]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [appId]);

  const [rules, setRules] = useState<NetworkRule[]>(() =>
    project ? mockNetworkRules.filter(r => r.projects?.includes(project.name)) : []
  );

  useEffect(() => {
    if (project) setRules(mockNetworkRules.filter(r => r.projects?.includes(project.name)));
  }, [project]);

  const appLogs = useMemo(() => {
    const names = rules.map(r => r.name);
    return mockAutomationRuns.filter(run => names.includes(run.ruleName));
  }, [rules]);

  const handleToggle = useCallback((id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = r.status === 'active' ? 'paused' : 'active';
      toast.success(`Rule "${r.name}" set to ${next.toUpperCase()}`);
      return { ...r, status: next };
    }));
  }, []);

  const handleEdit = useCallback((rule: NetworkRule) => {
    setEditingRule(rule);
    setEditorOpen(true);
  }, []);

  const handleTemplateSelect = (tpl: RuleTemplate) => {
    setTemplatePickerOpen(false);
    setEditingRule({ conditionKey: tpl.conditionKey, conditionParam: tpl.conditionParam, actionKey: tpl.actionKey, actionParam: tpl.actionParam, scheduleMinutes: tpl.scheduleMinutes });
    setEditorOpen(true);
  };

  const handleSave = (rule: Omit<NetworkRule, 'id' | 'triggerCount'>) => {
    const newRule: NetworkRule = { ...rule, id: `nr-${Date.now()}`, triggerCount: 0 };
    setRules(prev => [newRule, ...prev]);
    setEditorOpen(false);
    toast.success('Rule saved');
  };

  if (!project) return <Alert message="Project Not Found" type="error" showIcon />;

  if (loading) return (
    <div className="space-y-6">
      <Skeleton.Input active style={{ width: 300, height: 40 }} />
      <Skeleton active paragraph={{ rows: 5 }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Zap size={20} />}
        iconBg="var(--status-warning)"
        title={`Automation Rules: ${project.name}`}
        subtitle={`Automated optimization rules for ${project.name} campaigns`}
        actions={
          <Button variant="primary" size="m" onClick={() => setTemplatePickerOpen(true)} className="gap-1.5">
            <Plus size={14} /> New Rule
          </Button>
        }
      />

      {/* Rule cards */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-primary-500" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              Active Rules ({rules.length})
            </span>
          </div>
        }
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)]"
      >
        {rules.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-[var(--text-disabled)] italic mb-3">No rules configured yet.</p>
            <Button variant="border" size="m" onClick={() => setTemplatePickerOpen(true)} className="gap-1.5">
              <Plus size={13} /> Add first rule
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rules.map(rule => (
              <RuleCard key={rule.id} rule={rule} onEdit={handleEdit} onToggle={handleToggle} />
            ))}
          </div>
        )}
      </Card>

      {/* Run logs */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[var(--text-secondary)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              Run History ({appLogs.length})
            </span>
          </div>
        }
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)]"
        styles={{ body: { padding: 0 } }}
      >
        {appLogs.length > 0 ? (
          <Table
            className="nms-table"
            dataSource={appLogs}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="middle"
            columns={[
              { title: 'Time', dataIndex: 'time', key: 'time', width: 150, render: (t: string) => <span className="text-xs text-[var(--text-secondary)]">{t}</span> },
              { title: 'Rule', dataIndex: 'ruleName', key: 'ruleName', render: (t: string) => <span className="font-bold text-xs text-[var(--text-primary)]">{t}</span> },
              { title: 'Network', dataIndex: 'network', key: 'network', width: 110, render: (net: string) => <Tag color={net === 'Meta' ? 'blue' : 'orange'} bordered={false} className="rounded font-bold text-[10px]">{net}</Tag> },
              { title: 'Entity', dataIndex: 'entity', key: 'entity', width: 180, render: (t: string) => <span className="font-mono text-[11px] bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">{t}</span> },
              { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: (s: string) => <Tag color={statusTagColor[s] ?? 'default'} bordered={false} className="rounded font-bold text-[10px] capitalize">{s}</Tag> },
            ]}
          />
        ) : (
          <div className="p-8 text-center text-xs text-[var(--text-disabled)] italic">No run history yet.</div>
        )}
      </Card>

      <RuleTemplatePicker
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={handleTemplateSelect}
      />
      <RuleEditorModal
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingRule(undefined); }}
        onSave={handleSave}
        initialValues={editingRule}
      />
    </div>
  );
};

export default AppAutomationRules;
