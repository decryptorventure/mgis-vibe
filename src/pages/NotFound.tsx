import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 px-6"
      style={{ minHeight: '60vh' }}
    >
      <span
        className="font-bold select-none"
        style={{
          fontSize: '96px',
          lineHeight: 1,
          color: 'var(--border-strong)',
        }}
      >
        404
      </span>

      <h1
        className="mt-4 mb-2 font-semibold"
        style={{
          fontSize: '20px',
          color: 'var(--text-primary)',
        }}
      >
        Page Not Found
      </h1>

      <p
        className="text-center mb-8"
        style={{
          fontSize: 'var(--font-size-body-s)',
          color: 'var(--text-secondary)',
          maxWidth: '380px',
          lineHeight: 'var(--line-height-body)',
        }}
      >
        The page you're looking for doesn't exist or has been moved.
        Check the URL or navigate back to the dashboard.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 font-medium no-underline transition-colors"
        style={{
          fontSize: 'var(--font-size-body-s)',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--surface-base)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '0.5rem 1.25rem',
        }}
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
