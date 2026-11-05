import { RecoveryManager } from '../../storage/recovery.js';

export class SettingsModal {
  constructor({ container, onSaveSettings, onExportBackup, onImportBackup, onResetProject }) {
    this.container = container;
    this.onSaveSettings = onSaveSettings;
    this.onExportBackup = onExportBackup || (() => {});
    this.onImportBackup = onImportBackup || (() => {});
    this.onResetProject = onResetProject || (() => {});

    this.isOpen = false;
    this.settings = {
      animationEnabled: true,
      autoSaveDelay: 600,
    };
    this.storageInfo = { usageMb: 0, quotaMb: 0 };

    this.render();
    this.bindEvents();
  }

  async refreshStorageInfo() {
    this.storageInfo = await RecoveryManager.getStorageQuota();
    const quotaEl = this.container.querySelector('#storage-quota-text');
    if (quotaEl) {
      quotaEl.textContent = `${this.storageInfo.usageMb} МБ из ${Math.round(this.storageInfo.quotaMb / 1024 * 10) / 10} ГБ`;
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="settings-overlay">
        <div class="modal-dialog" style="width: 520px;">
          <div class="modal-header">
            <span class="modal-title" style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="settings"></i> Настройки приложения
            </span>
            <button class="btn-icon" id="btn-close-settings">
              <i data-lucide="x"></i>
            </button>
          </div>

          <div class="modal-body">
            <!-- 3D Animation -->
            <div class="property-row">
              <div style="display: flex; flex-direction: column;">
                <span class="property-label" style="font-weight: 500; color: var(--text-primary);">3D-анимация переворота</span>
                <span style="font-size: 11px; color: var(--text-muted);">Плавный 3D-переворот карточек (CSS 3D Transform)</span>
              </div>
              <input type="checkbox" id="setting-animation" ${this.settings.animationEnabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;" />
            </div>

            <!-- Units -->
            <div class="property-row">
              <div style="display: flex; flex-direction: column;">
                <span class="property-label" style="font-weight: 500; color: var(--text-primary);">Единицы измерения</span>
                <span style="font-size: 11px; color: var(--text-muted);">Миллиметры (мм) для точного соответствия печати</span>
              </div>
              <span style="font-size: 12px; font-weight: 600; color: var(--accent-primary);">мм (A4)</span>
            </div>

            <!-- Storage & Backup Section -->
            <div class="panel-section" style="padding: 12px 0 0 0; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
              <span class="section-title">Резервная копия и хранилище</span>
              
              <div class="property-row">
                <span class="property-label">Хранилище IndexedDB:</span>
                <span id="storage-quota-text" style="font-size: 11px; font-weight: 600; color: var(--text-primary);">0 МБ</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 4px;">
                <button class="btn-secondary" id="btn-export-backup" style="font-size: 11px; padding: 7px;">
                  <i data-lucide="upload"></i> Экспорт проекта (.json)
                </button>
                <button class="btn-secondary" id="btn-import-backup-trigger" style="font-size: 11px; padding: 7px;">
                  <i data-lucide="upload" style="transform: rotate(180deg);"></i> Импорт из файла
                </button>
              </div>
              <input type="file" id="import-backup-file-input" accept=".json,application/json" style="display: none;" />
            </div>

            <!-- Offline storage info note -->
            <div style="padding: 12px; background-color: var(--bg-surface); border-radius: var(--radius-md); font-size: 11px; line-height: 1.5; color: var(--text-secondary);">
              <strong>Оффлайн-режим:</strong> Все фотографии и карточки студентов хранятся исключительно локально в браузере. Вы можете в любой момент сохранить резервную копию проекта в файл на диск.
            </div>

            <!-- Reset Project -->
            <div style="display: flex; justify-content: flex-start;">
              <button class="btn-secondary" id="btn-reset-demo" style="color: var(--danger); font-size: 11px;">
                <i data-lucide="trash-2"></i> Сбросить проект к демо-шаблону
              </button>
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
    const exportBtn = this.container.querySelector('#btn-export-backup');
    const importTrigger = this.container.querySelector('#btn-import-backup-trigger');
    const fileInput = this.container.querySelector('#import-backup-file-input');
    const resetBtn = this.container.querySelector('#btn-reset-demo');

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

    exportBtn?.addEventListener('click', () => {
      this.onExportBackup();
    });

    importTrigger?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const importedData = await RecoveryManager.importProject(file);
          this.onImportBackup(importedData);
          fileInput.value = '';
          close();
        } catch (err) {
          alert('Ошибка импорта проекта: ' + err.message);
        }
      }
    });

    resetBtn?.addEventListener('click', () => {
      if (confirm('Внимание! Все текущие несохраненные карточки будут заменены стандартным шаблоном. Продолжить?')) {
        this.onResetProject();
        close();
      }
    });
  }

  async open() {
    this.isOpen = true;
    const overlay = this.container.querySelector('#settings-overlay');
    overlay.classList.add('open');
    await this.refreshStorageInfo();
    if (window.initIcons) {
      window.initIcons(overlay);
    }
  }
}
