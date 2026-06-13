import type { CanvasElement, Point } from '../types';

export const distance = (a: Point, b: Point): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

// Calculate exact bounding coordinates for any element (including points-based elements)
export const getElementBounds = (el: CanvasElement): { minX: number; maxX: number; minY: number; maxY: number } => {
  if (el.bounds) {
    return el.bounds;
  }

  let bounds: { minX: number; maxX: number; minY: number; maxY: number };

  if ((el.type === 'pencil' || el.type === 'line' || el.type === 'arrow') && el.points && el.points.length > 0) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    el.points.forEach(p => {
      const px = el.x + p.x;
      const py = el.y + p.y;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    });
    bounds = { minX, maxX, minY, maxY };
  } else {
    const x1 = el.x;
    const y1 = el.y;
    const x2 = el.x + el.width;
    const y2 = el.y + el.height;
    bounds = {
      minX: Math.min(x1, x2),
      maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2),
      maxY: Math.max(y1, y2)
    };
  }

  el.bounds = bounds;
  return bounds;
};

// Find the distance from point P(x, y) to line segment A(x1, y1) -> B(x2, y2)
export const isPointNearLine = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  maxDistance = 8
): boolean => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  
  if (lenSq === 0) return distance({ x: px, y: py }, { x: x1, y: y1 }) < maxDistance;

  // Projection factor t
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t)); // Clamp to segment bounds

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  const dist = distance({ x: px, y: py }, { x: projX, y: projY });
  return dist < maxDistance;
};

// Hit-testing logic: is point (x, y) over an element
export const isPointOverElement = (x: number, y: number, el: CanvasElement): boolean => {
  const { minX, maxX, minY, maxY } = getElementBounds(el);

  const margin = 8;

  switch (el.type) {
    case 'rectangle':
    case 'text':
      if (el.fillColor !== 'transparent' && el.fillStyle !== 'none') {
        // Filled: click anywhere inside
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      } else {
        // Unfilled: click near borders
        const nearTop = isPointNearLine(x, y, minX, minY, maxX, minY, margin);
        const nearBottom = isPointNearLine(x, y, minX, maxY, maxX, maxY, margin);
        const nearLeft = isPointNearLine(x, y, minX, minY, minX, maxY, margin);
        const nearRight = isPointNearLine(x, y, maxX, minY, maxX, maxY, margin);
        return nearTop || nearBottom || nearLeft || nearRight;
      }

    case 'ellipse': {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const rx = Math.abs(el.width) / 2;
      const ry = Math.abs(el.height) / 2;
      
      if (rx === 0 || ry === 0) return false;

      // Normalized distance from center
      const val = ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2);
      
      if (el.fillColor !== 'transparent' && el.fillStyle !== 'none') {
        return val <= 1.05; // Inside ellipse (with small safety margin)
      } else {
        // Border boundary check
        return Math.abs(val - 1.0) < 0.15; // Close to edge
      }
    }

    case 'line':
    case 'arrow': {
      if (!el.points || el.points.length < 2) return false;
      // Coordinates of elements are local offsets from el.x, el.y
      for (let i = 0; i < el.points.length - 1; i++) {
        const p1 = el.points[i];
        const p2 = el.points[i + 1];
        const hit = isPointNearLine(
          x,
          y,
          el.x + p1.x,
          el.y + p1.y,
          el.x + p2.x,
          el.y + p2.y,
          margin
        );
        if (hit) return true;
      }
      return false;
    }

    case 'pencil': {
      if (!el.points) return false;
      for (let i = 0; i < el.points.length - 1; i++) {
        const p1 = el.points[i];
        const p2 = el.points[i + 1];
        const hit = isPointNearLine(
          x,
          y,
          el.x + p1.x,
          el.y + p1.y,
          el.x + p2.x,
          el.y + p2.y,
          margin + 2
        );
        if (hit) return true;
      }
      return false;
    }

    default:
      return false;
  }
};

// Get top-most element at user cursor position
export const getElementAtPosition = (
  x: number,
  y: number,
  elements: CanvasElement[]
): CanvasElement | null => {
  // Check in reverse order (top elements first)
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.isDeleted) continue;
    if (isPointOverElement(x, y, el)) {
      return el;
    }
  }
  return null;
};

// Check if element is completely inside selection bounding box
export const isElementInSelectionBox = (
  selX1: number,
  selY1: number,
  selX2: number,
  selY2: number,
  el: CanvasElement
): boolean => {
  const minSelX = Math.min(selX1, selX2);
  const maxSelX = Math.max(selX1, selX2);
  const minSelY = Math.min(selY1, selY2);
  const maxSelY = Math.max(selY1, selY2);

  // Compute bounding box of element
  const { minX: minElX, maxX: maxElX, minY: minElY, maxY: maxElY } = getElementBounds(el);

  return (
    minElX >= minSelX &&
    maxElX <= maxSelX &&
    minElY >= minSelY &&
    maxElY <= maxSelY
  );
};

// Retrieve list of resize handles for a selected element
export type ResizeHandle = 'TL' | 'TR' | 'BL' | 'BR' | 'T' | 'B' | 'L' | 'R';

export interface HandleInfo {
  name: ResizeHandle;
  x: number;
  y: number;
}

export const getResizeHandles = (el: CanvasElement): HandleInfo[] => {
  const x1 = el.x;
  const y1 = el.y;
  const x2 = el.x + el.width;
  const y2 = el.y + el.height;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const midX = minX + (maxX - minX) / 2;
  const midY = minY + (maxY - minY) / 2;

  // Return handles for shapes that support resizing
  if (el.type === 'pencil' || el.type === 'line') {
    // For freehand and simple lines, we don't draw bounding box handles in the same way,
    // but we can support standard corner handles for scaling.
    return [
      { name: 'TL', x: minX, y: minY },
      { name: 'TR', x: maxX, y: minY },
      { name: 'BL', x: minX, y: y2 },
      { name: 'BR', x: maxX, y: y2 }
    ];
  }

  return [
    { name: 'TL', x: minX, y: minY },
    { name: 'TR', x: maxX, y: minY },
    { name: 'BL', x: minX, y: maxY },
    { name: 'BR', x: maxX, y: maxY },
    { name: 'T', x: midX, y: minY },
    { name: 'B', x: midX, y: maxY },
    { name: 'L', x: minX, y: midY },
    { name: 'R', x: maxX, y: midY }
  ];
};

// Get the handle under (x, y) coordinate
export const getHandleAtPosition = (
  x: number,
  y: number,
  el: CanvasElement,
  zoom: number
): ResizeHandle | null => {
  const handles = getResizeHandles(el);
  const handleRadius = 6 / zoom; // Adjust hit area based on zoom

  for (const h of handles) {
    const dist = distance({ x, y }, { x: h.x, y: h.y });
    if (dist <= handleRadius + 4) {
      return h.name;
    }
  }
  return null;
};
