// Image adjustments: brightness, contrast, saturation, and grayscale

export function applyImageFilters(ctx, width, height, { brightness = 0, contrast = 0, saturation = 0, grayscale = false }) {
  if (brightness === 0 && contrast === 0 && saturation === 0 && !grayscale) {
    return; // No adjustments needed
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Brightness: -100 to 100 -> delta -255 to 255
  const bDelta = (brightness / 100) * 128;

  // Contrast: -100 to 100 -> factor
  const cFactor = (259 * (contrast + 100)) / (100 * (259 - contrast));

  // Saturation: -100 to 100 -> factor
  const sFactor = 1 + (saturation / 100);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    if (brightness !== 0) {
      r += bDelta;
      g += bDelta;
      b += bDelta;
    }

    // Contrast
    if (contrast !== 0) {
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;
    }

    // Grayscale
    if (grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    } else if (saturation !== 0) {
      // Saturation adjustment
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;
    }

    // Clamp values 0..255
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
}
