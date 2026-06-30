import React, { useState, useMemo } from 'react';
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableRowSelectionConfig,
  type DataTableExpandableConfig,
  type DataTablePaginationConfig,
  cn,
} from '@frontend-team/ui-kit';
import type { ColumnType, TableProps } from './table-types';

const getValue = <T extends object>(record: T, dataIndex: ColumnType<T>['dataIndex']) => {
  if (!dataIndex) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex : String(dataIndex).split('.');
  return path.reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') return (value as Record<string, unknown>)[String(key)];
    return undefined;
  }, record);
};

const toRowKey = <T extends object>(record: T, index: number, rowKey: TableProps<T>['rowKey']): string => {
  if (typeof rowKey === 'function') return String(rowKey(record));
  if (rowKey) return String((record as Record<string, unknown>)[String(rowKey)] ?? index);
  return String((record as Record<string, unknown>).id ?? index);
};

// Flatten grouped header columns to a single level for DataTableColumnDef.
const flattenColumns = <T extends object>(columns: ColumnType<T>[] = []): ColumnType<T>[] =>
  columns.flatMap((col) => col.children?.length ? flattenColumns(col.children) : [col]);

const bridgeColumns = <T extends object>(columns: ColumnType<T>[] = []): DataTableColumnDef<T>[] =>
  flattenColumns(columns).map((col, index) => ({
    id: String(col.key ?? col.dataIndex ?? index),
    header: col.title,
    accessorKey: typeof col.dataIndex === 'string' ? col.dataIndex as (keyof T & string) : undefined,
    cell: col.render ? (row: T, meta) => col.render!(getValue(row, col.dataIndex), row, meta.rowIndex) : undefined,
    sortable: !!col.sorter,
    width: typeof col.width === 'number' ? col.width : undefined,
    align: col.align,
  }));

function TableBase<T extends object>({
  columns,
  dataSource = [],
  rowKey,
  pagination,
  rowSelection,
  expandable,
  summary,
  loading,
  className,
  onRow,
}: TableProps<T>) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = pagination === false ? (dataSource.length || 1) : (pagination?.pageSize ?? 10);

  const uiColumns = useMemo(() => bridgeColumns(columns), [columns]);

  const uiRowSelection = useMemo((): DataTableRowSelectionConfig<T> | undefined => {
    if (!rowSelection) return undefined;
    return {
      selectedRowKeys: (rowSelection.selectedRowKeys ?? []).map(String),
      onChange: (keys, rows) => rowSelection.onChange?.(keys, rows),
    };
  }, [rowSelection]);

  const uiExpandable = useMemo((): DataTableExpandableConfig<T> | undefined => {
    if (!expandable) return undefined;
    return {
      expandedRowRender: expandable.expandedRowRender
        ? (row, depth) => expandable.expandedRowRender!(row, depth)
        : undefined,
      rowExpandable: expandable.rowExpandable,
    };
  }, [expandable]);

  const uiPagination = useMemo((): DataTablePaginationConfig | false => {
    if (pagination === false) return false;
    return {
      pageIndex,
      pageSize,
      total: dataSource.length,
      onChange: (page, size) => {
        setPageIndex(page);
        pagination?.onChange?.(page + 1, size);
      },
      showTotal: !!pagination?.showTotal,
      manual: false,
    };
  }, [pagination, pageIndex, pageSize, dataSource.length]);

  return (
    <DataTable
      data={dataSource}
      columns={uiColumns}
      getRowKey={(row, index) => toRowKey(row, index, rowKey)}
      loading={loading}
      className={className}
      rowSelection={uiRowSelection}
      expandable={uiExpandable}
      pagination={uiPagination}
      summary={summary}
      onRow={onRow}
    />
  );
}

const Summary = ({ children }: { children?: React.ReactNode; fixed?: boolean }) => <>{children}</>;
const SummaryRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('border-t border_primary bg_secondary', className)} {...props} />;
const SummaryCell = ({ className, index: _index, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { index?: number }) => <td className={cn('px-4 py-3 font-semibold text_primary body_s', className)} {...props} />;

export const Table = Object.assign(TableBase, {
  Summary: Object.assign(Summary, { Row: SummaryRow, Cell: SummaryCell }),
});
