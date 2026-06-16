import React from 'react';
import { Select, DatePicker, Alert } from 'antd';
import { Filter, Users, X } from 'lucide-react';
import { FilterBar } from '@/components/ui';

interface DashboardFiltersProps {
  selectedUserFilter: string | null;
  clearUserFilter: () => void;
  platform: string;
  setPlatform: (val: string) => void;
  action: string;
  setAction: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  user: string;
  setUser: (val: string) => void;
  handleApply: () => void;
  handleReset: () => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  selectedUserFilter,
  clearUserFilter,
  platform,
  setPlatform,
  action,
  setAction,
  status,
  setStatus,
  user,
  setUser,
  handleApply,
  handleReset,
}) => {
  return (
    <>
      {selectedUserFilter && (
        <Alert
          message={
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                <Users size={14} />
                Đang xem báo cáo chi tiết của lập trình viên: <strong className="text-[var(--status-info)] font-bold">{selectedUserFilter}</strong>
              </span>
              <button
                onClick={clearUserFilter}
                className="text-[var(--status-info)] hover:text-[var(--text-primary)] flex items-center gap-0.5 bg-[var(--status-info-bg)] hover:bg-[var(--status-info-border)] px-2 py-0.5 rounded transition-colors cursor-pointer border-0"
              >
                <X size={12} /> Clear Filter
              </button>
            </div>
          }
          type="info"
          showIcon
          className="rounded-xl border-[var(--status-info-border)]"
        />
      )}

      <FilterBar
        title="Activity filters"
        onApply={() => handleApply()}
        onReset={handleReset}
        applyLabel="Apply"
        resetLabel="Reset"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1 min-w-[280px]">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Filter size={13} className="text-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">Platform</span>
            </div>
            <Select value={platform} onChange={setPlatform} className="w-full" size="middle" options={[
              { value: 'all', label: 'All' },
              { value: 'meta', label: 'Meta' },
              { value: 'google', label: 'Google Ads' },
              { value: 'asa', label: 'Apple Search Ads' },
              { value: 'axon', label: 'Axon / AppLovin' },
              { value: 'moloco', label: 'Moloco' },
            ]} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mb-1.5">Action</div>
            <Select value={action} onChange={setAction} className="w-full" size="middle" options={[
              { value: 'all', label: 'All' },
              { value: 'create', label: 'Create' },
              { value: 'update', label: 'Update' },
              { value: 'pause', label: 'Pause' },
              { value: 'delete', label: 'Delete' },
            ]} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mb-1.5">Status</div>
            <Select value={status} onChange={setStatus} className="w-full" size="middle" options={[
              { value: 'all', label: 'All' },
              { value: 'success', label: 'Success' },
              { value: 'error', label: 'Error' },
            ]} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mb-1.5">User</div>
            <Select value={user} onChange={(val) => { setUser(val); }} className="w-full" size="middle" options={[
              { value: 'all', label: 'All' },
              { value: 'duynv', label: 'duynv' },
              { value: 'Nguyễn Xuân Thành', label: 'Nguyễn Xuân Thành' },
              { value: 'tuannvt', label: 'tuannvt' },
              { value: 'vietna', label: 'vietna' },
              { value: 'thaida', label: 'thaida' },
              { value: 'huyendv', label: 'huyendv' },
              { value: 'Tô Vũ Ý Nhi', label: 'Tô Vũ Ý Nhi' },
            ]} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mb-1.5">Date Range</div>
            <div className="flex gap-2 items-center">
              <DatePicker placeholder="From date" className="w-full" size="middle" />
              <span className="text-[var(--text-disabled)] text-xs font-semibold">to</span>
              <DatePicker placeholder="To date" className="w-full" size="middle" />
            </div>
          </div>
        </div>
      </FilterBar>
    </>
  );
};
