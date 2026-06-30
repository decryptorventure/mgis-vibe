import React from 'react';
import { FileText, RefreshCcw, Settings, Sparkles, WandSparkles, Zap } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import { DatePicker, Select } from '@/components/ui-kit-compat';
import { StatusBadge, SurfaceSection } from '@/components/ui';
import { META_ACCOUNT_OPTIONS } from './meta-table-config';

interface BreadcrumbItem {
  key: string;
  label: string;
  emphasis?: boolean;
  onClick?: () => void;
}

interface MetaWorkspaceHeaderProps {
  appName?: string;
  appPackage?: string;
  accountId: string;
  onAccountChange: (value: string) => void;
  bulkCreateOpen: boolean;
  onOpenPages: () => void;
  onOpenTemplates: () => void;
  onOpenBulkCreate: () => void;
  breadcrumbItems: BreadcrumbItem[];
  onOpenBatchGenerator?: () => void;
  batchGeneratorOpen?: boolean;
}

const MetaToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <Button type="button" variant={active ? 'primary' : 'border'} size="s" onClick={onClick} className="gap-1.5 whitespace-nowrap">
    {icon}
    {label}
  </Button>
);

export const MetaWorkspaceHeader: React.FC<MetaWorkspaceHeaderProps> = ({
  appName,
  appPackage,
  accountId,
  onAccountChange,
  bulkCreateOpen,
  onOpenPages,
  onOpenTemplates,
  onOpenBulkCreate,
  breadcrumbItems,
  onOpenBatchGenerator,
  batchGeneratorOpen,
}) => (
  <SurfaceSection padding="sm" className="overflow-hidden p-0">
    <div className="border-b border_secondary px-4 py-3">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center radius_8 bg_secondary">
            <img src="/logo/meta.png" alt="Meta" className="h-7 w-7 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="body_l font-semibold text_primary">{appName ?? 'Meta Workspace'}</div>
              <Select className="min-w-64" size="small" value={accountId} onChange={onAccountChange} options={META_ACCOUNT_OPTIONS} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge label="Meta" variant="info" />
              <span className="body_xs text_secondary">{appPackage ?? 'App package'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <MetaToolbarButton icon={<RefreshCcw size={14} />} label="Sync pages" onClick={() => toast.success('Meta pages synced')} />
          <MetaToolbarButton icon={<Settings size={14} />} label="Manage Pages" onClick={onOpenPages} />
          <MetaToolbarButton icon={<FileText size={14} />} label="Templates" onClick={onOpenTemplates} />
          <MetaToolbarButton icon={<WandSparkles size={14} />} label="AI Bulk Create" onClick={onOpenBulkCreate} active={bulkCreateOpen} />
          <MetaToolbarButton icon={<Sparkles size={14} />} label="Batch Generate" onClick={onOpenBatchGenerator} active={batchGeneratorOpen} />
          <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => toast.info('API warm-up is mocked')}>
            <Zap size={14} />
            API Warm-up
          </Button>
        </div>
      </div>
    </div>

    <div className="flex flex-col justify-between gap-3 px-4 py-3 lg:flex-row lg:items-center">
      <div className="flex flex-wrap items-center gap-1.5">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && <span className="body_xs text_tertiary">/</span>}
            <button
              type="button"
              className={cn('border-0 bg-transparent p-0 body_s', item.emphasis ? 'font-semibold text_primary' : 'text_secondary')}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="dim" size="s">Today</Button>
        <DatePicker.RangePicker size="small" className="min-w-72" />
      </div>
    </div>
  </SurfaceSection>
);

export default MetaWorkspaceHeader;
