import { ImageFile } from '../types/image';
import { calculateAspectRatio } from '../utils/formatters';
import { parseExif } from './metadata';

export async function decodeImageFile(file: File): Promise<ImageFile> {
  const dataUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const { ratio, text: aspectRatioText } = calculateAspectRatio(width, height);
        
        // Check transparency for PNG/WebP/GIF
        const hasTransparency = await checkImageTransparency(img, file.type);
        const exif = await parseExif(file);

        const imageFile: ImageFile = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          width,
          height,
          aspectRatio: ratio,
          aspectRatioText,
          dataUrl,
          hasTransparency,
          exif,
        };

        resolve(imageFile);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(dataUrl);
      reject(new Error('Failed to decode image file. Format may be corrupted or unsupported.'));
    };

    img.src = dataUrl;
  });
}

async function checkImageTransparency(img: HTMLImageElement, mimeType: string): Promise<boolean> {
  if (!mimeType.includes('png') && !mimeType.includes('webp') && !mimeType.includes('gif') && !mimeType.includes('svg')) {
    return false;
  }

  try {
    const testCanvas = document.createElement('canvas');
    // Sample down to max 64x64 for instant inspection
    const sampleW = Math.min(img.naturalWidth, 64);
    const sampleH = Math.min(img.naturalHeight, 64);
    testCanvas.width = sampleW;
    testCanvas.height = sampleH;

    const ctx = testCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;

    // Check if any pixel alpha channel is < 255
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] < 250) {
        return true;
      }
    }
  } catch {
    // If security error (CORS) or canvas failure, fallback
    return false;
  }

  return false;
}
