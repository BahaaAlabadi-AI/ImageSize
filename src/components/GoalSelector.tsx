import React from 'react';
import { SlidersHorizontal, Camera, FileCheck2, Globe2, ShieldCheck, Zap } from 'lucide-react';
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
    tag: string;
    featured?: boolean;
  }> = [
    {
      id: 'make-under-200kb',
      title: t.goals.under200kb.title,
      desc: t.goals.under200kb.desc,
      icon: <FileCheck2 size={18} />,
      tag: '< 200 KB',
      featured: true, // Prominent technical workflow
    },
    {
      id: 'passport-35x45',
      title: t.goals.passport.title,
      desc: t.goals.passport.desc,
      icon: <Camera size={18} />,
      tag: '300 DPI',
      featured: true,
    },
    {
      id: 'instagram-1080',
      title: t.goals.instagram1080.title,
      desc: t.goals.instagram1080.desc,
      icon: <Zap size={18} />,
      tag: '1080×1080',
    },
    {
      id: 'website-ready',
      title: t.goals.website.title,
      desc: t.goals.website.desc,
      icon: <Globe2 size={18} />,
      tag: 'WebP',
    },
    {
      id: 'remove-exif',
      title: t.goals.removeExif.title,
      desc: t.goals.removeExif.desc,
      icon: <ShieldCheck size={18} />,
      tag: 'Metadata',
    },
  ];

  return (
    <section className="goal-selector-section" aria-label="Preset Workflows">
      <div className="goal-header">
        <div className="goal-title-group">
          <div className="reticle-icon-wrap" aria-hidden="true">
            <SlidersHorizontal size={15} />
          </div>
          <h2 className="goal-title">{t.whatDoYouNeed}</h2>
        </div>
        <span className="goal-hint">{t.appTagline}</span>
      </div>

      <div className="goal-grid">
        {goals.map((g) => {
          const isActive = activeGoal === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGoal(g.id)}
              className={`goal-card ${g.featured ? 'is-featured' : ''} ${isActive ? 'is-active' : ''}`}
              aria-label={`${g.title}: ${g.desc}`}
              aria-pressed={isActive}
            >
              <div className="goal-top">
                <div className="goal-icon-wrap">{g.icon}</div>
                <span className="goal-tag">{g.tag}</span>
              </div>
              <div className="goal-text">
                <h3 className="goal-card-title">{g.title}</h3>
                <p className="goal-card-desc">{g.desc}</p>
              </div>
              {isActive && <div className="active-dot" aria-hidden="true" />}
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
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .goal-title-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .reticle-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: var(--radius-xs);
          background: var(--color-primary-subtle);
          color: var(--color-primary);
        }

        .goal-title {
          font-family: var(--font-display);
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .goal-hint {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }

        /* Asymmetric, tiered action grid (Breaks 5 identical cards slop) */
        .goal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-3);
        }

        .goal-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: start;
          padding: var(--space-3-5, 0.875rem) var(--space-4);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: transform var(--duration-fast) var(--ease-spring),
                      border-color var(--duration-fast) var(--ease-smooth),
                      background-color var(--duration-fast) var(--ease-smooth),
                      box-shadow var(--duration-fast) var(--ease-smooth);
          cursor: pointer;
        }

        .goal-card.is-featured {
          border-inline-start: 3px solid var(--color-primary);
        }

        .goal-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-border-hover);
          background: var(--color-bg-surface-hover);
          box-shadow: var(--shadow-md);
        }

        .goal-card.is-active {
          border-color: var(--color-primary);
          background: var(--color-bg-elevated);
          box-shadow: var(--shadow-glow);
        }

        .goal-card.is-active.is-featured {
          border-inline-start-color: var(--color-accent-amber);
        }

        .goal-top {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-2-5);
        }

        .goal-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          background: var(--color-bg-subtle);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-subtle);
          transition: background-color var(--duration-fast);
        }

        .goal-card.is-active .goal-icon-wrap {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }

        .goal-tag {
          font-size: var(--text-2xs);
          font-weight: 600;
          font-family: var(--font-mono);
          padding: 2px 7px;
          border-radius: var(--radius-xs);
          background: var(--color-bg-subtle);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-secondary);
        }

        .goal-card.is-active .goal-tag {
          border-color: rgba(37, 99, 235, 0.4);
          color: var(--color-primary);
          background: var(--color-primary-subtle);
        }

        .goal-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .goal-card-title {
          font-family: var(--font-display);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.3;
          margin: 0;
        }

        .goal-card-desc {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          line-height: 1.35;
          margin: 0;
        }

        .active-dot {
          position: absolute;
          top: 8px;
          inset-inline-end: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 6px var(--color-primary);
        }

        @media (max-width: 640px) {
          .goal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
