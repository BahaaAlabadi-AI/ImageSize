import React, { useState } from 'react';
import { Share2, Printer, Globe, Check, Calculator } from 'lucide-react';
import { PRESETS_DATA } from '../data/presets';
import { PresetCategory, PresetItem } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';
import { parseDpiDimensions } from '../utils/formatters';

interface PresetPickerProps {
  onSelectPreset: (width: number, height: number, name: string) => void;
  activeWidth?: number;
  activeHeight?: number;
}

export const PresetPicker: React.FC<PresetPickerProps> = ({
  onSelectPreset,
  activeWidth,
  activeHeight,
}) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<PresetCategory>('social');

  // DPI Calculator State
  const [dpiUnit, setDpiUnit] = useState<'in' | 'mm'>('mm');
  const [dpiWidth, setDpiWidth] = useState<number>(35);
  const [dpiHeight, setDpiHeight] = useState<number>(45);
  const [dpiVal, setDpiVal] = useState<number>(300);

  const filteredPresets = PRESETS_DATA.filter((p) => p.category === activeCategory);

  const handleApplyDpiCalc = () => {
    const { pxWidth, pxHeight } = parseDpiDimensions(dpiUnit, dpiWidth, dpiHeight, dpiVal);
    onSelectPreset(pxWidth, pxHeight, `${dpiWidth}×${dpiHeight} ${dpiUnit} @ ${dpiVal} DPI`);
  };

  const calculatedPx = parseDpiDimensions(dpiUnit, dpiWidth, dpiHeight, dpiVal);

  return (
    <div className="tool-panel-content">
      <div className="panel-header">
        <h3 className="panel-title">{t.presets.title}</h3>
      </div>

      {/* Category Tabs */}
      <div className="preset-tabs">
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'social' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('social')}
        >
          <Share2 size={16} />
          <span>{t.presets.tabSocial}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'print' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('print')}
        >
          <Printer size={16} />
          <span>{t.presets.tabPrint}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'web' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('web')}
        >
          <Globe size={16} />
          <span>{t.presets.tabWeb}</span>
        </button>
      </div>

      {/* Preset Cards List */}
      <div className="presets-scroll-list">
        {filteredPresets.map((item) => {
          const isCurrent = activeWidth === item.width && activeHeight === item.height;
          return (
            <div
              key={item.id}
              className={`preset-card ${isCurrent ? 'is-active' : ''}`}
              onClick={() => onSelectPreset(item.width, item.height, item.name)}
            >
              <div className="preset-top">
                <div className="preset-title-wrap">
                  <span className="preset-name">{item.name}</span>
                  {item.platform && <span className="preset-platform">{item.platform}</span>}
                </div>
                {item.badge && <span className="preset-badge">{item.badge}</span>}
              </div>

              <p className="preset-desc">{item.description}</p>

              <div className="preset-bottom">
                <span className="preset-dims font-mono">
                  {item.width} × {item.height} px
                </span>
                <span className="preset-ratio font-mono">{item.aspectRatio}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Physical DPI Calculator (Only in Print tab) */}
      {activeCategory === 'print' && (
        <div className="dpi-calculator-card">
          <div className="dpi-card-head">
            <Calculator size={16} className="calc-icon" />
            <span className="dpi-card-title">Custom Print & DPI Calculator</span>
          </div>

          <div className="dpi-inputs-grid">
            <div className="dpi-input-wrap">
              <label className="dpi-label">Unit</label>
              <select
                value={dpiUnit}
                onChange={(e) => setDpiUnit(e.target.value as 'in' | 'mm')}
                className="dpi-select"
              >
                <option value="mm">Millimeters (mm)</option>
                <option value="in">Inches (in)</option>
              </select>
            </div>

            <div className="dpi-input-wrap">
              <label className="dpi-label">Width</label>
              <input
                type="number"
                value={dpiWidth}
                onChange={(e) => setDpiWidth(parseFloat(e.target.value) || 0)}
                className="dpi-input font-mono"
              />
            </div>

            <div className="dpi-input-wrap">
              <label className="dpi-label">Height</label>
              <input
                type="number"
                value={dpiHeight}
                onChange={(e) => setDpiHeight(parseFloat(e.target.value) || 0)}
                className="dpi-input font-mono"
              />
            </div>

            <div className="dpi-input-wrap">
              <label className="dpi-label">DPI</label>
              <select
                value={dpiVal}
                onChange={(e) => setDpiVal(parseInt(e.target.value, 10))}
                className="dpi-select"
              >
                <option value="300">300 DPI (Photo / Print)</option>
                <option value="150">150 DPI (Draft / Poster)</option>
                <option value="72">72 DPI (Legacy Screen)</option>
              </select>
            </div>
          </div>

          <div className="dpi-calc-result">
            <div className="calc-stat">
              <span className="calc-label">Calculated Pixels:</span>
              <span className="calc-px font-mono">
                {calculatedPx.pxWidth} × {calculatedPx.pxHeight} px
              </span>
            </div>
            <button
              type="button"
              onClick={handleApplyDpiCalc}
              className="btn-secondary apply-dpi-btn"
            >
              {t.presets.applyPreset}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .tool-panel-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .panel-header {
          border-bottom: 1px solid var(--color-border-subtle);
          padding-bottom: var(--space-3);
        }

        .panel-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .preset-tabs {
          display: flex;
          gap: var(--space-2);
          background: var(--color-bg-subtle);
          padding: var(--space-1);
          border-radius: var(--radius-lg);
        }

        .tab-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          min-height: 38px;
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-secondary);
          transition: background-color var(--duration-fast),
                      color var(--duration-fast),
                      box-shadow var(--duration-fast);
        }

        .tab-btn:hover {
          color: var(--color-text-primary);
        }

        .tab-btn.is-active {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
          box-shadow: var(--shadow-sm);
        }

        .presets-scroll-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2-5);
          max-height: 360px;
          overflow-y: auto;
          padding-right: var(--space-1);
        }

        .preset-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-1-5);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          cursor: pointer;
          transition: border-color var(--duration-fast),
                      background-color var(--duration-fast),
                      transform var(--duration-fast),
                      box-shadow var(--duration-fast);
        }

        .preset-card:hover {
          border-color: var(--color-border-hover);
          background: var(--color-bg-surface-hover);
          transform: translateY(-1px);
        }

        .preset-card.is-active {
          border-color: var(--color-primary);
          background: var(--color-primary-subtle);
        }

        .preset-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preset-title-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .preset-name {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .preset-platform {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
          background: var(--color-bg-subtle);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }

        .preset-badge {
          font-size: var(--text-2xs);
          font-weight: 700;
          color: var(--color-accent-purple);
          background: rgba(139, 92, 246, 0.12);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .preset-desc {
          font-size: var(--text-2xs);
          color: var(--color-text-secondary);
          line-height: 1.3;
        }

        .preset-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-1);
          border-top: 1px dashed var(--color-border-subtle);
        }

        .preset-dims {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
        }

        .preset-ratio {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
        }

        .dpi-calculator-card {
          background: var(--color-bg-subtle);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-3) var(--space-4);
          margin-top: var(--space-2);
        }

        .dpi-card-head {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .calc-icon {
          color: var(--color-accent-purple);
        }

        .dpi-inputs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .dpi-input-wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .dpi-label {
          font-size: var(--text-2xs);
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .dpi-input, .dpi-select {
          padding: var(--space-2);
          border-radius: var(--radius-md);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-primary);
          font-size: var(--text-xs);
          outline: none;
        }

        .dpi-calc-result {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-2);
          border-top: 1px solid var(--color-border-subtle);
        }

        .calc-stat {
          display: flex;
          flex-direction: column;
        }

        .calc-label {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
        }

        .calc-px {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-accent-emerald);
        }

        .apply-dpi-btn {
          min-height: 36px;
          padding: var(--space-1-5) var(--space-3);
          font-size: var(--text-xs);
        }
      `}</style>
    </div>
  );
};
