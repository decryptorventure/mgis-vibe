// meta-batch-history-panel.tsx — session-only list of completed batch runs
import React, { useState } from 'react';
import { cn } from '@frontend-team/ui-kit';
import { CheckCircle2, ChevronRight, Clock, History, XCircle } from 'lucide-react';
import type { BatchRegenerateRequest, BatchRun } from './meta-batch-types';
import { BatchRunDetail } from './meta-batch-history-detail';

interface Props {
  runs: BatchRun[];
  onRegenerate: (request: BatchRegenerateRequest) => void;
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
          Completed batch runs will appear here and are saved locally.
        </div>
      </div>
    );
  }

  if (selectedRun) {
    return (
      <BatchRunDetail
        run={selectedRun}
        onBack={() => setSelectedRunId(null)}
        onRegenerate={request => { onRegenerate(request); setSelectedRunId(null); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border_primary shrink-0">
        <div className="flex items-center gap-2">
          <History size={14} className="fg_info" />
          <span className="text-xs font-semibold text_secondary">Batch History</span>
          <span className="text-[11px] text_tertiary">({runs.length} run{runs.length !== 1 ? 's' : ''} · saved locally)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-secondary)]">
        {[...runs].reverse().map(run => {
          const doneCount  = run.jobs.filter(j => j.status === 'done').length;
          const errorCount = run.jobs.filter(j => j.status === 'error').length;
          const allOk      = errorCount === 0;

          // Derive unique template + theme names for quick recognition
          const templateNames = [...new Set(run.jobs.map(j => j.combination.template.name))];
          const themeNames    = [...new Set(run.jobs.map(j => j.combination.theme.name))];
          const contextLabel  = [
            templateNames.slice(0, 2).join(', ') + (templateNames.length > 2 ? ` +${templateNames.length - 2}` : ''),
            themeNames.slice(0, 2).join(', ') + (themeNames.length > 2 ? ` +${themeNames.length - 2}` : ''),
          ].filter(Boolean).join(' · ');

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
                <div className="text-xs font-semibold text_primary truncate">
                  {run.totalCampaigns} campaign{run.totalCampaigns !== 1 ? 's' : ''}
                  {errorCount > 0 && (
                    <span className="fg_error font-normal ml-1.5">· {errorCount} failed</span>
                  )}
                </div>
                <div className="text-[10px] text_tertiary mt-0.5 truncate">{contextLabel}</div>
                <div className="text-[10px] text_tertiary mt-0.5 flex items-center gap-1">
                  <Clock size={9} />{formatRelative(run.createdAt)}
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
