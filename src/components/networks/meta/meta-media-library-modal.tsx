// Media Library picker — folder navigation + multi-select files for bulk ad creation
import React, { useState } from 'react';
import { Modal, Select } from '@/components/ui-kit-compat';
import { Button, cn } from '@frontend-team/ui-kit';
import { ArrowLeft, FileImage, Film, FolderClosed, Grid3X3, List, RefreshCcw } from 'lucide-react';

export interface MediaFile {
  id: string; name: string; type: 'video' | 'image';
  duration?: string; size?: string; modified: string;
}

interface MockFolder { name: string; modified: string }

// TODO: replace with RTK Query when media library API is available
const MOCK_FOLDERS: MockFolder[] = [
  { name: 'Clean_IOS', modified: '15:28 04/12/2025' },
  { name: 'Android_Q4', modified: '10:15 03/25/2025' },
];

const MOCK_FOLDER_FILES: Record<string, MediaFile[]> = {
  Clean_IOS: [
    { id: 'v1', name: 'N3_Sexy_Phone_Ver1.3_25-55_916.mp4', type: 'video', duration: '36.7s', modified: '15:28 04/12/2025' },
    { id: 'v2', name: 'N3_Mistakes_Phone_Ver2.3_25-55.mp4', type: 'video', duration: '28.3s', modified: '12:00 04/10/2025' },
  ],
  Android_Q4: [
    { id: 'i1', name: 'Banner_320x50.png', type: 'image', size: '45 KB', modified: '10:15 03/25/2025' },
  ],
};

interface RowCheckProps { checked: boolean; onChange: () => void }
const RowCheck: React.FC<RowCheckProps> = ({ checked, onChange }) => (
  <button type="button" onClick={e => { e.stopPropagation(); onChange(); }}
    className={cn('w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors',
      checked ? 'border-[var(--status-info)] bg-[var(--status-info)]' : 'border_secondary')}>
    {checked && <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2"><path d="M1 3l1.8 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
  </button>
);

interface Props { open: boolean; onClose: () => void; onConfirm: (files: MediaFile[]) => void }

export const MediaLibraryModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const [folder, setFolder] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const files = folder ? (MOCK_FOLDER_FILES[folder] ?? []) : [];
  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSel = files.length > 0 && files.every(f => selected.has(f.id));
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(files.map(f => f.id)));
  const reset = () => { setFolder(null); setSelected(new Set()); };
  const handleClose = () => { reset(); onClose(); };
  const handleConfirm = () => { onConfirm(files.filter(f => selected.has(f.id))); reset(); };

  return (
    <Modal open={open} onCancel={handleClose} title="Media Library" width={780} footer={null}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <Button type="button" variant="subtle" size="s" className="w-7 h-7 p-0" aria-label="Refresh media library">
          <RefreshCcw size={13} />
        </Button>
        <Select size="small" className="w-36" defaultValue="Clean_IOS" options={[{ value: 'Clean_IOS', label: 'Clean_IOS' }]} />
        <div className="flex border border_primary radius_8 overflow-hidden ml-auto">
          {(['table', 'card'] as const).map(m => (
            <button key={m} type="button" onClick={() => setViewMode(m)} aria-label={`${m} view`}
              className={cn('px-2 py-1 text-xs flex items-center gap-1 transition-colors',
                viewMode === m ? 'bg_secondary text_primary' : 'bg_primary text_secondary hover:bg_secondary')}>
              {m === 'table' ? <List size={12} /> : <Grid3X3 size={12} />}
              {m === 'table' ? 'Table' : 'Card'}
            </button>
          ))}
        </div>
        <Select size="small" className="w-36" defaultValue="newest"
          options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]} />
      </div>

      {/* Breadcrumb or filter row */}
      {folder ? (
        <button type="button" onClick={() => { setFolder(null); setSelected(new Set()); }}
          className="flex items-center gap-1.5 text-xs text_secondary hover:text_primary mb-2 transition-colors">
          <ArrowLeft size={12} />Back
        </button>
      ) : (
        <div className="flex gap-2 mb-3">
          {(['All Sizes', 'All Durations', 'All Status'] as const).map(f => (
            <Select key={f} size="small" className="w-28" defaultValue={f} options={[{ value: f, label: f }]} />
          ))}
        </div>
      )}

      {/* Table */}
      <div className="border border_primary radius_8 overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead className="bg_secondary">
            <tr>
              {folder && <th className="w-8 px-3 py-2 text-left"><RowCheck checked={allSel} onChange={toggleAll} /></th>}
              <th className="px-3 py-2 text-left font-semibold text_secondary tracking-wide">NAME</th>
              <th className="px-3 py-2 text-right font-semibold text_secondary tracking-wide">{folder ? 'DURATION' : 'MODIFIED'}</th>
              {folder && <th className="px-3 py-2 text-right font-semibold text_secondary tracking-wide">CREATED AT</th>}
            </tr>
          </thead>
          <tbody>
            {!folder && MOCK_FOLDERS.map(f => (
              <tr key={f.name} className="border-t border_primary hover:bg_secondary cursor-pointer" onClick={() => setFolder(f.name)}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2 text_primary font-medium">
                    <FolderClosed size={14} className="text-yellow-500 shrink-0" />{f.name}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text_tertiary">{f.modified}</td>
              </tr>
            ))}
            {folder && files.map(f => (
              <tr key={f.id} onClick={() => toggle(f.id)}
                className={cn('border-t border_primary cursor-pointer transition-colors', selected.has(f.id) ? 'bg_info' : 'hover:bg_secondary')}>
                <td className="w-8 px-3 py-2.5"><RowCheck checked={selected.has(f.id)} onChange={() => toggle(f.id)} /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2 text_primary font-medium">
                    {f.type === 'video' ? <Film size={13} className="text_tertiary shrink-0" /> : <FileImage size={13} className="text_tertiary shrink-0" />}
                    <span className="truncate max-w-[340px]">{f.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text_tertiary">{f.duration ?? f.size ?? '—'}</td>
                <td className="px-3 py-2.5 text-right text_tertiary">{f.modified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text_tertiary">{selected.size} selected</span>
        <div className="flex gap-2">
          <Button type="button" variant="border" size="s" onClick={handleClose}>Cancel</Button>
          <Button type="button" variant="primary" size="s" disabled={selected.size === 0} onClick={handleConfirm}>
            Confirm ({selected.size})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
