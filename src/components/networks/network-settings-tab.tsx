// ─── NetworkSettingsTab — shared API settings tab for all network workspaces ──
import React, { useState } from 'react';
import { Card, Select, Button, Tag } from '@/components/ui-kit-compat';
import { toast } from '@frontend-team/ui-kit';
import { Key, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import type { NetworkConfig } from '@/shared/network-config';

interface NetworkSettingsTabProps {
  config: NetworkConfig;
}

/** Mock API key data per network — last 4 chars visible */
const MOCK_API_KEYS: Record<string, { masked: string; last4: string; status: 'active' | 'expiring' }> = {
  'google-ads':  { masked: '••••••••••••••••', last4: '4F2A', status: 'active' },
  'meta':        { masked: '••••••••••••••••', last4: 'B91C', status: 'active' },
  'asa':         { masked: '••••••••••••••••', last4: '7E3D', status: 'expiring' },
  'axon':        { masked: '••••••••••••••••', last4: 'A55F', status: 'active' },
  'moloco':      { masked: '••••••••••••••••', last4: '2C8E', status: 'active' },
};

const MOCK_LAST_SYNC: Record<string, string> = {
  'google-ads': '2026-06-10 08:42:17',
  'meta':       '2026-06-10 08:40:03',
  'asa':        '2026-06-10 07:55:41',
  'axon':       '2026-06-10 08:38:59',
  'moloco':     '2026-06-10 08:41:22',
};

const SYNC_FREQ_OPTIONS = [
  { value: '15', label: 'Every 15 minutes' },
  { value: '30', label: 'Every 30 minutes' },
  { value: '60', label: 'Every hour' },
  { value: '360', label: 'Every 6 hours' },
  { value: '1440', label: 'Daily' },
];

export const NetworkSettingsTab: React.FC<NetworkSettingsTabProps> = ({ config }) => {
  const [syncFreq, setSyncFreq] = useState('30');
  const [testing, setTesting] = useState(false);
  const apiKey = MOCK_API_KEYS[config.key] ?? { masked: '••••••••••••••••', last4: '????', status: 'active' as const };
  const lastSync = MOCK_LAST_SYNC[config.key] ?? 'Never';

  const handleTestConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1200));
    setTesting(false);
    toast.success(`Connection to ${config.label} API verified successfully`);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      {/* API Key Status */}
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '20px' } }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.color }}>
            <Key size={16} className="text-[var(--text-inverse)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--text-primary)]">API Key</span>
              <Tag
                color={apiKey.status === 'active' ? 'success' : 'warning'}
                className="rounded-full text-[10px] font-semibold border-none"
              >
                {apiKey.status === 'active' ? 'Active' : 'Expiring Soon'}
              </Tag>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm text-[var(--text-secondary)]">
              <span>{apiKey.masked}</span>
              <span className="text-[var(--text-primary)] font-bold">{apiKey.last4}</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">
              Only the last 4 characters are shown for security
            </div>
          </div>
        </div>
      </Card>

      {/* Last Sync */}
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '20px' } }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--surface-muted)]">
            <Clock size={16} className="text-[var(--text-secondary)]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">Last Sync</div>
            <div className="text-sm text-[var(--text-secondary)] font-mono">{lastSync}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">
              Data synchronized from {config.label} API
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--status-success)]">
            <CheckCircle size={12} />
            <span>Synced</span>
          </div>
        </div>
      </Card>

      {/* Sync Frequency */}
      <Card className="rounded-xl border border-[var(--border-default)] shadow-none" styles={{ body: { padding: '20px' } }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--surface-muted)]">
            <RefreshCw size={16} className="text-[var(--text-secondary)]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Sync Frequency</div>
            <Select
              value={syncFreq}
              onChange={(v) => setSyncFreq(v as string)}
              options={SYNC_FREQ_OPTIONS}
              className="w-56"
            />
            <div className="text-xs text-[var(--text-tertiary)] mt-2">
              How often campaign data is pulled from {config.label}
            </div>
          </div>
        </div>
      </Card>

      {/* Test Connection */}
      <div className="flex justify-end pt-2">
        <Button
          type="primary"
          loading={testing}
          icon={<CheckCircle size={14} />}
          onClick={handleTestConnection}
          style={{ background: config.color, borderColor: config.color }}
        >
          Test Connection
        </Button>
      </div>
    </div>
  );
};

export default NetworkSettingsTab;
