import React from 'react';
import { Modal } from 'antd';
import { Button } from '@frontend-team/ui-kit';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
}) => (
  <Modal
    open={open}
    onCancel={onCancel}
    title={null}
    footer={null}
    centered
    width={420}
    styles={{ body: { padding: '24px' } }}
  >
    <div className="flex flex-col items-center text-center gap-4">
      {danger && (
        <div className="w-12 h-12 radius_round flex items-center justify-center bg_red_subtle fg_red_strong">
          <AlertTriangle size={24} />
        </div>
      )}

      <h3 className="text-base font-semibold m-0 text_primary">{title}</h3>

      <p className="text-sm m-0 leading-relaxed max-w-xs text_secondary">{description}</p>

      <div className="flex items-center gap-3 mt-2 w-full">
        <Button type="button" variant="border" size="l" onClick={onCancel} className="flex-1 text-sm">
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={danger ? 'danger' : 'primary'}
          size="l"
          onClick={onConfirm}
          className="flex-1 text-sm"
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;
