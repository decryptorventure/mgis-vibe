// Report table panel — toolbar + DataTable for campaigns/adsets/ads entity view
import React from 'react';
import { Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BarChart3, Copy, Edit3, Filter, MoreHorizontal, Plus, Search } from 'lucide-react';
import { Button } from '@frontend-team/ui-kit';
import { DataTable } from '@/components/ui/DataTable';
import type { MetaEntity, MetaReportRow, MetaColumnKey } from './meta-types';
import { ENTITY_META, META_REPORT_COLUMNS } from './meta-table-config';
import { formatMetricValue, getMetricValue } from './meta-metric-helpers';
import type { Campaign, AdSet, Ad } from '@/shared/mock-data';
import { MetaInlineAdSetRows } from './meta-inline-adset-rows';

// Rate metrics are averaged across rows; all others are summed
const AVERAGE_METRICS: MetaColumnKey[] = [
  'resultRoas', 'costPerAppInstall', 'cpm', 'costPerResults', 'ctrAll', 'cpcAll',
  'cvrInstall', 'ctrInstall', 'costPerLead', 'cvrLeads', 'frequency',
  'costPerCompletedRegistration', 'costPerPurchase', 'cpcLinkClick',
];

function aggregateMetric(rows: MetaReportRow[], metric: MetaColumnKey): string {
  const values = rows
    .map(row => getMetricValue(row, metric))
    .filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return '-';
  const total = values.reduce((sum, v) => sum + v, 0);
  return formatMetricValue(metric, AVERAGE_METRICS.includes(metric) ? total / values.length : total);
}

function TableSummaryRow({ rows, visibleColumnKeys }: { rows: MetaReportRow[]; visibleColumnKeys: MetaColumnKey[] }) {
  return (
    <Table.Summary fixed>
      <Table.Summary.Row className="bg_secondary">
        {META_REPORT_COLUMNS.filter(col => visibleColumnKeys.includes(col.key)).map((col, index) => (
          <Table.Summary.Cell key={col.key} index={index}>
            {col.key === 'action' ? 'T.' : col.key === 'entity' ? 'Total' : col.metric ? aggregateMetric(rows, col.key) : '-'}
          </Table.Summary.Cell>
        ))}
      </Table.Summary.Row>
    </Table.Summary>
  );
}

interface SummaryItem {
  label: string;
  value: string;
}

interface MetaReportTableProps {
  entity: MetaEntity;
  visibleColumnKeys: MetaColumnKey[];
  campaignColumns: ColumnsType<Campaign>;
  adSetColumns: ColumnsType<AdSet>;
  adColumns: ColumnsType<Ad>;
  visibleCampaigns: Campaign[];
  visibleAdSets: AdSet[];
  visibleAds: Ad[];
  selectedRowKeys: React.Key[];
  onSelectedRowKeysChange: (keys: React.Key[]) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  analysisOpen: boolean;
  onToggleAnalysis: () => void;
  summaryRows: SummaryItem[];
  activeRows: MetaReportRow[];
  onOpenBuilder: (entity?: MetaEntity) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEditFirst: () => void;
  onOpenColumns: () => void;
  normalizedAdSets: AdSet[];
  expandedRowKeys: React.Key[];
  onExpandedRowsChange: (keys: React.Key[]) => void;
}

export const MetaReportTable: React.FC<MetaReportTableProps> = ({
  entity,
  visibleColumnKeys,
  campaignColumns,
  adSetColumns,
  adColumns,
  visibleCampaigns,
  visibleAdSets,
  visibleAds,
  selectedRowKeys,
  onSelectedRowKeysChange,
  searchText,
  onSearchChange,
  analysisOpen,
  onToggleAnalysis,
  summaryRows,
  activeRows,
  onOpenBuilder,
  onDuplicate,
  onDelete,
  onEditFirst,
  onOpenColumns,
  normalizedAdSets,
  expandedRowKeys,
  onExpandedRowsChange,
}) => (
  <div className="bg_primary border border_primary radius_8 overflow-hidden">
    {/* Toolbar */}
    <div className="px-3 py-2 border-b border_secondary flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={() => onOpenBuilder(entity)}>
          <Plus size={14} /> Create
        </Button>
        <Button type="button" variant="border" size="s" className="gap-1.5" onClick={onDuplicate}>
          <Copy size={14} /> Duplicate
        </Button>
        <Button type="button" variant="border" size="s" className="gap-1.5" onClick={onEditFirst}>
          <Edit3 size={14} /> Edit
        </Button>
        <Button type="button" variant={analysisOpen ? 'primary' : 'border'} size="s" className="gap-1.5" onClick={onToggleAnalysis}>
          <BarChart3 size={14} /> Analyze
        </Button>
        <Button type="button" variant="border" size="s" className="gap-1.5" onClick={onDelete}>
          More <MoreHorizontal size={14} />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input
          size="small"
          prefix={<Search size={13} className="text_tertiary" />}
          placeholder={`Search ${ENTITY_META[entity].singular.toLowerCase()}s`}
          value={searchText}
          onChange={event => onSearchChange(event.target.value)}
          allowClear
          className="w-64"
        />
        <Button type="button" variant="border" size="s" className="gap-1.5" onClick={onOpenColumns}>
          <Filter size={14} /> Columns: {visibleColumnKeys.length}
        </Button>
      </div>
    </div>

    {/* Analysis summary strip */}
    {analysisOpen && (
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 px-3 py-3 border-b border_secondary bg_secondary">
        {summaryRows.map(item => (
          <div key={item.label} className="bg_primary border border_primary radius_8 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase text_tertiary">{item.label}</div>
            <div className="text-base font-semibold text_primary mt-1">{item.value}</div>
          </div>
        ))}
      </div>
    )}

    {entity === 'campaigns' && (
      <DataTable<Campaign>
        columns={campaignColumns}
        dataSource={visibleCampaigns}
        rowKey="id"
        rowSelection={{ selectedRowKeys, onChange: onSelectedRowKeysChange }}
        pagination={{ pageSize: 50 }}
        scroll={{ x: 'max-content', y: 430 }}
        summary={() => <TableSummaryRow rows={visibleCampaigns} visibleColumnKeys={visibleColumnKeys} />}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: keys => onExpandedRowsChange(keys as React.Key[]),
          expandedRowRender: record => <MetaInlineAdSetRows campaign={record} adSets={normalizedAdSets} />,
        }}
      />
    )}
    {entity === 'adsets' && (
      <DataTable<AdSet>
        columns={adSetColumns}
        dataSource={visibleAdSets}
        rowKey="id"
        rowSelection={{ selectedRowKeys, onChange: onSelectedRowKeysChange }}
        pagination={{ pageSize: 50 }}
        scroll={{ x: 'max-content', y: 430 }}
        summary={() => <TableSummaryRow rows={visibleAdSets} visibleColumnKeys={visibleColumnKeys} />}
        emptyTitle="No ad sets"
        emptyDescription="Create or select a campaign to manage Meta ad sets."
      />
    )}
    {entity === 'ads' && (
      <DataTable<Ad>
        columns={adColumns}
        dataSource={visibleAds}
        rowKey="id"
        rowSelection={{ selectedRowKeys, onChange: onSelectedRowKeysChange }}
        pagination={{ pageSize: 50 }}
        scroll={{ x: 'max-content', y: 430 }}
        summary={() => <TableSummaryRow rows={visibleAds} visibleColumnKeys={visibleColumnKeys} />}
        emptyTitle="No ads"
        emptyDescription="Create or select an ad set to manage Meta ads."
      />
    )}

    <div className="px-3 py-2 text-xs text_secondary">
      {selectedRowKeys.length} of {activeRows.length} row(s) selected
    </div>
  </div>
);
