import React, { useState } from 'react';
import { Sparkles, FileText, Check, AlertTriangle, Palette } from 'lucide-react';
import { ImageFile, CompressOptions, OutputFormat } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';
import { formatBytes } from '../utils/formatters';

interface CompressPanelProps {
  imageFile: ImageFile;
  compressOptions: CompressOptions;
  onChange: (options: CompressOptions) => void;
  onApply: () => void;
  isProcessing?: boolean;
}

export const CompressPanel: React.FC<CompressPanelProps> = ({
  imageFile,
  compressOptions,
  onChange,
  onApply,
  isProcessing,
}) => {
  const { t } = useTranslation();
  const [customKbInput, setCustomKbInput] = useState<string>('');

  const targetSizePresets = [50, 100, 200, 500, 1000, 2000];

  const handleSelectPresetTarget = (kb: number) => {
    if (compressOptions.targetSizeKb === kb) {
      // Toggle off
      onChange({ ...compressOptions, targetSizeKb: null });
    } else {
      onChange({ ...compressOptions, targetSizeKb: kb });
    }
  };

  const handleCustomKbApply = () => {
    const num = parseInt(customKbInput, 10);
    if (!isNaN(num) && num > 0) {
      onChange({ ...compressOptions, targetSizeKb: num });
    }
  };

  const handleSmartCompress = () => {
    // Smart compress chooses WebP (or keeps PNG if has transparency and WebP is not desired),
    // and sets a balanced quality 82%
    onChange({
      ...compressOptions,
      format: 'image/webp',
      quality: 82,
      targetSizeKb: null,
    });
  };

  const isJpg = compressOptions.format === 'image/jpeg';
  const showTransparencyWarning = imageFile.hasTransparency && isJpg;

  return (
    <div className="tool-panel-content">
      <div className="panel-header">
        <h3 className="panel-title">{t.compress.title}</h3>
        <span className="current-stat font-mono">
          {t.original}: {formatBytes(imageFile.size)}
        </span>
      </div>

      {/* Smart Compress Action Card */}
      <div className="smart-compress-card">
        <div className="smart-left">
          <div className="smart-badge">
            <Sparkles size={16} />
            <span>{t.compress.smartCompress}</span>
          </div>
          <p className="smart-desc">{t.compress.smartCompressDesc}</p>
        </div>
        <button
          type="button"
          onClick={handleSmartCompress}
          className="btn-secondary smart-btn"
        >
          {t.apply}
        </button>
      </div>

      {/* Target Exact File Size (KB) */}
      <div className="target-size-section">
        <div className="section-head">
          <label className="input-label">{t.compress.targetSizeTitle}</label>
          {compressOptions.targetSizeKb && (
            <span className="target-badge font-mono">
              ≤ {compressOptions.targetSizeKb >= 1000 ? `${(compressOptions.targetSizeKb / 1000).toFixed(1)} MB` : `${compressOptions.targetSizeKb} KB`}
            </span>
          )}
        </div>
        <p className="section-subtext">{t.compress.targetSizeDesc}</p>

        <div className="target-presets-grid">
          {targetSizePresets.map((kb) => {
            const isActive = compressOptions.targetSizeKb === kb;
            const label = kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`;
            return (
              <button
                key={kb}
                type="button"
                className={`target-pill font-mono ${isActive ? 'is-active' : ''}`}
                onClick={() => handleSelectPresetTarget(kb)}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Custom KB Input */}
        <div className="custom-target-row">
          <div className="glowing-box custom-input-box">
            <input
              type="number"
              placeholder={t.compress.customKb}
              value={customKbInput}
              onChange={(e) => setCustomKbInput(e.target.value)}
              className="custom-field font-mono"
            />
          </div>
          <button
            type="button"
            onClick={handleCustomKbApply}
            className="btn-secondary custom-set-btn"
          >
            {t.save}
          </button>
          {compressOptions.targetSizeKb && (
            <button
              type="button"
              onClick={() => onChange({ ...compressOptions, targetSizeKb: null })}
              className="btn-ghost clear-target-btn"
            >
              {t.reset}
            </button>
          )}
        </div>
      </div>

      {/* Compression Quality Slider */}
      <div className="quality-slider-section">
        <div className="section-head">
          <label className="input-label">{t.compress.qualityLabel}</label>
          <span className="quality-value font-mono">{compressOptions.quality}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          value={compressOptions.quality}
          disabled={!!compressOptions.targetSizeKb}
          onChange={(e) =>
            onChange({ ...compressOptions, quality: parseInt(e.target.value, 10) })
          }
          className="custom-slider"
        />
        <div className="quality-markers font-mono">
          <span>10% Compact</span>
          <span>50% Balanced</span>
          <span>85% High</span>
          <span>100% Max</span>
        </div>
      </div>

      {/* Output Format Selector */}
      <div className="format-section">
        <label className="input-label">{t.convert.selectFormat}</label>
        <div className="format-pills-row">
          {(['image/webp', 'image/jpeg', 'image/png', 'image/avif'] as OutputFormat[]).map((fmt) => {
            const shortName = fmt.replace('image/', '').toUpperCase().replace('JPEG', 'JPG');
            const isActive = compressOptions.format === fmt;
            return (
              <button
                key={fmt}
                type="button"
                className={`pill-chip ${isActive ? 'is-active-primary' : ''}`}
                onClick={() => onChange({ ...compressOptions, format: fmt })}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transparency Safeguard & Matte Color Picker */}
      {showTransparencyWarning && (
        <div className="transparency-alert-card">
          <div className="alert-head">
            <AlertTriangle size={18} className="alert-icon" />
            <span className="alert-title">{t.convert.transparencyAlert}</span>
          </div>
          <div className="matte-picker-row">
            <span className="matte-label">{t.convert.matteColor}:</span>
            <div className="matte-options">
              <button
                type="button"
                className={`matte-btn ${compressOptions.matteColor === '#ffffff' ? 'is-active' : ''}`}
                onClick={() => onChange({ ...compressOptions, matteColor: '#ffffff' })}
              >
                <span className="color-dot white-dot" />
                <span>{t.convert.colorWhite}</span>
              </button>
              <button
                type="button"
                className={`matte-btn ${compressOptions.matteColor === '#000000' ? 'is-active' : ''}`}
                onClick={() => onChange({ ...compressOptions, matteColor: '#000000' })}
              >
                <span className="color-dot black-dot" />
                <span>{t.convert.colorBlack}</span>
              </button>
              <div className="custom-color-wrap">
                <input
                  type="color"
                  value={compressOptions.matteColor}
                  onChange={(e) => onChange({ ...compressOptions, matteColor: e.target.value })}
                  className="color-input"
                  title={t.convert.colorCustom}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Apply Button */}
      <button
        type="button"
        onClick={onApply}
        disabled={isProcessing}
        className="btn-primary-glow apply-btn"
      >
        <Check size={18} />
        <span>{isProcessing ? t.optimizing : t.apply}</span>
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

        .smart-compress-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.08));
          border: 1px solid rgba(139, 92, 246, 0.3);
          gap: var(--space-3);
        }

        .smart-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1-5);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-accent-purple);
          margin-bottom: var(--space-0-5);
        }

        .smart-desc {
          font-size: var(--text-2xs);
          color: var(--color-text-secondary);
        }

        .smart-btn {
          padding: var(--space-1-5) var(--space-3);
          min-height: 36px;
          font-size: var(--text-xs);
          white-space: nowrap;
        }

        .target-size-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .input-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .section-subtext {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
        }

        .target-badge {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
          background: var(--color-primary-subtle);
          padding: var(--space-0-5) var(--space-2);
          border-radius: var(--radius-xs);
        }

        .target-presets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-2);
          margin-top: var(--space-1);
        }

        .target-pill {
          padding: var(--space-2);
          min-height: 38px;
          font-size: var(--text-xs);
          font-weight: 600;
          border-radius: var(--radius-md);
          background: var(--color-bg-subtle);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-secondary);
          transition: all var(--duration-fast);
        }

        .target-pill:hover {
          border-color: var(--color-border-hover);
          color: var(--color-text-primary);
        }

        .target-pill.is-active {
          background: var(--color-accent-purple);
          color: #ffffff;
          border-color: transparent;
          box-shadow: var(--shadow-glow-purple);
        }

        .custom-target-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        .custom-input-box {
          flex: 1;
        }

        .custom-field {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: none;
          background: transparent;
          color: var(--color-text-primary);
          font-size: var(--text-xs);
          outline: none;
        }

        .custom-set-btn {
          min-height: 38px;
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-xs);
        }

        .clear-target-btn {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .quality-slider-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .quality-value {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
        }

        .quality-markers {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
        }

        .format-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-1-5);
        }

        .transparency-alert-card {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--space-3) var(--space-4);
        }

        .alert-head {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-accent-amber);
          margin-bottom: var(--space-2);
        }

        .alert-title {
          font-size: var(--text-xs);
          font-weight: 600;
        }

        .matte-picker-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .matte-label {
          font-size: var(--text-2xs);
          color: var(--color-text-secondary);
        }

        .matte-options {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .matte-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: var(--space-1) var(--space-2-5);
          border-radius: var(--radius-sm);
          font-size: var(--text-2xs);
          font-weight: 500;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-primary);
        }

        .matte-btn.is-active {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary);
        }

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.2);
        }

        .white-dot { background: #ffffff; }
        .black-dot { background: #000000; }

        .color-input {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          background: transparent;
        }

        .apply-btn {
          width: 100%;
          margin-top: var(--space-2);
        }
      `}</style>
    </div>
  );
};
