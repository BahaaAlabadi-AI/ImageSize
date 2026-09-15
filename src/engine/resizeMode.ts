export interface CropRectInput {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeModeResult {
  canvasW: number;
  canvasH: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dw: number;
  dh: number;
}

/**
 * Compute draw parameters for each resize mode.
 * Pure mathematical layout calculation with zero DOM/Canvas dependencies.
 *
 * Returns:
 *  - canvasW/canvasH: final output canvas dimensions
 *  - sx/sy/sw/sh:     source rect from original image (after crop)
 *  - dw/dh:           destination draw size on canvas (centered)
 */
export function computeResizeMode(
  mode: string,
  srcW: number,    // post-transform source width (may be rotated)
  srcH: number,    // post-transform source height
  destW: number,   // user-requested target width
  destH: number,   // user-requested target height
  cropX: number,   // crop origin x on original image
  cropY: number,   // crop origin y
  cropW: number,   // crop region width on original image
  cropH: number,   // crop region height
  isRotatedQuarter: boolean,
  crop: CropRectInput | null
): ResizeModeResult {
  const srcAspect = srcW / srcH;

  switch (mode) {
    case 'exact': {
      // Stretch/distort to exact destW×destH — only mode that can distort
      const dw = isRotatedQuarter ? destH : destW;
      const dh = isRotatedQuarter ? destW : destH;
      return { canvasW: destW, canvasH: destH, sx: cropX, sy: cropY, sw: cropW, sh: cropH, dw, dh };
    }

    case 'fill':
    case 'crop-to-fit': {
      // Scale to cover destW×destH, center-crop overflow (CSS object-fit: cover)
      // If 'crop-to-fit' and a user crop rect already exists, it provides sx/sy/sw/sh directly
      const destAspect = destW / destH;

      let sx: number, sy: number, sw: number, sh: number;

      if (mode === 'crop-to-fit' && crop) {
        // Honour the user's crop region — just fit it into the target box
        sx = cropX; sy = cropY; sw = cropW; sh = cropH;
      } else {
        // Center-crop: find the largest rectangle with destAspect inside the source
        if (srcAspect > destAspect) {
          // Source is wider — crop left/right
          const coverH = isRotatedQuarter ? cropW : cropH;
          const coverW = Math.round(coverH * destAspect);
          const offset = Math.round((cropW - coverW) / 2);
          sx = cropX + (isRotatedQuarter ? 0 : offset);
          sy = cropY + (isRotatedQuarter ? offset : 0);
          sw = isRotatedQuarter ? cropW : coverW;
          sh = isRotatedQuarter ? coverW : cropH;
        } else {
          // Source is taller — crop top/bottom
          const coverW = isRotatedQuarter ? cropH : cropW;
          const coverH = Math.round(coverW / destAspect);
          const offset = Math.round((cropH - coverH) / 2);
          sx = cropX + (isRotatedQuarter ? offset : 0);
          sy = cropY + (isRotatedQuarter ? 0 : offset);
          sw = isRotatedQuarter ? coverH : cropW;
          sh = isRotatedQuarter ? cropH : coverH;
        }
      }

      const dw = isRotatedQuarter ? destH : destW;
      const dh = isRotatedQuarter ? destW : destH;
      return { canvasW: destW, canvasH: destH, sx, sy, sw, sh, dw, dh };
    }

    case 'fit':
    default: {
      // Scale to fit within destW×destH preserving aspect ratio — no cropping
      const destAspect = destW / destH;
      let outW: number, outH: number;

      if (srcAspect > destAspect) {
        outW = destW;
        outH = Math.round(destW / srcAspect);
      } else {
        outH = destH;
        outW = Math.round(destH * srcAspect);
      }

      const dw = isRotatedQuarter ? outH : outW;
      const dh = isRotatedQuarter ? outW : outH;
      return { canvasW: outW, canvasH: outH, sx: cropX, sy: cropY, sw: cropW, sh: cropH, dw, dh };
    }
  }
}
