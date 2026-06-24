// Task 5 — Bulk remove low-marked Google creatives: preview list + confirmation
import React, { useState } from 'react';
import { Checkbox, Modal } from 'antd';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button, toast } from '@frontend-team/ui-kit';
import type { MediaItem } from '@/shared/mock-data';

interface Props {
  items: MediaItem[];
  open: boolean;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

export const CreativeBulkRemoveModal: React.FC<Props> = ({ items, open, onClose, onConfirm }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(items.map(i => i.id)));

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(items.map(i => i.id)) : new Set());

  const toggle = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleConfirm = () => {
    const ids = [...selected];
    onConfirm(ids);
    onClose();
    toast.success(`${ids.length} Google low-mark creative(s) removed and logged.`);
  };

  const allAffectedCampaigns = [...new Set(items.filter(i => selected.has(i.id)).flatMap(i => i.campaigns ?? []))];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      title={
        <div className="flex items-center gap-2 text-red-600">
          <Trash2 size={16} />Bulk Remove Low-Marked Google Creatives
        </div>
      }
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="flex items-start gap-2.5 px-4 py-3 radius_8 bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">Irreversible action — review carefully</div>
            <div className="text-xs mt-0.5 text-red-600">
              These creatives are marked <strong>LOW quality</strong> by Google. Removing them will affect the campaigns listed below.
              This action will be recorded in the Change Log.
            </div>
          </div>
        </div>

        {/* Creative list with checkboxes */}
        <div className="radius_8 border border-[var(--border-default)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]">
            <Checkbox
              checked={selected.size === items.length}
              indeterminate={selected.size > 0 && selected.size < items.length}
              onChange={e => toggleAll(e.target.checked)}
            />
            <span className="text-xs text_secondary font-semibold">
              {selected.size} / {items.length} selected
            </span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)] max-h-52 overflow-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-subtle)]">
                <Checkbox checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text_primary truncate">{item.name}</div>
                  <div className="text-[10px] text_tertiary mt-0.5">
                    {item.network.toUpperCase()} · ${item.spend?.toLocaleString() ?? 0} spend · ROAS {item.roas?.toFixed(1) ?? '—'}×
                  </div>
                </div>
                <span className="inline-flex px-1.5 py-0.5 radius_4 bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold shrink-0">
                  ↓ LOW
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Affected campaigns */}
        {allAffectedCampaigns.length > 0 && (
          <div>
            <div className="text-xs font-semibold text_secondary mb-1.5">
              Affected campaigns ({allAffectedCampaigns.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allAffectedCampaigns.map(c => (
                <span key={c} className="inline-flex px-2 py-0.5 radius_6 bg_amber_subtle fg_amber_strong border border_amber text-[11px]">{c}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="border" size="m" onClick={onClose}>Cancel</Button>
          <Button
            type="button" variant="primary" size="m"
            disabled={selected.size === 0}
            onClick={handleConfirm}
            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
            className="gap-1.5"
          >
            <Trash2 size={14} />Remove {selected.size} Creative{selected.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
