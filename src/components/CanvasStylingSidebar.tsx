import React from 'react';
import { X, Settings } from 'lucide-react';
import { STROKE_COLORS, FILL_COLORS, CANVAS_BG_COLORS } from '../constants';

interface CanvasStylingSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  strokeColor: string;
  fillColor: string;
  fillStyle: string;
  strokeStyle: string;
  strokeWidth: number;
  opacity: number;
  canvasBackgroundColor: string;
  onAdjustProperty: (key: any, value: any) => void;
  onChangeBackground: (color: string) => void;
  onClearCanvas: () => void;
  onOpenSidebar: () => void;
}

export const CanvasStylingSidebar: React.FC<CanvasStylingSidebarProps> = React.memo(({
  isOpen,
  setIsOpen,
  strokeColor,
  fillColor,
  fillStyle,
  strokeStyle,
  strokeWidth,
  opacity,
  canvasBackgroundColor,
  onAdjustProperty,
  onChangeBackground,
  onClearCanvas,
  onOpenSidebar
}) => {
  return (
    <>
      <div className={`glass-panel sidebar-panel ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Canvas Styling</div>
          <button className="sidebar-close-btn" onClick={() => setIsOpen(false)} title="Collapse styling">
            <X size={16} />
          </button>
        </div>

        {/* Stroke Colors */}
        <div className="setting-group">
          <label className="setting-label">Stroke Color</label>
          <div className="color-palette">
            {STROKE_COLORS.map(c => (
              <div
                key={c}
                className={`color-option ${strokeColor === c ? 'active' : ''}`}
                style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
                onClick={() => onAdjustProperty('strokeColor', c)}
              />
            ))}
          </div>
        </div>

        {/* Fill Colors */}
        <div className="setting-group">
          <label className="setting-label">Background Fill</label>
          <div className="color-palette">
            {FILL_COLORS.map((c) => (
              <div
                key={c}
                className={`color-option ${fillColor === c ? 'active' : ''}`}
                style={{
                  backgroundColor: c === 'transparent' ? 'transparent' : c,
                  border: c === 'transparent' ? '2px dashed #4b5563' : 'none',
                  position: 'relative'
                }}
                onClick={() => onAdjustProperty('fillColor', c)}
              >
                {c === 'transparent' && (
                  <span style={{ fontSize: '10px', position: 'absolute', top: '1px', left: '6px' }}>×</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fill Styles */}
        {fillColor !== 'transparent' && (
          <div className="setting-group">
            <label className="setting-label">Fill Style</label>
            <div className="select-btn-group">
              <button
                className={`select-option-btn ${fillStyle === 'hachure' ? 'active' : ''}`}
                onClick={() => onAdjustProperty('fillStyle', 'hachure')}
              >
                Hachure
              </button>
              <button
                className={`select-option-btn ${fillStyle === 'solid' ? 'active' : ''}`}
                onClick={() => onAdjustProperty('fillStyle', 'solid')}
              >
                Solid
              </button>
            </div>
          </div>
        )}

        {/* Stroke Style */}
        <div className="setting-group">
          <label className="setting-label">Border Stroke</label>
          <div className="select-btn-group">
            <button
              className={`select-option-btn ${strokeStyle === 'solid' ? 'active' : ''}`}
              onClick={() => onAdjustProperty('strokeStyle', 'solid')}
            >
              Solid
            </button>
            <button
              className={`select-option-btn ${strokeStyle === 'dashed' ? 'active' : ''}`}
              onClick={() => onAdjustProperty('strokeStyle', 'dashed')}
            >
              Dashed
            </button>
            <button
              className={`select-option-btn ${strokeStyle === 'dotted' ? 'active' : ''}`}
              onClick={() => onAdjustProperty('strokeStyle', 'dotted')}
            >
              Dotted
            </button>
          </div>
        </div>

        {/* Stroke Width */}
        <div className="setting-group">
          <label className="setting-label">Stroke Width: {strokeWidth}px</label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={strokeWidth}
            onChange={e => onAdjustProperty('strokeWidth', parseInt(e.target.value))}
          />
        </div>

        {/* Opacity */}
        <div className="setting-group">
          <label className="setting-label">Opacity: {Math.round(opacity * 100)}%</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={e => onAdjustProperty('opacity', parseFloat(e.target.value))}
          />
        </div>

        {/* Canvas Background Color */}
        <div className="setting-group">
          <label className="setting-label">Canvas Background</label>
          <div className="color-palette">
            {CANVAS_BG_COLORS.map(c => (
              <div
                key={c}
                className={`color-option ${canvasBackgroundColor === c ? 'active' : ''}`}
                style={{
                  backgroundColor: c,
                  border: c === '#ffffff' ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.15)'
                }}
                onClick={() => onChangeBackground(c)}
              />
            ))}
          </div>
        </div>

        <div className="setting-group" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
          <button className="collab-btn secondary" onClick={onClearCanvas}>
            Clear Canvas
          </button>
        </div>
      </div>

      {/* Floating Toggle Button for Left Sidebar Settings */}
      {!isOpen && (
        <button
          className="sidebar-toggle-btn"
          style={{ left: '20px' }}
          onClick={onOpenSidebar}
          title="Open Canvas Styling"
        >
          <Settings size={20} />
        </button>
      )}
    </>
  );
});

CanvasStylingSidebar.displayName = 'CanvasStylingSidebar';
