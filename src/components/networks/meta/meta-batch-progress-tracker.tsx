// meta-batch-progress-tracker.tsx — mock generation progress UI for batch campaign generator
import React, { useEffect, useState } from 'react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { BatchJob, BatchJobStatus } from './meta-batch-types';

interface Props {
  jobs: BatchJob[];
  onClose: () => void;
}

const STATUS_ICON: Record<BatchJobStatus, React.ReactNode> = {
  queued:  <span className="w-3.5 h-3.5 radius_round border border_secondary bg_secondary inline-block shrink-0" />,
  running: <Loader2 size={13} className="fg_info animate-spin shrink-0" />,
  done:    <CheckCircle2 size={13} className="text-[var(--status-success,#22c55e)] shrink-0" />,
  error:   <XCircle size={13} className="fg_error shrink-0" />,
};

export const BatchProgressTracker: React.FC<Props> = ({ jobs: initialJobs, onClose }) => {
  const [jobs, setJobs]     = useState<BatchJob[]>(initialJobs);
  const [paused, setPaused] = useState(false);

  const doneCount  = jobs.filter(j => j.status === 'done' || j.status === 'error').length;
  const errorCount = jobs.filter(j => j.status === 'error').length;
  const allDone    = doneCount === jobs.length && jobs.length > 0;
  const pct        = jobs.length > 0 ? Math.round((doneCount / jobs.length) * 100) : 0;

  // Simulate sequential job advancement — one job at a time
  useEffect(() => {
    if (allDone || paused) return;
    const runningIdx = jobs.findIndex(j => j.status === 'running');
    if (runningIdx !== -1) return; // wait for current running job to finish

    const nextIdx = jobs.findIndex(j => j.status === 'queued');
    if (nextIdx === -1) return;

    setJobs(prev => prev.map((j, i) => i === nextIdx ? { ...j, status: 'running' } : j));

    const delay = 500 + Math.random() * 700;
    const timer = setTimeout(() => {
      const outcome: BatchJobStatus = Math.random() < 0.1 ? 'error' : 'done';
      setJobs(prev => prev.map((j, i) => i === nextIdx ? { ...j, status: outcome } : j));
    }, delay);

    return () => clearTimeout(timer);
  }, [jobs, paused, allDone]);

  useEffect(() => {
    if (!allDone) return;
    if (errorCount === 0) toast.success(`${jobs.length} campaign${jobs.length !== 1 ? 's' : ''} generated!`);
    else toast.warning(`${doneCount - errorCount} done, ${errorCount} error${errorCount !== 1 ? 's' : ''}`);
  }, [allDone]);

  return (
    <div className="flex flex-col h-full">
      {/* Overall progress */}
      <div className="px-6 pt-5 pb-4 border-b border_primary shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="body_s font-semibold text_primary">
            {allDone ? 'Generation Complete' : `Generating… ${doneCount}/${jobs.length}`}
          </span>
          <span className="text-xs text_tertiary">{pct}%</span>
        </div>
        <div className="w-full h-2 bg_secondary radius_round overflow-hidden">
          <div className="h-full bg-[var(--status-info)] transition-all duration-300"
            style={{ width: `${pct}%` }} />
        </div>
        {errorCount > 0 && (
          <div className="mt-1.5 text-[11px] fg_error">
            {errorCount} error{errorCount !== 1 ? 's' : ''} — check rows below
          </div>
        )}
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-secondary)]">
        {jobs.map(job => (
          <div key={job.combination.id}
            className={cn(
              'flex items-center gap-3 px-6 py-2.5',
              job.status === 'error' && 'bg_error_subtle'
            )}>
            {STATUS_ICON[job.status]}
            <span className={cn(
              'flex-1 text-xs truncate',
              job.status === 'error' ? 'fg_error' : 'text_primary'
            )}>
              {job.combination.generatedName}
            </span>
            <span className={cn('text-[11px] shrink-0 capitalize font-medium',
              job.status === 'done'    ? 'text-[var(--status-success,#22c55e)]' :
              job.status === 'error'   ? 'fg_error' :
              job.status === 'running' ? 'fg_info' :
              'text_tertiary'
            )}>
              {job.status}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
        <div className="flex gap-2">
          {!allDone && (
            <Button type="button" variant="border" size="s" onClick={() => setPaused(p => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </Button>
          )}
          {allDone && (
            <Button type="button" variant="primary" size="s"
              onClick={() => { onClose(); toast.info('View results in the Campaigns tab'); }}>
              View in Campaign List
            </Button>
          )}
        </div>
        <Button type="button" variant="border" size="s" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
