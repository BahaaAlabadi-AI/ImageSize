export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function calculateAspectRatio(width: number, height: number): { ratio: number; text: string } {
  if (!width || !height || width <= 0 || height <= 0) {
    return { ratio: 1, text: '1:1' };
  }

  const ratio = width / height;
  
  // Check common photographic and screen ratios within tolerance
  const knownRatios: Array<{ ratio: number; text: string }> = [
    { ratio: 1 / 1, text: '1:1' },
    { ratio: 4 / 5, text: '4:5' },
    { ratio: 5 / 4, text: '5:4' },
    { ratio: 16 / 9, text: '16:9' },
    { ratio: 9 / 16, text: '9:16' },
    { ratio: 4 / 3, text: '4:3' },
    { ratio: 3 / 4, text: '3:4' },
    { ratio: 3 / 2, text: '3:2' },
    { ratio: 2 / 3, text: '2:3' },
    { ratio: 2 / 1, text: '2:1' },
    { ratio: 21 / 9, text: '21:9' },
    { ratio: 1.91, text: '1.91:1' },
  ];

  for (const item of knownRatios) {
    if (Math.abs(ratio - item.ratio) < 0.015) {
      return { ratio, text: item.text };
    }
  }

  // Otherwise calculate simplified fraction via GCD
  const divisor = gcd(Math.round(width), Math.round(height));
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);

  // If fraction terms are small enough, use them
  if (w <= 32 && h <= 32) {
    return { ratio, text: `${w}:${h}` };
  }

  // Otherwise decimal approximation
  return { ratio, text: `${ratio.toFixed(2)}:1` };
}

export function parseDpiDimensions(
  unit: 'in' | 'mm',
  width: number,
  height: number,
  dpi = 300
): { pxWidth: number; pxHeight: number } {
  if (unit === 'in') {
    return {
      pxWidth: Math.round(width * dpi),
      pxHeight: Math.round(height * dpi),
    };
  }
  // mm to inches = mm / 25.4
  return {
    pxWidth: Math.round((width / 25.4) * dpi),
    pxHeight: Math.round((height / 25.4) * dpi),
  };
}

export function getFileExtension(format: string): string {
  switch (format) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    default:
      return 'jpg';
  }
}

export function generateSafeFileName(
  originalName: string,
  suffix: string,
  targetFormat: string
): string {
  const dotIndex = originalName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
  const safeBase = baseName.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');
  const ext = getFileExtension(targetFormat);
  return `${safeBase}-${suffix}.${ext}`;
}
