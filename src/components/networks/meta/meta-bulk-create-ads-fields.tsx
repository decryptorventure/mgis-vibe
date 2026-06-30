// Bulk Create Ads — reusable text field list + option constants (extracted from main modal)
import React from 'react';
import { Button } from '@frontend-team/ui-kit';
import { Plus, X } from 'lucide-react';

export const FB_PAGE_OPTIONS = [
  { value: 'my_app_page', label: 'My App Page' },
  { value: 'brand_page', label: 'Brand Page' },
];

export const CTA_OPTIONS = ['download', 'install_now', 'learn_more', 'shop_now', 'sign_up', 'get_quote'].map(v => ({
  value: v, label: v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
}));

interface TextFieldListProps {
  label: string; required?: boolean; max: number;
  values: string[]; onChange: (v: string[]) => void;
}

export const TextFieldList: React.FC<TextFieldListProps> = ({ label, required, max, values, onChange }) => {
  const add = () => { if (values.length < max) onChange([...values, '']); };
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  const update = (i: number, v: string) => { const n = [...values]; n[i] = v; onChange(n); };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text_secondary">
          {label}{required && <span className="fg_error ml-0.5">*</span>}
          <span className="font-normal text_tertiary ml-1">{values.length}/{max}</span>
        </span>
        <div className="flex items-center gap-1">
          <Button type="button" variant="border" size="s" className="text-[11px] h-6 py-0 px-2">Bulk Paste</Button>
          <Button type="button" variant="border" size="s" className="w-6 h-6 p-0 flex items-center justify-center"
            aria-label={`Add ${label}`} onClick={add} disabled={values.length >= max}>
            <Plus size={11} />
          </Button>
        </div>
      </div>
      {values.length === 0 && (
        <div className="text-xs text_tertiary py-0.5">No {label.toLowerCase()} added yet.</div>
      )}
      <div className="space-y-1.5">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input value={v} onChange={e => update(i, e.target.value)}
              placeholder={`${label.replace(/s$/, '')} ${i + 1}`}
              className="flex-1 border border_primary radius_8 px-2.5 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary" />
            <button type="button" onClick={() => remove(i)} aria-label={`Remove item ${i + 1}`}
              className="text_tertiary hover:fg_error transition-colors shrink-0">
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
