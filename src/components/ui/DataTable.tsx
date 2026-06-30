import React from 'react';
import { Table } from '@/components/ui-kit-compat';
import type { TableProps } from '@/components/ui-kit-compat';
import { Skeleton, cn } from '@frontend-team/ui-kit';
import { Inbox } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface DataTableProps<T extends object> extends Omit<TableProps<T>, 'locale'> {
  loading?: boolean;
  panel?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

const LoadingSkeleton: React.FC = () => (
  <div className="p-4 flex flex-col gap-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <Skeleton key={index} className="h-8 w-full radius_6" />
    ))}
  </div>
);

export function DataTable<T extends object>({
  loading = false,
  panel = false,
  emptyTitle = 'No data',
  emptyDescription = 'There is no data to display yet.',
  emptyIcon,
  className,
  pagination,
  ...tableProps
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn('radius_8 overflow-hidden bg_primary border border_primary', className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  const mergedPagination =
    pagination === false
      ? false
      : {
          size: 'small' as const,
          showSizeChanger: true,
          showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} / ${total}`,
          ...((typeof pagination === 'object' ? pagination : {}) as object),
        };

  const table = (
    <Table<T>
      className={cn('nms-table', className)}
      pagination={mergedPagination}
      scroll={tableProps.scroll ?? { x: 'max-content' }}
      locale={{
        emptyText: (
          <EmptyState
            icon={emptyIcon ?? <Inbox size={28} />}
            title={emptyTitle}
            description={emptyDescription}
            minHeight={200}
          />
        ),
      }}
      {...tableProps}
    />
  );

  if (!panel) return table;

  return <div className="radius_8 overflow-hidden bg_primary border border_primary">{table}</div>;
}

export default DataTable;
