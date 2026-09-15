import React from 'react';
import { Layers, Download, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { ImageFile, ProcessedResult } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';
import { formatBytes } from '../utils/formatters';

interface BatchQueueProps {
  files: ImageFile[];
  activeIndex: number;
  onSelectFile: (index: number) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  onProcessAll: () => void;
  onDownloadZip: () => void;
  isProcessing: boolean;
  progress: number;
  resultsCount: number;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  files,
  activeIndex,
  onSelectFile,
  onRemoveFile,
  onClearAll,
  onProcessAll,
  onDownloadZip,
  isProcessing,
  progress,
  resultsCount,
}) => {
  const { t } = useTranslation();

  if (files.length <= 1) return null;

  return (
    <div className="batch-queue-card glass-panel fade-in-up">
      <div className="batch-header">
        <div className="batch-title-group">
          <Layers size={18} className="batch-icon" />
          <h3 className="batch-title">
            {files.length} {t.batch.itemsCount}
          </h3>
        </div>

        <div className="batch-header-actions">
          <button type="button" onClick={onClearAll} className="btn-ghost clear-btn">
            <Trash2 size={14} />
            <span>{t.clearAll}</span>
          </button>

          {resultsCount === files.length ? (
            <button type="button" onClick={onDownloadZip} className="btn-primary-glow zip-btn">
              <Download size={16} />
              <span>{t.downloadAllZip}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onProcessAll}
              disabled={isProcessing}
              className="btn-primary-glow process-btn"
            >
              {isProcessing ? <Loader2 size={16} className="spin-icon" /> : null}
              <span>{isProcessing ? `${progress}%` : t.batch.processAll}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="progress-track">
          <div className="progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      )}

      {/* Thumbnails Row */}
      <div className="batch-thumbnails-row">
        {files.map((file, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div
              key={file.id}
              role="button"
              tabIndex={0}
              className={`batch-thumb-item ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectFile(idx)}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectFile(idx);
                }
              }}
              aria-label={`${file.name} (${formatBytes(file.size)})`}
            >
              <img src={file.dataUrl} alt={file.name} className="thumb-img" />
              <div className="thumb-info">
                <span className="thumb-name">{file.name}</span>
                <span className="thumb-size font-mono">{formatBytes(file.size)}</span>
              </div>
              <button
                type="button"
                className="thumb-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(idx);
                }}
                title={t.remove}
                aria-label={`${t.remove} ${file.name}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .batch-queue-card {
          margin-bottom: var(--space-6);
          padding: var(--space-4);
          border-radius: var(--radius-xl);
          background: var(--glass-bg);
          border: var(--glass-border);
        }

        .batch-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .batch-title-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .batch-icon {
          color: var(--color-primary);
        }

        .batch-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .batch-header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .clear-btn {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          padding: var(--space-1) var(--space-2);
        }

        .process-btn, .zip-btn {
          min-height: 36px;
          padding: var(--space-1-5) var(--space-4);
          font-size: var(--text-xs);
        }

        .progress-track {
          width: 100%;
          height: 4px;
          background: var(--color-bg-subtle);
          border-radius: var(--radius-full);
          margin-bottom: var(--space-3);
          overflow: hidden;
        }

        .progress-bar {
          width: 100%;
          height: 100%;
          background: var(--gradient-explore);
          transform-origin: left;
          transition: transform var(--duration-fast) var(--ease-smooth);
        }

        [dir='rtl'] .progress-bar {
          transform-origin: right;
        }

        .batch-thumbnails-row {
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
          padding-bottom: var(--space-1);
        }

        .batch-thumb-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1-5) var(--space-3);
          border-radius: var(--radius-md);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          cursor: pointer;
          min-width: 180px;
          max-width: 220px;
          transition: background-color var(--duration-fast),
                      border-color var(--duration-fast);
        }

        .batch-thumb-item:hover {
          background: var(--color-bg-surface-hover);
          border-color: var(--color-border-hover);
        }

        .batch-thumb-item.is-active {
          border-color: var(--color-primary);
          background: var(--color-primary-subtle);
        }

        .thumb-img {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-xs);
          object-fit: cover;
          flex-shrink: 0;
        }

        .thumb-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .thumb-name {
          font-size: var(--text-2xs);
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .thumb-size {
          font-size: 8px;
          color: var(--color-text-muted);
        }

        .thumb-remove-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 12px;
          color: var(--color-text-muted);
          background: transparent;
        }

        .thumb-remove-btn:hover {
          color: var(--color-accent-rose);
          background: rgba(244, 63, 94, 0.1);
        }
      `}</style>
    </div>
  );
};
