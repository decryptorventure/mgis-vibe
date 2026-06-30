// Market Intelligence / Storefront section for AppDashboard — country KPIs, interactive SVG map, storefront list
import React from 'react';
import { Card, Row, Col, Progress, Select, Button, Tooltip } from '@/components/ui-kit-compat';
import { Globe, Minus, Plus } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/shared/mock-data';
import { STOREFRONTS_DATA } from './use-app-dashboard';

interface Props {
  project: Project;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  zoomScale: number;
  setZoomScale: (fn: (s: number) => number) => void;
}

export const AppDashboardStorefront: React.FC<Props> = ({
  project, selectedCountry, setSelectedCountry, zoomScale, setZoomScale,
}) => (
  <Card
    className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] relative overflow-hidden"
    title={
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        <span className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">Market Intelligence / App Intelligence</span>
        <Select
          value={selectedCountry}
          onChange={v => setSelectedCountry(v)}
          className="w-40 rounded-lg text-xs"
          size="small"
          options={Object.entries(STOREFRONTS_DATA).map(([key, val]) => ({ value: key, label: `${val.flag} ${val.name}` }))}
        />
      </div>
    }
  >
    {/* App metadata */}
    <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--surface-subtle)]/40 mb-5 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-sm bg-[var(--surface-base)] border border-[var(--border-default)] text-[var(--color-primary-500)]">{project.icon}</div>
        <div>
          <div className="font-bold text-sm text-[var(--text-primary)]">{project.name}</div>
          <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 flex-wrap">
            <span>Developer of The App</span><span className="text-[var(--text-tertiary)]">|</span>
            <span>5 in Sport category</span><span className="text-[var(--text-tertiary)]">|</span>
            <span>⭐ 4.5</span><span className="text-[var(--text-tertiary)]">|</span><span>💵 $3.99/week</span>
          </div>
        </div>
      </div>
      <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1 cursor-pointer transition-colors">
        <span>Open in App Store</span><ArrowUpRight size={13} />
      </a>
    </div>

    {/* Country KPI cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <Card className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm" styles={{ body: { padding: '16px' } }}>
        <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Est. Spend in {STOREFRONTS_DATA[selectedCountry].flag} {selectedCountry}</div>
        <div className="font-bold text-lg text-[var(--text-primary)] mt-1.5">{STOREFRONTS_DATA[selectedCountry].spend}</div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">{STOREFRONTS_DATA[selectedCountry].spendDescription}</div>
      </Card>
      <Card className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm" styles={{ body: { padding: '16px' } }}>
        <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Est. Avg. Share of Voice in {selectedCountry}</div>
        <div className="font-bold text-lg text-[var(--text-primary)] mt-1.5">{STOREFRONTS_DATA[selectedCountry].avgSov}%</div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
          <Progress percent={STOREFRONTS_DATA[selectedCountry].avgSov} showInfo={false} size="small" strokeColor="var(--color-primary-500)" className="mb-0 mt-0.5" />
        </div>
      </Card>
      <Card className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm" styles={{ body: { padding: '16px' } }}>
        <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Paid Keywords in {selectedCountry}</div>
        <div className="font-bold text-lg text-[var(--text-primary)] mt-1.5">{STOREFRONTS_DATA[selectedCountry].paidKeywords.toLocaleString()}</div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">{STOREFRONTS_DATA[selectedCountry].keywordsDescription}</div>
      </Card>
      <Card className="rounded-xl border-[var(--border-default)] bg-[var(--surface-base)] shadow-sm" styles={{ body: { padding: '16px' } }}>
        <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Top ASA competitors in {selectedCountry}</div>
        <div className="flex items-center gap-1.5 mt-2.5">
          {STOREFRONTS_DATA[selectedCountry].competitors.map((comp, idx) => (
            <Tooltip key={idx} title={comp.name}>
              <span className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-[var(--text-inverse)] shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 cursor-help" style={{ background: comp.bg }}>{comp.letter}</span>
            </Tooltip>
          ))}
        </div>
      </Card>
    </div>

    {/* Storefront list + interactive SVG map */}
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <div className="border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] p-3 h-[300px] flex flex-col">
          <div className="text-xs font-bold text-[var(--text-primary)] mb-2.5">Storefronts by Est. Spend</div>
          <div className="flex-1 overflow-auto space-y-1 pr-1">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)]">
              <span className="flex items-center gap-1.5"><Globe size={13} className="text-primary-500" /><span>Total 19</span></span>
              <span>$280K / 100%</span>
            </div>
            {Object.entries(STOREFRONTS_DATA).map(([key, data]) => {
              const isActive = selectedCountry === key;
              return (
                <div key={key} onClick={() => setSelectedCountry(key)}
                  className={`flex items-center justify-between text-xs p-2 rounded-lg cursor-pointer border transition-all duration-200 ${isActive ? 'bg-primary-50 border-primary-300 dark:bg-primary-950/20 dark:border-primary-800 font-bold text-primary-600 dark:text-primary-400' : 'bg-[var(--surface-base)] border-[var(--border-subtle)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  <span className="flex items-center gap-2"><span>{data.flag}</span><span>{data.name}</span></span>
                  <span>{data.spend} / {data.spendPercent}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Col>
      <Col xs={24} md={16}>
        <div className="border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative overflow-hidden h-[300px] flex items-center justify-center">
          <svg viewBox="0 0 800 450" className="w-full h-full p-2 select-none">
            <g style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}>
              <path d="M 230 45 L 270 40 L 285 75 L 250 85 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
              <path d="M 60 100 L 90 90 L 120 70 L 160 50 L 220 50 L 250 80 L 260 100 L 240 120 L 200 130 L 160 120 L 110 130 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
              <path d="M 190 205 L 245 200 L 260 220 L 290 280 L 300 340 L 265 420 L 240 440 L 225 390 L 195 280 L 175 220 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
              <path d="M 370 200 L 440 190 L 490 230 L 515 280 L 475 370 L 440 380 L 420 310 L 365 260 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
              <path d="M 390 110 L 470 100 L 500 140 L 490 195 L 435 185 L 390 195 L 380 160 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
              <path d="M 495 100 L 730 90 L 760 210 L 700 270 L 620 280 L 560 280 L 515 235 L 480 200 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
              <path d="M 680 330 L 755 325 L 780 380 L 720 410 L 685 380 Z" fill="var(--surface-muted)" stroke="var(--border-subtle)" strokeWidth="1" />
              {/* US */}
              <path d="M 80 135 L 110 130 L 160 120 L 200 130 L 235 130 L 242 165 L 210 190 L 160 190 L 140 195 L 90 190 Z" fill={selectedCountry === 'US' ? 'var(--color-primary-500)' : '#0284c7'} stroke={selectedCountry === 'US' ? 'var(--color-primary-600)' : 'var(--border-default)'} strokeWidth={selectedCountry === 'US' ? '2' : '1'} className="transition-all duration-300 cursor-pointer hover:opacity-85" onClick={() => setSelectedCountry('US')} />
              {/* GB */}
              <path d="M 365 125 L 372 120 L 375 130 L 368 135 Z" fill={selectedCountry === 'GB' ? 'var(--color-primary-500)' : '#0ea5e9'} stroke={selectedCountry === 'GB' ? 'var(--color-primary-600)' : 'var(--border-default)'} strokeWidth={selectedCountry === 'GB' ? '2' : '1'} className="transition-all duration-300 cursor-pointer hover:opacity-85" onClick={() => setSelectedCountry('GB')} />
              {/* FR */}
              <path d="M 392 148 L 406 145 L 408 160 L 394 162 Z" fill={selectedCountry === 'FR' ? 'var(--color-primary-500)' : '#7dd3fc'} stroke={selectedCountry === 'FR' ? 'var(--color-primary-600)' : 'var(--border-default)'} strokeWidth={selectedCountry === 'FR' ? '2' : '1'} className="transition-all duration-300 cursor-pointer hover:opacity-85" onClick={() => setSelectedCountry('FR')} />
              {/* DE */}
              <path d="M 408 138 L 420 136 L 422 148 L 410 150 Z" fill={selectedCountry === 'DE' ? 'var(--color-primary-500)' : '#38bdf8'} stroke={selectedCountry === 'DE' ? 'var(--color-primary-600)' : 'var(--border-default)'} strokeWidth={selectedCountry === 'DE' ? '2' : '1'} className="transition-all duration-300 cursor-pointer hover:opacity-85" onClick={() => setSelectedCountry('DE')} />
              {/* HR */}
              <path d="M 418 162 L 426 160 L 424 168 L 416 170 Z" fill={selectedCountry === 'HR' ? 'var(--color-primary-500)' : '#bae6fd'} stroke={selectedCountry === 'HR' ? 'var(--color-primary-600)' : 'var(--border-default)'} strokeWidth={selectedCountry === 'HR' ? '2' : '1'} className="transition-all duration-300 cursor-pointer hover:opacity-85" onClick={() => setSelectedCountry('HR')} />
              {/* FI */}
              <path d="M 435 95 L 448 92 L 444 114 L 433 118 Z" fill={selectedCountry === 'FI' ? 'var(--color-primary-500)' : '#e0f2fe'} stroke={selectedCountry === 'FI' ? 'var(--color-primary-600)' : 'var(--border-default)'} strokeWidth={selectedCountry === 'FI' ? '2' : '1'} className="transition-all duration-300 cursor-pointer hover:opacity-85" onClick={() => setSelectedCountry('FI')} />
            </g>
          </svg>
          <div className="absolute bottom-3 left-3 flex flex-col gap-1 shadow-sm">
            <Button size="small" icon={<Plus size={12} />} onClick={() => setZoomScale(s => Math.min(2.0, s + 0.15))} className="w-7 h-7 flex items-center justify-center rounded-md font-bold bg-[var(--surface-base)] border-[var(--border-default)]" />
            <Button size="small" icon={<Minus size={12} />} onClick={() => setZoomScale(s => Math.max(0.7, s - 0.15))} className="w-7 h-7 flex items-center justify-center rounded-md font-bold bg-[var(--surface-base)] border-[var(--border-default)]" />
          </div>
          <div className="absolute bottom-3 right-3 bg-[var(--surface-base)]/80 backdrop-blur-sm border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg flex flex-col gap-1 text-[9px] font-semibold text-[var(--text-secondary)] shadow-sm">
            <div className="flex justify-between items-center w-28 text-[8px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider"><span>Spend</span><span>Intensity</span></div>
            <div className="w-28 h-2 rounded bg-gradient-to-r from-[#e0f2fe] via-[#38bdf8] to-[#0284c7] border border-[var(--border-subtle)]" />
            <div className="flex justify-between w-28 text-[8px]"><span>$1.8K</span><span>$9K</span><span>$24K</span></div>
          </div>
        </div>
      </Col>
    </Row>
  </Card>
);
