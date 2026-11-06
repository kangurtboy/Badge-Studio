import { Header } from './components/Header/Header.js';
import { Sidebar } from './components/Sidebar/Sidebar.js';
import { A4Editor } from './components/A4Editor/A4Editor.js';
import { SettingsModal } from './components/Settings/SettingsModal.js';
import { PhotoEditorModal } from './components/PhotoEditor/PhotoEditorModal.js';

import { BADGE_TEMPLATES } from './templates/templates.js';
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
    this.cards = [];
    this.currentCardId = null;
    this.activeTemplateId = 'temurmalik';

    this.settings = {
      animationEnabled: true,
    };

    // Minimal undo/redo history stack
    this.historyStack = [];
    this.redoStack = [];

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

    // Load project from IndexedDB or default to Stitch template
    try {
      await openDB();
      const savedProject = await loadProject('current-project');
      if (savedProject && savedProject.version === '9.0-minimal' && Array.isArray(savedProject.cards) && savedProject.cards.length > 0) {
        this.cards = savedProject.cards;
        this.currentCardId = savedProject.currentCardId || this.cards[0].id;
        this.activeTemplateId = savedProject.activeTemplateId || 'temurmalik';
      } else {
        this.loadSampleData();
      }
    } catch (e) {
      console.warn('Using fresh sample data:', e);
      this.loadSampleData();
    }

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.a4Editor.setCards(this.cards, this.currentCardId);

    // Initial autosave
    await this.autoSaveManager.saveNow({
      id: 'current-project',
      version: '9.0-minimal',
      cards: this.cards,
      currentCardId: this.currentCardId,
      activeTemplateId: this.activeTemplateId,
      settings: this.settings,
    });

    this.pushHistory();
    initIcons(this.rootEl);
  }

  loadSampleData() {
    const tmpl = BADGE_TEMPLATES[this.activeTemplateId] || BADGE_TEMPLATES.temurmalik;
    const baseData = { ...tmpl.defaultData };

    this.cards = [
      {
        id: 'card-1',
        name: 'Раҳимова Нигина Рустамовна',
        studentId: '2-790106',
        photoSrc: '/assets/student-nigina.jpg',
        data: { ...baseData },
      },
      {
        id: 'card-2',
        name: 'Саидов Фирӯз Ҷамшедович',
        studentId: '2-790107',
        photoSrc: '/assets/student-nigina.jpg',
        data: {
          ...baseData,
          idNumber: '2-790107',
          nameLine1: 'САИДОВ',
          nameLine2: 'ФИРӮЗ ҶАМШЕДОВИЧ',
          specialty: 'кори табобатӣ',
          barcodeNumber: '2-790107',
          moodleLogin: 'gr26112',
        },
      },
      {
        id: 'card-3',
        name: 'Каримова Мадина Рустамовна',
        studentId: '2-790108',
        photoSrc: '/assets/student-nigina.jpg',
        data: {
          ...baseData,
          idNumber: '2-790108',
          nameLine1: 'КАРИМОВА',
          nameLine2: 'МАДИНА РУСТАМОВНА',
          specialty: 'кори момодоягӣ',
          barcodeNumber: '2-790108',
          moodleLogin: 'gr26113',
        },
      },
    ];

    this.currentCardId = 'card-1';
  }

  renderLayout() {
    this.rootEl.innerHTML = `
      <div id="header-mount"></div>
      <main class="app-workspace" style="flex: 1; display: flex; overflow: hidden; position: relative;">
        <!-- Left Sidebar: Student list + active profile form -->
        <div id="sidebar-mount"></div>

        <!-- Center Workspace: Realistic A4 sheet simulation -->
        <div id="a4-workspace-mount" style="flex: 1; display: flex; overflow: hidden; position: relative;"></div>
      </main>

      <!-- Modals -->
      <div id="photo-editor-mount"></div>
      <div id="settings-mount"></div>

      <!-- Hidden Print Container -->
      <div id="print-container"></div>
    `;
  }

  initComponents() {
    // 1. Header
    this.header = new Header({
      container: this.rootEl.querySelector('#header-mount'),
      onTemplateChange: (templateId) => this.switchTemplate(templateId),
      onPrintFront: () => this.executePrint('front-only'),
      onPrintBack: () => this.executePrint('back-only'),
      onPrintBoth: () => this.executePrint('both'),
      onUndo: () => this.handleUndo(),
      onRedo: () => this.handleRedo(),
      onOpenSettings: () => this.settingsModal.open(),
    });

    // 2. Sidebar (Left panel)
    this.sidebar = new Sidebar({
      container: this.rootEl.querySelector('#sidebar-mount'),
      onSelectCard: (id) => this.selectCard(id),
      onAddCard: () => this.addNewCard(),
      onDuplicateCard: (id) => this.duplicateCard(id),
      onDeleteCard: (id) => this.deleteCard(id),
      onUpdateField: (field, value) => this.updateCardField(field, value),
      onEditPhoto: (src) => this.photoEditorModal.open(src, null),
    });

    // 3. A4 Sheet Workspace (Primary Desktop Workspace)
    this.a4Editor = new A4Editor({
      container: this.rootEl.querySelector('#a4-workspace-mount'),
      onCardSelect: (id) => this.selectCard(id),
      onPhotoClick: (src) => this.photoEditorModal.open(src, null),
      onUpdateField: (field, value) => this.updateCardField(field, value),
      onFlipAll: () => {},
    });

    // 4. Photo Editor Modal
    this.photoEditorModal = new PhotoEditorModal({
      container: this.rootEl.querySelector('#photo-editor-mount'),
      onApplyPhoto: (resultDataUrl) => {
        this.updateCardPhoto(resultDataUrl);
      },
    });

    // 5. Settings Modal (Backup/Restore)
    this.settingsModal = new SettingsModal({
      container: this.rootEl.querySelector('#settings-mount'),
      onSaveSettings: () => {},
      onExportBackup: () => {
        RecoveryManager.exportProject({
          cards: this.cards,
          currentCardId: this.currentCardId,
          activeTemplateId: this.activeTemplateId,
        });
      },
      onImportBackup: async (importedProject) => {
        if (importedProject && Array.isArray(importedProject.cards)) {
          this.cards = importedProject.cards;
          this.currentCardId = importedProject.currentCardId || this.cards[0]?.id;
          if (importedProject.activeTemplateId) {
            this.activeTemplateId = importedProject.activeTemplateId;
          }
          this.sidebar.setCards(this.cards, this.currentCardId);
          this.a4Editor.setCards(this.cards, this.currentCardId);
          this.saveState();
        }
      },
      onResetProject: () => {
        this.loadSampleData();
        this.sidebar.setCards(this.cards, this.currentCardId);
        this.a4Editor.setCards(this.cards, this.currentCardId);
        this.saveState();
      },
    });
  }

  selectCard(id) {
    this.currentCardId = id;
    this.sidebar.setCards(this.cards, id);
    this.a4Editor.setCards(this.cards, id);
  }

  addNewCard() {
    const count = this.cards.length + 1;
    const tmpl = BADGE_TEMPLATES[this.activeTemplateId] || BADGE_TEMPLATES.temurmalik;
    const baseData = { ...tmpl.defaultData };

    const newCard = {
      id: `card-${Date.now()}`,
      name: `Студент #${count}`,
      studentId: `2-79010${count}`,
      photoSrc: '/assets/student-nigina.jpg',
      data: {
        ...baseData,
        idNumber: `2-79010${count}`,
        nameLine1: `ДОНИШҶӮ #${count}`,
        nameLine2: 'ФАМИЛИЯ ИМЯ',
        barcodeNumber: `2-79010${count}`,
        moodleLogin: `gr2611${count}`,
      },
    };

    this.cards.push(newCard);
    this.selectCard(newCard.id);
    this.saveState();
  }

  duplicateCard(id) {
    const source = this.cards.find((c) => c.id === id);
    if (!source) return;

    const copy = JSON.parse(JSON.stringify(source));
    copy.id = `card-${Date.now()}`;
    copy.name = `${copy.name} (копия)`;

    this.cards.push(copy);
    this.selectCard(copy.id);
    this.saveState();
  }

  deleteCard(id) {
    if (this.cards.length <= 1) {
      alert('Нельзя удалить последнюю карточку.');
      return;
    }

    this.cards = this.cards.filter((c) => c.id !== id);
    if (this.currentCardId === id) {
      this.currentCardId = this.cards[0].id;
    }

    this.selectCard(this.currentCardId);
    this.saveState();
  }

  updateCardField(field, value) {
    const card = this.cards.find((c) => c.id === this.currentCardId);
    if (!card) return;

    if (!card.data) card.data = {};
    card.data[field] = value;

    if (field === 'idNumber') {
      card.studentId = value;
      card.data.barcodeNumber = value;
    }
    if (field === 'nameLine1' || field === 'nameLine2') {
      card.name = `${card.data.nameLine1 || ''} ${card.data.nameLine2 || ''}`.trim();
    }

    // Instantly refresh A4 sheet and sidebar
    this.a4Editor.setCards(this.cards, this.currentCardId);
    this.saveState();
  }

  updateCardPhoto(resultDataUrl) {
    const card = this.cards.find((c) => c.id === this.currentCardId);
    if (!card) return;

    card.photoSrc = resultDataUrl;
    if (!card.data) card.data = {};
    card.data.photoSrc = resultDataUrl;

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.a4Editor.setCards(this.cards, this.currentCardId);
    this.saveState();
  }

  switchTemplate(templateId) {
    this.activeTemplateId = templateId;
    const tmpl = BADGE_TEMPLATES[templateId];
    if (!tmpl) return;

    this.cards.forEach((card) => {
      card.data = {
        ...card.data,
        templateId: templateId,
        title1: tmpl.defaultData.title1,
        title2: tmpl.defaultData.title2,
        title3: tmpl.defaultData.title3,
        directorName: tmpl.defaultData.directorName,
        addressDistrict: tmpl.defaultData.addressDistrict,
        addressVillage: tmpl.defaultData.addressVillage,
        bloodGroup: tmpl.defaultData.bloodGroup,
        contactPhone: tmpl.defaultData.contactPhone,
      };
    });

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.a4Editor.setCards(this.cards, this.currentCardId);
    this.saveState();
  }

  pushHistory() {
    this.historyStack.push(JSON.stringify({
      cards: this.cards,
      currentCardId: this.currentCardId,
    }));
    if (this.historyStack.length > 30) this.historyStack.shift();
    this.redoStack = [];
    this.updateHistoryButtons();
  }

  handleUndo() {
    if (this.historyStack.length <= 1) return;
    const current = this.historyStack.pop();
    this.redoStack.push(current);

    const prev = JSON.parse(this.historyStack[this.historyStack.length - 1]);
    this.cards = prev.cards;
    this.currentCardId = prev.currentCardId;

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.a4Editor.setCards(this.cards, this.currentCardId);
    this.updateHistoryButtons();
  }

  handleRedo() {
    if (this.redoStack.length === 0) return;
    const nextState = this.redoStack.pop();
    this.historyStack.push(nextState);

    const next = JSON.parse(nextState);
    this.cards = next.cards;
    this.currentCardId = next.currentCardId;

    this.sidebar.setCards(this.cards, this.currentCardId);
    this.a4Editor.setCards(this.cards, this.currentCardId);
    this.updateHistoryButtons();
  }

  updateHistoryButtons() {
    this.header?.updateHistoryStatus({
      canUndo: this.historyStack.length > 1,
      canRedo: this.redoStack.length > 0,
    });
  }

  saveState() {
    this.pushHistory();
    this.autoSaveManager.schedule({
      id: 'current-project',
      version: '9.0-minimal',
      cards: this.cards,
      currentCardId: this.currentCardId,
      activeTemplateId: this.activeTemplateId,
    });
  }

  executePrint(mode = 'both') {
    this.preparePrintDOM(mode);
    window.print();
  }

  preparePrintDOM(mode = 'both') {
    const printContainer = this.rootEl.querySelector('#print-container');
    if (!printContainer) return;

    const layoutEngine = new SheetLayoutEngine({
      cardWidthMm: 96,
      cardHeightMm: 67,
      marginTopMm: 12,
      marginBottomMm: 12,
      marginLeftMm: 8,
      marginRightMm: 8,
      gapXMm: 2,
      gapYMm: 3,
      columnMode: 'auto',
    });

    const { slots: frontSlots, grid } = layoutEngine.getSlotsForCards(this.cards.length, 0);
    // Mirrored slots for reverse side paper flip
    const backSlots = AlignmentEngine.getBackSheetSlots(frontSlots, grid, {
      flipEdge: 'long',
      offsetX: 0,
      offsetY: 0,
    });

    let pagesHtml = '';

    if (mode === 'front-only' || mode === 'both') {
      pagesHtml += `
        <div class="print-page" style="width: 210mm; height: 297mm; position: relative; background: #FFFFFF; box-sizing: border-box; overflow: hidden;">
          ${this.renderPrintSlots(frontSlots, 'front')}
          ${this.renderPrintCropMarks(frontSlots, layoutEngine)}
        </div>
      `;
    }

    if (mode === 'back-only' || mode === 'both') {
      pagesHtml += `
        <div class="print-page" style="width: 210mm; height: 297mm; position: relative; background: #FFFFFF; box-sizing: border-box; overflow: hidden;">
          ${this.renderPrintSlots(backSlots, 'back')}
          ${this.renderPrintCropMarks(backSlots, layoutEngine)}
        </div>
      `;
    }

    printContainer.innerHTML = pagesHtml;
  }

  renderPrintSlots(slots, side) {
    const scaleFactor = 96 / (480 * 0.2645833);

    return slots
      .map((slot) => {
        const card = this.cards[slot.cardIndex];
        if (!card) return '';

        const cardData = card.data || card;
        const renderedHtml = side === 'front'
          ? renderBadgeFrontHtml(cardData, { isEditable: false })
          : renderBadgeBackHtml(cardData, { isEditable: false });

        return `
          <div class="print-badge-item" style="position: absolute; left: ${slot.leftMm}mm; top: ${slot.topMm}mm; width: ${slot.widthMm}mm; height: ${slot.heightMm}mm; overflow: hidden; box-sizing: border-box; border-radius: 2mm;">
            <div style="width: 480px; height: 335px; transform: scale(${scaleFactor}); transform-origin: top left;">
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
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.photoEditorModal.open(event.target.result, null);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.handleUndo();
      }
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') || (e.ctrlKey && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        this.handleRedo();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        this.executePrint('both');
      }
    });
  }
}
