import { useEffect, useRef, useState, useCallback } from 'react';
import rough from 'roughjs';

import type { AppState, CanvasElement, Point, LibraryItemMetadata } from './types';
import { getElementBounds } from './utils/geometry';
import { drawScene, drawElement } from './utils/renderer';

import { PEER_COLORS } from './constants';
import { Toolbar } from './components/Toolbar';
import { CanvasStylingSidebar } from './components/CanvasStylingSidebar';
import { RightSidebar } from './components/RightSidebar';
import { ActionControls } from './components/ActionControls';
import { ZoomControls } from './components/ZoomControls';
import { ShareModal } from './components/ShareModal';
import { TextEditor } from './components/TextEditor';
import { SpacebarHint } from './components/SpacebarHint';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmModal } from './components/ConfirmModal';
import { getElementsArray } from './components/LibraryShapePreview';

import { useHistory } from './hooks/useHistory';
import { useCollaboration } from './hooks/useCollaboration';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';

const myColor = PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Drawing States
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [appState, setAppState] = useState<AppState>({
    activeTool: 'selection',
    strokeColor: '#ffffff',
    fillColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 2,
    strokeStyle: 'solid',
    opacity: 1,
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedElementIds: {},
    theme: 'dark',
    collaborativeRoomId: null,
    canvasBackgroundColor: '#0c0c0e'
  });

  // UI Toast stack states
  interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
    id: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Custom Confirmation Dialog States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmModalConfig({ title, message, onConfirm });
    setShowConfirmModal(true);
  }, []);

  // Excalidraw Libraries States
  const [activeRightTab, setActiveRightTab] = useState<'collab' | 'library'>('collab');
  const [libraryCatalog, setLibraryCatalog] = useState<LibraryItemMetadata[]>([]);
  const [libSearchQuery, setLibSearchQuery] = useState('');
  const [loadedLibrarySource, setLoadedLibrarySource] = useState<string | null>(null);
  const [loadedShapes, setLoadedShapes] = useState<any[][]>([]);
  const [loadedItemNames, setLoadedItemNames] = useState<string[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isShapesLoading, setIsShapesLoading] = useState(false);

  // Collapsible Sidebars Responsive States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(window.innerWidth > 768);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(window.innerWidth > 1024);

  // 1. Initialize E2EE Sockets Collaboration Hook
  const {
    collabConnected,
    showShareModal,
    setShowShareModal,
    shareUrl,
    username,
    setUsername,
    peerCursors,
    socketRef,
    roomIdRef,
    isReceivingSyncRef,
    joinCollaborativeRoom,
    startCollaboration,
    broadcastState
  } = useCollaboration({
    setElements,
    appState,
    setAppState,
    setHistory: (historyUpdater) => {
      setHistory(historyUpdater);
    },
    setHistoryIndex: (indexUpdater) => {
      setHistoryIndex(indexUpdater);
    }
  });

  // 2. Initialize History stacks Hook
  const {
    history,
    historyIndex,
    setHistory,
    setHistoryIndex,
    saveToHistory,
    handleUndo,
    handleRedo
  } = useHistory(setElements, (syncElements) => {
    if (collabConnected) {
      broadcastState(syncElements);
    }
  });

  // Local elements updater that syncs E2EE
  const updateElementsList = useCallback((updater: (prev: CanvasElement[]) => CanvasElement[], shouldSaveHistory = false) => {
    setElements(prev => {
      const updated = updater(prev);
      if (shouldSaveHistory) {
        saveToHistory(updated);
      }
      if (collabConnected && !isReceivingSyncRef.current) {
        broadcastState(updated);
      }
      return updated;
    });
  }, [collabConnected, saveToHistory, broadcastState]);

  // 3. Initialize Drawing Events Hook
  const {
    action,
    selectionBox,
    editingTextElement,
    textValue,
    setTextValue,
    isSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    finishTextEditing,
    deleteSelectedElements,
    clearCanvas
  } = useCanvasInteraction({
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
  });

  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  // Canvas wheel zoom listener (Ctrl + mouse wheel scroll)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleCanvasWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        const currentPan = appStateRef.current.pan;
        const currentZoom = appStateRef.current.zoom;

        const worldX = (clientX - currentPan.x) / currentZoom;
        const worldY = (clientY - currentPan.y) / currentZoom;

        // scroll up (negative deltaY) zooms in, scroll down (positive deltaY) zooms out
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const nextZoom = Math.min(10, Math.max(0.1, currentZoom * zoomFactor));

        const nextPanX = clientX - worldX * nextZoom;
        const nextPanY = clientY - worldY * nextZoom;

        setAppState(prev => ({
          ...prev,
          zoom: nextZoom,
          pan: { x: nextPanX, y: nextPanY }
        }));
      }
    };

    canvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleCanvasWheel);
    };
  }, []);

  const triggerRedrawRef = useRef(triggerRedraw);
  triggerRedrawRef.current = triggerRedraw;

  // Initialize Canvas dimensions on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
        triggerRedrawRef.current();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Connect to E2EE Room if URL hash matches on load
  useEffect(() => {
    const parseUrlHash = async () => {
      const hash = window.location.hash;
      const match = hash.match(/#room=([a-zA-Z0-9_-]+)&key=([a-fA-F0-9]{32})/);
      if (match) {
        const roomId = match[1];
        const encryptionKey = match[2];
        await joinCollaborativeRoom(roomId, encryptionKey);
      }
    };
    parseUrlHash();
  }, []);

  // Fetch Excalidraw Libraries Catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsCatalogLoading(true);
      try {
        const res = await fetch('https://raw.githubusercontent.com/excalidraw/excalidraw-libraries/main/libraries.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLibraryCatalog(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch library catalog:', err);
      } finally {
        setIsCatalogLoading(false);
      }
    };

    if (activeRightTab === 'library' && libraryCatalog.length === 0) {
      fetchCatalog();
    }
  }, [activeRightTab, libraryCatalog]);

  // Download and parse `.excalidrawlib` JSON from Github
  const loadLibraryShapes = useCallback(async (lib: LibraryItemMetadata) => {
    setIsShapesLoading(true);
    setLoadedLibrarySource(lib.source);
    setLoadedShapes([]);
    setLoadedItemNames(lib.itemNames || []);
    try {
      const res = await fetch(`https://raw.githubusercontent.com/excalidraw/excalidraw-libraries/main/libraries/${lib.source}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.library || data.libraryItems || [];
        setLoadedShapes(items);
      } else {
        showToast('Failed to download library shapes. Please try again.', 'error');
        setLoadedLibrarySource(null);
      }
    } catch (err) {
      console.error('Failed to load library shapes:', err);
      showToast('Error loading library shapes.', 'error');
      setLoadedLibrarySource(null);
    } finally {
      setIsShapesLoading(false);
    }
  }, [showToast]);

  // Convert and center selected shape group onto canvas
  const insertLibraryShape = useCallback((shapeGroup: any) => {
    if (!shapeGroup) return;
    const elementsArray = getElementsArray(shapeGroup);
    if (elementsArray.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert raw JSON shape coordinates and formats
    const convertedGroup: CanvasElement[] = elementsArray.map((el: any) => {
      let points: Point[] | undefined = undefined;
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
        id: Math.random().toString(36).substring(2, 9),
        type: el.type || 'rectangle',
        x: el.x ?? 0,
        y: el.y ?? 0,
        width: el.width ?? 100,
        height: el.height ?? 100,
        strokeColor: el.strokeColor || '#ffffff',
        fillColor: el.fillColor || (el.backgroundColor === 'transparent' ? 'transparent' : el.backgroundColor) || 'transparent',
        fillStyle: el.fillStyle || 'hachure',
        strokeWidth: el.strokeWidth ?? 2,
        strokeStyle: el.strokeStyle || 'solid',
        opacity: opacity,
        points,
        text: el.text || '',
        version: el.version || 1,
        updatedAt: el.updatedAt || Date.now()
      } as CanvasElement;
    });

    // Find bounding box to compute shape offset
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    convertedGroup.forEach((el: CanvasElement) => {
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x + el.width;
      const y2 = el.y + el.height;

      minX = Math.min(minX, x1, x2);
      minY = Math.min(minY, y1, y2);
      maxX = Math.max(maxX, x1, x2);
      maxY = Math.max(maxY, y1, y2);
    });

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;

    // Scale down the shape group if it is larger than 75% of the visible viewport bounds
    const maxAllowedWidth = (window.innerWidth * 0.75) / appState.zoom;
    const maxAllowedHeight = (window.innerHeight * 0.75) / appState.zoom;

    let scale = 1.0;
    if (groupWidth > maxAllowedWidth || groupHeight > maxAllowedHeight) {
      const scaleX = maxAllowedWidth / groupWidth;
      const scaleY = maxAllowedHeight / groupHeight;
      scale = Math.min(scaleX, scaleY);
    }

    const scaledGroup = convertedGroup.map((el: CanvasElement) => {
      const relativeX = el.x - minX;
      const relativeY = el.y - minY;
      const newPoints = el.points
        ? el.points.map((p: Point) => ({ x: p.x * scale, y: p.y * scale }))
        : undefined;
      return {
        ...el,
        x: minX + relativeX * scale,
        y: minY + relativeY * scale,
        width: el.width * scale,
        height: el.height * scale,
        strokeWidth: el.strokeWidth ? Math.max(1, el.strokeWidth * scale) : 2,
        points: newPoints
      };
    });

    const newGroupCenterX = minX + (groupWidth * scale) / 2;
    const newGroupCenterY = minY + (groupHeight * scale) / 2;

    // Use logical viewport width and height (not DPR-scaled canvas properties) for correct centering
    const viewportCenterX = (window.innerWidth / 2 - appState.pan.x) / appState.zoom;
    const viewportCenterY = (window.innerHeight / 2 - appState.pan.y) / appState.zoom;

    const shiftX = viewportCenterX - newGroupCenterX;
    const shiftY = viewportCenterY - newGroupCenterY;

    const positionedGroup = scaledGroup.map((el: CanvasElement) => ({
      ...el,
      x: el.x + shiftX,
      y: el.y + shiftY,
      bounds: undefined
    }));

    const newSelectionIds: Record<string, boolean> = {};
    positionedGroup.forEach((el: CanvasElement) => {
      newSelectionIds[el.id] = true;
    });

    updateElementsList(prev => [...prev, ...positionedGroup], true);

    setAppState(prev => ({
      ...prev,
      activeTool: 'selection',
      selectedElementIds: newSelectionIds
    }));
  }, [appState.zoom, appState.pan, updateElementsList]);

  // Sidebar Collapsing Media Handler
  useEffect(() => {
    const handleSidebarResize = () => {
      if (window.innerWidth <= 768) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleSidebarResize);
    handleSidebarResize();
    return () => window.removeEventListener('resize', handleSidebarResize);
  }, []);

  // Selection Property Sync (when users adjust stroke/fill in left panel, apply to selected items)
  const adjustSelectedElementsProperty = useCallback((key: keyof CanvasElement, value: any) => {
    setAppState(prev => ({ ...prev, [key]: value }));

    const hasSelection = Object.keys(appState.selectedElementIds).length > 0;
    if (hasSelection) {
      updateElementsList(prev => {
        return prev.map(el => {
          if (appState.selectedElementIds[el.id]) {
            return {
              ...el,
              [key]: value,
              version: el.version + 1,
              updatedAt: Date.now(),
              bounds: undefined
            };
          }
          return el;
        });
      }, true);
    }
  }, [appState.selectedElementIds, updateElementsList]);

  // Zoom Helpers
  const zoomIn = useCallback(() => setAppState(prev => ({ ...prev, zoom: Math.min(10, prev.zoom + 0.1) })), []);
  const zoomOut = useCallback(() => setAppState(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom - 0.1) })), []);
  const resetZoom = useCallback(() => setAppState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } })), []);

  // Export to SVG
  const exportToSVG = useCallback(() => {
    const activeElements = elements.filter(e => !e.isDeleted);
    if (activeElements.length === 0) {
      showToast('Drawing is empty. Nothing to export!', 'error');
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    activeElements.forEach(el => {
      const { minX: ex1, maxX: ex2, minY: ey1, maxY: ey2 } = getElementBounds(el);
      minX = Math.min(minX, ex1, ex2);
      minY = Math.min(minY, ey1, ey2);
      maxX = Math.max(maxX, ex1, ex2);
      maxY = Math.max(maxY, ey1, ey2);
    });

    const margin = 20;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;

    const width = maxX - minX;
    const height = maxY - minY;

    let svgContent = '';
    svgContent += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}" style="background-color: ${appState.canvasBackgroundColor};">`;

    activeElements.forEach(el => {
      if (el.type === 'rectangle') {
        const rx1 = Math.min(el.x, el.x + el.width);
        const ry1 = Math.min(el.y, el.y + el.height);
        const rw = Math.abs(el.width);
        const rh = Math.abs(el.height);
        svgContent += `<rect x="${rx1}" y="${ry1}" width="${rw}" height="${rh}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="${el.fillColor === 'transparent' ? 'none' : el.fillColor}" />`;
      } else if (el.type === 'ellipse') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rx = Math.abs(el.width) / 2;
        const ry = Math.abs(el.height) / 2;
        svgContent += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="${el.fillColor === 'transparent' ? 'none' : el.fillColor}" />`;
      } else if (el.type === 'line' || el.type === 'arrow' || el.type === 'pencil') {
        if (el.points) {
          const pathPoints = el.points.map(p => `${el.x + p.x},${el.y + p.y}`).join(' ');
          svgContent += `<polyline points="${pathPoints}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="none" />`;
        }
      } else if (el.type === 'text' && el.text) {
        const lines = el.text.split('\n');
        lines.forEach((l, idx) => {
          svgContent += `<text x="${el.x}" y="${el.y + idx * 24 + 18}" fill="${el.strokeColor}" font-family="Outfit, sans-serif" font-weight="bold" font-size="20px">${l}</text>`;
        });
      }
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whiteboard-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [elements, appState.canvasBackgroundColor, showToast]);

  // Export to PNG
  const exportToPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeElements = elements.filter(e => !e.isDeleted);
    if (activeElements.length === 0) {
      showToast('Drawing is empty!', 'error');
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    activeElements.forEach(el => {
      const { minX: ex1, maxX: ex2, minY: ey1, maxY: ey2 } = getElementBounds(el);
      minX = Math.min(minX, ex1, ex2);
      minY = Math.min(minY, ey1, ey2);
      maxX = Math.max(maxX, ex1, ex2);
      maxY = Math.max(maxY, ey1, ey2);
    });

    const margin = 24;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;

    const width = maxX - minX;
    const height = maxY - minY;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;

    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = appState.canvasBackgroundColor;
    tempCtx.fillRect(0, 0, width, height);

    const tempRc = rough.canvas(tempCanvas);
    tempCtx.save();
    tempCtx.translate(-minX, -minY);

    activeElements.forEach(el => {
      drawElement(tempRc, tempCtx, el);
    });

    tempCtx.restore();

    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `whiteboard-${Date.now()}.png`;
    link.click();
  }, [elements, appState.canvasBackgroundColor, showToast]);

  const isLightTheme = (color: string) => {
    return color === '#ffffff' || color === '#f3f4f6';
  };

  const changeCanvasBackground = useCallback((color: string) => {
    const light = isLightTheme(color);

    setElements(prev => {
      let elementsChanged = false;
      const updated = prev.map(el => {
        let changed = false;
        let nextStroke = el.strokeColor;
        let nextFill = el.fillColor;

        if (light) {
          if (el.strokeColor === '#ffffff' || el.strokeColor === 'white') {
            nextStroke = '#121212';
            changed = true;
          }
          if (el.fillColor === 'rgba(255, 255, 255, 0.1)') {
            nextFill = 'rgba(18, 18, 18, 0.1)';
            changed = true;
          }
        } else {
          if (el.strokeColor === '#121212' || el.strokeColor === 'black' || el.strokeColor === '#000000') {
            nextStroke = '#ffffff';
            changed = true;
          }
          if (el.fillColor === 'rgba(18, 18, 18, 0.1)' || el.fillColor === 'rgba(0, 0, 0, 0.1)') {
            nextFill = 'rgba(255, 255, 255, 0.1)';
            changed = true;
          }
        }

        if (changed) {
          elementsChanged = true;
          return {
            ...el,
            strokeColor: nextStroke,
            fillColor: nextFill,
            version: el.version + 1,
            updatedAt: Date.now(),
            bounds: undefined
          };
        }
        return el;
      });

      if (elementsChanged) {
        saveToHistory(updated);
      }
      
      if (collabConnected) {
        broadcastState(updated, color);
      }
      
      return updated;
    });

    setAppState(prev => {
      let nextStroke = prev.strokeColor;
      if (light && prev.strokeColor === '#ffffff') {
        nextStroke = '#121212';
      } else if (!light && prev.strokeColor === '#121212') {
        nextStroke = '#ffffff';
      }
      return {
        ...prev,
        canvasBackgroundColor: color,
        strokeColor: nextStroke
      };
    });
  }, [collabConnected, saveToHistory, broadcastState]);

  function triggerRedraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rc = rough.canvas(canvas);
    drawScene(canvas, rc, elements, appState, peerCursors, selectionBox);
  }

  useEffect(() => {
    triggerRedraw();
  }, [elements, appState, peerCursors, selectionBox]);

  return (
    <div className="canvas-container" style={{ backgroundColor: appState.canvasBackgroundColor }}>
      {/* Interactive canvas grid dots */}
      <div
        className="canvas-grid"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='1.5' cy='1.5' r='1.2' fill='${
            isLightTheme(appState.canvasBackgroundColor)
              ? 'rgba(0, 0, 0, 0.12)'
              : 'rgba(255, 255, 255, 0.08)'
          }'/></svg>")`
        }}
      />

      {/* Main Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          cursor: isSpacePressed
            ? (action === 'panning' ? 'grabbing' : 'grab')
            : action === 'panning'
            ? 'grabbing'
            : appState.activeTool === 'selection'
            ? 'default'
            : 'crosshair'
        }}
      />

      {/* Inline Text Editor Area */}
      <TextEditor
        editingTextElement={editingTextElement}
        textValue={textValue}
        zoom={appState.zoom}
        pan={appState.pan}
        onChange={setTextValue}
        onBlur={finishTextEditing}
      />

      {/* Left Sidebar Canvas Styling Options */}
      <CanvasStylingSidebar
        isOpen={isLeftSidebarOpen}
        setIsOpen={setIsLeftSidebarOpen}
        strokeColor={appState.strokeColor}
        fillColor={appState.fillColor}
        fillStyle={appState.fillStyle}
        strokeStyle={appState.strokeStyle}
        strokeWidth={appState.strokeWidth}
        opacity={appState.opacity}
        canvasBackgroundColor={appState.canvasBackgroundColor}
        onAdjustProperty={adjustSelectedElementsProperty}
        onChangeBackground={changeCanvasBackground}
        onClearCanvas={clearCanvas}
        onOpenSidebar={() => {
          setIsLeftSidebarOpen(true);
          if (window.innerWidth <= 768) {
            setIsRightSidebarOpen(false);
          }
        }}
      />

      {/* Floating Header Drawing Toolbar */}
      <Toolbar
        activeTool={appState.activeTool}
        onChangeTool={tool => setAppState(prev => ({ ...prev, activeTool: tool }))}
      />

      {/* Floating Canvas Hints Overlay */}
      <SpacebarHint />

      {/* Tabbed Right Panel (Collaboration & Catalog Browser) */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        setIsOpen={setIsRightSidebarOpen}
        activeRightTab={activeRightTab}
        setActiveRightTab={setActiveRightTab}
        collabConnected={collabConnected}
        startCollaboration={startCollaboration}
        setShowShareModal={setShowShareModal}
        username={username}
        setUsername={setUsername}
        peerCursors={peerCursors}
        libSearchQuery={libSearchQuery}
        setLibSearchQuery={setLibSearchQuery}
        loadedLibrarySource={loadedLibrarySource}
        setLoadedLibrarySource={setLoadedLibrarySource}
        isCatalogLoading={isCatalogLoading}
        isShapesLoading={isShapesLoading}
        libraryCatalog={libraryCatalog}
        loadedShapes={loadedShapes}
        loadedItemNames={loadedItemNames}
        loadLibraryShapes={loadLibraryShapes}
        insertLibraryShape={insertLibraryShape}
        onOpenSidebar={() => {
          setIsRightSidebarOpen(true);
          if (window.innerWidth <= 768) {
            setIsLeftSidebarOpen(false);
          }
        }}
      />

      {/* Bottom Left History & Action Control Panels */}
      <ActionControls
        historyIndex={historyIndex}
        historyLength={history.length}
        selectedElementIdsCount={Object.keys(appState.selectedElementIds).length}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        deleteSelectedElements={deleteSelectedElements}
      />

      {/* Bottom Right Zoom controls & File Exporters */}
      <ZoomControls
        zoom={appState.zoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        exportToSVG={exportToSVG}
        exportToPNG={exportToPNG}
      />

      {/* Room Link Invite Copy Modal Overlay */}
      <ShareModal
        isOpen={showShareModal}
        shareUrl={shareUrl}
        onClose={() => setShowShareModal(false)}
        onCopy={() => {
          navigator.clipboard.writeText(shareUrl);
          showToast('Share URL copied to clipboard!', 'success');
        }}
      />

      {/* Toast Overlay stack alerts */}
      <ToastContainer
        toasts={toasts}
        onClose={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />

      {/* Custom Confirmation Modal overlay */}
      <ConfirmModal
        isOpen={showConfirmModal && !!confirmModalConfig}
        title={confirmModalConfig?.title || ''}
        message={confirmModalConfig?.message || ''}
        onConfirm={() => {
          confirmModalConfig?.onConfirm();
          setShowConfirmModal(false);
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
