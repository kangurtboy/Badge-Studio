import { applyImageFilters } from './adjustments.js';

export function renderCroppedPhoto({
  image,
  panX = 0,
  panY = 0,
  zoom = 1,
  rotation = 0, // degrees: 0, 90, 180, 270
  frameShape = 'rounded', // 'rect' | 'square' | 'rounded' | 'circle'
  outputWidth = 400,
  outputHeight = 500,
  adjustments = {},
}) {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, outputWidth, outputHeight);

  // Apply Mask clipping path
  ctx.save();
  ctx.beginPath();

  if (frameShape === 'circle') {
    const radius = Math.min(outputWidth, outputHeight) / 2;
    ctx.arc(outputWidth / 2, outputHeight / 2, radius, 0, Math.PI * 2);
  } else if (frameShape === 'rounded') {
    const rx = 24;
    ctx.roundRect(0, 0, outputWidth, outputHeight, rx);
  } else {
    // rect or square
    ctx.rect(0, 0, outputWidth, outputHeight);
  }

  ctx.clip();

  // Background for transparency
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  // Translate to center for rotation and pan
  ctx.translate(outputWidth / 2 + panX, outputHeight / 2 + panY);
  ctx.rotate((rotation * Math.PI) / 180);

  // Calculate base scale to fill frame
  const scale = Math.max(outputWidth / image.width, outputHeight / image.height) * zoom;
  const drawW = image.width * scale;
  const drawH = image.height * scale;

  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // Apply pixel filters (brightness, contrast, saturation, grayscale)
  applyImageFilters(ctx, outputWidth, outputHeight, adjustments);

  return canvas.toDataURL('image/png', 0.95);
}
