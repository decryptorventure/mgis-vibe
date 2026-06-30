// overlays.tsx — Tooltip, Dropdown, Popover, Upload + re-exports from sub-modules
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileUpload,
  Popover as UiPopover,
  Tooltip as UiTooltip,
} from '@frontend-team/ui-kit';

export { Modal, Drawer } from './overlays-panels';
export { DatePicker } from './overlays-pickers';

export function Tooltip({ title, children }: { title?: React.ReactNode; children: React.ReactElement; placement?: string }) {
  return <UiTooltip content={title} title={title}>{children}</UiTooltip>;
}

interface DropdownProps {
  menu?: {
    items?: { key?: string; label?: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: string }[];
    selectedKeys?: string[];
    onClick?: (event: { key: string }) => void;
  };
  children: React.ReactElement;
  trigger?: string[];
}

export function Dropdown({ menu, children }: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menu?.items?.filter((item) => item.type !== 'divider').map((item, index) => (
          <DropdownMenuItem
            key={item.key ?? index}
            disabled={item.disabled}
            onClick={() => { item.onClick?.(); if (item.key) menu?.onClick?.({ key: item.key }); }}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Popover({ content, children }: { content?: React.ReactNode; children: React.ReactElement; placement?: string; trigger?: string; overlayInnerStyle?: React.CSSProperties; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return <UiPopover trigger={children}>{content}</UiPopover>;
}

type UploadProps = { children?: React.ReactNode; multiple?: boolean; accept?: string; onChange?: () => void; customRequest?: (options: { onSuccess?: (body?: unknown) => void }) => void; className?: string; name?: string; showUploadList?: boolean };

function UploadRoot({ children, multiple, accept, onChange, customRequest, className }: UploadProps) {
  return (
    <div className={className} onClick={() => { customRequest?.({ onSuccess: () => undefined }); onChange?.(); }}>
      {children ?? <FileUpload multiple={multiple} accept={accept} />}
    </div>
  );
}

export const Upload = Object.assign(UploadRoot, { Dragger: UploadRoot });
