import React from 'react';
import { Drawer, List } from 'antd';
import { cn } from '@frontend-team/ui-kit';
import {
  CheckCircle2, XCircle, AlertTriangle, Info,
} from 'lucide-react';
import type { Notification } from '../../shared/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// NotificationDrawer — extracted from AppLayout.tsx
// Floating drawer (shadow OK per Core DS) with notification list + mark-all-read.
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationDrawerProps {
  /** Whether drawer is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Notification list */
  notifications: Notification[];
  /** Mark all as read handler */
  onMarkAllRead: () => void;
}

/** Notification type → Lucide icon */
const NotifIcon: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    success: { icon: <CheckCircle2 size={16} />, className: 'fg_emerald_accent' },
    error: { icon: <XCircle size={16} />, className: 'fg_red_accent' },
    warning: { icon: <AlertTriangle size={16} />, className: 'fg_amber_accent' },
    info: { icon: <Info size={16} />, className: 'fg_blue_accent' },
  };
  const item = map[type] ?? map.info;
  return <span className={cn('flex items-center', item.className)}>{item.icon}</span>;
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text_primary">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 radius_round bg_accent_primary_subtle fg_accent_primary">
                {unreadCount} new
              </span>
            )}
          </span>
          <button
            onClick={onMarkAllRead}
            className="text-xs cursor-pointer bg-transparent border-0 font-medium transition-colors fg_accent_primary hover:state_bg_button_tertiary_soft radius_6 px-2 py-1"
          >
            Mark all read
          </button>
        </div>
      }
      placement="right"
      width={380}
      onClose={onClose}
      open={open}
    >
      <List
        dataSource={notifications}
        renderItem={(item: Notification) => (
          <List.Item
            className={cn(
              'radius_8 mb-1.5 transition-colors px-3 py-2.5 border',
              item.read ? 'bg-transparent border-transparent' : 'bg_tertiary border_secondary',
            )}
          >
            <List.Item.Meta
              avatar={<NotifIcon type={item.type} />}
              title={
                <span
                  className={cn(
                    'text-[13px] text_primary',
                    item.read ? 'font-normal' : 'font-semibold',
                  )}
                >
                  {item.title}
                </span>
              }
              description={
                <div>
                  <span className="text-xs text_secondary">
                    {item.message}
                  </span>
                  <div className="text-[11px] text_tertiary mt-1">
                    {item.timestamp}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default NotificationDrawer;
