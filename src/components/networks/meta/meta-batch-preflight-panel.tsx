// meta-batch-preflight-panel.tsx — validation warnings shown before Generate
// (ports the "Preflight" concept from the retired AI Bulk Create flow)
import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@frontend-team/ui-kit';
import type { MetaBatchPreflightIssue } from './meta-batch-types';

interface Props {
  issues: MetaBatchPreflightIssue[];
}

const ICON: Record<MetaBatchPreflightIssue['severity'], React.ReactNode> = {
  error:   <AlertTriangle size={12} className="fg_error shrink-0" />,
  warning: <AlertTriangle size={12} className="fg_amber_accent shrink-0" />,
  info:    <Info size={12} className="fg_info shrink-0" />,
};

const TONE: Record<MetaBatchPreflightIssue['severity'], string> = {
  error: 'bg_error_subtle border-[var(--status-error,#ef4444)]/20 fg_error',
  warning: 'bg_amber_subtle border_amber fg_amber_strong',
  info: 'bg_blue_subtle border_blue fg_blue_strong',
};

export const BatchPreflightPanel: React.FC<Props> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <div className="mx-5 mt-2 flex items-center gap-2 px-3 py-2 bg-[var(--status-success,#22c55e)]/8 border border-[var(--status-success,#22c55e)]/20 radius_8 shrink-0">
        <CheckCircle2 size={12} className="text-[var(--status-success,#22c55e)] shrink-0" />
        <span className="text-[11px] text-[var(--status-success,#22c55e)]">Preflight clean — ready to generate.</span>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-2 space-y-1.5 shrink-0" role="status">
      {issues.map(issue => (
        <div key={issue.id} className={cn('flex items-center gap-2 px-3 py-2 border radius_8 text-[11px]', TONE[issue.severity])}>
          {ICON[issue.severity]}
          <span>{issue.message}</span>
        </div>
      ))}
    </div>
  );
};
