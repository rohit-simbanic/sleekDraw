export type ElementType = 'selection' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'pencil' | 'text';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type FillStyle = 'solid' | 'hachure' | 'none';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  points?: Point[]; // Used for freehand pencil, lines, and arrows
  text?: string;    // Used for text elements
  version: number;
  updatedAt: number;
  // Ephemeral fields (not serialized or encrypted to server)
  isDeleted?: boolean;
  bounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface AppState {
  activeTool: ElementType;
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  zoom: number;
  pan: Point;
  selectedElementIds: Record<string, boolean>;
  theme: 'light' | 'dark';
  collaborativeRoomId: string | null;
  canvasBackgroundColor: string;
}

export interface PeerCursor {
  socketId: string;
  x: number;
  y: number;
  username: string;
  color: string;
  selectedElementIds: Record<string, boolean>;
}

export interface LibraryItemMetadata {
  name: string;
  description: string;
  authors: { name: string; url?: string }[];
  source: string;
  preview: string;
  created: string;
  updated?: string;
  version?: number;
  id: string;
  itemNames?: string[];
}

export interface LibraryItem {
  id: string;
  elements: CanvasElement[];
  name?: string;
}

