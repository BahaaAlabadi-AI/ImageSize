import React from 'react';
import { Sparkles, Camera, FileText, Globe, Shield, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { QuickWizard } from '../types/image';

interface GoalSelectorProps {
  onSelectGoal: (goal: QuickWizard) => void;
  activeGoal?: QuickWizard | null;
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({ onSelectGoal, activeGoal }) => {
  const { t } = useTranslation();

  const goals: Array<{
    id: QuickWizard;
    title: string;
    desc: string;
    icon: React.ReactNode;
    badge?: string;
    gradient: string;
  }> = [
    {
      id: 'make-under-200kb',
      title: t.goals.under200kb.title,
      desc: t.goals.under200kb.desc,
      icon: <FileText size={20} />,
      badge: '< 200 KB',
      gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))',
    },
    {
      id: 'instagram-1080',
      title: t.goals.instagram1080.title,
      desc: t.goals.instagram1080.desc,
      icon: <Camera size={20} />,
      badge: '1080×1080',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))',
    },
    {
      id: 'passport-35x45',
      title: t.goals.passport.title,
      desc: t.goals.passport.desc,
      icon: <Shield size={20} />,
      badge: '300 DPI',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))',
    },
    {
      id: 'website-ready',
      title: t.goals.website.title,
      desc: t.goals.website.desc,
      icon: <Globe size={20} />,
      badge: 'WebP',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(245,158,11,0.15))',
    },
    {
      id: 'remove-exif',
      title: t.goals.removeExif.title,
      desc: t.goals.removeExif.desc,
      icon: <Sparkles size={20} />,
      badge: 'Privacy',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))',
    },
  ];

  return (
    <section className="goal-selector-section">
      <div className="goal-header">
        <h2 className="goal-title">
          <Sparkles size={18} className="sparkle-icon" />
          {t.whatDoYouNeed}
        </h2>
        <span className="goal-hint">{t.appTagline}</span>
      </div>

      <div className="goal-grid">
        {goals.map((g) => {
          const isActive = activeGoal === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGoal(g.id)}
              className={`goal-card ${isActive ? 'is-active' : ''}`}
              style={{ '--goal-gradient': g.gradient } as React.CSSProperties}
              aria-label={`${g.title}: ${g.desc}`}
              aria-pressed={isActive}
            >
              <div className="goal-top">
                <span className="goal-icon-wrap">{g.icon}</span>
                {g.badge && <span className="goal-badge">{g.badge}</span>}
              </div>
              <h3 className="goal-card-title">{g.title}</h3>
              <p className="goal-card-desc">{g.desc}</p>
            </button>
          );
        })}
      </div>

      <style>{`
        .goal-selector-section {
          margin-bottom: var(--space-6);
        }

        .goal-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: var(--space-3);
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .goal-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .sparkle-icon {
          color: var(--color-accent-purple);
        }

        .goal-hint {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .goal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: var(--space-3);
        }

        .goal-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: start;
          padding: var(--space-4);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          transition: transform var(--duration-fast) var(--ease-spring),
                      border-color var(--duration-fast) var(--ease-spring),
                      box-shadow var(--duration-fast) var(--ease-spring);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .goal-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--goal-gradient);
          opacity: 0;
          transition: opacity var(--duration-fast);
          pointer-events: none;
        }

        .goal-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-border-hover);
          box-shadow: var(--shadow-md);
        }

        .goal-card:hover::before {
          opacity: 1;
        }

        .goal-card.is-active {
          border-color: var(--color-accent-purple);
          background: var(--color-bg-surface-hover);
          box-shadow: var(--shadow-glow-purple);
        }

        .goal-card.is-active::before {
          opacity: 1;
        }

        .goal-top {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
          z-index: 1;
        }

        .goal-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-default);
        }

        .goal-badge {
          font-size: var(--text-2xs);
          font-weight: 700;
          font-family: var(--font-mono);
          padding: var(--space-0-5) var(--space-2);
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-text-secondary);
        }

        .goal-card-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.3;
          margin-bottom: var(--space-1);
          z-index: 1;
        }

        .goal-card-desc {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          line-height: 1.4;
          z-index: 1;
        }
      `}</style>
    </section>
  );
};
