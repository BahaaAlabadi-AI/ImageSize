import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GoalSelector } from './components/GoalSelector';
import { UploadZone } from './components/UploadZone';
import { Workspace } from './components/Workspace';
import { BatchQueue } from './components/BatchQueue';
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

  // Batch Processing State
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchResults, setBatchResults] = useState<ProcessedResult[]>([]);

  // Handle file uploads (Single or Multiple)
  const handleFilesSelected = async (files: File[]) => {
    const loaded: ImageFile[] = [];
    for (const file of files) {
      try {
        const decoded = await decodeImageFile(file);
        loaded.push(decoded);
      } catch (err) {
        console.error(`Error decoding file ${file.name}:`, err);
      }
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
      console.error('Batch error:', err);
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
      {/* Aurora Ambient Background */}
      <div className="app-backdrop">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
      </div>

      {/* Sticky App Header */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Main App Content */}
      <div className="app-container">
        {/* Quick Intent Wizards ("What do you want to do?") */}
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

        {/* Dynamic State: Upload Zone if empty, otherwise Studio Workspace */}
        {currentImage ? (
          <Workspace
            key={currentImage.id}
            imageFile={currentImage}
            activeGoal={activeGoal}
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

        {/* Educational FAQ & Technical Specifications Section */}
        <footer className="app-seo-footer glass-panel">
          <div className="footer-grid">
            <div className="footer-col">
              <h4 className="footer-col-title">🔒 100% Client-Side Privacy</h4>
              <p className="footer-col-text">
                Your images never leave your computer or phone. Transformations are calculated
                directly in WebAssembly and Canvas APIs. No accounts, no watermarks, and zero tracking.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">📐 Exact Dimension & Aspect Ratio</h4>
              <p className="footer-col-text">
                Lock proportions effortlessly or crop to popular aspect ratios (1:1 Square, 4:5 Portrait,
                16:9 Landscape, 9:16 Reels/TikTok). Never distorts or stretches your photo unexpectedly.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">⚡ Smart Target Size (KB) Solver</h4>
              <p className="footer-col-text">
                Need an image under 200 KB or 500 KB for an official form? Our iterative binary-search
                engine tests quality values to give you the highest possible clarity under the file size limit.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">🖨️ Print & Passport Presets (300 DPI)</h4>
              <p className="footer-col-text">
                Calculate real pixel dimensions from physical millimeters or inches using the formula:
                Pixels = Inches × DPI. Includes presets for 2×2" visa and 35×45 mm Schengen biometric photos.
              </p>
            </div>
          </div>

          <div className="footer-bottom-line">
            <span>© {new Date().getFullYear()} Image Size & Ratio Tool • Built with Web Development Master Suite</span>
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
          border-radius: var(--radius-2xl);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .footer-col-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
        }

        .footer-col-text {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .footer-bottom-line {
          text-align: center;
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
          font-size: var(--text-2xs);
          color: var(--color-text-muted);
        }

        @media (max-width: 768px) {
          .app-container {
            padding: var(--space-4) var(--space-4) var(--space-8);
          }
          .app-seo-footer {
            padding: var(--space-6) var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}
