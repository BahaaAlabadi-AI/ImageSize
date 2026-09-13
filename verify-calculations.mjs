import { calculateAspectRatio, parseDpiDimensions, formatBytes } from './src/utils/formatters.ts';

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

console.log('All calculation tests passed successfully!');
