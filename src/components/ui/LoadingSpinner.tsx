import { Spinner, cn } from '@frontend-team/ui-kit';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
  size?: number;
  className?: string;
}

export function LoadingSpinner({ message, fullPage = false, size = 32, className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage && 'fixed inset-0 z-50 bg_canvas_secondary',
        className,
      )}
      style={{ minHeight: fullPage ? '100vh' : '120px' }}
      role="status"
      aria-label={message ?? 'Loading'}
    >
      <Spinner style={{ width: size, height: size }} />
      {message && <span className="text-sm text_secondary">{message}</span>}
    </div>
  );
}
