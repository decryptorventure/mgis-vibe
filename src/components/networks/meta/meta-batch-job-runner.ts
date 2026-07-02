// meta-batch-job-runner.ts — pluggable job execution for the batch progress tracker.
// Default is a mock simulation; swap in a real Meta API call later via the `runJob` prop.
import { BATCH_ERROR_CODES } from './meta-batch-types';
import type { BatchJob } from './meta-batch-types';

export const mockRunJob = (): Promise<{ status: 'done' | 'error'; error?: BatchJob['error'] }> =>
  new Promise(resolve => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        const error = BATCH_ERROR_CODES[Math.floor(Math.random() * BATCH_ERROR_CODES.length)];
        resolve({ status: 'error', error });
      } else {
        resolve({ status: 'done' });
      }
    }, 400 + Math.random() * 500);
  });
