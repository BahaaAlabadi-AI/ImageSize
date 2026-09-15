import {
  ImageFile,
  CropRect,
  ResizeOptions,
  CompressOptions,
  TransformOptions,
  ProcessedResult,
  OutputFormat,
} from '../types/image';
import { calculateAspectRatio, generateSafeFileName } from '../utils/formatters';
import { computeResizeMode } from './resizeMode';

export { computeResizeMode };

// Extended result from binarySearchTargetSize so callers can surface warnings
export interface BinarySearchResult {
  blob: Blob;
  targetReached: boolean;
  actualSizeKb: number;
}

export async function processImage(
  imageFile: ImageFile,
  options: {
    crop?: CropRect | null;
    resize?: ResizeOptions;
    compress?: CompressOptions;
    transform?: TransformOptions;
  }
): Promise<ProcessedResult & { targetSizeWarning?: { actualKb: number; targetKb: number } }> {
  const startTime = performance.now();

  const {
    crop = null,
    resize = {
      width: imageFile.width,
      height: imageFile.height,
      lockAspectRatio: true,
      mode: 'fit',
      preventEnlargement: false,
      percentage: 100,
      usePercentage: false,
    },
    compress = {
      quality: 85,
      targetSizeKb: null,
      format: imageFile.type.includes('png') ? 'image/png' : 'image/jpeg',
      matteColor: '#ffffff',
      removeMetadata: true,
    },
    transform = {
      rotate: 0,
      flipH: false,
      flipV: false,
    },
  } = options;

  // 1. Load image into HTMLImageElement
  const img = await loadImageElement(imageFile.dataUrl);

  // 2. Determine crop source rectangle
  const srcX = crop ? Math.max(0, crop.x) : 0;
  const srcY = crop ? Math.max(0, crop.y) : 0;
  const srcW = crop ? Math.min(crop.width, imageFile.width - srcX) : imageFile.width;
  const srcH = crop ? Math.min(crop.height, imageFile.height - srcY) : imageFile.height;

  // Check if 90 or 270 degree rotation swaps dimensions
  const isRotatedQuarter = transform.rotate === 90 || transform.rotate === 270;
  const postTransformSrcW = isRotatedQuarter ? srcH : srcW;
  const postTransformSrcH = isRotatedQuarter ? srcW : srcH;

  // 3. Calculate target output dimensions
  let destW = resize.width;
  let destH = resize.height;

  if (resize.usePercentage) {
    const factor = Math.max(1, resize.percentage) / 100;
    destW = Math.round(postTransformSrcW * factor);
    destH = Math.round(postTransformSrcH * factor);
  } else if (resize.lockAspectRatio && resize.mode !== 'exact') {
    const aspect = postTransformSrcW / postTransformSrcH;
    // Recalculate based on provided dimension
    if (resize.width !== postTransformSrcW) {
      destW = resize.width;
      destH = Math.round(destW / aspect);
    } else {
      destH = resize.height;
      destW = Math.round(destH * aspect);
    }
  }

  // Prevent enlargement if checked (not applicable to exact mode)
  if (resize.preventEnlargement && resize.mode !== 'exact') {
    if (destW > postTransformSrcW) destW = postTransformSrcW;
    if (destH > postTransformSrcH) destH = postTransformSrcH;
  }

  destW = Math.max(1, Math.round(destW));
  destH = Math.max(1, Math.round(destH));

  // 4. Apply resize mode logic to determine final canvas dimensions and draw parameters
  const mode = resize.mode || 'fit';
  const drawResult = computeResizeMode(
    mode,
    postTransformSrcW,
    postTransformSrcH,
    destW,
    destH,
    srcX,
    srcY,
    srcW,
    srcH,
    isRotatedQuarter,
    crop
  );

  // 5. Create primary drawing canvas
  const canvas = document.createElement('canvas');
  canvas.width = drawResult.canvasW;
  canvas.height = drawResult.canvasH;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not acquire 2D canvas context');

  // Enable highest quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 6. Matte background for JPG or when transparency removal is desired
  const isJpg = compress.format === 'image/jpeg';
  if (isJpg || (imageFile.hasTransparency && compress.matteColor)) {
    ctx.fillStyle = compress.matteColor || '#ffffff';
    ctx.fillRect(0, 0, drawResult.canvasW, drawResult.canvasH);
  }

  // 7. Apply transforms (Rotate, Flip, Scale) and draw
  ctx.save();
  ctx.translate(drawResult.canvasW / 2, drawResult.canvasH / 2);

  if (transform.rotate !== 0) {
    ctx.rotate((transform.rotate * Math.PI) / 180);
  }

  const scaleX = transform.flipH ? -1 : 1;
  const scaleY = transform.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  ctx.drawImage(
    img,
    drawResult.sx,
    drawResult.sy,
    drawResult.sw,
    drawResult.sh,
    -drawResult.dw / 2,
    -drawResult.dh / 2,
    drawResult.dw,
    drawResult.dh
  );

  ctx.restore();

  // 8. Format conversion and compression search
  let finalBlob: Blob;
  let targetSizeWarning: { actualKb: number; targetKb: number } | undefined;
  const targetFormat = detectSupportedFormat(compress.format);

  if (compress.targetSizeKb && compress.targetSizeKb > 0 && targetFormat !== 'image/png') {
    const searchResult = await binarySearchTargetSize(canvas, targetFormat, compress.targetSizeKb * 1024);
    finalBlob = searchResult.blob;
    if (!searchResult.targetReached) {
      targetSizeWarning = {
        actualKb: searchResult.actualSizeKb,
        targetKb: compress.targetSizeKb,
      };
    }
  } else {
    const q = Math.min(1.0, Math.max(0.01, compress.quality / 100));
    finalBlob = await canvasToBlobAsync(canvas, targetFormat, q);
  }

  const durationMs = Math.round(performance.now() - startTime);
  const resultDataUrl = URL.createObjectURL(finalBlob);
  const { text: resultAspectRatio } = calculateAspectRatio(drawResult.canvasW, drawResult.canvasH);
  
  const reductionBytes = imageFile.size - finalBlob.size;
  const compressionRatio = Math.round(((imageFile.size - finalBlob.size) / imageFile.size) * 100);

  const safeFilename = generateSafeFileName(imageFile.name, 'prepared', targetFormat);

  return {
    blob: finalBlob,
    dataUrl: resultDataUrl,
    width: drawResult.canvasW,
    height: drawResult.canvasH,
    size: finalBlob.size,
    format: targetFormat,
    filename: safeFilename,
    aspectRatio: resultAspectRatio,
    compressionRatio,
    reductionBytes,
    durationMs,
    targetSizeWarning,
  };
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image element'));
    img.src = url;
  });
}

function canvasToBlobAsync(canvas: HTMLCanvasElement, format: OutputFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas encoding failed'));
      },
      format,
      quality
    );
  });
}

function detectSupportedFormat(requested: OutputFormat): OutputFormat {
  if (requested === 'image/avif') {
    // Check if browser actually encodes AVIF via a 1x1 test canvas
    const test = document.createElement('canvas');
    test.width = 1;
    test.height = 1;
    const url = test.toDataURL('image/avif');
    if (!url.startsWith('data:image/avif')) {
      return 'image/webp'; // Fallback to WebP
    }
  }
  return requested;
}

// Iterative binary search solver for exact target size
async function binarySearchTargetSize(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  targetBytes: number
): Promise<BinarySearchResult> {
  let low = 0.05;
  let high = 0.98;
  let bestBlob: Blob | null = null;

  // Up to 7 iterations gives precision within ~1%
  for (let i = 0; i < 7; i++) {
    const mid = (low + high) / 2;
    const blob = await canvasToBlobAsync(canvas, format, mid);

    if (blob.size <= targetBytes) {
      bestBlob = blob; // Candidate that satisfies constraint
      low = mid; // Try higher quality
    } else {
      high = mid; // Needs stronger compression
    }
  }

  if (bestBlob) {
    return { blob: bestBlob, targetReached: true, actualSizeKb: Math.round(bestBlob.size / 1024) };
  }

  // Even quality=0.05 was larger than targetBytes — return lowest quality blob with warning
  const lowestBlob = await canvasToBlobAsync(canvas, format, 0.05);
  return {
    blob: lowestBlob,
    targetReached: false,
    actualSizeKb: Math.round(lowestBlob.size / 1024),
  };
}
