# AI Build Prompt — Image Size & Ratio Tool

You are an expert full-stack/frontend engineer, UX designer, browser-image-processing engineer, and product architect.

Your task is to build a production-quality web application called:

# Image Size & Ratio Tool

## 1. Product Goal

Build a fast, modern, privacy-first image preparation website that allows users to upload an image and quickly:

- resize it,
- crop it,
- change its aspect ratio,
- compress it,
- reduce it to a target file size,
- convert its format,
- rotate it,
- flip it,
- apply common presets,
- compare before/after results,
- and download the final image.

The application should feel like a **problem-solving image utility**, not like a complex Photoshop clone.

The core promise is:

> "Prepare any image for exactly what you need."

---

# 2. Critical Product Requirements

## Privacy

The core image-processing workflow MUST run locally in the browser.

Do NOT upload the user's image to a backend.

Do NOT send image pixels, thumbnails, EXIF data, or image files to analytics.

The UI should clearly communicate:

> Your image is processed in your browser and does not need to be uploaded.

Do not make privacy claims that are not technically true.

---

# 3. No Account

The core experience must work without:

- registration,
- login,
- email,
- password,
- payment.

The desired flow is:

```text
Open site
→ Upload image
→ Process image
→ Download result
```

---

# 4. No Watermark

Never add a watermark to the user's output.

---

# 5. Mobile-First UX

Design mobile-first.

Many users will use this tool directly from their phone while submitting an application, posting on social media, or preparing a photo.

Use:

- large touch targets,
- large upload area,
- simple controls,
- responsive preview,
- easy download,
- sticky primary action where useful.

Desktop should scale naturally from the mobile design.

---

# 6. Main User Experience

The homepage should immediately ask:

# What do you want to do?

Present clear choices:

- Resize Image
- Crop Image
- Compress Image
- Convert Image
- Make Image Under a Certain Size
- Prepare for Social Media
- Prepare for Printing
- Remove Metadata

Do NOT put dozens of technical settings on the first screen.

---

# 7. Upload Experience

Support:

- Click to upload
- Drag and drop
- Clipboard paste with Ctrl/Cmd + V

Show supported formats based on the actual implementation.

Use a clear drop zone such as:

```text
Drop your image here

or

[ Choose Image ]

JPG • PNG • WebP • ...
```

After upload, immediately show:

- preview,
- file name,
- width,
- height,
- aspect ratio,
- format,
- file size.

---

# 8. Core Features

## A. Resize

Support:

- exact width,
- exact height,
- percentage resize,
- max-width,
- max-height,
- aspect-ratio lock,
- prevent enlargement.

Example:

```text
Width: 1080
Height: 1080
☑ Lock aspect ratio
```

If aspect-ratio lock is enabled, automatically calculate the second dimension.

Do not stretch images unless the user explicitly chooses a stretch mode.

---

## B. Aspect Ratio

Automatically calculate the original aspect ratio.

Support presets:

- 1:1
- 4:3
- 3:2
- 16:9
- 9:16
- 4:5
- 5:4
- custom

Allow custom ratio input.

When changing the ratio, default to crop-to-fit rather than distortion.

---

## C. Crop

Provide an interactive crop UI.

Requirements:

- draggable crop area,
- zoom,
- pan,
- fixed ratio,
- free crop,
- preview,
- reset.

The crop frame must remain proportional when a fixed aspect ratio is selected.

---

## D. Compression

Support:

- quality slider,
- smart compression,
- target file size,
- before/after comparison.

Example:

```text
Original:
3.2 MB

Target:
500 KB

[ Compress ]
```

After processing:

```text
Result:
468 KB
85% smaller
```

Do not promise "zero quality loss" for lossy compression.

---

## E. Target File Size

Support workflows such as:

- 50 KB
- 100 KB
- 200 KB
- 500 KB
- 1 MB
- 2 MB
- custom target

For target-size compression, implement an iterative quality search where appropriate.

Important:

- The exact target cannot always be mathematically guaranteed.
- The tool should return a result at or below the target when technically possible.
- If impossible with current settings, explain why and recommend:
  - another format,
  - lower dimensions,
  - lower quality,
  - or removing unnecessary transparency.

---

## F. Format Conversion

MVP formats:

- JPG/JPEG
- PNG
- WebP

Advanced formats:

- AVIF
- HEIC/HEIF

Do not add a format to the UI until its browser compatibility and decoder/encoder strategy are actually implemented and tested.

---

# 9. Transparency Handling

When converting transparent images to JPG, explain that JPG cannot preserve transparency.

Provide a background selector:

- White
- Black
- Custom color

When possible, offer WebP/PNG/AVIF if the user wants transparency preserved.

---

# 10. EXIF Orientation

Normalize image orientation correctly before applying transformations.

Test images from smartphones where the displayed orientation depends on EXIF data.

Do not create sideways output images.

---

# 11. Metadata

Provide an optional metadata tool.

Display when available:

- width,
- height,
- format,
- file size,
- EXIF metadata,
- camera information,
- timestamp,
- GPS metadata.

Allow:

> Remove Metadata

Metadata removal should happen locally.

Do not expose sensitive metadata in analytics.

---

# 12. Rotate and Flip

Support:

- rotate 90°,
- rotate 180°,
- rotate 270°,
- flip horizontally,
- flip vertically.

These should be fast and previewable.

---

# 13. Before/After View

Always make the result easy to understand.

Example:

```text
BEFORE
4032 × 3024
3.2 MB
JPG

AFTER
1600 × 1200
480 KB
WebP

85% smaller
```

Use a visual comparison when appropriate.

Do not show fake file-size estimates after processing; show the actual output file size once available.

---

# 14. Presets

Build a preset system.

Categories:

## Social Media

Include configurable presets for common:

- Instagram formats,
- YouTube thumbnail,
- Facebook formats,
- LinkedIn formats,
- X/Twitter formats,
- Pinterest formats.

Do not hard-code platform requirements as permanent truth.

Store preset data in a configuration structure so dimensions can be updated easily.

## Print

Include configurable presets for:

- 2×2 inch,
- 4×6 inch,
- 5×7 inch,
- 8×10 inch,
- 35×45 mm,
- custom mm/inch,
- DPI.

## Web

Include:

- hero image,
- blog thumbnail,
- Open Graph image,
- product thumbnail,
- avatar.

Treat all platform/web dimensions as recommended presets unless a specific requirement has been verified.

---

# 15. Print Dimensions

Support:

```text
Width
Height
Unit:
mm / inch

DPI:
[ 300 ]
```

Calculate pixel dimensions from:

```text
pixels = inches × DPI
```

Example:

```text
4 × 6 inches at 300 DPI
→
1200 × 1800 pixels
```

Explain that DPI metadata and actual pixel dimensions are different concepts.

Do not falsely claim that changing DPI metadata creates more image detail.

---

# 16. Max Dimension

Provide:

```text
Max Width:
1920 px

Max Height:
1920 px
```

Preserve the original ratio.

Example:

```text
5000 × 3500
→
1920 × 1344
```

Do not blindly force both dimensions to the maximum.

---

# 17. Prevent Enlargement

Add:

```text
☑ Never enlarge smaller images
```

If the user requests 2000 px for an 800 px original, show a warning or keep the original based on the selected setting.

---

# 18. Batch Processing

Support multiple images.

Users should be able to:

```text
Drop 10 images
→
Apply same preset
→
Process
→
Download All
```

Support:

- batch resize,
- batch compress,
- batch convert,
- batch metadata removal where implemented.

Generate a ZIP locally for batch downloads if practical.

Do not block the interface during a long batch.

Show progress.

---

# 19. Local Architecture

Use browser-side processing.

Recommended architecture:

```text
File
 ↓
Decode
 ↓
Orientation normalization
 ↓
Analysis
 ↓
Crop
 ↓
Resize
 ↓
Rotate/Flip
 ↓
Encode
 ↓
Validate
 ↓
Blob
 ↓
Download
```

Use appropriate browser APIs.

Potential APIs:

- File API
- Blob
- URL.createObjectURL
- Canvas
- createImageBitmap
- OffscreenCanvas
- Web Workers
- Clipboard API
- Drag and Drop API

Use `createImageBitmap()` where it improves decode/crop/resize workflows.

Use canvas export methods such as `toBlob()` for output creation.

For heavy work, use Web Workers and OffscreenCanvas when appropriate.

---

# 20. Performance

The site must stay responsive.

Do not freeze the main UI while processing large images.

For large files:

- use workers,
- avoid unnecessary copies,
- release object URLs,
- manage memory,
- process batch items with controlled concurrency,
- show progress.

Handle very large images gracefully.

If a file cannot be processed due to device/browser memory limits, show a friendly message instead of crashing.

---

# 21. Browser Compatibility

The application must be tested across modern:

- Chrome,
- Edge,
- Firefox,
- Safari.

Do not expose AVIF/HEIC features blindly.

Feature-detect browser support before offering a format.

Provide fallback options when possible.

---

# 22. File Naming

Preserve a safe version of the original file name.

Examples:

```text
photo.jpg
→
photo-resized.webp

image.png
→
image-compressed.jpg
```

Do not overwrite the original file automatically.

---

# 23. Download

Single file:

```text
[ Download Image ]
```

Batch:

```text
[ Download All ]
```

For batch processing, provide ZIP download when feasible.

---

# 24. Error Handling

Create useful errors for:

- unsupported file,
- corrupted image,
- enormous image,
- unsupported codec,
- target size impossible,
- browser memory failure,
- output encoding failure.

Never expose raw stack traces to users.

Example:

```text
This image is too large for your browser to process safely.

Try:
• a smaller source image
• lower output dimensions
```

---

# 25. Design System

Visual style:

- modern,
- minimal,
- trustworthy,
- clean,
- fast,
- professional.

Avoid:

- excessive gradients,
- giant decorative illustrations,
- unnecessary animations,
- cluttered dashboards.

The primary action should always be obvious.

Use accessible contrast.

---

# 26. Suggested Main Screen

Create this structure:

```text
--------------------------------------------

IMAGE READY

Resize • Crop • Compress • Convert

[ Drop Image Here ]

or

[ Choose Image ]

--------------------------------------------

What do you need?

[ Resize ]
[ Crop ]
[ Compress ]
[ Convert ]

[ Social Media ]
[ Print ]
[ Metadata ]

--------------------------------------------
```

After upload:

```text
Preview
--------------------
|                  |
|      IMAGE       |
|                  |
--------------------

4032 × 3024
4:3
3.2 MB
JPG
```

---

# 27. Resize UI

```text
Resize Image

Width
[ 1080 ]

Height
[ 1080 ]

☑ Lock aspect ratio

Mode
○ Fit
○ Fill
○ Crop to fit
○ Exact

☑ Prevent enlargement

[ Apply Resize ]
```

---

# 28. Crop UI

```text
Crop

Aspect Ratio
[ 1:1 ▼ ]

1:1
4:5
16:9
9:16
3:2
Custom

Zoom
[────●────]

[ Reset ]

[ Apply Crop ]
```

The crop editor must be touch-friendly.

---

# 29. Compress UI

```text
Compress

Original
3.2 MB

Target Size
[ 500 KB ]

Quality
[────●────]

Format
[ WebP ▼ ]

Estimated Result
~

[ Compress Image ]
```

After processing:

```text
468 KB
85.4% smaller
```

---

# 30. Smart Goal-Based Workflow

Add a higher-level mode:

# What do you need?

Examples:

### "Make my image under 200 KB"

The tool should automatically recommend:

- resize if dimensions are unnecessarily large,
- an efficient format,
- an appropriate quality setting.

### "Make this 1080 × 1080"

The tool should:

- determine current ratio,
- suggest crop if needed,
- let the user reposition,
- export exact dimensions.

### "Prepare for a website"

The tool should suggest:

- sensible max dimension,
- WebP/AVIF where appropriate,
- balanced compression.

No AI API is necessary for these recommendations. Start with deterministic rules.

---

# 31. SEO

Create separate pages for high-intent tasks.

Examples:

```text
/image-resizer
/image-cropper
/image-compressor
/image-to-200kb
/image-to-500kb
/image-to-1mb
/jpg-to-webp
/png-to-webp
/heic-to-jpg
/image-to-1080x1080
/image-to-1920x1080
/instagram-image-resizer
/youtube-thumbnail-resizer
/passport-photo-resizer
/photo-to-35x45mm
```

Each page must contain:

- its own focused tool state,
- explanatory text,
- examples,
- FAQs,
- related links,
- useful instructions.

Avoid creating thin duplicate pages.

---

# 32. SEO Copy

Do not keyword-stuff.

Write for real user intent.

Example title:

> Resize Image to Exact Pixels Online — Free & Private

Example description:

> Resize, crop, and compress images to exact dimensions directly in your browser. No account and no image upload required for local processing.

---

# 33. PWA / Offline

Consider a PWA after the MVP.

Goal:

```text
Load application
↓
Cache app
↓
Internet unavailable
↓
Image processing still works locally
```

Do not promise offline capability until it is actually implemented and tested.

---

# 34. Future Features

After the MVP works:

- HEIC/HEIF
- AVIF
- EXIF viewer/remover
- batch ZIP
- saved local presets
- favicon generator
- signature image preparation
- passport photo workflow
- platform presets
- web image presets
- offline PWA
- smart requirement modes
- local OCR
- local AI enhancement
- smart crop suggestions
- local upscaling

Do not add all of these in the first release.

---

# 35. MVP Scope

The MVP MUST include:

### Upload
- click
- drag/drop

### Image information
- dimensions
- ratio
- format
- size

### Resize
- exact dimensions
- percentage
- ratio lock
- max dimension
- prevent enlargement

### Crop
- free
- 1:1
- 4:5
- 3:2
- 4:3
- 16:9
- 9:16
- custom

### Compression
- quality slider
- target size
- before/after size

### Conversion
- JPG
- PNG
- WebP

### Utilities
- rotate
- flip
- download

### Product principles
- local processing
- no account
- no watermark
- mobile-first

---

# 36. Code Quality

Use:

- TypeScript where appropriate,
- strong typing,
- reusable components,
- reusable image-processing utilities,
- clean state management,
- clear separation between UI and image engine,
- defensive validation,
- tests for conversion calculations and dimension logic.

Do not place all logic in one giant component.

Suggested structure:

```text
src/
  components/
    UploadZone
    ImagePreview
    ResizePanel
    CropPanel
    CompressPanel
    ConvertPanel
    PresetPicker
    ResultPanel
    BatchList

  image/
    decode
    resize
    crop
    compress
    convert
    metadata
    orientation
    download

  utils/
    aspectRatio
    dimensions
    validation
    fileSize

  data/
    presets
```

---

# 37. Testing

Test at minimum:

- portrait image,
- landscape image,
- square image,
- transparent PNG,
- JPEG photo,
- WebP,
- large phone photo,
- EXIF-oriented photo,
- batch files,
- target 200 KB,
- target 500 KB,
- crop 1:1,
- crop 16:9,
- exact 1080×1080,
- max-width resize,
- prevent enlargement,
- invalid inputs.

---

# 38. Important Product Rules

1. Never distort an image silently.
2. Never upload the image for core processing.
3. Never overwrite the original file.
4. Never claim exact file-size guarantees when the encoder cannot guarantee them.
5. Never claim a platform requirement is permanent unless verified.
6. Never expose user image metadata to analytics.
7. Always make the final result easy to download.
8. Make simple workflows require very few interactions.
9. Keep the UI understandable to non-technical users.
10. Make advanced settings optional.

---

# 39. Expected Final Experience

A user should be able to say:

> "I need this image to be 1080×1080 and under 200 KB."

The application should make the workflow obvious:

```text
Upload
↓
Select 1080×1080
↓
Crop if necessary
↓
Target 200 KB
↓
Smart compression
↓
Preview result
↓
Download
```

Result:

```text
✓ Ready

1080 × 1080
186 KB
WebP

Original:
2.8 MB

Reduction:
93.4%

[ Download ]
```

---

# 40. Final Development Instruction

Build the MVP first.

Prioritize:

**Accuracy > simplicity > performance > visual polish > advanced features**

Do not add backend infrastructure unless a feature truly requires it.

Do not add AI APIs to solve problems that deterministic browser-side logic can already solve.

The final application should feel:

**Fast + Exact + Private + Simple + Free**

Start by implementing the core image engine and a polished mobile-first interface. Then add advanced features incrementally without breaking the core local-processing workflow.
