// Sidebar Component for managing student badge cards

export class Sidebar {
  constructor({ container, onSelectCard, onAddCard, onDuplicateCard, onDeleteCard, onRenameCard }) {
    this.container = container;
    this.onSelectCard = onSelectCard;
    this.onAddCard = onAddCard;
    this.onDuplicateCard = onDuplicateCard;
    this.onDeleteCard = onDeleteCard;
    this.onRenameCard = onRenameCard;

    this.cards = [];
    this.selectedCardId = null;
    this.searchQuery = '';

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <aside class="app-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Карточки студентов</span>
            <span class="card-badge-count" id="cards-count">0</span>
          </div>

          <button class="btn-primary" id="btn-add-card" style="width: 100%;">
            <i data-lucide="plus"></i> Добавить студента
          </button>

          <div class="sidebar-search">
            <i data-lucide="search"></i>
            <input type="text" id="card-search-input" placeholder="Поиск по ФИО или ID..." />
          </div>
        </div>

        <div class="sidebar-card-list" id="sidebar-card-list">
          <!-- Card items will be rendered here -->
        </div>
      </aside>
    `;
  }

  bindEvents() {
    this.container.querySelector('#btn-add-card').addEventListener('click', () => {
      this.onAddCard();
    });

    const searchInput = this.container.querySelector('#card-search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.updateList();
    });
  }

  setCards(cards, selectedId) {
    this.cards = cards;
    this.selectedCardId = selectedId || (cards[0] ? cards[0].id : null);
    this.updateList();
  }

  updateList() {
    const countEl = this.container.querySelector('#cards-count');
    const listEl = this.container.querySelector('#sidebar-card-list');
    if (!listEl) return;

    const filtered = this.cards.filter((c) => {
      if (!this.searchQuery) return true;
      const name = (c.name || '').toLowerCase();
      const studentId = (c.studentId || '').toLowerCase();
      return name.includes(this.searchQuery) || studentId.includes(this.searchQuery);
    });

    if (countEl) {
      countEl.textContent = this.cards.length;
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 12px;">
          ${this.searchQuery ? 'Ничего не найдено' : 'Нет карточек. Нажмите «Добавить студента»'}
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered
      .map((card) => {
        const isActive = card.id === this.selectedCardId;
        return `
          <div class="badge-item-card ${isActive ? 'active' : ''}" data-id="${card.id}">
            <div class="badge-thumb">
              <span class="badge-thumb-placeholder">KT-ID</span>
            </div>
            <div class="badge-item-info">
              <span class="badge-item-name" title="${card.name || 'Без имени'}">
                ${card.name || 'Новый студент'}
              </span>
              <span class="badge-item-meta">
                ${card.group || 'Группа не указана'} • ${card.studentId || 'ID'}
              </span>
            </div>
            <div class="badge-item-actions">
              <button class="btn-icon duplicate-btn" data-action="duplicate" title="Дублировать карточку">
                <i data-lucide="copy" style="width: 13px; height: 13px;"></i>
              </button>
              <button class="btn-icon delete-btn" data-action="delete" title="Удалить карточку">
                <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    // Attach listeners to items
    listEl.querySelectorAll('.badge-item-card').forEach((el) => {
      const id = el.dataset.id;

      el.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) {
          this.selectedCardId = id;
          this.updateList();
          this.onSelectCard(id);
        }
      });

      const dupBtn = el.querySelector('[data-action="duplicate"]');
      if (dupBtn) {
        dupBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onDuplicateCard(id);
        });
      }

      const delBtn = el.querySelector('[data-action="delete"]');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Удалить эту карточку студента?')) {
            this.onDeleteCard(id);
          }
        });
      }
    });

    // Refresh icons
    if (window.initIcons) {
      window.initIcons(listEl);
    }
  }
}
