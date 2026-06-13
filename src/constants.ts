export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

// A set of beautiful neon colors for peer cursors
export const PEER_COLORS = [
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f43f5e'  // Rose
];

// Default stroke/fill color options for our premium dark theme
export const STROKE_COLORS = [
  '#ffffff', // White
  '#121212', // Dark Charcoal/Black (necessary for light canvas mode)
  '#f43f5e', // Neon Rose
  '#3b82f6', // Neon Blue
  '#10b981', // Neon Emerald
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#ff7e40'  // Orange
];

export const FILL_COLORS = [
  'transparent',
  'rgba(255, 255, 255, 0.1)',
  'rgba(244, 63, 94, 0.2)',
  'rgba(59, 130, 246, 0.2)',
  'rgba(16, 185, 129, 0.2)',
  'rgba(234, 179, 8, 0.2)',
  'rgba(168, 85, 247, 0.2)'
];

export const CANVAS_BG_COLORS = [
  '#0c0c0e', // Dark Default
  '#121214', // Classic Charcoal
  '#161b22', // GitHub Dark
  '#1e293b', // Slate Dark
  '#ffffff', // Pure White
  '#f3f4f6'  // Light Gray
];
