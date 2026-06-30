import React from 'react';
import { Card, Descriptions, Tag, Alert } from '@/components/ui-kit-compat';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { mockProjects } from '@/shared/mock-data';
import { ACTIVE_NETWORKS, isActiveNetworkKey } from '@/shared/navigation';

interface WizardStepReviewProps {
  state: any;
}

export const WizardStepReview: React.FC<WizardStepReviewProps> = ({ state }) => {
  const selectedNetworks = state.selectedNetworks || [];
  const baseName = state.baseName || '';
  const projectId = state.projectId;
  const project = mockProjects.find(p => p.id === projectId);
  const budgetMode = state.budgetMode || 'per-network';
  const sharedBudget = state.sharedBudget || 5000;
  const perNetworkBudget = state.perNetworkBudget || {};
  const budgetSplit = state.budgetSplit || {};
  const selectedMediaIds = state.selectedMediaIds || [];

  // Check for validation errors
  const errors: string[] = [];
  if (!projectId) errors.push('Thiếu Dự án / Ứng dụng.');
  if (!baseName) errors.push('Tên chiến dịch cơ bản không được để trống.');
  if (selectedNetworks.length === 0) errors.push('Vui lòng chọn ít nhất một Ad Network.');
  if (selectedMediaIds.length === 0) errors.push('Vui lòng chọn ít nhất một tệp tin quảng cáo.');

  return (
    <div className="space-y-4">
      {errors.length > 0 ? (
        <Alert
          message={
            <div className="space-y-1">
              <span className="font-bold text-xs text-[var(--status-error)] flex items-center gap-1">
                <AlertTriangle size={14} /> Cần bổ sung thông tin trước khi phát hành:
              </span>
              <ul className="list-disc pl-5 text-[11px] text-[var(--status-error)] font-medium">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          }
          type="error"
          className="rounded-xl border-[var(--status-error-border)]"
        />
      ) : (
        <Alert
          message={
            <span className="font-bold text-xs text-[var(--status-success)] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[var(--status-success)]" /> Tất cả thông tin đã hợp lệ. Sẵn sàng phát hành chiến dịch!
            </span>
          }
          type="success"
          className="rounded-xl border-[var(--status-success-border)]"
        />
      )}

      {/* General summary */}
      <Card
        className="rounded-2xl border border-[var(--border-default)] shadow-sm bg-gradient-to-br from-[var(--surface-base)] to-[var(--surface-subtle)]"
        styles={{ body: { padding: '20px' } }}
      >
        <span className="text-xs font-bold text-[var(--text-secondary)] mb-3 block uppercase tracking-wider">General Info</span>
        <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered className="bg-[var(--surface-base)] rounded-xl overflow-hidden shadow-sm">
          <Descriptions.Item label="Project / App">
            <span className="font-semibold text-[var(--text-primary)]">{project?.name || 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="OS">
            <span className="font-semibold text-[var(--text-primary)]">{project?.os.toUpperCase() || 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Objective">
            <span className="font-semibold text-[var(--text-primary)]">{state.objective?.toUpperCase() || 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Creatives">
            <span className="font-semibold text-[var(--text-primary)]">{selectedMediaIds.length} media files</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Network summaries */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mt-2">Per-network Campaign Summary</span>
        {selectedNetworks.map((n: string) => {
          const networkMeta = isActiveNetworkKey(n) ? ACTIVE_NETWORKS[n] : null;
          const networkLabel = networkMeta?.label ?? n;
          const campaignName = `${baseName}_${networkLabel.replace(/\s/g, '')}`;
          const budget = budgetMode === 'per-network'
            ? (perNetworkBudget[n] !== undefined ? perNetworkBudget[n] : 1000)
            : Math.round((sharedBudget * (budgetSplit[n] || 0)) / 100);

          return (
            <Card
              key={n}
              className="rounded-2xl border border-[var(--border-default)] shadow-sm hover:shadow-md transition-shadow bg-[var(--surface-base)]"
              styles={{ body: { padding: '16px 20px' } }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: networkMeta?.color ?? 'var(--text-tertiary)' }} />
                  <span className="text-sm font-bold text-[var(--text-primary)]">{networkLabel}</span>
                </div>
                <Tag color="blue" className="text-[11px] font-bold border-none rounded-md px-2 py-0.5">
                  ${budget.toLocaleString()}/day
                </Tag>
              </div>

              <div className="space-y-2 text-xs bg-[var(--surface-subtle)] p-3 rounded-xl border border-[var(--border-subtle)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[var(--text-tertiary)] font-bold">Campaign Name:</span>
                  <strong className="text-[var(--text-primary)] font-mono text-[11px] bg-[var(--surface-base)] px-2 py-0.5 rounded border border-[var(--border-default)]">{campaignName}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[var(--text-tertiary)] font-bold">Targeting highlights:</span>
                  <span className="text-[var(--text-secondary)] font-semibold text-right">
                    {n === 'google-ads' && `Target CPI: $${state.targeting?.['google-ads']?.targetCpi || 0.85} • ${state.targeting?.['google-ads']?.countries?.join(', ') || 'US'}`}
                    {n === 'meta' && `Optimization: ${state.targeting?.['meta']?.optimization || 'installs'} • ${state.targeting?.['meta']?.locations?.join(', ') || 'US'}`}
                    {n === 'asa' && `Match: ${state.targeting?.['asa']?.matchType || 'EXACT'} • Bid: $${state.targeting?.['asa']?.defaultBid || 1.5}`}
                    {n === 'axon' && `Base Bid: $${state.targeting?.['axon']?.baseBid || 0.85} • CPA Target: $${state.targeting?.['axon']?.targetCpa || 1.0}`}
                    {n === 'moloco' && `Exchanges: ${state.targeting?.['moloco']?.exchanges?.join(', ') || 'admob, applovin'}`}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default WizardStepReview;
