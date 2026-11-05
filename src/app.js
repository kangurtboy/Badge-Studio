import { Header } from './components/Header/Header.js';
import { Sidebar } from './components/Sidebar/Sidebar.js';
import { BadgeEditor } from './components/BadgeEditor/BadgeEditor.js';
import { PropertyInspector } from './components/PropertyInspector/PropertyInspector.js';
import { A4Editor } from './components/A4Editor/A4Editor.js';
import { PrintPreview } from './components/PrintPreview/PrintPreview.js';
import { SettingsModal } from './components/Settings/SettingsModal.js';

import { createDefaultFront } from './templates/defaultFront.js';
import { createDefaultBack } from './templates/defaultBack.js';
import { HistoryManager } from './editor/history.js';
import { AutoSaveManager } from './storage/autosave.js';
import { loadProject, openDB } from './storage/indexedDB.js';
import { initIcons } from './utils/icons.js';

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

    // Initialize IndexedDB and load last project or default
    try {
      await openDB();
      const savedProject = await loadProject('current-project');
      if (savedProject && savedProject.cards && savedProject.cards.length > 0) {
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
        name: 'Раҳимов Алишер Ҷамшедович',
        group: 'П-302',
        studentId: 'ID-2026-0847',
        front: defaultFront,
        back: defaultBack,
      },
      {
        id: 'card-2',
        name: 'Каримова Мадина Рустамовна',
        group: 'П-302',
        studentId: 'ID-2026-0848',
        front: {
          ...defaultFront,
          elements: defaultFront.elements.map((el) => {
            if (el.id === 'student-name') return { ...el, text: 'КАРИМОВА МАДИНА РУСТАМОВНА' };
            if (el.id === 'student-id-value') return { ...el, text: 'ID-2026-0848' };
            return el;
          }),
        },
        back: {
          ...defaultBack,
          elements: defaultBack.elements.map((el) => {
            if (el.id === 'login-value') return { ...el, text: 'madina.karimova@kt.tj' };
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
      onUpdateBadgeSettings: (settings) => this.handleUpdateBadgeSettings(settings),
    });

    // A4 Editor Mode
    this.a4Editor = new A4Editor({
      container: this.rootEl.querySelector('#a4-view-container'),
      onFlipAll: (flipped) => {
        // mass flip cards
      },
      onCardSelect: (id) => {
        this.selectCard(id);
        this.switchMode('editor');
      },
    });

    // Print Preview Mode
    this.printPreview = new PrintPreview({
      container: this.rootEl.querySelector('#print-view-container'),
      onExecutePrint: () => {
        window.print();
      },
      onTestPrint: () => {
        window.print();
      },
    });

    // Settings Modal
    this.settingsModal = new SettingsModal({
      container: this.rootEl.querySelector('#settings-mount'),
      onSaveSettings: (newSettings) => {
        this.settings = { ...this.settings, ...newSettings };
        this.badgeEditor.setAnimationEnabled(this.settings.animationEnabled);
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
      this.preparePrintDOM();
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
    const obj = this.badgeEditor.canvasManager.createFabricObject(data);
    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      this.propertyInspector.setSelectedObject(obj, this.badgeEditor.canvasManager.activeSide);
      this.handleCanvasModified();
    }
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

  handleReorderElement(obj, direction) {
    const canvas = this.badgeEditor.canvasManager.getActiveCanvas();
    if (direction === 'front') {
      canvas.bringObjectToFront(obj);
    } else {
      canvas.sendObjectToBack(obj);
    }
    canvas.renderAll();
    this.handleCanvasModified();
  }

  handleUpdateBadgeSettings(settings) {
    // updates width/height or bg
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
      cards: this.cards,
      currentCardId: this.currentCardId,
      settings: this.settings,
    });
  }

  preparePrintDOM() {
    const printContainer = this.rootEl.querySelector('#print-container');
    if (!printContainer) return;

    // Render print sheets for media print
    printContainer.innerHTML = `
      <div class="print-page">
        <div class="print-grid" style="display: grid; grid-template-columns: repeat(2, 90mm); gap: 10mm; padding: 15mm;">
          ${this.cards
            .map(
              (c) => `
            <div class="print-badge-item" style="width: 90mm; height: 55mm; border: 0.5px solid #E2E8F0; padding: 4mm;">
              <div style="font-weight: bold; font-size: 11pt;">${c.name}</div>
              <div style="font-size: 9pt; color: #475569;">${c.group} • ${c.studentId}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
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
          cards: this.cards,
          currentCardId: this.currentCardId,
          settings: this.settings,
        });
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

    // Window resize handler
    window.addEventListener('resize', () => {
      if (this.currentMode === 'editor') {
        this.badgeEditor.fitToViewport();
      }
    });
  }
}
