import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, Tag, Switch, Alert, Skeleton } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { useParams, useNavigate } from 'react-router-dom';
import { Zap, Bot, Clock, Settings } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { mockNetworkRules, mockAutomationRuns, mockProjects } from '@/shared/mock-data';
import { CONDITION_DEFS, ACTION_DEFS } from '@/shared/rule-conditions';

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

const statusTagColor: Record<string, string> = {
  completed: 'green',
  triggered: 'orange',
  skipped: 'default',
  error: 'red',
};

export const AppAutomationRules: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Find project
  const project = useMemo(() => mockProjects.find((p) => p.id === appId), [appId]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [appId]);

  // Scoped rules: filter by projects containing the project's name
  const [rules, setRules] = useState(() => {
    if (!project) return [];
    return mockNetworkRules.filter((r) => r.projects?.includes(project.name));
  });

  // Re-sync rules when project changes
  useEffect(() => {
    if (project) {
      setRules(mockNetworkRules.filter((r) => r.projects?.includes(project.name)));
    }
  }, [project]);

  // Scoped runs log: filter by rules that belong to this app
  const appLogs = useMemo(() => {
    const ruleNames = rules.map((r) => r.name);
    return mockAutomationRuns.filter((run) => ruleNames.includes(run.ruleName));
  }, [rules]);

  const handleToggleActive = useCallback((id: string) => {
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
  }, []);

  if (!project) {
    return (
      <Alert
        message="Project Not Found"
        description="Không thể tìm thấy thông tin ứng dụng được yêu cầu."
        type="error"
        showIcon
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 5 }} /></Card>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 5 }} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Zap size={20} />}
        iconBg="var(--status-warning)"
        title={`Automation Rules: ${project.name}`}
        subtitle={`Thiết lập các quy tắc tự động tối ưu hóa áp dụng riêng cho chiến dịch của ${project.name}`}
        actions={
          <Button
            type="button"
            variant="primary"
            size="m"
            onClick={() => navigate('/automation-settings')}
            className="font-bold gap-1.5"
          >
            <Settings size={14} />
            Quản lý Rule hệ thống
          </Button>
        }
      />

      {/* Rules list */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-primary-500" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              Quy tắc tự động đang áp dụng ({rules.length})
            </span>
          </div>
        }
        className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)]"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          className="nms-table"
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
              title: 'NETWORK',
              dataIndex: 'network',
              key: 'network',
              width: 130,
              render: (net: string) => {
                const colors: Record<string, string> = {
                  'Google Ads': 'orange',
                  Meta: 'blue',
                  ASA: 'purple',
                  Axon: 'magenta',
                  Moloco: 'pink',
                };
                return (
                  <Tag color={colors[net] ?? 'default'} bordered={false} className="rounded font-bold text-[10px]">
                    {net}
                  </Tag>
                );
              },
            },
            {
              title: 'CONDITION → ACTION',
              key: 'condAction',
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
              title: 'SCHEDULE',
              dataIndex: 'scheduleMinutes',
              key: 'schedule',
              width: 110,
              render: (m: number) => {
                const label = m === 15 ? '15 min' : m === 60 ? 'Hourly' : 'Daily';
                return <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>;
              },
            },
            {
              title: 'TRIGGERS',
              dataIndex: 'triggerCount',
              key: 'triggerCount',
              width: 90,
              render: (n: number) => <span className="text-xs font-bold text-[var(--text-secondary)]">{n}x</span>,
            },
            {
              title: 'STATUS',
              key: 'status',
              width: 140,
              render: (_, r) => (
                <div className="flex items-center gap-2">
                  <Switch checked={r.status === 'active'} onChange={() => handleToggleActive(r.id)} size="small" />
                  <Tag color={r.status === 'active' ? 'green' : 'default'} bordered={false} className="rounded text-[9px] font-bold px-1.5">
                    {r.status.toUpperCase()}
                  </Tag>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Scoped Run Logs */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[var(--text-secondary)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              Lịch sử thực thi tự động ({appLogs.length})
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
              {
                title: 'Time',
                dataIndex: 'time',
                key: 'time',
                width: 150,
                render: (t: string) => <span className="text-xs text-[var(--text-secondary)]">{t}</span>,
              },
              {
                title: 'Rule',
                dataIndex: 'ruleName',
                key: 'ruleName',
                render: (t: string) => <span className="font-bold text-xs text-[var(--text-primary)]">{t}</span>,
              },
              {
                title: 'Network',
                dataIndex: 'network',
                key: 'network',
                width: 110,
                render: (net: string) => (
                  <Tag color={net === 'Meta' ? 'blue' : 'orange'} bordered={false} className="rounded font-bold text-[10px]">
                    {net}
                  </Tag>
                ),
              },
              {
                title: 'Entity Target',
                dataIndex: 'entity',
                key: 'entity',
                width: 180,
                render: (t: string) => (
                  <span className="font-mono text-[11px] bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">
                    {t}
                  </span>
                ),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 110,
                render: (s: string) => (
                  <Tag color={statusTagColor[s] ?? 'default'} bordered={false} className="rounded font-bold text-[10px] capitalize">
                    {s}
                  </Tag>
                ),
              },
            ]}
          />
        ) : (
          <div className="p-8 text-center text-xs text-[var(--text-disabled)] italic">
            Chưa có lượt chạy quy tắc tự động nào được ghi nhận cho app này.
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppAutomationRules;
