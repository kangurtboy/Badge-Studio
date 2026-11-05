// A4 Sheet Layout and Geometry Calculation Engine

export const SHEET_FORMATS = {
  A4: {
    name: 'A4 (210 × 297 мм)',
    widthMm: 210,
    heightMm: 297,
  }
};

export class SheetLayoutEngine {
  constructor({
    sheetWidthMm = 210,
    sheetHeightMm = 297,
    orientation = 'portrait', // 'portrait' | 'landscape'
    cardWidthMm = 90,
    cardHeightMm = 55,
    marginTopMm = 10,
    marginBottomMm = 10,
    marginLeftMm = 10,
    marginRightMm = 10,
    gapXMm = 4,
    gapYMm = 4,
    columnMode = 'auto', // 'auto' | 2 | 3 | 4
    showCropMarks = true,
  } = {}) {
    this.sheetWidthMm = sheetWidthMm;
    this.sheetHeightMm = sheetHeightMm;
    this.orientation = orientation;
    this.cardWidthMm = cardWidthMm;
    this.cardHeightMm = cardHeightMm;
    this.marginTopMm = marginTopMm;
    this.marginBottomMm = marginBottomMm;
    this.marginLeftMm = marginLeftMm;
    this.marginRightMm = marginRightMm;
    this.gapXMm = gapXMm;
    this.gapYMm = gapYMm;
    this.columnMode = columnMode;
    this.showCropMarks = showCropMarks;
  }

  getEffectiveSheetDimensions() {
    if (this.orientation === 'landscape') {
      return {
        width: Math.max(this.sheetWidthMm, this.sheetHeightMm),
        height: Math.min(this.sheetWidthMm, this.sheetHeightMm),
      };
    }
    return {
      width: Math.min(this.sheetWidthMm, this.sheetHeightMm),
      height: Math.max(this.sheetWidthMm, this.sheetHeightMm),
    };
  }

  calculateGrid() {
    const { width: pageW, height: pageH } = this.getEffectiveSheetDimensions();

    const usableWidth = pageW - this.marginLeftMm - this.marginRightMm;
    const usableHeight = pageH - this.marginTopMm - this.marginBottomMm;

    // Maximum columns that physically fit
    const maxCols = Math.max(1, Math.floor((usableWidth + this.gapXMm) / (this.cardWidthMm + this.gapXMm)));
    // Maximum rows that physically fit
    const maxRows = Math.max(1, Math.floor((usableHeight + this.gapYMm) / (this.cardHeightMm + this.gapYMm)));

    let columns = maxCols;
    if (this.columnMode !== 'auto') {
      const requested = parseInt(this.columnMode, 10);
      columns = Math.min(requested, maxCols);
    }

    const rows = maxRows;
    const capacityPerPage = columns * rows;

    // Check if card fits at all
    const fits = this.cardWidthMm <= usableWidth && this.cardHeightMm <= usableHeight;

    // Centering offsets
    const totalGridWidth = columns * this.cardWidthMm + (columns - 1) * this.gapXMm;
    const totalGridHeight = rows * this.cardHeightMm + (rows - 1) * this.gapYMm;

    const actualMarginLeft = this.marginLeftMm + Math.max(0, (usableWidth - totalGridWidth) / 2);
    const actualMarginTop = this.marginTopMm + Math.max(0, (usableHeight - totalGridHeight) / 2);

    return {
      pageW,
      pageH,
      columns,
      rows,
      capacityPerPage,
      fits,
      totalGridWidth: Math.round(totalGridWidth * 10) / 10,
      totalGridHeight: Math.round(totalGridHeight * 10) / 10,
      actualMarginLeft: Math.round(actualMarginLeft * 10) / 10,
      actualMarginTop: Math.round(actualMarginTop * 10) / 10,
      usableWidth,
      usableHeight,
    };
  }

  getSlotsForCards(cardsCount, pageIndex = 0) {
    const grid = this.calculateGrid();
    const startIndex = pageIndex * grid.capacityPerPage;
    const endIndex = Math.min(cardsCount, startIndex + grid.capacityPerPage);
    const slots = [];

    let cardIdx = startIndex;
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.columns; c++) {
        if (cardIdx >= endIndex) break;

        const leftMm = grid.actualMarginLeft + c * (this.cardWidthMm + this.gapXMm);
        const topMm = grid.actualMarginTop + r * (this.cardHeightMm + this.gapYMm);

        slots.push({
          cardIndex: cardIdx,
          row: r,
          column: c,
          leftMm: Math.round(leftMm * 10) / 10,
          topMm: Math.round(topMm * 10) / 10,
          widthMm: this.cardWidthMm,
          heightMm: this.cardHeightMm,
        });

        cardIdx++;
      }
    }

    return {
      slots,
      grid,
      totalPages: Math.max(1, Math.ceil(cardsCount / grid.capacityPerPage)),
    };
  }

  generateCropMarks(slot) {
    const tickLenMm = 3;
    const offsetMm = 1.5;
    const { leftMm: x, topMm: y, widthMm: w, heightMm: h } = slot;

    return [
      // Top-Left corner ticks
      { x1: x - offsetMm - tickLenMm, y1: y, x2: x - offsetMm, y2: y },
      { x1: x, y1: y - offsetMm - tickLenMm, x2: x, y2: y - offsetMm },
      // Top-Right corner ticks
      { x1: x + w + offsetMm, y1: y, x2: x + w + offsetMm + tickLenMm, y2: y },
      { x1: x + w, y1: y - offsetMm - tickLenMm, x2: x + w, y2: y - offsetMm },
      // Bottom-Left corner ticks
      { x1: x - offsetMm - tickLenMm, y1: y + h, x2: x - offsetMm, y2: y + h },
      { x1: x, y1: y + h + offsetMm, x2: x, y2: y + h + offsetMm + tickLenMm },
      // Bottom-Right corner ticks
      { x1: x + w + offsetMm, y1: y + h, x2: x + w + offsetMm + tickLenMm, y2: y + h },
      { x1: x + w, y1: y + h + offsetMm, x2: x + w, y2: y + h + offsetMm + tickLenMm },
    ];
  }
}
