// Header Component for Badge Studio

export class Header {
  constructor({ container, onModeChange, onNewBadge, onUndo, onRedo, onOpenSettings, onPrint, onTitleChange }) {
    this.container = container;
    this.onModeChange = onModeChange;
    this.onNewBadge = onNewBadge;
    this.onUndo = onUndo;
    this.onRedo = onRedo;
    this.onOpenSettings = onOpenSettings;
    this.onPrint = onPrint;
    this.onTitleChange = onTitleChange;
    this.currentMode = 'editor';

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <header class="app-header">
        <div class="header-left">
          <div class="brand-badge">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#2563EB"/>
              <rect x="5" y="6" width="22" height="20" rx="3" fill="#FFFFFF"/>
              <rect x="8" y="10" width="7" height="9" rx="2" fill="#3B82F6"/>
              <rect x="17" y="10" width="7" height="2" rx="1" fill="#1E293B"/>
              <rect x="17" y="14" width="7" height="2" rx="1" fill="#64748B"/>
              <rect x="17" y="17" width="5" height="2" rx="1" fill="#94A3B8"/>
              <rect x="8" y="21" width="16" height="2" rx="1" fill="#CBD5E1"/>
            </svg>
            <span>Badge Studio</span>
          </div>

          <div class="status-indicator" id="save-status">
            <span class="status-dot"></span>
            <span class="status-text">Сохранено</span>
          </div>
        </div>

        <div class="header-center">
          <div class="mode-switcher">
            <button class="mode-tab active" data-mode="editor" title="Редактирование отдельного бейджика">
              <i data-lucide="file-text"></i> Редактор бейджика
            </button>
            <button class="mode-tab" data-mode="a4" title="Раскладка на листе A4">
              <i data-lucide="grid-3x3"></i> Лист A4
            </button>
            <button class="mode-tab" data-mode="print" title="Предварительный просмотр перед печатью">
              <i data-lucide="eye"></i> Предпросмотр
            </button>
          </div>
        </div>

        <div class="header-right">
          <button class="btn-icon" id="btn-undo" title="Отменить (Ctrl+Z)" disabled>
            <i data-lucide="undo-2"></i>
          </button>
          <button class="btn-icon" id="btn-redo" title="Повторить (Ctrl+Shift+Z)" disabled>
            <i data-lucide="redo-2"></i>
          </button>
          <button class="btn-secondary" id="btn-new-badge" title="Создать новый бейджик">
            <i data-lucide="plus"></i> Новый бейджик
          </button>
          <button class="btn-icon" id="btn-settings" title="Настройки приложения">
            <i data-lucide="settings"></i>
          </button>
          <button class="btn-primary" id="btn-print" title="Подготовить к печати">
            <i data-lucide="printer"></i> Печать
          </button>
        </div>
      </header>
    `;
  }

  bindEvents() {
    // Mode tabs
    const tabs = this.container.querySelectorAll('.mode-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        this.currentMode = mode;
        this.onModeChange(mode);
      });
    });

    this.container.querySelector('#btn-undo').addEventListener('click', () => this.onUndo());
    this.container.querySelector('#btn-redo').addEventListener('click', () => this.onRedo());
    this.container.querySelector('#btn-new-badge').addEventListener('click', () => this.onNewBadge());
    this.container.querySelector('#btn-settings').addEventListener('click', () => this.onOpenSettings());
    this.container.querySelector('#btn-print').addEventListener('click', () => this.onPrint());
  }

  setMode(mode) {
    this.currentMode = mode;
    const tabs = this.container.querySelectorAll('.mode-tab');
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
  }

  updateHistoryStatus({ canUndo, canRedo }) {
    const btnUndo = this.container.querySelector('#btn-undo');
    const btnRedo = this.container.querySelector('#btn-redo');
    if (btnUndo) btnUndo.disabled = !canUndo;
    if (btnRedo) btnRedo.disabled = !canRedo;
  }

  updateSaveStatus(status, text) {
    const indicator = this.container.querySelector('#save-status');
    if (!indicator) return;

    const dot = indicator.querySelector('.status-dot');
    const label = indicator.querySelector('.status-text');

    dot.className = 'status-dot';
    if (status === 'saving') {
      dot.classList.add('saving');
    } else if (status === 'error') {
      dot.classList.add('error');
    }

    label.textContent = text;
  }
}
