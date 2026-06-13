import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import type { CanvasElement } from '../types';
import { drawElement } from '../utils/renderer';

export const getElementsArray = (item: any): any[] => {
  if (!item) return [];
  if (Array.isArray(item)) return item;
  if (item.elements && Array.isArray(item.elements)) return item.elements;
  return [item];
};

interface LibraryShapePreviewProps {
  shapeGroup: any;
}

export const LibraryShapePreview: React.FC<LibraryShapePreviewProps> = React.memo(({ shapeGroup }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shapeGroup) return;

    const elementsArray = getElementsArray(shapeGroup);
    if (elementsArray.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const convertedGroup = elementsArray.map(el => {
      let points = undefined;
      if (el.points && Array.isArray(el.points)) {
        points = el.points.map((p: any) => {
          if (Array.isArray(p)) {
            return { x: p[0], y: p[1] };
          }
          return { x: p.x ?? 0, y: p.y ?? 0 };
        });
      }

      let opacity = 1.0;
      if (el.opacity !== undefined) {
        opacity = el.opacity > 1 ? el.opacity / 100 : el.opacity;
      }

      return {
        id: el.id || Math.random().toString(36).substring(2, 9),
        type: el.type || 'rectangle',
        x: el.x ?? 0,
        y: el.y ?? 0,
        width: el.width ?? 100,
        height: el.height ?? 100,
        strokeColor: el.strokeColor || '#ffffff',
        fillColor: el.fillColor || (el.backgroundColor === 'transparent' ? 'transparent' : el.backgroundColor) || 'transparent',
        fillStyle: el.fillStyle || 'hachure',
        strokeWidth: el.strokeWidth ?? 1.5,
        strokeStyle: el.strokeStyle || 'solid',
        opacity: opacity,
        points,
        text: el.text || '',
        version: el.version || 1,
        updatedAt: el.updatedAt || Date.now()
      } as CanvasElement;
    });

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    convertedGroup.forEach(el => {
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x + el.width;
      const y2 = el.y + el.height;

      minX = Math.min(minX, x1, x2);
      minY = Math.min(minY, y1, y2);
      maxX = Math.max(maxX, x1, x2);
      maxY = Math.max(maxY, y1, y2);
    });

    const w = maxX - minX;
    const h = maxY - minY;

    if (w <= 0 || h <= 0) return;

    const targetSize = 64;
    const scale = Math.min(targetSize / w, targetSize / h);
    const dx = 8 - minX * scale + (targetSize - w * scale) / 2;
    const dy = 8 - minY * scale + (targetSize - h * scale) / 2;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(scale, scale);

    const rc = rough.canvas(canvas);
    convertedGroup.forEach(el => {
      const prevStroke = el.strokeColor;
      if (el.strokeColor === '#000000' || el.strokeColor === 'black' || el.strokeColor === '#121212') {
        el.strokeColor = '#e5e7eb';
      }
      drawElement(rc, ctx, el);
      el.strokeColor = prevStroke;
    });

    ctx.restore();
  }, [shapeGroup]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={80}
      style={{
        display: 'block',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none'
      }}
    />
  );
});

LibraryShapePreview.displayName = 'LibraryShapePreview';
