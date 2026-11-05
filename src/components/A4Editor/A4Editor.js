import { BADGE_STANDARDS } from '../../editor/constants.js';

export class A4Editor {
  constructor({ container, onFlipAll, onCardSelect }) {
    this.container = container;
    this.onFlipAll = onFlipAll;
    this.onCardSelect = onCardSelect;
    this.isAllFlipped = false;
    this.cards = [];
    this.badgeStandard = '90x55';
    this.columns = 2; // Default 2 columns for 90x55 on A4

    this.render();
  }

  setCards(cards) {
    this.cards = cards;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="a4-viewport" id="a4-viewport">
        <!-- Floating toolbar for A4 -->
        <div style="position: absolute; top: 16px; display: flex; align-items: center; gap: 10px; background-color: rgba(30, 41, 59, 0.95); backdrop-filter: blur(8px); padding: 8px 16px; border-radius: 30px; border: 1px solid var(--border-subtle); z-index: 40;">
          <span style="font-weight: 600; font-size: 12px; color: var(--text-primary);">Лист A4 (210 × 297 мм)</span>
          <div class="floating-divider"></div>
          <button class="btn-secondary" id="btn-a4-flip-all" style="font-size: 11px; padding: 4px 10px;">
            <i data-lucide="rotate-cw"></i> ${this.isAllFlipped ? 'Показать лицевые' : 'Перевернуть все карточки'}
          </button>
          <div class="floating-divider"></div>
          <span style="font-size: 11px; color: var(--text-secondary);">Карточек на листе: <strong style="color: var(--text-primary);">${this.cards.length}</strong></span>
        </div>

        <!-- A4 Paper Representation (scaled for screen preview: 210mm x 297mm approx 595px x 842px) -->
        <div class="a4-sheet" style="width: 595px; height: 842px; padding: 28px; border-radius: 4px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; align-content: start; justify-items: center;">
          ${this.renderCardsGrid()}
        </div>
      </div>
    `;

    this.bindEvents();
    if (window.initIcons) {
      window.initIcons(this.container);
    }
  }

  renderCardsGrid() {
    if (this.cards.length === 0) {
      return `
        <div style="grid-column: span 2; display: flex; align-items: center; justify-content: center; height: 300px; color: #94A3B8; font-size: 13px;">
          Нет карточек для размещения на листе.
        </div>
      `;
    }

    return this.cards
      .map((card, index) => {
        const sideText = this.isAllFlipped ? 'ОБРАТНАЯ СТОРОНА' : 'ЛИЦЕВАЯ СТОРОНА';
        return `
          <div class="a4-card-cell" data-id="${card.id}" style="width: 255px; height: 156px; border: 1px dashed #CBD5E1; border-radius: 6px; padding: 8px; background-color: ${this.isAllFlipped ? '#F8FAFC' : '#FFFFFF'}; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; font-weight: 700; color: #2563EB;">#${index + 1} ${sideText}</span>
              <span style="font-size: 9px; color: #64748B;">90×55 мм</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <div style="width: 40px; height: 50px; background-color: #E2E8F0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #64748B;">
                ФОТО
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 11px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${card.name || 'Студент'}
                </div>
                <div style="font-size: 10px; color: #475569;">
                  ${card.group || 'Группа'} • ${card.studentId || 'ID'}
                </div>
              </div>
            </div>
            <div style="font-size: 9px; color: #94A3B8; text-align: right;">
              Кликните для редактирования
            </div>
          </div>
        `;
      })
      .join('');
  }

  bindEvents() {
    this.container.querySelector('#btn-a4-flip-all')?.addEventListener('click', () => {
      this.isAllFlipped = !this.isAllFlipped;
      this.onFlipAll(this.isAllFlipped);
      this.render();
    });

    this.container.querySelectorAll('.a4-card-cell').forEach((cell) => {
      cell.addEventListener('click', () => {
        const id = cell.dataset.id;
        this.onCardSelect(id);
      });
    });
  }
}
