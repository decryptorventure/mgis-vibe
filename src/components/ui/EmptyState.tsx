import React from 'react';
import { Button } from '@frontend-team/ui-kit';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  minHeight?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  minHeight = 280,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6" style={{ minHeight }}>
    <div className="w-16 h-16 radius_16 flex items-center justify-center mb-5 bg_tertiary border border_secondary icon_tertiary">
      {icon}
    </div>

    <h3 className="text-sm font-bold m-0 text_primary">{title}</h3>

    {description && (
      <p className="text-xs mt-2 max-w-sm mx-auto leading-relaxed m-0 text_secondary font-medium">
        {description}
      </p>
    )}

    {actionLabel && onAction && (
      <Button type="button" variant="primary" size="m" onClick={onAction} className="mt-6 text-xs font-bold">
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
