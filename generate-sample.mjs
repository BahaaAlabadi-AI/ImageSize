// Create sample images in public folder for instant test & demo
import fs from 'fs';
import path from 'path';

// Let's create an SVG sample image and write it to public/sample-card.svg
const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="40%" stop-color="#1e1b4b" />
      <stop offset="70%" stop-color="#311042" />
      <stop offset="100%" stop-color="#090a0f" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.4" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#skyGrad)" />
  <circle cx="960" cy="500" r="350" fill="url(#sunGlow)" />
  
  <!-- Modern Geometric Landscape Silhouette -->
  <polygon points="0,1080 300,750 650,920 1050,680 1450,890 1920,640 1920,1080" fill="#111827" opacity="0.9" />
  <polygon points="0,1080 450,860 850,960 1350,780 1700,940 1920,820 1920,1080" fill="#0b0f19" />

  <!-- Typography overlay -->
  <text x="960" y="480" fill="#ffffff" font-size="72" font-family="system-ui, sans-serif" font-weight="800" text-anchor="middle" letter-spacing="-2">IMAGE SIZE &amp; RATIO STUDIO</text>
  <text x="960" y="550" fill="#a78bfa" font-size="32" font-family="system-ui, sans-serif" font-weight="500" text-anchor="middle">1920 × 1080 (16:9) • High-Res Reference Asset</text>
</svg>`;

fs.writeFileSync('public/sample-landscape.svg', sampleSvg);
console.log('Sample image created at public/sample-landscape.svg');
