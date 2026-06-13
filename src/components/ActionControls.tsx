import React from 'react';
import { Undo, Redo, Trash2 } from 'lucide-react';

interface ActionControlsProps {
  historyIndex: number;
  historyLength: number;
  selectedElementIdsCount: number;
  handleUndo: () => void;
  handleRedo: () => void;
  deleteSelectedElements: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = React.memo(({
  historyIndex,
  historyLength,
  selectedElementIdsCount,
  handleUndo,
  handleRedo,
  deleteSelectedElements
}) => {
  return (
    <div className="glass-panel action-controls">
      <button className="tool-btn" onClick={handleUndo} disabled={historyIndex === 0}>
        <Undo size={18} />
        <span className="tool-tooltip">Undo (Ctrl+Z)</span>
      </button>
      <button className="tool-btn" onClick={handleRedo} disabled={historyIndex >= historyLength - 1}>
        <Redo size={18} />
        <span className="tool-tooltip">Redo (Ctrl+Y)</span>
      </button>
      {selectedElementIdsCount > 0 && (
        <button className="tool-btn" onClick={deleteSelectedElements} style={{ color: '#ef4444' }}>
          <Trash2 size={18} />
          <span className="tool-tooltip">Delete Selected</span>
        </button>
      )}
    </div>
  );
});

ActionControls.displayName = 'ActionControls';
