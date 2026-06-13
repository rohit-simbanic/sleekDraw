import React from 'react';
import { Download, Sparkles, Plus, Minus as ZoomOutIcon } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  exportToSVG: () => void;
  exportToPNG: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = React.memo(({
  zoom,
  zoomIn,
  zoomOut,
  resetZoom,
  exportToSVG,
  exportToPNG
}) => {
  return (
    <div className="glass-panel zoom-controls">
      <button className="tool-btn" onClick={exportToSVG} style={{ width: '32px', height: '32px' }}>
        <Download size={15} />
        <span className="tool-tooltip">Export SVG</span>
      </button>
      <button className="tool-btn" onClick={exportToPNG} style={{ width: '32px', height: '32px' }}>
        <Sparkles size={15} />
        <span className="tool-tooltip">Export PNG</span>
      </button>
      <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
      <button className="tool-btn" onClick={zoomOut} style={{ width: '32px', height: '32px' }}>
        <ZoomOutIcon size={16} />
      </button>
      <span className="zoom-value" onClick={resetZoom} style={{ cursor: 'pointer' }}>
        {Math.round(zoom * 100)}%
      </span>
      <button className="tool-btn" onClick={zoomIn} style={{ width: '32px', height: '32px' }}>
        <Plus size={16} />
      </button>
    </div>
  );
});

ZoomControls.displayName = 'ZoomControls';
