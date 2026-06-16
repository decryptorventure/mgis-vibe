import React, { useEffect, useState } from 'react';
import { Badge, Dropdown } from 'antd';
import { Avatar, Button, toast } from '@frontend-team/ui-kit';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, LogOut, User, MessageSquarePlus,
  Sun, Moon, Menu as MenuIcon,
} from 'lucide-react';
import { mockUser } from '../../shared/mock-data';
import { applyThemeMode, getInitialTheme, setStoredThemeMode, type ThemeMode } from '@/theme/theme-mode';

// ─────────────────────────────────────────────────────────────────────────────
// AppHeader — extracted from AppLayout.tsx
// Page title + breadcrumb, dark mode toggle, feedback, notification bell,
// user dropdown. Replaces JS hover handlers with CSS hover: classes.
// ─────────────────────────────────────────────────────────────────────────────

interface AppHeaderProps {
  /** Current page title */
  pageTitle: string;
  /** Breadcrumb segments after the current title */
  breadcrumbs?: string[];
  /** Unread notification count */
  notificationCount: number;
  /** Open notification drawer */
  onNotificationClick: () => void;
  /** Toggle mobile sidebar drawer */
  onMobileMenuClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  pageTitle,
  breadcrumbs = [],
  notificationCount,
  onNotificationClick,
  onMobileMenuClick,
}) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyThemeMode(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setStoredThemeMode(nextTheme);
  };

  const userDropdownItems = [
    {
      key: 'profile',
      label: (
        <span className="flex items-center gap-2 text-sm">
          <User size={14} /> Profile
        </span>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: (
        <span className="flex items-center gap-2 text-sm fg_red_strong">
          <LogOut size={14} /> Log out
        </span>
      ),
      onClick: () => navigate('/login'),
    },
  ];

  return (
    <div className="h-14 flex items-center justify-between flex-shrink-0 px-5 bg_primary border-b border_primary">
      {/* Left: mobile menu toggle + page title + breadcrumb */}
      <div className="flex items-center gap-2">
        {/* Mobile hamburger — visible < 768px */}
        {onMobileMenuClick && (
          <button
            aria-label="Toggle sidebar menu"
            onClick={onMobileMenuClick}
            className="w-8 h-8 radius_8 flex items-center justify-center cursor-pointer transition-colors md:hidden bg_button_tertiary border border_button text_secondary hover:state_bg_button_tertiary_soft"
          >
            <MenuIcon size={15} />
          </button>
        )}

        <h1 className="text-sm font-semibold m-0 leading-none text_primary">
          {pageTitle}
        </h1>
        {breadcrumbs.map(crumb => (
          <React.Fragment key={crumb}>
            <span className="hidden sm:inline text_tertiary">/</span>
            <span className="hidden sm:inline text-xs font-medium text_tertiary">
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          type="button"
          variant="dim"
          size="icon-m"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </Button>

        {/* Feedback */}
        <Button
          type="button"
          variant="dim"
          size="s"
          onClick={() => toast.info('Feedback channel is not connected yet.')}
          aria-label="Send feedback"
          className="gap-1.5 text-xs"
        >
          <MessageSquarePlus size={13} />
          <span className="hidden md:inline">Feedback</span>
        </Button>

        {/* Notifications */}
        <Badge
          count={notificationCount}
          size="small"
          offset={[-3, 3]}
          styles={{ indicator: { background: 'var(--color-primary-500)' } }}
        >
          <Button
            type="button"
            variant="dim"
            size="icon-m"
            aria-label="Open notifications"
            onClick={onNotificationClick}
          >
            <Bell size={15} />
          </Button>
        </Badge>

        {/* User dropdown */}
        <Dropdown menu={{ items: userDropdownItems }} trigger={['click']}>
          <div
            className="
              flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1
              transition-colors
              hover:state_bg_button_tertiary_soft
            "
          >
            <Avatar
              size="s"
              fallback={mockUser.avatar}
              style={{
                backgroundColor: mockUser.color,
              }}
            />
            <span className="text-xs font-medium hidden sm:inline text_primary">
              {mockUser.name}
            </span>
            <ChevronDown size={13} className="text_tertiary" />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default AppHeader;
