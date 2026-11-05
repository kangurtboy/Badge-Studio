// Two-sided printing alignment and calibration calculations

export class AlignmentEngine {
  /**
   * Calculates mapped card positions on the reverse (back) sheet
   * so that each front card aligns exactly with its back card when the paper is flipped.
   */
  static getBackSheetSlots(frontSlots, grid, { flipEdge = 'long', offsetX = 0, offsetY = 0 }) {
    return frontSlots.map((slot) => {
      let mirroredCol = slot.column;
      let mirroredRow = slot.row;

      if (flipEdge === 'long') {
        // Flipping along long edge (standard portrait two-sided):
        // Columns flip horizontally (col 0 <-> col N-1)
        mirroredCol = grid.columns - 1 - slot.column;
      } else if (flipEdge === 'short') {
        // Flipping along short edge:
        // Rows flip vertically (row 0 <-> row M-1)
        mirroredRow = grid.rows - 1 - slot.row;
      }

      // Calculate mirrored coordinates on the paper
      const baseLeftMm = grid.actualMarginLeft + mirroredCol * (slot.widthMm + (grid.gapXMm || 4));
      const baseTopMm = grid.actualMarginTop + mirroredRow * (slot.heightMm + (grid.gapYMm || 4));

      // Apply printer calibration offsets
      const finalLeftMm = baseLeftMm + offsetX;
      const finalTopMm = baseTopMm + offsetY;

      return {
        ...slot,
        mirroredColumn: mirroredCol,
        mirroredRow: mirroredRow,
        leftMm: Math.round(finalLeftMm * 10) / 10,
        topMm: Math.round(finalTopMm * 10) / 10,
      };
    });
  }

  /**
   * Generates HTML for Calibration Test Sheet (with mm rulers and crosshairs)
   */
  static generateCalibrationTestSheet() {
    return `
      <div class="print-page calibration-page" style="width: 210mm; height: 297mm; position: relative; background: #FFFFFF; font-family: sans-serif; box-sizing: border-box;">
        <!-- Header text -->
        <div style="position: absolute; top: 15mm; left: 20mm; right: 20mm; text-align: center;">
          <h2 style="margin: 0; font-size: 14pt; color: #0F172A;">ТЕСТОВЫЙ ЛИСТ КАЛИБРОВКИ ДВУСТОРОННЕЙ ПЕЧАТИ</h2>
          <p style="margin: 3mm 0 0 0; font-size: 9pt; color: #475569;">
            Badge Studio • Распечатайте этот лист с двух сторон с текущими настройками принтера (Масштаб 100%, Поля: Нет).
          </p>
        </div>

        <!-- Center Crosshair Target -->
        <div style="position: absolute; left: 105mm; top: 148.5mm; transform: translate(-50%, -50%); text-align: center;">
          <svg width="60mm" height="60mm" viewBox="0 0 60 60" style="display: block; margin: auto;">
            <circle cx="30" cy="30" r="25" fill="none" stroke="#000000" stroke-width="0.5"/>
            <circle cx="30" cy="30" r="15" fill="none" stroke="#000000" stroke-width="0.5"/>
            <circle cx="30" cy="30" r="5" fill="none" stroke="#EF4444" stroke-width="0.5"/>
            <line x1="0" y1="30" x2="60" y2="30" stroke="#000000" stroke-width="0.5"/>
            <line x1="30" y1="0" x2="30" y2="60" stroke="#000000" stroke-width="0.5"/>
          </svg>
          <span style="font-size: 8pt; font-weight: bold; color: #000000;">ЦЕНТР ЛИСТА (105 × 148.5 мм)</span>
        </div>

        <!-- 4 Reference Sample Card Boxes (90x55 mm) -->
        <div style="position: absolute; left: 15mm; top: 40mm; width: 90mm; height: 55mm; border: 1px solid #000000; padding: 4mm; box-sizing: border-box;">
          <div style="font-weight: bold; font-size: 9pt;">Метка совмещения #1</div>
          <div style="font-size: 8pt; color: #64748B;">Размер: 90 × 55 мм</div>
          <div style="position: absolute; bottom: 3mm; right: 3mm; font-size: 7pt; font-family: monospace;">X: 15mm, Y: 40mm</div>
        </div>

        <div style="position: absolute; left: 105mm; top: 40mm; width: 90mm; height: 55mm; border: 1px solid #000000; padding: 4mm; box-sizing: border-box;">
          <div style="font-weight: bold; font-size: 9pt;">Метка совмещения #2</div>
          <div style="font-size: 8pt; color: #64748B;">Размер: 90 × 55 мм</div>
          <div style="position: absolute; bottom: 3mm; right: 3mm; font-size: 7pt; font-family: monospace;">X: 105mm, Y: 40mm</div>
        </div>

        <div style="position: absolute; left: 15mm; top: 200mm; width: 90mm; height: 55mm; border: 1px solid #000000; padding: 4mm; box-sizing: border-box;">
          <div style="font-weight: bold; font-size: 9pt;">Метка совмещения #3</div>
          <div style="font-size: 8pt; color: #64748B;">Размер: 90 × 55 мм</div>
          <div style="position: absolute; bottom: 3mm; right: 3mm; font-size: 7pt; font-family: monospace;">X: 15mm, Y: 200mm</div>
        </div>

        <div style="position: absolute; left: 105mm; top: 200mm; width: 90mm; height: 55mm; border: 1px solid #000000; padding: 4mm; box-sizing: border-box;">
          <div style="font-weight: bold; font-size: 9pt;">Метка совмещения #4</div>
          <div style="font-size: 8pt; color: #64748B;">Размер: 90 × 55 мм</div>
          <div style="position: absolute; bottom: 3mm; right: 3mm; font-size: 7pt; font-family: monospace;">X: 105mm, Y: 200mm</div>
        </div>

        <!-- Calibration instructions note at bottom -->
        <div style="position: absolute; bottom: 12mm; left: 20mm; right: 20mm; border-top: 1px dashed #CBD5E1; padding-top: 3mm; font-size: 8pt; color: #475569;">
          <strong>Инструкция по калибровке:</strong> Посмотрите лист на просвет. Если контуры лицевой и обратной сторон не совпадают, измерьте линейкой расстояние между рамками и введите поправку (Смещение X / Y в мм) в настройках печати Badge Studio.
        </div>
      </div>
    `;
  }
}
