// Minimalist Master Header with Direct 1-Click Print & Template Switcher

export class Header {
  constructor({
    container,
    onTemplateChange,
    onPrintFront,
    onPrintBack,
    onPrintBoth,
    onUndo,
    onRedo,
    onOpenSettings,
  }) {
    this.container = container;
    this.onTemplateChange = onTemplateChange || (() => {});
    this.onPrintFront = onPrintFront || (() => {});
    this.onPrintBack = onPrintBack || (() => {});
    this.onPrintBoth = onPrintBoth || (() => {});
    this.onUndo = onUndo || (() => {});
    this.onRedo = onRedo || (() => {});
    this.onOpenSettings = onOpenSettings || (() => {});

    this.currentTemplate = 'temurmalik';
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <header class="app-header" style="height: 52px; background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; user-select: none; z-index: 50; flex-shrink: 0;">
        
        <!-- Brand & Template Picker -->
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="brand-badge" style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 15px; color: var(--text-primary); letter-spacing: -0.02em;">
            <svg viewBox="0 0 32 32" fill="none" style="width: 24px; height: 24px;">
              <rect width="32" height="32" rx="7" fill="#0284C7"/>
              <rect x="5" y="6" width="22" height="20" rx="3" fill="#FFFFFF"/>
              <rect x="8" y="10" width="7" height="9" rx="2" fill="#0284C7"/>
              <rect x="17" y="10" width="7" height="2" rx="1" fill="#1E293B"/>
              <rect x="17" y="14" width="7" height="2" rx="1" fill="#64748B"/>
              <rect x="17" y="17" width="5" height="2" rx="1" fill="#94A3B8"/>
              <rect x="8" y="21" width="16" height="2" rx="1" fill="#CBD5E1"/>
            </svg>
            <span>Badge Studio</span>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Шаблон:</span>
            <select id="header-template-select" style="padding: 4px 8px; font-size: 11.5px; font-weight: 600; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-primary);">
              <option value="temurmalik" ${this.currentTemplate === 'temurmalik' ? 'selected' : ''}>К. тиббии Темурмалик (Кангурт)</option>
              <option value="danghara" ${this.currentTemplate === 'danghara' ? 'selected' : ''}>К. тиббии Данғара</option>
            </select>
          </div>

          <div class="status-indicator" id="save-status" style="margin-left: 4px;">
            <span class="status-dot"></span>
            <span class="status-text">Сохранено</span>
          </div>
        </div>

        <!-- Right Side: Undo/Redo & Direct 1-Click Print Actions -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn-icon" id="btn-undo" title="Отменить (Ctrl+Z)" disabled style="width: 30px; height: 30px;">
            <i data-lucide="undo-2" style="width: 14px; height: 14px;"></i>
          </button>
          <button class="btn-icon" id="btn-redo" title="Повторить (Ctrl+Y)" disabled style="width: 30px; height: 30px;">
            <i data-lucide="redo-2" style="width: 14px; height: 14px;"></i>
          </button>

          <div style="width: 1px; height: 20px; background-color: var(--border-subtle); margin: 0 4px;"></div>

          <!-- Direct Print Buttons -->
          <button class="btn-secondary" id="btn-print-front" title="Чоп кардани рӯйи аввал (Печать листа 1)" style="font-size: 11.5px; padding: 6px 12px; font-weight: 600; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            <i data-lucide="printer" style="width: 13px; height: 13px;"></i> Чоп: Рӯйи аввал (Лицевая)
          </button>

          <button class="btn-secondary" id="btn-print-back" title="Чоп кардани рӯйи ақиб бо ҳамҷоякунӣ (Печать листа 2)" style="font-size: 11.5px; padding: 6px 12px; font-weight: 600; border-color: rgba(52, 211, 153, 0.4); color: #34d399;">
            <i data-lucide="printer" style="width: 13px; height: 13px;"></i> Чоп: Рӯйи ақиб (Обратная)
          </button>

          <button class="btn-primary" id="btn-print-both" title="Чоп кардани ҳар ду рӯй (Двусторонняя печать)" style="font-size: 11.5px; padding: 6px 12px; font-weight: 700;">
            <i data-lucide="printer" style="width: 13px; height: 13px;"></i> Ҳарду рӯй (2 листа)
          </button>

          <button class="btn-icon" id="btn-settings" title="Танзимот ва нусхабардорӣ (Настройки)" style="width: 32px; height: 32px; margin-left: 4px;">
            <i data-lucide="settings" style="width: 15px; height: 15px;"></i>
          </button>
        </div>
      </header>
    `;
  }

  bindEvents() {
    this.container.querySelector('#header-template-select')?.addEventListener('change', (e) => {
      this.currentTemplate = e.target.value;
      this.onTemplateChange(this.currentTemplate);
    });

    this.container.querySelector('#btn-undo')?.addEventListener('click', () => this.onUndo());
    this.container.querySelector('#btn-redo')?.addEventListener('click', () => this.onRedo());

    this.container.querySelector('#btn-print-front')?.addEventListener('click', () => this.onPrintFront());
    this.container.querySelector('#btn-print-back')?.addEventListener('click', () => this.onPrintBack());
    this.container.querySelector('#btn-print-both')?.addEventListener('click', () => this.onPrintBoth());

    this.container.querySelector('#btn-settings')?.addEventListener('click', () => this.onOpenSettings());
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
