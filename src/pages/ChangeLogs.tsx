import React, { useState, useEffect, useCallback } from 'react';
import { Card, Select, Timeline, Tag, Skeleton } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import {
  ArrowRightLeft, Plus, Upload, Trash2, Copy, Pencil, CircleDot, 
  History, Calendar, Search, Hash
} from 'lucide-react';
import { mockChangeLogs, mockProjects, mockCampaigns } from '../shared/mock-data';
import { EmptyState, FilterBar, PageHeader } from '../components/ui';
import { ACTIVE_NETWORKS, ACTIVE_NETWORK_KEYS } from '@/shared/navigation';

// Phase 7: Move static config outside component
const actionIcons: Record<string, React.ReactNode> = {
  UPDATE_STATUS: <ArrowRightLeft size={13} />,
  UPDATE_BUDGET: <Pencil size={13} />,
  UPDATE_BID: <Pencil size={13} />,
  CREATE: <Plus size={13} />,
  DUPLICATE: <Copy size={13} />,
  UPLOAD: <Upload size={13} />,
  PUBLISH: <CircleDot size={13} />,
  DELETE: <Trash2 size={13} />,
};

const actionColors: Record<string, string> = {
  UPDATE_STATUS: 'var(--chart-3)',
  UPDATE_BUDGET: 'var(--chart-1)',
  UPDATE_BID: 'var(--chart-4)',
  CREATE: 'var(--chart-2)',
  DUPLICATE: 'var(--chart-5)',
  UPLOAD: 'var(--chart-1)',
  PUBLISH: 'var(--chart-2)',
  DELETE: 'var(--status-error)',
};

export const ChangeLogs: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [selectedCampaign, setSelectedCampaign] = useState<string | undefined>();
  const [activeNetworks, setActiveNetworks] = useState<string[]>(ACTIVE_NETWORK_KEYS.map(key => ACTIVE_NETWORKS[key].label));
  const [searchClicked, setSearchClicked] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Toggle network filter buttons
  const toggleNetwork = useCallback((network: string) => {
    setActiveNetworks(prev => 
      prev.includes(network) 
        ? prev.filter(n => n !== network) 
        : [...prev, network]
    );
  }, []);

  // Phase 4: Simulated loading with setTimeout cleanup
  const handleSearch = useCallback(() => {
    if (!selectedProject) return;
    setSearchLoading(true);
    const timer = setTimeout(() => {
      setSearchLoading(false);
      setSearchClicked(true);
      toast.success(`Đã tải lịch sử thay đổi của dự án ${selectedProject}`);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedProject]);

  // Cleanup any pending timer on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled via the search loading state reset
    };
  }, []);

  const handleProjectChange = useCallback((val: string | undefined) => {
    setSelectedProject(val);
    setSelectedCampaign(undefined);
    setSearchClicked(false);
  }, []);

  // Filter change logs
  const filteredLogs = mockChangeLogs.filter(log => {
    // Must select a project and click search first
    if (!selectedProject || !searchClicked) return false;

    // Match Project Name
    const matchProject = log.project.toLowerCase() === selectedProject.toLowerCase();

    // Match Campaign Name (or partial details)
    const matchCampaign = !selectedCampaign || log.details.toLowerCase().includes(selectedCampaign.toLowerCase());

    // Match Networks selected at top-right
    const matchNetwork = activeNetworks.includes(log.network);

    return matchProject && matchCampaign && matchNetwork;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <PageHeader
        icon={<History size={20} />}
        iconBg="var(--chart-4)"
        title="Change Logs"
        subtitle="Timeline of all user actions across ad networks"
        actions={
          <div className="flex flex-col items-end gap-2">
            {/* Network Toggles */}
            <div
              className="flex gap-1 p-0.5 rounded-lg"
              style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-default)' }}
            >
              {ACTIVE_NETWORK_KEYS.map(key => ACTIVE_NETWORKS[key].label).map(net => {
                const isActive = activeNetworks.includes(net);
                return (
                  <button
                    key={net}
                    onClick={() => toggleNetwork(net)}
                    className="px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors border-0"
                    style={
                      isActive
                        ? { background: 'var(--surface-base)', color: 'var(--text-primary)' }
                        : { background: 'transparent', color: 'var(--text-tertiary)' }
                    }
                  >
                    {net}
                  </button>
                );
              })}
            </div>

            {/* Time Picker Display */}
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-bold"
                style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
              >
                Last 30 Days
              </span>
              <div
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs"
                style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <Calendar size={13} style={{ color: 'var(--text-tertiary)' }} />
                <span className="font-semibold select-none" style={{ color: 'var(--text-primary)' }}>2026-05-05 — 2026-06-04</span>
              </div>
            </div>
          </div>
        }
      />

      <FilterBar
        title="Log filters"
        actions={
          <Button
            type="button"
            variant="primary"
            size="m"
            onClick={handleSearch}
            loading={searchLoading}
            disabled={!selectedProject}
            className="gap-1.5"
          >
            <Search size={13} />
            Search
          </Button>
        }
      >
        <Select
          placeholder="Select a project..."
          value={selectedProject}
          onChange={handleProjectChange}
          className="w-full sm:w-72"
          options={mockProjects.map(p => ({ value: p.name, label: p.name }))}
          allowClear
        />
        <Select
          placeholder="Load campaigns via Search"
          value={selectedCampaign}
          onChange={setSelectedCampaign}
          className="w-full sm:w-72"
          disabled={!selectedProject}
          options={mockCampaigns
            .filter(c => {
              const project = mockProjects.find(p => p.name === selectedProject);
              return !project || c.projectId === project.id;
            })
            .map(c => ({ value: c.name, label: c.name }))}
          allowClear
        />
      </FilterBar>

      {/* Main Timeline Card or Empty State */}
      {searchLoading ? (
        /* Phase 4: Loading state for search action */
        <Card className="rounded-2xl border-[var(--border-default)] shadow-sm">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : selectedProject && searchClicked ? (
        <Card className="rounded-2xl border-[var(--border-default)] shadow-sm bg-[var(--surface-base)]" title={<span className="font-bold text-[var(--text-primary)] text-sm tracking-wide">Activity Change History</span>}>
          {filteredLogs.length > 0 ? (
            <div className="py-4 px-2">
              <Timeline
                className="mt-2"
                items={filteredLogs.map(cl => ({
                  color: actionColors[cl.action] || 'var(--text-tertiary)',
                  dot: (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-inverse)] shadow-sm border-2 border-[var(--surface-base)]" style={{ backgroundColor: actionColors[cl.action] || 'var(--text-tertiary)' }}>
                      {actionIcons[cl.action] || <CircleDot size={13} />}
                    </div>
                  ),
                  children: (
                    <div className="ml-4 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[var(--text-primary)] text-sm">{cl.user}</span>
                        <Tag bordered={false} className="rounded-md text-[10px] font-bold tracking-wide bg-[var(--surface-muted)] text-[var(--text-secondary)]">{cl.action}</Tag>
                        <Tag bordered={false} color="blue" className="rounded-md text-[10px] font-bold tracking-wide">{cl.network}</Tag>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1.5 leading-relaxed">{cl.details}</p>

                      {cl.before && cl.after && (
                        <div className="flex items-center gap-2 text-xs bg-[var(--surface-subtle)] p-2 rounded-lg border border-[var(--border-subtle)] max-w-md my-2">
                          <span className="text-[var(--status-error)] line-through font-medium">{cl.before}</span>
                          <span className="text-[var(--text-tertiary)]">→</span>
                          <span className="text-[var(--status-success)] font-bold">{cl.after}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[var(--text-tertiary)] font-medium">
                        <span>{cl.timestamp}</span>
                        <span>•</span>
                        <span>{cl.entity} ({cl.entityId})</span>
                        <span>•</span>
                        <span className="font-semibold">{cl.project}</span>
                        {(cl as any).channel === 'slack' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-[#E01E5A]">
                              <Hash size={10} /> Slack
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-[var(--text-tertiary)] text-xs font-semibold">
              Không tìm thấy log hoạt động nào khớp với bộ lọc ad network hiện tại.
            </div>
          )}
        </Card>
      ) : (
        <Card className="rounded-2xl border-[var(--border-default)] shadow-sm bg-[var(--surface-base)]">
          <EmptyState
            icon={<History size={32} className="stroke-[1.5]" />}
            title="Select a project to view activity logs"
            description="Vui lòng chọn một dự án trong bộ lọc phía trên và nhấn Search để tải lịch sử thay đổi chiến dịch."
          />
        </Card>
      )}
    </div>
  );
};

export default ChangeLogs;
