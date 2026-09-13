import React, { useState, useRef } from 'react';
import { Download, Check, Sparkles, ArrowRight, Layers, SplitSquareVertical } from 'lucide-react';
import { ImageFile, ProcessedResult } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';
import { formatBytes } from '../utils/formatters';
import { triggerBlobDownload } from '../utils/download';

interface ComparisonViewProps {
  original: ImageFile;
  result: ProcessedResult;
  onDownload?: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  original,
  result,
}) => {
  const { t } = useTranslation();
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [viewMode, setViewMode] = useState<'split' | 'side'>('split');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  const handleDownload = () => {
    triggerBlobDownload(result.blob, result.filename);
  };

  const isSmaller = result.reductionBytes > 0;

  return (
    <div className="comparison-container glass-panel">
      {/* Header Bar with View Toggle & Download Action */}
      <div className="comp-header">
        <div className="comp-title-group">
          <Sparkles size={18} className="sparkle-icon" />
          <h3 className="comp-title">{t.result}</h3>
          <span className="duration-badge font-mono">{result.durationMs}ms</span>
        </div>

        <div className="comp-top-actions">
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'split' ? 'is-active' : ''}`}
              onClick={() => setViewMode('split')}
              title={t.stats.splitView}
            >
              <SplitSquareVertical size={16} />
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'side' ? 'is-active' : ''}`}
              onClick={() => setViewMode('side')}
              title={t.stats.sideBySide}
            >
              <Layers size={16} />
            </button>
          </div>

          <button type="button" onClick={handleDownload} className="btn-primary-glow download-btn">
            <Download size={16} />
            <span>{t.download}</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="comp-viewport-wrap">
        {viewMode === 'split' ? (
          <div
            className="split-slider-stage"
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* After (Result) Layer (Full) */}
            <div className="stage-layer after-layer">
              <img src={result.dataUrl} alt="Result preview" draggable={false} />
              <span className="layer-tag after-tag font-mono">{t.result}</span>
            </div>

            {/* Before (Original) Layer (Clipped) */}
            <div
              className="stage-layer before-layer"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img src={original.dataUrl} alt="Original preview" draggable={false} />
              <span className="layer-tag before-tag font-mono">{t.original}</span>
            </div>

            {/* Draggable Divider Handle */}
            <div className="split-divider" style={{ left: `${sliderPos}%` }}>
              <div className="divider-line" />
              <div className="divider-handle">
                <span className="handle-arrow">◀</span>
                <span className="handle-arrow">▶</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="side-by-side-stage">
            <div className="side-card">
              <span className="side-tag font-mono">{t.original}</span>
              <img src={original.dataUrl} alt="Original" />
            </div>
            <div className="side-card">
              <span className="side-tag font-mono after-tag">{t.result}</span>
              <img src={result.dataUrl} alt="Result" />
            </div>
          </div>
        )}
      </div>

      {/* Delta Metrics Bar */}
      <div className="comp-metrics-bar">
        {/* Dimensions Stat */}
        <div className="metric-box">
          <span className="metric-label">{t.stats.dimensions}</span>
          <div className="metric-flow font-mono">
            <span className="metric-before">{original.width}×{original.height}</span>
            <ArrowRight size={14} className="flow-arrow" />
            <span className="metric-after">{result.width}×{result.height}</span>
          </div>
        </div>

        {/* File Size Stat */}
        <div className="metric-box">
          <span className="metric-label">{t.stats.fileSize}</span>
          <div className="metric-flow font-mono">
            <span className="metric-before">{formatBytes(original.size)}</span>
            <ArrowRight size={14} className="flow-arrow" />
            <span className="metric-after">{formatBytes(result.size)}</span>
          </div>
        </div>

        {/* Format Stat */}
        <div className="metric-box">
          <span className="metric-label">{t.stats.format}</span>
          <div className="metric-flow font-mono">
            <span className="metric-before">{original.type.replace('image/', '').toUpperCase()}</span>
            <ArrowRight size={14} className="flow-arrow" />
            <span className="metric-after">{result.format.replace('image/', '').toUpperCase()}</span>
          </div>
        </div>

        {/* Savings Badge */}
        {isSmaller && (
          <div className="savings-badge-box">
            <span className="savings-title">{t.stats.savings}</span>
            <span className="savings-val font-mono">
              {result.compressionRatio}% {t.stats.reduction}
            </span>
          </div>
        )}
      </div>

      <style>{`
        .comparison-container {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          margin-top: var(--space-6);
        }

        .comp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--color-border-subtle);
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .comp-title-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .sparkle-icon {
          color: var(--color-accent-purple);
        }

        .comp-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .duration-badge {
          font-size: var(--text-2xs);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          background: var(--color-bg-subtle);
          color: var(--color-text-muted);
        }

        .comp-top-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .mode-toggle-group {
          display: flex;
          background: var(--color-bg-subtle);
          padding: 2px;
          border-radius: var(--radius-md);
        }

        .mode-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          transition: all var(--duration-fast);
        }

        .mode-btn.is-active {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
          box-shadow: var(--shadow-sm);
        }

        .download-btn {
          min-height: 40px;
          padding: var(--space-2) var(--space-5);
          font-size: var(--text-xs);
        }

        .comp-viewport-wrap {
          position: relative;
          background: #090a0f;
          min-height: 340px;
          max-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .split-slider-stage {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 340px;
          max-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ew-resize;
          user-select: none;
          touch-action: none;
        }

        .stage-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stage-layer img {
          max-width: 90%;
          max-height: 440px;
          object-fit: contain;
          pointer-events: none;
        }

        .layer-tag {
          position: absolute;
          bottom: var(--space-3);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-2xs);
          font-weight: 700;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 5;
        }

        .before-tag {
          left: var(--space-4);
        }

        .after-tag {
          right: var(--space-4);
          background: rgba(139, 92, 246, 0.75);
          border-color: rgba(139, 92, 246, 0.4);
        }

        .split-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          transform: translateX(-50%);
          z-index: 10;
          pointer-events: none;
        }

        .divider-line {
          position: absolute;
          inset: 0;
          background: #ffffff;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
        }

        .divider-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          color: #0f172a;
          font-size: 8px;
        }

        .side-by-side-stage {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
          padding: var(--space-4);
          width: 100%;
          height: 100%;
        }

        .side-card {
          position: relative;
          background: var(--color-bg-base);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3);
          min-height: 280px;
        }

        .side-card img {
          max-width: 100%;
          max-height: 260px;
          object-fit: contain;
        }

        .side-tag {
          position: absolute;
          top: var(--space-2);
          left: var(--space-2);
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          background: rgba(0,0,0,0.6);
          font-size: var(--text-2xs);
          color: #ffffff;
        }

        .comp-metrics-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: var(--space-4) var(--space-6);
          background: var(--color-bg-base);
          border-top: 1px solid var(--color-border-subtle);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .metric-label {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .metric-flow {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: 600;
        }

        .metric-before {
          color: var(--color-text-secondary);
        }

        .metric-after {
          color: var(--color-text-primary);
        }

        .flow-arrow {
          color: var(--color-primary);
        }

        .savings-badge-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
        }

        .savings-title {
          font-size: var(--text-2xs);
          color: var(--color-accent-emerald);
          font-weight: 600;
        }

        .savings-val {
          font-size: var(--text-sm);
          font-weight: 800;
          color: var(--color-accent-emerald);
        }

        @media (max-width: 640px) {
          .side-by-side-stage {
            grid-template-columns: 1fr;
          }
          .comp-metrics-bar {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
