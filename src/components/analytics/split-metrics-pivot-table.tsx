import React, { useState, useMemo } from 'react';
import { Table, Select, Button } from 'antd';
import { Download } from 'lucide-react';
import type { Campaign } from '@/shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// SplitMetricsPivotTable — pivot campaigns by two dimensions, aggregate one metric.
// Row dim × Col dim → aggregated metric value with heat-map coloring.
// ─────────────────────────────────────────────────────────────────────────────

interface SplitMetricsPivotTableProps {
  campaigns: Campaign[];
}

type MetricKey = 'cpa' | 'roas' | 'installs';
type DimKey = 'network' | 'status' | 'costCenter';

const METRIC_OPTIONS = [
  { value: 'cpa',      label: 'CPA' },
  { value: 'roas',     label: 'ROAS' },
  { value: 'installs', label: 'Installs' },
];

const DIM_OPTIONS = [
  { value: 'network',    label: 'Network' },
  { value: 'status',     label: 'Status' },
  { value: 'costCenter', label: 'Cost Center' },
];

/**
 * interpolateColor — green=good, red=bad. Token-driven via CSS color-mix.
 * isInverted=true  → high value = red  (CPA: lower is better)
 * isInverted=false → high value = green (ROAS/Installs: higher is better)
 */
function interpolateColor(value: number, min: number, max: number, isInverted: boolean): string {
  if (max === min) return 'transparent';
  const t = (value - min) / (max - min);
  const goodPct = Math.round((isInverted ? 1 - t : t) * 100);
  return `color-mix(in srgb, var(--status-success-border) ${goodPct}%, var(--status-error-border))`;
}

/** Get the string value of a dimension field on a campaign */
function getDimValue(c: Campaign, dim: DimKey): string {
  if (dim === 'costCenter') return c.costCenter ?? 'Unassigned';
  return String(c[dim]);
}

/** Aggregate metric for a group of campaigns */
function aggregateMetric(group: Campaign[], metric: MetricKey): number {
  if (group.length === 0) return 0;
  if (metric === 'installs') return group.reduce((s, c) => s + c.installs, 0);
  if (metric === 'roas') {
    const totalSpend = group.reduce((s, c) => s + c.spend, 0);
    if (totalSpend === 0) return 0;
    return group.reduce((s, c) => s + c.roas * c.spend, 0) / totalSpend;
  }
  // CPA
  const totalInstalls = group.reduce((s, c) => s + c.installs, 0);
  if (totalInstalls === 0) return 0;
  return group.reduce((s, c) => s + c.spend, 0) / totalInstalls;
}

/** Build pivot: rowDim × colDim → aggregated metric value */
function buildPivot(
  campaigns: Campaign[],
  rowDim: DimKey,
  colDim: DimKey,
  metric: MetricKey,
): { rows: string[]; cols: string[]; data: Record<string, Record<string, number>> } {
  const rowsSet = new Set<string>();
  const colsSet = new Set<string>();

  for (const c of campaigns) {
    rowsSet.add(getDimValue(c, rowDim));
    colsSet.add(getDimValue(c, colDim));
  }

  const rows = [...rowsSet].sort();
  const cols = [...colsSet].sort();
  const data: Record<string, Record<string, number>> = {};

  for (const row of rows) {
    data[row] = {};
    for (const col of cols) {
      const group = campaigns.filter(
        (c) => getDimValue(c, rowDim) === row && getDimValue(c, colDim) === col,
      );
      data[row][col] = aggregateMetric(group, metric);
    }
  }

  return { rows, cols, data };
}

function fmtMetric(value: number, metric: MetricKey): string {
  if (value === 0) return '—';
  if (metric === 'installs') return value.toLocaleString();
  if (metric === 'roas') return `${value.toFixed(2)}x`;
  return `$${value.toFixed(2)}`;
}

function exportCsv(
  rows: string[],
  cols: string[],
  data: Record<string, Record<string, number>>,
  metric: MetricKey,
  rowDim: DimKey,
): void {
  const header = [rowDim, ...cols].join(',');
  const body = rows.map((row) =>
    [row, ...cols.map((col) => fmtMetric(data[row][col] ?? 0, metric))].join(','),
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `split-metrics-${metric}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const SplitMetricsPivotTable: React.FC<SplitMetricsPivotTableProps> = ({ campaigns }) => {
  const [metric, setMetric]   = useState<MetricKey>('cpa');
  const [rowDim, setRowDim]   = useState<DimKey>('network');
  const [colDim, setColDim]   = useState<DimKey>('status');

  const { rows, cols, data } = useMemo(
    () => buildPivot(campaigns, rowDim, colDim, metric),
    [campaigns, rowDim, colDim, metric],
  );

  // Compute global min/max for color scaling
  const allValues = useMemo(() => {
    const vals: number[] = [];
    for (const row of rows) {
      for (const col of cols) {
        const v = data[row]?.[col] ?? 0;
        if (v > 0) vals.push(v);
      }
    }
    return vals;
  }, [rows, cols, data]);

  const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 0;
  const isInverted = metric === 'cpa';

  // Build Ant Design columns
  const tableColumns = [
    {
      title: DIM_OPTIONS.find((d) => d.value === rowDim)?.label ?? rowDim,
      dataIndex: '__row__',
      key: '__row__',
      fixed: 'left' as const,
      width: 140,
      render: (v: string) => (
        <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>
          {v}
        </span>
      ),
    },
    ...cols.map((col) => ({
      title: (
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {col}
        </span>
      ),
      dataIndex: col,
      key: col,
      width: 110,
      align: 'center' as const,
      render: (value: number) => {
        const bg = value > 0 ? interpolateColor(value, minVal, maxVal, isInverted) : 'transparent';
        return (
          <div
            className="rounded px-2 py-1 text-[12px] font-semibold text-center"
            style={{ background: bg, color: 'var(--text-primary)' }}
          >
            {fmtMetric(value, metric)}
          </div>
        );
      },
    })),
  ];

  const tableData = rows.map((row) => ({
    key: row,
    __row__: row,
    ...Object.fromEntries(cols.map((col) => [col, data[row]?.[col] ?? 0])),
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Metric
          </span>
          <Select
            value={metric}
            onChange={(v) => setMetric(v as MetricKey)}
            options={METRIC_OPTIONS}
            size="small"
            style={{ width: 110 }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Rows
          </span>
          <Select
            value={rowDim}
            onChange={(v) => setRowDim(v as DimKey)}
            options={DIM_OPTIONS.filter((d) => d.value !== colDim)}
            size="small"
            style={{ width: 130 }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Cols
          </span>
          <Select
            value={colDim}
            onChange={(v) => setColDim(v as DimKey)}
            options={DIM_OPTIONS.filter((d) => d.value !== rowDim)}
            size="small"
            style={{ width: 130 }}
          />
        </div>
        <Button
          size="small"
          icon={<Download size={13} />}
          onClick={() => exportCsv(rows, cols, data, metric, rowDim)}
          className="ml-auto"
        >
          Export CSV
        </Button>
      </div>

      {/* Pivot Table */}
      <Table
        className="nms-table"
        dataSource={tableData}
        columns={tableColumns}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        bordered
      />
    </div>
  );
};

export default SplitMetricsPivotTable;
