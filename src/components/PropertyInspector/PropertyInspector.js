import { BADGE_STANDARDS, canvasPxToMm, mmToCanvasPx } from '../../editor/constants.js';

export class PropertyInspector {
  constructor({ container, onAddElement, onUpdateElement, onDeleteElement, onReorderElement, onUpdateBadgeSettings }) {
    this.container = container;
    this.onAddElement = onAddElement;
    this.onUpdateElement = onUpdateElement;
    this.onDeleteElement = onDeleteElement;
    this.onReorderElement = onReorderElement;
    this.onUpdateBadgeSettings = onUpdateBadgeSettings;

    this.activeObject = null;
    this.activeSide = 'front';
    this.badgeSettings = {
      standard: '90x55',
      widthMm: 90,
      heightMm: 55,
      frontBg: '#FFFFFF',
      backBg: '#F8FAFC',
    };

    this.render();
  }

  setSelectedObject(obj, side) {
    this.activeObject = obj;
    if (side) this.activeSide = side;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <aside class="app-properties-panel">
        <!-- Quick Add Elements Section -->
        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">Добавить элемент</span>
          </div>
          <div class="add-elements-bar">
            <button class="element-add-btn" id="btn-add-text" title="Добавить текстовый блок">
              <i data-lucide="type"></i> Текст
            </button>
            <button class="element-add-btn" id="btn-add-photo" title="Добавить фото/рамку">
              <i data-lucide="image"></i> Фото
            </button>
            <button class="element-add-btn" id="btn-add-rect" title="Добавить прямоугольник">
              <i data-lucide="square"></i> Прямоуг.
            </button>
            <button class="element-add-btn" id="btn-add-circle" title="Добавить круг">
              <i data-lucide="circle"></i> Круг
            </button>
          </div>
        </div>

        ${this.activeObject ? this.renderObjectInspector() : this.renderBadgeInspector()}
      </aside>
    `;

    this.bindEvents();
    if (window.initIcons) {
      window.initIcons(this.container);
    }
  }

  renderObjectInspector() {
    const obj = this.activeObject;
    const isText = obj.type === 'text' || obj.type === 'i-text';
    const isRect = obj.type === 'rect';
    const isCircle = obj.type === 'circle';

    const leftMm = canvasPxToMm(obj.left);
    const topMm = canvasPxToMm(obj.top);
    const widthMm = canvasPxToMm(obj.width * (obj.scaleX || 1));
    const heightMm = canvasPxToMm(obj.height * (obj.scaleY || 1));
    const angle = Math.round(obj.angle || 0);
    const opacity = Math.round((obj.opacity !== undefined ? obj.opacity : 1) * 100);

    return `
      <!-- Object Identification & Position -->
      <div class="panel-section">
        <div class="section-header">
          <span class="section-title">${obj.name || obj.type}</span>
          <button class="btn-icon delete-btn" id="btn-delete-obj" title="Удалить элемент">
            <i data-lucide="trash-2"></i>
          </button>
        </div>

        <div class="property-row">
          <span class="property-label">Позиция X / Y (мм)</span>
          <div class="property-input-group">
            <input type="number" id="prop-left" class="property-input-number" value="${leftMm}" step="0.5" />
            <input type="number" id="prop-top" class="property-input-number" value="${topMm}" step="0.5" />
          </div>
        </div>

        <div class="property-row">
          <span class="property-label">Размер W / H (мм)</span>
          <div class="property-input-group">
            <input type="number" id="prop-width" class="property-input-number" value="${widthMm}" step="0.5" />
            <input type="number" id="prop-height" class="property-input-number" value="${heightMm}" step="0.5" />
          </div>
        </div>

        <div class="property-row">
          <span class="property-label">Поворот (°)</span>
          <input type="number" id="prop-angle" class="property-input-number" value="${angle}" min="0" max="360" />
        </div>

        <div class="property-row">
          <span class="property-label">Прозрачность (%)</span>
          <input type="number" id="prop-opacity" class="property-input-number" value="${opacity}" min="0" max="100" />
        </div>
      </div>

      <!-- Text Specific Properties -->
      ${
        isText
          ? `
        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">Параметры текста</span>
          </div>

          <div class="property-row">
            <span class="property-label">Шрифт</span>
            <select id="prop-font-family" style="width: 140px;">
              <option value="Inter" ${obj.fontFamily === 'Inter' ? 'selected' : ''}>Inter</option>
              <option value="Arial" ${obj.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
              <option value="Times New Roman" ${obj.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
              <option value="JetBrains Mono" ${obj.fontFamily === 'JetBrains Mono' ? 'selected' : ''}>JetBrains Mono</option>
            </select>
          </div>

          <div class="property-row">
            <span class="property-label">Размер шрифта</span>
            <input type="number" id="prop-font-size" class="property-input-number" value="${Math.round(obj.fontSize)}" min="6" max="120" />
          </div>

          <div class="property-row">
            <span class="property-label">Цвет текста</span>
            <div class="color-picker-wrapper">
              <input type="color" id="prop-text-color" class="color-input-bubble" value="${obj.fill || '#000000'}" />
              <span style="font-size: 11px; font-family: monospace;">${obj.fill || '#000000'}</span>
            </div>
          </div>

          <div class="property-row">
            <span class="property-label">Начертание</span>
            <div style="display: flex; gap: 4px;">
              <button class="btn-icon ${obj.fontWeight === 'bold' ? 'active' : ''}" id="btn-toggle-bold" title="Жирный">
                <i data-lucide="bold"></i>
              </button>
              <button class="btn-icon ${obj.fontStyle === 'italic' ? 'active' : ''}" id="btn-toggle-italic" title="Курсив">
                <i data-lucide="italic"></i>
              </button>
            </div>
          </div>

          <div class="property-row">
            <span class="property-label">Выравнивание</span>
            <div style="display: flex; gap: 4px;">
              <button class="btn-icon ${obj.textAlign === 'left' ? 'active' : ''}" id="btn-align-left" title="По левому краю">
                <i data-lucide="align-left"></i>
              </button>
              <button class="btn-icon ${obj.textAlign === 'center' ? 'active' : ''}" id="btn-align-center" title="По центру">
                <i data-lucide="align-center"></i>
              </button>
              <button class="btn-icon ${obj.textAlign === 'right' ? 'active' : ''}" id="btn-align-right" title="По правому краю">
                <i data-lucide="align-right"></i>
              </button>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- Shape Specific Properties -->
      ${
        !isText
          ? `
        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">Цвета и обводка</span>
          </div>

          <div class="property-row">
            <span class="property-label">Цвет заливки</span>
            <div class="color-picker-wrapper">
              <input type="color" id="prop-fill-color" class="color-input-bubble" value="${obj.fill || '#FFFFFF'}" />
              <span style="font-size: 11px; font-family: monospace;">${obj.fill || '#FFFFFF'}</span>
            </div>
          </div>

          <div class="property-row">
            <span class="property-label">Цвет обводки</span>
            <div class="color-picker-wrapper">
              <input type="color" id="prop-stroke-color" class="color-input-bubble" value="${obj.stroke || '#CBD5E1'}" />
              <span style="font-size: 11px; font-family: monospace;">${obj.stroke || 'нет'}</span>
            </div>
          </div>

          <div class="property-row">
            <span class="property-label">Толщина линии</span>
            <input type="number" id="prop-stroke-width" class="property-input-number" value="${obj.strokeWidth || 0}" min="0" max="20" />
          </div>

          ${
            isRect
              ? `
            <div class="property-row">
              <span class="property-label">Скругление углов</span>
              <input type="number" id="prop-corner-radius" class="property-input-number" value="${obj.rx || 0}" min="0" max="50" />
            </div>
          `
              : ''
          }
        </div>
      `
          : ''
      }

      <!-- Layer Ordering -->
      <div class="panel-section">
        <div class="section-header">
          <span class="section-title">Слои</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary" id="btn-bring-front" style="flex: 1; font-size: 11px;">
            <i data-lucide="layers"></i> Вперед
          </button>
          <button class="btn-secondary" id="btn-send-back" style="flex: 1; font-size: 11px;">
            <i data-lucide="layers"></i> Назад
          </button>
        </div>
      </div>
    `;
  }

  renderBadgeInspector() {
    return `
      <!-- Global Badge Settings -->
      <div class="panel-section">
        <div class="section-header">
          <span class="section-title">Параметры бейджика</span>
        </div>

        <div class="property-row">
          <span class="property-label">Стандарт размера</span>
          <select id="prop-badge-standard" style="width: 150px;">
            <option value="90x55" ${this.badgeSettings.standard === '90x55' ? 'selected' : ''}>90 × 55 мм</option>
            <option value="85x55" ${this.badgeSettings.standard === '85x55' ? 'selected' : ''}>85 × 55 мм (ID-1)</option>
            <option value="custom" ${this.badgeSettings.standard === 'custom' ? 'selected' : ''}>Пользовательский</option>
          </select>
        </div>

        <div class="property-row">
          <span class="property-label">Ширина (мм)</span>
          <input type="number" id="prop-badge-width" class="property-input-number" value="${this.badgeSettings.widthMm}" ${this.badgeSettings.standard !== 'custom' ? 'disabled' : ''} />
        </div>

        <div class="property-row">
          <span class="property-label">Высота (мм)</span>
          <input type="number" id="prop-badge-height" class="property-input-number" value="${this.badgeSettings.heightMm}" ${this.badgeSettings.standard !== 'custom' ? 'disabled' : ''} />
        </div>

        <div class="property-row">
          <span class="property-label">Фон текущей стороны</span>
          <div class="color-picker-wrapper">
            <input type="color" id="prop-bg-color" class="color-input-bubble" value="${this.activeSide === 'front' ? this.badgeSettings.frontBg : this.badgeSettings.backBg}" />
            <span style="font-size: 11px; font-family: monospace;">${this.activeSide === 'front' ? this.badgeSettings.frontBg : this.badgeSettings.backBg}</span>
          </div>
        </div>
      </div>

      <div class="panel-section" style="color: var(--text-muted); font-size: 11px; line-height: 1.6;">
        <i data-lucide="move" style="vertical-align: middle; margin-right: 4px;"></i>
        Кликните по любому элементу на карточке для редактирования его параметров, изменения текста или положения.
      </div>
    `;
  }

  bindEvents() {
    // Add Element Buttons
    this.container.querySelector('#btn-add-text')?.addEventListener('click', () => {
      this.onAddElement({ type: 'text', text: 'Новый текст' });
    });

    this.container.querySelector('#btn-add-rect')?.addEventListener('click', () => {
      this.onAddElement({ type: 'rect', width: 150, height: 80, fill: '#3B82F6' });
    });

    this.container.querySelector('#btn-add-circle')?.addEventListener('click', () => {
      this.onAddElement({ type: 'circle', radius: 40, fill: '#3B82F6' });
    });

    this.container.querySelector('#btn-add-photo')?.addEventListener('click', () => {
      this.onAddElement({ type: 'photo-placeholder' });
    });

    // Object events
    if (this.activeObject) {
      const obj = this.activeObject;

      this.container.querySelector('#btn-delete-obj')?.addEventListener('click', () => {
        this.onDeleteElement(obj);
      });

      this.container.querySelector('#prop-left')?.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value) || 0;
        this.onUpdateElement(obj, { left: mmToCanvasPx(val) });
      });

      this.container.querySelector('#prop-top')?.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value) || 0;
        this.onUpdateElement(obj, { top: mmToCanvasPx(val) });
      });

      this.container.querySelector('#prop-width')?.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value) || 10;
        const targetPx = mmToCanvasPx(val);
        this.onUpdateElement(obj, { scaleX: targetPx / obj.width });
      });

      this.container.querySelector('#prop-height')?.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value) || 10;
        const targetPx = mmToCanvasPx(val);
        this.onUpdateElement(obj, { scaleY: targetPx / obj.height });
      });

      this.container.querySelector('#prop-angle')?.addEventListener('change', (e) => {
        this.onUpdateElement(obj, { angle: parseFloat(e.target.value) || 0 });
      });

      this.container.querySelector('#prop-opacity')?.addEventListener('change', (e) => {
        this.onUpdateElement(obj, { opacity: (parseFloat(e.target.value) || 100) / 100 });
      });

      // Text events
      this.container.querySelector('#prop-font-family')?.addEventListener('change', (e) => {
        this.onUpdateElement(obj, { fontFamily: e.target.value });
      });

      this.container.querySelector('#prop-font-size')?.addEventListener('change', (e) => {
        this.onUpdateElement(obj, { fontSize: parseFloat(e.target.value) || 14 });
      });

      this.container.querySelector('#prop-text-color')?.addEventListener('input', (e) => {
        this.onUpdateElement(obj, { fill: e.target.value });
      });

      this.container.querySelector('#btn-toggle-bold')?.addEventListener('click', () => {
        const isBold = obj.fontWeight === 'bold';
        this.onUpdateElement(obj, { fontWeight: isBold ? 'normal' : 'bold' });
      });

      this.container.querySelector('#btn-toggle-italic')?.addEventListener('click', () => {
        const isItalic = obj.fontStyle === 'italic';
        this.onUpdateElement(obj, { fontStyle: isItalic ? 'normal' : 'italic' });
      });

      this.container.querySelector('#btn-align-left')?.addEventListener('click', () => {
        this.onUpdateElement(obj, { textAlign: 'left' });
      });

      this.container.querySelector('#btn-align-center')?.addEventListener('click', () => {
        this.onUpdateElement(obj, { textAlign: 'center' });
      });

      this.container.querySelector('#btn-align-right')?.addEventListener('click', () => {
        this.onUpdateElement(obj, { textAlign: 'right' });
      });

      // Shape events
      this.container.querySelector('#prop-fill-color')?.addEventListener('input', (e) => {
        this.onUpdateElement(obj, { fill: e.target.value });
      });

      this.container.querySelector('#prop-stroke-color')?.addEventListener('input', (e) => {
        this.onUpdateElement(obj, { stroke: e.target.value });
      });

      this.container.querySelector('#prop-stroke-width')?.addEventListener('change', (e) => {
        this.onUpdateElement(obj, { strokeWidth: parseFloat(e.target.value) || 0 });
      });

      this.container.querySelector('#prop-corner-radius')?.addEventListener('change', (e) => {
        const r = parseFloat(e.target.value) || 0;
        this.onUpdateElement(obj, { rx: r, ry: r });
      });

      // Layers
      this.container.querySelector('#btn-bring-front')?.addEventListener('click', () => {
        this.onReorderElement(obj, 'front');
      });

      this.container.querySelector('#btn-send-back')?.addEventListener('click', () => {
        this.onReorderElement(obj, 'back');
      });
    } else {
      // Badge standard changes
      this.container.querySelector('#prop-badge-standard')?.addEventListener('change', (e) => {
        const std = e.target.value;
        const config = BADGE_STANDARDS[std];
        if (config) {
          this.badgeSettings.standard = std;
          this.badgeSettings.widthMm = config.widthMm;
          this.badgeSettings.heightMm = config.heightMm;
          this.onUpdateBadgeSettings(this.badgeSettings);
          this.render();
        }
      });

      this.container.querySelector('#prop-bg-color')?.addEventListener('input', (e) => {
        if (this.activeSide === 'front') {
          this.badgeSettings.frontBg = e.target.value;
        } else {
          this.badgeSettings.backBg = e.target.value;
        }
        this.onUpdateBadgeSettings(this.badgeSettings);
      });
    }
  }
}
