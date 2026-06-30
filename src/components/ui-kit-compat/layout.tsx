import type React from 'react';
import { cn } from '@frontend-team/ui-kit';

type BreakpointSpan = number | { span?: number };

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  gutter?: number | [number, number];
  align?: 'top' | 'middle' | 'bottom';
}

interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
  xs?: BreakpointSpan;
  sm?: BreakpointSpan;
  md?: BreakpointSpan;
  lg?: BreakpointSpan;
  xl?: BreakpointSpan;
}

const resolveSpan = (value: BreakpointSpan | undefined) =>
  typeof value === 'number' ? value : value?.span;

export function Row({ gutter = 0, align, className, style, ...props }: RowProps) {
  const [columnGap, rowGap] = Array.isArray(gutter) ? gutter : [gutter, gutter];
  return (
    <div
      className={cn('grid grid-cols-24', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
        columnGap,
        rowGap,
        alignItems: align === 'middle' ? 'center' : align === 'bottom' ? 'end' : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

export function Col({ span, xs, sm, md, lg, xl, className, style, ...props }: ColProps) {
  const resolved = span ?? resolveSpan(xl) ?? resolveSpan(lg) ?? resolveSpan(md) ?? resolveSpan(sm) ?? resolveSpan(xs) ?? 24;
  return (
    <div
      className={className}
      style={{ gridColumn: `span ${resolved} / span ${resolved}`, minWidth: 0, ...style }}
      {...props}
    />
  );
}

interface DividerProps extends Omit<React.HTMLAttributes<HTMLHRElement>, 'type'> {
  type?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'right' | 'center';
}

export function Divider({ className, type = 'horizontal', orientation: _orientation, ...props }: DividerProps) {
  if (type === 'vertical') return <span className={cn('mx-2 inline-block h-4 border-l border_primary align-middle', className)} />;
  return <hr className={cn('my-4 border-0 border-t border_primary', className)} {...props} />;
}

interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'middle' | 'large' | number;
  direction?: 'horizontal' | 'vertical';
}

export function Space({ className, style, size = 'small', direction = 'horizontal', ...props }: SpaceProps) {
  const gap = typeof size === 'number' ? size : size === 'large' ? 16 : size === 'middle' ? 12 : 8;
  return <div className={cn(direction === 'vertical' ? 'inline-flex flex-col' : 'inline-flex items-center', className)} style={{ gap, ...style }} {...props} />;
}

const LayoutRoot = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex min-h-screen min-w-0 bg_secondary', className)} {...props} />
);

interface LayoutSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number;
  collapsedWidth?: number;
  collapsed?: boolean;
  collapsible?: boolean;
  theme?: string;
  onCollapse?: (collapsed: boolean) => void;
}

const LayoutSection = ({
  className,
  width,
  collapsedWidth,
  collapsed,
  collapsible: _collapsible,
  theme: _theme,
  onCollapse: _onCollapse,
  style,
  ...props
}: LayoutSectionProps) => {
  const resolvedWidth = collapsed ? collapsedWidth ?? width : width;
  const isFixedWidth = resolvedWidth != null;

  return (
    <div
      className={cn('min-h-0 min-w-0', className)}
      style={{
        width: resolvedWidth,
        flex: isFixedWidth ? undefined : '1 1 auto',
        flexShrink: isFixedWidth ? 0 : 1,
        ...style,
      }}
      {...props}
    />
  );
};

export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutSection,
  Content: LayoutSection,
  Sider: LayoutSection,
  Footer: LayoutSection,
});
