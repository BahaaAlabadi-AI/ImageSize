import React from 'react';
import { ShieldCheck, Moon, Sun, Globe, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenPrivacyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const { t, lang, toggleLang } = useTranslation();

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo & Name */}
        <div className="brand-group">
          <div className="logo-emblem">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="40" height="40" rx="10" fill="url(#logoGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
              <path d="M12 18V14C14 14 16 14 18 14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M36 18V14C34 14 32 14 30 14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12 30V34C14 34 16 34 18 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M36 30V34C34 34 32 34 30 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="24" r="3" fill="#ffffff" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">{t.appName}</h1>
            <p className="brand-subtitle">{t.noAccount}</p>
          </div>
        </div>

        {/* Right Actions: Privacy Badge, Theme & Language Toggle */}
        <div className="header-actions">
          {/* Privacy Badge */}
          <div className="privacy-badge" title={t.privacyNotice}>
            <ShieldCheck size={16} className="badge-icon" />
            <span className="badge-text">{t.privacyBadge}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="icon-btn"
            title={t.themeToggle}
            aria-label={t.themeToggle}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="lang-btn"
            title={t.langToggle}
            aria-label={t.langToggle}
          >
            <Globe size={16} />
            <span className="lang-label">{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </div>

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          -webkit-backdrop-filter: var(--glass-backdrop);
          border-bottom: var(--glass-border);
          transition: background-color var(--duration-normal);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-3) var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .logo-emblem {
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.4));
          transition: transform var(--duration-fast) var(--ease-spring);
        }

        .brand-group:hover .logo-emblem {
          transform: rotate(5deg) scale(1.05);
        }

        .brand-title {
          font-size: var(--text-base);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .privacy-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1-5) var(--space-3);
          border-radius: var(--radius-full);
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--color-accent-emerald);
          font-size: var(--text-xs);
          font-weight: 600;
          user-select: none;
        }

        .badge-icon {
          color: var(--color-accent-emerald);
        }

        .icon-btn, .lang-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          min-height: 38px;
          min-width: 38px;
          padding: 0 var(--space-3);
          border-radius: var(--radius-md);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-primary);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .icon-btn:hover, .lang-btn:hover {
          background: var(--color-bg-surface-hover);
          border-color: var(--color-border-hover);
          transform: translateY(-1px);
        }

        .lang-label {
          font-size: var(--text-xs);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .privacy-badge {
            display: none;
          }
          .header-container {
            padding: var(--space-2-5) var(--space-4);
          }
          .brand-title {
            font-size: var(--text-sm);
          }
        }
      `}</style>
    </header>
  );
};
