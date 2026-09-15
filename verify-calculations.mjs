import { calculateAspectRatio, parseDpiDimensions, formatBytes } from './src/utils/formatters.ts';
import { computeResizeMode } from './src/engine/resizeMode.ts';

// 1. Test aspect ratio
const ratio1 = calculateAspectRatio(1920, 1080);
console.log('1920x1080 Aspect Ratio:', ratio1.text);
if (ratio1.text !== '16:9') throw new Error('Expected 16:9');

const ratio2 = calculateAspectRatio(1080, 1080);
console.log('1080x1080 Aspect Ratio:', ratio2.text);
if (ratio2.text !== '1:1') throw new Error('Expected 1:1');

const ratio3 = calculateAspectRatio(4000, 3000);
console.log('4000x3000 Aspect Ratio:', ratio3.text);
if (ratio3.text !== '4:3') throw new Error('Expected 4:3');

// 2. Test DPI calculations
// 4 x 6 inches at 300 DPI = 1200 x 1800
const dpi1 = parseDpiDimensions('in', 4, 6, 300);
console.log('4x6" @ 300 DPI:', dpi1.pxWidth, 'x', dpi1.pxHeight);
if (dpi1.pxWidth !== 1200 || dpi1.pxHeight !== 1800) throw new Error('Expected 1200x1800');

// 35 x 45 mm at 300 DPI
const dpi2 = parseDpiDimensions('mm', 35, 45, 300);
console.log('35x45mm @ 300 DPI:', dpi2.pxWidth, 'x', dpi2.pxHeight);
if (dpi2.pxWidth !== 413 || dpi2.pxHeight !== 531) throw new Error('Expected 413x531');

// 3. Test formatBytes
console.log('Bytes formatting:', formatBytes(204800));
if (!formatBytes(204800).includes('KB')) throw new Error('Expected KB format');

// 4. Regression Test: computeResizeMode (4000x3000 source -> 1000x1000 target)
console.log('\nTesting computeResizeMode()...');
const srcW = 4000, srcH = 3000;
const destW = 1000, destH = 1000;
const cropX = 0, cropY = 0, cropW = 4000, cropH = 3000;
const isRotatedQuarter = false;

// 4a. Mode 'fit': Scales down preserving aspect ratio, no cropping
const fitRes = computeResizeMode('fit', srcW, srcH, destW, destH, cropX, cropY, cropW, cropH, isRotatedQuarter, null);
console.log('Mode "fit":', fitRes);
if (fitRes.canvasW !== 1000 || fitRes.canvasH !== 750) {
  throw new Error(`fit expected canvas 1000x750, got ${fitRes.canvasW}x${fitRes.canvasH}`);
}
if (fitRes.sw !== 4000 || fitRes.sh !== 3000) {
  throw new Error(`fit expected full uncropped source 4000x3000, got ${fitRes.sw}x${fitRes.sh}`);
}

// 4b. Mode 'fill': Covers square box, crops horizontal overflow
const fillRes = computeResizeMode('fill', srcW, srcH, destW, destH, cropX, cropY, cropW, cropH, isRotatedQuarter, null);
console.log('Mode "fill":', fillRes);
if (fillRes.canvasW !== 1000 || fillRes.canvasH !== 1000) {
  throw new Error(`fill expected canvas 1000x1000, got ${fillRes.canvasW}x${fillRes.canvasH}`);
}
if (fillRes.sw !== 3000 || fillRes.sh !== 3000) {
  throw new Error(`fill expected cropped source 3000x3000, got ${fillRes.sw}x${fillRes.sh}`);
}

// 4c. Mode 'crop-to-fit': Equivalent to fill when no prior crop exists
const cropToFitRes = computeResizeMode('crop-to-fit', srcW, srcH, destW, destH, cropX, cropY, cropW, cropH, isRotatedQuarter, null);
console.log('Mode "crop-to-fit":', cropToFitRes);
if (cropToFitRes.canvasW !== 1000 || cropToFitRes.canvasH !== 1000) {
  throw new Error(`crop-to-fit expected canvas 1000x1000, got ${cropToFitRes.canvasW}x${cropToFitRes.canvasH}`);
}
if (cropToFitRes.sw !== 3000 || cropToFitRes.sh !== 3000) {
  throw new Error(`crop-to-fit expected cropped source 3000x3000, got ${cropToFitRes.sw}x${cropToFitRes.sh}`);
}

// 4d. Mode 'exact': Forces exact dimensions, draws full source (intentional stretch)
const exactRes = computeResizeMode('exact', srcW, srcH, destW, destH, cropX, cropY, cropW, cropH, isRotatedQuarter, null);
console.log('Mode "exact":', exactRes);
if (exactRes.canvasW !== 1000 || exactRes.canvasH !== 1000) {
  throw new Error(`exact expected canvas 1000x1000, got ${exactRes.canvasW}x${exactRes.canvasH}`);
}
if (exactRes.sw !== 4000 || exactRes.sh !== 3000) {
  throw new Error(`exact expected full uncropped source 4000x3000, got ${exactRes.sw}x${exactRes.sh}`);
}
if (exactRes.dw !== 1000 || exactRes.dh !== 1000) {
  throw new Error(`exact expected drawn dimensions 1000x1000, got ${exactRes.dw}x${exactRes.dh}`);
}

// 4e. Distinct behavior assertion across modes
const fitSig = `${fitRes.canvasW}x${fitRes.canvasH}_${fitRes.sw}x${fitRes.sh}`;
const fillSig = `${fillRes.canvasW}x${fillRes.canvasH}_${fillRes.sw}x${fillRes.sh}`;
const exactSig = `${exactRes.canvasW}x${exactRes.canvasH}_${exactRes.sw}x${exactRes.sh}`;

if (fitSig === fillSig) throw new Error('fit and fill unexpectedly produced identical geometry!');
if (fitSig === exactSig) throw new Error('fit and exact unexpectedly produced identical geometry!');
if (fillSig === exactSig) throw new Error('fill and exact unexpectedly produced identical geometry!');

console.log('Distinct mode signatures verified:', { fitSig, fillSig, exactSig });

console.log('\nAll calculation and resize-mode regression tests passed successfully!');

