import React from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';
import { TransformOptions } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';

interface TransformPanelProps {
  transform: TransformOptions;
  onChange: (transform: TransformOptions) => void;
  onApply: () => void;
}

export const TransformPanel: React.FC<TransformPanelProps> = ({
  transform,
  onChange,
  onApply,
}) => {
  const { t } = useTranslation();

  const handleRotateLeft = () => {
    const next = (transform.rotate + 270) % 360;
    onChange({ ...transform, rotate: next });
  };

  const handleRotateRight = () => {
    const next = (transform.rotate + 90) % 360;
    onChange({ ...transform, rotate: next });
  };

  const handleRotate180 = () => {
    const next = (transform.rotate + 180) % 360;
    onChange({ ...transform, rotate: next });
  };

  const handleFlipH = () => {
    onChange({ ...transform, flipH: !transform.flipH });
  };

  const handleFlipV = () => {
    onChange({ ...transform, flipV: !transform.flipV });
  };

  const handleReset = () => {
    onChange({ rotate: 0, flipH: false, flipV: false });
  };

  return (
    <div className="tool-panel-content">
      <div className="panel-header">
        <h3 className="panel-title">{t.rotate.title}</h3>
        <button type="button" onClick={handleReset} className="btn-ghost reset-btn">
          <RefreshCw size={14} />
          <span>{t.reset}</span>
        </button>
      </div>

      <div className="transform-actions-grid">
        <button type="button" onClick={handleRotateLeft} className="transform-btn">
          <RotateCcw size={20} />
          <span>{t.rotate.rotateLeft}</span>
        </button>

        <button type="button" onClick={handleRotateRight} className="transform-btn">
          <RotateCw size={20} />
          <span>{t.rotate.rotateRight}</span>
        </button>

        <button type="button" onClick={handleRotate180} className="transform-btn">
          <RefreshCw size={20} />
          <span>{t.rotate.rotate180}</span>
        </button>

        <button
          type="button"
          onClick={handleFlipH}
          className={`transform-btn ${transform.flipH ? 'is-active' : ''}`}
          aria-pressed={transform.flipH}
        >
          <FlipHorizontal size={20} />
          <span>{t.rotate.flipH}</span>
        </button>

        <button
          type="button"
          onClick={handleFlipV}
          className={`transform-btn ${transform.flipV ? 'is-active' : ''}`}
          aria-pressed={transform.flipV}
        >
          <FlipVertical size={20} />
          <span>{t.rotate.flipV}</span>
        </button>
      </div>

      <button type="button" onClick={onApply} className="btn-primary-glow apply-btn">
        <span>{t.apply}</span>
      </button>

      <style>{`
        .tool-panel-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border-subtle);
          padding-bottom: var(--space-3);
        }

        .panel-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .reset-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
        }

        .transform-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-2-5);
        }

        .transform-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-2);
          border-radius: var(--radius-lg);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-secondary);
          transition: border-color var(--duration-fast),
                      color var(--duration-fast),
                      transform var(--duration-fast),
                      box-shadow var(--duration-fast);
          min-height: 80px;
        }

        .transform-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-text-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .transform-btn.is-active {
          background: var(--color-primary-subtle);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .transform-btn span {
          font-size: var(--text-xs);
          font-weight: 600;
        }

        .apply-btn {
          width: 100%;
          margin-top: var(--space-2);
        }
      `}</style>
    </div>
  );
};
