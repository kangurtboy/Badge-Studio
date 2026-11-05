// Guidelines and Snap-to-Center / Snap-to-Objects for Badge Canvas

export class AlignmentGuidelines {
  constructor(canvas) {
    this.canvas = canvas;
    this.snapThreshold = 6; // pixels distance to snap
    this.activeGuides = [];
    this.init();
  }

  init() {
    this.canvas.on('object:moving', (e) => this.handleObjectMoving(e));
    this.canvas.on('before:render', () => this.clearGuidelines());
    this.canvas.on('after:render', () => this.drawGuidelines());
    this.canvas.on('mouse:up', () => this.clearGuidelinesAndRender());
  }

  handleObjectMoving(e) {
    const target = e.target;
    if (!target) return;

    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    const targetCenter = target.getCenterPoint();
    const targetHalfWidth = (target.getScaledWidth()) / 2;
    const targetHalfHeight = (target.getScaledHeight()) / 2;

    this.activeGuides = [];

    // Center X of canvas
    const canvasCenterX = canvasWidth / 2;
    if (Math.abs(targetCenter.x - canvasCenterX) < this.snapThreshold) {
      target.setPositionByOrigin({ x: canvasCenterX, y: targetCenter.y }, 'center', 'center');
      this.activeGuides.push({ type: 'vertical', x: canvasCenterX });
    }

    // Center Y of canvas
    const canvasCenterY = canvasHeight / 2;
    if (Math.abs(targetCenter.y - canvasCenterY) < this.snapThreshold) {
      target.setPositionByOrigin({ x: targetCenter.x, y: canvasCenterY }, 'center', 'center');
      this.activeGuides.push({ type: 'horizontal', y: canvasCenterY });
    }

    // Left edge of canvas (with padding margin e.g. 20px)
    if (Math.abs(target.left - 24) < this.snapThreshold) {
      target.set({ left: 24 });
      this.activeGuides.push({ type: 'vertical', x: 24 });
    }

    // Right edge of canvas
    if (Math.abs(target.left + target.getScaledWidth() - (canvasWidth - 24)) < this.snapThreshold) {
      target.set({ left: canvasWidth - 24 - target.getScaledWidth() });
      this.activeGuides.push({ type: 'vertical', x: canvasWidth - 24 });
    }

    // Top edge of canvas
    if (Math.abs(target.top - 24) < this.snapThreshold) {
      target.set({ top: 24 });
      this.activeGuides.push({ type: 'horizontal', y: 24 });
    }
  }

  clearGuidelines() {
    // Guidelines are drawn on top of the context
  }

  clearGuidelinesAndRender() {
    if (this.activeGuides.length > 0) {
      this.activeGuides = [];
      this.canvas.requestRenderAll();
    }
  }

  drawGuidelines() {
    if (!this.activeGuides || this.activeGuides.length === 0) return;

    const ctx = this.canvas.getSelectionContext();
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = '#EF4444'; // Bright Red guide lines
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (const guide of this.activeGuides) {
      ctx.beginPath();
      if (guide.type === 'vertical') {
        ctx.moveTo(guide.x, 0);
        ctx.lineTo(guide.x, this.canvas.getHeight());
      } else if (guide.type === 'horizontal') {
        ctx.moveTo(0, guide.y);
        ctx.lineTo(this.canvas.getWidth(), guide.y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}
