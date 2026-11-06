import { SheetLayoutEngine } from '../../printing/layout.js';
import { renderBadgeFrontHtml, renderBadgeBackHtml } from '../BadgeCard/renderBadgeHtml.js';

export class A4Editor {
  constructor({
    container,
    onFlipAll,
    onCardSelect,
    onPhotoClick,
    onUpdateField,
  }) {
    this.container = container;
    this.onFlipAll = onFlipAll || (() => {});
    this.onCardSelect = onCardSelect || (() => {});
    this.onPhotoClick = onPhotoClick || (() => {});
    this.onUpdateField = onUpdateField || (() => {});

    this.isAllFlipped = false;
    this.currentPageIndex = 0;
    this.cards = [];
    this.selectedCardId = null;
    this.zoomLevel = 1.0; // 0.85, 1.0, 1.15

    // Standard A4 Layout for 96 x 67 mm badge (2 columns x 3 rows = 6 badges per A4 page)
    this.layoutConfig = {
      orientation: 'portrait',
      cardWidthMm: 96,
      cardHeightMm: 67,
      marginTopMm: 12,
      marginBottomMm: 12,
      marginLeftMm: 8,
      marginRightMm: 8,
      gapXMm: 2,
      gapYMm: 3,
      columnMode: 'auto',
      showCropMarks: true,
    };

    this.layoutEngine = new SheetLayoutEngine(this.layoutConfig);
    this.render();
  }

  setCards(cards, selectedId) {
    this.cards = cards;
    if (selectedId) this.selectedCardId = selectedId;
    this.render();
  }

  render() {
    this.layoutEngine = new SheetLayoutEngine(this.layoutConfig);
    const { slots, grid, totalPages } = this.layoutEngine.getSlotsForCards(this.cards.length, this.currentPageIndex);

    // Visual screen pixel scale for A4 sheet (approx 2.65 px per mm)
    const pxPerMm = 2.65 * this.zoomLevel;
    const sheetPxW = Math.round(grid.pageW * pxPerMm);
    const sheetPxH = Math.round(grid.pageH * pxPerMm);

    this.container.innerHTML = `
      <div class="a4-viewport" id="a4-viewport" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 14px; padding: 16px 20px 80px 20px; overflow-y: auto; width: 100%; height: 100%; box-sizing: border-box; background-color: var(--bg-canvas);">
        
        <!-- Top Sticky Action Bar on top of A4 sheet -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; width: 100%; max-width: ${sheetPxW}px; min-width: 540px; background-color: rgba(30, 41, 59, 0.95); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-lg); z-index: 30;">
          
          <!-- Side Switcher (Front / Back / 3D Flip) -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="display: flex; gap: 2px; background-color: var(--bg-primary); padding: 2px; border-radius: 18px;">
              <button class="side-toggle-btn ${!this.isAllFlipped ? 'active' : ''}" id="btn-a4-show-front" style="padding: 4px 12px; font-size: 11.5px; font-weight: 600;" title="Рӯйи аввал (Лицевая сторона)">
                Рӯйи аввал
              </button>
              <button class="side-toggle-btn ${this.isAllFlipped ? 'active' : ''}" id="btn-a4-show-back" style="padding: 4px 12px; font-size: 11.5px; font-weight: 600;" title="Рӯйи ақиб (Обратная сторона)">
                Рӯйи ақиб
              </button>
            </div>

            <button class="btn-secondary" id="btn-a4-flip-all" style="font-size: 11px; padding: 4px 10px;" title="Синхронно перевернуть все карточки на листе в 3D">
              <i data-lucide="rotate-cw" style="width: 13px; height: 13px;"></i> Перевернуть 3D
            </button>
          </div>

          <!-- Crop marks & Zoom Controls -->
          <div style="display: flex; align-items: center; gap: 12px; font-size: 11px;">
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--text-secondary);">
              <input type="checkbox" id="a4-crop-marks" ${this.layoutConfig.showCropMarks ? 'checked' : ''} style="cursor: pointer;" />
              <span>Метки обрезки</span>
            </label>

            <!-- Sheet Zoom buttons -->
            <div style="display: flex; align-items: center; gap: 3px; background: var(--bg-primary); padding: 2px; border-radius: 14px;">
              <button class="btn-icon" id="btn-zoom-sheet-out" title="Уменьшить лист" style="width: 22px; height: 22px;">
                <i data-lucide="zoom-out" style="width: 12px; height: 12px;"></i>
              </button>
              <span style="font-size: 10px; font-family: monospace; min-width: 32px; text-align: center;">${Math.round(this.zoomLevel * 100)}%</span>
              <button class="btn-icon" id="btn-zoom-sheet-in" title="Увеличить лист" style="width: 22px; height: 22px;">
                <i data-lucide="zoom-in" style="width: 12px; height: 12px;"></i>
              </button>
            </div>

            ${
              totalPages > 1
                ? `
              <div style="display: flex; align-items: center; gap: 4px; margin-left: 4px;">
                <button class="btn-icon" id="btn-prev-page" ${this.currentPageIndex === 0 ? 'disabled' : ''} title="Саҳифаи пешина" style="width: 24px; height: 24px;">
                  <i data-lucide="arrow-left" style="width: 13px; height: 13px;"></i>
                </button>
                <span style="font-size: 11px; font-weight: 700; color: #FFFFFF;">${this.currentPageIndex + 1} / ${totalPages}</span>
                <button class="btn-icon" id="btn-next-page" ${this.currentPageIndex >= totalPages - 1 ? 'disabled' : ''} title="Саҳифаи оянда" style="width: 24px; height: 24px;">
                  <i data-lucide="arrow-right" style="width: 13px; height: 13px;"></i>
                </button>
              </div>
            `
                : ''
            }
          </div>
        </div>

        <!-- Realistic A4 Sheet Paper Simulation (210 x 297 mm) -->
        <div class="a4-sheet-container" style="position: relative; width: ${sheetPxW}px; height: ${sheetPxH}px; background-color: #FFFFFF; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.15); border-radius: 4px; overflow: hidden; flex-shrink: 0; transition: transform 0.2s ease;">
          ${this.renderSheetSlots(slots, pxPerMm)}
          ${this.layoutConfig.showCropMarks ? this.renderCropMarks(slots, pxPerMm) : ''}
        </div>

        <!-- Sheet Footer Legend -->
        <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
          <span>Лист A4 (210 × 297 мм)</span>
          <span>•</span>
          <span>6 бейджиков (2 колонки × 3 ряда)</span>
          <span>•</span>
          <span>Размер бейджика: <strong>96.0 × 67.0 мм</strong></span>
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
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #94A3B8; font-size: 14px;">
          Карточек нет. Нажмите «+ Иловаи донишҷӯ» в левой панели.
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

        // Native card is 480 x 335 px
        const scaleFactor = slotW / 480;
        const isSelected = card.id === this.selectedCardId;

        const cardData = card.data || card;
        const renderedCardHtml = this.isAllFlipped
          ? renderBadgeBackHtml(cardData, { isEditable: isSelected })
          : renderBadgeFrontHtml(cardData, { isEditable: isSelected });

        return `
          <div class="a4-card-slot" data-id="${card.id}" style="position: absolute; left: ${slotLeft}px; top: ${slotTop}px; width: ${slotW}px; height: ${slotH}px; overflow: hidden; cursor: pointer; border-radius: 4px; box-shadow: ${isSelected ? '0 0 0 2.5px #0284C7, 0 8px 16px rgba(2,132,199,0.25)' : '0 1px 3px rgba(0,0,0,0.1)'}; transition: box-shadow 0.15s, transform 0.15s;">
            <div style="width: 480px; height: 335px; transform: scale(${scaleFactor}); transform-origin: top left; pointer-events: ${isSelected ? 'auto' : 'none'};">
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
        svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748B" stroke-width="0.8" />`;
      });
    });

    return `
      <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20;">
        ${svgContent}
      </svg>
    `;
  }

  bindEvents() {
    // Side switcher
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

    // Zoom controls
    this.container.querySelector('#btn-zoom-sheet-in')?.addEventListener('click', () => {
      this.zoomLevel = Math.min(1.4, this.zoomLevel + 0.15);
      this.render();
    });

    this.container.querySelector('#btn-zoom-sheet-out')?.addEventListener('click', () => {
      this.zoomLevel = Math.max(0.75, this.zoomLevel - 0.15);
      this.render();
    });

    // Crop marks
    this.container.querySelector('#a4-crop-marks')?.addEventListener('change', (e) => {
      this.layoutConfig.showCropMarks = e.target.checked;
      this.render();
    });

    // Page navigation
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

    // Click card to select
    this.container.querySelectorAll('.a4-card-slot').forEach((slot) => {
      slot.addEventListener('click', (e) => {
        if (e.target.closest('[contenteditable="true"]')) return;
        const id = slot.dataset.id;
        this.selectedCardId = id;
        this.render();
        this.onCardSelect(id);
      });
    });

    // In-place contenteditable on active card
    this.container.querySelectorAll('[contenteditable="true"]').forEach((el) => {
      el.addEventListener('input', () => {
        const field = el.dataset.field;
        if (field) {
          this.onUpdateField(field, el.innerText.trim());
        }
      });
    });

    // Photo click on active card
    this.container.querySelector('.student-photo-container')?.addEventListener('click', () => {
      const card = this.cards.find((c) => c.id === this.selectedCardId);
      const photoSrc = card?.photoSrc || card?.data?.photoSrc || '/assets/student-nigina.jpg';
      this.onPhotoClick(photoSrc);
    });
  }
}
