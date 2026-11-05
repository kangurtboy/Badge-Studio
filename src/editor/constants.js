// Standards and constants for Badge Studio

export const BADGE_STANDARDS = {
  'cr80': {
    name: '85.6 × 54 мм (Стандарт CR-80 / ID-1)',
    widthMm: 85.6,
    heightMm: 54,
  },
  '90x55': {
    name: '90 × 55 мм (Стандарт РФ/СНГ)',
    widthMm: 90,
    heightMm: 55,
  },
  '85x55': {
    name: '85 × 55 мм (Евро-стандарт / ID-1)',
    widthMm: 85,
    heightMm: 55,
  },
  'custom': {
    name: 'Пользовательский размер',
    widthMm: 85.6,
    heightMm: 54,
  }
};

export const A4_DIMENSIONS = {
  widthMm: 210,
  heightMm: 297,
  // 1 mm in px at 96 DPI
  pxPerMmScreen: 3.779527559,
  // 1 mm in px at 300 DPI (high quality print)
  pxPerMmPrint: 11.811023622
};

// Canvas editor base pixel density (px per mm)
export const CANVAS_PX_PER_MM = 8; // 90mm = 720px, 55mm = 440px (crisp & high performance)

export function mmToCanvasPx(mm) {
  return Math.round(mm * CANVAS_PX_PER_MM);
}

export function canvasPxToMm(px) {
  return Math.round((px / CANVAS_PX_PER_MM) * 10) / 10;
}
