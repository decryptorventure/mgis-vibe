// Creative upload modal — extracted from MediaLibraries for modularization
import React from 'react';
import { Modal, Select, Upload } from '@/components/ui-kit-compat';
import { Upload as UploadIcon } from 'lucide-react';
import { Button, toast } from '@frontend-team/ui-kit';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreativeUploadModal: React.FC<Props> = ({ open, onClose }) => (
  <Modal title="Upload Media" open={open} onCancel={onClose} footer={null} width={520} destroyOnClose>
    <div className="space-y-4 mt-4">
      <Select
        placeholder="Select Network"
        className="w-full"
        options={[
          { value: 'meta', label: 'Meta' },
          { value: 'google-ads', label: 'Google Ads' },
          { value: 'axon', label: 'Axon' },
          { value: 'moloco', label: 'Moloco' },
        ]}
      />
      <Upload.Dragger
        multiple
        onChange={() => toast.info('Upload simulation: file queued!')}
        className="group border-2 border-dashed border-[var(--color-primary-300)] rounded-2xl bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] hover:border-[var(--color-primary-500)] transition-all p-8 text-center cursor-pointer shadow-inner"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg_primary rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
            <UploadIcon size={28} className="text-[var(--color-primary-500)]" />
          </div>
          <p className="text-sm font-extrabold text-[var(--color-primary-800)] mb-1">Kéo thả file hoặc click để chọn</p>
          <p className="text-xs text-[var(--color-primary-600)] font-medium">Hỗ trợ PNG, JPG, MP4, HTML (max 50MB)</p>
        </div>
      </Upload.Dragger>
      <Button type="button" variant="primary" size="m" className="w-full" onClick={onClose}>
        Start Upload
      </Button>
    </div>
  </Modal>
);
