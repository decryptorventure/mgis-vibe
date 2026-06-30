// meta-batch-history-panel.tsx — session-only list of completed batch runs
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { CheckCircle2, ChevronRight, Clock, History, XCircle } from 'lucide-react';
import type { BatchRun } from './meta-batch-types';
import { BatchRunDetail } from './meta-batch-history-detail';

interface Props {
  runs: BatchRun[];
  onRegenerate: (jobs: BatchRun['jobs']) => void;
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(iso).toLocaleDateString();
}

export const BatchHistoryPanel: React.FC<Props> = ({ runs, onRegenerate }) => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const selectedRun = runs.find(r => r.id === selectedRunId) ?? null;

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <div className="w-12 h-12 radius_round bg_secondary flex items-center justify-center">
          <History size={22} className="text_tertiary" />
        </div>
        <div className="text-xs font-semibold text_secondary">No batch runs yet</div>
        <div className="text-[11px] text_tertiary max-w-[240px]">
          Completed batch runs will appear here for this session.
        </div>
      </div>
    );
  }

  if (selectedRun) {
    return (
      <BatchRunDetail
        run={selectedRun}
        onBack={() => setSelectedRunId(null)}
        onRegenerate={jobs => { onRegenerate(jobs); setSelectedRunId(null); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border_primary shrink-0">
        <div className="flex items-center gap-2">
          <History size={14} className="fg_info" />
          <span className="text-xs font-semibold text_secondary">Batch History</span>
          <span className="text-[11px] text_tertiary">({runs.length} run{runs.length !== 1 ? 's' : ''} · resets on refresh)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-secondary)]">
        {[...runs].reverse().map(run => {
          const doneCount  = run.jobs.filter(j => j.status === 'done').length;
          const errorCount = run.jobs.filter(j => j.status === 'error').length;
          const allOk      = errorCount === 0;

          return (
            <button key={run.id} type="button"
              onClick={() => setSelectedRunId(run.id)}
              className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg_secondary transition-colors">
              <div className={cn(
                'w-8 h-8 radius_round flex items-center justify-center shrink-0',
                allOk ? 'bg-[var(--status-success,#22c55e)]/10' : 'bg_error_subtle'
              )}>
                {allOk
                  ? <CheckCircle2 size={16} className="text-[var(--status-success,#22c55e)]" />
                  : <XCircle size={16} className="fg_error" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text_primary">
                  {run.totalCampaigns} campaign{run.totalCampaigns !== 1 ? 's' : ''}
                </div>
                <div className="text-[11px] text_tertiary mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1"><Clock size={10} />{formatRelative(run.createdAt)}</span>
                  {errorCount > 0 && (
                    <span className="fg_error">{errorCount} failed</span>
                  )}
                  {doneCount > 0 && errorCount === 0 && (
                    <span className="text-[var(--status-success,#22c55e)]">All succeeded</span>
                  )}
                </div>
              </div>

              <ChevronRight size={14} className="text_tertiary shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
