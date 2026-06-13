import { useState } from 'react';
import type { CanvasElement } from '../types';

export const useHistory = (
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
  onSyncElements?: (elements: CanvasElement[]) => void
) => {
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = (newElements: CanvasElement[]) => {
    const cleanElements = newElements.filter(e => !e.isDeleted);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, cleanElements]);
    setHistoryIndex(newHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevElements = history[prevIndex];
      setElements(prevElements);
      setHistoryIndex(prevIndex);
      if (onSyncElements) {
        onSyncElements(prevElements);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextElements = history[nextIndex];
      setElements(nextElements);
      setHistoryIndex(nextIndex);
      if (onSyncElements) {
        onSyncElements(nextElements);
      }
    }
  };

  return {
    history,
    historyIndex,
    setHistory,
    setHistoryIndex,
    saveToHistory,
    handleUndo,
    handleRedo
  };
};
