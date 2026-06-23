// ─── InlineEditCell — click-to-edit cell for numeric/text table values ────────
import React, { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Pencil, X } from 'lucide-react';

interface InlineEditCellProps {
  value: number | string;
  /** Called on save; can return a Promise for async saves. */
  onSave: (newValue: number | string) => void | Promise<void>;
  /** Optional display formatter, e.g. v => `$${Number(v).toLocaleString()}` */
  format?: (v: number | string) => string;
  type?: 'number' | 'text';
  /** Minimum numeric value (ignored for text type). Default: 0 */
  min?: number;
  /** When true, renders plain text only (no edit trigger). */
  disabled?: boolean;
}

export const InlineEditCell: React.FC<InlineEditCellProps> = ({
  value,
  onSave,
  format,
  type = 'number',
  min = 0,
  disabled = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft when value prop changes externally
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleSave = async () => {
    const parsed = type === 'number' ? Number(draft) : draft;
    if (type === 'number' && (isNaN(parsed as number) || (parsed as number) < min)) {
      setDraft(String(value));
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(parsed);
    setSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }
  };

  const displayValue = format ? format(value) : String(value);

  if (disabled) {
    return <span className="text-xs">{displayValue}</span>;
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type={type}
          value={draft}
          min={type === 'number' ? min : undefined}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 text-xs border border-[var(--border-focus)] rounded px-1.5 py-0.5
                     outline-none bg_primary text_primary"
        />
        <button
          onMouseDown={e => e.preventDefault()} // prevent blur before click
          onClick={handleSave}
          disabled={saving}
          className="text-[var(--status-success)] hover:opacity-70 transition-opacity"
        >
          {saving
            ? <Loader2 size={12} className="animate-spin" />
            : <Check size={12} />}
        </button>
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => { setDraft(String(value)); setEditing(false); }}
          className="text_tertiary hover:opacity-70 transition-opacity"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 group cursor-pointer"
      onClick={e => { e.stopPropagation(); setEditing(true); }}
    >
      <span className="text-xs">{displayValue}</span>
      <Pencil
        size={10}
        className="text_tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      />
    </div>
  );
};

export default InlineEditCell;
