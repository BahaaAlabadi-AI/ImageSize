import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GoalSelector } from './components/GoalSelector';
import { UploadZone } from './components/UploadZone';
import { Workspace } from './components/Workspace';
import { BatchQueue } from './components/BatchQueue';
import { UIErrorBanner, UIError } from './components/UIErrorBanner';
import { ImageFile, QuickWizard, ProcessedResult } from './types/image';
import { decodeImageFile } from './engine/decode';
import { processBatchQueue, createBatchZip } from './engine/batch';
import { useTranslation } from './i18n/useTranslation';

export function App() {
  const { t } = useTranslation();

  // Theme Management (Dark Studio Obsidian / Clean Light Studio)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('img_tool_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('img_tool_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Uploaded Files State
  const [images, setImages] = useState<ImageFile[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeGoal, setActiveGoal] = useState<QuickWizard | null>(null);

  // UI Error Banner State
  const [uiError, setUiError] = useState<UIError | null>(null);

  // Batch Processing State
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchResults, setBatchResults] = useState<ProcessedResult[]>([]);

  // Handle file uploads (Single or Multiple)
  const handleFilesSelected = async (files: File[]) => {
    const loaded: ImageFile[] = [];
    let failedCount = 0;

    for (const file of files) {
      try {
        const decoded = await decodeImageFile(file);
        loaded.push(decoded);
      } catch (err) {
        console.debug(`Error decoding file ${file.name}:`, err);
        // Detect memory-related errors vs unsupported format
        if (err instanceof RangeError || err instanceof DOMException) {
          setUiError({ ...t.errors.imageTooLarge, type: 'error' });
        } else {
          failedCount++;
        }
      }
    }

    if (failedCount > 0 && loaded.length === 0) {
      setUiError({ ...t.errors.unsupportedFormat, type: 'error' });
    } else if (failedCount > 0) {
      setUiError({
        title: t.errors.unsupportedFormat.title,
        message: `${failedCount} file(s) could not be opened and were skipped.`,
        suggestions: t.errors.unsupportedFormat.suggestions,
        type: 'warning',
      });
    }

    if (loaded.length > 0) {
      setImages((prev) => [...prev, ...loaded]);
      setActiveIndex(images.length); // switch to newly uploaded item
    }
  };

  const handleRemoveFile = (index: number) => {
    const target = images[index];
    if (target) {
      URL.revokeObjectURL(target.dataUrl);
    }
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    if (activeIndex >= next.length) {
      setActiveIndex(Math.max(0, next.length - 1));
    }
  };

  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.dataUrl));
    setImages([]);
    setActiveIndex(0);
    setBatchResults([]);
  };

  // Run Batch Processing
  const handleProcessAll = async () => {
    if (images.length === 0) return;
    setIsBatchProcessing(true);
    setBatchProgress(0);

    try {
      const results = await processBatchQueue(
        images,
        {},
        (pct) => setBatchProgress(pct)
      );
      setBatchResults(results);
    } catch (err) {
      console.debug('Batch error:', err);
      setUiError({ ...t.errors.batchFailed, type: 'error' });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleDownloadBatchZip = () => {
    if (batchResults.length > 0) {
      createBatchZip(batchResults, 'prepared-images-bundle.zip');
    }
  };

  const currentImage = images[activeIndex] || null;

  return (
    <div className="app-root">
      {/* Precision Darkroom Optical Backdrop */}
      <div className="app-backdrop" aria-hidden="true" />

      {/* Sticky App Header */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Main App Content */}
      <div className="app-container">
        {/* Quick Intent Wizards */}
        <GoalSelector
          onSelectGoal={(goal) => {
            setActiveGoal(goal);
          }}
          activeGoal={activeGoal}
        />

        {/* Batch Queue Bar (Shown when multiple files are loaded) */}
        {images.length > 1 && (
          <BatchQueue
            files={images}
            activeIndex={activeIndex}
            onSelectFile={setActiveIndex}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            onProcessAll={handleProcessAll}
            onDownloadZip={handleDownloadBatchZip}
            isProcessing={isBatchProcessing}
            progress={batchProgress}
            resultsCount={batchResults.length}
          />
        )}

        {/* UI Error Banner — dismissible, replaces native alert() */}
        {uiError && (
          <UIErrorBanner error={uiError} onDismiss={() => setUiError(null)} />
        )}

        {/* Dynamic State: Upload Zone if empty, otherwise Studio Workspace */}
        {currentImage ? (
          <Workspace
            key={currentImage.id}
            imageFile={currentImage}
            activeGoal={activeGoal}
            onSetError={setUiError}
            onUploadNew={() => {
              // Trigger file upload or clear
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files;
                if (f) handleFilesSelected(Array.from(f));
              };
              input.click();
            }}
          />
        ) : (
          <div className="empty-upload-stage">
            <UploadZone onFilesSelected={handleFilesSelected} />
          </div>
        )}

        {/* Technical Specifications & Privacy Architecture Section */}
        <footer className="app-seo-footer glass-panel">
          <div className="footer-layout">
            <div className="footer-privacy-hero">
              <div className="privacy-stamp">
                <span className="stamp-badge">100% IN-BROWSER</span>
                <h4 className="privacy-title">Zero-Server Image Processing</h4>
              </div>
              <p className="privacy-desc">
                Your images are decoded and transformed entirely in your local device's memory using the HTML5 Canvas & WebAssembly pipeline. No image bytes, file names, or EXIF metadata are ever sent to any remote server or third-party service.
              </p>
            </div>

            <div className="footer-specs-grid">
              <div className="spec-card">
                <span className="spec-label">DIMENSIONS & RATIO</span>
                <h5 className="spec-title">Lock & Crop Engine</h5>
                <p className="spec-text">Exact pixel targeting, pixel-density scale factors (1x, 2x, 3x), and standard presets (1:1, 4:5, 16:9, 9:16).</p>
              </div>

              <div className="spec-card">
                <span className="spec-label">BINARY-SEARCH OPTIMIZER</span>
                <h5 className="spec-title">Target File Size Solver</h5>
                <p className="spec-text">Iterative bisect algorithm tests image compression quality to achieve exact file size thresholds (e.g. &lt; 200 KB) with maximum fidelity.</p>
              </div>

              <div className="spec-card">
                <span className="spec-label">METRIC & PHYSICAL PRINT</span>
                <h5 className="spec-title">300 DPI Biometric Accuracy</h5>
                <p className="spec-text">Physical millimeter calculations (Pixels = Inches × DPI) formatted specifically for Schengen (35×45mm) and US Visa (2×2") standards.</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom-line">
            <span>© {new Date().getFullYear()} Image Size & Ratio Precision Studio • Engineered per Web Development Master Suite (Anti-Slop Standard)</span>
          </div>
        </footer>
      </div>

      <style>{`
        .app-root {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding: var(--space-6) var(--space-6) var(--space-12);
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .empty-upload-stage {
          max-width: 820px;
          margin: var(--space-4) auto;
        }

        .app-seo-footer {
          margin-top: var(--space-12);
          padding: var(--space-8);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border-subtle);
        }

        .footer-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--space-8);
          margin-bottom: var(--space-6);
        }

        .footer-privacy-hero {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding-inline-end: var(--space-6);
          border-inline-end: 1px solid var(--color-border-subtle);
        }

        .privacy-stamp {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .stamp-badge {
          align-self: flex-start;
          font-size: var(--text-2xs);
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--color-accent-emerald);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          letter-spacing: 0.05em;
        }

        .privacy-title {
          font-family: var(--font-display);
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: var(--space-1) 0 0;
        }

        .privacy-desc {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .footer-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .spec-card {
          padding: var(--space-3);
          border-radius: var(--radius-md);
          background: var(--color-bg-subtle);
          border: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .spec-label {
          font-size: var(--text-2xs);
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--color-primary);
          letter-spacing: 0.03em;
        }

        .spec-title {
          font-family: var(--font-display);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .spec-text {
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
          line-height: 1.5;
          margin: 0;
        }

        .footer-bottom-line {
          text-align: center;
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }

        @media (max-width: 900px) {
          .footer-layout {
            grid-template-columns: 1fr;
            gap: var(--space-5);
          }
          .footer-privacy-hero {
            padding-inline-end: 0;
            border-inline-end: none;
            border-bottom: 1px solid var(--color-border-subtle);
            padding-bottom: var(--space-4);
          }
        }

        @media (max-width: 768px) {
          .app-container {
            padding: var(--space-4) var(--space-4) var(--space-8);
          }
          .app-seo-footer {
            padding: var(--space-5) var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}
