import React from 'react';
import { cn } from '@frontend-team/ui-kit';

interface PageHeaderProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  iconBg = 'var(--ds-bg-accent-primary)',
  title,
  subtitle,
  actions,
  className,
}) => (
  <div className={cn('flex justify-between items-start gap-4', className)}>
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-10 h-10 radius_8 flex items-center justify-center flex-shrink-0 fg_on_accent"
        style={{ background: iconBg }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold m-0 leading-tight text_primary truncate">{title}</h1>
        {subtitle && <p className="text-xs m-0 mt-0.5 leading-normal text_tertiary">{subtitle}</p>}
      </div>
    </div>

    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
