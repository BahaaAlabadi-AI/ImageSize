export const en = {
  appName: 'Image Size & Ratio Tool',
  appTagline: 'Prepare any image for exactly what you need — 100% private in your browser',
  privacyBadge: '100% Client-Side Privacy Guaranteed',
  privacyNotice: 'Your image is processed directly inside your browser. No pixels or metadata are ever uploaded to any server.',
  noAccount: 'No account needed • No watermark • 100% Free',

  // Actions
  uploadTitle: 'Drop your image here',
  uploadSubtitle: 'or click to browse from device',
  pasteHint: 'Supports pasting from clipboard (Ctrl+V or ⌘V)',
  supportedFormats: 'Supports JPG, PNG, WebP, AVIF, GIF, SVG',
  dropActive: 'Drop your image now to prepare it',
  chooseImage: 'Choose Image',
  batchUpload: 'Batch Mode: Drop multiple files or',
  addMoreImages: 'Add More Images',
  clearAll: 'Clear All',
  reset: 'Reset',
  apply: 'Apply Changes',
  download: 'Download Image',
  downloadAllZip: 'Download All (.ZIP)',
  cancel: 'Cancel',
  close: 'Close',
  save: 'Save',
  remove: 'Remove',
  preview: 'Preview',
  compare: 'Compare',
  original: 'Original',
  result: 'Result',
  processing: 'Processing image...',
  optimizing: 'Searching optimal quality...',

  // Navigation / Tools
  tools: {
    overview: 'Overview',
    resize: 'Resize',
    crop: 'Crop & Ratio',
    compress: 'Compress',
    convert: 'Convert Format',
    presets: 'Presets',
    rotate: 'Rotate & Flip',
    batch: 'Batch Mode',
    metadata: 'Metadata (EXIF)',
  },

  // Goals / Quick Wizards
  whatDoYouNeed: 'What do you want to do?',
  goals: {
    under200kb: {
      title: 'Make image under 200 KB',
      desc: 'Smart compression & resize for job portals and document forms',
    },
    instagram1080: {
      title: 'Make 1080 × 1080 for Instagram',
      desc: 'Perfect square crop & crisp export without stretching',
    },
    passport: {
      title: 'Passport Photo (35 × 45 mm)',
      desc: 'Official biometric passport dimensions at 300 DPI',
    },
    website: {
      title: 'Optimize for Website (WebP)',
      desc: 'Modern web format with optimal balance of speed and sharpness',
    },
    removeExif: {
      title: 'Remove Metadata & GPS',
      desc: 'Strip camera, location, and device EXIF info for privacy',
    },
  },

  // Resize Panel
  resize: {
    title: 'Resize Dimensions',
    width: 'Width (px)',
    height: 'Height (px)',
    lockAspect: 'Lock aspect ratio',
    lockAspectDesc: 'Maintains proportion without stretching',
    percentage: 'Resize by Percentage',
    preventEnlarge: 'Never enlarge smaller images',
    preventEnlargeDesc: 'Prevents blurriness by keeping image at or below original dimensions',
    fitMode: 'Sizing Behavior',
    modeFit: 'Fit (Contain)',
    modeFill: 'Fill (Cover)',
    modeCrop: 'Crop to Fit',
    modeExact: 'Exact (Stretch)',
    applyResize: 'Apply Resize',
  },

  // Crop Panel
  crop: {
    title: 'Interactive Crop & Ratio',
    aspectRatio: 'Aspect Ratio',
    freeCrop: 'Free / Unconstrained',
    customRatio: 'Custom Ratio',
    zoom: 'Zoom',
    dragHint: 'Drag the crop box or handles to reframe your image',
    centerHint: 'Drag center icon to reposition',
    applyCrop: 'Apply Crop',
    resetCrop: 'Reset Crop Frame',
  },

  // Compress Panel
  compress: {
    title: 'Compression & File Size',
    qualityLabel: 'Quality Slider',
    targetSizeTitle: 'Target Exact File Size',
    targetSizeDesc: 'Iteratively searches for optimal quality to fit under target threshold',
    customKb: 'Custom Size (KB)',
    smartCompress: '✨ Smart Compress',
    smartCompressDesc: 'Automatically balances dimensions and quality for optimal byte reduction',
    targetReached: 'Target reached: under',
    cannotGuarantee: 'Binary search found the closest optimal quality meeting safety thresholds',
  },

  // Convert Panel
  convert: {
    title: 'Format Conversion',
    selectFormat: 'Target Format',
    jpgDesc: 'Best for standard photos and universal compatibility (no transparency)',
    pngDesc: 'Best for sharp graphics, screenshots, and transparent backgrounds',
    webpDesc: 'Modern standard for web — high compression and full transparency',
    avifDesc: 'Next-gen web compression for supported browsers',
    transparencyAlert: 'This image has transparency. JPG format does not support transparent backgrounds.',
    matteColor: 'Select Matte Background Color for JPG',
    colorWhite: 'White',
    colorBlack: 'Black',
    colorCustom: 'Custom Hex',
  },

  // Presets Panel
  presets: {
    title: 'Ready-Made Dimension Presets',
    tabSocial: 'Social Media',
    tabPrint: 'Print & ID (300 DPI)',
    tabWeb: 'Web & UI',
    applyPreset: 'Apply Preset',
    dpiNote: 'Print presets are automatically calculated using pixel dimensions = Inches × 300 DPI',
  },

  // Rotate Panel
  rotate: {
    title: 'Rotate & Flip Utilities',
    rotateLeft: 'Rotate 90° Left',
    rotateRight: 'Rotate 90° Right',
    rotate180: 'Rotate 180°',
    flipH: 'Flip Horizontal',
    flipV: 'Flip Vertical',
  },

  // Metadata Panel
  metadata: {
    title: 'EXIF Metadata Inspector',
    safeDesc: 'Read camera parameters, lens settings, and GPS data embedded in the file.',
    noExif: 'No EXIF metadata found in this image (already clean).',
    stripButton: '🛡️ Remove All Metadata (Clean File)',
    strippedSuccess: 'Metadata stripped! Output file contains zero EXIF / GPS markers.',
    camera: 'Camera / Device',
    dateTaken: 'Date / Time',
    dimensions: 'Original Pixels',
    location: 'GPS Coordinates',
    software: 'Software / App',
  },

  // Comparison & Stats
  stats: {
    dimensions: 'Dimensions',
    fileSize: 'File Size',
    format: 'Format',
    aspectRatio: 'Aspect Ratio',
    savings: 'Savings',
    reduction: 'smaller',
    splitView: 'Split Slider Comparison',
    sideBySide: 'Side by Side',
  },

  // Batch
  batch: {
    title: 'Batch Processing Queue',
    itemsCount: 'images queued',
    applyToAll: 'Apply Current Settings to All',
    processAll: 'Process All Images',
    zipReady: 'All processed! Download ZIP bundle.',
  },

  // General Statuses
  success: 'Success',
  copied: 'Copied to clipboard!',
  themeToggle: 'Switch Theme',
  langToggle: 'Language / اللغة',

  // Error Messages
  errors: {
    unsupportedFormat: {
      title: 'Cannot open this file',
      message: "We couldn't open this image format in your browser. Try JPG, PNG, or WebP.",
      suggestions: ['Convert the file to JPG, PNG, or WebP first', 'Make sure the file is not corrupted'],
    },
    imageTooLarge: {
      title: 'Image too large for memory',
      message: "This image is too large for your device's available memory.",
      suggestions: ['Try a smaller source image', 'Lower the output dimensions', 'Close other browser tabs to free memory'],
    },
    targetSizeNotReached: {
      title: 'Target size not fully reached',
      message: 'The file could not be compressed to your target — the minimum quality was already applied.',
      suggestions: ['Try a lower target size limit', 'Switch to WebP format for better compression', 'Reduce the image dimensions first'],
    },
    processingFailed: {
      title: 'Processing failed',
      message: 'Something went wrong while processing this image.',
      suggestions: ['Try again', 'Check the image is not corrupted'],
    },
    batchFailed: {
      title: 'Batch processing error',
      message: 'One or more images could not be processed.',
      suggestions: ['Check that all files are valid images', 'Try processing them one at a time'],
    },
  },
};
