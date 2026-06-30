// meta-batch-history-detail.tsx — detail view for a single BatchRun with bulk select + regenerate
import React, { useState } from 'react';
import { Button, cn } from '@frontend-team/ui-kit';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import type { BatchJob, BatchRun } from './meta-batch-types';

interface Props {
  run: BatchRun;
  onBack: () => void;
  onRegenerate: (jobs: BatchJob[]) => void;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  done:    <CheckCircle2 size={13} className="text-[var(--status-success,#22c55e)] shrink-0" />,
  error:   <XCircle size={13} className="fg_error shrink-0" />,
  running: <Loader2 size={13} className="fg_info animate-spin shrink-0" />,
  queued:  <span className="w-3.5 h-3.5 radius_round border border_secondary bg_secondary inline-block shrink-0" />,
};

export const BatchRunDetail: React.FC<Props> = ({ run, onBack, onRegenerate }) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const jobKey = (j: BatchJob) => `${j.combination.id}:${j.sliceIndex}`;
  const jobName = (j: BatchJob) => j.combination.generatedNames[j.sliceIndex] ?? j.combination.generatedNames[0];

  const failedJobs   = run.jobs.filter(j => j.status === 'error');
  const selectedJobs = run.jobs.filter(j => selectedKeys.has(jobKey(j)));

  const toggleKey = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedKeys.size === run.jobs.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(run.jobs.map(jobKey)));
    }
  };

  const doneCount  = run.jobs.filter(j => j.status === 'done').length;
  const errorCount = failedJobs.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border_primary shrink-0 flex items-center gap-3">
        <button type="button" onClick={onBack}
          className="w-7 h-7 flex items-center justify-center radius_8 border border_secondary text_tertiary hover:text_primary hover:border_primary transition-colors">
          <ArrowLeft size={13} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text_primary">
            {run.totalCampaigns} campaign{run.totalCampaigns !== 1 ? 's' : ''}
          </div>
          <div className="text-[11px] text_tertiary mt-0.5">
            {new Date(run.createdAt).toLocaleString()} ·{' '}
            <span className="text-[var(--status-success,#22c55e)]">{doneCount} ok</span>
            {errorCount > 0 && <span className="fg_error ml-1">{errorCount} failed</span>}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg_primary border-b border_primary z-10">
            <tr>
              <th className="w-9 px-3 py-2.5 text-left">
                <input type="checkbox"
                  checked={selectedKeys.size === run.jobs.length && run.jobs.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-[var(--status-info)]" />
              </th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Campaign</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Template</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Theme</th>
              <th className="px-3 py-2.5 text-left text_tertiary font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {run.jobs.map(job => {
              const key = jobKey(job);
              const isSelected = selectedKeys.has(key);
              return (
                <tr key={key}
                  className={cn(
                    'border-b border_secondary transition-colors',
                    job.status === 'error' ? 'bg_error_subtle' : isSelected ? 'bg_info' : 'hover:bg_secondary'
                  )}>
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleKey(key)}
                      className="w-3.5 h-3.5 accent-[var(--status-info)]" />
                  </td>
                  <td className="px-3 py-2 max-w-[200px]">
                    <span className="truncate block text_primary font-mono text-[11px]">{jobName(job)}</span>
                  </td>
                  <td className="px-3 py-2 text_secondary max-w-[120px]">
                    <span className="truncate block">{job.combination.template.name}</span>
                  </td>
                  <td className="px-3 py-2 text_secondary max-w-[100px]">
                    <span className="truncate block">{job.combination.theme.name}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICON[job.status] ?? STATUS_ICON.queued}
                      <span className={cn('capitalize text-[11px] font-medium',
                        job.status === 'done'  ? 'text-[var(--status-success,#22c55e)]' :
                        job.status === 'error' ? 'fg_error' : 'text_tertiary'
                      )}>{job.status}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border_primary shrink-0 flex items-center gap-2">
        {selectedKeys.size > 0 && (
          <Button type="button" variant="border" size="s" className="gap-1.5"
            onClick={() => onRegenerate(selectedJobs)}>
            <RefreshCw size={12} />
            Regenerate {selectedKeys.size} selected
          </Button>
        )}
        {failedJobs.length > 0 && selectedKeys.size === 0 && (
          <Button type="button" variant="border" size="s" className="gap-1.5 fg_error"
            onClick={() => onRegenerate(failedJobs)}>
            <RefreshCw size={12} />
            Regenerate {failedJobs.length} failed
          </Button>
        )}
        <span className="text-[11px] text_tertiary ml-auto">
          {selectedKeys.size > 0 ? `${selectedKeys.size} selected` : `${run.jobs.length} campaigns`}
        </span>
      </div>
    </div>
  );
};
