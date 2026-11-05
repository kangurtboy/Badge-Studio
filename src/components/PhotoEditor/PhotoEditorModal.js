import { renderCroppedPhoto } from '../../photo/crop.js';

export class PhotoEditorModal {
  constructor({ container, onApplyPhoto }) {
    this.container = container;
    this.onApplyPhoto = onApplyPhoto;
    this.isOpen = false;

    this.currentImage = null;
    this.targetObject = null;

    // Transform and adjustment parameters
    this.state = {
      panX: 0,
      panY: 0,
      zoom: 1,
      rotation: 0,
      frameShape: 'rounded', // 'rect' | 'square' | 'rounded' | 'circle'
      brightness: 0,
      contrast: 0,
      saturation: 0,
      grayscale: false,
    };

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="photo-editor-overlay">
        <div class="modal-dialog" style="width: 760px; max-width: 95vw;">
          <div class="modal-header">
            <span class="modal-title" style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="image"></i> Редактор фотографии студента
            </span>
            <button class="btn-icon" id="btn-close-photo-editor">
              <i data-lucide="x"></i>
            </button>
          </div>

          <div class="modal-body" style="display: flex; gap: 24px; padding: 20px;">
            <!-- Left Side: Interactive Preview Canvas -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; user-select: none;">
              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
                <i data-lucide="move" style="width: 12px; height: 12px;"></i> Перетаскивайте мышью для перемещения фото
              </div>

              <!-- Interactive Canvas -->
              <canvas id="photo-preview-canvas" width="280" height="350" style="cursor: grab; border: 2px dashed #3B82F6; border-radius: 8px; box-shadow: var(--shadow-md); background: #FFFFFF;"></canvas>

              <div style="display: flex; gap: 8px; margin-top: 14px;">
                <button class="btn-secondary" id="btn-rotate-photo-90" style="font-size: 11px;">
                  <i data-lucide="rotate-cw"></i> Повернуть 90°
                </button>
                <button class="btn-secondary" id="btn-reset-photo-state" style="font-size: 11px;">
                  <i data-lucide="rotate-cw"></i> Сбросить
                </button>
              </div>
            </div>

            <!-- Right Side: Controls and Adjustments -->
            <div style="width: 320px; display: flex; flex-direction: column; gap: 14px;">
              <!-- Frame Shape Selection -->
              <div class="panel-section" style="padding: 0 0 12px 0;">
                <span class="section-title" style="margin-bottom: 8px; display: block;">Форма рамки</span>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                  <button class="btn-secondary ${this.state.frameShape === 'rounded' ? 'active' : ''}" data-shape="rounded" style="font-size: 11px; padding: 6px;">
                    Скруглённая
                  </button>
                  <button class="btn-secondary ${this.state.frameShape === 'circle' ? 'active' : ''}" data-shape="circle" style="font-size: 11px; padding: 6px;">
                    Круглая
                  </button>
                  <button class="btn-secondary ${this.state.frameShape === 'rect' ? 'active' : ''}" data-shape="rect" style="font-size: 11px; padding: 6px;">
                    Прямоугольная (3:4)
                  </button>
                  <button class="btn-secondary ${this.state.frameShape === 'square' ? 'active' : ''}" data-shape="square" style="font-size: 11px; padding: 6px;">
                    Квадратная (1:1)
                  </button>
                </div>
              </div>

              <!-- Zoom Slider -->
              <div class="property-row">
                <span class="property-label">Масштаб</span>
                <div style="display: flex; align-items: center; gap: 8px; width: 170px;">
                  <input type="range" id="photo-zoom-slider" min="0.5" max="3" step="0.05" value="${this.state.zoom}" style="flex: 1;" />
                  <span id="photo-zoom-val" style="font-size: 11px; min-width: 38px; text-align: right;">${Math.round(this.state.zoom * 100)}%</span>
                </div>
              </div>

              <!-- Adjustments: Brightness, Contrast, Saturation -->
              <div class="panel-section" style="padding: 12px 0 0 0; border-top: 1px solid var(--border-subtle);">
                <span class="section-title" style="margin-bottom: 8px; display: block;">Цветокоррекция</span>

                <div class="property-row" style="margin-bottom: 8px;">
                  <span class="property-label">Яркость</span>
                  <div style="display: flex; align-items: center; gap: 8px; width: 170px;">
                    <input type="range" id="photo-bright-slider" min="-50" max="50" step="1" value="${this.state.brightness}" style="flex: 1;" />
                    <span id="photo-bright-val" style="font-size: 11px; min-width: 32px; text-align: right;">${this.state.brightness}</span>
                  </div>
                </div>

                <div class="property-row" style="margin-bottom: 8px;">
                  <span class="property-label">Контраст</span>
                  <div style="display: flex; align-items: center; gap: 8px; width: 170px;">
                    <input type="range" id="photo-contrast-slider" min="-50" max="50" step="1" value="${this.state.contrast}" style="flex: 1;" />
                    <span id="photo-contrast-val" style="font-size: 11px; min-width: 32px; text-align: right;">${this.state.contrast}</span>
                  </div>
                </div>

                <div class="property-row" style="margin-bottom: 8px;">
                  <span class="property-label">Насыщенность</span>
                  <div style="display: flex; align-items: center; gap: 8px; width: 170px;">
                    <input type="range" id="photo-sat-slider" min="-50" max="50" step="1" value="${this.state.saturation}" style="flex: 1;" />
                    <span id="photo-sat-val" style="font-size: 11px; min-width: 32px; text-align: right;">${this.state.saturation}</span>
                  </div>
                </div>

                <div class="property-row">
                  <span class="property-label">Оттенки серого (Ч/Б)</span>
                  <input type="checkbox" id="photo-gray-checkbox" ${this.state.grayscale ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" id="btn-cancel-photo">Отмена</button>
            <button class="btn-primary" id="btn-apply-photo">
              <i data-lucide="check"></i> Применить к карточке
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const overlay = this.container.querySelector('#photo-editor-overlay');
    const closeBtn = this.container.querySelector('#btn-close-photo-editor');
    const cancelBtn = this.container.querySelector('#btn-cancel-photo');
    const applyBtn = this.container.querySelector('#btn-apply-photo');
    const canvas = this.container.querySelector('#photo-preview-canvas');

    const close = () => {
      this.isOpen = false;
      overlay.classList.remove('open');
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Frame Shape Buttons
    this.container.querySelectorAll('[data-shape]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('[data-shape]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.frameShape = btn.dataset.shape;
        this.updateDimensionsByShape();
        this.drawPreview();
      });
    });

    // Zoom slider
    const zoomSlider = this.container.querySelector('#photo-zoom-slider');
    const zoomVal = this.container.querySelector('#photo-zoom-val');
    zoomSlider.addEventListener('input', (e) => {
      this.state.zoom = parseFloat(e.target.value) || 1;
      zoomVal.textContent = `${Math.round(this.state.zoom * 100)}%`;
      this.drawPreview();
    });

    // Brightness slider
    const brightSlider = this.container.querySelector('#photo-bright-slider');
    const brightVal = this.container.querySelector('#photo-bright-val');
    brightSlider.addEventListener('input', (e) => {
      this.state.brightness = parseInt(e.target.value, 10) || 0;
      brightVal.textContent = this.state.brightness;
      this.drawPreview();
    });

    // Contrast slider
    const contrastSlider = this.container.querySelector('#photo-contrast-slider');
    const contrastVal = this.container.querySelector('#photo-contrast-val');
    contrastSlider.addEventListener('input', (e) => {
      this.state.contrast = parseInt(e.target.value, 10) || 0;
      contrastVal.textContent = this.state.contrast;
      this.drawPreview();
    });

    // Saturation slider
    const satSlider = this.container.querySelector('#photo-sat-slider');
    const satVal = this.container.querySelector('#photo-sat-val');
    satSlider.addEventListener('input', (e) => {
      this.state.saturation = parseInt(e.target.value, 10) || 0;
      satVal.textContent = this.state.saturation;
      this.drawPreview();
    });

    // Grayscale checkbox
    const grayCheckbox = this.container.querySelector('#photo-gray-checkbox');
    grayCheckbox.addEventListener('change', (e) => {
      this.state.grayscale = e.target.checked;
      this.drawPreview();
    });

    // Rotate 90
    this.container.querySelector('#btn-rotate-photo-90').addEventListener('click', () => {
      this.state.rotation = (this.state.rotation + 90) % 360;
      this.drawPreview();
    });

    // Reset
    this.container.querySelector('#btn-reset-photo-state').addEventListener('click', () => {
      this.resetState();
      this.drawPreview();
    });

    // Pan via Mouse Dragging on Preview Canvas
    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX - this.state.panX;
      this.dragStartY = e.clientY - this.state.panY;
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.state.panX = e.clientX - this.dragStartX;
      this.state.panY = e.clientY - this.dragStartY;
      this.drawPreview();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        canvas.style.cursor = 'grab';
      }
    });

    // Apply Button
    applyBtn.addEventListener('click', () => {
      if (!this.currentImage) return;

      const outputWidth = this.state.frameShape === 'square' || this.state.frameShape === 'circle' ? 380 : 320;
      const outputHeight = this.state.frameShape === 'square' || this.state.frameShape === 'circle' ? 380 : 420;

      const resultDataUrl = renderCroppedPhoto({
        image: this.currentImage,
        panX: this.state.panX,
        panY: this.state.panY,
        zoom: this.state.zoom,
        rotation: this.state.rotation,
        frameShape: this.state.frameShape,
        outputWidth,
        outputHeight,
        adjustments: {
          brightness: this.state.brightness,
          contrast: this.state.contrast,
          saturation: this.state.saturation,
          grayscale: this.state.grayscale,
        },
      });

      this.onApplyPhoto(resultDataUrl, this.targetObject);
      close();
    });
  }

  updateDimensionsByShape() {
    const canvas = this.container.querySelector('#photo-preview-canvas');
    if (this.state.frameShape === 'square' || this.state.frameShape === 'circle') {
      canvas.width = 300;
      canvas.height = 300;
    } else {
      canvas.width = 280;
      canvas.height = 350;
    }
  }

  resetState() {
    this.state = {
      panX: 0,
      panY: 0,
      zoom: 1,
      rotation: 0,
      frameShape: 'rounded',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      grayscale: false,
    };

    const zoomSlider = this.container.querySelector('#photo-zoom-slider');
    if (zoomSlider) zoomSlider.value = 1;
    const brightSlider = this.container.querySelector('#photo-bright-slider');
    if (brightSlider) brightSlider.value = 0;
    const contrastSlider = this.container.querySelector('#photo-contrast-slider');
    if (contrastSlider) contrastSlider.value = 0;
    const satSlider = this.container.querySelector('#photo-sat-slider');
    if (satSlider) satSlider.value = 0;
    const grayCheckbox = this.container.querySelector('#photo-gray-checkbox');
    if (grayCheckbox) grayCheckbox.checked = false;

    this.updateDimensionsByShape();
  }

  open(imageSrcOrDataUrl, targetObject = null) {
    this.targetObject = targetObject;
    this.resetState();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.currentImage = img;
      this.isOpen = true;
      const overlay = this.container.querySelector('#photo-editor-overlay');
      overlay.classList.add('open');
      this.drawPreview();
      if (window.initIcons) {
        window.initIcons(this.container);
      }
    };
    img.src = imageSrcOrDataUrl;
  }

  drawPreview() {
    const canvas = this.container.querySelector('#photo-preview-canvas');
    if (!canvas || !this.currentImage) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const previewDataUrl = renderCroppedPhoto({
      image: this.currentImage,
      panX: this.state.panX,
      panY: this.state.panY,
      zoom: this.state.zoom,
      rotation: this.state.rotation,
      frameShape: this.state.frameShape,
      outputWidth: w,
      outputHeight: h,
      adjustments: {
        brightness: this.state.brightness,
        contrast: this.state.contrast,
        saturation: this.state.saturation,
        grayscale: this.state.grayscale,
      },
    });

    const previewImg = new Image();
    previewImg.onload = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(previewImg, 0, 0, w, h);
    };
    previewImg.src = previewDataUrl;
  }
}
