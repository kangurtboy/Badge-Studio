import { Rect, Circle, Line, IText, FabricImage } from 'fabric';

export class ElementFactory {
  static createText({
    text = 'Матн / Текст',
    fontSize = 16,
    fontFamily = 'Inter',
    fontWeight = 'normal',
    fill = '#0F172A',
    left = 50,
    top = 50,
    name = 'Текстовый блок',
  } = {}) {
    return new IText(text, {
      id: `text-${Date.now()}`,
      name,
      left,
      top,
      fontSize,
      fontFamily,
      fontWeight,
      fill,
      lineHeight: 1.2,
      editable: true,
      cornerColor: '#3B82F6',
      cornerStrokeColor: '#FFFFFF',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      padding: 4,
    });
  }

  static createRect({
    left = 50,
    top = 50,
    width = 160,
    height = 90,
    fill = '#3B82F6',
    stroke = null,
    strokeWidth = 0,
    rx = 8,
    ry = 8,
    name = 'Прямоугольник',
  } = {}) {
    return new Rect({
      id: `rect-${Date.now()}`,
      name,
      left,
      top,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      rx,
      ry,
      cornerColor: '#3B82F6',
      cornerStrokeColor: '#FFFFFF',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      padding: 4,
    });
  }

  static createCircle({
    left = 50,
    top = 50,
    radius = 35,
    fill = '#3B82F6',
    stroke = null,
    strokeWidth = 0,
    name = 'Круг',
  } = {}) {
    return new Circle({
      id: `circle-${Date.now()}`,
      name,
      left,
      top,
      radius,
      fill,
      stroke,
      strokeWidth,
      cornerColor: '#3B82F6',
      cornerStrokeColor: '#FFFFFF',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      padding: 4,
    });
  }

  static createLine({
    left = 50,
    top = 50,
    length = 200,
    stroke = '#CBD5E1',
    strokeWidth = 2,
    name = 'Линия-разделитель',
  } = {}) {
    return new Line([left, top, left + length, top], {
      id: `line-${Date.now()}`,
      name,
      stroke,
      strokeWidth,
      cornerColor: '#3B82F6',
      cornerStrokeColor: '#FFFFFF',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      padding: 4,
    });
  }

  static async createImageFromUrl(url, { left = 50, top = 50, maxWidth = 190, maxHeight = 240, name = 'Фотография' } = {}) {
    try {
      const img = await FabricImage.fromURL(url);
      
      // Calculate aspect ratio scale to fit inside maxWidth x maxHeight
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const scale = Math.min(scaleX, scaleY, 1);

      img.set({
        id: `img-${Date.now()}`,
        name,
        left,
        top,
        scaleX: scale,
        scaleY: scale,
        cornerColor: '#3B82F6',
        cornerStrokeColor: '#FFFFFF',
        cornerStyle: 'circle',
        cornerSize: 8,
        transparentCorners: false,
        padding: 4,
      });

      return img;
    } catch (e) {
      console.error('Failed to load image from URL:', e);
      return null;
    }
  }
}
