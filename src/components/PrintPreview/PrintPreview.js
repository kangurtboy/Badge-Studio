import { AlignmentEngine } from '../../printing/alignment.js';
import { SheetLayoutEngine } from '../../printing/layout.js';

export class PrintPreview {
  constructor({ container, onExecutePrint, onTestPrint }) {
    this.container = container;
    this.onExecutePrint = onExecutePrint;
    this.onTestPrint = onTestPrint;

    this.printOptions = {
      mode: 'both', // 'both' | 'front-only' | 'back-only'
      flipEdge: 'long', // 'long' | 'short'
      offsetX: 0,
      offsetY: 0,
    };

    this.cards = [];
    this.layoutConfig = {
      cardWidthMm: 90,
      cardHeightMm: 55,
      marginTopMm: 12,
      marginBottomMm: 12,
      marginLeftMm: 12,
      marginRightMm: 12,
      gapXMm: 4,
      gapYMm: 4,
      columnMode: 'auto',
    };

    this.render();
  }

  setCards(cards) {
    this.cards = cards;
    this.render();
  }

  render() {
    const layoutEngine = new SheetLayoutEngine(this.layoutConfig);
    const { slots: frontSlots, grid } = layoutEngine.getSlotsForCards(this.cards.length, 0);
    const backSlots = AlignmentEngine.getBackSheetSlots(frontSlots, grid, {
      flipEdge: this.printOptions.flipEdge,
      offsetX: this.printOptions.offsetX,
      offsetY: this.printOptions.offsetY,
    });

    const isBoth = this.printOptions.mode === 'both';
    const isFront = this.printOptions.mode === 'front-only' || isBoth;
    const isBack = this.printOptions.mode === 'back-only' || isBoth;

    this.container.innerHTML = `
      <div class="a4-viewport" style="display: flex; gap: 32px; align-items: flex-start; justify-content: center; padding: 24px 20px 80px 20px; overflow-y: auto;">
        
        <!-- Left Side: Interactive Print Controls -->
        <div style="width: 330px; background-color: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; gap: 14px; box-shadow: var(--shadow-lg); flex-shrink: 0;">
          <div class="section-header">
            <span class="section-title" style="display: flex; align-items: center; gap: 6px;">
              <i data-lucide="printer"></i> Параметры печати
            </span>
          </div>

          <!-- Mode selector -->
          <div class="property-row">
            <span class="property-label">Режим</span>
            <select id="print-mode" style="width: 175px;">
              <option value="both" ${this.printOptions.mode === 'both' ? 'selected' : ''}>Обе стороны (2 листа)</option>
              <option value="front-only" ${this.printOptions.mode === 'front-only' ? 'selected' : ''}>Только лицевая сторона</option>
              <option value="back-only" ${this.printOptions.mode === 'back-only' ? 'selected' : ''}>Только обратная сторона</option>
            </select>
          </div>

          <!-- Paper flip edge -->
          <div class="property-row">
            <span class="property-label">Переворот</span>
            <select id="print-flip-edge" style="width: 175px;" ${!isBoth ? 'disabled' : ''}>
              <option value="long" ${this.printOptions.flipEdge === 'long' ? 'selected' : ''}>По длинному краю (Long Edge)</option>
              <option value="short" ${this.printOptions.flipEdge === 'short' ? 'selected' : ''}>По короткому краю (Short Edge)</option>
            </select>
          </div>

          <!-- Calibration Offsets Section -->
          <div class="panel-section" style="padding: 10px 0 0 0; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="section-title">Калибровка смещения принтера</span>
              <button class="btn-icon" id="btn-reset-offsets" title="Сбросить смещение в 0" style="width: 22px; height: 22px;">
                <i data-lucide="rotate-cw" style="width: 12px; height: 12px;"></i>
              </button>
            </div>

            <div class="property-row">
              <span class="property-label">Смещение X (мм)</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <input type="number" id="print-offset-x" class="property-input-number" value="${this.printOptions.offsetX}" step="0.5" min="-15" max="15" />
                <span style="font-size: 10px; color: var(--text-muted);">мм</span>
              </div>
            </div>

            <div class="property-row">
              <span class="property-label">Смещение Y (мм)</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <input type="number" id="print-offset-y" class="property-input-number" value="${this.printOptions.offsetY}" step="0.5" min="-15" max="15" />
                <span style="font-size: 10px; color: var(--text-muted);">мм</span>
              </div>
            </div>
          </div>

          <!-- Calibration test print button -->
          <button class="btn-secondary" id="btn-test-print" style="width: 100%; font-size: 11px;">
            <i data-lucide="sliders"></i> Тестовый лист калибровки
          </button>

          <!-- Browser print hint -->
          <div style="padding: 10px; background-color: var(--bg-surface); border-radius: var(--radius-sm); font-size: 10.5px; color: var(--text-secondary); line-height: 1.5;">
            <strong>Настройки Chrome / Edge:</strong><br/>
            • Формат: <strong>A4</strong><br/>
            • Масштаб: <strong>100%</strong><br/>
            • Поля: <strong>Нет (None)</strong><br/>
            • Колонтитулы: <strong>Выключены</strong>
          </div>

          <!-- Direct print button -->
          <button class="btn-primary" id="btn-trigger-print" style="width: 100%; padding: 11px; font-size: 13px;">
            <i data-lucide="printer"></i> Распечатать бейджики (Ctrl+P)
          </button>
        </div>

        <!-- Right Side: Visual Paper Sheets Preview -->
        <div style="display: flex; flex-direction: column; gap: 24px; align-items: center;">
          
          <!-- Sheet 1: Front -->
          ${
            isFront
              ? `
            <div style="text-align: center;">
              <span style="font-size: 12px; font-weight: 700; color: #93C5FD; display: inline-flex; align-items: center; gap: 6px;">
                ЛИСТ 1: ЛИЦЕВАЯ СТОРОНА (A4, 210 × 297 мм)
              </span>
              <div class="a4-sheet" style="width: 440px; height: 622px; margin-top: 8px; border-radius: 4px; position: relative; background: #FFFFFF; box-shadow: var(--shadow-card); overflow: hidden;">
                ${this.renderSheetMiniCards(frontSlots, 'front', 440 / 210)}
              </div>
            </div>
          `
              : ''
          }

          <!-- Sheet 2: Back (Mirrored) -->
          ${
            isBack
              ? `
            <div style="text-align: center;">
              <span style="font-size: 12px; font-weight: 700; color: #CBD5E1; display: inline-flex; align-items: center; gap: 6px;">
                ЛИСТ 2: ОБРАТНАЯ СТОРОНА (ЗЕРКАЛЬНОЕ СОВМЕЩЕНИЕ)
              </span>
              <div class="a4-sheet" style="width: 440px; height: 622px; margin-top: 8px; border-radius: 4px; position: relative; background: #F8FAFC; box-shadow: var(--shadow-card); overflow: hidden;">
                ${this.renderSheetMiniCards(backSlots, 'back', 440 / 210)}
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;

    this.bindEvents();
    if (window.initIcons) {
      window.initIcons(this.container);
    }
  }

  renderSheetMiniCards(slots, side, scale) {
    if (slots.length === 0) return '';

    return slots
      .map((slot) => {
        const card = this.cards[slot.cardIndex];
        if (!card) return '';

        const leftPx = Math.round(slot.leftMm * scale);
        const topPx = Math.round(slot.topMm * scale);
        const widthPx = Math.round(slot.widthMm * scale);
        const heightPx = Math.round(slot.heightMm * scale);

        const studentName = card.name || `Студент #${slot.cardIndex + 1}`;
        const isFront = side === 'front';

        return `
          <div style="position: absolute; left: ${leftPx}px; top: ${topPx}px; width: ${widthPx}px; height: ${heightPx}px; border: 0.5px solid ${isFront ? '#CBD5E1' : '#94A3B8'}; border-radius: 3px; background-color: ${isFront ? '#FFFFFF' : '#F1F5F9'}; padding: 4px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 6.5px; font-weight: bold; color: ${isFront ? '#1E3A8A' : '#334155'};">
              <span>#${slot.cardIndex + 1} ${isFront ? 'ЛИЦЕВАЯ' : 'ОБРАТНАЯ'}</span>
              <span>Кол. ${slot.column + 1}</span>
            </div>
            <div style="font-size: 8px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${studentName}
            </div>
            <div style="font-size: 6.5px; color: #64748B; text-align: right;">
              ${slot.widthMm} × ${slot.heightMm} мм
            </div>
          </div>
        `;
      })
      .join('');
  }

  bindEvents() {
    this.container.querySelector('#print-mode')?.addEventListener('change', (e) => {
      this.printOptions.mode = e.target.value;
      this.render();
    });

    this.container.querySelector('#print-flip-edge')?.addEventListener('change', (e) => {
      this.printOptions.flipEdge = e.target.value;
      this.render();
    });

    this.container.querySelector('#print-offset-x')?.addEventListener('change', (e) => {
      this.printOptions.offsetX = parseFloat(e.target.value) || 0;
      this.render();
    });

    this.container.querySelector('#print-offset-y')?.addEventListener('change', (e) => {
      this.printOptions.offsetY = parseFloat(e.target.value) || 0;
      this.render();
    });

    this.container.querySelector('#btn-reset-offsets')?.addEventListener('click', () => {
      this.printOptions.offsetX = 0;
      this.printOptions.offsetY = 0;
      this.render();
    });

    this.container.querySelector('#btn-trigger-print')?.addEventListener('click', () => {
      this.onExecutePrint(this.printOptions);
    });

    this.container.querySelector('#btn-test-print')?.addEventListener('click', () => {
      this.onTestPrint();
    });
  }
}
