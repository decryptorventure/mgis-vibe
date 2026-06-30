// Modal and Drawer portal overlays for ui-kit-compat
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button, cn } from '@frontend-team/ui-kit';
import { X } from 'lucide-react';

interface ModalProps {
  open?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  className?: string;
  destroyOnClose?: boolean;
  closable?: boolean;
  centered?: boolean;
  styles?: { body?: React.CSSProperties };
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  cancelButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export function Modal({ open, onCancel, onOk, title, children, footer, width, className, styles, okText = 'OK', cancelText = 'Cancel', okButtonProps, cancelButtonProps, closable = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const maxW = width === '100%' ? '100%' : typeof width === 'number' ? `${width}px` : (width ?? '640px');

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[47] bg-black/40" onClick={onCancel} />
      <div
        className={cn('fixed left-1/2 top-1/2 z-[48] -translate-x-1/2 -translate-y-1/2 flex flex-col bg_primary radius_12 shadow_xl overflow-hidden w-[calc(100vw-32px)]', className)}
        style={{ maxWidth: maxW }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border_secondary shrink-0">
          <div className="flex-1 min-w-0 body_s font-semibold text_primary">{title}</div>
          {closable !== false && (
            <button type="button" onClick={onCancel} aria-label="Close"
              className="flex items-center justify-center w-7 h-7 radius_6 text_tertiary hover:text_primary hover:bg_secondary transition-colors border-0 bg-transparent cursor-pointer shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="overflow-y-auto px-5 py-4 max-h-[70vh]" style={styles?.body}>{children}</div>
        {footer !== null && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border_secondary shrink-0">
            {footer ?? (
              <>
                <Button variant="border" onClick={onCancel} {...cancelButtonProps}>{cancelText}</Button>
                <Button onClick={onOk} {...okButtonProps}>{okText}</Button>
              </>
            )}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

interface DrawerProps {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  extra?: React.ReactNode;
  width?: number | string;
  placement?: 'left' | 'right';
  className?: string;
  styles?: { body?: React.CSSProperties; header?: React.CSSProperties; footer?: React.CSSProperties };
  closable?: boolean;
  destroyOnClose?: boolean;
}

export function Drawer({ open, onClose, title, children, footer, extra, width, placement = 'right', closable = true, className, styles }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const panelW = typeof width === 'number' ? `${width}px` : (width ?? '420px');

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[47] bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'fixed inset-y-0 z-[48] flex flex-col bg_primary shadow_l overflow-hidden',
          placement === 'left' ? 'left-0 border-r border_secondary' : 'right-0 border-l border_secondary',
          className,
        )}
        style={{ width: panelW }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border_secondary shrink-0" style={styles?.header}>
          <div className="flex-1 min-w-0 body_s font-semibold text_primary">{title}</div>
          {extra}
          {closable !== false && (
            <button type="button" onClick={onClose} aria-label="Close"
              className="flex items-center justify-center w-7 h-7 radius_6 text_tertiary hover:text_primary hover:bg_secondary transition-colors border-0 bg-transparent cursor-pointer shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4" style={styles?.body}>{children}</div>
        {footer && (
          <div className="px-4 py-3 border-t border_secondary shrink-0" style={styles?.footer}>{footer}</div>
        )}
      </div>
    </>,
    document.body,
  );
}
