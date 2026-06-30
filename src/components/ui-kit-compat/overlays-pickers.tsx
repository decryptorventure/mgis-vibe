// DatePicker and RangePicker overlays for ui-kit-compat
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  DatePicker as UiDatePicker,
  type DatePickerProps as UiDatePickerProps,
  DateRangePicker as UiDateRangePicker,
  type DateRange,
} from '@frontend-team/ui-kit';
import type { AntSize } from './controls-basic';

const mapPickerSize = (size?: AntSize) => (size === 'small' ? 's' : size === 'large' ? 'l' : 'm');

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function RangePicker({ className, style, onChange }: { className?: string; style?: React.CSSProperties; size?: string; format?: string; value?: unknown; allowClear?: boolean; onChange?: (value: [string, string] | null) => void }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>({});
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + window.scrollY + 4, right: window.innerWidth - rect.right });
  }, []);

  const handleToggle = () => { if (!open) updatePos(); setOpen(o => !o); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const handleChange = (r: DateRange) => {
    setRange(r);
    const from = r.from ? r.from.toISOString().slice(0, 10) : '';
    const to = r.to ? r.to.toISOString().slice(0, 10) : '';
    onChange?.(from || to ? [from, to] : null);
    if (r.from && r.to) setOpen(false);
  };

  const label = range.from
    ? range.to ? `${formatDate(range.from)} – ${formatDate(range.to)}` : formatDate(range.from)
    : 'Select date range';

  const dropdown = open ? ReactDOM.createPortal(
    <div
      className="rounded-lg border border_secondary bg_primary shadow_m"
      style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999, minWidth: 320 }}
      onMouseDown={e => e.stopPropagation()}
    >
      <UiDateRangePicker onValueChange={handleChange} showPresets value={range} />
    </div>,
    document.body,
  ) : null;

  return (
    <div className={className} style={{ display: 'inline-block', ...style }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 rounded-md border border_secondary bg_primary px-2.5 py-1 body_s text_secondary hover:border_primary hover:text_primary transition-colors"
      >
        <svg className="h-3.5 w-3.5 flex-shrink-0 text_tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{label}</span>
      </button>
      {dropdown}
    </div>
  );
}

interface DatePickerProps extends Omit<UiDatePickerProps, 'size' | 'onValueChange'> {
  size?: AntSize;
  onChange?: (value: Date | null) => void;
}

function DatePickerRoot({ size, onChange, ...props }: DatePickerProps) {
  return <UiDatePicker size={mapPickerSize(size)} onValueChange={onChange} {...props} />;
}

export const DatePicker = Object.assign(DatePickerRoot, { RangePicker });
