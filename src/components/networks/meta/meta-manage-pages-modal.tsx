// Manage Pages modal â€” CRUD for the Facebook/Instagram pages linked to the account
import React, { useState } from 'react';
import { Input, Modal } from '@/components/ui-kit-compat';
import type { ColumnsType } from '@/components/ui-kit-compat';
import { Edit3, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { Button, cn, toast } from '@frontend-team/ui-kit';
import { DataTable } from '@/components/ui/DataTable';
import type { MetaPage } from './meta-types';

interface ManagePagesModalProps {
  open: boolean;
  onClose: () => void;
  pages: MetaPage[];
  onChange: (pages: MetaPage[]) => void;
}

export const ManagePagesModal: React.FC<ManagePagesModalProps> = ({ open, onClose, pages, onChange }) => {
  const [draftPage, setDraftPage] = useState({ id: '', name: '', instagramId: '' });
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  const resetForm = () => {
    setDraftPage({ id: '', name: '', instagramId: '' });
    setEditingPageId(null);
  };

  const handleSubmit = () => {
    if (!draftPage.id.trim() || !draftPage.name.trim()) {
      toast.error('Page ID and Page Name are required');
      return;
    }
    if (editingPageId) {
      onChange(pages.map(page => page.id === editingPageId ? { ...page, ...draftPage, status: 'Needs review' } : page));
      toast.success('Page updated');
    } else {
      onChange([
        { id: draftPage.id.trim(), name: draftPage.name.trim(), instagramId: draftPage.instagramId.trim(), status: 'Needs review' },
        ...pages,
      ]);
      toast.success('Page added to mock list');
    }
    resetForm();
  };

  const columns: ColumnsType<MetaPage> = [
    { title: 'Page ID', dataIndex: 'id', key: 'id', width: 160 },
    { title: 'Page Name', dataIndex: 'name', key: 'name' },
    { title: 'Instagram User ID', dataIndex: 'instagramId', key: 'instagramId', width: 180 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: MetaPage['status']) => (
        <span className={cn('text-[11px] font-semibold px-2 py-0.5 radius_4', status === 'Synced' ? 'bg_emerald_subtle fg_emerald_strong' : 'bg_amber_subtle fg_amber_strong')}>
          {status}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 88,
      render: (_: unknown, record) => (
        <div className="flex justify-end gap-1">
          <Button type="button" variant="dim" size="icon-s" aria-label="Edit page" onClick={() => { setEditingPageId(record.id); setDraftPage({ id: record.id, name: record.name, instagramId: record.instagramId }); }}>
            <Edit3 size={13} />
          </Button>
          <Button type="button" variant="danger" size="icon-s" aria-label="Delete page" onClick={() => onChange(pages.filter(page => page.id !== record.id))}>
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={<span className="text-base font-semibold text_primary">Manage Pages</span>}
      open={open}
      onCancel={onClose}
      width={820}
      footer={
        <div className="flex items-center justify-between">
          <Button type="button" variant="border" size="m" className="gap-1.5" onClick={() => { onChange(pages.map(page => ({ ...page, status: 'Synced' }))); toast.success('Pages synced from Meta'); }}>
            <RefreshCcw size={14} />
            Sync from Meta
          </Button>
          <Button type="button" variant="border" size="m" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold text_primary mb-2">{editingPageId ? 'Edit Page' : 'Add New Page'}</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
            <Input placeholder="Page ID" value={draftPage.id} onChange={event => setDraftPage(page => ({ ...page, id: event.target.value }))} />
            <Input placeholder="Page Name" value={draftPage.name} onChange={event => setDraftPage(page => ({ ...page, name: event.target.value }))} />
            <Input placeholder="Instagram User ID (optional)" value={draftPage.instagramId} onChange={event => setDraftPage(page => ({ ...page, instagramId: event.target.value }))} />
            <Button type="button" variant="primary" size="m" className="gap-1.5" onClick={handleSubmit}>
              <Plus size={14} />
              {editingPageId ? 'Save Page' : 'Add Page'}
            </Button>
          </div>
          {editingPageId && (
            <button type="button" className="mt-2 border-0 bg-transparent text-xs font-semibold fg_blue_accent cursor-pointer" onClick={resetForm}>
              Cancel editing
            </button>
          )}
        </div>
        <DataTable<MetaPage>
          columns={columns}
          dataSource={pages}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ y: 320 }}
        />
      </div>
    </Modal>
  );
};
