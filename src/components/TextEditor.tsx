import React from 'react';
import type { CanvasElement, Point } from '../types';

interface TextEditorProps {
  editingTextElement: CanvasElement | null;
  textValue: string;
  zoom: number;
  pan: Point;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = React.memo(({
  editingTextElement,
  textValue,
  zoom,
  pan,
  onChange,
  onBlur
}) => {
  if (!editingTextElement) return null;

  return (
    <textarea
      className="canvas-text-editor"
      style={{
        left: `${editingTextElement.x * zoom + pan.x}px`,
        top: `${editingTextElement.y * zoom + pan.y}px`,
        width: `${Math.max(200, editingTextElement.width) * zoom}px`,
        height: `${Math.max(40, editingTextElement.height) * zoom}px`,
        color: editingTextElement.strokeColor,
        fontSize: `${20 * zoom}px`,
        lineHeight: `${24 * zoom}px`,
        zIndex: 100,
        transform: `scale(1)`,
        transformOrigin: 'top left'
      }}
      value={textValue}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={e => {
        if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
          onBlur();
        }
      }}
      autoFocus
    />
  );
});

TextEditor.displayName = 'TextEditor';
