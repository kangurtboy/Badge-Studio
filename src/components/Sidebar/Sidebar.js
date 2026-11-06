// Unified Left Sidebar: Student List + Fast Profile Form Editor

export class Sidebar {
  constructor({
    container,
    onSelectCard,
    onAddCard,
    onDuplicateCard,
    onDeleteCard,
    onUpdateField,
    onEditPhoto,
  }) {
    this.container = container;
    this.onSelectCard = onSelectCard || (() => {});
    this.onAddCard = onAddCard || (() => {});
    this.onDuplicateCard = onDuplicateCard || (() => {});
    this.onDeleteCard = onDeleteCard || (() => {});
    this.onUpdateField = onUpdateField || (() => {});
    this.onEditPhoto = onEditPhoto || (() => {});

    this.cards = [];
    this.selectedCardId = null;
    this.searchQuery = '';

    this.render();
  }

  setCards(cards, selectedId) {
    this.cards = cards;
    this.selectedCardId = selectedId || (cards[0] ? cards[0].id : null);
    this.render();
  }

  getSelectedCard() {
    return this.cards.find((c) => c.id === this.selectedCardId) || this.cards[0] || null;
  }

  render() {
    const card = this.getSelectedCard();
    const data = card?.data || {};

    const filteredCards = this.cards.filter((c) => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      const name = (c.name || '').toLowerCase();
      const id = (c.studentId || c.data?.idNumber || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });

    this.container.innerHTML = `
      <aside class="app-sidebar" style="width: 320px; background-color: var(--bg-secondary); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; height: 100%; overflow: hidden; flex-shrink: 0; user-select: none;">
        
        <!-- Header: Search & Add Student -->
        <div style="padding: 12px; border-bottom: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 13px; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
              <i data-lucide="users" style="width: 15px; height: 15px; color: var(--accent-primary);"></i> Донишҷӯён
            </span>
            <span style="font-size: 11px; background-color: var(--bg-tertiary); padding: 2px 7px; border-radius: 10px; color: var(--text-secondary); font-weight: 600;">
              ${this.cards.length} нафар
            </span>
          </div>

          <button class="btn-primary" id="btn-add-student" style="width: 100%; padding: 7px; font-size: 12px; font-weight: 600;">
            <i data-lucide="plus"></i> Иловаи донишҷӯ (Добавить)
          </button>

          <div style="position: relative; width: 100%;">
            <input type="text" id="sidebar-search-input" placeholder="Ҷустуҷӯ бо ном ё ID..." value="${this.searchQuery}" style="width: 100%; padding-left: 28px; font-size: 11.5px; height: 28px;" />
            <i data-lucide="search" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 13px; height: 13px; color: var(--text-muted); pointer-events: none;"></i>
          </div>
        </div>

        <!-- Student List (Compact scrollable row) -->
        <div style="max-height: 180px; overflow-y: auto; padding: 6px 8px; display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid var(--border-subtle); background-color: rgba(15, 23, 42, 0.3);">
          ${filteredCards
            .map((c, idx) => {
              const isSelected = c.id === this.selectedCardId;
              const photoSrc = c.photoSrc || c.data?.photoSrc || '/assets/student-nigina.jpg';
              const sName = c.name || (c.data ? `${c.data.nameLine1} ${c.data.nameLine2}` : `Донишҷӯ #${idx + 1}`);
              const sId = c.studentId || c.data?.idNumber || '2-790106';

              return `
                <div class="sidebar-student-row ${isSelected ? 'active' : ''}" data-id="${c.id}" style="display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 6px; cursor: pointer; background-color: ${isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent'}; border: 1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}; transition: background-color 0.15s;">
                  <img src="${photoSrc}" style="width: 24px; height: 30px; object-fit: cover; border-radius: 3px; border: 1px solid #CBD5E1; flex-shrink: 0;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 11.5px; font-weight: 600; color: ${isSelected ? '#FFFFFF' : 'var(--text-primary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${sName}
                    </div>
                    <div style="font-size: 10px; color: var(--text-secondary); font-family: monospace;">
                      ID: ${sId}
                    </div>
                  </div>
                  <div style="display: flex; gap: 2px;">
                    <button class="btn-icon duplicate-card-btn" data-id="${c.id}" title="Нусхабардорӣ (Дублировать)" style="width: 22px; height: 22px;">
                      <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
                    </button>
                    <button class="btn-icon delete-card-btn" data-id="${c.id}" title="Нобуд кардан (Удалить)" style="width: 22px; height: 22px; color: var(--danger);">
                      <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
                    </button>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>

        <!-- Selected Student Editor Form -->
        <div style="flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
          ${
            card
              ? `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-primary);">
                Таҳрири маълумот
              </span>
              <button class="btn-secondary" id="btn-trigger-photo-modal" style="font-size: 11px; padding: 4px 8px;">
                <i data-lucide="image"></i> Ивази акс
              </button>
            </div>

            <!-- Form fields -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div>
                <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">ID Донишҷӯ</label>
                <input type="text" class="field-input" data-field="idNumber" value="${data.idNumber || card.studentId || '2-790106'}" style="width: 100%; margin-top: 2px; font-family: monospace; font-weight: 700;" />
              </div>

              <div>
                <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Насаб (Фамилия)</label>
                <input type="text" class="field-input" data-field="nameLine1" value="${data.nameLine1 || 'РАҲИМОВА'}" style="width: 100%; margin-top: 2px; font-weight: 700;" />
              </div>

              <div>
                <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Ном ва номи падар (Имя и отчество)</label>
                <input type="text" class="field-input" data-field="nameLine2" value="${data.nameLine2 || 'НИГИНА РУСТАМОВНА'}" style="width: 100%; margin-top: 2px; font-weight: 700;" />
              </div>

              <div>
                <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Ихтисос (Специальность)</label>
                <input type="text" class="field-input" data-field="specialty" value="${data.specialty || 'кори ҳамширагӣ'}" style="width: 100%; margin-top: 2px;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Соли таҳсил</label>
                  <input type="text" class="field-input" data-field="cohort" value="${data.cohort || '2024–2028'}" style="width: 100%; margin-top: 2px;" />
                </div>
                <div>
                  <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Эътибор (EXP)</label>
                  <input type="text" class="field-input" data-field="validity" value="${data.validity || 'EXP: 01/07/2028'}" style="width: 100%; margin-top: 2px; font-family: monospace;" />
                </div>
              </div>

              <div>
                <label style="font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Директор</label>
                <input type="text" class="field-input" data-field="directorName" value="${data.directorName || 'Сафарзода З.И.'}" style="width: 100%; margin-top: 2px;" />
              </div>

              <div style="border-top: 1px solid var(--border-subtle); padding-top: 8px; margin-top: 4px;">
                <span style="font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 6px;">
                  Маълумоти Moodle & Суроға
                </span>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted);">Логин</label>
                    <input type="text" class="field-input" data-field="moodleLogin" value="${data.moodleLogin || 'gr26111'}" style="width: 100%; margin-top: 2px; font-family: monospace;" />
                  </div>
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted);">Парол</label>
                    <input type="text" class="field-input" data-field="moodlePass" value="${data.moodlePass || 'Student1#'}" style="width: 100%; margin-top: 2px; font-family: monospace;" />
                  </div>
                </div>
                <div style="margin-top: 6px;">
                  <label style="font-size: 10px; color: var(--text-muted);">Суроға (Адрес)</label>
                  <input type="text" class="field-input" data-field="addressVillage" value="${data.addressVillage || 'ҷ.д Кангурт'}" style="width: 100%; margin-top: 2px;" />
                </div>
              </div>
            </div>
          `
              : `
            <div style="text-align: center; color: var(--text-muted); padding: 30px 10px; font-size: 12px;">
              Донишҷӯ интихоб нашудааст.
            </div>
          `
          }
        </div>
      </aside>
    `;

    this.bindEvents();
    if (window.initIcons) {
      window.initIcons(this.container);
    }
  }

  bindEvents() {
    // Add student
    this.container.querySelector('#btn-add-student')?.addEventListener('click', () => {
      this.onAddCard();
    });

    // Search input
    const searchInput = this.container.querySelector('#sidebar-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      this.render();
      // keep focus
      const updatedInput = this.container.querySelector('#sidebar-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
      }
    });

    // Select student row
    this.container.querySelectorAll('.sidebar-student-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const id = row.dataset.id;
        this.selectedCardId = id;
        this.onSelectCard(id);
      });
    });

    // Duplicate button
    this.container.querySelectorAll('.duplicate-card-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onDuplicateCard(btn.dataset.id);
      });
    });

    // Delete button
    this.container.querySelectorAll('.delete-card-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onDeleteCard(btn.dataset.id);
      });
    });

    // Photo change button
    this.container.querySelector('#btn-trigger-photo-modal')?.addEventListener('click', () => {
      const card = this.getSelectedCard();
      const photoSrc = card?.photoSrc || card?.data?.photoSrc || '/assets/student-nigina.jpg';
      this.onEditPhoto(photoSrc);
    });

    // Field inputs
    this.container.querySelectorAll('.field-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const field = input.dataset.field;
        this.onUpdateField(field, e.target.value);
      });
    });
  }
}
