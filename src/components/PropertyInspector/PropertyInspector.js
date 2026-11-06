import { BADGE_STANDARDS } from '../../editor/constants.js';

export class PropertyInspector {
  constructor({
    container,
    onUploadImage,
    onEditPhoto,
    onUpdateField,
    onUpdateBadgeSettings,
  }) {
    this.container = container;
    this.onUploadImage = onUploadImage || (() => {});
    this.onEditPhoto = onEditPhoto || (() => {});
    this.onUpdateField = onUpdateField || (() => {});
    this.onUpdateBadgeSettings = onUpdateBadgeSettings || (() => {});

    this.activeSide = 'front';
    this.badgeSettings = {
      standard: 'cr80',
      widthMm: 85.6,
      heightMm: 54,
    };
    this.cardData = {};

    this.render();
  }

  setCardData(data, side) {
    this.cardData = data || {};
    if (side) this.activeSide = side;
    this.render();
  }

  setSelectedObject(obj, side) {
    if (side) this.activeSide = side;
  }

  updateLiveValues() {}

  render() {
    const isFront = this.activeSide === 'front';

    this.container.innerHTML = `
      <aside class="app-properties-panel">
        <!-- Photo Management Header -->
        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">Фотография студента</span>
          </div>
          <button class="btn-primary" id="btn-edit-student-photo" style="width: 100%; padding: 8px;">
            <i data-lucide="sliders"></i> Кадрировать / Заменить фото
          </button>
          <input type="file" id="inspector-file-input" accept="image/jpeg,image/png,image/webp" style="display: none;" />
        </div>

        <!-- Card Data Form Fields -->
        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">${isFront ? 'Лицевая сторона' : 'Обратная сторона'}</span>
          </div>

          ${
            isFront
              ? `
            <div class="property-row">
              <span class="property-label">ID студента</span>
              <input type="text" id="field-id-input" value="${this.cardData.idNumber || '2-790106'}" style="width: 160px; font-family: monospace; font-weight: bold;" />
            </div>

            <div class="property-row">
              <span class="property-label">Фамилия</span>
              <input type="text" id="field-name1-input" value="${this.cardData.nameLine1 || 'РАҲИМОВА'}" style="width: 160px; font-weight: bold;" />
            </div>

            <div class="property-row">
              <span class="property-label">Имя и отчество</span>
              <input type="text" id="field-name2-input" value="${this.cardData.nameLine2 || 'НИГИНА РУСТАМОВНА'}" style="width: 160px; font-weight: bold;" />
            </div>

            <div class="property-row">
              <span class="property-label">Ихтисос</span>
              <input type="text" id="field-specialty-input" value="${this.cardData.specialty || 'кори ҳамширагӣ'}" style="width: 160px;" />
            </div>

            <div class="property-row">
              <span class="property-label">Соли таҳсил</span>
              <input type="text" id="field-cohort-input" value="${this.cardData.cohort || '2024–2028'}" style="width: 160px;" />
            </div>

            <div class="property-row">
              <span class="property-label">Директор</span>
              <input type="text" id="field-director-input" value="${this.cardData.directorName || 'Сафарзода З.И.'}" style="width: 160px;" />
            </div>
          `
              : `
            <div class="property-row">
              <span class="property-label">Срок действия</span>
              <input type="text" id="field-validity-input" value="${this.cardData.validity || 'EXP: 01/07/2028'}" style="width: 160px; font-family: monospace;" />
            </div>

            <div class="property-row">
              <span class="property-label">Moodle Логин</span>
              <input type="text" id="field-login-input" value="${this.cardData.moodleLogin || 'gr26111'}" style="width: 160px; font-family: monospace;" />
            </div>

            <div class="property-row">
              <span class="property-label">Moodle Пароль</span>
              <input type="text" id="field-pass-input" value="${this.cardData.moodlePass || 'Student1#'}" style="width: 160px; font-family: monospace;" />
            </div>

            <div class="property-row">
              <span class="property-label">Штрих-код</span>
              <input type="text" id="field-barcode-input" value="${this.cardData.barcodeNumber || '2-790106'}" style="width: 160px; font-family: monospace;" />
            </div>

            <div class="property-row">
              <span class="property-label">Суроға</span>
              <input type="text" id="field-addr-input" value="${this.cardData.addressLine3 || 'ҷ.д Кангурт'}" style="width: 160px;" />
            </div>
          `
          }
        </div>

        <!-- Badge Standard Info -->
        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">Стандарт печати</span>
          </div>

          <div class="property-row">
            <span class="property-label">Формат</span>
            <span style="font-weight: 700; color: #0284C7; font-size: 11px;">CR-80 (85.60 × 53.98 мм)</span>
          </div>

          <div class="property-row">
            <span class="property-label">Разрешение</span>
            <span style="font-size: 11px; color: var(--text-secondary);">300 DPI (High-Res)</span>
          </div>
        </div>

        <div class="panel-section" style="color: var(--text-muted); font-size: 11px; line-height: 1.6;">
          <i data-lucide="edit-3" style="vertical-align: middle; margin-right: 4px;"></i>
          Вы также можете редактировать любые надписи прямо на самом бейджике простым кликом мыши!
        </div>
      </aside>
    `;

    this.bindEvents();
    if (window.initIcons) {
      window.initIcons(this.container);
    }
  }

  bindEvents() {
    const fileInput = this.container.querySelector('#inspector-file-input');
    const photoBtn = this.container.querySelector('#btn-edit-student-photo');

    photoBtn?.addEventListener('click', () => {
      this.onEditPhoto(this.cardData.photoSrc || '/assets/student-nigina.jpg');
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.onUploadImage(event.target.result);
          fileInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });

    // Form inputs sync
    const bindSync = (selector, field) => {
      const el = this.container.querySelector(selector);
      el?.addEventListener('input', (e) => {
        this.onUpdateField(field, e.target.value.trim());
      });
    };

    bindSync('#field-id-input', 'idNumber');
    bindSync('#field-name1-input', 'nameLine1');
    bindSync('#field-name2-input', 'nameLine2');
    bindSync('#field-specialty-input', 'specialty');
    bindSync('#field-cohort-input', 'cohort');
    bindSync('#field-director-input', 'directorName');

    bindSync('#field-validity-input', 'validity');
    bindSync('#field-login-input', 'moodleLogin');
    bindSync('#field-pass-input', 'moodlePass');
    bindSync('#field-barcode-input', 'barcodeNumber');
    bindSync('#field-addr-input', 'addressLine3');
  }
}
