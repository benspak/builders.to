#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates all required PWA icons from the SVG source
 * Run with: node scripts/generate-pwa-icons.mjs
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG source for maskable icons (with padding for safe zone)
const createMaskableSvg = (size) => {
  const padding = Math.round(size * 0.1); // 10% padding for safe zone
  const innerSize = size - (padding * 2);
  const scale = innerSize / 32; // Original SVG is 32x32

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#f97316"/>
  <g transform="translate(${padding}, ${padding}) scale(${scale})">
    <rect x="1" y="1" width="30" height="30" rx="8" fill="#f97316"/>
    <rect x="7" y="21" width="18" height="5" rx="1" fill="white"/>
    <rect x="7" y="14" width="14" height="5" rx="1" fill="white" opacity="0.9"/>
    <rect x="7" y="7" width="9" height="5" rx="1" fill="white" opacity="0.8"/>
    <circle cx="23" cy="10" r="2.5" fill="white"/>
  </g>
</svg>`;
};

// SVG source for regular "any" purpose icons (with transparent background option)
const createAnySvg = (size) => {
  const scale = size / 32; // Original SVG is 32x32

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
  </defs>
  <g transform="scale(${scale})">
    <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#favGradient)"/>
    <rect x="7" y="21" width="18" height="5" rx="1" fill="white"/>
    <rect x="7" y="14" width="14" height="5" rx="1" fill="white" opacity="0.9"/>
    <rect x="7" y="7" width="9" height="5" rx="1" fill="white" opacity="0.8"/>
    <circle cx="23" cy="10" r="2.5" fill="white"/>
  </g>
</svg>`;
};

// Apple touch icon (needs solid background)
const createAppleTouchSvg = (size) => {
  const padding = Math.round(size * 0.08); // 8% padding
  const innerSize = size - (padding * 2);
  const scale = innerSize / 32;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="appleTouchGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#appleTouchGradient)"/>
  <g transform="translate(${padding}, ${padding}) scale(${scale})">
    <rect x="7" y="21" width="18" height="5" rx="1" fill="white"/>
    <rect x="7" y="14" width="14" height="5" rx="1" fill="white" opacity="0.9"/>
    <rect x="7" y="7" width="9" height="5" rx="1" fill="white" opacity="0.8"/>
    <circle cx="23" cy="10" r="2.5" fill="white"/>
  </g>
</svg>`;
};

async function generateIcons() {
  const iconsDir = path.join(projectRoot, 'public', 'icons');
  const screenshotsDir = path.join(projectRoot, 'public', 'screenshots');

  // Create directories if they don't exist
  if (!existsSync(iconsDir)) {
    await mkdir(iconsDir, { recursive: true });
    console.log('Created icons directory');
  }

  if (!existsSync(screenshotsDir)) {
    await mkdir(screenshotsDir, { recursive: true });
    console.log('Created screenshots directory');
  }

  console.log('Generating PWA icons...\n');

  // Generate maskable icons
  for (const size of ICON_SIZES) {
    const svg = createMaskableSvg(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated maskable icon: icon-${size}x${size}.png`);
  }

  // Generate "any" purpose icons (192 and 512 only)
  for (const size of [192, 512]) {
    const svg = createAnySvg(size);
    const outputPath = path.join(iconsDir, `icon-any-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated any-purpose icon: icon-any-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon (180x180)
  const appleTouchSvg = createAppleTouchSvg(180);
  await sharp(Buffer.from(appleTouchSvg))
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ Generated Apple Touch Icon: apple-touch-icon.png');

  // Generate favicon sizes
  const faviconSizes = [16, 32, 48];
  for (const size of faviconSizes) {
    const svg = createAnySvg(size);
    const outputPath = path.join(iconsDir, `favicon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated favicon: favicon-${size}x${size}.png`);
  }

  // Generate placeholder screenshots (they should be replaced with real screenshots)
  const desktopPlaceholder = `<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#0a0a0a"/>
    <rect x="440" y="260" width="400" height="200" rx="12" fill="#1a1a1a"/>
    <text x="640" y="370" text-anchor="middle" fill="#f97316" font-family="system-ui" font-size="32" font-weight="bold">Builders.to</text>
  </svg>`;

  const mobilePlaceholder = `<svg width="390" height="844" viewBox="0 0 390 844" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="390" height="844" fill="#0a0a0a"/>
    <rect x="45" y="322" width="300" height="200" rx="12" fill="#1a1a1a"/>
    <text x="195" y="432" text-anchor="middle" fill="#f97316" font-family="system-ui" font-size="28" font-weight="bold">Builders.to</text>
  </svg>`;

  await sharp(Buffer.from(desktopPlaceholder))
    .png()
    .toFile(path.join(screenshotsDir, 'desktop.png'));
  console.log('✓ Generated desktop screenshot placeholder');

  await sharp(Buffer.from(mobilePlaceholder))
    .png()
    .toFile(path.join(screenshotsDir, 'mobile.png'));
  console.log('✓ Generated mobile screenshot placeholder');

  console.log('\n✅ All PWA icons generated successfully!');
  console.log('\nNote: Replace the placeholder screenshots with real app screenshots for best results.');
}

generateIcons().catch(console.error);
