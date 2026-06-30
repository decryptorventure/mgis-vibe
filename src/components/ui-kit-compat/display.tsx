import type React from 'react';
import {
  Alert as UiAlert,
  Badge as UiBadge,
  Card as UiCard,
  Progress as UiProgress,
  Skeleton as UiSkeleton,
  cn,
} from '@frontend-team/ui-kit';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  styles?: { body?: React.CSSProperties };
}

export function Card({ title, extra, children, className, styles, ...props }: CardProps) {
  return (
    <UiCard shadow="none" className={cn('w-full border border_primary bg_primary p-4 radius_12', className)} {...props}>
      {(title || extra) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="body_s font-semibold text_primary">{title}</div>
          {extra}
        </div>
      )}
      <div style={styles?.body}>{children}</div>
    </UiCard>
  );
}

interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  color?: string;
  bordered?: boolean;
  icon?: React.ReactNode;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  onClose?: () => void;
}

export function Tag({ color, icon, className, children, ...props }: TagProps) {
  const semantic = color === 'success' ? 'success' : color === 'error' || color === 'red' ? 'error' : 'default';
  return <UiBadge variant={semantic} className={className} {...props}>{icon}{children}</UiBadge>;
}

interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  count?: React.ReactNode;
  size?: 'small' | 'default' | 'sm' | 'md' | 'lg';
  dot?: boolean;
  status?: string;
  text?: React.ReactNode;
  offset?: number[];
  styles?: { indicator?: React.CSSProperties };
}

export function Badge({ count, dot, children, className, text, styles: _styles, offset: _offset, size: _size, status: _status, ...props }: BadgeProps) {
  return <UiBadge dot={dot} className={className} {...props}>{children ?? text ?? count}</UiBadge>;
}

interface StatisticProps {
  title?: React.ReactNode;
  value?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  valueStyle?: React.CSSProperties;
}

export function Statistic({ title, value, prefix, suffix, precision, valueStyle }: StatisticProps) {
  const displayValue = typeof value === 'number' && precision !== undefined ? value.toFixed(precision) : value;
  return (
    <div className="min-w-0">
      <div className="body_xs text_tertiary">{title}</div>
      <div className="body_l font-semibold text_primary" style={valueStyle}>
        {prefix}{displayValue}{suffix}
      </div>
    </div>
  );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  paragraph?: { rows?: number } | boolean;
}

export function Skeleton({ paragraph, className, active: _active, ...props }: SkeletonProps) {
  const rows = typeof paragraph === 'object' ? paragraph.rows ?? 3 : paragraph ? 3 : 1;
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: rows }).map((_, index) => (
        <UiSkeleton key={index} className={cn('h-4 radius_6', index === rows - 1 && 'w-2/3')} />
      ))}
    </div>
  );
}

Skeleton.Input = ({ className, active: _active, style }: { className?: string; active?: boolean; style?: React.CSSProperties }) => (
  <UiSkeleton className={cn('h-9 w-full radius_6', className)} style={style} />
);
Skeleton.Button = ({ className, active: _active, style }: { className?: string; active?: boolean; style?: React.CSSProperties }) => (
  <UiSkeleton className={cn('h-9 w-24 radius_6', className)} style={style} />
);

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  percent?: number;
  type?: string;
  strokeColor?: string;
  trailColor?: string;
  showInfo?: boolean;
  status?: string;
  strokeWidth?: number;
  size?: 'small' | 'default' | number;
}

export function Progress({ percent = 0, size, type: _type, strokeColor: _strokeColor, trailColor: _trailColor, showInfo: _showInfo, status: _status, strokeWidth: _strokeWidth, ...props }: ProgressProps) {
  return <UiProgress value={percent} size={size === 'small' ? 'sm' : 'md'} {...props} />;
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'success' | 'info' | 'warning' | 'error';
  showIcon?: boolean;
  icon?: React.ReactNode;
}

export function Alert({ message, description, type = 'info', ...props }: AlertProps) {
  return <UiAlert variant={type} title={message?.toString()} description={description?.toString()} {...props} />;
}

type TextProps = React.HTMLAttributes<HTMLSpanElement> & { strong?: boolean; type?: string };

export const Typography = {
  Text: ({ className, strong, type, ...props }: TextProps) => <span className={cn('body_s', strong && 'font-semibold', type === 'secondary' && 'text_secondary', className)} {...props} />,
  Title: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('body_l font-semibold text_primary', className)} {...props} />,
  Paragraph: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn('body_s text_secondary', className)} {...props} />,
};

interface DescriptionsProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'content'> {
  bordered?: boolean;
  column?: number | Record<string, number>;
  size?: string;
}

export const Timeline = ({ items = [], className }: { items?: { children?: React.ReactNode; color?: string }[]; className?: string }) => (
  <div className={cn('space-y-3', className)}>{items.map((item, index) => <div key={index} className="border-l border_primary pl-3 body_s text_primary">{item.children}</div>)}</div>
);

const ListRoot = ({ dataSource = [], renderItem, className }: { dataSource?: unknown[]; renderItem?: (item: never, index: number) => React.ReactNode; className?: string }) => (
  <div className={cn('[&>div+div]:border-t [&>div+div]:border_primary', className)}>{dataSource.map((item, index) => <div key={index}>{renderItem?.(item as never, index)}</div>)}</div>
);

const ListItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('py-3', className)} {...props} />
);

const ListItemMeta = ({ avatar, title, description }: { avatar?: React.ReactNode; title?: React.ReactNode; description?: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    {avatar && <div className="mt-0.5 shrink-0">{avatar}</div>}
    <div className="min-w-0 flex-1">
      {title && <div>{title}</div>}
      {description && <div className="mt-1">{description}</div>}
    </div>
  </div>
);

export const List = Object.assign(ListRoot, { Item: Object.assign(ListItem, { Meta: ListItemMeta }) });

const DescriptionsRoot = ({ className, ...props }: DescriptionsProps) => (
  <dl className={cn('grid grid-cols-1 gap-3 body_s', className)} {...props} />
);

const DescriptionsItem = ({ label, children }: { label?: React.ReactNode; children?: React.ReactNode }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3">
    <dt className="text_tertiary">{label}</dt>
    <dd className="m-0 text_primary">{children}</dd>
  </div>
);

export const Descriptions = Object.assign(DescriptionsRoot, { Item: DescriptionsItem });
