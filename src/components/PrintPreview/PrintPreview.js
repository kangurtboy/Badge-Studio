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

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="a4-viewport" style="display: flex; gap: 30px; align-items: flex-start; justify-content: center; padding: 40px; overflow-y: auto;">
        <!-- Left Side: Controls Panel -->
        <div style="width: 320px; background-color: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; gap: 16px; box-shadow: var(--shadow-lg);">
          <div class="section-header">
            <span class="section-title">Параметры печати</span>
          </div>

          <div class="property-row">
            <span class="property-label">Режим печати</span>
            <select id="print-mode" style="width: 160px;">
              <option value="both" ${this.printOptions.mode === 'both' ? 'selected' : ''}>Обе стороны (2 листа)</option>
              <option value="front-only" ${this.printOptions.mode === 'front-only' ? 'selected' : ''}>Только лицевая сторона</option>
              <option value="back-only" ${this.printOptions.mode === 'back-only' ? 'selected' : ''}>Только обратная сторона</option>
            </select>
          </div>

          <div class="property-row">
            <span class="property-label">Переворот бумаги</span>
            <select id="print-flip-edge" style="width: 160px;">
              <option value="long" ${this.printOptions.flipEdge === 'long' ? 'selected' : ''}>По длинному краю</option>
              <option value="short" ${this.printOptions.flipEdge === 'short' ? 'selected' : ''}>По короткому краю</option>
            </select>
          </div>

          <div class="property-row">
            <span class="property-label">Смещение X (мм)</span>
            <input type="number" id="print-offset-x" class="property-input-number" value="${this.printOptions.offsetX}" step="0.5" />
          </div>

          <div class="property-row">
            <span class="property-label">Смещение Y (мм)</span>
            <input type="number" id="print-offset-y" class="property-input-number" value="${this.printOptions.offsetY}" step="0.5" />
          </div>

          <div style="padding: 10px; background-color: var(--bg-surface); border-radius: var(--radius-sm); font-size: 11px; color: var(--text-secondary); line-height: 1.5;">
            <strong>Совет:</strong> В диалоге печати браузера установите масштаб <strong>100%</strong> и отключите поля.
          </div>

          <button class="btn-secondary" id="btn-test-print" style="width: 100%;">
            <i data-lucide="sliders"></i> Тестовая калибровочная печать
          </button>

          <button class="btn-primary" id="btn-trigger-print" style="width: 100%; padding: 10px;">
            <i data-lucide="printer"></i> Распечатать (Ctrl+P)
          </button>
        </div>

        <!-- Right Side: Sheet Previews -->
        <div style="display: flex; flex-direction: column; gap: 24px; align-items: center;">
          <div style="text-align: center;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">ЛИСТ 1: ЛИЦЕВАЯ СТОРОНА</span>
            <div class="a4-sheet" style="width: 420px; height: 594px; margin-top: 8px; border-radius: 4px; padding: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; align-content: start; justify-items: center;">
              <div style="width: 180px; height: 110px; border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748B;">Карточка 1 (Лицевая)</div>
              <div style="width: 180px; height: 110px; border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748B;">Карточка 2 (Лицевая)</div>
            </div>
          </div>

          ${
            this.printOptions.mode === 'both'
              ? `
            <div style="text-align: center;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">ЛИСТ 2: ОБРАТНАЯ СТОРОНА (СОВМЕЩЕНИЕ)</span>
              <div class="a4-sheet" style="width: 420px; height: 594px; margin-top: 8px; border-radius: 4px; padding: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; align-content: start; justify-items: center; background-color: #F8FAFC;">
                <div style="width: 180px; height: 110px; border: 1px dashed #CBD5E1; background: #F1F5F9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748B;">Карточка 2 (Обратная)</div>
                <div style="width: 180px; height: 110px; border: 1px dashed #CBD5E1; background: #F1F5F9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748B;">Карточка 1 (Обратная)</div>
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

  bindEvents() {
    this.container.querySelector('#print-mode')?.addEventListener('change', (e) => {
      this.printOptions.mode = e.target.value;
      this.render();
    });

    this.container.querySelector('#print-flip-edge')?.addEventListener('change', (e) => {
      this.printOptions.flipEdge = e.target.value;
    });

    this.container.querySelector('#print-offset-x')?.addEventListener('change', (e) => {
      this.printOptions.offsetX = parseFloat(e.target.value) || 0;
    });

    this.container.querySelector('#print-offset-y')?.addEventListener('change', (e) => {
      this.printOptions.offsetY = parseFloat(e.target.value) || 0;
    });

    this.container.querySelector('#btn-trigger-print')?.addEventListener('click', () => {
      this.onExecutePrint(this.printOptions);
    });

    this.container.querySelector('#btn-test-print')?.addEventListener('click', () => {
      this.onTestPrint(this.printOptions);
    });
  }
}
