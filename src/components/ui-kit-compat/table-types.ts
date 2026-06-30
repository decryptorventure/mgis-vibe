import type React from 'react';

export type SortOrder = 'ascend' | 'descend' | null;
export type RowKey<T> = keyof T | string | ((record: T) => React.Key);
export type DataIndex<T> = keyof T | string | readonly string[];
type CompatTableValue = ReturnType<typeof JSON.parse>;
type ColumnRender<T extends object> = {
  bivarianceHack(value: CompatTableValue, record: T, index: number): React.ReactNode;
}['bivarianceHack'];

export interface ColumnType<T extends object> {
  title?: React.ReactNode;
  dataIndex?: DataIndex<T>;
  key?: React.Key;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: boolean | 'left' | 'right';
  className?: string;
  children?: ColumnsType<T>;
  render?: ColumnRender<T>;
  sorter?: boolean | ((a: T, b: T) => number);
  sortOrder?: SortOrder;
  ellipsis?: boolean;
  responsive?: string[];
}

export type ColumnsType<T extends object> = ColumnType<T>[];

export interface TablePaginationConfig {
  pageSize?: number;
  showSizeChanger?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  size?: 'small' | 'default';
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableRowSelection<T extends object> {
  selectedRowKeys?: React.Key[];
  onChange?: (keys: React.Key[], rows: T[]) => void;
}

export interface TableExpandableConfig<T extends object> {
  expandedRowRender?: (record: T, index: number) => React.ReactNode;
  rowExpandable?: (record: T) => boolean;
  expandedRowKeys?: React.Key[];
  onExpandedRowsChange?: (keys: React.Key[]) => void;
}

export interface TableProps<T extends object> {
  columns?: ColumnsType<T>;
  dataSource?: T[];
  rowKey?: RowKey<T>;
  pagination?: false | TablePaginationConfig;
  rowSelection?: TableRowSelection<T>;
  expandable?: TableExpandableConfig<T>;
  summary?: (data: readonly T[]) => React.ReactNode;
  bordered?: boolean;
  locale?: { emptyText?: React.ReactNode };
  onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLTableRowElement>;
  loading?: boolean;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  size?: 'small' | 'middle' | 'large';
  scroll?: { x?: number | string; y?: number | string };
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, unknown>,
    sorter: unknown,
  ) => void;
}
