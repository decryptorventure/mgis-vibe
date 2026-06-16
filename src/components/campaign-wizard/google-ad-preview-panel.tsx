import React, { useState } from 'react';
import { Button } from 'antd';

interface GoogleAdPreviewPanelProps {
  headline: string;
  description: string;
}

export const GoogleAdPreviewPanel: React.FC<GoogleAdPreviewPanelProps> = ({
  headline,
  description,
}) => {
  const [previewTab, setPreviewTab] = useState<'play' | 'search' | 'youtube' | 'discover'>('play');

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">UAC Ad Preview</span>
        <div className="flex gap-0.5">
          {(['play', 'search', 'youtube', 'discover'] as const).map(tab => (
            <Button
              key={tab}
              size="small"
              type={previewTab === tab ? 'primary' : 'text'}
              onClick={() => setPreviewTab(tab)}
              className="text-[10px] px-1.5 h-5"
            >
              {tab.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Phone Mockup */}
      <div 
        className="border-[6px] rounded-[24px] w-full h-[280px] overflow-hidden relative flex flex-col mx-auto max-w-[280px]"
        style={{
          borderColor: 'var(--border-strong)',
          backgroundColor: 'var(--surface-base)',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        {/* Phone Status Bar */}
        <div 
          className="text-[8px] px-3 py-0.5 flex justify-between items-center font-semibold shrink-0"
          style={{
            backgroundColor: 'var(--surface-muted)',
            color: 'var(--text-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span>09:41</span>
          <div className="flex gap-1">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Ad View Content */}
        <div 
          className="p-3 flex-1 flex flex-col justify-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          {previewTab === 'play' && (
            <div 
              className="p-3 rounded-lg border space-y-2"
              style={{
                backgroundColor: 'var(--surface-base)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex gap-2.5">
                <div 
                  className="w-8 h-8 rounded-lg text-white font-bold text-md flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary-500)' }}
                >
                  I
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{headline || 'Headline'}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>Simulation • Chứa quảng cáo</div>
                </div>
              </div>
              <div className="text-[9px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description || 'Description'}</div>
              <Button 
                block 
                type="primary" 
                className="border-none text-[9px] h-6 font-bold cursor-pointer"
                style={{ backgroundColor: 'var(--status-success)' }}
              >
                Cài đặt
              </Button>
            </div>
          )}

          {previewTab === 'search' && (
            <div 
              className="p-2.5 rounded-lg border space-y-1"
              style={{
                backgroundColor: 'var(--surface-base)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-1">
                <span 
                  className="font-bold text-[7px] px-1 py-0.5 rounded-sm"
                  style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}
                >
                  Tài trợ
                </span>
                <span className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>play.google.com</span>
              </div>
              <div className="text-[10px] font-bold leading-snug" style={{ color: 'var(--status-info)' }}>{headline || 'Headline'}</div>
              <div className="text-[8px] leading-normal" style={{ color: 'var(--text-secondary)' }}>{description || 'Description'}</div>
            </div>
          )}

          {previewTab === 'youtube' && (
            <div className="flex flex-col h-full relative overflow-hidden rounded-md" style={{ backgroundColor: 'var(--surface-muted)' }}>
              <div className="flex-1 flex items-center justify-center relative">
                <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>YouTube Video</span>
                <div className="absolute bottom-1 left-1 bg-black/60 p-1 rounded text-[7px] flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary-500)' }}></div>
                  <div>
                    <div className="font-bold text-[8px] text-white truncate max-w-[80px]">{headline || 'Headline'}</div>
                    <div className="text-[6px] text-slate-300">Tải xuống</div>
                  </div>
                </div>
              </div>
              <div 
                className="p-1.5 flex justify-between items-center text-[9px]"
                style={{
                  backgroundColor: 'var(--surface-base)',
                  color: 'var(--text-primary)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div className="truncate font-semibold pr-1 max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>{description || 'Description'}</div>
                <Button size="small" type="primary" className="h-5 text-[8px] px-2 font-bold cursor-pointer">INSTALL</Button>
              </div>
            </div>
          )}

          {previewTab === 'discover' && (
            <div 
              className="rounded-lg border overflow-hidden flex flex-col"
              style={{
                backgroundColor: 'var(--surface-base)',
                borderColor: 'var(--border-default)',
              }}
            >
              <div 
                className="h-16 flex items-center justify-center text-[9px]"
                style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--text-tertiary)' }}
              >
                [Hình ảnh quảng cáo UAC]
              </div>
              <div className="p-2 space-y-0.5">
                <div className="flex items-center gap-1 text-[7px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="px-1 py-0.2 rounded" style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' }}>Quảng cáo</span>
                  <span>Google UAC</span>
                </div>
                <div className="text-[9px] font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{headline || 'Headline'}</div>
                <div className="text-[8px] line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{description || 'Description'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
