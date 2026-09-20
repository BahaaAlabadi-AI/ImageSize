import React from 'react';
import { ShieldCheck, Moon, Sun, Globe } from 'lucide-react';
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
          <div className="logo-emblem" aria-hidden="true">
            {/* Precision Optical Aperture & Crop Reticle SVG */}
            <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
              <rect x="3" y="3" width="42" height="42" rx="8" fill="url(#studioGrad)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
              {/* Corner Crop Marks */}
              <path d="M12 18V13H17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M36 18V13H31" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 30V35H17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M36 30V35H31" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Center Optical Sensor & Amber Focus Pip */}
              <circle cx="24" cy="24" r="5" stroke="#ffffff" strokeWidth="1.75" strokeDasharray="3 2" />
              <circle cx="24" cy="24" r="2" fill="#f59e0b" />
              <defs>
                <linearGradient id="studioGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e40af" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text-col">
            <span className="brand-title">{t.appName}</span>
            <span className="brand-subtitle">{t.noAccount}</span>
          </div>
        </div>

        {/* Right Actions: Privacy Badge, Theme & Language Toggle */}
        <div className="header-actions">
          {/* Privacy Badge */}
          <div className="privacy-badge" title={t.privacyNotice}>
            <ShieldCheck size={14} className="badge-icon" />
            <span className="badge-text">{t.privacyBadge}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="icon-btn"
            title={t.themeToggle}
            aria-label={t.themeToggle}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="lang-btn"
            title={t.langToggle}
            aria-label={t.langToggle}
          >
            <Globe size={15} />
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
          border-bottom: 1px solid var(--color-border-subtle);
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
          cursor: default;
        }

        .logo-emblem {
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.35));
          transition: transform var(--duration-fast) var(--ease-spring);
        }

        .brand-group:hover .logo-emblem {
          transform: scale(1.04);
        }

        .brand-text-col {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-display);
          font-size: var(--text-sm);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--color-text-primary);
          line-height: 1.25;
        }

        .brand-subtitle {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
          font-weight: 500;
          font-family: var(--font-sans);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2-5);
        }

        .privacy-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--color-accent-emerald);
          font-size: var(--text-xs);
          font-weight: 600;
          font-family: var(--font-mono);
          user-select: none;
        }

        .badge-icon {
          color: var(--color-accent-emerald);
          flex-shrink: 0;
        }

        .icon-btn, .lang-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1-5);
          min-height: 34px;
          min-width: 34px;
          padding: 0 var(--space-2-5);
          border-radius: var(--radius-sm);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-primary);
          transition: background-color var(--duration-fast) var(--ease-smooth),
                      border-color var(--duration-fast) var(--ease-smooth);
        }

        .icon-btn:hover, .lang-btn:hover {
          background: var(--color-bg-surface-hover);
          border-color: var(--color-border-hover);
        }

        .lang-label {
          font-size: var(--text-xs);
          font-weight: 600;
          font-family: var(--font-sans);
        }

        @media (max-width: 768px) {
          .privacy-badge {
            display: none;
          }
          .header-container {
            padding: var(--space-2) var(--space-4);
          }
        }
      `}</style>
    </header>
  );
};
