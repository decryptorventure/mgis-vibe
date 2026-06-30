---
phase: 5
title: "Progress and Entry"
status: pending
priority: P1
effort: 2h
dependencies: [phase-04-matrix-preview]
---

# Phase 5: Progress + Entry Point

## Overview

Build `meta-batch-progress-tracker.tsx` (mock generation progress UI), wire it into the drawer, then add the "Batch Generate" button to `meta-workspace-header.tsx`. This phase completes the full end-to-end flow.

## Requirements

- Functional: progress bar + per-job status rows (Queued → Running → Done/Error); mock generation via `useEffect` interval; "View in Campaign List" CTA on completion; "Pause" / "Cancel" (mock, no real effect); header button wires to BatchGeneratorDrawer
- Non-functional: `meta-batch-progress-tracker.tsx` ≤ 200 lines; `meta-workspace-header.tsx` stays ≤ 120 lines

## Architecture

```
meta-batch-progress-tracker.tsx
  props: jobs[], onClose
  uses useEffect to simulate sequential job advancement
  renders: overall progress bar + per-job status list

meta-workspace-header.tsx
  +prop: onOpenBatchGenerator?: () => void
  +prop: batchGeneratorOpen?: boolean
  +button: <MetaToolbarButton icon=<Sparkles> label="Batch Generate" ... />
```

The workspace parent (e.g., `meta-workspace.tsx` or `meta-network-workspace.tsx`) owns `batchGeneratorOpen` state and renders `<BatchGeneratorDrawer>`.

## Related Code Files

- Create: `src/components/networks/meta/meta-batch-progress-tracker.tsx`
- Modify: `src/components/networks/meta/meta-batch-generator-drawer.tsx` — replace progress placeholder with `<BatchProgressTracker>`
- Modify: `src/components/networks/meta/meta-workspace-header.tsx` — add `onOpenBatchGenerator` prop + button
- Identify (read): workspace parent component that renders `MetaWorkspaceHeader` — wire the drawer open state there

## Implementation Steps

### 1. Create `meta-batch-progress-tracker.tsx`

```tsx
// meta-batch-progress-tracker.tsx — mock generation progress UI
import React, { useEffect, useState } from 'react';
import { Button, cn } from '@frontend-team/ui-kit';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { BatchJob, BatchJobStatus } from './meta-batch-types';
import { toast } from '@frontend-team/ui-kit';

interface Props {
  jobs: BatchJob[];
  onClose: () => void;
}

const STATUS_ICON: Record<BatchJobStatus, React.ReactNode> = {
  queued:  <span className="w-4 h-4 radius_round border border_secondary bg_secondary inline-block shrink-0" />,
  running: <Loader2 size={14} className="fg_info animate-spin shrink-0" />,
  done:    <CheckCircle2 size={14} className="text-[var(--status-success,#22c55e)] shrink-0" />,
  error:   <XCircle size={14} className="fg_error shrink-0" />,
};

export const BatchProgressTracker: React.FC<Props> = ({ jobs: initialJobs, onClose }) => {
  const [jobs, setJobs] = useState<BatchJob[]>(initialJobs);
  const [paused, setPaused] = useState(false);

  const doneCount  = jobs.filter(j => j.status === 'done' || j.status === 'error').length;
  const allDone    = doneCount === jobs.length;
  const errorCount = jobs.filter(j => j.status === 'error').length;
  const pct        = jobs.length > 0 ? Math.round((doneCount / jobs.length) * 100) : 0;

  // Simulate sequential job advancement
  useEffect(() => {
    if (allDone || paused) return;
    const next = jobs.findIndex(j => j.status === 'queued');
    if (next === -1) return;

    // Start the next queued job
    setJobs(prev => prev.map((j, i) => i === next ? { ...j, status: 'running' } : j));

    const timer = setTimeout(() => {
      // Simulate ~10% error rate
      const outcome: BatchJobStatus = Math.random() < 0.1 ? 'error' : 'done';
      setJobs(prev => prev.map((j, i) => i === next ? { ...j, status: outcome } : j));
    }, 600 + Math.random() * 600);

    return () => clearTimeout(timer);
  }, [jobs, paused, allDone]);

  useEffect(() => {
    if (allDone) {
      if (errorCount === 0) toast.success(`${jobs.length} campaigns generated!`);
      else toast.warning(`${doneCount - errorCount} done, ${errorCount} errors`);
    }
  }, [allDone]);

  return (
    <div className="flex flex-col h-full">
      {/* Overall progress */}
      <div className="px-6 pt-5 pb-4 border-b border_primary shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="body_s font-semibold text_primary">
            {allDone ? 'Generation Complete' : `Generating... ${doneCount}/${jobs.length}`}
          </span>
          <span className="text-xs text_tertiary">{pct}%</span>
        </div>
        <div className="w-full h-2 bg_secondary radius_round overflow-hidden">
          <div className="h-full bg-[var(--status-info)] transition-all duration-300"
            style={{ width: `${pct}%` }} />
        </div>
        {errorCount > 0 && (
          <div className="mt-1 text-[11px] fg_error">{errorCount} error{errorCount !== 1 ? 's' : ''} — check individual rows</div>
        )}
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto divide-y divide_secondary">
        {jobs.map((job, idx) => (
          <div key={job.combination.id}
            className={cn('flex items-center gap-3 px-6 py-2.5', job.status === 'error' && 'bg_error_subtle')}>
            {STATUS_ICON[job.status]}
            <span className={cn('flex-1 text-xs truncate', job.status === 'error' ? 'fg_error' : 'text_primary')}>
              {job.combination.generatedName}
            </span>
            <span className={cn('text-[11px] shrink-0 capitalize',
              job.status === 'done'    ? 'text-[var(--status-success,#22c55e)]' :
              job.status === 'error'   ? 'fg_error' :
              job.status === 'running' ? 'fg_info' : 'text_tertiary')}>
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
            <Button type="button" variant="primary" size="s" onClick={() => { onClose(); toast.info('Navigate to Campaigns tab to view results'); }}>
              View in Campaign List
            </Button>
          )}
        </div>
        <Button type="button" variant="border" size="s" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
```

**Estimated lines: ~90. Well within limit.**

### 2. Wire progress tracker into drawer shell

In `meta-batch-generator-drawer.tsx`, replace the progress placeholder:

```tsx
// Add import:
import { BatchProgressTracker } from './meta-batch-progress-tracker';

// Replace placeholder:
{phase === 'progress' && (
  <BatchProgressTracker jobs={jobs} onClose={handleClose} />
)}
// Also remove the standalone footer for 'progress' phase — component owns its footer
```

Remove the progress-phase footer from drawer (handled by component).

### 3. Modify `meta-workspace-header.tsx`

Add to `MetaWorkspaceHeaderProps`:
```tsx
onOpenBatchGenerator?: () => void;
batchGeneratorOpen?: boolean;
```

Add button to toolbar (after "AI Bulk Create"):
```tsx
<MetaToolbarButton
  icon={<Sparkles size={14} />}
  label="Batch Generate"
  onClick={onOpenBatchGenerator}
  active={batchGeneratorOpen}
/>
```

> `Sparkles` is already imported in the file.

### 4. Identify and update workspace parent

Find where `MetaWorkspaceHeader` is rendered — likely `meta-network-workspace.tsx` or `meta-workspace.tsx`. Add:
```tsx
const [batchGeneratorOpen, setBatchGeneratorOpen] = useState(false);
// ...
<MetaWorkspaceHeader
  ...existing props...
  onOpenBatchGenerator={() => setBatchGeneratorOpen(true)}
  batchGeneratorOpen={batchGeneratorOpen}
/>
<BatchGeneratorDrawer
  open={batchGeneratorOpen}
  onClose={() => setBatchGeneratorOpen(false)}
  templates={templates}
/>
```

### 5. Final type check

```bash
npx tsc --noEmit
```

## Success Criteria

- [ ] Progress tracker shows all jobs with correct initial `queued` status
- [ ] Jobs advance sequentially: queued → running → done/error (simulated)
- [ ] Overall progress bar updates as jobs complete
- [ ] ~10% of jobs randomly error (red row + `fg_error`)
- [ ] `toast.success` fires when all jobs complete with 0 errors; `toast.warning` when errors exist
- [ ] "Pause" / "Resume" toggle stops/starts the interval
- [ ] "View in Campaign List" appears and closes drawer on click
- [ ] "Batch Generate" button appears in workspace header; `active` variant when drawer is open
- [ ] `npx tsc --noEmit` — 0 errors end-to-end

## Risk Assessment

Low risk. The useEffect simulation is straightforward. One gotcha: the effect depends on `jobs` which changes every tick — ensure the effect only fires when the `running` job finishes (not on every state update). The implementation above handles this by only running when the _next queued_ job exists and there's no current running job (the `findIndex` approach). Verify by tracing through the state transitions manually before ship.
