import { FlipCardController } from '../../animation/flipCard.js';
import { BadgeCanvasManager } from '../../editor/canvas.js';

export class BadgeEditor {
  constructor({ container, onElementSelect, onCanvasModify, onLiveUpdate, animationEnabled = true }) {
    this.container = container;
    this.onElementSelect = onElementSelect;
    this.onCanvasModify = onCanvasModify;
    this.onLiveUpdate = onLiveUpdate;
    this.animationEnabled = animationEnabled;

    this.zoom = 1;
    this.canvasWidth = 720;
    this.canvasHeight = 440;

    this.render();
    this.initCanvasAndFlip();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="app-center-viewport" id="viewport-container">
        <div class="viewport-grid-bg"></div>

        <!-- 3D Perspective Card Container -->
        <div class="flip-card-perspective" id="flip-perspective" style="width: ${this.canvasWidth}px; height: ${this.canvasHeight}px;">
          <div class="flip-card-inner" id="flip-inner" style="width: 100%; height: 100%;">
            <!-- Front Face -->
            <div class="card-face card-face-front" id="card-face-front">
              <canvas id="front-canvas"></canvas>
            </div>

            <!-- Back Face -->
            <div class="card-face card-face-back" id="card-face-back">
              <canvas id="back-canvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Floating Bottom Toolbar -->
        <div class="floating-bottom-bar">
          <div class="side-toggle-group">
            <button class="side-toggle-btn active" id="btn-side-front">Лицевая сторона</button>
            <button class="side-toggle-btn" id="btn-side-back">Обратная сторона</button>
          </div>

          <button class="btn-secondary" id="btn-flip-card" style="padding: 4px 12px; font-size: 11px;">
            <i data-lucide="rotate-cw"></i> Перевернуть
          </button>

          <div class="floating-divider"></div>

          <div class="zoom-controls">
            <button class="btn-icon" id="btn-zoom-out" title="Уменьшить">
              <i data-lucide="zoom-out" style="width: 14px; height: 14px;"></i>
            </button>
            <span class="zoom-level-text" id="zoom-text">100%</span>
            <button class="btn-icon" id="btn-zoom-in" title="Увеличить">
              <i data-lucide="zoom-in" style="width: 14px; height: 14px;"></i>
            </button>
            <button class="btn-icon" id="btn-zoom-fit" title="По размеру окна">
              <i data-lucide="maximize-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  initCanvasAndFlip() {
    const flipInner = this.container.querySelector('#flip-inner');
    this.flipController = new FlipCardController(flipInner, {
      animationEnabled: this.animationEnabled,
      onFlip: (isFlipped, sideName) => {
        this.updateSideButtons(sideName);
        this.canvasManager.setActiveSide(sideName);
      }
    });

    const frontCanvasEl = this.container.querySelector('#front-canvas');
    const backCanvasEl = this.container.querySelector('#back-canvas');

    this.canvasManager = new BadgeCanvasManager({
      frontCanvasEl,
      backCanvasEl,
      width: this.canvasWidth,
      height: this.canvasHeight,
      onSelect: (obj, side) => this.onElementSelect(obj, side),
      onModify: (side) => this.onCanvasModify(side),
      onLiveUpdate: (obj, side) => {
        if (this.onLiveUpdate) {
          this.onLiveUpdate(obj, side);
        }
      }
    });
  }

  bindEvents() {
    const btnFront = this.container.querySelector('#btn-side-front');
    const btnBack = this.container.querySelector('#btn-side-back');
    const btnFlip = this.container.querySelector('#btn-flip-card');

    btnFront.addEventListener('click', () => {
      this.flipController.showFront();
    });

    btnBack.addEventListener('click', () => {
      this.flipController.showBack();
    });

    btnFlip.addEventListener('click', () => {
      this.flipController.toggle();
    });

    // Zoom controls
    this.container.querySelector('#btn-zoom-in').addEventListener('click', () => {
      this.setZoom(this.zoom + 0.15);
    });

    this.container.querySelector('#btn-zoom-out').addEventListener('click', () => {
      this.setZoom(this.zoom - 0.15);
    });

    this.container.querySelector('#btn-zoom-fit').addEventListener('click', () => {
      this.fitToViewport();
    });
  }

  updateSideButtons(sideName) {
    const btnFront = this.container.querySelector('#btn-side-front');
    const btnBack = this.container.querySelector('#btn-side-back');
    if (btnFront && btnBack) {
      btnFront.classList.toggle('active', sideName === 'front');
      btnBack.classList.toggle('active', sideName === 'back');
    }
  }

  setZoom(zoomLevel) {
    const clamped = Math.max(0.4, Math.min(2.5, zoomLevel));
    this.zoom = clamped;
    const perspectiveEl = this.container.querySelector('#flip-perspective');
    if (perspectiveEl) {
      perspectiveEl.style.transform = `scale(${this.zoom})`;
    }
    const zoomText = this.container.querySelector('#zoom-text');
    if (zoomText) {
      zoomText.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  fitToViewport() {
    const viewport = this.container.querySelector('#viewport-container');
    if (!viewport) return;

    const availableWidth = viewport.clientWidth - 80;
    const availableHeight = viewport.clientHeight - 120;

    const scaleX = availableWidth / this.canvasWidth;
    const scaleY = availableHeight / this.canvasHeight;
    const optimalScale = Math.min(scaleX, scaleY, 1.2);

    this.setZoom(optimalScale);
  }

  setAnimationEnabled(enabled) {
    this.animationEnabled = enabled;
    this.flipController.setAnimationEnabled(enabled);
  }

  loadCardData(cardData) {
    if (!cardData) return;

    if (cardData.front) {
      this.canvasManager.loadTemplate(this.canvasManager.frontCanvas, cardData.front);
    }
    if (cardData.back) {
      this.canvasManager.loadTemplate(this.canvasManager.backCanvas, cardData.back);
    }
  }

  getCurrentCardData() {
    return {
      front: this.canvasManager.exportData(this.canvasManager.frontCanvas),
      back: this.canvasManager.exportData(this.canvasManager.backCanvas),
    };
  }
}
