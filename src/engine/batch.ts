import JSZip from 'jszip';
import { ImageFile, ResizeOptions, CompressOptions, TransformOptions, ProcessedResult } from '../types/image';
import { processImage } from './transform';
import { triggerBlobDownload } from '../utils/download';

export interface BatchItemStatus {
  file: ImageFile;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: ProcessedResult;
  error?: string;
}

export async function processBatchQueue(
  items: ImageFile[],
  options: {
    resize?: ResizeOptions;
    compress?: CompressOptions;
    transform?: TransformOptions;
  },
  onProgress?: (progress: number, currentItem: string) => void
): Promise<ProcessedResult[]> {
  const results: ProcessedResult[] = [];
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    if (onProgress) {
      onProgress(Math.round((i / total) * 100), item.name);
    }

    try {
      const res = await processImage(item, options);
      results.push(res);
    } catch (err) {
      console.error(`Failed to process batch item: ${item.name}`, err);
    }
  }

  if (onProgress) {
    onProgress(100, 'Done');
  }

  return results;
}

export async function createBatchZip(results: ProcessedResult[], zipName = 'processed-images.zip'): Promise<void> {
  const zip = new JSZip();

  results.forEach((res) => {
    zip.file(res.filename, res.blob);
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  triggerBlobDownload(zipBlob, zipName);
}
