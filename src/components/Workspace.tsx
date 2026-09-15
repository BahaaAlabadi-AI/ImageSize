import React, { useState, useEffect } from 'react';
import {
  Crop,
  Maximize2,
  Minimize2,
  FileCheck,
  RotateCw,
  Sliders,
  Shield,
  Layers,
  Sparkles,
  Download,
  RotateCcw,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  ImageFile,
  ActiveTool,
  ResizeOptions,
  CompressOptions,
  TransformOptions,
  CropRect,
  ProcessedResult,
  QuickWizard,
} from '../types/image';
import { UIError, UIErrorBanner } from './UIErrorBanner';
import { useTranslation } from '../i18n/useTranslation';
import { formatBytes } from '../utils/formatters';
import { processImage } from '../engine/transform';
import { triggerBlobDownload } from '../utils/download';

import { ResizePanel } from './ResizePanel';
import { CompressPanel } from './CompressPanel';
import { PresetPicker } from './PresetPicker';
import { TransformPanel } from './TransformPanel';
import { InteractiveCropper } from './InteractiveCropper';
import { MetadataModal } from './MetadataModal';
import { ComparisonView } from './ComparisonView';

interface WorkspaceProps {
  imageFile: ImageFile;
  activeGoal?: QuickWizard | null;
  onUploadNew: () => void;
  onSetError?: (err: UIError | null) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  imageFile,
  activeGoal,
  onUploadNew,
  onSetError,
}) => {
  const { t } = useTranslation();

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<ActiveTool>('resize');

  // Options State
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: imageFile.width,
    height: imageFile.height,
    lockAspectRatio: true,
    mode: 'fit',
    preventEnlargement: false,
    percentage: 100,
    usePercentage: false,
  });

  const [compressOptions, setCompressOptions] = useState<CompressOptions>({
    quality: 85,
    targetSizeKb: null,
    format: imageFile.type.includes('png') ? 'image/png' : 'image/jpeg',
    matteColor: '#ffffff',
    removeMetadata: true,
  });

  const [transformOptions, setTransformOptions] = useState<TransformOptions>({
    rotate: 0,
    flipH: false,
    flipV: false,
  });

  const [activeCrop, setActiveCrop] = useState<CropRect | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState<boolean>(false);

  // Processing state & latest result
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  // Local error for workspace-scoped warnings (e.g. target size not reached)
  const [localError, setLocalError] = useState<UIError | null>(null);

  // Handle quick wizard goal triggers
  useEffect(() => {
    if (!activeGoal) return;

    if (activeGoal === 'make-under-200kb') {
      setActiveTool('compress');
      setCompressOptions((prev) => ({
        ...prev,
        targetSizeKb: 200,
        format: 'image/webp',
      }));
    } else if (activeGoal === 'instagram-1080') {
      setActiveTool('resize');
      setResizeOptions({
        width: 1080,
        height: 1080,
        lockAspectRatio: true,
        mode: 'crop-to-fit',
        preventEnlargement: false,
        percentage: 100,
        usePercentage: false,
      });
      setIsCropperOpen(true);
    } else if (activeGoal === 'passport-35x45') {
      setActiveTool('presets');
      // Schengen/UK Passport @ 300 DPI = 413 × 531
      setResizeOptions({
        width: 413,
        height: 531,
        lockAspectRatio: true,
        mode: 'fit',
        preventEnlargement: false,
        percentage: 100,
        usePercentage: false,
      });
    } else if (activeGoal === 'website-ready') {
      setActiveTool('compress');
      setCompressOptions((prev) => ({
        ...prev,
        format: 'image/webp',
        quality: 82,
        targetSizeKb: null,
      }));
      // Restrict max width to 1920 if higher
      if (imageFile.width > 1920) {
        const aspect = imageFile.width / imageFile.height;
        setResizeOptions((prev) => ({
          ...prev,
          width: 1920,
          height: Math.round(1920 / aspect),
        }));
      }
    } else if (activeGoal === 'remove-exif') {
      setIsMetadataOpen(true);
    }
  }, [activeGoal, imageFile]);

  // Execute image processing
  const handleApplyProcess = async () => {
    setIsProcessing(true);
    setLocalError(null);
    try {
      const res = await processImage(imageFile, {
        crop: activeCrop,
        resize: resizeOptions,
        compress: compressOptions,
        transform: transformOptions,
      });
      setResult(res);
      // Surface target size warning if binary search couldn't reach the goal
      if (res.targetSizeWarning) {
        const warning: UIError = {
          ...t.errors.targetSizeNotReached,
          message: `${t.errors.targetSizeNotReached.message} Actual size: ${res.targetSizeWarning.actualKb} KB (target: ${res.targetSizeWarning.targetKb} KB).`,
          type: 'warning',
        };
        setLocalError(warning);
        if (onSetError) onSetError(warning);
      }
    } catch (err) {
      console.debug('Processing error:', err);
      const errObj: UIError = err instanceof RangeError || err instanceof DOMException
        ? { ...t.errors.imageTooLarge, type: 'error' }
        : { ...t.errors.processingFailed, type: 'error' };
      setLocalError(errObj);
      if (onSetError) onSetError(errObj);
    } finally {
      setIsProcessing(false);
    }
  };

  // Preset selected from PresetPicker
  const handleSelectPreset = (w: number, h: number, name: string) => {
    setResizeOptions({
      width: w,
      height: h,
      lockAspectRatio: true,
      mode: 'fit',
      preventEnlargement: false,
      percentage: 100,
      usePercentage: false,
    });
    setActiveTool('resize');
  };

  const handleApplyCrop = (crop: CropRect) => {
    setActiveCrop(crop);
    setIsCropperOpen(false);
    setResizeOptions((prev) => ({
      ...prev,
      width: crop.width,
      height: crop.height,
    }));
  };

  const handleResetAll = () => {
    setActiveCrop(null);
    setResizeOptions({
      width: imageFile.width,
      height: imageFile.height,
      lockAspectRatio: true,
      mode: 'fit',
      preventEnlargement: false,
      percentage: 100,
      usePercentage: false,
    });
    setCompressOptions({
      quality: 85,
      targetSizeKb: null,
      format: imageFile.type.includes('png') ? 'image/png' : 'image/jpeg',
      matteColor: '#ffffff',
      removeMetadata: true,
    });
    setTransformOptions({ rotate: 0, flipH: false, flipV: false });
    setResult(null);
  };

  return (
    <div className="workspace-layout">
      {/* Sidebar Tool Panels (Reference Image 2 Studio Style) */}
      <aside className="workspace-sidebar glass-panel">
        {/* Navigation Tabs */}
        <div className="sidebar-nav-pills">
          <button
            type="button"
            className={`pill-chip ${activeTool === 'resize' ? 'is-active-primary' : ''}`}
            onClick={() => setActiveTool('resize')}
          >
            <Maximize2 size={16} />
            <span>{t.tools.resize}</span>
          </button>

          <button
            type="button"
            className={`pill-chip ${activeTool === 'crop' || isCropperOpen ? 'is-active-primary' : ''}`}
            onClick={() => setIsCropperOpen(true)}
          >
            <Crop size={16} />
            <span>{t.tools.crop}</span>
          </button>

          <button
            type="button"
            className={`pill-chip ${activeTool === 'compress' ? 'is-active-primary' : ''}`}
            onClick={() => setActiveTool('compress')}
          >
            <Minimize2 size={16} />
            <span>{t.tools.compress}</span>
          </button>

          <button
            type="button"
            className={`pill-chip ${activeTool === 'presets' ? 'is-active-primary' : ''}`}
            onClick={() => setActiveTool('presets')}
          >
            <Sliders size={16} />
            <span>{t.tools.presets}</span>
          </button>

          <button
            type="button"
            className={`pill-chip ${activeTool === 'rotate' ? 'is-active-primary' : ''}`}
            onClick={() => setActiveTool('rotate')}
          >
            <RotateCw size={16} />
            <span>{t.tools.rotate}</span>
          </button>

          <button
            type="button"
            className={`pill-chip ${activeTool === 'metadata' ? 'is-active-primary' : ''}`}
            onClick={() => setIsMetadataOpen(true)}
          >
            <Shield size={16} />
            <span>{t.tools.metadata}</span>
          </button>
        </div>

        {/* Selected Tool Controls Form */}
        <div className="sidebar-tool-body">
          {activeTool === 'resize' && (
            <ResizePanel
              imageFile={imageFile}
              resizeOptions={resizeOptions}
              onChange={setResizeOptions}
              onApply={handleApplyProcess}
            />
          )}

          {activeTool === 'compress' && (
            <CompressPanel
              imageFile={imageFile}
              compressOptions={compressOptions}
              onChange={setCompressOptions}
              onApply={handleApplyProcess}
              isProcessing={isProcessing}
            />
          )}

          {activeTool === 'presets' && (
            <PresetPicker
              onSelectPreset={handleSelectPreset}
              activeWidth={resizeOptions.width}
              activeHeight={resizeOptions.height}
            />
          )}

          {activeTool === 'rotate' && (
            <TransformPanel
              transform={transformOptions}
              onChange={setTransformOptions}
              onApply={handleApplyProcess}
            />
          )}
        </div>

        {/* Global Action Bar */}
        <div className="sidebar-bottom-actions">
          <button type="button" onClick={handleResetAll} className="btn-secondary flex-1">
            <RotateCcw size={16} />
            <span>{t.reset}</span>
          </button>
          <button
            type="button"
            onClick={handleApplyProcess}
            disabled={isProcessing}
            className="btn-primary-glow flex-2"
          >
            <Sparkles size={18} />
            <span>{isProcessing ? t.processing : t.apply}</span>
          </button>
        </div>
      </aside>

      {/* Main Studio Preview Stage */}
      <main className="workspace-main">
        {/* Top Image Telemetry Bar */}
        <div className="telemetry-bar glass-panel">
          <div className="telemetry-left">
            <span className="file-name-pill" title={imageFile.name}>
              {imageFile.name}
            </span>
            <span className="telemetry-badge font-mono">
              {imageFile.width} × {imageFile.height} px
            </span>
            <span className="telemetry-badge font-mono">
              {imageFile.aspectRatioText}
            </span>
            <span className="telemetry-badge font-mono">
              {formatBytes(imageFile.size)}
            </span>
            <span className="telemetry-badge font-mono format-tag">
              {imageFile.type.replace('image/', '').toUpperCase()}
            </span>
            {imageFile.hasTransparency && (
              <span className="transparency-badge">Alpha Transparent</span>
            )}
          </div>

          <div className="telemetry-right">
            <button
              type="button"
              onClick={() => setIsCropperOpen(true)}
              className="action-icon-btn"
              title={t.crop.title}
            >
              <Crop size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsMetadataOpen(true)}
              className="action-icon-btn"
              title={t.metadata.title}
            >
              <Shield size={16} />
            </button>
            <button
              type="button"
              onClick={onUploadNew}
              className="btn-secondary change-img-btn"
            >
              <span>{t.chooseImage}</span>
            </button>
          </div>
        </div>

        {/* Live Canvas Preview Stage */}
        <div className="stage-canvas-card glass-panel">
          <div className="image-display-box">
            <img
              src={imageFile.dataUrl}
              alt="Source preview"
              className="stage-img"
              style={{
                transform: `rotate(${transformOptions.rotate}deg) scale(${transformOptions.flipH ? -1 : 1}, ${transformOptions.flipV ? -1 : 1})`,
                transition: 'transform var(--duration-fast) var(--ease-spring)',
              }}
            />

            {activeCrop && (
              <div
                className="crop-indicator-overlay"
                style={{
                  left: `${(activeCrop.x / imageFile.width) * 100}%`,
                  top: `${(activeCrop.y / imageFile.height) * 100}%`,
                  width: `${(activeCrop.width / imageFile.width) * 100}%`,
                  height: `${(activeCrop.height / imageFile.height) * 100}%`,
                }}
              >
                <span className="crop-indicator-label font-mono">
                  {activeCrop.width} × {activeCrop.height} px
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Processed Result & Before/After Comparison View */}
        {result && (
          <ComparisonView
            original={imageFile}
            result={result}
          />
        )}
      </main>

      {/* Interactive 8-point Cropper Modal */}
      {isCropperOpen && (
        <InteractiveCropper
          imageFile={imageFile}
          initialCrop={activeCrop}
          onApplyCrop={handleApplyCrop}
          onCancel={() => setIsCropperOpen(false)}
        />
      )}

      {/* EXIF Metadata Modal */}
      {isMetadataOpen && (
        <MetadataModal
          imageFile={imageFile}
          onClose={() => setIsMetadataOpen(false)}
          onStripMetadata={() => {
            setCompressOptions((prev) => ({ ...prev, removeMetadata: true }));
            handleApplyProcess();
          }}
        />
      )}

      <style>{`
        .workspace-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: var(--space-6);
          align-items: start;
        }

        .workspace-sidebar {
          position: sticky;
          top: 76px;
          display: flex;
          flex-direction: column;
          padding: var(--space-5);
          gap: var(--space-5);
          border-radius: var(--radius-2xl);
          max-height: calc(100vh - 100px);
          overflow-y: auto;
        }

        .sidebar-nav-pills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .sidebar-tool-body {
          flex: 1;
        }

        .sidebar-bottom-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2-5);
          padding-top: var(--space-3);
          border-top: 1px solid var(--color-border-subtle);
        }

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }

        .workspace-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .telemetry-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-xl);
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .telemetry-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .file-name-pill {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-text-primary);
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .telemetry-badge {
          font-size: var(--text-2xs);
          font-weight: 600;
          color: var(--color-text-secondary);
          background: var(--color-bg-subtle);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .format-tag {
          color: var(--color-primary);
          background: var(--color-primary-subtle);
        }

        .transparency-badge {
          font-size: var(--text-2xs);
          font-weight: 600;
          color: var(--color-accent-purple);
          background: rgba(139, 92, 246, 0.12);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .telemetry-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .action-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          color: var(--color-text-secondary);
          transition: all var(--duration-fast);
        }

        .action-icon-btn:hover {
          color: var(--color-text-primary);
          border-color: var(--color-border-hover);
        }

        .change-img-btn {
          min-height: 36px;
          padding: 0 var(--space-3);
          font-size: var(--text-xs);
        }

        .stage-canvas-card {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          min-height: 420px;
          max-height: 600px;
          border-radius: var(--radius-2xl);
          background: #090a0f;
          overflow: hidden;
        }

        .image-display-box {
          position: relative;
          display: inline-block;
          max-width: 100%;
          max-height: 520px;
        }

        .stage-img {
          display: block;
          max-width: 100%;
          max-height: 520px;
          object-fit: contain;
          border-radius: var(--radius-sm);
        }

        .crop-indicator-overlay {
          position: absolute;
          border: 2px dashed #ec4899;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
          pointer-events: none;
        }

        .crop-indicator-label {
          position: absolute;
          top: -24px;
          left: 0;
          font-size: var(--text-2xs);
          font-weight: 700;
          color: #ffffff;
          background: #ec4899;
          padding: 1px 6px;
          border-radius: var(--radius-xs);
        }

        @media (max-width: 1024px) {
          .workspace-layout {
            grid-template-columns: 1fr;
          }
          .workspace-sidebar {
            position: static;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
};
