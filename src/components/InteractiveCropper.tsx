import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Move, ZoomIn, RotateCcw, Check, X, Crop as CropIcon } from 'lucide-react';
import { ImageFile, CropRect } from '../types/image';
import { useTranslation } from '../i18n/useTranslation';

interface InteractiveCropperProps {
  imageFile: ImageFile;
  initialCrop?: CropRect | null;
  onApplyCrop: (crop: CropRect) => void;
  onCancel?: () => void;
  aspectPreset?: string;
}

type HandleType =
  | 'tl'
  | 'tr'
  | 'bl'
  | 'br'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'move';

export const InteractiveCropper: React.FC<InteractiveCropperProps> = ({
  imageFile,
  initialCrop,
  onApplyCrop,
  onCancel,
  aspectPreset = 'free',
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Selected aspect ratio: 'free', '1:1', '4:5', '16:9', '9:16', '4:3', '3:2'
  const [selectedRatio, setSelectedRatio] = useState<string>(aspectPreset);
  const [zoom, setZoom] = useState<number>(1);
  // Pan offset in pixels (applied before scale)
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  // Normalised crop coordinates: x, y, width, height in 0..1 range of displayed image
  const [cropNorm, setCropNorm] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.8,
  });

  // Track dragging — crop handles or background pan
  const dragRef = useRef<{
    active: boolean;
    handle: HandleType | null;
    isPan: boolean;
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; w: number; h: number };
    startPanX: number;
    startPanY: number;
  }>({
    active: false,
    handle: null,
    isPan: false,
    startX: 0,
    startY: 0,
    startCrop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
    startPanX: 0,
    startPanY: 0,
  });

  // Calculate ratio numeric value
  const getRatioValue = useCallback((ratioKey: string): number | null => {
    switch (ratioKey) {
      case '1:1':
        return 1;
      case '4:5':
        return 4 / 5;
      case '5:4':
        return 5 / 4;
      case '16:9':
        return 16 / 9;
      case '9:16':
        return 9 / 16;
      case '4:3':
        return 4 / 3;
      case '3:2':
        return 3 / 2;
      case '2:3':
        return 2 / 3;
      default:
        return null;
    }
  }, []);

  // Set default proportional crop when ratio changes
  const applyRatioToCrop = useCallback(
    (ratioKey: string) => {
      setSelectedRatio(ratioKey);
      const targetRatio = getRatioValue(ratioKey);
      if (!targetRatio) return;

      const imgAspect = imageFile.width / imageFile.height;
      let newW = 0.8;
      let newH = 0.8;

      if (targetRatio > imgAspect) {
        // Target is wider than image
        newW = 0.85;
        newH = (newW * imgAspect) / targetRatio;
      } else {
        // Target is taller than image
        newH = 0.85;
        newW = (newH * targetRatio) / imgAspect;
      }

      setCropNorm({
        x: Math.max(0, (1 - newW) / 2),
        y: Math.max(0, (1 - newH) / 2),
        w: Math.min(1, newW),
        h: Math.min(1, newH),
      });
    },
    [getRatioValue, imageFile.width, imageFile.height]
  );

  // Initialize or reset crop
  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    applyRatioToCrop('free');
  };

  // Drag handlers for mouse & touch
  const handlePointerDown = (e: React.PointerEvent, handle: HandleType) => {
    e.preventDefault();
    e.stopPropagation();

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      active: true,
      handle,
      isPan: false,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...cropNorm },
      startPanX: panX,
      startPanY: panY,
    };
  };

  // Background pan — triggered when user drags on the viewport background (not the crop frame)
  const handleViewportPointerDown = (e: React.PointerEvent) => {
    // Only initiate pan if zoom > 1 and not clicking on the crop frame area
    if (zoom <= 1) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      handle: null,
      isPan: true,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...cropNorm },
      startPanX: panX,
      startPanY: panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active || !imageRef.current) return;
    e.preventDefault();

    // Pan mode
    if (dragRef.current.isPan && containerRef.current) {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const container = containerRef.current.getBoundingClientRect();
      const img = imageRef.current.getBoundingClientRect();
      // Max pan so image stays at least 20% visible
      const maxX = (img.width * (zoom - 1)) / 2;
      const maxY = (img.height * (zoom - 1)) / 2;
      setPanX(Math.max(-maxX, Math.min(maxX, dragRef.current.startPanX + deltaX)));
      setPanY(Math.max(-maxY, Math.min(maxY, dragRef.current.startPanY + deltaY)));
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - dragRef.current.startX) / rect.width;
    const deltaY = (e.clientY - dragRef.current.startY) / rect.height;

    const { handle, startCrop } = dragRef.current;
    let next = { ...startCrop };
    const minSize = 0.05;

    if (handle === 'move') {
      next.x = Math.max(0, Math.min(1 - startCrop.w, startCrop.x + deltaX));
      next.y = Math.max(0, Math.min(1 - startCrop.h, startCrop.y + deltaY));
    } else {
      // Corner & Edge resizing
      if (handle === 'tl' || handle === 'left' || handle === 'bl') {
        const potentialW = startCrop.w - deltaX;
        if (potentialW >= minSize && startCrop.x + deltaX >= 0) {
          next.x = startCrop.x + deltaX;
          next.w = potentialW;
        }
      }
      if (handle === 'tr' || handle === 'right' || handle === 'br') {
        const potentialW = startCrop.w + deltaX;
        if (potentialW >= minSize && startCrop.x + potentialW <= 1) {
          next.w = potentialW;
        }
      }
      if (handle === 'tl' || handle === 'top' || handle === 'tr') {
        const potentialH = startCrop.h - deltaY;
        if (potentialH >= minSize && startCrop.y + deltaY >= 0) {
          next.y = startCrop.y + deltaY;
          next.h = potentialH;
        }
      }
      if (handle === 'bl' || handle === 'bottom' || handle === 'br') {
        const potentialH = startCrop.h + deltaY;
        if (potentialH >= minSize && startCrop.y + potentialH <= 1) {
          next.h = potentialH;
        }
      }

      // If fixed ratio is locked, enforce proportion
      const targetRatio = getRatioValue(selectedRatio);
      if (targetRatio) {
        const imgAspect = imageFile.width / imageFile.height;
        next.h = (next.w * imgAspect) / targetRatio;
        if (next.y + next.h > 1) {
          next.h = 1 - next.y;
          next.w = (next.h * targetRatio) / imgAspect;
        }
      }
    }

    setCropNorm(next);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      dragRef.current.handle = null;
    }
  };

  // Convert normalised crop back to exact pixels on original image
  const handleApply = () => {
    const pixelCrop: CropRect = {
      x: Math.round(cropNorm.x * imageFile.width),
      y: Math.round(cropNorm.y * imageFile.height),
      width: Math.round(cropNorm.w * imageFile.width),
      height: Math.round(cropNorm.h * imageFile.height),
    };
    onApplyCrop(pixelCrop);
  };

  const ratioPills = [
    { key: 'free', label: t.crop.freeCrop },
    { key: '1:1', label: '1:1' },
    { key: '4:5', label: '4:5' },
    { key: '16:9', label: '16:9' },
    { key: '9:16', label: '9:16' },
    { key: '4:3', label: '4:3' },
    { key: '3:2', label: '3:2' },
  ];

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-card glass-panel">
        {/* Header Bar matching Reference Image 1 */}
        <div className="crop-modal-header">
          <div className="header-title-wrap">
            <CropIcon size={20} className="modal-icon" />
            <h3 className="modal-title">{t.crop.title}</h3>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="close-btn" aria-label={t.close}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Ratio Selector Pill Bar (Reference Image 2 style) */}
        <div className="ratio-bar">
          <span className="ratio-label">{t.crop.aspectRatio}:</span>
          <div className="ratio-pill-list">
            {ratioPills.map((pill) => (
              <button
                key={pill.key}
                type="button"
                className={`pill-chip ${selectedRatio === pill.key ? 'is-active' : ''}`}
                onClick={() => applyRatioToCrop(pill.key)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crop Viewport with Interactive 8-point Frame */}
        <div
          className={`crop-viewport ${zoom > 1 ? 'is-pannable' : ''}`}
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerDown={handleViewportPointerDown}
        >
          <div
            className="crop-image-container"
            style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <img
              ref={imageRef}
              src={imageFile.dataUrl}
              alt="Crop target"
              className="crop-target-img"
              draggable={false}
            />

            {/* Darkened Mask Scrim Overlays */}
            <div
              className="scrim top-scrim"
              style={{ height: `${cropNorm.y * 100}%` }}
            />
            <div
              className="scrim bottom-scrim"
              style={{
                top: `${(cropNorm.y + cropNorm.h) * 100}%`,
                height: `${(1 - (cropNorm.y + cropNorm.h)) * 100}%`,
              }}
            />
            <div
              className="scrim left-scrim"
              style={{
                top: `${cropNorm.y * 100}%`,
                height: `${cropNorm.h * 100}%`,
                width: `${cropNorm.x * 100}%`,
              }}
            />
            <div
              className="scrim right-scrim"
              style={{
                top: `${cropNorm.y * 100}%`,
                height: `${cropNorm.h * 100}%`,
                left: `${(cropNorm.x + cropNorm.w) * 100}%`,
                width: `${(1 - (cropNorm.x + cropNorm.w)) * 100}%`,
              }}
            />

            {/* The Active Crop Box with 8 Handles & Center Crosshair */}
            <div
              className="crop-frame"
              style={{
                left: `${cropNorm.x * 100}%`,
                top: `${cropNorm.y * 100}%`,
                width: `${cropNorm.w * 100}%`,
                height: `${cropNorm.h * 100}%`,
              }}
            >
              {/* Rule of Thirds Grid Lines */}
              <div className="grid-line grid-h1" />
              <div className="grid-line grid-h2" />
              <div className="grid-line grid-v1" />
              <div className="grid-line grid-v2" />

              {/* Center Move Handle (Icon from Reference Image 1) */}
              <div
                className="crop-center-handle"
                onPointerDown={(e) => handlePointerDown(e, 'move')}
                title={t.crop.centerHint}
              >
                <Move size={20} className="move-icon" />
              </div>

              {/* 8 Drag Grip Handles */}
              <div
                className="crop-handle handle-tl"
                onPointerDown={(e) => handlePointerDown(e, 'tl')}
              />
              <div
                className="crop-handle handle-top"
                onPointerDown={(e) => handlePointerDown(e, 'top')}
              />
              <div
                className="crop-handle handle-tr"
                onPointerDown={(e) => handlePointerDown(e, 'tr')}
              />
              <div
                className="crop-handle handle-right"
                onPointerDown={(e) => handlePointerDown(e, 'right')}
              />
              <div
                className="crop-handle handle-br"
                onPointerDown={(e) => handlePointerDown(e, 'br')}
              />
              <div
                className="crop-handle handle-bottom"
                onPointerDown={(e) => handlePointerDown(e, 'bottom')}
              />
              <div
                className="crop-handle handle-bl"
                onPointerDown={(e) => handlePointerDown(e, 'bl')}
              />
              <div
                className="crop-handle handle-left"
                onPointerDown={(e) => handlePointerDown(e, 'left')}
              />
            </div>
          </div>
        </div>

        {/* Zoom Controls & Dimension Metric */}
        <div className="crop-controls-bar">
          <div className="zoom-group">
            <ZoomIn size={16} className="control-icon" />
            <span className="control-label">{t.crop.zoom}:</span>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              aria-label={t.crop.zoom}
              onChange={(e) => {
                const newZoom = parseFloat(e.target.value);
                setZoom(newZoom);
                // Reset pan when zoom returns to 1
                if (newZoom <= 1) { setPanX(0); setPanY(0); }
              }}
              className="custom-slider zoom-slider"
            />
            <span className="zoom-val font-mono">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="crop-metric-badge font-mono">
            {Math.round(cropNorm.w * imageFile.width)} × {Math.round(cropNorm.h * imageFile.height)} px
          </div>
        </div>

        {/* Footer Actions (matching Reference Image 1 "Cancel" & "Crop & Save") */}
        <div className="crop-modal-footer">
          <button type="button" onClick={handleReset} className="btn-secondary">
            <RotateCcw size={16} />
            <span>{t.crop.resetCrop}</span>
          </button>

          <div className="footer-right-actions">
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-ghost">
                {t.cancel}
              </button>
            )}
            <button type="button" onClick={handleApply} className="btn-crop-save">
              <Check size={18} />
              <span>{t.crop.applyCrop}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .crop-modal-overlay {
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

        .crop-modal-card {
          width: 100%;
          max-width: 820px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-base);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .crop-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .header-title-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-2-5);
        }

        .modal-icon {
          color: var(--color-primary);
        }

        .modal-title {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          color: var(--color-text-secondary);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          transition: color var(--duration-fast),
                      background-color var(--duration-fast);
        }

        .close-btn:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-surface-hover);
        }

        .ratio-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-6);
          background: var(--color-bg-subtle);
          border-bottom: 1px solid var(--color-border-subtle);
          overflow-x: auto;
        }

        .ratio-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .ratio-pill-list {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .crop-viewport {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-height: 360px;
          max-height: 520px;
          background: #000000;
          overflow: hidden;
          touch-action: none;
          user-select: none;
          cursor: default;
        }

        .crop-viewport.is-pannable {
          cursor: grab;
        }

        .crop-viewport.is-pannable:active {
          cursor: grabbing;
        }

        .crop-image-container {
          position: relative;
          display: inline-block;
          max-width: 90%;
          max-height: 90%;
          /* No transition: zoom tracks slider 1:1 with zero lag */
        }

        .crop-target-img {
          display: block;
          max-width: 100%;
          max-height: 480px;
          object-fit: contain;
          pointer-events: none;
        }

        /* Dark Scrim Overlays outside crop */
        .scrim {
          position: absolute;
          background: rgba(0, 0, 0, 0.65);
          pointer-events: none;
        }

        .top-scrim {
          top: 0;
          left: 0;
          right: 0;
        }

        .bottom-scrim {
          left: 0;
          right: 0;
          bottom: 0;
        }

        .left-scrim {
          left: 0;
        }

        .right-scrim {
          right: 0;
        }

        /* The Active Crop Box */
        .crop-frame {
          position: absolute;
          border: 2px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
          box-sizing: border-box;
          touch-action: none;
        }

        /* Rule of Thirds Grid */
        .grid-line {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          pointer-events: none;
        }

        .grid-h1 { top: 33.33%; left: 0; right: 0; height: 1px; }
        .grid-h2 { top: 66.66%; left: 0; right: 0; height: 1px; }
        .grid-v1 { left: 33.33%; top: 0; bottom: 0; width: 1px; }
        .grid-v2 { left: 66.66%; top: 0; bottom: 0; width: 1px; }

        /* Center Move Crosshair Handle */
        .crop-center-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: 1.5px solid #ffffff;
          color: #ffffff;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          z-index: 10;
        }

        .crop-center-handle:active {
          cursor: grabbing;
          background: var(--color-primary);
        }

        /* 8 Gripping Handles */
        .crop-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border: 1.5px solid #111827;
          border-radius: 2px;
          z-index: 5;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        }

        .handle-tl { top: -6px; left: -6px; cursor: nwse-resize; }
        .handle-top { top: -6px; left: calc(50% - 6px); cursor: ns-resize; }
        .handle-tr { top: -6px; right: -6px; cursor: nesw-resize; }
        .handle-right { top: calc(50% - 6px); right: -6px; cursor: ew-resize; }
        .handle-br { bottom: -6px; right: -6px; cursor: nwse-resize; }
        .handle-bottom { bottom: -6px; left: calc(50% - 6px); cursor: ns-resize; }
        .handle-bl { bottom: -6px; left: -6px; cursor: nesw-resize; }
        .handle-left { top: calc(50% - 6px); left: -6px; cursor: ew-resize; }

        .crop-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-6);
          background: var(--color-bg-subtle);
          border-top: 1px solid var(--color-border-subtle);
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .zoom-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .zoom-slider {
          width: 140px;
        }

        .control-label {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }

        .zoom-val {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-primary);
          min-width: 44px;
        }

        .crop-metric-badge {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
          background: var(--color-primary-subtle);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
        }

        .crop-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          background: var(--color-bg-base);
          border-top: 1px solid var(--color-border-subtle);
          gap: var(--space-3);
        }

        .footer-right-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .btn-ghost {
          padding: var(--space-3) var(--space-5);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-secondary);
          border-radius: var(--radius-lg);
          transition: color var(--duration-fast),
                      background-color var(--duration-fast);
        }

        .btn-ghost:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-subtle);
        }

        .btn-crop-save {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-6);
          min-height: 44px;
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          font-weight: 600;
          color: #ffffff;
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          transition: background-color var(--duration-fast) var(--ease-spring),
                      transform var(--duration-fast) var(--ease-spring),
                      box-shadow var(--duration-fast) var(--ease-spring);
        }

        .btn-crop-save:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.5);
        }
      `}</style>
    </div>
  );
};
