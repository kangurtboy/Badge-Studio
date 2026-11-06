import { SheetLayoutEngine } from '../../printing/layout.js';
import { renderBadgeFrontHtml, renderBadgeBackHtml } from '../BadgeCard/renderBadgeHtml.js';

export class A4Editor {
  constructor({ container, onFlipAll, onCardSelect, animationEnabled = true }) {
    this.container = container;
    this.onFlipAll = onFlipAll || (() => {});
    this.onCardSelect = onCardSelect || (() => {});
    this.animationEnabled = animationEnabled;

    this.isAllFlipped = false;
    this.currentPageIndex = 0;
    this.cards = [];

    // Layout configuration
    this.layoutConfig = {
      orientation: 'portrait',
      cardWidthMm: 85.6,
      cardHeightMm: 54,
      marginTopMm: 12,
      marginBottomMm: 12,
      marginLeftMm: 12,
      marginRightMm: 12,
      gapXMm: 4,
      gapYMm: 4,
      columnMode: 'auto',
      showCropMarks: true,
    };

    this.layoutEngine = new SheetLayoutEngine(this.layoutConfig);
    this.render();
  }

  setCards(cards) {
    this.cards = cards;
    this.render();
  }

  setAnimationEnabled(enabled) {
    this.animationEnabled = enabled;
  }

  render() {
    this.layoutEngine = new SheetLayoutEngine(this.layoutConfig);
    const { slots, grid, totalPages } = this.layoutEngine.getSlotsForCards(this.cards.length, this.currentPageIndex);

    const isLandscape = this.layoutConfig.orientation === 'landscape';
    // Visual screen pixel scale for A4 sheet (approx 2.75 px per mm)
    const pxPerMm = 2.75;
    const sheetPxW = Math.round(grid.pageW * pxPerMm);
    const sheetPxH = Math.round(grid.pageH * pxPerMm);

    this.container.innerHTML = `
      <div class="a4-viewport" id="a4-viewport" style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 20px 20px 60px 20px; overflow-y: auto;">
        
        <!-- Top Toolbar: Controls, Layout and Flip -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; width: 100%; max-width: 960px; background-color: rgba(30, 41, 59, 0.95); backdrop-filter: blur(10px); padding: 10px 18px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-lg); z-index: 30;">
          
          <!-- Orientation & Columns -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; font-size: 12px; color: var(--text-primary); display: flex; align-items: center; gap: 4px;">
              <i data-lucide="grid-3x3"></i> A4 (210×297 мм)
            </span>

            <select id="a4-orientation" style="padding: 4px 8px; font-size: 11px;">
              <option value="portrait" ${!isLandscape ? 'selected' : ''}>Книжная</option>
              <option value="landscape" ${isLandscape ? 'selected' : ''}>Альбомная</option>
            </select>

            <select id="a4-columns" style="padding: 4px 8px; font-size: 11px;">
              <option value="auto" ${this.layoutConfig.columnMode === 'auto' ? 'selected' : ''}>Авто-колонки (${grid.columns})</option>
              <option value="2" ${this.layoutConfig.columnMode === '2' ? 'selected' : ''}>2 колонки</option>
              <option value="3" ${this.layoutConfig.columnMode === '3' ? 'selected' : ''}>3 колонки</option>
            </select>
          </div>

          <!-- Flip Controls Group (Section 9) -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="display: flex; gap: 2px; background-color: var(--bg-primary); padding: 2px; border-radius: 18px;">
              <button class="side-toggle-btn ${!this.isAllFlipped ? 'active' : ''}" id="btn-a4-show-front" style="padding: 4px 10px; font-size: 11px;" title="Показать лицевые стороны">
                Лицевые
              </button>
              <button class="side-toggle-btn ${this.isAllFlipped ? 'active' : ''}" id="btn-a4-show-back" style="padding: 4px 10px; font-size: 11px;" title="Показать обратные стороны">
                Обратные
              </button>
            </div>

            <button class="btn-secondary" id="btn-a4-flip-all" style="font-size: 11px; padding: 5px 12px;" title="Синхронно перевернуть все карточки на 180°">
              <i data-lucide="rotate-cw"></i> Перевернуть все
            </button>
          </div>

          <!-- Crop marks & Pagination -->
          <div style="display: flex; align-items: center; gap: 10px; font-size: 11px;">
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" id="a4-crop-marks" ${this.layoutConfig.showCropMarks ? 'checked' : ''} style="cursor: pointer;" />
              <span>Линии обрезки</span>
            </label>

            ${
              totalPages > 1
                ? `
              <div style="display: flex; align-items: center; gap: 4px; margin-left: 8px;">
                <button class="btn-icon" id="btn-prev-page" ${this.currentPageIndex === 0 ? 'disabled' : ''} title="Предыдущая страница">
                  <i data-lucide="arrow-left" style="width: 13px; height: 13px;"></i>
                </button>
                <span style="font-size: 11px; font-weight: 600;">Стр. ${this.currentPageIndex + 1} / ${totalPages}</span>
                <button class="btn-icon" id="btn-next-page" ${this.currentPageIndex >= totalPages - 1 ? 'disabled' : ''} title="Следующая страница">
                  <i data-lucide="arrow-right" style="width: 13px; height: 13px;"></i>
                </button>
              </div>
            `
                : ''
            }
          </div>
        </div>

        <!-- Info Diagnostic Strip -->
        <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; color: var(--text-secondary); width: 100%; max-width: 960px; padding: 0 4px;">
          <span>Сетка: <strong>${grid.columns} колонок × ${grid.rows} строк</strong> (${grid.capacityPerPage} шт./лист)</span>
          <span>•</span>
          <span>Всего карточек: <strong>${this.cards.length}</strong> (Листов: <strong>${totalPages}</strong>)</span>
          <span>•</span>
          <span style="color: var(--success); font-weight: 500;">
            Стандарт CR-80 (85.60 × 53.98 мм) — Pixel-Perfect Stitch Layout
          </span>
        </div>

        <!-- A4 Paper Visual Container -->
        <div class="a4-sheet" style="width: ${sheetPxW}px; height: ${sheetPxH}px; background-color: #FFFFFF; box-shadow: var(--shadow-card); border-radius: 4px; position: relative; overflow: hidden; user-select: none;">
          ${this.renderSheetSlots(slots, pxPerMm)}
          ${this.layoutConfig.showCropMarks ? this.renderCropMarks(slots, pxPerMm) : ''}
        </div>
      </div>
    `;

    this.bindEvents();
    if (window.initIcons) {
      window.initIcons(this.container);
    }
  }

  renderSheetSlots(slots, pxPerMm) {
    if (slots.length === 0) {
      return `
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #94A3B8; font-size: 13px;">
          Нет карточек для размещения на листе.
        </div>
      `;
    }

    return slots
      .map((slot) => {
        const card = this.cards[slot.cardIndex];
        if (!card) return '';

        const slotLeft = Math.round(slot.leftMm * pxPerMm);
        const slotTop = Math.round(slot.topMm * pxPerMm);
        const slotW = Math.round(slot.widthMm * pxPerMm);
        const slotH = Math.round(slot.heightMm * pxPerMm);

        // Native card is 440 x 278 px
        const scaleFactor = slotW / 440;

        const cardData = card.data || card;
        const renderedCardHtml = this.isAllFlipped
          ? renderBadgeBackHtml(cardData, { isEditable: false })
          : renderBadgeFrontHtml(cardData, { isEditable: false });

        return `
          <div class="a4-card-slot" data-id="${card.id}" title="Нажмите для редактирования карточки" style="position: absolute; left: ${slotLeft}px; top: ${slotTop}px; width: ${slotW}px; height: ${slotH}px; overflow: hidden; cursor: pointer; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); transition: transform 0.15s, box-shadow 0.15s;" onmouseover="this.style.boxShadow='0 0 0 2px #0284C7'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.12)'">
            <div style="width: 440px; height: 278px; transform: scale(${scaleFactor}); transform-origin: top left; pointer-events: none;">
              ${renderedCardHtml}
            </div>
          </div>
        `;
      })
      .join('');
  }

  renderCropMarks(slots, pxPerMm) {
    let svgContent = '';

    slots.forEach((slot) => {
      const marks = this.layoutEngine.generateCropMarks(slot);
      marks.forEach((m) => {
        const x1 = Math.round(m.x1 * pxPerMm);
        const y1 = Math.round(m.y1 * pxPerMm);
        const x2 = Math.round(m.x2 * pxPerMm);
        const y2 = Math.round(m.y2 * pxPerMm);
        svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94A3B8" stroke-width="0.8" />`;
      });
    });

    return `
      <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20;">
        ${svgContent}
      </svg>
    `;
  }

  bindEvents() {
    this.container.querySelector('#a4-orientation')?.addEventListener('change', (e) => {
      this.layoutConfig.orientation = e.target.value;
      this.render();
    });

    this.container.querySelector('#a4-columns')?.addEventListener('change', (e) => {
      this.layoutConfig.columnMode = e.target.value;
      this.render();
    });

    this.container.querySelector('#a4-crop-marks')?.addEventListener('change', (e) => {
      this.layoutConfig.showCropMarks = e.target.checked;
      this.render();
    });

    this.container.querySelector('#btn-a4-show-front')?.addEventListener('click', () => {
      this.isAllFlipped = false;
      this.render();
      this.onFlipAll(false);
    });

    this.container.querySelector('#btn-a4-show-back')?.addEventListener('click', () => {
      this.isAllFlipped = true;
      this.render();
      this.onFlipAll(true);
    });

    this.container.querySelector('#btn-a4-flip-all')?.addEventListener('click', () => {
      this.isAllFlipped = !this.isAllFlipped;
      this.render();
      this.onFlipAll(this.isAllFlipped);
    });

    this.container.querySelector('#btn-prev-page')?.addEventListener('click', () => {
      if (this.currentPageIndex > 0) {
        this.currentPageIndex--;
        this.render();
      }
    });

    this.container.querySelector('#btn-next-page')?.addEventListener('click', () => {
      this.currentPageIndex++;
      this.render();
    });

    this.container.querySelectorAll('.a4-card-slot').forEach((slot) => {
      slot.addEventListener('click', () => {
        const id = slot.dataset.id;
        this.onCardSelect(id);
      });
    });
  }
}
