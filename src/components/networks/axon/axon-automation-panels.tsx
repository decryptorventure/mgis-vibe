// Axon automation panels — rule drawer, draft drawer, evaluation modal + shared column configs
import React, { useState } from 'react';
import { Checkbox, Drawer, Input, Modal, Select, Segmented, Switch } from '@/components/ui-kit-compat';
import type { ColumnsType } from '@/components/ui-kit-compat';
import { AlertTriangle, BookOpen, CalendarDays, Eye, FlaskConical, Info, Plus, X, Zap } from 'lucide-react';
import { Button, toast } from '@frontend-team/ui-kit';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CountBadge, PoolTag } from './axon-ui-atoms';
import type { AxonAutomationRule, AxonDraftRule, AxonRunHistory, EvaluationItem } from './axon-types';
import { AutomationTemplateLibraryDrawer } from '@/components/automation/automation-template-library-drawer';

const MOCK_VIOLATIONS: EvaluationItem[] = [
  { id: 'v1', name: 'Matchuoc + TiemBanhTim', shortId: 'ba2c519ede60c…4c/179a', condition: 'conversions < 50 [2026-06-10 → 2026-06-16]', campaign: '—', actual: '0' },
  { id: 'v2', name: 'Matchuoc + BlueNgang', shortId: 'f6802a8c59de…d9103', condition: 'conversions < 50 [2026-06-10 → 2026-06-16]', campaign: '—', actual: '0' },
  { id: 'v3', name: 'GirlStuffs + PLA win + tes3', shortId: '1d5d79cd688a…647e69', condition: 'conversions < 50 [2026-06-10 → 2026-06-16]', campaign: '—', actual: '0' },
  { id: 'v4', name: 'hello1234 test edit name', shortId: 'd8cca32430932f…456f38', condition: 'conversions < 50 [2026-06-10 → 2026-06-16]', campaign: '—', actual: '0' },
];

// ─── Evaluation Modal ─────────────────────────────────────────────────────────

interface EvalModalProps { run: AxonRunHistory | null; onClose: () => void }

export const EvaluationModal: React.FC<EvalModalProps> = ({ run, onClose }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(MOCK_VIOLATIONS.map(v => v.id)));

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(MOCK_VIOLATIONS.map(v => v.id)) : new Set());

  const toggle = (id: string) =>
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <Modal open={!!run} onCancel={onClose} footer={null} width={700} title={
      <div className="flex items-center gap-2"><AlertTriangle size={16} className="fg_amber_strong" />Rule Evaluation Results</div>
    }>
      {run && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Rule', run.ruleName], ['Total Active', String(run.totalActive)], ['Evaluated', String(run.evaluated)], ['Run At', '—']].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-3 py-2 radius_8 bg_secondary border border_secondary">
                <span className="text_tertiary">{k}</span>
                <span className="font-semibold text_primary">{v}</span>
              </div>
            ))}
          </div>

          <div className="radius_8 border border_amber bg_amber_subtle px-4 py-3 flex items-center gap-2 text-sm fg_amber_strong">
            <AlertTriangle size={15} />
            <span className="font-semibold">{MOCK_VIOLATIONS.length} creative sets violated rule conditions.</span>
            <span className="text_secondary">Review and take appropriate action.</span>
          </div>

          <div>
            <div className="flex items-center gap-2 px-3 py-2 border-b border_secondary">
              <Checkbox checked={selected.size === MOCK_VIOLATIONS.length} onChange={e => toggleAll(e.target.checked)} />
              <span className="text-xs text_tertiary">Select all violated creatives · {selected.size} selected</span>
            </div>
            <div className="divide-y divide-[var(--ds-border-secondary)] max-h-64 overflow-auto">
              {MOCK_VIOLATIONS.map(item => (
                <div key={item.id} className="flex items-start gap-3 px-3 py-3">
                  <Checkbox checked={selected.has(item.id)} onChange={() => toggle(item.id)} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text_primary truncate">{item.name}</div>
                    <div className="text-[11px] text_tertiary truncate">{item.shortId}</div>
                  </div>
                  <div className="shrink-0 max-w-[200px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 radius_6 bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)] text-[11px]">
                      <AlertTriangle size={10} />{item.condition} (actual: {item.actual})
                    </span>
                  </div>
                  <div className="text-xs text_tertiary w-16 shrink-0">—</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border_secondary">
            <Button type="button" variant="border" size="m" onClick={() => toast.info('Names copied to clipboard')}>
              Copy Bulk Names
            </Button>
            <Button type="button" variant="primary" size="m"
              className="bg_error_contrast border_error_button"
              onClick={() => { onClose(); toast.success(`${selected.size} creative sets paused`); }}
            >
              Pause Selected ({selected.size})
            </Button>
            <Button type="button" variant="border" size="m" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ─── Automation Rule Drawer ───────────────────────────────────────────────────

interface RuleDrawerProps { open: boolean; onClose: () => void }

export const AutomationRuleDrawer: React.FC<RuleDrawerProps> = ({ open, onClose }) => {
  const [conditions, setConditions] = useState([{ id: 0 }]);
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [templateLibOpen, setTemplateLibOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');

  // Task 8 — dry-run preview: mock affected items
  const MOCK_AFFECTED = [
    { id: 'c1', name: 'Axon_US_CPI_v2', countries: 3 },
    { id: 'c2', name: 'Axon_JP_ROAS_Q2', countries: 7 },
    { id: 'c3', name: 'Axon_KR_CPI_Test', countries: 2 },
  ];

  return (
    <>
      <Drawer title="Create Countries Automation Rule" width={680} open={open} onClose={onClose}
        extra={
          <div className="flex items-center gap-2">
            <Button type="button" variant="border" size="s" className="gap-1" onClick={() => setTemplateLibOpen(true)}>
              <BookOpen size={13} />Templates
            </Button>
            <Button type="button" variant="border" size="s" className="gap-1" onClick={() => setDryRunOpen(d => !d)}>
              <FlaskConical size={13} />{dryRunOpen ? 'Hide Preview' : 'Dry Run'}
            </Button>
            <Button type="button" variant="primary" size="s" onClick={() => { onClose(); toast.success('Automation rule created'); }}>Create Rule</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Task 9 — template shortcut */}
          <button type="button" onClick={() => setTemplateLibOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 radius_8 border border-dashed border_blue bg_blue_subtle text-xs fg_blue_strong hover:opacity-90 cursor-pointer">
            <span className="flex items-center gap-1.5"><BookOpen size={13} />Start from a template</span>
            <span className="text_tertiary">Browse {'>'}  </span>
          </button>

          <div>
            <label className="text-xs font-semibold text_secondary block mb-1.5">Rule Name <span className="text-[var(--status-error)]">*</span></label>
            <Input value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="e.g. Low CVR countries" />
          </div>

          <div>
            <label className="text-xs font-semibold text_secondary block mb-1.5">Report Mode</label>
            <Segmented options={[{ label: 'Cohort', value: 'cohort' }, { label: 'Real time', value: 'realtime' }]} defaultValue="cohort" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text_secondary">Conditions</label>
              <div className="text-[11px] text_tertiary grid grid-cols-4 gap-2 w-[420px] pr-2 text-center">
                <span>Metric</span><span>Operator</span><span>Value</span><span>Date Range</span>
              </div>
            </div>
            <div className="space-y-2">
              {conditions.map((cond) => (
                <div key={cond.id} className="radius_8 border border_primary p-3 bg_secondary">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <Select defaultValue="installs" size="small" options={[{ value: 'installs', label: 'Installs' }, { value: 'ctr', label: 'CTR' }, { value: 'roasD28', label: 'Predict ROAS D28' }, { value: 'conversions', label: 'Conversions' }]} />
                    <Select defaultValue="lt" size="small" options={[{ value: 'lt', label: '< (less than)' }, { value: 'gt', label: '> (greater than)' }, { value: 'gte', label: '≥ (at least)' }]} />
                    <Input defaultValue="50" size="small" />
                    <Select defaultValue="last7" size="small" options={[{ value: 'last7', label: 'Last 7 Days' }, { value: 'last30', label: 'Last 30 Days' }, { value: 'today', label: 'Today' }]} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setConditions(p => [...p, { id: p.length }])}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 radius_8 border border-dashed border_secondary text_tertiary text-xs hover:bg_secondary cursor-pointer">
              <Plus size={13} />Add Condition
            </button>
          </div>

          {/* Task 8 — dry-run preview panel */}
          {dryRunOpen && (
            <div className="radius_8 border border_secondary overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg_secondary border-b border_secondary">
                <FlaskConical size={14} className="text_tertiary" />
                <span className="text-xs font-semibold text_secondary">Dry Run Preview — {MOCK_AFFECTED.length} campaigns affected</span>
                <span className="ml-auto text-[11px] text_tertiary flex items-center gap-1"><Info size={11} />Simulated — not applied</span>
              </div>
              <div className="divide-y divide-[var(--ds-border-secondary)]">
                {MOCK_AFFECTED.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text_primary font-semibold">{item.name}</span>
                    <span className="inline-flex px-2 py-0.5 radius_6 bg_amber_subtle fg_amber_strong border border_amber text-xs">
                      {item.countries} countries match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="radius_8 border border_blue bg_blue_subtle p-3 text-xs fg_blue_strong leading-5">
            This rule only decides which countries match. Actual goal and budget values are reviewed in the trigger result modal.
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 radius_8 border border_primary bg_secondary">
            <span className="text-sm font-semibold text_primary">Status</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text_secondary">Active</span>
              <Switch defaultChecked size="small" />
            </div>
          </div>
        </div>
      </Drawer>

      {/* Task 9 — Template library */}
      <AutomationTemplateLibraryDrawer
        open={templateLibOpen}
        onClose={() => setTemplateLibOpen(false)}
        onApply={t => { setRuleName(t.name); setTemplateLibOpen(false); }}
      />
    </>
  );
};

// ─── Draft Rule Drawer ────────────────────────────────────────────────────────

interface DraftDrawerProps { open: boolean; onClose: () => void; packageName?: string }

export const DraftRuleDrawer: React.FC<DraftDrawerProps> = ({ open, onClose, packageName }) => (
  <Drawer title="Create Draft Rule" width={820} open={open} onClose={onClose}
    extra={<Button type="button" variant="primary" size="s" onClick={() => { onClose(); toast.success('Draft rule created'); }}>Create</Button>}
  >
    <div className="space-y-4">
      <button type="button" className="text-xs fg_blue_accent hover:underline cursor-pointer bg-transparent border-0 p-0">
        ↗ Import từ project khác
      </button>
      <div>
        <label className="text-xs font-semibold text_secondary block mb-1.5">Rule Name <span className="text-[var(--status-error)]">*</span></label>
        <Input placeholder="e.g. IGGJ Mix Creative Q2" />
      </div>
      <div>
        <label className="text-xs font-semibold text_secondary block mb-1.5">Project Filters</label>
        <Select mode="tags" className="w-full" placeholder="Add one or more filters, e.g. IGGJ, com.example.app"
          defaultValue={packageName ? [packageName] : []}
        />
        {packageName && <div className="mt-1.5 flex gap-1 flex-wrap"><span className="inline-flex px-2 py-0.5 radius_6 bg_secondary border border_secondary text-xs text_secondary">{packageName}</span></div>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2"><FlaskConical size={15} className="text_tertiary" /><span className="text-sm font-semibold text_primary">Asset Pools</span></div>
        {[1, 2].map(pool => (
          <div key={pool} className="radius_8 border border_secondary p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text_primary">Pool {pool}</span>
                <span className="inline-flex px-1.5 py-0.5 radius_4 bg_secondary border border_secondary text-[10px] text_tertiary">Split</span>
              </div>
              <div className="flex items-center gap-4 text-xs text_secondary">
                <label className="flex items-center gap-1.5 cursor-pointer">Mixed <Switch size="small" /></label>
                <label className="flex items-center gap-1.5 cursor-pointer">Group Concept <Switch size="small" /></label>
              </div>
            </div>
            <div>
              <label className="text-[11px] text_tertiary block mb-1">Label</label>
              <Input size="small" placeholder={pool === 1 ? 'e.g. PLA Win' : 'e.g. Video Win'} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[['Asset Type', pool === 1 ? 'html' : 'video', [['html', 'HTML (PLA)'], ['video', 'Video'], ['image', 'Image']]],
                ['Selection', 'topSpend', [['topSpend', 'Top Spend'], ['topIpm', 'Top IPM']]],
                ['Top N', 'top10', [['top10', 'Top 10'], ['top20', 'Top 20']]],
                ['Date Range', 'last7', [['last7', 'Last 7 Days'], ['last30', 'Last 30 Days']]],
              ].map(([label, def, opts]) => (
                <div key={label as string}>
                  <div className="text-[11px] text_tertiary mb-1">{label as string}</div>
                  <Select size="small" defaultValue={def as string} className="w-full" options={(opts as string[][]).map(([v, l]) => ({ value: v, label: l }))} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="button" className="w-full flex items-center justify-center gap-1.5 py-2 radius_8 border border-dashed border_secondary text_tertiary text-xs hover:bg_secondary cursor-pointer">
          <Plus size={13} />Add Pool
        </button>
      </div>
    </div>
  </Drawer>
);

// ─── Shared column configs ────────────────────────────────────────────────────

export const makeAutomationColumns = (onTrigger: () => void): ColumnsType<AxonAutomationRule> => [
  {
    title: 'Rule', key: 'rule',
    render: (_v, row) => (
      <div>
        <div className="font-semibold text_primary">{row.name}</div>
        {row.updatedAt && <div className="text-[11px] text_tertiary mt-0.5">Updated {row.updatedAt}</div>}
        <div className="text-[11px] text_tertiary">{row.scope}</div>
      </div>
    ),
  },
  {
    title: 'Conditions', dataIndex: 'condition', key: 'condition',
    render: v => <span className="inline-flex px-2 py-1 radius_6 bg_blue_subtle fg_blue_strong border border_blue text-xs">{v}</span>,
  },
  { title: 'Mode', dataIndex: 'mode', key: 'mode', width: 100, render: v => <span className="inline-flex px-2 py-1 radius_6 bg_secondary border border_secondary text-xs capitalize">{v}</span> },
  { title: 'Status', key: 'status', width: 100, render: (_v, row) => <Switch size="small" checked={row.status === 'ON'} checkedChildren="On" unCheckedChildren="Off" /> },
  {
    title: 'Actions', key: 'actions', width: 140,
    render: () => (
      <div className="flex items-center gap-1.5">
        <Button type="button" variant="primary" size="s" className="gap-1" onClick={onTrigger}><Zap size={13} />Trigger</Button>
        <Button type="button" variant="border" size="s" aria-label="Edit" onClick={() => toast.info('Edit rule')}>✎</Button>
        <Button type="button" variant="border" size="s" aria-label="Delete" onClick={() => toast.info('Delete rule')}><X size={13} /></Button>
      </div>
    ),
  },
];

export const makeHistoryColumns = (onView: (row: AxonRunHistory) => void): ColumnsType<AxonRunHistory> => [
  { title: 'Rule', dataIndex: 'ruleName', key: 'ruleName', render: v => <span className="font-semibold text_primary">{v}</span> },
  { title: 'Campaigns', dataIndex: 'campaign', key: 'campaign', render: v => <span className="inline-flex px-2 py-1 radius_6 border border_secondary bg_secondary text-xs">{v}</span> },
  { title: 'Mode', dataIndex: 'mode', key: 'mode', width: 100, render: v => <span className="capitalize text-xs">{v}</span> },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: v => <StatusBadge label={v} variant={v === 'applied' ? 'success' : v === 'triggered' ? 'warning' : 'info'} /> },
  {
    title: 'Totals', key: 'totals', width: 160,
    render: (_v, row) => (
      <div className="flex items-center gap-1.5">
        <CountBadge value={row.totalActive} color="var(--status-warning)" />
        <CountBadge value={row.evaluated} color="var(--status-info)" />
        <CountBadge value={row.matched} color="var(--status-error)" />
      </div>
    ),
  },
  { title: 'Triggered By', dataIndex: 'triggeredBy', key: 'triggeredBy', width: 120 },
  { title: 'Time', dataIndex: 'time', key: 'time', width: 120 },
  {
    title: '', key: 'view', width: 90,
    render: (_v, row) => <Button type="button" variant="border" size="s" className="gap-1" onClick={() => onView(row)}><Eye size={13} />View</Button>,
  },
];

export const draftColumns: ColumnsType<AxonDraftRule> = [
  {
    title: 'Rule', key: 'rule',
    render: (_v, row) => (
      <div>
        <div className="font-semibold text_primary">{row.name}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {row.tags.map(tag => <span key={tag} className="inline-flex px-2 py-0.5 radius_6 bg_violet_subtle fg_violet_strong border border_violet text-[11px]">{tag}</span>)}
        </div>
      </div>
    ),
  },
  {
    title: 'Pools', dataIndex: 'pools', key: 'pools',
    render: (pools: AxonDraftRule['pools']) => (
      <div className="flex flex-wrap">{pools.map(p => <PoolTag key={p.label} label={p.label} color={p.color} badge={p.badge} />)}</div>
    ),
  },
  { title: 'Combos', dataIndex: 'combos', key: 'combos', width: 90, render: v => <span className="inline-flex min-w-7 h-6 px-2 radius_round bg_blue_medium fg_on_accent items-center justify-center text-xs font-semibold">{v}</span> },
  { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: v => <StatusBadge label={v} variant={v === 'LIVE' ? 'success' : 'info'} /> },
  { title: 'Actions', key: 'actions', width: 110, render: () => <Button type="button" variant="primary" size="s" className="gap-1"><Zap size={13} />Trigger</Button> },
];

// Re-export for campaign detail inner tab use
export { CalendarDays };
