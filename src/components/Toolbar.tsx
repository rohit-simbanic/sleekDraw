import React from 'react';
import {
  MousePointer,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Pencil,
  Type
} from 'lucide-react';
import type { AppState } from '../types';

interface ToolbarProps {
  activeTool: AppState['activeTool'];
  onChangeTool: (tool: AppState['activeTool']) => void;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(({ activeTool, onChangeTool }) => {
  return (
    <div className="glass-panel toolbar">
      <button
        className={`tool-btn ${activeTool === 'selection' ? 'active' : ''}`}
        onClick={() => onChangeTool('selection')}
      >
        <MousePointer size={20} />
        <span className="tool-tooltip">Select (V)</span>
      </button>
      <button
        className={`tool-btn ${activeTool === 'rectangle' ? 'active' : ''}`}
        onClick={() => onChangeTool('rectangle')}
      >
        <Square size={20} />
        <span className="tool-tooltip">Rectangle (R)</span>
      </button>
      <button
        className={`tool-btn ${activeTool === 'ellipse' ? 'active' : ''}`}
        onClick={() => onChangeTool('ellipse')}
      >
        <Circle size={20} />
        <span className="tool-tooltip">Ellipse (O)</span>
      </button>
      <button
        className={`tool-btn ${activeTool === 'line' ? 'active' : ''}`}
        onClick={() => onChangeTool('line')}
      >
        <Minus size={20} />
        <span className="tool-tooltip">Line (L)</span>
      </button>
      <button
        className={`tool-btn ${activeTool === 'arrow' ? 'active' : ''}`}
        onClick={() => onChangeTool('arrow')}
      >
        <ArrowUpRight size={20} />
        <span className="tool-tooltip">Arrow (A)</span>
      </button>
      <button
        className={`tool-btn ${activeTool === 'pencil' ? 'active' : ''}`}
        onClick={() => onChangeTool('pencil')}
      >
        <Pencil size={20} />
        <span className="tool-tooltip">Draw (P)</span>
      </button>
      <button
        className={`tool-btn ${activeTool === 'text' ? 'active' : ''}`}
        onClick={() => onChangeTool('text')}
      >
        <Type size={20} />
        <span className="tool-tooltip">Text (T)</span>
      </button>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';
