import React from 'react';
import { Alert, Table, Tag, Tooltip } from 'antd';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  RefreshCcw,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react';
import {
  mockMolocoAdjustMetrics,
  mockMolocoAdjustSyncState,
  type MolocoAdjustMetric,
  type MolocoAdjustMetricMaturity,
  type MolocoAdjustSyncStatus,
} from '@/shared/mock-data';

const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const formatDecimal = (value: number, digits = 1) => value.toFixed(digits);

const syncVariant: Record<MolocoAdjustSyncStatus, { color: string; label: string; icon: React.ReactNode }> = {
  SYNCED: { color: 'success', label: 'Synced', icon: <CheckCircle size={12} /> },
  SYNCING: { color: 'processing', label: 'Syncing', icon: <RefreshCcw size={12} /> },
  ERROR: { color: 'error', label: 'Error', icon: <AlertTriangle size={12} /> },
};

const maturityCopy: Record<MolocoAdjustMetricMaturity, { color: string; label: string; help: string }> = {
  DIRECT: {
    color: 'success',
    label: 'Direct',
    help: 'Metric is available directly from the reporting source.',
  },
  MODELED: {
    color: 'warning',
    label: 'Modeled',
    help: 'Moloco spend is auction/impression based, so CPI and payback are modeled against Adjust attribution.',
  },
  REVIEW: {
    color: 'error',
    label: 'Review',
    help: 'UA should review before scaling because one or more Adjust cohorts are stale or errored.',
  },
};

const MetricTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}> = ({ icon, label, value, note }) => (
  <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-4 min-h-[124px]">
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">{label}</div>
      <div className="h-8 w-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
        {icon}
      </div>
    </div>
    <div className="mt-3 text-2xl font-bold text-[var(--text-primary)]">{value}</div>
    <div className="mt-2 text-[11px] leading-relaxed text-[var(--text-tertiary)]">{note}</div>
  </div>
);

const SyncTag: React.FC<{ status: MolocoAdjustSyncStatus }> = ({ status }) => {
  const variant = syncVariant[status];
  return (
    <Tag color={variant.color} className="m-0 inline-flex items-center gap-1 rounded-md border-none text-[10px] font-semibold">
      {variant.icon}
      {variant.label}
    </Tag>
  );
};

const MaturityTag: React.FC<{ maturity: MolocoAdjustMetricMaturity }> = ({ maturity }) => {
  const copy = maturityCopy[maturity];
  return (
    <Tooltip title={copy.help}>
      <Tag color={copy.color} className="m-0 rounded-md border-none text-[10px] font-semibold">
        {copy.label}
      </Tag>
    </Tooltip>
  );
};

export const MolocoAdjustMetricsTab: React.FC = () => {
  const rows = mockMolocoAdjustMetrics;
  const totalSpend = rows.reduce((sum, row) => sum + row.spend, 0);
  const totalInstalls = rows.reduce((sum, row) => sum + row.installs, 0);
  const weightedCpi = totalSpend / totalInstalls;
  const avgConversionRate = rows.reduce((sum, row) => sum + row.conversionRate, 0) / rows.length;
  const avgRoas = rows.reduce((sum, row) => sum + row.roas, 0) / rows.length;
  const avgLtv = rows.reduce((sum, row) => sum + row.ltv, 0) / rows.length;
  const avgPayback = rows.reduce((sum, row) => sum + row.paybackPeriodDays, 0) / rows.length;
  const reviewRows = rows.filter(row => row.syncStatus === 'ERROR' || row.maturity === 'REVIEW');

  const columns = [
    {
      title: 'Campaign',
      dataIndex: 'campaignName',
      key: 'campaignName',
      render: (value: string, row: MolocoAdjustMetric) => (
        <div>
          <div className="text-xs font-semibold text-[var(--text-primary)]">{value}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">{row.appName} / {row.country} / {row.os}</div>
        </div>
      ),
    },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 100, render: (value: number) => formatCurrency(value) },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 100, render: (value: number) => value.toLocaleString() },
    { title: 'CPI', dataIndex: 'cpi', key: 'cpi', width: 84, render: (value: number) => formatCurrency(value) },
    { title: 'CVR', dataIndex: 'conversionRate', key: 'conversionRate', width: 84, render: (value: number) => `${formatDecimal(value)}%` },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 84, render: (value: number) => `${formatDecimal(value)}x` },
    { title: 'LTV', dataIndex: 'ltv', key: 'ltv', width: 84, render: (value: number) => formatCurrency(value) },
    { title: 'Payback', dataIndex: 'paybackPeriodDays', key: 'paybackPeriodDays', width: 96, render: (value: number) => `${formatDecimal(value)}d` },
    {
      title: 'Maturity',
      dataIndex: 'maturity',
      key: 'maturity',
      width: 100,
      render: (value: MolocoAdjustMetricMaturity) => <MaturityTag maturity={value} />,
    },
    {
      title: 'Adjust Sync',
      dataIndex: 'syncStatus',
      key: 'syncStatus',
      width: 220,
      render: (value: MolocoAdjustSyncStatus, row: MolocoAdjustMetric) => (
        <div className="space-y-1">
          <SyncTag status={value} />
          <div className="text-[11px] text-[var(--text-tertiary)]">Last synced {row.lastSyncedAt}</div>
          {row.errorMessage && <div className="text-[11px] text-[var(--status-error)]">{row.errorMessage}</div>}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="m-0 text-base font-semibold text-[var(--text-primary)]">Adjust Performance Review</h3>
          <p className="m-0 mt-1 max-w-4xl text-xs leading-relaxed text-[var(--text-secondary)]">
            Mock-first Moloco slice using the agreed mobile UA metric set. Moloco is treated as a maturing spoke: spend is Moloco-side, installs and revenue cohorts come from Adjust, and CPI/payback are directional until sync health is clean.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Clock size={14} />
            Adjust sync
            <SyncTag status={mockMolocoAdjustSyncState.status} />
          </div>
          <div className="mt-1">Last synced {mockMolocoAdjustSyncState.lastSyncedAt}</div>
          <div>Next sync {mockMolocoAdjustSyncState.nextSyncAt}</div>
        </div>
      </div>

      {mockMolocoAdjustSyncState.errorMessage && (
        <Alert
          type="error"
          showIcon
          message="UA review required before scaling"
          description={mockMolocoAdjustSyncState.errorMessage}
          className="rounded-lg border-[var(--status-error-border)]"
        />
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <MetricTile icon={<DollarSign size={16} />} label="Spend" value={formatCurrency(totalSpend)} note="Moloco-reported cost normalized for Adjust review." />
        <MetricTile icon={<Target size={16} />} label="Installs" value={totalInstalls.toLocaleString()} note="Attributed installs from Adjust tracker cohorts." />
        <MetricTile icon={<Activity size={16} />} label="CPI" value={formatCurrency(weightedCpi)} note="Modeled from spend divided by Adjust installs." />
        <MetricTile icon={<Percent size={16} />} label="Conversion Rate" value={`${formatDecimal(avgConversionRate)}%`} note="Post-install action rate across reviewed cohorts." />
        <MetricTile icon={<TrendingUp size={16} />} label="ROAS" value={`${formatDecimal(avgRoas)}x`} note="Revenue over Moloco spend; stale cohorts are flagged." />
        <MetricTile icon={<DollarSign size={16} />} label="LTV" value={formatCurrency(avgLtv)} note="Modeled cohort LTV used for scale decisions." />
        <MetricTile icon={<Timer size={16} />} label="Payback" value={`${formatDecimal(avgPayback)}d`} note="Days to recover CPI from attributed revenue." />
      </div>

      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">UA performance rows</div>
            <div className="text-xs text-[var(--text-tertiary)]">{reviewRows.length} row(s) need sync or maturity review</div>
          </div>
          <Tag color={reviewRows.length ? 'error' : 'success'} className="m-0 rounded-md border-none font-semibold">
            {reviewRows.length ? `${reviewRows.length} review` : 'Clean'}
          </Tag>
        </div>
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="id"
          pagination={false}
          size="small"
          className="nms-table"
          scroll={{ x: 1160 }}
        />
      </div>
    </div>
  );
};

export default MolocoAdjustMetricsTab;
