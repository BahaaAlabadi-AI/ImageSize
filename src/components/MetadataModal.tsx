import React from 'react';
import { Shield, ShieldAlert, Check, X, Camera, Calendar, HardDrive } from 'lucide-react';
import { ImageFile } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';

interface MetadataModalProps {
  imageFile: ImageFile;
  onClose: () => void;
  onStripMetadata: () => void;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  imageFile,
  onClose,
  onStripMetadata,
}) => {
  const { t } = useTranslation();
  const exif = imageFile.exif;

  return (
    <div className="meta-modal-overlay">
      <div className="meta-modal-card glass-panel">
        <div className="meta-header">
          <div className="meta-title-group">
            <Shield size={20} className="shield-icon" />
            <h3 className="meta-title">{t.metadata.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="close-btn" aria-label={t.close}>
            <X size={18} />
          </button>
        </div>

        <div className="meta-body">
          <p className="meta-intro">{t.metadata.safeDesc}</p>

          {exif.hasExif ? (
            <div className="meta-entries-list">
              <div className="meta-entry">
                <div className="entry-left">
                  <Camera size={16} className="entry-icon" />
                  <span className="entry-label">{t.metadata.camera}</span>
                </div>
                <span className="entry-val font-mono">
                  {exif.make || ''} {exif.model || 'Unknown'}
                </span>
              </div>

              {exif.dateTime && (
                <div className="meta-entry">
                  <div className="entry-left">
                    <Calendar size={16} className="entry-icon" />
                    <span className="entry-label">{t.metadata.dateTaken}</span>
                  </div>
                  <span className="entry-val font-mono">{exif.dateTime}</span>
                </div>
              )}

              {exif.software && (
                <div className="meta-entry">
                  <div className="entry-left">
                    <HardDrive size={16} className="entry-icon" />
                    <span className="entry-label">{t.metadata.software}</span>
                  </div>
                  <span className="entry-val font-mono">{exif.software}</span>
                </div>
              )}

              <div className="meta-entry">
                <div className="entry-left">
                  <ShieldAlert size={16} className="entry-icon alert-color" />
                  <span className="entry-label">{t.metadata.location}</span>
                </div>
                <span className="entry-val font-mono">
                  {exif.latitude ? `${exif.latitude}, ${exif.longitude}` : t.metadata.noGpsData}
                </span>
              </div>
            </div>
          ) : (
            <div className="no-exif-box">
              <Check size={20} className="check-icon" />
              <span>{t.metadata.noExif}</span>
            </div>
          )}
        </div>

        <div className="meta-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            {t.close}
          </button>

          {exif.hasExif && (
            <button
              type="button"
              onClick={() => {
                onStripMetadata();
                onClose();
              }}
              className="btn-primary-glow"
            >
              <span>{t.metadata.stripButton}</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .meta-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }

        .meta-modal-card {
          width: 100%;
          max-width: 540px;
          background: var(--color-bg-base);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .meta-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .meta-title-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .shield-icon {
          color: var(--color-accent-emerald);
        }

        .meta-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          color: var(--color-text-secondary);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
        }

        .meta-body {
          padding: var(--space-5) var(--space-6);
        }

        .meta-intro {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-4);
          line-height: 1.5;
        }

        .meta-entries-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .meta-entry {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2-5) var(--space-3);
          border-radius: var(--radius-md);
          background: var(--color-bg-subtle);
          border: 1px solid var(--color-border-subtle);
        }

        .entry-left {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .entry-icon {
          color: var(--color-text-muted);
        }

        .alert-color {
          color: var(--color-accent-amber);
        }

        .entry-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .entry-val {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }

        .no-exif-box {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--color-accent-emerald);
          font-size: var(--text-xs);
          font-weight: 600;
        }

        .meta-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--color-border-subtle);
          background: var(--color-bg-base);
        }
      `}</style>
    </div>
  );
};
