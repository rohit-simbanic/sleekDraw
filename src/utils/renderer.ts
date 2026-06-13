import type { CanvasElement, AppState, PeerCursor, Point } from '../types';
import { getResizeHandles, getElementBounds } from './geometry';

// Helper to draw a single element using Rough.js or canvas native methods
export const drawElement = (rc: any, ctx: CanvasRenderingContext2D, el: CanvasElement) => {
  ctx.save();
  ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;

  // Build Rough.js options
  const options: any = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    roughness: el.type === 'pencil' ? 0.8 : 1.2,
    bowing: 1.0,
    seed: 42 // Seed to keep hand-drawn jitter consistent on redraws
  };

  // Dash styling
  if (el.strokeStyle === 'dashed') {
    options.strokeLineDash = [8 * el.strokeWidth, 6 * el.strokeWidth];
  } else if (el.strokeStyle === 'dotted') {
    options.strokeLineDash = [2 * el.strokeWidth, 4 * el.strokeWidth];
  }

  // Fill styling
  if (el.fillColor && el.fillColor !== 'transparent' && el.fillStyle !== 'none') {
    options.fill = el.fillColor;
    options.fillStyle = el.fillStyle; // 'solid' or 'hachure'
    if (el.fillStyle === 'hachure') {
      options.hachureAngle = 60;
      options.hachureGap = 5 + el.strokeWidth * 2;
    }
  }

  switch (el.type) {
    case 'rectangle':
      rc.rectangle(el.x, el.y, el.width, el.height, options);
      break;

    case 'ellipse':
      rc.ellipse(
        el.x + el.width / 2,
        el.y + el.height / 2,
        el.width,
        el.height,
        options
      );
      break;

    case 'line':
      if (el.points && el.points.length >= 2) {
        const absolutePoints = el.points.map(p => [el.x + p.x, el.y + p.y]);
        rc.linearPath(absolutePoints, options);
      }
      break;

    case 'arrow':
      if (el.points && el.points.length >= 2) {
        const absolutePoints = el.points.map(p => [el.x + p.x, el.y + p.y] as [number, number]);
        rc.linearPath(absolutePoints, options);

        // Draw arrowhead at the last point
        const pLast = el.points[el.points.length - 1];
        const pPrev = el.points[el.points.length - 2];
        const x2 = el.x + pLast.x;
        const y2 = el.y + pLast.y;
        const x1 = el.x + pPrev.x;
        const y1 = el.y + pPrev.y;

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 12 + el.strokeWidth * 2;

        const t1x = x2 - headLength * Math.cos(angle - Math.PI / 6);
        const t1y = y2 - headLength * Math.sin(angle - Math.PI / 6);
        const t2x = x2 - headLength * Math.cos(angle + Math.PI / 6);
        const t2y = y2 - headLength * Math.sin(angle + Math.PI / 6);

        // Draw arrow lines hand-drawn style
        rc.line(x2, y2, t1x, t1y, options);
        rc.line(x2, y2, t2x, t2y, options);
      }
      break;

    case 'pencil':
      if (el.points && el.points.length >= 2) {
        const absolutePoints = el.points.map(p => [el.x + p.x, el.y + p.y]);
        rc.linearPath(absolutePoints, {
          ...options,
          fill: undefined, // freehand stroke shouldn't fill
          roughness: 0.5
        });
      }
      break;

    case 'text':
      if (el.text) {
        ctx.font = `bold ${20}px Outfit, sans-serif`;
        ctx.fillStyle = el.strokeColor;
        ctx.textBaseline = 'top';
        
        // Wrap/draw lines of text
        const lines = el.text.split('\n');
        const lineHeight = 24;
        lines.forEach((line, index) => {
          ctx.fillText(line, el.x, el.y + index * lineHeight);
        });
      }
      break;
  }

  ctx.restore();
};

// Selection borders and resizing squares
export const drawSelectionOutline = (ctx: CanvasRenderingContext2D, el: CanvasElement, zoom: number) => {
  const { minX, maxX, minY, maxY } = getElementBounds(el);

  ctx.save();
  ctx.strokeStyle = '#6366f1'; // Beautiful Indigo outline
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([4 / zoom, 4 / zoom]);

  // Draw bounding rectangle
  ctx.strokeRect(minX - 4 / zoom, minY - 4 / zoom, (maxX - minX) + 8 / zoom, (maxY - minY) + 8 / zoom);

  // Draw handles (solid white squares with blue borders)
  const handles = getResizeHandles(el);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([]); // Solid border for handles

  const handleSize = 6 / zoom;

  handles.forEach(h => {
    ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
  });

  ctx.restore();
};

// Draw a peer's selection outline
export const drawPeerSelectionOutline = (
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  color: string,
  zoom: number
) => {
  const { minX, maxX, minY, maxY } = getElementBounds(el);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([3 / zoom, 3 / zoom]);
  ctx.strokeRect(minX - 4 / zoom, minY - 4 / zoom, (maxX - minX) + 8 / zoom, (maxY - minY) + 8 / zoom);
  ctx.restore();
};

// Selection drag-box for active client
export const drawSelectionBox = (ctx: CanvasRenderingContext2D, box: { start: Point; end: Point }) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'; // Indigo translucent
  ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
  ctx.lineWidth = 1;
  const x = Math.min(box.start.x, box.end.x);
  const y = Math.min(box.start.y, box.end.y);
  const w = Math.abs(box.start.x - box.end.x);
  const h = Math.abs(box.start.y - box.end.y);
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
};

// Peer Cursors + Labels
export const drawPeerCursor = (ctx: CanvasRenderingContext2D, peer: PeerCursor, zoom: number) => {
  ctx.save();
  ctx.fillStyle = peer.color;
  ctx.strokeStyle = peer.color;

  const cx = peer.x;
  const cy = peer.y;

  // Draw cursor pointer (small triangle)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 12 / zoom, cy + 12 / zoom);
  ctx.lineTo(cx + 4 / zoom, cy + 14 / zoom);
  ctx.closePath();
  ctx.fill();

  // Draw user label box
  ctx.font = `${10 / zoom}px Outfit, sans-serif`;
  const text = peer.username || 'Anonymous';
  const textWidth = ctx.measureText(text).width;
  const paddingX = 6 / zoom;
  const paddingY = 3 / zoom;
  const boxW = textWidth + paddingX * 2;
  const boxH = 16 / zoom;

  const bx = cx + 8 / zoom;
  const by = cy + 16 / zoom;

  // Background box
  ctx.fillRect(bx, by, boxW, boxH);

  // Label text
  ctx.fillStyle = '#ffffff'; // White text on colored label
  ctx.fillText(text, bx + paddingX, by + paddingY + (8 / zoom));

  ctx.restore();
};

// Redraw scene wrapper
export const drawScene = (
  canvas: HTMLCanvasElement,
  rc: any,
  elements: CanvasElement[],
  appState: AppState,
  peerCursors: PeerCursor[],
  selectionBox: { start: Point; end: Point } | null
) => {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dpr = window.devicePixelRatio || 1;

  ctx.save();
  // Scale logical coordinates by Device Pixel Ratio for crisp rendering on high-DPI displays
  ctx.scale(dpr, dpr);

  // Apply Zoom and Pan transforms
  ctx.translate(appState.pan.x, appState.pan.y);
  ctx.scale(appState.zoom, appState.zoom);

  // Calculate visible viewport boundaries in world space for culling
  const viewportMinX = -appState.pan.x / appState.zoom;
  const viewportMinY = -appState.pan.y / appState.zoom;
  const viewportMaxX = (canvas.width / dpr - appState.pan.x) / appState.zoom;
  const viewportMaxY = (canvas.height / dpr - appState.pan.y) / appState.zoom;

  // 1. Draw all elements
  elements.forEach(el => {
    if (el.isDeleted) return;

    // Viewport culling: only render elements that are inside the visible viewport bounds
    const { minX: elMinX, maxX: elMaxX, minY: elMinY, maxY: elMaxY } = getElementBounds(el);

    const isVisible = elMaxX >= viewportMinX &&
                      elMinX <= viewportMaxX &&
                      elMaxY >= viewportMinY &&
                      elMinY <= viewportMaxY;

    if (!isVisible) return;

    drawElement(rc, ctx, el);
  });

  // 2. Draw peer selection outlines
  peerCursors.forEach(peer => {
    Object.keys(peer.selectedElementIds).forEach(elId => {
      const el = elements.find(e => e.id === elId);
      if (el && !el.isDeleted) {
        drawPeerSelectionOutline(ctx, el, peer.color, appState.zoom);
      }
    });
  });

  // 3. Draw active client selection outlines
  elements.forEach(el => {
    if (el.isDeleted) return;
    if (appState.selectedElementIds[el.id]) {
      drawSelectionOutline(ctx, el, appState.zoom);
    }
  });

  // 4. Draw drag-selection box
  if (selectionBox) {
    drawSelectionBox(ctx, selectionBox);
  }

  // 5. Draw peer cursors
  peerCursors.forEach(peer => {
    drawPeerCursor(ctx, peer, appState.zoom);
  });

  ctx.restore();
};
