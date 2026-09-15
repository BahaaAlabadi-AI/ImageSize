# AI Fix Prompt — Image Size & Ratio Tool (Post-Launch Bug Fix & Hardening Pass)

You are an expert full-stack/frontend engineer, UX designer, and browser-image-processing engineer. You are working on an EXISTING, already-deployed React + TypeScript + Vite codebase (`Image Size & Ratio Tool`). Do NOT rewrite the app from scratch. This is a targeted fix pass on a working MVP.

Read the existing project files `Image_Size_Ratio_Tool_Detailed_Specification.md` and `Image_Size_Ratio_Tool_AI_Build_Prompt.md` in the repo root for full product context before making changes — they define the original product intent that every fix below must stay consistent with.

Work through the items below **in priority order**. For each item: locate the exact file/function referenced, implement the fix, and verify it against the acceptance criteria before moving to the next item. After all critical and moderate items are done, run `npm run build` and `node verify-calculations.mjs` (or the project's equivalent test runner) and confirm both succeed with zero errors before considering the pass complete.

---

## PRIORITY 1 — Critical functional bugs (fix these first)

### 1.1 Resize "mode" selector is completely non-functional

**Problem:** `src/components/ResizePanel.tsx` renders four mode buttons (`fit`, `fill`, `crop-to-fit`, `exact`) that update `resizeOptions.mode`. This value is passed into `processImage()` in `src/engine/transform.ts`, but `transform.ts` never reads `resize.mode` anywhere. The selected mode currently has zero effect on the output image — only `lockAspectRatio`, `usePercentage`, and `preventEnlargement` affect the result.

**Required fix:** Implement real, distinct behavior for each mode inside `processImage()` (or a helper it calls):
- `exact`: stretch/distort the source into the exact `destW × destH` requested, ignoring the original aspect ratio (this is the ONLY mode allowed to distort — make sure this is the sole path that can do so, and that the UI clearly warns the user before/while this mode is active, per the spec's rule "never distort silently").
- `fit`: scale the entire image to fit within `destW × destH` while preserving aspect ratio (letterbox/pad if needed, or shrink one dimension to match without cropping) — nothing is cropped.
- `fill`: scale the image to fill the entire `destW × destH` box while preserving aspect ratio, cropping any overflow (similar to CSS `object-fit: cover`).
- `crop-to-fit`: identical intent to `fill` but should reuse/compose with the existing crop pipeline (`CropRect` logic already in `transform.ts`) so a user can subsequently fine-tune the crop position rather than always center-cropping.

**Acceptance test:** For a 4000×3000 source image resized to 1000×1000 target: `fit` should output an image no larger than 1000×1000 with the full original content visible (padding or one dimension shorter); `fill`/`crop-to-fit` should output exactly 1000×1000 with content cropped from center (or the user-set crop point); `exact` should output exactly 1000×1000 stretched. These three outputs must be visibly and measurably different from each other — write a quick manual test or automated pixel-comparison test proving this before marking the item done.

---

### 1.2 GPS metadata is advertised but never actually parsed

**Problem:** `src/components/MetadataModal.tsx` and the i18n strings (`src/i18n/en.ts` / `ar.ts`, keys like `location`, `safeDesc`, `strippedSuccess`) promise reading and removing GPS coordinates. But `src/engine/metadata.ts`'s `parseExif()` only reads tags `0x010F` (Make), `0x0110` (Model), `0x0112` (Orientation), `0x0132` (DateTime), `0x0131` (Software). It never parses the GPS IFD (EXIF tag `0x8825` GPSInfoIFDPointer, and the sub-tags for GPSLatitude/GPSLatitudeRef/GPSLongitude/GPSLongitudeRef inside it). `exif.latitude`/`exif.longitude` are therefore always `undefined`.

**Required fix:** Extend `parseExif()` in `src/engine/metadata.ts` to:
1. Read tag `0x8825` to get the GPS IFD offset.
2. Inside that IFD, read GPSLatitudeRef (`0x0001`), GPSLatitude (`0x0002`, 3 rationals: degrees/minutes/seconds), GPSLongitudeRef (`0x0003`), GPSLongitude (`0x0004`, 3 rationals).
3. Convert DMS to decimal degrees (applying the correct sign for S/W references) and populate `exif.latitude` / `exif.longitude` on the `ExifInfo` type.
4. If no GPS IFD is present, keep showing the existing "no GPS data" message — that message must now be trustworthy.

**Acceptance test:** Take a real JPEG photo known to contain GPS EXIF data (many phone camera photos have this) and confirm the Metadata modal now displays real, correct-looking coordinates instead of always showing "No GPS coordinate stored." Also confirm that after running "Remove Metadata," a freshly re-parsed copy of the output file shows no EXIF/GPS data (this should already be true since canvas re-encoding strips all metadata, but verify explicitly).

---

### 1.3 False "WebAssembly" claim in the UI

**Problem:** `src/App.tsx` footer text states: *"Transformations are calculated directly in WebAssembly and Canvas APIs."* A full-repo search confirms there is no WebAssembly anywhere in this codebase — only the standard Canvas 2D API (`CanvasRenderingContext2D`) is used.

**Required fix:** Remove the false "WebAssembly" claim. Replace with an accurate description, e.g.: *"Transformations are calculated directly using the Canvas API in your browser's memory. Nothing is uploaded."* Do a full-text search of the whole `src/` tree (including `i18n/en.ts` and `i18n/ar.ts`) for any other instance of "WebAssembly", "WASM", "wasm", or other unverified technical claims (e.g. "offline", "PWA", "AI-powered") and correct or remove each one so every user-facing technical claim is verifiably true of the current implementation.

**Acceptance test:** `grep -ri "wasm\|webassembly" src/` returns zero user-facing copy matches (code comments referencing the correction are fine). Every remaining technical claim in the footer/UI copy can be pointed to a specific line of code that makes it true.

---

### 1.4 Silent/unhelpful error handling

**Problem:** The spec's "Error States" section defines specific, friendly copy for unsupported formats, oversized images, and impossible compression targets. The actual implementation does not use any of it:
- `src/App.tsx` → `handleFilesSelected()`: on decode failure, only `console.error(...)` runs. The user sees nothing — the file simply doesn't appear, with no explanation.
- `src/App.tsx` → `handleProcessAll()`: batch errors are also console-only.
- `src/components/Workspace.tsx` line ~159: processing failure shows a raw native `alert('Could not process image: ' + err.message)` with the raw JS error text.

**Required fix:**
1. Introduce a small typed error/toast state (e.g. `const [uiError, setUiError] = useState<{ title: string; message: string; suggestions?: string[] } | null>(null)`) and a simple dismissible inline banner/toast component to render it — no native `alert()` anywhere in the app.
2. Define a small map of user-facing error cases matching the spec's examples (reuse the i18n system so these are translated too):
   - Unsupported/corrupted file → "We couldn't open this image format in your browser. Try JPG, PNG, or WebP."
   - Canvas/memory failure (catch `RangeError`/`DOMException` from huge canvases) → "This image is too large for your device's available memory. Try a smaller source image or lower output dimensions."
   - Target size unreachable (the binary search's `bestBlob` fallback path in `binarySearchTargetSize()` in `transform.ts` returning the lowest-quality blob because even quality 0.05 exceeded the target) → surface this explicitly to the user with the actual achieved size and suggestions (different format / lower dimensions / lower quality), instead of silently returning an oversized result with no explanation.
3. Wire every existing `catch` block (decode, batch, single processImage) through this shared error surface instead of `console.error`-only or `alert()`.

**Acceptance test:** Drag an unsupported file type (e.g. a `.txt` renamed to `.jpg`, or an actual unsupported format) and confirm a visible, friendly, dismissible message appears in the UI (not just devtools console, not a native `alert`). Trigger a target-size compression that can't realistically be reached (e.g. target 1 KB on a large photo) and confirm the UI explicitly tells the user the target wasn't reached and what the actual result was.

---

## PRIORITY 2 — Moderate issues

### 2.1 Accessibility coverage is inconsistent

**Problem:** `aria-*` attributes are only present in `Header.tsx`, `InteractiveCropper.tsx`, `MetadataModal.tsx`, and `ResizePanel.tsx`. `CompressPanel.tsx`, `PresetPicker.tsx`, `UploadZone.tsx`, `GoalSelector.tsx`, `TransformPanel.tsx`, `ComparisonView.tsx`, and `BatchQueue.tsx` have none. The main drop-zone container in `UploadZone.tsx` is a plain `<div onClick=...>` with no `role="button"`, no `tabIndex`, and no `onKeyDown` handler (keyboard users are only served by the separate "Choose Image" `<button>`). `prefers-reduced-motion` is only handled once, in `reset.css`.

**Required fix:**
1. Add `aria-label` to every icon-only interactive control across the components listed above (e.g. remove-file buttons in `BatchQueue`, zoom slider in `InteractiveCropper` already covered, format pills in `CompressPanel`, goal cards in `GoalSelector`).
2. Add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler (Enter/Space triggers the same action as `onClick`) to the `UploadZone` drop-zone `<div>`.
3. Add a global `@media (prefers-reduced-motion: reduce)` block in `globals.css` that disables/shortens the `transition`/`animation` declarations used across `.btn-primary-glow`, `.upload-dropzone`, `.goal-card`, `.pill-chip`, `.custom-slider::-webkit-slider-thumb`, and the aurora orbs, not just whatever `reset.css` currently covers.
4. Recommend (and if feasible, add) `eslint-plugin-jsx-a11y` to the project's ESLint config so future regressions are caught in CI rather than manual review.

**Acceptance test:** Tab through the entire single-image workflow (upload → resize → crop → compress → download) using only the keyboard, and confirm every interactive control is reachable and operable without a mouse. Enable OS-level "reduce motion" and confirm hover/interaction animations are visibly reduced or removed.

---

### 2.2 Crop tool has no pan control when zoomed

**Problem:** `InteractiveCropper.tsx`'s zoom slider scales `.crop-image-container` (image + crop frame + scrims together) via CSS `transform: scale()`, with no panning mechanism. Once zoomed past what fits in the `.crop-viewport` bounds, parts of the image become inaccessible.

**Required fix:** Add pan support: track an `offsetX`/`offsetY` state, apply it as part of the same `transform` (e.g. `translate(offsetX, offsetY) scale(zoom)`), and let users pan either by dragging on empty/background areas of the viewport (not on the crop frame or its handles) or via a secondary two-finger/scroll gesture, clamped so the image can never be dragged entirely out of view.

**Acceptance test:** Zoom to 200%+, confirm you can pan to see and select any part of the now-oversized image, and confirm the exported crop pixel coordinates (via `handleApply`) remain accurate against the original image dimensions regardless of pan/zoom state.

---

### 2.3 No Web Worker / OffscreenCanvas offloading

**Problem:** All decode/draw/encode work (`engine/transform.ts`, `engine/decode.ts`) and all ZIP compression (`engine/batch.ts`, via `jszip`) run on the main thread. Large images or large batches can visibly freeze the UI.

**Required fix (can be scoped as a follow-up task, but should be planned now):** Move the core pipeline in `processImage()` into a Web Worker using `OffscreenCanvas`, with the main thread only handling UI state and dispatching work to the worker. For batch processing (`processBatchQueue`), route each item's `processImage` call through the same worker, and keep progress callbacks working via `postMessage`. Keep a graceful fallback to the current main-thread path for browsers that don't support `OffscreenCanvas`.

**Acceptance test:** Process a batch of 10+ large (4K+) images and confirm the UI (scrolling, button hover states, progress bar animation) remains responsive throughout, not just "eventually completes."

---

## PRIORITY 3 — Polish / lower urgency

### 3.1 Visual direction drift from "minimal, trustworthy" brief

The current aesthetic (aurora gradient orbs, glassmorphism panels, glow shadows on nearly every button/input) is more decorative than the spec's explicit "modern, minimal, trustworthy, clean, fast, professional" direction, which also explicitly cautioned against "excessive gradients... unnecessary animations." This is a product/design decision, not a pure bug — confirm with stakeholders whether to tone it down (fewer simultaneous glow/gradient effects, more restrained hover states) or keep it as an intentional brand choice, and document the decision either way.

### 3.2 Google Fonts loaded from external CDN

`index.html` loads Inter/Cairo/JetBrains Mono from `fonts.googleapis.com`/`fonts.gstatic.com`. This does not leak any image data (the core privacy claim is unaffected), but is a minor tension with "100% private" branding for a strict reading. If this matters to the brand story, self-host the font files instead of using the Google Fonts CDN.

### 3.3 `utils/` is less modular than the spec's suggested structure

The spec's suggested structure separates `utils/aspectRatio`, `utils/dimensions`, `utils/validation`, `utils/fileSize`. The current code consolidates most of this into `utils/formatters.ts` with no dedicated `validation.ts`. Not a bug, but consider splitting `formatters.ts` and adding a `validation.ts` (file-type checks, size limits, dimension sanity checks) as the codebase grows, so validation logic isn't scattered across components.

### 3.4 SEO / multi-page architecture not implemented

None of the spec's dedicated landing pages (`/image-to-200kb`, `/instagram-image-resizer`, `/passport-photo-resizer`, etc.) exist — this is currently a single-route SPA. This was explicitly scoped as a growth-phase item in the spec, so treat this as a backlog item to schedule deliberately (would require adding a router, e.g. React Router, plus per-page copy/FAQ content), not something to silently skip forever.

---

## Final verification checklist (run through this after all fixes above)

- [ ] `npm run build` completes with zero TypeScript errors.
- [ ] `node verify-calculations.mjs` (or equivalent) passes.
- [ ] Every claim in the UI copy (privacy, processing method, GPS, offline/PWA) is verifiably true of the current code.
- [ ] All four resize modes produce visibly different, correct output for the same input.
- [ ] No native `alert()` remains anywhere in the app; all errors surface through the shared UI error component.
- [ ] Full keyboard-only pass through the core workflow succeeds.
- [ ] `prefers-reduced-motion` visibly reduces animation across the app, not just one CSS rule.
