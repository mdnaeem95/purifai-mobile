const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Brand colors
const PRIMARY_700 = '#4338CA';
const PRIMARY_500 = '#6366F1';

function drawIcon(ctx, size, withBackground = true) {
  const padding = size * 0.1;
  const cornerRadius = size * 0.22;

  if (withBackground) {
    // Background with gradient effect (simulate with two rects)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, PRIMARY_700);
    gradient.addColorStop(1, PRIMARY_500);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, cornerRadius);
    ctx.fill();
  }

  // White "P" letter
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${size * 0.55}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('P', size / 2, size / 2 + size * 0.02);
}

function generateIcon(filename, size, withBackground = true) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  if (!withBackground) {
    // Transparent background for adaptive icon
    ctx.clearRect(0, 0, size, size);
  }

  drawIcon(ctx, size, withBackground);

  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(ASSETS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filename} (${size}x${size})`);
}

function generateSplashIcon(filename, iconSize, canvasSize) {
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  // Indigo background (matches app.json splash backgroundColor)
  ctx.fillStyle = PRIMARY_700;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw centered icon
  const offset = (canvasSize - iconSize) / 2;
  ctx.save();
  ctx.translate(offset, offset);

  // White rounded square
  const cornerRadius = iconSize * 0.22;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(0, 0, iconSize, iconSize, cornerRadius);
  ctx.fill();

  // "P" letter
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${iconSize * 0.55}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('P', iconSize / 2, iconSize / 2 + iconSize * 0.02);

  ctx.restore();

  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(ASSETS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filename} (${canvasSize}x${canvasSize})`);
}

// Generate all icon assets
console.log('Generating Purifai app icons...\n');

// Main app icon (iOS)
generateIcon('icon.png', 1024);

// Android adaptive icon foreground
generateIcon('adaptive-icon.png', 1024);

// Web favicon
generateIcon('favicon.png', 48);

// Splash screen icon (centered "P" on indigo background)
generateSplashIcon('splash-icon.png', 200, 1024);

console.log('\nAll icons generated successfully!');
