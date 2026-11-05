export class A4Editor {
  constructor({ container, onFlipAll, onCardSelect, animationEnabled = true }) {
    this.container = container;
    this.onFlipAll = onFlipAll || (() => {});
    this.onCardSelect = onCardSelect || (() => {});
    this.animationEnabled = animationEnabled;
    this.isAllFlipped = false;
    this.cards = [];
    this.badgeStandard = '90x55';

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
    this.container.innerHTML = `
      <div class="a4-viewport" id="a4-viewport">
        <!-- Floating toolbar for A4 -->
        <div style="position: absolute; top: 16px; display: flex; align-items: center; gap: 10px; background-color: rgba(30, 41, 59, 0.95); backdrop-filter: blur(8px); padding: 8px 16px; border-radius: 30px; border: 1px solid var(--border-subtle); z-index: 40; box-shadow: var(--shadow-lg);">
          <span style="font-weight: 600; font-size: 12px; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <i data-lucide="grid-3x3"></i> Лист A4 (210 × 297 мм)
          </span>

          <div class="floating-divider"></div>

          <!-- Flip Controls Group (Section 9) -->
          <div style="display: flex; gap: 4px; background-color: var(--bg-primary); padding: 2px; border-radius: 20px;">
            <button class="side-toggle-btn ${!this.isAllFlipped ? 'active' : ''}" id="btn-a4-show-front" title="Показать лицевые стороны всех карточек">
              Лицевые стороны
            </button>
            <button class="side-toggle-btn ${this.isAllFlipped ? 'active' : ''}" id="btn-a4-show-back" title="Показать обратные стороны всех карточек">
              Обратные стороны
            </button>
          </div>

          <button class="btn-secondary" id="btn-a4-flip-all" style="font-size: 11px; padding: 4px 12px;" title="Синхронно перевернуть все карточки на 180°">
            <i data-lucide="rotate-cw"></i> Перевернуть все
          </button>

          <div class="floating-divider"></div>
          <span style="font-size: 11px; color: var(--text-secondary);">
            Карточек: <strong style="color: var(--text-primary);">${this.cards.length}</strong> (2 колонки)
          </span>
        </div>

        <!-- A4 Paper Representation (scaled for screen preview: 210mm x 297mm approx 595px x 842px) -->
        <div class="a4-sheet" style="width: 595px; height: 842px; padding: 26px; border-radius: 4px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; align-content: start; justify-items: center;">
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
        <div style="grid-column: span 2; display: flex; align-items: center; justify-content: center; height: 350px; color: #94A3B8; font-size: 13px;">
          Нет карточек для размещения на листе.
        </div>
      `;
    }

    return this.cards
      .map((card, index) => {
        const studentName = card.name || `Студент #${index + 1}`;
        const studentGroup = card.group || 'П-302';
        const studentId = card.studentId || `ID-2026-${String(index + 1).padStart(4, '0')}`;
        const login = `${studentName.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '.')}.stud@kt.tj`;

        return `
          <div class="a4-card-cell-perspective">
            <div class="a4-card-cell-inner ${this.isAllFlipped ? 'flipped' : ''} ${!this.animationEnabled ? 'no-animation' : ''}" data-id="${card.id}">
              <!-- Front Side Face -->
              <div class="a4-face a4-face-front">
                <!-- Mini Header Banner -->
                <div style="background-color: #1E3A8A; color: #FFFFFF; padding: 3px 6px; border-radius: 3px; font-size: 8px; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                  <span>КОЛЛЕҶИ ТЕХНОЛОГИӢ</span>
                  <span style="font-size: 7px; opacity: 0.8;">#${index + 1}</span>
                </div>

                <div style="display: flex; gap: 8px; align-items: center; margin: 4px 0;">
                  <!-- Student Avatar Placeholder -->
                  <div style="width: 42px; height: 52px; background-color: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; color: #64748B; flex-shrink: 0;">
                    <i data-lucide="image" style="width: 14px; height: 14px; opacity: 0.7;"></i>
                    <span style="font-size: 7px;">ФОТО</span>
                  </div>

                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 10px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${studentName}
                    </div>
                    <div style="font-size: 8px; color: #64748B; margin-top: 2px;">
                      Ихтисос: Барномасозӣ
                    </div>
                    <div style="font-size: 8px; color: #475569; font-weight: 600;">
                      ${studentGroup} • <span style="color: #2563EB;">${studentId}</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 3px; font-size: 7.5px; color: #94A3B8;">
                  <span>ЛИЦЕВАЯ СТОРОНА</span>
                  <span>90 × 55 мм</span>
                </div>
              </div>

              <!-- Back Side Face -->
              <div class="a4-face a4-face-back">
                <!-- Mini Header Banner -->
                <div style="background-color: #334155; color: #FFFFFF; padding: 3px 6px; border-radius: 3px; font-size: 8px; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                  <span>МАЪЛУМОТИ ХИДМАТӢ</span>
                  <span style="font-size: 7px; opacity: 0.8;">#${index + 1}</span>
                </div>

                <div style="display: flex; gap: 8px; align-items: center; margin: 4px 0;">
                  <div style="flex: 1; min-width: 0; font-size: 8px;">
                    <div style="color: #64748B;">Логин:</div>
                    <div style="font-weight: 600; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${login}</div>
                    <div style="color: #64748B; margin-top: 2px;">Пароль: <span style="font-weight: 600; color: #0F172A;">KT#2026!</span></div>
                  </div>

                  <!-- Mini QR Placeholder -->
                  <div style="width: 40px; height: 40px; background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="qr-code" style="width: 24px; height: 24px; color: #0F172A;"></i>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 3px; font-size: 7.5px; color: #94A3B8;">
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

  bindEvents() {
    // Show All Front
    this.container.querySelector('#btn-a4-show-front')?.addEventListener('click', () => {
      this.isAllFlipped = false;
      this.updateAllCardFaces();
    });

    // Show All Back
    this.container.querySelector('#btn-a4-show-back')?.addEventListener('click', () => {
      this.isAllFlipped = true;
      this.updateAllCardFaces();
    });

    // Flip All Toggle
    this.container.querySelector('#btn-a4-flip-all')?.addEventListener('click', () => {
      this.isAllFlipped = !this.isAllFlipped;
      this.updateAllCardFaces();
    });

    // Click on individual card to edit
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
