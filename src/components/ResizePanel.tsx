import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, Sliders, Check } from 'lucide-react';
import { ImageFile, ResizeOptions, ResizeFitMode } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';

interface ResizePanelProps {
  imageFile: ImageFile;
  resizeOptions: ResizeOptions;
  onChange: (options: ResizeOptions) => void;
  onApply: () => void;
}

export const ResizePanel: React.FC<ResizePanelProps> = ({
  imageFile,
  resizeOptions,
  onChange,
  onApply,
}) => {
  const { t } = useTranslation();

  const handleWidthChange = (val: number) => {
    const w = Math.max(1, isNaN(val) ? 1 : val);
    if (resizeOptions.lockAspectRatio) {
      const aspect = imageFile.width / imageFile.height;
      const h = Math.round(w / aspect);
      onChange({ ...resizeOptions, width: w, height: h, usePercentage: false });
    } else {
      onChange({ ...resizeOptions, width: w, usePercentage: false });
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, isNaN(val) ? 1 : val);
    if (resizeOptions.lockAspectRatio) {
      const aspect = imageFile.width / imageFile.height;
      const w = Math.round(h * aspect);
      onChange({ ...resizeOptions, width: w, height: h, usePercentage: false });
    } else {
      onChange({ ...resizeOptions, height: h, usePercentage: false });
    }
  };

  const handlePercentageChange = (pct: number) => {
    const factor = pct / 100;
    const w = Math.round(imageFile.width * factor);
    const h = Math.round(imageFile.height * factor);
    onChange({
      ...resizeOptions,
      percentage: pct,
      usePercentage: true,
      width: w,
      height: h,
    });
  };

  const percentagePresets = [25, 50, 75, 100, 150, 200];

  return (
    <div className="tool-panel-content">
      <div className="panel-header">
        <h3 className="panel-title">{t.resize.title}</h3>
        <span className="current-stat font-mono">
          {imageFile.width} × {imageFile.height} px
        </span>
      </div>

      {/* Exact Pixel Inputs with Aspect Lock Toggle */}
      <div className="dimension-inputs-row">
        <div className="input-group">
          <label className="input-label">{t.resize.width}</label>
          <div className="glowing-box input-box">
            <input
              type="number"
              min="1"
              max="16000"
              value={resizeOptions.width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value, 10))}
              className="dimension-field font-mono"
            />
          </div>
        </div>

        {/* Lock Aspect Ratio Button */}
        <button
          type="button"
          className={`lock-aspect-btn ${resizeOptions.lockAspectRatio ? 'is-locked' : ''}`}
          onClick={() =>
            onChange({ ...resizeOptions, lockAspectRatio: !resizeOptions.lockAspectRatio })
          }
          title={t.resize.lockAspectDesc}
          aria-label={t.resize.lockAspect}
        >
          {resizeOptions.lockAspectRatio ? <Lock size={18} /> : <Unlock size={18} />}
        </button>

        <div className="input-group">
          <label className="input-label">{t.resize.height}</label>
          <div className="glowing-box input-box">
            <input
              type="number"
              min="1"
              max="16000"
              value={resizeOptions.height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value, 10))}
              className="dimension-field font-mono"
            />
          </div>
        </div>
      </div>

      {/* Percentage Resize Slider & Quick Chips */}
      <div className="percentage-section">
        <div className="section-head">
          <label className="input-label">{t.resize.percentage}</label>
          <span className="percent-badge font-mono">{resizeOptions.percentage}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={resizeOptions.percentage}
          onChange={(e) => handlePercentageChange(parseInt(e.target.value, 10))}
          className="custom-slider"
        />
        <div className="preset-chips">
          {percentagePresets.map((pct) => (
            <button
              key={pct}
              type="button"
              className={`pill-chip font-mono ${resizeOptions.percentage === pct && resizeOptions.usePercentage ? 'is-active-primary' : ''}`}
              onClick={() => handlePercentageChange(pct)}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Prevent Enlargement Safeguard Toggle */}
      <div className="toggle-row">
        <label className="toggle-label-wrap">
          <div className="switch-toggle">
            <input
              type="checkbox"
              checked={resizeOptions.preventEnlargement}
              onChange={(e) =>
                onChange({ ...resizeOptions, preventEnlargement: e.target.checked })
              }
            />
            <span className="switch-track" />
          </div>
          <div>
            <span className="toggle-text-primary">{t.resize.preventEnlarge}</span>
            <p className="toggle-text-desc">{t.resize.preventEnlargeDesc}</p>
          </div>
        </label>
      </div>

      {/* Sizing Behavior Fit Modes */}
      <div className="fit-mode-section">
        <label className="input-label">{t.resize.fitMode}</label>
        <div className="fit-modes-grid">
          {(['fit', 'fill', 'crop-to-fit', 'exact'] as ResizeFitMode[]).map((m) => {
            const labels: Record<ResizeFitMode, string> = {
              fit: t.resize.modeFit,
              fill: t.resize.modeFill,
              'crop-to-fit': t.resize.modeCrop,
              exact: t.resize.modeExact,
            };
            return (
              <button
                key={m}
                type="button"
                className={`fit-pill ${resizeOptions.mode === m ? 'is-active' : ''}`}
                onClick={() => onChange({ ...resizeOptions, mode: m })}
                aria-pressed={resizeOptions.mode === m}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>
        {resizeOptions.mode === 'exact' && (
          <div className="exact-mode-warning" role="alert">
            <ShieldAlert size={14} />
            <span>Exact mode stretches the image — aspect ratio will be distorted.</span>
          </div>
        )}
      </div>

      {/* Primary Apply Action */}
      <button type="button" onClick={onApply} className="btn-primary-glow apply-btn">
        <Check size={18} />
        <span>{t.resize.applyResize}</span>
      </button>

      <style>{`
        .tool-panel-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
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

        .current-stat {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          background: var(--color-bg-subtle);
          padding: var(--space-1) var(--space-2-5);
          border-radius: var(--radius-xs);
        }

        .dimension-inputs-row {
          display: flex;
          align-items: flex-end;
          gap: var(--space-3);
        }

        .input-group {
          flex: 1;
        }

        .input-label {
          display: block;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1-5);
        }

        .input-box {
          display: flex;
          align-items: center;
        }

        .dimension-field {
          width: 100%;
          padding: var(--space-2-5) var(--space-3);
          border: none;
          background: transparent;
          color: var(--color-text-primary);
          font-size: var(--text-sm);
          font-weight: 600;
          outline: none;
        }

        .lock-aspect-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          border-radius: var(--radius-lg);
          background: var(--color-bg-subtle);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-secondary);
          transition: border-color var(--duration-fast),
                      color var(--duration-fast),
                      background-color var(--duration-fast);
          margin-bottom: 1px;
        }

        .lock-aspect-btn:hover {
          border-color: var(--color-border-hover);
          color: var(--color-text-primary);
        }

        .lock-aspect-btn.is-locked {
          background: var(--color-primary-subtle);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .percentage-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .percent-badge {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
        }

        .preset-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1-5);
          margin-top: var(--space-1);
        }

        .preset-chips .pill-chip {
          min-height: 32px;
          padding: var(--space-1) var(--space-3);
          font-size: var(--text-xs);
        }

        .toggle-row {
          background: var(--color-bg-subtle);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-subtle);
        }

        .toggle-label-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          cursor: pointer;
        }

        .toggle-text-primary {
          display: block;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .toggle-text-desc {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
        }

        .fit-modes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-2);
        }

        .fit-pill {
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-xs);
          font-weight: 500;
          border-radius: var(--radius-md);
          background: var(--color-bg-subtle);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-secondary);
          text-align: center;
          transition: background-color var(--duration-fast),
                      border-color var(--duration-fast),
                      color var(--duration-fast),
                      box-shadow var(--duration-fast);
        }

        .fit-pill:hover {
          color: var(--color-text-primary);
          border-color: var(--color-border-hover);
        }

        .fit-pill.is-active {
          background: var(--color-accent-purple);
          border-color: transparent;
          color: #ffffff;
          box-shadow: var(--shadow-glow-purple);
        }

        .exact-mode-warning {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #f59e0b;
          font-size: var(--text-2xs);
          font-weight: 500;
          line-height: 1.4;
        }

        .apply-btn {
          width: 100%;
          margin-top: var(--space-2);
        }
      `}</style>
    </div>
  );
};
