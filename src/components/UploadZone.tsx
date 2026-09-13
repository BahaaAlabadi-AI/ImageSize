import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Clipboard, FileCheck, Layers } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, isProcessing }) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global clipboard paste handler (Ctrl+V / ⌘V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            imageFiles.push(file);
          }
        }
        if (imageFiles.length > 0) {
          e.preventDefault();
          onFilesSelected(imageFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
    // reset input so same file can be re-uploaded if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`upload-dropzone ${isDragOver ? 'is-dragover' : ''} ${isProcessing ? 'is-processing' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Center Upload Graphic */}
      <div className="upload-emblem-wrap">
        <div className="upload-emblem">
          <UploadCloud size={38} className="cloud-icon" />
        </div>
      </div>

      <div className="upload-copy">
        <h3 className="upload-main-title">
          {isDragOver ? t.dropActive : t.uploadTitle}
        </h3>
        <p className="upload-sub-title">{t.uploadSubtitle}</p>
      </div>

      {/* Action Button & Demo Trigger */}
      <div className="upload-buttons-group">
        <button
          type="button"
          className="choose-btn"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <ImageIcon size={18} />
          <span>{t.chooseImage}</span>
        </button>

        <button
          type="button"
          className="demo-sample-btn"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const res = await fetch('/sample-landscape.svg');
              const blob = await res.blob();
              const file = new File([blob], 'sample-landscape.svg', { type: 'image/svg+xml' });
              onFilesSelected([file]);
            } catch (err) {
              console.error('Failed to load demo image', err);
            }
          }}
        >
          <span>✨ Try Demo Image</span>
        </button>
      </div>

      {/* Supported formats & Keyboard Paste Shortcut Hint */}
      <div className="upload-footer">
        <div className="format-chips">
          <span className="chip">JPG</span>
          <span className="chip">PNG</span>
          <span className="chip">WebP</span>
          <span className="chip">AVIF</span>
          <span className="chip">SVG</span>
        </div>

        <div className="paste-badge" title={t.pasteHint}>
          <Clipboard size={14} />
          <span>{t.pasteHint}</span>
        </div>
      </div>

      <style>{`
        .upload-dropzone {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8) var(--space-6);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          -webkit-backdrop-filter: var(--glass-backdrop);
          border: 2px dashed var(--color-border-default);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-smooth);
          text-align: center;
          overflow: hidden;
        }

        .upload-dropzone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0.5;
          transition: opacity var(--duration-fast);
        }

        .upload-dropzone:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-glow);
          transform: translateY(-2px);
        }

        .upload-dropzone:hover::before {
          opacity: 1;
        }

        .upload-dropzone.is-dragover {
          border-color: var(--color-accent-purple);
          background: rgba(139, 92, 246, 0.08);
          box-shadow: 0 0 32px rgba(139, 92, 246, 0.35);
          transform: scale(1.01);
        }

        .upload-emblem-wrap {
          margin-bottom: var(--space-4);
          z-index: 1;
        }

        .upload-emblem {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: var(--radius-xl);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border-default);
          box-shadow: var(--shadow-md);
          color: var(--color-primary);
          transition: all var(--duration-fast) var(--ease-spring);
        }

        .upload-dropzone:hover .upload-emblem {
          transform: scale(1.1);
          color: var(--color-accent-purple);
          border-color: var(--color-accent-purple);
          box-shadow: var(--shadow-glow-purple);
        }

        .upload-copy {
          margin-bottom: var(--space-5);
          z-index: 1;
        }

        .upload-main-title {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
        }

        .upload-sub-title {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }

        .upload-buttons-group {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
          z-index: 1;
          flex-wrap: wrap;
          justify-content: center;
        }

        .choose-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-8);
          min-height: 48px;
          border-radius: var(--radius-full);
          font-size: var(--text-base);
          font-weight: 600;
          color: #ffffff;
          background: var(--gradient-primary);
          box-shadow: var(--shadow-glow);
          transition: all var(--duration-fast) var(--ease-spring);
        }

        .choose-btn:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }

        .demo-sample-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          min-height: 48px;
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-primary);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          transition: all var(--duration-fast) var(--ease-spring);
        }

        .demo-sample-btn:hover {
          background: var(--color-bg-surface-hover);
          border-color: var(--color-accent-purple);
          color: var(--color-accent-purple);
          transform: translateY(-1px);
        }

        .upload-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          z-index: 1;
        }

        .format-chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-1-5);
        }

        .format-chips .chip {
          font-size: var(--text-2xs);
          font-weight: 700;
          font-family: var(--font-mono);
          padding: var(--space-0-5) var(--space-2);
          border-radius: var(--radius-xs);
          background: var(--color-bg-subtle);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border-subtle);
        }

        .paste-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1-5);
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          margin-top: var(--space-1);
        }

        @media (max-width: 640px) {
          .upload-dropzone {
            padding: var(--space-6) var(--space-4);
          }
          .upload-main-title {
            font-size: var(--text-lg);
          }
        }
      `}</style>
    </div>
  );
};
