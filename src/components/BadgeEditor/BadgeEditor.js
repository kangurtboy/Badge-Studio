import { FlipCardController } from '../../animation/flipCard.js';

export class BadgeEditor {
  constructor({ container, onElementSelect, onCanvasModify, onPhotoClick, animationEnabled = true }) {
    this.container = container;
    this.onElementSelect = onElementSelect || (() => {});
    this.onCanvasModify = onCanvasModify || (() => {});
    this.onPhotoClick = onPhotoClick || (() => {});
    this.animationEnabled = animationEnabled;

    this.zoom = 1.35; // Default optimal preview scale on desktop
    this.cardWidth = 440; // Exact CR-80 visual width from Stitch
    this.cardHeight = 278; // Exact CR-80 visual height from Stitch

    this.currentData = {
      // Front side
      title1: 'КОЛЛЕҶИ ТИББИИ',
      title2: 'ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН',
      title3: 'ДАР НОҲИЯИ ТЕМУРМАЛИК',
      idNumber: '2-790106',
      nameLine1: 'РАҲИМОВА',
      nameLine2: 'НИГИНА РУСТАМОВНА',
      specialty: 'кори ҳамширагӣ',
      cohort: '2024–2028',
      directorName: 'Сафарзода З.И.',
      photoSrc: '/assets/student-nigina.jpg',
      emblemTajikistan: '/assets/gerb-tajikistan-clean.png',
      emblemMedical: '/assets/medical-emblem-clean.png',

      // Back side
      backTitle: 'ШАҲОДАТНОМАИ ДОНИШҶӮӢ (STUDENT ID CARD)',
      validity: 'EXP: 01/07/2028',
      rule1: '1. Ин шаҳодатнома ҳуҷҷати расмии донишҷӯи Коллеҷи тиббии ДДТХ дар н. Темурмалик мебошад.',
      rule2: '2. Ҳангоми ворид шудан ба бинои коллеҷ, беморхонаҳои клиникӣ ва китобхона пешниҳоди он ҳатмист.',
      rule3: '3. Ба дигар шахсон додани шаҳодатнома қатъиян манъ аст. Ҳангоми гум шудан ба деканат муроҷиат намоед.',
      moodleLogin: 'gr26111',
      moodlePass: 'Student1#',
      barcodeNumber: '2-790106',
      addressLine1: 'ҶТ, вилояти Хатлон,',
      addressLine2: 'ноҳияи Темурмалик,',
      addressLine3: 'ҷ.д Кангурт',
    };

    this.render();
    this.initFlipCard();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="app-center-viewport" id="viewport-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; width: 100%; height: 100%;">
        <div class="viewport-grid-bg"></div>

        <!-- 3D Perspective Flip Container (Exact Stitch CR-80) -->
        <div class="flip-card-perspective" id="flip-perspective" style="width: ${this.cardWidth}px; height: ${this.cardHeight}px; transform: scale(${this.zoom}); transform-origin: center center;">
          <div class="flip-card-inner" id="flip-inner" style="width: 100%; height: 100%;">
            
            <!-- ================= FRONT FACE ================= -->
            <div class="card-face card-face-front" id="badge-front">
              <!-- Top Header: Emblems and 3-line Title -->
              <div style="position: relative; z-index: 10; padding: 10px 16px 4px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid #F1F5F9;">
                <div style="width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <img src="${this.currentData.emblemTajikistan}" alt="Герби Тоҷикистон" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>

                <div style="flex: 1; text-align: center; padding: 0 4px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div contenteditable="true" data-field="title1" style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; line-height: 1.2;">
                    ${this.currentData.title1}
                  </div>
                  <div contenteditable="true" data-field="title2" style="font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: #0F172A; line-height: 1.2; margin-top: 1px;">
                    ${this.currentData.title2}
                  </div>
                  <div contenteditable="true" data-field="title3" style="font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #082F49; line-height: 1.2; margin-top: 1px;">
                    ${this.currentData.title3}
                  </div>
                </div>

                <div style="width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <img src="${this.currentData.emblemMedical}" alt="Эмблемаи тиббӣ" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
              </div>

              <!-- Main Body: Student Photo + Info -->
              <div style="position: relative; z-index: 10; padding: 4px 16px; display: flex; align-items: center; gap: 14px; flex: 1;">
                <!-- Student Photo Container (clickable to crop/replace) -->
                <div id="badge-photo-box" title="Нажмите для замены или кадрирования фотографии" style="width: 102px; height: 132px; flex-shrink: 0; border-radius: 6px; overflow: hidden; border: 1px solid #CBD5E1; box-shadow: 0 1px 3px rgba(0,0,0,0.1); background-color: #F1F5F9; cursor: pointer; position: relative;">
                  <img id="badge-photo-img" src="${this.currentData.photoSrc}" alt="Акси донишҷӯ" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                  <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35); opacity: 0; transition: opacity 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 600;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
                    <i data-lucide="upload" style="width: 16px; height: 16px; margin-bottom: 2px;"></i>
                    <span>Изменить</span>
                  </div>
                </div>

                <!-- Right Column: ID Pill, Name, Specialty, Cohort -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 5px;">
                  <!-- Dark Navy ID Pill -->
                  <div style="display: inline-flex; align-items: center; align-self: flex-start; background-color: #082F49; color: #FFFFFF; font-family: 'JetBrains Mono', monospace; padding: 3px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
                    <span contenteditable="true" data-field="idNumber">${this.currentData.idNumber}</span>
                  </div>

                  <!-- Student Full Name (2 lines, Bold, Uppercase) -->
                  <div>
                    <h3 style="font-size: 15px; font-weight: 900; letter-spacing: -0.01em; color: #0F172A; text-transform: uppercase; line-height: 1.15; margin: 0;">
                      <span contenteditable="true" data-field="nameLine1">${this.currentData.nameLine1}</span><br/>
                      <span contenteditable="true" data-field="nameLine2">${this.currentData.nameLine2}</span>
                    </h3>
                  </div>

                  <!-- Specialty & Academic Cohort -->
                  <div style="font-size: 10px; line-height: 1.3; color: #334155; margin-top: 2px;">
                    <p style="font-size: 10.5px; font-weight: 700; color: #082F49; margin: 0; display: flex; align-items: center; gap: 4px;">
                      <span style="color: #64748B; font-weight: 400;">Ихтисос:</span>
                      <span contenteditable="true" data-field="specialty">${this.currentData.specialty}</span>
                    </p>
                    <p style="font-size: 10px; font-weight: 500; color: #475569; margin: 3px 0 0 0; display: flex; align-items: center; gap: 5px;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #059669; display: inline-block; flex-shrink: 0;"></span>
                      <span>Соли таҳсил: <strong contenteditable="true" data-field="cohort">${this.currentData.cohort}</strong></span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Footer: Director Authorization -->
              <div style="position: relative; z-index: 10; padding: 6px 16px; background-color: rgba(248, 250, 252, 0.95); border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span style="font-weight: 700; color: #334155; font-size: 9.5px;">Директор:</span>
                  <div style="position: relative; display: flex; align-items: center; gap: 6px;">
                    <!-- Blue ink signature vector -->
                    <svg style="width: 80px; height: 24px; color: #1E40AF; opacity: 0.9;" fill="none" stroke="currentColor" viewBox="0 0 120 40">
                      <path d="M5 25 C 20 5, 25 35, 38 18 C 45 7, 50 30, 65 15 C 75 5, 80 32, 95 20 C 105 12, 110 25, 118 10" stroke-linecap="round" stroke-width="2.2"></path>
                      <path d="M15 28 L 70 24" stroke-linecap="round" stroke-width="1.3"></path>
                    </svg>
                    <span contenteditable="true" data-field="directorName" style="font-weight: 700; color: #0F172A; font-size: 9.5px; letter-spacing: 0.02em;">
                      ${this.currentData.directorName}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Corner print crop guides -->
              <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
              <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
              <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
              <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
            </div>

            <!-- ================= BACK FACE ================= -->
            <div class="card-face card-face-back" id="badge-back">
              <!-- Back Header: Title & Validity -->
              <div style="position: relative; z-index: 10; padding: 10px 16px 6px 16px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between;">
                <span contenteditable="true" data-field="backTitle" style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A;">
                  ${this.currentData.backTitle}
                </span>
                <span style="font-size: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #065F46; background-color: #ECFDF5; padding: 2px 8px; border-radius: 4px; border: 1px solid #A7F3D0;">
                  <span contenteditable="true" data-field="validity">${this.currentData.validity}</span>
                </span>
              </div>

              <!-- Campus Regulations (3 Points) -->
              <div style="position: relative; z-index: 10; padding: 4px 16px; font-size: 8px; color: #475569; display: flex; flex-direction: column; gap: 4px; line-height: 1.35;">
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <span style="font-weight: 700; color: #0284C7; flex-shrink: 0;">1.</span>
                  <span contenteditable="true" data-field="rule1">${this.currentData.rule1}</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <span style="font-weight: 700; color: #0284C7; flex-shrink: 0;">2.</span>
                  <span contenteditable="true" data-field="rule2">${this.currentData.rule2}</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <span style="font-weight: 700; color: #0284C7; flex-shrink: 0;">3.</span>
                  <span contenteditable="true" data-field="rule3">${this.currentData.rule3}</span>
                </div>
              </div>

              <!-- Moodle Login Box -->
              <div style="position: relative; z-index: 10; margin: 0 16px; padding: 6px 10px; background-color: #F8FAFC; border-radius: 6px; border: 1px solid #CBD5E1; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #059669; display: inline-block;"></span>
                  <span style="font-size: 7.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #082F49;">СИСТЕМАИ ТЕСТӢ / MOODLE</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 8.5px; font-family: 'JetBrains Mono', monospace;">
                  <div style="background: #FFFFFF; padding: 2px 8px; border-radius: 4px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 4px;">
                    <span style="color: #64748B; font-size: 7px; text-transform: uppercase; font-family: 'Inter', sans-serif; font-weight: 600;">Логин:</span>
                    <strong contenteditable="true" data-field="moodleLogin" style="color: #0F172A;">${this.currentData.moodleLogin}</strong>
                  </div>
                  <div style="background: #FFFFFF; padding: 2px 8px; border-radius: 4px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 4px;">
                    <span style="color: #64748B; font-size: 7px; text-transform: uppercase; font-family: 'Inter', sans-serif; font-weight: 600;">Парол:</span>
                    <strong contenteditable="true" data-field="moodlePass" style="color: #082F49;">${this.currentData.moodlePass}</strong>
                  </div>
                </div>
              </div>

              <!-- Bottom Section: Barcode, QR Code & Address -->
              <div style="position: relative; z-index: 10; padding: 8px 16px; border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #FFFFFF;">
                <!-- Barcode Simulation -->
                <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start;">
                  <div style="height: 32px; width: 175px; display: flex; align-items: stretch; gap: 1.5px; background: #FFFFFF;">
                    <div style="width: 2.5px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 3.5px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
                    <div style="width: 1.5px; background: #000;"></div><div style="width: 2.5px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div>
                    <div style="width: 1.5px; background: #fff;"></div><div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 1.5px; background: #000;"></div>
                    <div style="width: 3.5px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 1px; background: #000;"></div><div style="width: 2px; background: #000;"></div>
                    <div style="width: 1.5px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 2px; background: #000;"></div>
                    <div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 1.5px; background: #000;"></div>
                    <div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
                    <div style="width: 2px; background: #000;"></div><div style="width: 2px; background: #fff;"></div><div style="width: 3px; background: #000;"></div><div style="width: 1px; background: #fff;"></div>
                    <div style="width: 1px; background: #000;"></div><div style="width: 2px; background: #000;"></div><div style="width: 1px; background: #fff;"></div><div style="width: 2px; background: #000;"></div>
                  </div>
                  <span contenteditable="true" data-field="barcodeNumber" style="font-size: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: 0.1em; color: #1E293B; margin-top: 2px;">
                    ${this.currentData.barcodeNumber}
                  </span>
                </div>

                <!-- QR Code & Address -->
                <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                  <div style="width: 36px; height: 36px; background-color: #0F172A; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <svg style="width: 100%; height: 100%; color: #FFFFFF;" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-2-4h2v2h-2v-2z"></path>
                    </svg>
                  </div>
                  <div style="font-size: 7.5px; color: #475569; line-height: 1.25;">
                    <span style="font-weight: 700; color: #0F172A; display: block;">Суроға:</span>
                    <span contenteditable="true" data-field="addressLine1">${this.currentData.addressLine1}</span><br/>
                    <span contenteditable="true" data-field="addressLine2">${this.currentData.addressLine2}</span><br/>
                    <strong contenteditable="true" data-field="addressLine3" style="color: #082F49;">${this.currentData.addressLine3}</strong>
                  </div>
                </div>
              </div>

              <!-- Bottom National Flag Trim (4px) -->
              <div class="tajik-ribbon-bar"></div>

              <!-- Corner print crop guides -->
              <div style="position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
              <div style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; border-top: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
              <div style="position: absolute; bottom: 0; left: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-left: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
              <div style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.5); border-right: 1px solid rgba(148, 163, 184, 0.5); pointer-events: none;"></div>
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

    // Provide mock canvasManager interface for app compatibility
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
      this.setZoom(1.35);
    });

    // Click on photo to replace / crop
    this.container.querySelector('#badge-photo-box')?.addEventListener('click', () => {
      this.onPhotoClick(this.currentData.photoSrc);
    });

    // Inline contenteditable listeners
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
    this.setZoom(1.35);
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
        const parts = cardData.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          this.currentData.nameLine1 = parts[0].toUpperCase();
          this.currentData.nameLine2 = parts.slice(1).join(' ').toUpperCase();
        } else {
          this.currentData.nameLine1 = cardData.name.toUpperCase();
        }
      }
      if (cardData.studentId) this.currentData.idNumber = cardData.studentId;
      if (cardData.specialty) this.currentData.specialty = cardData.specialty;
      if (cardData.photoSrc) this.currentData.photoSrc = cardData.photoSrc;
    }

    this.updateCardDOM();
  }

  updateCardDOM() {
    this.container.querySelectorAll('[data-field]').forEach((el) => {
      const field = el.dataset.field;
      if (field && this.currentData[field] !== undefined) {
        el.innerText = this.currentData[field];
      }
    });

    const photoImg = this.container.querySelector('#badge-photo-img');
    if (photoImg && this.currentData.photoSrc) {
      photoImg.src = this.currentData.photoSrc;
    }
  }

  setPhoto(src) {
    this.currentData.photoSrc = src;
    const photoImg = this.container.querySelector('#badge-photo-img');
    if (photoImg) photoImg.src = src;
    this.onCanvasModify();
  }

  getCurrentCardData() {
    return {
      data: { ...this.currentData },
      name: `${this.currentData.nameLine1} ${this.currentData.nameLine2}`.trim(),
      studentId: this.currentData.idNumber,
      specialty: this.currentData.specialty,
      photoSrc: this.currentData.photoSrc,
    };
  }
}
