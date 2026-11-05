import { SheetLayoutEngine } from '../../printing/layout.js';

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
      cardWidthMm: 90,
      cardHeightMm: 55,
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
    const inners = this.container.querySelectorAll('.a4-card-cell-inner');
    inners.forEach((inner) => {
      inner.classList.toggle('no-animation', !enabled);
    });
  }

  render() {
    this.layoutEngine = new SheetLayoutEngine(this.layoutConfig);
    const { slots, grid, totalPages } = this.layoutEngine.getSlotsForCards(this.cards.length, this.currentPageIndex);

    const isLandscape = this.layoutConfig.orientation === 'landscape';
    // Visual screen pixel scale for A4 sheet (approx 2.6 px per mm for crisp view)
    const pxPerMm = 2.65;
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
              <option value="4" ${this.layoutConfig.columnMode === '4' ? 'selected' : ''}>4 колонки</option>
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

          <!-- Crop marks & Margins -->
          <div style="display: flex; align-items: center; gap: 10px; font-size: 11px;">
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" id="a4-crop-marks" ${this.layoutConfig.showCropMarks ? 'checked' : ''} style="cursor: pointer;" />
              <span>Линии обрезки</span>
            </label>

            <!-- Page switcher if multiple pages -->
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

        <!-- Info / Diagnostic Strip -->
        <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; color: var(--text-secondary); width: 100%; max-width: 960px; padding: 0 4px;">
          <span>Сетка листа: <strong>${grid.columns} колонок × ${grid.rows} строк</strong> (${grid.capacityPerPage} шт./лист)</span>
          <span>•</span>
          <span>Всего карточек: <strong>${this.cards.length}</strong> (Листов: <strong>${totalPages}</strong>)</span>
          <span>•</span>
          <span style="color: ${grid.fits ? 'var(--success)' : 'var(--danger)'};">
            ${grid.fits ? 'Карточки идеально помещаются на формате A4' : 'Внимание: выбранный размер карточки превышает полезную область листа!'}
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

        const studentName = card.name || `Студент #${slot.cardIndex + 1}`;
        const studentGroup = card.group || 'П-302';
        const studentId = card.studentId || `ID-2026-${String(slot.cardIndex + 1).padStart(4, '0')}`;
        const login = `${studentName.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '.')}.stud@kt.tj`;

        return `
          <div class="a4-card-cell-perspective" style="position: absolute; left: ${slotLeft}px; top: ${slotTop}px; width: ${slotW}px; height: ${slotH}px;">
            <div class="a4-card-cell-inner ${this.isAllFlipped ? 'flipped' : ''} ${!this.animationEnabled ? 'no-animation' : ''}" data-id="${card.id}" style="border: 0.5px solid #CBD5E1;">
              
              <!-- Front Side Face -->
              <div class="a4-face a4-face-front" style="padding: 7px;">
                <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 2px 5px; border-radius: 2px; font-size: 8px; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                  <span>КОЛЛЕҶИ ТЕХНОЛОГИӢ</span>
                  <span style="font-size: 7px; opacity: 0.8;">#${slot.cardIndex + 1}</span>
                </div>

                <div style="display: flex; gap: 7px; align-items: center; margin: 3px 0;">
                  <div style="width: 38px; height: 48px; background-color: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7px; color: #64748B; flex-shrink: 0;">
                    <i data-lucide="image" style="width: 12px; height: 12px; opacity: 0.7;"></i>
                    <span>ФОТО</span>
                  </div>

                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 9.5px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${studentName}
                    </div>
                    <div style="font-size: 7.5px; color: #64748B; margin-top: 1px;">
                      Ихтисос: Барномасозӣ
                    </div>
                    <div style="font-size: 7.5px; color: #475569; font-weight: 600;">
                      ${studentGroup} • <span style="color: #2563EB;">${studentId}</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 2px; font-size: 7px; color: #94A3B8;">
                  <span>ЛИЦЕВАЯ СТОРОНА</span>
                  <span>${slot.widthMm} × ${slot.heightMm} мм</span>
                </div>
              </div>

              <!-- Back Side Face -->
              <div class="a4-face a4-face-back" style="padding: 7px;">
                <div style="background-color: #334155; color: #FFFFFF; padding: 2px 5px; border-radius: 2px; font-size: 8px; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                  <span>МАЪЛУМОТИ ХИДМАТӢ</span>
                  <span style="font-size: 7px; opacity: 0.8;">#${slot.cardIndex + 1}</span>
                </div>

                <div style="display: flex; gap: 7px; align-items: center; margin: 3px 0;">
                  <div style="flex: 1; min-width: 0; font-size: 7.5px;">
                    <div style="color: #64748B;">Логин:</div>
                    <div style="font-weight: 600; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${login}</div>
                    <div style="color: #64748B; margin-top: 1px;">Пароль: <span style="font-weight: 600; color: #0F172A;">KT#2026!</span></div>
                  </div>

                  <div style="width: 36px; height: 36px; background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 3px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="qr-code" style="width: 20px; height: 20px; color: #0F172A;"></i>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 2px; font-size: 7px; color: #94A3B8;">
                  <span>ОБРАТНАЯ СТОРОНА</span>
                  <span>Тел: 221-45-88</span>
                </div>
              </div>

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
    // Orientation
    this.container.querySelector('#a4-orientation')?.addEventListener('change', (e) => {
      this.layoutConfig.orientation = e.target.value;
      this.render();
    });

    // Columns
    this.container.querySelector('#a4-columns')?.addEventListener('change', (e) => {
      this.layoutConfig.columnMode = e.target.value;
      this.render();
    });

    // Crop marks
    this.container.querySelector('#a4-crop-marks')?.addEventListener('change', (e) => {
      this.layoutConfig.showCropMarks = e.target.checked;
      this.render();
    });

    // Flip Controls
    this.container.querySelector('#btn-a4-show-front')?.addEventListener('click', () => {
      this.isAllFlipped = false;
      this.updateAllCardFaces();
    });

    this.container.querySelector('#btn-a4-show-back')?.addEventListener('click', () => {
      this.isAllFlipped = true;
      this.updateAllCardFaces();
    });

    this.container.querySelector('#btn-a4-flip-all')?.addEventListener('click', () => {
      this.isAllFlipped = !this.isAllFlipped;
      this.updateAllCardFaces();
    });

    // Pagination
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

    // Card selection to switch back to editor
    this.container.querySelectorAll('.a4-card-cell-inner').forEach((cell) => {
      cell.addEventListener('click', () => {
        const id = cell.dataset.id;
        this.onCardSelect(id);
      });
    });
  }

  updateAllCardFaces() {
    const inners = this.container.querySelectorAll('.a4-card-cell-inner');
    inners.forEach((inner) => {
      inner.classList.toggle('flipped', this.isAllFlipped);
    });

    const btnFront = this.container.querySelector('#btn-a4-show-front');
    const btnBack = this.container.querySelector('#btn-a4-show-back');
    if (btnFront && btnBack) {
      btnFront.classList.toggle('active', !this.isAllFlipped);
      btnBack.classList.toggle('active', this.isAllFlipped);
    }

    this.onFlipAll(this.isAllFlipped);
  }
}
