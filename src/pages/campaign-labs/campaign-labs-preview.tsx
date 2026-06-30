// App cards grid — preview/result panel for CampaignLabs
import React from 'react';
import { Card, Row, Col } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { Apple, AlertCircle, Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import type { Project } from '@/shared/mock-data';
import { networkConfig } from '../../shared/mock-data';

// Inline Android SVG — avoids importing a separate icon lib entry
const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="text-[var(--status-success)]">
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-8.5-4.8C10.02 3.2 8.35 4.87 8 7h8c-.35-2.13-2.02-3.8-4-3.8zM9 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

const NetworkIconRenderer: React.FC<{ network: string }> = ({ network }) => {
  switch (network) {
    case 'google-ads':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M23.5 12c0-.8-.1-1.5-.2-2.3H12v4.3h6.5c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.6-5 3.6-8.2z"/>
          <path fill="#34A853" d="M12 23.7c3.2 0 6-1.1 8-2.9l-3.7-2.8c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.2H1.1v3C3.1 21.1 7.2 23.7 12 23.7z"/>
          <path fill="#FBBC05" d="M4.9 16.8c-.3-.8-.4-1.6-.4-2.5s.1-1.7.4-2.5v-3H1.1C.4 10.4 0 11.2 0 12s.4 1.6 1.1 3.2l3.8-3z"/>
          <path fill="#EA4335" d="M12 4.6c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.1 15.2 0 12 0 7.2 0 3.1 2.6 1.1 6.6l3.8 3c1-3 3.8-5 7.1-5z"/>
        </svg>
      );
    case 'meta':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#0668E1">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-1 3h-2v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>
      );
    case 'asa':
      return <Apple size={18} className="text-[var(--text-primary)]" />;
    case 'axon':
      return <div className="w-[18px] h-[18px] rounded-[4px] bg-[#000000] text-[var(--text-inverse)] flex justify-center items-center font-bold text-[10px]">AL</div>;
    case 'moloco':
      return <div className="w-[18px] h-[18px] rounded-[4px] bg-[#FA2B56] text-[var(--text-inverse)] flex justify-center items-center font-bold text-[10px]">M</div>;
    default:
      return <div className="w-[18px] h-[18px] rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-[10px] font-bold">{network.charAt(0).toUpperCase()}</div>;
  }
};

const STATUS_CFG: Record<string, { color: string; dot: string }> = {
  Running: { color: 'text-[var(--status-success)] bg-[var(--status-success-bg)] border-[var(--status-success-border)]', dot: 'bg-[var(--status-success)]' },
  Error: { color: 'text-[var(--status-error)] bg-[var(--status-error-bg)] border-[var(--status-error-border)]', dot: 'bg-[var(--status-error)]' },
  Stop: { color: 'text-[var(--text-secondary)] bg-[var(--surface-muted)] border-[var(--border-default)]', dot: 'bg-[var(--text-tertiary)]' },
  'Update Required': { color: 'text-[var(--status-warning)] bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]', dot: 'bg-[var(--status-warning)]' },
};

interface Props {
  apps: Project[];
  syncingAppId: string | null;
  copiedAppId: string | null;
  onCopy: (pkg: string, id: string) => void;
  onAppSync: (id: string, name: string) => void;
  onNavigate: (path: string) => void;
  onReset: () => void;
}

export const CampaignLabsPreview: React.FC<Props> = ({
  apps, syncingAppId, copiedAppId,
  onCopy, onAppSync, onNavigate, onReset,
}) => {
  if (apps.length === 0) {
    return (
      <Card className="rounded-xl p-12 text-center bg-[var(--surface-base)]">
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-[var(--surface-muted)] rounded-2xl flex items-center justify-center border border-[var(--border-subtle)]">
              <svg viewBox="0 0 24 24" width="32" height="32" className="text-[var(--text-tertiary)]">
                <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14-4H5m14 8H5M12 3v18" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[var(--surface-base)] p-1 rounded-full border border-[var(--border-subtle)] text-[var(--text-tertiary)]">
              <AlertCircle size={14} />
            </div>
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] m-0">No apps available</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto leading-relaxed">
            Không có ứng dụng nào phù hợp với bộ lọc hiện tại của bạn. Vui lòng đặt lại bộ lọc để xem toàn bộ danh sách.
          </p>
          <Button type="button" variant="primary" size="s" onClick={onReset} className="font-bold text-xs mt-5">
            Reset Filters
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {apps.map(app => {
        const statusCfg = STATUS_CFG[app.status];
        return (
          <Col xs={24} md={12} xl={8} key={app.id}>
            <Card className="rounded-xl bg-[var(--surface-base)]" styles={{ body: { padding: '16px' } }}>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--surface-muted)] to-[var(--surface-subtle)] text-[var(--text-secondary)] flex items-center justify-center font-bold text-lg flex-shrink-0 relative">
                    {app.icon}
                    <div className="absolute -bottom-1 -right-1 bg-[var(--surface-base)] p-1 rounded-full border border-[var(--border-subtle)]">
                      {app.os === 'ios'
                        ? <Apple size={11} className="text-[var(--text-secondary)] fill-[var(--text-secondary)]" />
                        : <AndroidIcon />}
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-[14px] font-semibold text-[var(--text-primary)] m-0 truncate leading-snug">{app.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-[10px] text-[var(--text-tertiary)] select-all truncate">{app.package}</span>
                      <button onClick={() => onCopy(app.package, app.id)} aria-label="Copy package ID" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-transparent border-0 cursor-pointer p-0">
                        {copiedAppId === app.id ? <Check size={10} className="text-[var(--status-success)]" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                </div>
                {statusCfg && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {app.status}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[var(--surface-subtle)] p-2.5 rounded-lg border border-[var(--border-subtle)] my-4 text-center">
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Spend</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">${app.spend.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Installs</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{app.installs.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">ROAS</div>
                  <div className="text-sm font-bold text-[var(--status-success)] mt-0.5">{app.roas > 0 ? `${app.roas.toFixed(1)}x` : '-'}</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mr-1">Active Nets:</span>
                  {app.networks.length > 0 ? (
                    app.networks.map(net => (
                      <div key={net} title={networkConfig[net]?.label || net} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => onNavigate(`/${net}`)}>
                        <NetworkIconRenderer network={net} />
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)] font-medium">None</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Sync app data" onClick={() => onAppSync(app.id, app.name)} className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] bg-[var(--surface-base)] transition-all cursor-pointer">
                    <RefreshCw size={12} className={syncingAppId === app.id ? 'animate-spin' : ''} />
                  </button>
                  <Button type="button" variant="border" size="s" onClick={() => onNavigate(`/${app.networks[0] || 'google-ads'}`)} className="text-[11px] font-bold gap-1">
                    Workspace <ExternalLink size={10} />
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};
