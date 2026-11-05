// Transformations, alignment, duplication and layer ordering

export class CanvasTransformations {
  static align(canvas, object, alignmentType) {
    if (!canvas || !object) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const objWidth = object.getScaledWidth();
    const objHeight = object.getScaledHeight();

    switch (alignmentType) {
      case 'left':
        object.set({ left: 20 });
        break;
      case 'centerH':
        object.set({ left: Math.round((canvasWidth - objWidth) / 2) });
        break;
      case 'right':
        object.set({ left: Math.round(canvasWidth - objWidth - 20) });
        break;
      case 'top':
        object.set({ top: 20 });
        break;
      case 'centerV':
        object.set({ top: Math.round((canvasHeight - objHeight) / 2) });
        break;
      case 'bottom':
        object.set({ top: Math.round(canvasHeight - objHeight - 20) });
        break;
    }

    object.setCoords();
    canvas.requestRenderAll();
  }

  static async cloneObject(canvas, object) {
    if (!canvas || !object) return null;

    try {
      const cloned = await object.clone();
      cloned.set({
        left: object.left + 15,
        top: object.top + 15,
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `${object.name || object.type} (копия)`,
      });

      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      return cloned;
    } catch (e) {
      console.error('Failed to clone object:', e);
      return null;
    }
  }

  static reorderLayer(canvas, object, action) {
    if (!canvas || !object) return;

    switch (action) {
      case 'bringToFront':
        canvas.bringObjectToFront(object);
        break;
      case 'bringForward':
        canvas.bringObjectForward(object);
        break;
      case 'sendBackwards':
        canvas.sendObjectBackwards(object);
        break;
      case 'sendToBack':
        canvas.sendObjectToBack(object);
        break;
    }

    canvas.requestRenderAll();
  }
}
