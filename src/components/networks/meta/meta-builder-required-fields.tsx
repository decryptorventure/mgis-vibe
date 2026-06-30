// Required Fields right panel — shows per-section completion progress inside the builder drawer
import React from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@frontend-team/ui-kit';

interface FieldItem {
  label: string;
  done: boolean;
}

interface SectionConfig {
  title: string;
  color: string;            // fg token
  fields: FieldItem[];
  defaultExpanded?: boolean;
}

interface Props {
  sections: SectionConfig[];
}

const SectionRow: React.FC<{ section: SectionConfig }> = ({ section }) => {
  const [expanded, setExpanded] = React.useState(section.defaultExpanded ?? false);
  const done = section.fields.filter(f => f.done).length;
  const total = section.fields.length;
  const allDone = done === total;

  return (
    <div className="border-b border_secondary last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg_secondary transition-colors text-left"
      >
        <div className={cn('w-3.5 h-3.5 radius_round shrink-0', allDone ? 'bg-[var(--status-success)]' : 'bg-[var(--status-warning)]')} />
        <span className="flex-1 text-xs font-medium text_primary truncate">{section.title}</span>
        <span className={cn('text-xs font-semibold shrink-0', allDone ? 'fg_success' : 'text_secondary')}>{done}/{total}</span>
        {expanded ? <ChevronDown size={12} className="text_tertiary shrink-0" /> : <ChevronRight size={12} className="text_tertiary shrink-0" />}
      </button>
      {expanded && (
        <div className="pb-1">
          {section.fields.map(f => (
            <div key={f.label} className="flex items-center gap-2 px-5 py-0.5">
              {f.done
                ? <CheckCircle2 size={12} className="fg_success shrink-0" />
                : <XCircle size={12} className="fg_danger shrink-0" />}
              <span className={cn('text-[11px] truncate', f.done ? 'text_secondary line-through' : 'text_primary')}>{f.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MetaBuilderRequiredFields: React.FC<Props> = ({ sections }) => {
  const totalDone = sections.reduce((s, sec) => s + sec.fields.filter(f => f.done).length, 0);
  const totalFields = sections.reduce((s, sec) => s + sec.fields.length, 0);
  const pct = totalFields > 0 ? Math.round((totalDone / totalFields) * 100) : 0;

  // SVG circle progress
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const dash = circ * (1 - pct / 100);

  return (
    <aside className="w-52 shrink-0 border-l border_primary bg_primary flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border_secondary">
        <div className="flex items-center gap-3">
          <svg width="44" height="44" className="shrink-0 -rotate-90">
            <circle cx="22" cy="22" r={radius} fill="none" stroke="var(--ds-border-default)" strokeWidth="3" />
            <circle
              cx="22" cy="22" r={radius} fill="none"
              stroke={pct === 100 ? 'var(--status-success)' : 'var(--status-info)'}
              strokeWidth="3"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
            <text
              x="22" y="22" textAnchor="middle" dominantBaseline="central"
              style={{ fill: 'var(--text-primary)', fontSize: '9px', fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: '22px 22px' }}
            >
              {pct}%
            </text>
          </svg>
          <div>
            <div className="text-xs font-bold text_primary">Required Fields</div>
            <div className="text-[11px] text_tertiary mt-0.5">{totalDone}/{totalFields} completed</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1">
        {sections.map(sec => (
          <SectionRow key={sec.title} section={sec} />
        ))}
      </div>

      {/* Advantage+ hint */}
      <div className="p-3 border-t border_secondary">
        <div className="text-[10px] font-semibold text_tertiary mb-1.5">Advantage+ Campaign</div>
        <div className="space-y-1">
          {[
            { label: 'Campaign Budget', ok: true },
            { label: 'All Platforms & Placements', ok: false },
            { label: 'Age & Gender: Both Advantage+', ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.ok
                ? <CheckCircle2 size={11} className="fg_success shrink-0" />
                : <XCircle size={11} className="fg_danger shrink-0" />}
              <span className="text-[10px] text_secondary leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

// Default sections shape used by MetaBuilderDrawer
export const DEFAULT_REQUIRED_SECTIONS: SectionConfig[] = [
  {
    title: 'Campaign',
    color: 'fg_primary',
    defaultExpanded: false,
    fields: [
      { label: 'Account ID', done: true },
      { label: 'Campaign Name', done: true },
      { label: 'Campaign Objective', done: true },
      { label: 'Buying Type', done: true },
      { label: 'Budget Amount', done: true },
      { label: 'Bid Strategy', done: true },
    ],
  },
  {
    title: 'New Adset Promotions',
    color: 'fg_primary',
    defaultExpanded: false,
    fields: [
      { label: 'Ad Set Name', done: true },
      { label: 'Performance Goal', done: true },
      { label: 'Attribution', done: true },
      { label: 'Locations', done: false },
      { label: 'Age Range', done: true },
      { label: 'Gender', done: true },
      { label: 'Platforms', done: true },
    ],
  },
  {
    title: 'New Ad Promotions',
    color: 'fg_primary',
    defaultExpanded: true,
    fields: [
      { label: 'Ad Name', done: true },
      { label: 'Headlines', done: true },
      { label: 'Primary Texts', done: true },
      { label: 'Call to Action', done: true },
      { label: 'Facebook Page', done: false },
      { label: 'Media', done: false },
    ],
  },
];
