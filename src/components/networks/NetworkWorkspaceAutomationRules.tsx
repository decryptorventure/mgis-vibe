import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Table, Tag, Switch, Drawer, Form, Input, InputNumber, Select, Alert, Space, Row, Col } from '@/components/ui-kit-compat';
import { toast } from '@frontend-team/ui-kit';
import { Plus, Trash2, Bot, Clock } from 'lucide-react';
import { mockNetworkRules, mockAutomationRuns, type NetworkRule } from '@/shared/mock-data';
import { CONDITION_DEFS, ACTION_DEFS } from '@/shared/rule-conditions';

interface NetworkWorkspaceAutomationRulesProps {
  networkKey: string;
  networkLabel: string;
  projectId: string;
  appName: string;
  activeCampaignsCount: number;
}

function getConditionLabel(key: string, param: number): string {
  const def = CONDITION_DEFS.find((c) => c.key === key);
  if (!def) return key;
  const suffix = def.paramType === 'percent' ? '%' : '';
  return `${def.label} ${param}${suffix}`;
}

function getActionLabel(key: string, param?: number): string {
  const def = ACTION_DEFS.find((a) => a.key === key);
  if (!def) return key;
  if (param !== undefined && def.paramType !== 'none') {
    const suffix = def.paramType === 'percent' ? '%' : '';
    return `${def.label} ${param}${suffix}`;
  }
  return def.label;
}

export const NetworkWorkspaceAutomationRules: React.FC<NetworkWorkspaceAutomationRulesProps> = ({
  networkKey,
  networkLabel,
  projectId,
  appName,
  activeCampaignsCount,
}) => {
  void projectId;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rules, setRules] = useState<NetworkRule[]>([]);
  const [form] = Form.useForm();

  // Load rules specifically matching this app and this network
  useEffect(() => {
    const matched = mockNetworkRules.filter((r) => {
      const isAppMatched = r.projects?.includes(appName);
      const isNetMatched =
        r.network.toLowerCase().replace(/[^a-z]/g, '') === networkKey.toLowerCase().replace(/[^a-z]/g, '') ||
        (networkKey === 'google-ads' && r.network.toLowerCase() === 'google ads') ||
        (networkKey === 'asa' && r.network.toLowerCase() === 'asa');
      return isAppMatched && isNetMatched;
    });
    setRules(matched);
  }, [appName, networkKey]);

  // Load runs history filtered by these rules
  const ruleRuns = useMemo(() => {
    const names = rules.map((r) => r.name);
    return mockAutomationRuns.filter((run) => names.includes(run.ruleName));
  }, [rules]);

  const handleToggleActive = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = r.status === 'active' ? 'paused' : 'active';
          toast.success(`Rule "${r.name}" set to ${next.toUpperCase()}`);
          return { ...r, status: next };
        }
        return r;
      })
    );
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.warning('Rule deleted successfully');
  };

  const handleCreateRule = (values: any) => {
    const newRule: NetworkRule = {
      id: `nr_workspace_${Date.now()}`,
      name: values.name,
      network: networkLabel,
      conditionKey: values.conditionKey || 'roas_lt',
      conditionParam: values.conditionParam || 1.0,
      actionKey: values.actionKey || 'pause_campaign',
      scheduleMinutes: 60,
      status: 'active',
      triggerCount: 0,
      projects: [appName],
    };

    setRules((prev) => [newRule, ...prev]);
    setDrawerOpen(false);
    form.resetFields();
    toast.success(`Saved rule "${values.name}" successfully!`);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Scope Banner */}
      <Alert
        message={
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
              <Bot size={14} className="text-primary-500" />
              Campaign Automation Rules ({networkLabel})
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Rules evaluate active {networkLabel} campaigns for this app against {networkLabel} cohort predict metrics.
              Active campaigns in scope: <strong className="text-primary-500 font-bold">{activeCampaignsCount}</strong>
            </span>
          </div>
        }
        type="info"
        showIcon={false}
        className="rounded-xl border-[var(--status-info-border)] bg-[var(--status-info-bg)]"
      />

      {/* Rules block */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
              Active Rules ({rules.length})
            </span>
            <Button
              type="primary"
              size="small"
              icon={<Plus size={12} />}
              onClick={() => setDrawerOpen(true)}
              style={{ background: 'var(--color-primary-500)', borderColor: 'var(--color-primary-500)' }}
              className="font-bold text-xs h-7 rounded"
            >
              Add Rule
            </Button>
          </div>
        }
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)]"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={rules}
          rowKey="id"
          pagination={false}
          size="middle"
          columns={[
            {
              title: 'RULE NAME',
              dataIndex: 'name',
              key: 'name',
              render: (t: string) => <span className="font-bold text-xs text-[var(--text-primary)]">{t}</span>,
            },
            {
              title: 'CONDITIONS',
              key: 'conditions',
              render: (_, r) => (
                <div className="text-[11px] space-y-0.5">
                  <div className="flex gap-1.5">
                    <span className="text-[var(--text-tertiary)] w-8 shrink-0">IF</span>
                    <span className="text-[var(--status-error)] font-semibold">
                      {getConditionLabel(r.conditionKey, r.conditionParam)}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[var(--text-tertiary)] w-8 shrink-0">THEN</span>
                    <span className="text-[var(--status-success)] font-semibold">
                      {getActionLabel(r.actionKey, r.actionParam)}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              title: 'STATUS',
              dataIndex: 'status',
              key: 'status',
              width: 140,
              render: (s: string, r) => (
                <div className="flex items-center gap-2">
                  <Switch checked={s === 'active'} onChange={() => handleToggleActive(r.id)} size="small" />
                  <Tag color={s === 'active' ? 'green' : 'default'} className="text-[9px] font-bold rounded px-1.5 uppercase border-none m-0">
                    {s}
                  </Tag>
                </div>
              ),
            },
            {
              title: 'ACTIONS',
              key: 'actions',
              width: 90,
              render: (_, r) => (
                <Button
                  danger
                  type="text"
                  size="small"
                  icon={<Trash2 size={13} />}
                  onClick={() => handleDelete(r.id)}
                  className="p-0 text-[var(--status-error)] hover:bg-[var(--status-error-bg)] rounded flex items-center justify-center w-7 h-7"
                />
              ),
            },
          ]}
          locale={{
            emptyText: (
              <div className="p-6 text-center text-xs text-[var(--text-tertiary)] italic">
                No campaign automation rules configured for this workspace yet.
              </div>
            ),
          }}
        />
      </Card>

      {/* Trigger History */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[var(--text-secondary)]" />
            <span className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
              Trigger History ({ruleRuns.length} runs)
            </span>
          </div>
        }
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)]"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={ruleRuns}
          rowKey="id"
          pagination={false}
          size="middle"
          columns={[
            {
              title: 'TIME',
              dataIndex: 'time',
              key: 'time',
              width: 150,
              render: (t: string) => <span className="text-xs text-[var(--text-secondary)]">{t}</span>,
            },
            {
              title: 'RULE NAME',
              dataIndex: 'ruleName',
              key: 'ruleName',
              render: (t: string) => <span className="font-semibold text-xs text-[var(--text-primary)]">{t}</span>,
            },
            {
              title: 'ENTITY TARGET',
              dataIndex: 'entity',
              key: 'entity',
              render: (t: string) => (
                <span className="font-mono text-[11px] bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">
                  {t}
                </span>
              ),
            },
            {
              title: 'STATUS',
              dataIndex: 'status',
              key: 'status',
              width: 120,
              render: (s: string) => (
                <Tag
                  color={s === 'completed' || s === 'triggered' ? 'green' : 'red'}
                  bordered={false}
                  className="rounded font-bold text-[10px] capitalize"
                >
                  {s}
                </Tag>
              ),
            },
          ]}
          locale={{
            emptyText: (
              <div className="p-6 text-center text-xs text-[var(--text-tertiary)] italic">
                No runs yet - trigger a rule to see history log.
              </div>
            ),
          }}
        />
      </Card>

      {/* Create Rule Drawer Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-4">
            <span className="font-bold text-sm text-[var(--text-primary)]">Create Automation Rule</span>
            <Space>
              <Button size="small" onClick={() => setDrawerOpen(false)} className="rounded text-xs">
                Cancel
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => form.submit()}
                style={{ background: 'var(--color-primary-500)', borderColor: 'var(--color-primary-500)' }}
                className="rounded text-xs font-bold"
              >
                Save Rule
              </Button>
            </Space>
          </div>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        closable={false}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRule} className="mt-3">
          <Form.Item
            name="name"
            label={<span className="text-xs font-bold text-[var(--text-secondary)]">Rule Name</span>}
            rules={[{ required: true, message: 'Please input rule name!' }]}
            initialValue="Predict Roas D28 below target"
          >
            <Input placeholder="Enter rule name" className="rounded" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-bold text-[var(--text-secondary)]">Description</span>}
          >
            <Input.TextArea placeholder="Optional notes for operators" rows={3} className="rounded" />
          </Form.Item>

          <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--surface-muted)]/50">
            <div className="text-xs font-bold text-[var(--text-secondary)] mb-3">Conditions</div>

            <Row gutter={8}>
              <Col span={10}>
                <Form.Item
                  name="conditionKey"
                  label={<span className="text-[10px] font-semibold text-[var(--text-tertiary)]">Metric</span>}
                  initialValue="roas_lt"
                >
                  <Select
                    options={[
                      { value: 'roas_lt', label: 'Predict Roas D28' },
                      { value: 'cpa_gt', label: 'CPA' },
                      { value: 'spend_gt', label: 'Spend' },
                    ]}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="operator"
                  label={<span className="text-[10px] font-semibold text-[var(--text-tertiary)]">Operator</span>}
                  initialValue="lt"
                >
                  <Select
                    options={[
                      { value: 'lt', label: '< (less than)' },
                      { value: 'gt', label: '> (greater than)' },
                    ]}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="conditionParam"
                  label={<span className="text-[10px] font-semibold text-[var(--text-tertiary)]">Value (%)</span>}
                  initialValue={1.0}
                >
                  <InputNumber min={0.01} step={0.1} className="w-full" size="small" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="dateRange"
                  label={<span className="text-[10px] font-semibold text-[var(--text-tertiary)]">Date Range</span>}
                  initialValue="last30"
                >
                  <Select
                    options={[
                      { value: 'last30', label: 'Last 30 Days' },
                      { value: 'last7', label: 'Last 7 Days' },
                      { value: 'yesterday', label: 'Yesterday' },
                    ]}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col span={12} className="flex items-end justify-start pb-4">
                <Button type="link" size="small" className="p-0 text-[var(--color-primary-500)] text-[11px] font-bold">
                  Apply all
                </Button>
              </Col>
            </Row>

            <Button type="dashed" block size="small" icon={<Plus size={11} />} className="mt-2 text-xs font-bold">
              Add Condition
            </Button>
          </div>

          <Form.Item name="actionKey" initialValue="pause_campaign" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default NetworkWorkspaceAutomationRules;
