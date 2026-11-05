export class SettingsModal {
  constructor({ container, onSaveSettings }) {
    this.container = container;
    this.onSaveSettings = onSaveSettings;
    this.isOpen = false;
    this.settings = {
      animationEnabled: true,
      autoSaveDelay: 600,
    };

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="settings-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <span class="modal-title">Настройки приложения</span>
            <button class="btn-icon" id="btn-close-settings">
              <i data-lucide="x"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="property-row">
              <div style="display: flex; flex-direction: column;">
                <span class="property-label" style="font-weight: 500; color: var(--text-primary);">3D-анимация переворота</span>
                <span style="font-size: 11px; color: var(--text-muted);">Плавный 3D-переворот карточки при переключении сторон</span>
              </div>
              <input type="checkbox" id="setting-animation" ${this.settings.animationEnabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;" />
            </div>

            <div class="property-row">
              <div style="display: flex; flex-direction: column;">
                <span class="property-label" style="font-weight: 500; color: var(--text-primary);">Единицы измерения</span>
                <span style="font-size: 11px; color: var(--text-muted);">Используются миллиметры (мм) для точного соответствия печати</span>
              </div>
              <span style="font-size: 12px; font-weight: 600; color: var(--accent-primary);">мм (A4)</span>
            </div>

            <div style="padding: 12px; background-color: var(--bg-surface); border-radius: var(--radius-md); font-size: 11px; line-height: 1.5; color: var(--text-secondary);">
              <strong>Оффлайн-режим:</strong> Все персональные данные студентов и изображения хранятся исключительно в IndexedDB вашего браузера. Никакие данные не передаются на внешние серверы.
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" id="btn-cancel-settings">Отмена</button>
            <button class="btn-primary" id="btn-save-settings">Сохранить</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const overlay = this.container.querySelector('#settings-overlay');
    const closeBtn = this.container.querySelector('#btn-close-settings');
    const cancelBtn = this.container.querySelector('#btn-cancel-settings');
    const saveBtn = this.container.querySelector('#btn-save-settings');

    const close = () => {
      this.isOpen = false;
      overlay.classList.remove('open');
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    saveBtn.addEventListener('click', () => {
      const animChecked = this.container.querySelector('#setting-animation').checked;
      this.settings.animationEnabled = animChecked;
      this.onSaveSettings(this.settings);
      close();
    });
  }

  open() {
    this.isOpen = true;
    const overlay = this.container.querySelector('#settings-overlay');
    overlay.classList.add('open');
    if (window.initIcons) {
      window.initIcons(overlay);
    }
  }
}
