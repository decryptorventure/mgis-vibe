// meta-batch-progress-tracker.tsx — mock generation progress UI for batch campaign generator
import React, { useEffect, useState } from 'react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import { CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { BATCH_ERROR_MESSAGES } from './meta-batch-types';
import type { BatchJob, BatchJobStatus } from './meta-batch-types';
import { mockRunJob } from './meta-batch-job-runner';

interface Props {
  jobs: BatchJob[];
  onClose: () => void;
  onBatchComplete?: (jobs: BatchJob[]) => void;
  onViewHistory?: () => void;
  /** Pluggable job runner — defaults to the mock simulation. Swap in a real API call later. */
  runJob?: (job: BatchJob) => Promise<{ status: 'done' | 'error'; error?: BatchJob['error'] }>;
}

const STATUS_ICON: Record<BatchJobStatus, React.ReactNode> = {
  queued:  <span className="w-3.5 h-3.5 radius_round border border_secondary bg_secondary inline-block shrink-0" />,
  running: <Loader2 size={13} className="fg_info animate-spin shrink-0" />,
  done:    <CheckCircle2 size={13} className="text-[var(--status-success,#22c55e)] shrink-0" />,
  error:   <XCircle size={13} className="fg_error shrink-0" />,
};

export const BatchProgressTracker: React.FC<Props> = ({ jobs: initialJobs, onClose, onBatchComplete, onViewHistory, runJob = mockRunJob }) => {
  const [jobs, setJobs]     = useState<BatchJob[]>(initialJobs);
  const [paused, setPaused] = useState(false);

  const doneCount  = jobs.filter(j => j.status === 'done' || j.status === 'error').length;
  const errorCount = jobs.filter(j => j.status === 'error').length;
  const allDone    = doneCount === jobs.length && jobs.length > 0;
  const pct        = jobs.length > 0 ? Math.round((doneCount / jobs.length) * 100) : 0;

  // Simulate sequential job advancement — one job at a time.
  // NOTE: no cleanup return here. Returning clearTimeout would cancel the in-flight
  // timer whenever `jobs` changes (which happens immediately when we set status to
  // 'running'), causing generation to freeze permanently.
  useEffect(() => {
    if (allDone || paused) return;
    const runningIdx = jobs.findIndex(j => j.status === 'running');
    if (runningIdx !== -1) return; // already advancing, wait for the runner to resolve

    const nextIdx = jobs.findIndex(j => j.status === 'queued');
    if (nextIdx === -1) return;

    setJobs(prev => prev.map((j, i) => i === nextIdx ? { ...j, status: 'running' } : j));

    runJob(jobs[nextIdx]).then(({ status, error }) => {
      setJobs(prev => prev.map((j, i) => i === nextIdx ? { ...j, status, error } : j));
    });
  }, [jobs, paused, allDone, runJob]);

  useEffect(() => {
    if (!allDone) return;
    if (errorCount === 0) toast.success(`${jobs.length} campaign${jobs.length !== 1 ? 's' : ''} generated!`);
    else toast.warning(`${doneCount - errorCount} done, ${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    onBatchComplete?.(jobs);
  }, [allDone]);

  const retryOne = (key: string) => {
    setJobs(prev => prev.map(j => `${j.combination.id}:${j.sliceIndex}` === key ? { ...j, status: 'queued', error: undefined } : j));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Overall progress */}
      <div className="px-6 pt-5 pb-4 border-b border_primary shrink-0" role="status" aria-live="polite">
        {allDone ? (
          <div className={cn(
            'flex items-center gap-3 px-4 py-3 radius_8 border',
            errorCount === 0
              ? 'bg-[var(--status-success,#22c55e)]/8 border-[var(--status-success,#22c55e)]/25'
              : 'bg_error_subtle border-[var(--status-error,#ef4444)]/25'
          )}>
            {errorCount === 0
              ? <CheckCircle2 size={18} className="text-[var(--status-success,#22c55e)] shrink-0" />
              : <XCircle size={18} className="fg_error shrink-0" />}
            <div>
              <div className={cn('text-xs font-bold',
                errorCount === 0 ? 'text-[var(--status-success,#22c55e)]' : 'fg_error'
              )}>
                {errorCount === 0
                  ? `All ${jobs.length} campaigns created successfully`
                  : `${doneCount - errorCount} succeeded · ${errorCount} failed`}
              </div>
              {errorCount > 0 && (
                <div className="text-[11px] text_tertiary mt-0.5">Review errors below, then retry or continue</div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="body_s font-semibold text_primary">Generating… {doneCount}/{jobs.length}</span>
              <span className="text-xs text_tertiary">{pct}%</span>
            </div>
            <div className="w-full h-2 bg_secondary radius_round overflow-hidden">
              <div className="h-full bg-[var(--status-info)] transition-all duration-300"
                style={{ width: `${pct}%` }} />
            </div>
            {errorCount > 0 && (
              <div className="mt-1.5 text-[11px] fg_error" role="alert">
                {errorCount} error{errorCount !== 1 ? 's' : ''} — check rows below
              </div>
            )}
          </>
        )}
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-secondary)]">
        {jobs.map(job => {
          const key = `${job.combination.id}:${job.sliceIndex}`;
          return (
            <div key={key}
              className={cn(
                'flex items-center gap-3 px-6 py-2.5',
                job.status === 'error' && 'bg_error_subtle'
              )}>
              {STATUS_ICON[job.status]}
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'block text-xs truncate',
                  job.status === 'error' ? 'fg_error' : 'text_primary'
                )}>
                  {job.combination.generatedNames[job.sliceIndex] ?? job.combination.generatedNames[0]}
                </span>
                {job.status === 'error' && job.error && (
                  <span className="block text-[10px] fg_error mt-0.5" role="alert">
                    {BATCH_ERROR_MESSAGES[job.error]}
                  </span>
                )}
              </div>
              {job.status === 'error' ? (
                <button type="button" aria-label="Retry this campaign" onClick={() => retryOne(key)}
                  className="text-[11px] font-medium fg_error hover:underline shrink-0 px-1">
                  Retry
                </button>
              ) : (
                <span className={cn('text-[11px] shrink-0 capitalize font-medium',
                  job.status === 'done'    ? 'text-[var(--status-success,#22c55e)]' :
                  job.status === 'running' ? 'fg_info' :
                  'text_tertiary'
                )}>
                  {job.status}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border_primary shrink-0">
        <div className="flex gap-2">
          {!allDone && (
            <Button type="button" variant="border" size="s" onClick={() => setPaused(p => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </Button>
          )}
          {allDone && errorCount > 0 && (
            <Button type="button" variant="border" size="s" className="gap-1.5 fg_error"
              onClick={() => setJobs(prev => prev.map(j => j.status === 'error' ? { ...j, status: 'queued', error: undefined } : j))}>
              <RefreshCw size={12} />
              Retry {errorCount} Failed
            </Button>
          )}
          {allDone && (
            <Button type="button" variant="primary" size="s"
              onClick={() => { onClose(); onViewHistory?.(); }}>
              View Batch History
            </Button>
          )}
        </div>
        <Button type="button" variant="border" size="s" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
