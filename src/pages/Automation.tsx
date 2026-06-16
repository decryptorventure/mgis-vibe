import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Skeleton, Tabs } from 'antd';
import { Zap, Clock, Play, Pause, Settings, Bot, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, EmptyState } from '../components/ui';
import { CONDITION_DEFS, ACTION_DEFS } from '../shared/rule-conditions';
import { mockAutomationRuns, type AutomationRun } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// Automation page — execution history with network tabs + summary cards
// ─────────────────────────────────────────────────────────────────────────────

const NETWORK_TABS = ['All', 'Google Ads', 'Meta', 'ASA', 'Axon', 'Moloco'];


function getConditionText(key: string, param: number): string {
  const def = CONDITION_DEFS.find(c => c.key === key);
  if (!def) return key;
  const suffix = def.paramType === 'percent' ? '%' : '';
  return `${def.label} ${param}${suffix}`;
}

function getActionText(key: string, param?: number): string {
  const def = ACTION_DEFS.find(a => a.key === key);
  if (!def) return key;
  if (param !== undefined && def.paramType !== 'none') {
    const suffix = def.paramType === 'percent' ? '%' : '';
    return `${def.label} ${param}${suffix}`;
  }
  return def.label;
}

const networkTagColor: Record<string, string> = {
  'Google Ads': 'orange', Meta: 'blue', ASA: 'purple', Axon: 'magenta', Moloco: 'pink',
};

const statusTagColor: Record<string, string> = {
  completed: 'green', triggered: 'orange', skipped: 'default', error: 'red',
};

interface AutomationProps {
  hideHeader?: boolean;
}

export const Automation: React.FC<AutomationProps> = ({ hideHeader }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = activeTab === 'All'
    ? mockAutomationRuns
    : mockAutomationRuns.filter(r => r.network === activeTab);

  // Summary card metrics
  const totalRules = 6;
  const triggeredToday = mockAutomationRuns.filter(r =>
    r.status === 'triggered' && r.time.startsWith('2026-06-04')
  ).length;
  const totalCompleted = mockAutomationRuns.filter(r => r.status === 'completed').length;
  const successRate = Math.round((totalCompleted / mockAutomationRuns.length) * 100);
  const failedToday = mockAutomationRuns.filter(r =>
    r.status === 'error' && r.time.startsWith('2026-06-04')
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        {!hideHeader && <Skeleton.Input active style={{ width: 300, height: 40 }} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Card key={i} className="rounded-xl"><Skeleton active paragraph={{ rows: 1 }} /></Card>)}
        </div>
        <Card className="rounded-xl"><Skeleton active paragraph={{ rows: 6 }} /></Card>
      </div>
    );
  }

  const columns = [
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
      width: 120,
      render: (net: string) => (
        <Tag color={networkTagColor[net] ?? 'default'} bordered={false} className="rounded-full font-bold text-[11px]">{net}</Tag>
      ),
    },
    {
      title: 'Condition Met',
      key: 'condition',
      render: (_: unknown, r: AutomationRun) => (
        <span className="text-[11px] text-[var(--status-error)] font-semibold">
          {getConditionText(r.conditionKey, r.conditionParam)}
        </span>
      ),
    },
    {
      title: 'Action Taken',
      key: 'action',
      render: (_: unknown, r: AutomationRun) => (
        <span className="text-[11px] text-[var(--status-success)] font-semibold">
          {getActionText(r.actionKey, r.actionParam)}
        </span>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
      width: 180,
      render: (t: string) => (
        <span className="font-mono text-[11px] bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">{t}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => (
        <Tag color={statusTagColor[s] ?? 'default'} bordered={false} className="rounded-md capitalize font-bold text-[11px]">{s}</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <PageHeader
          icon={<Zap size={20} />}
          iconBg="var(--status-warning)"
          title="Automation"
          subtitle="Track rule execution history across all networks"
          actions={
            <Button icon={<Settings size={14} />} onClick={() => navigate('/network-rules')} className="font-bold h-9 cursor-pointer">
              Manage Rules
            </Button>
          }
        />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><Zap size={20} className="text-primary-500" /></div>
            <div><div className="text-2xl font-bold">{totalRules}</div><div className="text-xs text-[var(--text-secondary)]">Total Rules</div></div>
          </div>
        </Card>
        <Card className="rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--status-warning-bg)] rounded-lg flex items-center justify-center"><Play size={20} className="text-[var(--status-warning)]" /></div>
            <div><div className="text-2xl font-bold text-[var(--status-warning)]">{triggeredToday}</div><div className="text-xs text-[var(--text-secondary)]">Triggered Today</div></div>
          </div>
        </Card>
        <Card className="rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--status-success-bg)] rounded-lg flex items-center justify-center"><Clock size={20} className="text-[var(--status-success)]" /></div>
            <div><div className="text-2xl font-bold text-[var(--status-success)]">{successRate}%</div><div className="text-xs text-[var(--text-secondary)]">Success Rate</div></div>
          </div>
        </Card>
        <Card className="rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--status-error-bg)] rounded-lg flex items-center justify-center"><AlertCircle size={20} className="text-[var(--status-error)]" /></div>
            <div><div className="text-2xl font-bold text-[var(--status-error)]">{failedToday}</div><div className="text-xs text-[var(--text-secondary)]">Failed Today</div></div>
          </div>
        </Card>
      </div>

      {/* Execution log with network tabs */}
      <Card className="rounded-xl" styles={{ body: { padding: '0 0 0 0' } }}>
        <div className="px-4 pt-4">
          <div className="font-bold text-sm text-[var(--text-primary)] mb-3">Execution Log</div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            items={NETWORK_TABS.map(net => ({ key: net, label: net }))}
            className="mb-0"
          />
        </div>
        {filtered.length > 0 ? (
          <Table
            className="nms-table"
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            scroll={{ x: 900 }}
            rowClassName="hover:bg-[var(--surface-subtle)] transition-colors"
          />
        ) : (
          <div className="p-8">
            <EmptyState
              icon={<Bot size={32} className="stroke-[1.5]" />}
              title="No runs for this network"
              description="No automation rules have been executed for this network yet."
              actionLabel="Manage Rules"
              onAction={() => navigate('/network-rules')}
            />
          </div>
        )}
      </Card>

      {/* Paused rules notice */}
      <Card className="rounded-xl border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]" styles={{ body: { padding: '12px 16px' } }}>
        <div className="flex items-center gap-2 text-[var(--status-warning)] text-xs font-semibold">
          <Pause size={14} />
          <span>1 rule is currently paused. <button onClick={() => navigate('/network-rules')} className="underline cursor-pointer font-bold bg-transparent border-0 text-[var(--status-warning)]">View in Network Rules →</button></span>
        </div>
      </Card>
    </div>
  );
};

export default Automation;
