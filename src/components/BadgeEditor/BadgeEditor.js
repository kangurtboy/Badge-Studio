import { FlipCardController } from '../../animation/flipCard.js';
import { renderBadgeFrontHtml, renderBadgeBackHtml } from '../BadgeCard/renderBadgeHtml.js';

export class BadgeEditor {
  constructor({ container, onElementSelect, onCanvasModify, onPhotoClick, animationEnabled = true }) {
    this.container = container;
    this.onElementSelect = onElementSelect || (() => {});
    this.onCanvasModify = onCanvasModify || (() => {});
    this.onPhotoClick = onPhotoClick || (() => {});
    this.animationEnabled = animationEnabled;

    this.zoom = 1.45; // Default optimal preview scale
    this.cardWidth = 430; // Exact CR-80 visual width from Stitch
    this.cardHeight = 270; // Exact CR-80 visual height from Stitch

    this.currentData = {
      // Front side
      title1: 'КОЛЛЕҶИ ТИББИИ ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН',
      title2: 'ДАР НОҲИЯИ ДАНҒАРА',
      idNumber: '2-790106-102',
      fullName: 'РАҲИМОВА НИГИНА РУСТАМОВНА',
      faculty: 'Факултети кори ҳамширагӣ',
      course: 'Курси 2, гурӯҳи 102',
      section: 'Шӯъбаи рӯзона',
      cohort: '2024–2028',
      directorName: 'Баротзода А.Ҳ.',
      photoSrc: '/assets/student-nigina.jpg',
      emblemTajikistan: '/assets/gerb-tajikistan-clean.png',
      emblemMedical: '/assets/medical-emblem-clean.png',

      // Back side
      backTitle: 'Қоидаҳои истифодаи шаҳодатнома',
      validity: 'VALID UNTIL: 01/07/2028',
      rule1: '1. Ин шаҳодатнома ҳуҷҷати расмии донишҷӯи Коллеҷи тиббии ДДТХ дар ноҳияи Данғара мебошад.',
      rule2: '2. Ҳангоми ворид шудан ба бинои коллеҷ, беморхонаҳои клиникӣ ва китобхона нишон додани он ҳатмист.',
      rule3: '3. Ба дигар шахсон додани шаҳодатнома қатъиян манъ аст. Ҳангоми гум шудан фавран ба деканат хабар диҳед.',
      bloodGroup: 'A(II) Rh+ (Positive)',
      contactPhone: '+992 (3312) 2-24-45',
      barcodeNumber: '2-790106-102',
      addressCity: 'ҶТ, вилояти Хатлон,',
      addressStreet: 'н. Данғара, кӯч. Марказӣ',
    };

    this.render();
    this.initFlipCard();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="app-center-viewport" id="viewport-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; width: 100%; height: 100%;">
        <div class="viewport-grid-bg"></div>

        <!-- 3D Perspective Flip Container (Exact Stitch CR-80 430px x 270px) -->
        <div class="flip-card-perspective" id="flip-perspective" style="width: ${this.cardWidth}px; height: ${this.cardHeight}px; transform: scale(${this.zoom}); transform-origin: center center;">
          <div class="flip-card-inner" id="flip-inner" style="width: 100%; height: 100%;">
            
            <!-- FRONT FACE -->
            <div id="front-card-mount" style="position: absolute; inset: 0;">
              ${renderBadgeFrontHtml(this.currentData, { isEditable: true })}
            </div>

            <!-- BACK FACE -->
            <div id="back-card-mount" style="position: absolute; inset: 0;">
              ${renderBadgeBackHtml(this.currentData, { isEditable: true })}
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
            <span class="zoom-level-text" id="zoom-text">${Math.round(this.zoom * 100)}%</span>
            <button class="btn-icon" id="btn-zoom-in" title="Увеличить">
              <i data-lucide="zoom-in" style="width: 14px; height: 14px;"></i>
            </button>
            <button class="btn-icon" id="btn-zoom-fit" title="Сбросить масштаб">
              <i data-lucide="maximize-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  initFlipCard() {
    const flipInner = this.container.querySelector('#flip-inner');
    this.flipController = new FlipCardController(flipInner, {
      animationEnabled: this.animationEnabled,
      onFlip: (isFlipped, sideName) => {
        this.updateSideButtons(sideName);
        this.onElementSelect(null, sideName);
      },
    });

    this.canvasManager = {
      activeSide: 'front',
      isLoading: false,
      setActiveSide: (side) => {
        this.canvasManager.activeSide = side;
      },
      getActiveCanvas: () => ({
        getActiveObject: () => null,
      }),
    };
  }

  bindEvents() {
    const btnFront = this.container.querySelector('#btn-side-front');
    const btnBack = this.container.querySelector('#btn-side-back');
    const btnFlip = this.container.querySelector('#btn-flip-card');

    btnFront?.addEventListener('click', () => {
      this.flipController.showFront();
      this.canvasManager.activeSide = 'front';
    });

    btnBack?.addEventListener('click', () => {
      this.flipController.showBack();
      this.canvasManager.activeSide = 'back';
    });

    btnFlip?.addEventListener('click', () => {
      const isBack = this.flipController.toggle();
      this.canvasManager.activeSide = isBack ? 'back' : 'front';
    });

    // Zoom controls
    this.container.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
      this.setZoom(this.zoom + 0.15);
    });

    this.container.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
      this.setZoom(this.zoom - 0.15);
    });

    this.container.querySelector('#btn-zoom-fit')?.addEventListener('click', () => {
      this.setZoom(1.45);
    });

    // Click on photo to replace / crop
    this.bindPhotoClick();

    // Inline contenteditable listeners
    this.bindEditableListeners();
  }

  bindPhotoClick() {
    this.container.querySelector('.student-photo-container')?.addEventListener('click', () => {
      this.onPhotoClick(this.currentData.photoSrc);
    });
  }

  bindEditableListeners() {
    this.container.querySelectorAll('[contenteditable="true"]').forEach((el) => {
      el.addEventListener('input', () => {
        const field = el.dataset.field;
        if (field) {
          this.currentData[field] = el.innerText.trim();
          this.onCanvasModify();
        }
      });

      el.addEventListener('blur', () => {
        const field = el.dataset.field;
        if (field) {
          this.currentData[field] = el.innerText.trim();
          this.onCanvasModify();
        }
      });
    });
  }

  setZoom(zoomLevel) {
    const clamped = Math.max(0.6, Math.min(2.5, zoomLevel));
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
    this.setZoom(1.45);
  }

  setAnimationEnabled(enabled) {
    this.animationEnabled = enabled;
    this.flipController.setAnimationEnabled(enabled);
  }

  updateSideButtons(sideName) {
    const btnFront = this.container.querySelector('#btn-side-front');
    const btnBack = this.container.querySelector('#btn-side-back');
    if (btnFront && btnBack) {
      btnFront.classList.toggle('active', sideName === 'front');
      btnBack.classList.toggle('active', sideName === 'back');
    }
  }

  loadCardData(cardData) {
    if (!cardData) return;

    if (cardData.data) {
      this.currentData = { ...this.currentData, ...cardData.data };
    } else {
      if (cardData.name) {
        this.currentData.fullName = cardData.name.toUpperCase();
      }
      if (cardData.studentId) this.currentData.idNumber = cardData.studentId;
      if (cardData.specialty) this.currentData.faculty = cardData.specialty;
      if (cardData.photoSrc) this.currentData.photoSrc = cardData.photoSrc;
    }

    this.updateCardDOM();
  }

  updateCardDOM() {
    const frontMount = this.container.querySelector('#front-card-mount');
    const backMount = this.container.querySelector('#back-card-mount');

    if (frontMount) {
      frontMount.innerHTML = renderBadgeFrontHtml(this.currentData, { isEditable: true });
    }
    if (backMount) {
      backMount.innerHTML = renderBadgeBackHtml(this.currentData, { isEditable: true });
    }

    this.bindPhotoClick();
    this.bindEditableListeners();
  }

  setPhoto(src) {
    this.currentData.photoSrc = src;
    this.updateCardDOM();
    this.onCanvasModify();
  }

  getCurrentCardData() {
    return {
      data: { ...this.currentData },
      name: this.currentData.fullName,
      studentId: this.currentData.idNumber,
      specialty: this.currentData.faculty,
      photoSrc: this.currentData.photoSrc,
    };
  }
}
