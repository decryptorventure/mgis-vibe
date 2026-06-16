import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--surface-subtle)',
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Inline SVG error icon — avoids dependency on lucide during error */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--status-error)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '1.5rem' }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>

          <h1
            style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: '0 0 0.5rem',
              color: 'var(--text-primary)',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-body-s)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              maxWidth: '420px',
              margin: '0 0 1.5rem',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            An unexpected error occurred. Please reload the page and try again.
            If the problem persists, contact the engineering team.
          </p>

          {this.state.error && (
            <pre
              style={{
                fontSize: 'var(--font-size-label-s)',
                color: 'var(--status-error)',
                backgroundColor: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                maxWidth: '500px',
                overflow: 'auto',
                marginBottom: '1.5rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={this.handleReload}
            style={{
              fontSize: 'var(--font-size-body-s)',
              fontWeight: 500,
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--surface-base)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'var(--surface-muted)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'var(--surface-base)';
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
