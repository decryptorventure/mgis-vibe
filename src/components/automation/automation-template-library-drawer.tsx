// Task 9 — Automation rule template library: browse approved/draft templates and apply one
import React, { useState } from 'react';
import { Drawer, Tag } from 'antd';
import { AlertTriangle, BookOpen, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';

interface RuleTemplate {
  id: string;
  name: string;
  useCase: string;
  condition: string;
  action: string;
  warning: string;
  status: 'approved' | 'draft';
  category: 'creative' | 'country' | 'budget';
}

const TEMPLATES: RuleTemplate[] = [
  {
    id: 't1', name: 'Pause Low-ROAS Creative Sets', status: 'approved', category: 'creative',
    useCase: 'Remove underperforming creative sets before they waste further budget.',
    condition: 'Predicted ROAS D28 < 0.5 for 7 consecutive days',
    action: 'Pause matching creative sets',
    warning: 'Requires at least 7 days of data. May pause sets that are still in learning phase.',
  },
  {
    id: 't2', name: 'Scale Top-Performer Countries', status: 'approved', category: 'country',
    useCase: 'Automatically increase budget for countries exceeding ROAS target.',
    condition: 'ROAS D28 ≥ 1.5 AND spend > $500 over last 14 days',
    action: 'Increase daily budget by 20%',
    warning: 'Cap at 2× original budget to avoid overspend. Review weekly.',
  },
  {
    id: 't3', name: 'Pause Low-Conversion Countries', status: 'approved', category: 'country',
    useCase: 'Stop spending on countries delivering fewer than minimum installs.',
    condition: 'Conversions < 10 over last 7 days AND spend > $100',
    action: 'Pause country bid',
    warning: 'Will pause T1 markets if they underperform — review before applying to high-priority geos.',
  },
  {
    id: 't4', name: 'Auto-Mix PLA Winners Monthly', status: 'approved', category: 'creative',
    useCase: 'Refresh creative sets with the top-performing HTML playables each month.',
    condition: 'Top 5 HTML assets by spend over last 30 days',
    action: 'Create new creative set with selected assets',
    warning: 'Requires at least 5 active HTML creatives in the library.',
  },
  {
    id: 't5', name: 'Refresh Fatigued Videos', status: 'draft', category: 'creative',
    useCase: 'Replace videos showing declining performance (spend high, IPM dropping).',
    condition: 'Spend > $5,000 AND IPM declined > 20% week-over-week',
    action: 'Flag creative for review + notify team via Slack',
    warning: 'Draft — not yet validated by senior UA. Do not use in production.',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  creative: 'bg_blue_subtle fg_blue_strong border_blue',
  country: 'bg_emerald_subtle fg_emerald_strong border_emerald',
  budget: 'bg_amber_subtle fg_amber_strong border_amber',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (template: RuleTemplate) => void;
}

export const AutomationTemplateLibraryDrawer: React.FC<Props> = ({ open, onClose, onApply }) => {
  const [selected, setSelected] = useState<RuleTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'creative' | 'country' | 'budget'>('all');

  const visible = TEMPLATES.filter(t => categoryFilter === 'all' || t.category === categoryFilter);

  const handleApply = () => {
    if (!selected) return;
    onApply(selected);
    onClose();
    toast.success(`Template "${selected.name}" applied — review conditions before saving.`);
  };

  return (
    <Drawer
      title={<div className="flex items-center gap-2"><BookOpen size={16} />Rule Template Library</div>}
      width={720}
      open={open}
      onClose={onClose}
      extra={
        <Button type="button" variant="primary" size="s" disabled={!selected || selected.status === 'draft'} onClick={handleApply}>
          Use Template
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          {(['all', 'creative', 'country', 'budget'] as const).map(cat => (
            <button key={cat} type="button" onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1.5 radius_8 text-xs font-semibold border cursor-pointer capitalize transition-colors',
                categoryFilter === cat ? 'bg_blue_subtle fg_blue_strong border_blue' : 'bg_primary border_primary text_secondary hover:bg_secondary'
              )}>
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs text_tertiary">{visible.length} templates</span>
        </div>

        {/* Template list */}
        <div className="space-y-2">
          {visible.map(t => {
            const isSelected = selected?.id === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setSelected(isSelected ? null : t)}
                className={cn(
                  'w-full text-left radius_8 border p-4 transition-colors cursor-pointer space-y-2',
                  isSelected ? 'border_blue bg_blue_subtle' : 'border_primary bg_primary hover:bg_secondary'
                )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {t.status === 'approved'
                      ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      : <Clock size={14} className="text-amber-500 shrink-0" />}
                    <span className="font-semibold text_primary text-sm truncate">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Tag className={cn('text-[10px] font-bold border m-0 capitalize', CATEGORY_COLORS[t.category])}>{t.category}</Tag>
                    <Tag className={cn('text-[10px] font-bold border m-0',
                      t.status === 'approved' ? 'bg_emerald_subtle fg_emerald_strong border_emerald' : 'bg_amber_subtle fg_amber_strong border_amber'
                    )}>{t.status}</Tag>
                    <ChevronRight size={14} className={cn('transition-transform text_tertiary', isSelected ? 'rotate-90' : '')} />
                  </div>
                </div>

                <p className="text-xs text_secondary">{t.useCase}</p>

                {isSelected && (
                  <div className="mt-3 space-y-2 border-t border_secondary pt-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] font-semibold text_tertiary uppercase tracking-wide mb-1">Condition</div>
                        <div className="px-2 py-1.5 radius_6 bg_secondary border border_secondary text_primary">{t.condition}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text_tertiary uppercase tracking-wide mb-1">Action</div>
                        <div className="px-2 py-1.5 radius_6 bg_secondary border border_secondary text_primary">{t.action}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 px-3 py-2 radius_6 bg_amber_subtle border border_amber text-xs fg_amber_strong">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                      {t.warning}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs text_tertiary bg_secondary border border_secondary px-3 py-2 radius_8">
          Templates marked <strong>approved</strong> have been validated by senior UA.
          <strong> Draft</strong> templates are experimental — use at your own risk.
        </div>
      </div>
    </Drawer>
  );
};
