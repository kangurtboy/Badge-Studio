import { Canvas, Rect, Circle, IText, Line, FabricImage } from 'fabric';
import { AlignmentGuidelines } from './guidelines.js';
import { ElementFactory } from './elements.js';

export class BadgeCanvasManager {
  constructor({ frontCanvasEl, backCanvasEl, width = 720, height = 440, onSelect, onModify, onLiveUpdate }) {
    this.width = width;
    this.height = height;
    this.onSelect = onSelect || (() => {});
    this.onModify = onModify || (() => {});
    this.onLiveUpdate = onLiveUpdate || (() => {});

    // Common styling for controls
    const canvasConfig = {
      width: this.width,
      height: this.height,
      preserveObjectStacking: true,
      selectionColor: 'rgba(59, 130, 246, 0.12)',
      selectionBorderColor: '#3B82F6',
      selectionLineWidth: 1.5,
    };

    // Initialize Front Canvas
    this.frontCanvas = new Canvas(frontCanvasEl, {
      ...canvasConfig,
      backgroundColor: '#FFFFFF',
    });

    // Initialize Back Canvas
    this.backCanvas = new Canvas(backCanvasEl, {
      ...canvasConfig,
      backgroundColor: '#F8FAFC',
    });

    // Initialize alignment guidelines for both canvases
    this.frontGuides = new AlignmentGuidelines(this.frontCanvas);
    this.backGuides = new AlignmentGuidelines(this.backCanvas);

    this.activeSide = 'front'; // 'front' | 'back'
    this.setupEvents(this.frontCanvas, 'front');
    this.setupEvents(this.backCanvas, 'back');
  }

  getActiveCanvas() {
    return this.activeSide === 'front' ? this.frontCanvas : this.backCanvas;
  }

  setActiveSide(side) {
    this.activeSide = side;
    const canvas = this.getActiveCanvas();
    const activeObj = canvas.getActiveObject();
    this.onSelect(activeObj, side);
  }

  setupEvents(canvas, side) {
    const triggerSelection = () => {
      if (this.activeSide === side) {
        const activeObj = canvas.getActiveObject();
        this.onSelect(activeObj, side);
      }
    };

    canvas.on('selection:created', triggerSelection);
    canvas.on('selection:updated', triggerSelection);
    canvas.on('selection:cleared', () => {
      if (this.activeSide === side) {
        this.onSelect(null, side);
      }
    });

    // Live update coordinates while dragging, scaling, rotating
    const triggerLive = () => {
      if (this.activeSide === side) {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          this.onLiveUpdate(activeObj, side);
        }
      }
    };

    canvas.on('object:moving', triggerLive);
    canvas.on('object:scaling', triggerLive);
    canvas.on('object:rotating', triggerLive);

    const triggerModify = () => {
      this.onModify(side);
    };

    canvas.on('object:modified', triggerModify);
    canvas.on('object:added', triggerModify);
    canvas.on('object:removed', triggerModify);
  }

  async loadTemplate(canvas, templateData) {
    canvas.clear();
    canvas.backgroundColor = templateData.background || '#FFFFFF';

    if (Array.isArray(templateData.elements)) {
      for (const item of templateData.elements) {
        const obj = await this.createFabricObject(item);
        if (obj) {
          canvas.add(obj);
        }
      }
    }

    canvas.renderAll();
  }

  async createFabricObject(data) {
    let obj = null;
    const commonProps = {
      id: data.id || `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name || data.type,
      left: data.left || 0,
      top: data.top || 0,
      angle: data.angle || 0,
      opacity: data.opacity !== undefined ? data.opacity : 1,
      selectable: data.selectable !== false,
      hasControls: data.selectable !== false,
      cornerColor: '#3B82F6',
      cornerStrokeColor: '#FFFFFF',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      padding: 4,
    };

    switch (data.type) {
      case 'rect':
        obj = new Rect({
          ...commonProps,
          width: data.width || 100,
          height: data.height || 60,
          fill: data.fill || '#3B82F6',
          stroke: data.stroke || null,
          strokeWidth: data.strokeWidth || 0,
          rx: data.rx || 0,
          ry: data.ry || 0,
        });
        break;

      case 'circle':
        obj = new Circle({
          ...commonProps,
          radius: data.radius || 30,
          fill: data.fill || '#3B82F6',
          stroke: data.stroke || null,
          strokeWidth: data.strokeWidth || 0,
        });
        break;

      case 'line':
        obj = new Line([data.x1 || 0, data.y1 || 0, data.x2 || 100, data.y2 || 0], {
          ...commonProps,
          stroke: data.stroke || '#CBD5E1',
          strokeWidth: data.strokeWidth || 2,
        });
        break;

      case 'text':
      case 'i-text':
        obj = new IText(data.text || 'Текст / Матн', {
          ...commonProps,
          fontSize: data.fontSize || 16,
          fontFamily: data.fontFamily || 'Inter',
          fontWeight: data.fontWeight || 'normal',
          fontStyle: data.fontStyle || 'normal',
          fill: data.fill || '#0F172A',
          textAlign: data.textAlign || 'left',
          lineHeight: data.lineHeight || 1.2,
        });
        break;

      case 'image':
        if (data.src) {
          obj = await ElementFactory.createImageFromUrl(data.src, {
            left: data.left,
            top: data.top,
            maxWidth: data.width || 190,
            maxHeight: data.height || 240,
            rx: data.rx || 0,
            ry: data.ry || 0,
            name: data.name || 'Фотография',
          });
        }
        break;

      default:
        console.warn('Unknown element type:', data.type);
    }

    return obj;
  }

  exportData(canvas) {
    return {
      background: canvas.backgroundColor,
      elements: canvas.getObjects().map((obj) => this.serializeObject(obj)),
    };
  }

  serializeObject(obj) {
    const base = {
      id: obj.id,
      name: obj.name,
      type: obj.type,
      left: Math.round(obj.left),
      top: Math.round(obj.top),
      width: Math.round(obj.width * (obj.scaleX || 1)),
      height: Math.round(obj.height * (obj.scaleY || 1)),
      angle: Math.round(obj.angle),
      opacity: obj.opacity,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
    };

    if (obj.type === 'text' || obj.type === 'i-text') {
      base.type = 'text';
      base.text = obj.text;
      base.fontSize = Math.round(obj.fontSize * (obj.scaleY || 1));
      base.fontFamily = obj.fontFamily;
      base.fontWeight = obj.fontWeight;
      base.fontStyle = obj.fontStyle;
      base.textAlign = obj.textAlign;
      base.lineHeight = obj.lineHeight;
    } else if (obj.type === 'rect') {
      base.rx = obj.rx;
      base.ry = obj.ry;
    } else if (obj.type === 'circle') {
      base.radius = Math.round(obj.radius * (obj.scaleX || 1));
    } else if (obj.type === 'image') {
      base.type = 'image';
      base.src = obj.getSrc ? obj.getSrc() : obj._element?.src;
    }

    return base;
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.frontCanvas.setDimensions({ width, height });
    this.backCanvas.setDimensions({ width, height });
    this.frontCanvas.renderAll();
    this.backCanvas.renderAll();
  }

  renderAll() {
    this.frontCanvas.renderAll();
    this.backCanvas.renderAll();
  }
}
