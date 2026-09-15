import React from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

export interface UIError {
  title: string;
  message: string;
  suggestions?: string[];
  type?: 'error' | 'warning';
}

interface UIErrorBannerProps {
  error: UIError | null;
  onDismiss: () => void;
}

export const UIErrorBanner: React.FC<UIErrorBannerProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  const isWarning = error.type === 'warning';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`ui-error-banner ${isWarning ? 'is-warning' : 'is-error'}`}
    >
      <div className="error-icon-wrap">
        {isWarning ? <Info size={18} /> : <AlertTriangle size={18} />}
      </div>
      <div className="error-body">
        <strong className="error-title">{error.title}</strong>
        <p className="error-message">{error.message}</p>
        {error.suggestions && error.suggestions.length > 0 && (
          <ul className="error-suggestions">
            {error.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="error-dismiss-btn"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>

      <style>{`
        .ui-error-banner {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid;
          margin-bottom: var(--space-4);
          animation: bannerSlideIn 0.2s var(--ease-spring);
          position: relative;
        }

        @keyframes bannerSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ui-error-banner.is-error {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }

        .ui-error-banner.is-warning {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.35);
          color: #fcd34d;
        }

        [data-theme='light'] .ui-error-banner.is-error {
          background: rgba(239, 68, 68, 0.06);
          border-color: rgba(220, 38, 38, 0.3);
          color: #dc2626;
        }

        [data-theme='light'] .ui-error-banner.is-warning {
          background: rgba(245, 158, 11, 0.07);
          border-color: rgba(217, 119, 6, 0.3);
          color: #b45309;
        }

        .error-icon-wrap {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .error-body {
          flex: 1;
          min-width: 0;
        }

        .error-title {
          display: block;
          font-size: var(--text-sm);
          font-weight: 700;
          margin-bottom: var(--space-1);
        }

        .error-message {
          font-size: var(--text-xs);
          line-height: 1.5;
          opacity: 0.85;
        }

        .error-suggestions {
          margin-top: var(--space-2);
          padding-left: var(--space-4);
          font-size: var(--text-xs);
          opacity: 0.8;
          line-height: 1.6;
        }

        .error-dismiss-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          opacity: 0.6;
          transition: opacity var(--duration-fast);
          margin-top: -2px;
        }

        .error-dismiss-btn:hover {
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .ui-error-banner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
