import { Header } from './components/Header/Header.js';
import { Sidebar } from './components/Sidebar/Sidebar.js';
import { BadgeEditor } from './components/BadgeEditor/BadgeEditor.js';
import { PropertyInspector } from './components/PropertyInspector/PropertyInspector.js';
import { A4Editor } from './components/A4Editor/A4Editor.js';
import { PrintPreview } from './components/PrintPreview/PrintPreview.js';
import { SettingsModal } from './components/Settings/SettingsModal.js';
import { PhotoEditorModal } from './components/PhotoEditor/PhotoEditorModal.js';

import { createDefaultFront } from './templates/defaultFront.js';
import { createDefaultBack } from './templates/defaultBack.js';
import { HistoryManager } from './editor/history.js';
import { AutoSaveManager } from './storage/autosave.js';
import { loadProject, openDB } from './storage/indexedDB.js';
import { RecoveryManager } from './storage/recovery.js';
import { initIcons } from './utils/icons.js';
import { SheetLayoutEngine } from './printing/layout.js';
import { AlignmentEngine } from './printing/alignment.js';
import { renderBadgeFrontHtml, renderBadgeBackHtml } from './components/BadgeCard/renderBadgeHtml.js';

export class App {
  constructor(rootEl) {
    this.rootEl = rootEl;
    this.currentMode = 'editor'; // 'editor' | 'a4' | 'print'
    this.cards = [];
    this.currentCardId = null;
    this.settings = {
      animationEnabled: true,
    };

    this.historyManager = new HistoryManager({
      limit: 30,
      onStateChange: (status) => this.header?.updateHistoryStatus(status),
    });

    this.autoSaveManager = new AutoSaveManager((status, message) => {
      this.header?.updateSaveStatus(status, message);
    });

    window.initIcons = initIcons;
  }

  async init() {
    this.renderLayout();
    this.initComponents();
    this.setupKeyboardShortcuts();
    this.setupDragAndDrop();

    // Initialize IndexedDB and load last project or default
    try {
      await openDB();
      const savedProject = await loadProject('current-project');
      if (savedProject && savedProject.version === '6.0-stitch-exact' && savedProject.cards && savedProject.cards.length > 0) {
        this.cards = savedProject.cards;
        this.currentCardId = savedProject.currentCardId || this.cards[0].id;
        if (savedProject.settings) {
          this.settings = { ...this.settings, ...savedProject.settings };
        }
      } else {
        this.loadSampleData();
      }
    } catch (e) {
      console.warn('Could not load from IndexedDB, using sample data:', e);
      this.loadSampleData();
    }

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.loadCardIntoEditor(this.currentCardId);

    // Save clean initial state with version 6.0-stitch-exact
    await this.autoSaveManager.saveNow({
      id: 'current-project',
      version: '6.0-stitch-exact',
      cards: this.cards,
      currentCardId: this.currentCardId,
      settings: this.settings,
    });

    // Initial snapshot for history
    this.snapshotHistory();

    // Trigger icon render
    initIcons(this.rootEl);
  }

  loadSampleData() {
    this.cards = [
      {
        id: 'card-1',
        name: 'Раҳимова Нигина Рустамовна',
        group: '2-790106-102',
        studentId: '2-790106-102',
        specialty: 'кори ҳамширагӣ',
        photoSrc: '/assets/student-nigina.jpg',
        data: {
          title1: 'КОЛЛЕҶИ ТИББИИ',
          title2: 'ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН',
          title3: 'ДАР НОҲИЯИ ДАНҒАРА',
          idNumber: '2-790106-102',
          nameLine1: 'РАҲИМОВА',
          nameLine2: 'НИГИНА РУСТАМОВНА',
          specialty: 'кори ҳамширагӣ',
          cohort: '2024–2028',
          directorName: 'Сафарзода З.И.',
          photoSrc: '/assets/student-nigina.jpg',
          emblemTajikistan: '/assets/gerb-tajikistan-clean.png',
          emblemMedical: '/assets/medical-emblem-clean.png',
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
        },
      },
      {
        id: 'card-2',
        name: 'Саидов Фирӯз Ҷамшедович',
        group: '2-790106-102',
        studentId: '2-790106-103',
        specialty: 'кори табобатӣ',
        photoSrc: '/assets/student-nigina.jpg',
        data: {
          title1: 'КОЛЛЕҶИ ТИББИИ',
          title2: 'ДОНИШГОҲИ ДАВЛАТИИ ТИББИИ ХАТЛОН',
          title3: 'ДАР НОҲИЯИ ДАНҒАРА',
          idNumber: '2-790106-103',
          nameLine1: 'САИДОВ',
          nameLine2: 'ФИРӮЗ ҶАМШЕДОВИЧ',
          specialty: 'кори табобатӣ',
          cohort: '2024–2028',
          directorName: 'Сафарзода З.И.',
          photoSrc: '/assets/student-nigina.jpg',
          emblemTajikistan: '/assets/gerb-tajikistan-clean.png',
          emblemMedical: '/assets/medical-emblem-clean.png',
          backTitle: 'Қоидаҳои истифодаи шаҳодатнома',
          validity: 'VALID UNTIL: 01/07/2028',
          rule1: '1. Ин шаҳодатнома ҳуҷҷати расмии донишҷӯи Коллеҷи тиббии ДДТХ дар ноҳияи Данғара мебошад.',
          rule2: '2. Ҳангоми ворид шудан ба бинои коллеҷ, беморхонаҳои клиникӣ ва китобхона нишон додани он ҳатмист.',
          rule3: '3. Ба дигар шахсон додани шаҳодатнома қатъиян манъ аст. Ҳангоми гум шудан фавран ба деканат хабар диҳед.',
          bloodGroup: 'B(III) Rh+ (Positive)',
          contactPhone: '+992 (3312) 2-24-45',
          barcodeNumber: '2-790106-103',
          addressCity: 'ҶТ, вилояти Хатлон,',
          addressStreet: 'н. Данғара, кӯч. Марказӣ',
        },
      },
    ];

    this.currentCardId = 'card-1';
  }

  renderLayout() {
    this.rootEl.innerHTML = `
      <div id="header-mount"></div>
      <main class="app-workspace">
        <div id="sidebar-mount"></div>
        <div id="center-view-mount" style="flex: 1; display: flex; position: relative; overflow: hidden;">
          <div id="editor-view-container" style="flex: 1; display: flex;"></div>
          <div id="a4-view-container" style="flex: 1; display: none;"></div>
          <div id="print-view-container" style="flex: 1; display: none;"></div>
        </div>
        <div id="properties-mount"></div>
      </main>
      <div id="settings-mount"></div>
      <div id="photo-editor-mount"></div>
      <div id="print-container"></div>
    `;
  }

  initComponents() {
    // Header
    this.header = new Header({
      container: this.rootEl.querySelector('#header-mount'),
      onModeChange: (mode) => this.switchMode(mode),
      onNewBadge: () => this.addNewCard(),
      onUndo: () => this.handleUndo(),
      onRedo: () => this.handleRedo(),
      onOpenSettings: () => this.settingsModal.open(),
      onPrint: () => this.switchMode('print'),
      onResetStitch: async () => {
        this.loadSampleData();
        this.sidebar.setCards(this.cards, this.currentCardId);
        this.loadCardIntoEditor(this.currentCardId);
        await this.autoSaveManager.saveNow({
          id: 'current-project',
          version: '5.0-stitch-exact',
          cards: this.cards,
          currentCardId: this.currentCardId,
          settings: this.settings,
        });
      },
    });

    // Sidebar
    this.sidebar = new Sidebar({
      container: this.rootEl.querySelector('#sidebar-mount'),
      onSelectCard: (id) => this.selectCard(id),
      onAddCard: () => this.addNewCard(),
      onDuplicateCard: (id) => this.duplicateCard(id),
      onDeleteCard: (id) => this.deleteCard(id),
      onRenameCard: (id, name) => this.renameCard(id, name),
    });

    // Badge Editor (Center Canvas)
    this.badgeEditor = new BadgeEditor({
      container: this.rootEl.querySelector('#editor-view-container'),
      animationEnabled: this.settings.animationEnabled,
      onElementSelect: (obj, side) => {
        this.propertyInspector?.setSelectedObject(obj, side);
      },
      onLiveUpdate: (obj) => {
        this.propertyInspector?.updateLiveValues(obj);
      },
      onCanvasModify: () => {
        this.handleCanvasModified();
      },
      onPhotoClick: (src) => {
        this.photoEditorModal.open(src, null);
      },
    });

    // Property Inspector (Right Sidebar)
    this.propertyInspector = new PropertyInspector({
      container: this.rootEl.querySelector('#properties-mount'),
      onEditPhoto: (src) => {
        this.photoEditorModal.open(src || this.badgeEditor.currentData.photoSrc, null);
      },
      onUploadImage: (dataUrl) => {
        this.photoEditorModal.open(dataUrl, null);
      },
      onUpdateField: (field, value) => {
        this.badgeEditor.currentData[field] = value;
        this.badgeEditor.updateCardDOM();
        this.handleCanvasModified();
      },
    });

    // Photo Editor Modal
    this.photoEditorModal = new PhotoEditorModal({
      container: this.rootEl.querySelector('#photo-editor-mount'),
      onApplyPhoto: (resultDataUrl, targetObj) => {
        this.handleApplyCroppedPhoto(resultDataUrl, targetObj);
      },
    });

    // A4 Editor Mode
    this.a4Editor = new A4Editor({
      container: this.rootEl.querySelector('#a4-view-container'),
      onFlipAll: () => {
        // mass flip
      },
      onCardSelect: (id) => {
        this.selectCard(id);
        this.switchMode('editor');
      },
    });

    // Print Preview Mode
    this.printPreview = new PrintPreview({
      container: this.rootEl.querySelector('#print-view-container'),
      onExecutePrint: (printOptions) => {
        this.preparePrintDOM(printOptions);
        window.print();
      },
      onTestPrint: () => {
        const printContainer = this.rootEl.querySelector('#print-container');
        if (printContainer) {
          printContainer.innerHTML = AlignmentEngine.generateCalibrationTestSheet();
          window.print();
        }
      },
    });

    // Settings Modal
    this.settingsModal = new SettingsModal({
      container: this.rootEl.querySelector('#settings-mount'),
      onSaveSettings: (newSettings) => {
        this.settings = { ...this.settings, ...newSettings };
        this.badgeEditor.setAnimationEnabled(this.settings.animationEnabled);
        this.a4Editor.setAnimationEnabled(this.settings.animationEnabled);
        this.scheduleAutoSave();
      },
      onExportBackup: () => {
        this.syncCurrentCardToMemory();
        RecoveryManager.exportProject({
          cards: this.cards,
          currentCardId: this.currentCardId,
          settings: this.settings,
        });
      },
      onImportBackup: async (importedProject) => {
        if (importedProject && Array.isArray(importedProject.cards)) {
          this.cards = importedProject.cards;
          this.currentCardId = importedProject.currentCardId || this.cards[0]?.id;
          if (importedProject.settings) {
            this.settings = { ...this.settings, ...importedProject.settings };
          }
          this.sidebar.setCards(this.cards, this.currentCardId);
          await this.loadCardIntoEditor(this.currentCardId);
          this.snapshotHistory();
          this.scheduleAutoSave();
        }
      },
      onResetProject: async () => {
        this.loadSampleData();
        this.sidebar.setCards(this.cards, this.currentCardId);
        await this.loadCardIntoEditor(this.currentCardId);
        this.snapshotHistory();
        this.scheduleAutoSave();
      },
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.header.setMode(mode);

    const editorEl = this.rootEl.querySelector('#editor-view-container');
    const a4El = this.rootEl.querySelector('#a4-view-container');
    const printEl = this.rootEl.querySelector('#print-view-container');
    const propertiesEl = this.rootEl.querySelector('#properties-mount');

    editorEl.style.display = mode === 'editor' ? 'flex' : 'none';
    a4El.style.display = mode === 'a4' ? 'flex' : 'none';
    printEl.style.display = mode === 'print' ? 'flex' : 'none';

    // Show/hide properties panel
    propertiesEl.style.display = mode === 'editor' ? 'flex' : 'none';

    if (mode === 'editor') {
      this.badgeEditor.fitToViewport();
    } else if (mode === 'a4') {
      this.syncCurrentCardToMemory();
      this.a4Editor.setCards(this.cards);
    } else if (mode === 'print') {
      this.syncCurrentCardToMemory();
      this.printPreview.setCards(this.cards);
      this.preparePrintDOM(this.printPreview.printOptions);
    }

    initIcons(this.rootEl);
  }

  selectCard(id) {
    this.syncCurrentCardToMemory();
    this.currentCardId = id;
    this.loadCardIntoEditor(id);
    this.sidebar.setCards(this.cards, id);
  }

  loadCardIntoEditor(id) {
    const card = this.cards.find((c) => c.id === id);
    if (!card) return;
    this.badgeEditor.loadCardData(card);
    this.propertyInspector.setCardData(this.badgeEditor.currentData, this.badgeEditor.canvasManager.activeSide);
  }

  syncCurrentCardToMemory() {
    if (!this.badgeEditor) return;
    const card = this.cards.find((c) => c.id === this.currentCardId);
    if (!card) return;

    const current = this.badgeEditor.getCurrentCardData();
    card.data = current.data;
    card.name = current.name;
    card.studentId = current.studentId;
    card.specialty = current.specialty;
    card.photoSrc = current.photoSrc;
  }

  addNewCard() {
    this.syncCurrentCardToMemory();
    const count = this.cards.length + 1;
    const defaultFront = createDefaultFront();
    const defaultBack = createDefaultBack();

    const newCard = {
      id: `card-${Date.now()}`,
      name: `Студент #${count}`,
      group: 'П-302',
      studentId: `ID-2026-${String(count).padStart(4, '0')}`,
      front: defaultFront,
      back: defaultBack,
    };

    this.cards.push(newCard);
    this.selectCard(newCard.id);
    this.handleCanvasModified();
  }

  duplicateCard(id) {
    this.syncCurrentCardToMemory();
    const source = this.cards.find((c) => c.id === id);
    if (!source) return;

    const copy = JSON.parse(JSON.stringify(source));
    copy.id = `card-${Date.now()}`;
    copy.name = `${copy.name} (копия)`;

    this.cards.push(copy);
    this.selectCard(copy.id);
    this.handleCanvasModified();
  }

  deleteCard(id) {
    if (this.cards.length <= 1) {
      alert('Нельзя удалить последнюю карточку в проекте.');
      return;
    }

    this.cards = this.cards.filter((c) => c.id !== id);
    if (this.currentCardId === id) {
      this.currentCardId = this.cards[0].id;
      this.loadCardIntoEditor(this.currentCardId);
    }

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.handleCanvasModified();
  }

  renameCard(id, name) {
    const card = this.cards.find((c) => c.id === id);
    if (card) {
      card.name = name;
      this.sidebar.setCards(this.cards, this.currentCardId);
      this.scheduleAutoSave();
    }
  }

  handleAddElement(data) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    let obj = null;

    if (data.type === 'text') {
      obj = ElementFactory.createText({ text: data.text || 'Новый текст / Матн' });
    } else if (data.type === 'rect') {
      obj = ElementFactory.createRect({ width: data.width || 150, height: data.height || 80, fill: data.fill || '#3B82F6' });
    } else if (data.type === 'circle') {
      obj = ElementFactory.createCircle({ radius: data.radius || 40, fill: data.fill || '#3B82F6' });
    }

    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      this.propertyInspector.setSelectedObject(obj, this.badgeEditor.canvasManager.activeSide);
      this.handleCanvasModified();
    }
  }

  async handleApplyCroppedPhoto(resultDataUrl) {
    this.badgeEditor.setPhoto(resultDataUrl);
    this.handleCanvasModified();
  }

  async handleUploadImage(dataUrl) {
    this.photoEditorModal.open(dataUrl, null);
  }

  handleUpdateElement(obj, props) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    obj.set(props);
    obj.setCoords();
    canvas.renderAll();
    this.propertyInspector.setSelectedObject(obj, this.badgeEditor.canvasManager.activeSide);
    this.handleCanvasModified();
  }

  handleDeleteElement(obj) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
    this.propertyInspector.setSelectedObject(null, this.badgeEditor.canvasManager.activeSide);
    this.handleCanvasModified();
  }

  handleReorderElement(obj, action) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    CanvasTransformations.reorderLayer(canvas, obj, action);
    this.handleCanvasModified();
  }

  handleAlignElement(obj, alignType) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    CanvasTransformations.align(canvas, obj, alignType);
    this.propertyInspector.setSelectedObject(obj, this.badgeEditor.canvasManager.activeSide);
    this.handleCanvasModified();
  }

  async handleDuplicateElement(obj) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    const cloned = await CanvasTransformations.cloneObject(canvas, obj);
    if (cloned) {
      this.propertyInspector.setSelectedObject(cloned, this.badgeEditor.canvasManager.activeSide);
      this.handleCanvasModified();
    }
  }

  handleUpdateBadgeSettings(settings) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    const color = this.badgeEditor.canvasManager.activeSide === 'front' ? settings.frontBg : settings.backBg;
    canvas.backgroundColor = color;
    canvas.renderAll();
    this.handleCanvasModified();
  }

  handleCanvasModified() {
    this.syncCurrentCardToMemory();
    this.sidebar.setCards(this.cards, this.currentCardId);
    if (this.a4Editor) {
      this.a4Editor.setCards(this.cards);
    }
    if (this.printPreview) {
      this.printPreview.setCards(this.cards);
      this.preparePrintDOM(this.printPreview.printOptions);
    }
    this.snapshotHistory();
    this.scheduleAutoSave();
  }

  snapshotHistory() {
    this.syncCurrentCardToMemory();
    this.historyManager.push({
      cards: this.cards,
      currentCardId: this.currentCardId,
    });
  }

  handleUndo() {
    const previous = this.historyManager.undo();
    if (previous) {
      this.cards = previous.cards;
      this.currentCardId = previous.currentCardId;
      this.sidebar.setCards(this.cards, this.currentCardId);
      this.loadCardIntoEditor(this.currentCardId);
      if (this.a4Editor) this.a4Editor.setCards(this.cards);
      if (this.printPreview) {
        this.printPreview.setCards(this.cards);
        this.preparePrintDOM(this.printPreview.printOptions);
      }
      this.scheduleAutoSave();
    }
  }

  handleRedo() {
    const next = this.historyManager.redo();
    if (next) {
      this.cards = next.cards;
      this.currentCardId = next.currentCardId;
      this.sidebar.setCards(this.cards, this.currentCardId);
      this.loadCardIntoEditor(this.currentCardId);
      if (this.a4Editor) this.a4Editor.setCards(this.cards);
      if (this.printPreview) {
        this.printPreview.setCards(this.cards);
        this.preparePrintDOM(this.printPreview.printOptions);
      }
      this.scheduleAutoSave();
    }
  }

  scheduleAutoSave() {
    this.syncCurrentCardToMemory();
    this.autoSaveManager.schedule({
      id: 'current-project',
      version: '5.0-stitch-exact',
      cards: this.cards,
      currentCardId: this.currentCardId,
      settings: this.settings,
    });
  }

  preparePrintDOM(printOptions = {}) {
    const printContainer = this.rootEl.querySelector('#print-container');
    if (!printContainer) return;

    const options = {
      mode: printOptions.mode || 'both',
      flipEdge: printOptions.flipEdge || 'long',
      offsetX: printOptions.offsetX || 0,
      offsetY: printOptions.offsetY || 0,
    };

    const layoutEngine = new SheetLayoutEngine({
      cardWidthMm: 90,
      cardHeightMm: 55,
      marginTopMm: 12,
      marginBottomMm: 12,
      marginLeftMm: 12,
      marginRightMm: 12,
      gapXMm: 4,
      gapYMm: 4,
      columnMode: 'auto',
    });

    const { slots: frontSlots, grid } = layoutEngine.getSlotsForCards(this.cards.length, 0);
    const backSlots = AlignmentEngine.getBackSheetSlots(frontSlots, grid, {
      flipEdge: options.flipEdge,
      offsetX: options.offsetX,
      offsetY: options.offsetY,
    });

    const isBoth = options.mode === 'both';
    const isFront = options.mode === 'front-only' || isBoth;
    const isBack = options.mode === 'back-only' || isBoth;

    let pagesHtml = '';

    if (isFront) {
      pagesHtml += `
        <div class="print-page" style="width: 210mm; height: 297mm; position: relative; background: #FFFFFF; box-sizing: border-box; overflow: hidden;">
          ${this.renderPrintBadges(frontSlots, 'front')}
          ${this.renderPrintCropMarks(frontSlots, layoutEngine)}
        </div>
      `;
    }

    if (isBack) {
      pagesHtml += `
        <div class="print-page" style="width: 210mm; height: 297mm; position: relative; background: #FFFFFF; box-sizing: border-box; overflow: hidden;">
          ${this.renderPrintBadges(backSlots, 'back')}
          ${this.renderPrintCropMarks(backSlots, layoutEngine)}
        </div>
      `;
    }

    printContainer.innerHTML = pagesHtml;
  }

  renderPrintBadges(slots, side) {
    const scaleFactor = 85.6 / (440 * 0.2645833);

    return slots
      .map((slot) => {
        const card = this.cards[slot.cardIndex];
        if (!card) return '';

        const isFront = side === 'front';
        const cardData = card.data || card;

        const renderedHtml = isFront
          ? renderBadgeFrontHtml(cardData, { isEditable: false })
          : renderBadgeBackHtml(cardData, { isEditable: false });

        return `
          <div class="print-badge-item" style="position: absolute; left: ${slot.leftMm}mm; top: ${slot.topMm}mm; width: ${slot.widthMm}mm; height: ${slot.heightMm}mm; overflow: hidden; box-sizing: border-box; border-radius: 2mm;">
            <div style="width: 440px; height: 278px; transform: scale(${scaleFactor}); transform-origin: top left;">
              ${renderedHtml}
            </div>
          </div>
        `;
      })
      .join('');
  }

  renderPrintCropMarks(slots, layoutEngine) {
    let svgContent = '';

    slots.forEach((slot) => {
      const marks = layoutEngine.generateCropMarks(slot);
      marks.forEach((m) => {
        svgContent += `<line x1="${m.x1}mm" y1="${m.y1}mm" x2="${m.x2}mm" y2="${m.y2}mm" stroke="#475569" stroke-width="0.2mm" />`;
      });
    });

    return `
      <svg style="position: absolute; inset: 0; width: 210mm; height: 297mm; pointer-events: none; z-index: 20;">
        ${svgContent}
      </svg>
    `;
  }

  setupDragAndDrop() {
    const centerMount = this.rootEl.querySelector('#center-view-mount');
    if (!centerMount) return;

    centerMount.addEventListener('dragover', (e) => {
      e.preventDefault();
      centerMount.style.outline = '2px dashed #3B82F6';
    });

    centerMount.addEventListener('dragleave', (e) => {
      e.preventDefault();
      centerMount.style.outline = 'none';
    });

    centerMount.addEventListener('drop', (e) => {
      e.preventDefault();
      centerMount.style.outline = 'none';

      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const activeObj = this.badgeEditor.canvasManager.getActiveCanvas().getActiveObject();
          this.photoEditorModal.open(event.target.result, activeObj);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+Z = Undo
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.handleUndo();
      }

      // Ctrl+Shift+Z or Ctrl+Y = Redo
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') || (e.ctrlKey && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        this.handleRedo();
      }

      // Ctrl+S = Save
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.syncCurrentCardToMemory();
        this.autoSaveManager.saveNow({
          id: 'current-project',
          version: '5.0-stitch-exact',
          cards: this.cards,
          currentCardId: this.currentCardId,
          settings: this.settings,
        });
      }

      // Ctrl+D = Duplicate Element
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
        const activeObj = canvas.getActiveObject();
        if (activeObj && !activeObj.isEditing) {
          e.preventDefault();
          this.handleDuplicateElement(activeObj);
        }
      }

      // Delete key for selected element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
          const activeObj = canvas.getActiveObject();
          if (activeObj && !activeObj.isEditing) {
            e.preventDefault();
            this.handleDeleteElement(activeObj);
          }
        }
      }
    });

    window.addEventListener('resize', () => {
      if (this.currentMode === 'editor') {
        this.badgeEditor.fitToViewport();
      }
    });
  }
}
