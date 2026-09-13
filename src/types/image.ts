export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export interface ExifInfo {
  make?: string;
  model?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: number;
  isoSpeedRatings?: number;
  focalLength?: number;
  orientation?: number;
  latitude?: number;
  longitude?: number;
  software?: string;
  copyright?: string;
  hasExif: boolean;
}

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: number;
  aspectRatioText: string;
  dataUrl: string;
  hasTransparency: boolean;
  exif: ExifInfo;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeFitMode = 'fit' | 'fill' | 'crop-to-fit' | 'exact';

export interface ResizeOptions {
  width: number;
  height: number;
  lockAspectRatio: boolean;
  mode: ResizeFitMode;
  preventEnlargement: boolean;
  percentage: number;
  usePercentage: boolean;
}

export interface CompressOptions {
  quality: number; // 1 to 100
  targetSizeKb?: number | null;
  format: OutputFormat;
  matteColor: string; // for transparency conversion, e.g. '#ffffff'
  removeMetadata: boolean;
}

export interface TransformOptions {
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export type PresetCategory = 'social' | 'print' | 'web' | 'device';

export interface PresetItem {
  id: string;
  name: string;
  category: PresetCategory;
  platform?: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  badge?: string;
  dpi?: number;
  unit?: 'px' | 'in' | 'mm';
}

export interface ProcessedResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  format: OutputFormat;
  filename: string;
  aspectRatio: string;
  compressionRatio: number; // e.g. 85%
  reductionBytes: number;
  durationMs: number;
}

export type ActiveTool =
  | 'overview'
  | 'crop'
  | 'resize'
  | 'compress'
  | 'convert'
  | 'presets'
  | 'rotate'
  | 'batch'
  | 'metadata';

export type QuickWizard =
  | 'make-under-200kb'
  | 'instagram-1080'
  | 'website-ready'
  | 'passport-35x45'
  | 'remove-exif';
