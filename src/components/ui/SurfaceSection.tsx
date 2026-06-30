import type React from 'react';
import { cn } from '@frontend-team/ui-kit';

type SectionTone = 'default' | 'secondary' | 'tertiary' | 'accent';
type SectionPadding = 'sm' | 'md' | 'lg';

const toneClassMap: Record<SectionTone, string> = {
  default: 'bg_primary border_primary',
  secondary: 'bg_secondary border_secondary',
  tertiary: 'bg_tertiary border_secondary',
  accent: 'bg_accent_primary_subtle border_accent_primary',
};

const paddingClassMap: Record<SectionPadding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

interface SurfaceSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: SectionTone;
  padding?: SectionPadding;
  /** When false (inside a Card), omits the border so there's no double-border nesting */
  framed?: boolean;
  headerClassName?: string;
  contentClassName?: string;
}

export const SurfaceSection: React.FC<SurfaceSectionProps> = ({
  title,
  description,
  action,
  tone = 'default',
  padding = 'md',
  framed = true,
  className,
  headerClassName,
  contentClassName,
  children,
  ...props
}) => (
  <section
    className={cn(
      'w-full',
      framed ? cn('radius_12 border', toneClassMap[tone]) : 'radius_6 bg_secondary',
      paddingClassMap[padding],
      className,
    )}
    {...props}
  >
    {(title || description || action) && (
      <div className={cn('mb-4 flex items-start justify-between gap-3', headerClassName)}>
        <div className="min-w-0">
          {title && <div className="body_s font-semibold text_primary">{title}</div>}
          {description && <p className="mt-1 body_xs text_secondary">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    <div className={contentClassName}>{children}</div>
  </section>
);

export default SurfaceSection;
