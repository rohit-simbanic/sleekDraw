import { useState, useRef, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import type { CanvasElement, AppState, Point } from '../types';
import type { ResizeHandle } from '../utils/geometry';
import { getElementAtPosition, getHandleAtPosition, isElementInSelectionBox } from '../utils/geometry';

interface UseCanvasInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  updateElementsList: (updater: (prev: CanvasElement[]) => CanvasElement[], shouldSaveHistory?: boolean) => void;
  saveToHistory: (newElements: CanvasElement[]) => void;
  collabConnected: boolean;
  socketRef: React.RefObject<Socket | null>;
  roomIdRef: React.RefObject<string | null>;
  username: string;
  myColor: string;
  broadcastState: (elements: CanvasElement[], canvasBgToBroadcast?: string) => Promise<void>;
  handleUndo: () => void;
  handleRedo: () => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const useCanvasInteraction = ({
  canvasRef,
  elements,
  setElements,
  appState,
  setAppState,
  updateElementsList,
  saveToHistory,
  collabConnected,
  socketRef,
  roomIdRef,
  username,
  myColor,
  broadcastState,
  handleUndo,
  handleRedo,
  showConfirm,
  showToast
}: UseCanvasInteractionProps) => {
  const [action, setAction] = useState<'none' | 'drawing' | 'panning' | 'moving' | 'resizing' | 'selection-box'>('none');
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);
  const [editingTextElement, setEditingTextElement] = useState<CanvasElement | null>(null);
  const [textValue, setTextValue] = useState('');
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const initialPan = useRef<Point>({ x: 0, y: 0 });
  const activeElementIdRef = useRef<string | null>(null);
  const originalElementsRef = useRef<CanvasElement[]>([]);

  // Convert client cursor coords to Canvas World coordinates
  const screenToWorld = (clientX: number, clientY: number): Point => {
    return {
      x: (clientX - appState.pan.x) / appState.zoom,
      y: (clientY - appState.pan.y) / appState.zoom
    };
  };

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingTextElement) return; // ignore mouse while typing

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const worldPoint = screenToWorld(clientX, clientY);

    // 1. Panning Mode (Space + drag or middle mouse click)
    if (e.button === 1 || e.shiftKey || isSpacePressed) {
      setAction('panning');
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialPan.current = { x: appState.pan.x, y: appState.pan.y };
      return;
    }

    // 2. Selection Mode
    if (appState.activeTool === 'selection') {
      // Check handles on already selected elements first
      let clickedHandle: ResizeHandle | null = null;
      let clickedElId: string | null = null;

      Object.keys(appState.selectedElementIds).forEach(id => {
        const el = elements.find(item => item.id === id);
        if (el && !el.isDeleted) {
          const handle = getHandleAtPosition(worldPoint.x, worldPoint.y, el, appState.zoom);
          if (handle) {
            clickedHandle = handle;
            clickedElId = el.id;
          }
        }
      });

      if (clickedHandle && clickedElId) {
        setAction('resizing');
        setResizeHandle(clickedHandle);
        setResizingElementId(clickedElId);
        dragStart.current = worldPoint;
        return;
      }

      // Check if clicking inside any element
      const hitElement = getElementAtPosition(worldPoint.x, worldPoint.y, elements);
      if (hitElement) {
        setAction('moving');
        dragStart.current = worldPoint;
        originalElementsRef.current = JSON.parse(JSON.stringify(elements)); // Save backup for offset deltas

        // Toggle selection
        const isAlreadySelected = !!appState.selectedElementIds[hitElement.id];
        if (e.ctrlKey || e.metaKey) {
          setAppState(prev => ({
            ...prev,
            selectedElementIds: {
              ...prev.selectedElementIds,
              [hitElement.id]: !isAlreadySelected
            }
          }));
        } else if (!isAlreadySelected) {
          setAppState(prev => ({
            ...prev,
            selectedElementIds: { [hitElement.id]: true }
          }));
        }
      } else {
        // Clicked empty space: clear selections and start selection drag box
        setAppState(prev => ({ ...prev, selectedElementIds: {} }));
        setAction('selection-box');
        setSelectionBox({ start: worldPoint, end: worldPoint });
      }
      return;
    }

    // 3. Drawing Text element
    if (appState.activeTool === 'text') {
      const hitElement = getElementAtPosition(worldPoint.x, worldPoint.y, elements);
      if (hitElement && hitElement.type === 'text') {
        // Double clicked text element to edit
        setEditingTextElement(hitElement);
        setTextValue(hitElement.text || '');
        return;
      }

      // Create new text element
      const textId = Math.random().toString(36).substring(2, 9);
      const newTextElement: CanvasElement = {
        id: textId,
        type: 'text',
        x: worldPoint.x,
        y: worldPoint.y,
        width: 150,
        height: 24,
        strokeColor: appState.strokeColor,
        fillColor: 'transparent',
        fillStyle: 'none',
        strokeWidth: appState.strokeWidth,
        strokeStyle: appState.strokeStyle,
        opacity: appState.opacity,
        text: '',
        version: 1,
        updatedAt: Date.now()
      };

      setEditingTextElement(newTextElement);
      setTextValue('');
      return;
    }

    // 4. Drawing Shapes
    const newId = Math.random().toString(36).substring(2, 9);
    const newEl: CanvasElement = {
      id: newId,
      type: appState.activeTool,
      x: worldPoint.x,
      y: worldPoint.y,
      width: 0,
      height: 0,
      strokeColor: appState.strokeColor,
      fillColor: appState.fillColor,
      fillStyle: appState.fillStyle,
      strokeWidth: appState.strokeWidth,
      strokeStyle: appState.strokeStyle,
      opacity: appState.opacity,
      version: 1,
      updatedAt: Date.now()
    };

    if (appState.activeTool === 'pencil') {
      newEl.points = [{ x: 0, y: 0 }];
    } else if (appState.activeTool === 'line' || appState.activeTool === 'arrow') {
      newEl.points = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
    }

    setAction('drawing');
    activeElementIdRef.current = newId;
    updateElementsList(prev => [...prev, newEl]);
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const worldPoint = screenToWorld(clientX, clientY);

    // Emit live cursor sync to peers
    if (collabConnected && socketRef.current && roomIdRef.current) {
      socketRef.current.emit('cursor-move', {
        roomId: roomIdRef.current,
        cursorData: {
          x: worldPoint.x,
          y: worldPoint.y,
          username,
          color: myColor,
          selectedElementIds: appState.selectedElementIds
        }
      });
    }

    // 1. Panning Canvas
    if (action === 'panning') {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      setAppState(prev => ({
        ...prev,
        pan: {
          x: initialPan.current.x + deltaX,
          y: initialPan.current.y + deltaY
        }
      }));
      return;
    }

    // 2. Drag Selection Box
    if (action === 'selection-box' && selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, end: worldPoint } : null);
      const box = selectionBox;
      updateElementsList(prev => {
        const newSelection: Record<string, boolean> = {};
        prev.forEach(el => {
          if (!el.isDeleted && isElementInSelectionBox(box.start.x, box.start.y, worldPoint.x, worldPoint.y, el)) {
            newSelection[el.id] = true;
          }
        });
        setAppState(s => ({ ...s, selectedElementIds: newSelection }));
        return prev;
      });
      return;
    }

    // 3. Moving Selected Elements
    if (action === 'moving') {
      const deltaX = worldPoint.x - dragStart.current.x;
      const deltaY = worldPoint.y - dragStart.current.y;

      updateElementsList(prev => {
        return prev.map(el => {
          if (appState.selectedElementIds[el.id]) {
            const original = originalElementsRef.current.find(o => o.id === el.id);
            if (!original) return el;
            return {
              ...el,
              x: original.x + deltaX,
              y: original.y + deltaY,
              version: el.version + 1,
              updatedAt: Date.now(),
              bounds: undefined
            };
          }
          return el;
        });
      });
      return;
    }

    // 4. Resizing Element
    if (action === 'resizing' && resizingElementId && resizeHandle) {
      const deltaX = worldPoint.x - dragStart.current.x;
      const deltaY = worldPoint.y - dragStart.current.y;

      updateElementsList(prev => {
        return prev.map(el => {
          if (el.id !== resizingElementId) return el;

          let newX = el.x;
          let newY = el.y;
          let newW = el.width;
          let newH = el.height;

          switch (resizeHandle) {
            case 'BR':
              newW = el.width + deltaX;
              newH = el.height + deltaY;
              break;
            case 'TR':
              newW = el.width + deltaX;
              newY = el.y + deltaY;
              newH = el.height - deltaY;
              break;
            case 'TL':
              newX = el.x + deltaX;
              newW = el.width - deltaX;
              newY = el.y + deltaY;
              newH = el.height - deltaY;
              break;
            case 'BL':
              newX = el.x + deltaX;
              newW = el.width - deltaX;
              newH = el.height + deltaY;
              break;
            case 'R':
              newW = el.width + deltaX;
              break;
            case 'L':
              newX = el.x + deltaX;
              newW = el.width - deltaX;
              break;
            case 'B':
              newH = el.height + deltaY;
              break;
            case 'T':
              newY = el.y + deltaY;
              newH = el.height - deltaY;
              break;
          }

          let scaledPoints = el.points;
          if (el.points && el.points.length > 0 && el.width !== 0 && el.height !== 0) {
            const scaleX = newW / el.width;
            const scaleY = newH / el.height;
            scaledPoints = el.points.map(p => ({
              x: p.x * scaleX,
              y: p.y * scaleY
            }));
          }

          dragStart.current = worldPoint;

          return {
            ...el,
            x: newX,
            y: newY,
            width: newW,
            height: newH,
            points: scaledPoints,
            version: el.version + 1,
            updatedAt: Date.now(),
            bounds: undefined
          };
        });
      });
      return;
    }

    // 5. Drawing Shapes
    if (action === 'drawing' && activeElementIdRef.current) {
      updateElementsList(prev => {
        return prev.map(el => {
          if (el.id !== activeElementIdRef.current) return el;

          const startX = el.x;
          const startY = el.y;

          if (el.type === 'pencil') {
            const relativePoint = {
              x: worldPoint.x - startX,
              y: worldPoint.y - startY
            };
            return {
              ...el,
              points: [...(el.points || []), relativePoint],
              version: el.version + 1,
              updatedAt: Date.now(),
              bounds: undefined
            };
          }

          if (el.type === 'line' || el.type === 'arrow') {
            const relativeEndPoint = {
              x: worldPoint.x - startX,
              y: worldPoint.y - startY
            };
            return {
              ...el,
              points: [el.points![0], relativeEndPoint],
              width: worldPoint.x - startX,
              height: worldPoint.y - startY,
              version: el.version + 1,
              updatedAt: Date.now(),
              bounds: undefined
            };
          }

          return {
            ...el,
            width: worldPoint.x - startX,
            height: worldPoint.y - startY,
            version: el.version + 1,
            updatedAt: Date.now(),
            bounds: undefined
          };
        });
      });
    }
  };

  const finalizeElement = (el: CanvasElement): CanvasElement => {
    if (el.type === 'pencil' && el.points && el.points.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      el.points.forEach(p => {
        const absX = el.x + p.x;
        const absY = el.y + p.y;
        minX = Math.min(minX, absX);
        maxX = Math.max(maxX, absX);
        minY = Math.min(minY, absY);
        maxY = Math.max(maxY, absY);
      });

      const width = maxX - minX;
      const height = maxY - minY;

      const adjustedPoints = el.points.map(p => ({
        x: (el.x + p.x) - minX,
        y: (el.y + p.y) - minY
      }));

      return {
        ...el,
        x: minX,
        y: minY,
        width: Math.max(1, width),
        height: Math.max(1, height),
        points: adjustedPoints,
        version: el.version + 1,
        updatedAt: Date.now(),
        bounds: undefined
      };
    }
    return el;
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    if (action === 'drawing' && activeElementIdRef.current) {
      setElements(prev => {
        const updated = prev.map(el => {
          if (el.id === activeElementIdRef.current) {
            return finalizeElement(el);
          }
          return el;
        });
        saveToHistory(updated);
        broadcastState(updated);
        return updated;
      });
    } else {
      saveToHistory(elements);
      broadcastState(elements);
    }

    setAction('none');
    setSelectionBox(null);
    setResizeHandle(null);
    setResizingElementId(null);
    activeElementIdRef.current = null;
  };

  // Commit text editing
  const finishTextEditing = useCallback(() => {
    if (!editingTextElement) return;

    const trimmedValue = textValue.trim();
    if (!trimmedValue) {
      updateElementsList(prev => prev.filter(e => e.id !== editingTextElement.id));
    } else {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      let textWidth = 120;
      let textHeight = 24;

      if (ctx) {
        ctx.font = 'bold 20px Outfit, sans-serif';
        const lines = trimmedValue.split('\n');
        textHeight = lines.length * 24;
        lines.forEach(l => {
          textWidth = Math.max(textWidth, ctx.measureText(l).width);
        });
      }

      const isNew = !elements.some(e => e.id === editingTextElement.id);

      if (isNew) {
        updateElementsList(prev => [
          ...prev,
          {
            ...editingTextElement,
            text: trimmedValue,
            width: textWidth,
            height: textHeight,
            version: editingTextElement.version + 1,
            updatedAt: Date.now(),
            bounds: undefined
          }
        ], true);
      } else {
        updateElementsList(prev => prev.map(e => {
          if (e.id === editingTextElement.id) {
            return {
              ...e,
              text: trimmedValue,
              width: textWidth,
              height: textHeight,
              version: e.version + 1,
              updatedAt: Date.now(),
              bounds: undefined
            };
          }
          return e;
        }), true);
      }
    }

    setEditingTextElement(null);
    setTextValue('');
  }, [editingTextElement, textValue, elements, updateElementsList, canvasRef]);

  const deleteSelectedElements = useCallback(() => {
    updateElementsList(prev => {
      return prev.map(el => {
        if (appState.selectedElementIds[el.id]) {
          return { ...el, isDeleted: true };
        }
        return el;
      });
    }, true);
    setAppState(prev => ({ ...prev, selectedElementIds: {} }));
  }, [appState.selectedElementIds, updateElementsList, setAppState]);

  const clearCanvas = useCallback(() => {
    showConfirm(
      'Clear Canvas',
      'Are you sure you want to delete all elements on the canvas? This action cannot be undone.',
      () => {
        updateElementsList(prev => prev.map(el => ({ ...el, isDeleted: true })), true);
        setAppState(prev => ({ ...prev, selectedElementIds: {} }));
        showToast('Canvas cleared successfully.', 'success');
      }
    );
  }, [showConfirm, updateElementsList, setAppState, showToast]);

  // Keyboard Spacebar pan listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextElement) return;
      if (e.key === ' ' || e.code === 'Space') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSpacePressed(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    const handleBlur = () => {
      setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [editingTextElement]);

  // Keyboard shortcuts Delete and Undo/Redo listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const hasSelection = Object.keys(appState.selectedElementIds).length > 0;
        if (hasSelection) {
          deleteSelectedElements();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState.selectedElementIds, editingTextElement, handleUndo, handleRedo]);

  return {
    action,
    setAction,
    selectionBox,
    setSelectionBox,
    resizeHandle,
    setResizeHandle,
    resizingElementId,
    setResizingElementId,
    editingTextElement,
    setEditingTextElement,
    textValue,
    setTextValue,
    isSpacePressed,
    setIsSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    finishTextEditing,
    deleteSelectedElements,
    clearCanvas
  };
};
