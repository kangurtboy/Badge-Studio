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
import { CanvasTransformations } from './editor/transformations.js';
import { ElementFactory } from './editor/elements.js';
import { SheetLayoutEngine } from './printing/layout.js';
import { AlignmentEngine } from './printing/alignment.js';

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
      if (savedProject && savedProject.version === '2.0' && savedProject.cards && savedProject.cards.length > 0) {
        this.cards = savedProject.cards;
        this.currentCardId = savedProject.currentCardId || this.cards[0].id;
        if (savedProject.settings) {
          this.settings = { ...this.settings, ...savedProject.settings };
        }
      } else {
        this.loadSampleData();
        await this.autoSaveManager.saveNow({
          id: 'current-project',
          version: '2.0',
          cards: this.cards,
          currentCardId: this.currentCardId,
          settings: this.settings,
        });
      }
    } catch (e) {
      console.warn('Could not load from IndexedDB, using sample data:', e);
      this.loadSampleData();
    }

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.loadCardIntoEditor(this.currentCardId);

    // Initial snapshot for history
    this.snapshotHistory();

    // Trigger icon render
    initIcons(this.rootEl);
  }

  loadSampleData() {
    const defaultFront = createDefaultFront();
    const defaultBack = createDefaultBack();

    this.cards = [
      {
        id: 'card-1',
        name: 'Раҳимова Нигина',
        surname: 'Маҳмадсаидзода',
        group: '2-790106',
        studentId: '2-790106',
        specialty: 'Кори ҳамширагӣ',
        front: defaultFront,
        back: defaultBack,
      },
      {
        id: 'card-2',
        name: 'Саидов Фирӯз',
        surname: 'Ҷамшедович',
        group: '2-790106',
        studentId: '2-790107',
        specialty: 'Кори табобатӣ',
        front: {
          ...defaultFront,
          elements: defaultFront.elements.map((el) => {
            if (el.id === 'student-first-name') return { ...el, text: 'Саидов Фирӯз' };
            if (el.id === 'student-surname') return { ...el, text: 'Ҷамшедович' };
            if (el.id === 'label-specialty') return { ...el, text: 'Ихтисос:  Кори табобатӣ' };
            return el;
          }),
        },
        back: {
          ...defaultBack,
          elements: defaultBack.elements.map((el) => {
            if (el.id === 'moodle-login-val') return { ...el, text: 'gr26112' };
            return el;
          }),
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
    });

    // Property Inspector (Right Sidebar)
    this.propertyInspector = new PropertyInspector({
      container: this.rootEl.querySelector('#properties-mount'),
      onAddElement: (elemData) => this.handleAddElement(elemData),
      onUpdateElement: (obj, props) => this.handleUpdateElement(obj, props),
      onDeleteElement: (obj) => this.handleDeleteElement(obj),
      onReorderElement: (obj, dir) => this.handleReorderElement(obj, dir),
      onAlignElement: (obj, alignType) => this.handleAlignElement(obj, alignType),
      onDuplicateElement: (obj) => this.handleDuplicateElement(obj),
      onUploadImage: (dataUrl, targetObj) => {
        this.photoEditorModal.open(dataUrl, targetObj);
      },
      onEditPhoto: (targetObj) => {
        const src = targetObj.getSrc ? targetObj.getSrc() : targetObj._element?.src;
        if (src) {
          this.photoEditorModal.open(src, targetObj);
        }
      },
      onUpdateBadgeSettings: (settings) => this.handleUpdateBadgeSettings(settings),
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

  async loadCardIntoEditor(id) {
    const card = this.cards.find((c) => c.id === id);
    if (!card) return;
    await this.badgeEditor.loadCardData(card);
    this.propertyInspector.setSelectedObject(null, this.badgeEditor.canvasManager.activeSide);
  }

  syncCurrentCardToMemory() {
    const card = this.cards.find((c) => c.id === this.currentCardId);
    if (!card) return;

    const data = this.badgeEditor.getCurrentCardData();
    card.front = data.front;
    card.back = data.back;
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

  async handleApplyCroppedPhoto(resultDataUrl, targetObj) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    const imgObj = await ElementFactory.createImageFromUrl(resultDataUrl, {
      left: targetObj ? targetObj.left : 60,
      top: targetObj ? targetObj.top : 100,
      maxWidth: targetObj ? targetObj.getScaledWidth() : 180,
      maxHeight: targetObj ? targetObj.getScaledHeight() : 230,
      name: 'Фото студента',
    });

    if (imgObj) {
      if (targetObj) {
        canvas.remove(targetObj);
      }
      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
      canvas.renderAll();
      this.propertyInspector.setSelectedObject(imgObj, this.badgeEditor.canvasManager.activeSide);
      this.handleCanvasModified();
    }
  }

  async handleUploadImage(dataUrl, targetObj) {
    this.photoEditorModal.open(dataUrl, targetObj);
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
      this.scheduleAutoSave();
    }
  }

  scheduleAutoSave() {
    this.syncCurrentCardToMemory();
    this.autoSaveManager.schedule({
      id: 'current-project',
      version: '2.0',
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
    return slots
      .map((slot) => {
        const card = this.cards[slot.cardIndex];
        if (!card) return '';

        const isFront = side === 'front';
        const studentName = card.name || `Студент #${slot.cardIndex + 1}`;
        const studentGroup = card.group || 'П-302';
        const studentId = card.studentId || `ID-2026-${String(slot.cardIndex + 1).padStart(4, '0')}`;
        const login = `${studentName.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '.')}.stud@kt.tj`;

        if (isFront) {
          return `
            <div class="print-badge-item" style="position: absolute; left: ${slot.leftMm}mm; top: ${slot.topMm}mm; width: ${slot.widthMm}mm; height: ${slot.heightMm}mm; border: 0.2mm solid #CBD5E1; background: #FFFFFF; box-sizing: border-box; overflow: hidden; font-family: 'Inter', sans-serif;">
              <!-- Header with Emblems -->
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5mm 2.5mm 1mm 2.5mm; border-bottom: 0.2mm solid #E2E8F0;">
                <img src="/assets/gerb-tajikistan-clean.png" style="width: 7.5mm; height: 7.5mm; object-fit: contain;" />
                <div style="text-align: center; flex: 1; padding: 0 1.5mm;">
                  <div style="font-size: 5.2pt; font-weight: bold; color: #1E293B; line-height: 1.15;">КОЛЛЕҶИ ТИББИИ ДОНИШГОҲИ ДАВЛАТИИ</div>
                  <div style="font-size: 5pt; font-weight: bold; color: #1E293B; line-height: 1.15;">ТИББИИ ХАТЛОН ДАР НОҲИЯИ ТЕМУРМАЛИК</div>
                </div>
                <img src="/assets/medical-emblem-clean.png" style="width: 7mm; height: 7mm; object-fit: contain;" />
              </div>

              <!-- Main badge body -->
              <div style="display: flex; gap: 2.5mm; padding: 2mm 2.5mm 1mm 2.5mm; box-sizing: border-box;">
                <!-- Student Photo Box -->
                <div style="width: 22mm; height: 28mm; border: 0.25mm solid #334155; border-radius: 0.5mm; overflow: hidden; flex-shrink: 0; background: #F8FAFC;">
                  <img src="/assets/student-nigina.jpg" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>

                <!-- Student Information -->
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
                  <!-- ID Pill -->
                  <div style="display: inline-block; background-color: #ECFEFF; border: 0.2mm solid #A5F3FC; border-radius: 1mm; padding: 0.5mm 2mm; width: fit-content;">
                    <span style="font-size: 6pt; font-weight: bold; color: #0E7490; font-family: monospace;">ID: 2-790106</span>
                  </div>

                  <div style="margin: 0.5mm 0;">
                    <div style="font-size: 5pt; font-weight: bold; color: #64748B;">НОМУ НАСАБ:</div>
                    <div style="font-size: 7.8pt; font-weight: 800; color: #0F172A; line-height: 1.1;">${studentName}</div>
                    <div style="font-size: 6.5pt; font-weight: bold; color: #334155;">${card.surname || 'Маҳмадсаидзода'}</div>
                  </div>

                  <div style="font-size: 5.5pt; color: #334155; line-height: 1.25;">
                    <div><strong>Ихтисос:</strong> Кори ҳамширагӣ</div>
                    <div><strong>Соли таҳсил:</strong> 2024–2028</div>
                  </div>
                </div>
              </div>

              <!-- Footer with Director -->
              <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 7mm; background: #F8FAFC; border-top: 0.2mm solid #E2E8F0; display: flex; align-items: center; justify-content: center; gap: 3mm; font-size: 5.5pt; color: #334155;">
                <span><strong>Директор:</strong></span>
                <span style="font-family: 'Times New Roman', serif; font-style: italic; font-weight: bold; font-size: 7pt; color: #1D4ED8;">Сафарзода</span>
                <span><strong>Сафарзода З.И.</strong></span>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="print-badge-item" style="position: absolute; left: ${slot.leftMm}mm; top: ${slot.topMm}mm; width: ${slot.widthMm}mm; height: ${slot.heightMm}mm; border: 0.2mm solid #CBD5E1; background: #FFFFFF; box-sizing: border-box; overflow: hidden; font-family: 'Inter', sans-serif;">
              <!-- Header with Validity -->
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.2mm 2.5mm; border-bottom: 0.2mm solid #E2E8F0;">
                <span style="font-size: 5.5pt; font-weight: bold; color: #0F172A;">ҚОИДАҲОИ ИСТИФОДАИ ШАҲОДАТНОМА</span>
                <span style="font-size: 4.8pt; font-weight: bold; color: #065F46; background: #ECFDF5; border: 0.2mm solid #A7F3D0; padding: 0.3mm 1mm; border-radius: 0.5mm;">ЭЪТИБОР: 2024–2028</span>
              </div>

              <!-- Regulations -->
              <div style="padding: 1mm 2.5mm; font-size: 4.8pt; color: #334155; line-height: 1.25;">
                <div>1. Шаҳодатнома ҳуҷҷати расмии донишҷӯ буда, ба дигарон додан манъ аст.</div>
                <div>2. Дар ҳолати гум кардан ба маъмурияти коллеҷ хабар диҳед.</div>
                <div>3. Ҳангоми ворид шудан ба маркази тестӣ пешниҳод карда мешавад.</div>
              </div>

              <!-- Moodle Box -->
              <div style="margin: 0.5mm 2.5mm; background: #F8FAFC; border: 0.2mm solid #CBD5E1; border-radius: 1mm; padding: 1mm 1.5mm;">
                <div style="font-size: 4.6pt; font-weight: bold; color: #0F172A; margin-bottom: 0.5mm;">МАЪЛУМОТИ ВОРИДШАВӢ БА СИСТЕМАИ ТЕСТӢ (MOODLE)</div>
                <div style="display: flex; gap: 2mm; font-size: 5.2pt;">
                  <span style="background: #FFFFFF; border: 0.2mm solid #E2E8F0; padding: 0.5mm 1.5mm; border-radius: 0.5mm;">Логин: <strong style="color: #0E7490; font-family: monospace;">gr26111</strong></span>
                  <span style="background: #FFFFFF; border: 0.2mm solid #E2E8F0; padding: 0.5mm 1.5mm; border-radius: 0.5mm;">Парол: <strong style="color: #0F172A; font-family: monospace;">Student1#</strong></span>
                </div>
              </div>

              <!-- Bottom Barcode & Address -->
              <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1.2mm 2.5mm; border-top: 0.2mm solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; background: #FFFFFF;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="width: 25mm; height: 5mm; background: #0F172A; border-radius: 0.5mm;"></div>
                  <span style="font-size: 4.5pt; font-family: monospace; font-weight: bold; margin-top: 0.3mm;">2-790106</span>
                </div>

                <div style="font-size: 4.6pt; color: #475569; text-align: right; line-height: 1.2;">
                  <span style="font-weight: bold; color: #0F172A;">Суроға:</span> вилояти Хатлон, ноҳияи Темурмалик,<br/>
                  ҷамоати деҳоти <strong>Кангурт</strong>
                </div>
              </div>
            </div>
          `;
        }
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
          version: '2.0',
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
