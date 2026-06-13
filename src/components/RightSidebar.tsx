import React from 'react';
import { X, Share2, Copy, BookOpen } from 'lucide-react';
import type { PeerCursor, LibraryItemMetadata } from '../types';
import { LibraryShapePreview } from './LibraryShapePreview';

interface RightSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeRightTab: 'collab' | 'library';
  setActiveRightTab: (tab: 'collab' | 'library') => void;
  collabConnected: boolean;
  startCollaboration: () => void;
  setShowShareModal: (show: boolean) => void;
  username: string;
  setUsername: (name: string) => void;
  peerCursors: PeerCursor[];
  libSearchQuery: string;
  setLibSearchQuery: (query: string) => void;
  loadedLibrarySource: string | null;
  setLoadedLibrarySource: (src: string | null) => void;
  isCatalogLoading: boolean;
  isShapesLoading: boolean;
  libraryCatalog: LibraryItemMetadata[];
  loadedShapes: any[][];
  loadedItemNames: string[];
  loadLibraryShapes: (lib: LibraryItemMetadata) => void;
  insertLibraryShape: (shape: any) => void;
  onOpenSidebar: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = React.memo(({
  isOpen,
  setIsOpen,
  activeRightTab,
  setActiveRightTab,
  collabConnected,
  startCollaboration,
  setShowShareModal,
  username,
  setUsername,
  peerCursors,
  libSearchQuery,
  setLibSearchQuery,
  loadedLibrarySource,
  setLoadedLibrarySource,
  isCatalogLoading,
  isShapesLoading,
  libraryCatalog,
  loadedShapes,
  loadedItemNames,
  loadLibraryShapes,
  insertLibraryShape,
  onOpenSidebar
}) => {
  const filteredCatalog = React.useMemo(() => {
    const query = libSearchQuery.toLowerCase().trim();
    if (!query) return libraryCatalog;
    return libraryCatalog.filter(lib =>
      lib.name.toLowerCase().includes(query) ||
      lib.description.toLowerCase().includes(query)
    );
  }, [libraryCatalog, libSearchQuery]);

  return (
    <>
      <div className={`glass-panel right-panel ${isOpen ? 'open' : 'collapsed'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '4px' }}>
          <div className="right-panel-tabs" style={{ flex: 1 }}>
            <button
              className={`tab-btn ${activeRightTab === 'collab' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('collab')}
            >
              Collaboration
            </button>
            <button
              className={`tab-btn ${activeRightTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('library')}
            >
              Libraries
            </button>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            title="Collapse panel"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              padding: '6px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {activeRightTab === 'collab' ? (
          <>
            <div className="collab-status">
              <div className={`status-dot ${collabConnected ? 'connected' : ''}`} />
              <span>{collabConnected ? 'Live Session Connected' : 'Solo Session'}</span>
            </div>

            {!collabConnected ? (
              <button className="collab-btn primary" onClick={startCollaboration}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Share2 size={14} />
                  <span>Share Room</span>
                </div>
              </button>
            ) : (
              <>
                <button className="collab-btn secondary" onClick={() => setShowShareModal(true)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Copy size={14} />
                    <span>Copy Share Link</span>
                  </div>
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="setting-label">Your Username</label>
                  <input
                    type="text"
                    className="link-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    maxLength={12}
                  />
                </div>
                {peerCursors.length > 0 && (
                  <div className="peers-list">
                    <div className="setting-label" style={{ marginBottom: '2px' }}>Active Collaborators:</div>
                    {peerCursors.map(p => (
                      <div key={p.socketId} className="peer-row">
                        <div className="peer-dot" style={{ backgroundColor: p.color }} />
                        <span>{p.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="libraries-container">
            <input
              type="text"
              className="link-input"
              placeholder="Search libraries..."
              value={libSearchQuery}
              onChange={e => {
                setLibSearchQuery(e.target.value);
                setLoadedLibrarySource(null); // Reset shapes view when searching
              }}
            />

            {isCatalogLoading ? (
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', padding: '16px' }}>
                Loading libraries catalog...
              </div>
            ) : (
              <div className="lib-list">
                {loadedLibrarySource ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="collab-btn secondary" onClick={() => setLoadedLibrarySource(null)} style={{ fontSize: '10px', padding: '6px' }}>
                      ← Back to Directory
                    </button>
                    {isShapesLoading ? (
                      <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', padding: '10px' }}>
                        Downloading shapes...
                      </div>
                    ) : (
                      <>
                        <div className="setting-label">Click shape to add to canvas:</div>
                        <div className="lib-shapes-grid">
                          {loadedShapes.map((shapeGroup, idx) => {
                            const name = loadedItemNames[idx] || `Shape ${idx + 1}`;
                            return (
                              <div
                                key={idx}
                                className="lib-shape-card"
                                onClick={() => insertLibraryShape(shapeGroup)}
                                title={name}
                              >
                                <LibraryShapePreview shapeGroup={shapeGroup} />
                                <span className="lib-shape-name">{name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  filteredCatalog.map(lib => (
                    <div key={lib.id} className="lib-item">
                      <div className="lib-name">{lib.name}</div>
                      <div className="lib-desc">{lib.description}</div>
                      <div className="lib-meta">By {lib.authors.map(a => a.name).join(', ')}</div>
                      <button
                        className="collab-btn primary"
                        style={{ fontSize: '10px', padding: '6px' }}
                        onClick={() => loadLibraryShapes(lib)}
                      >
                        Browse Shapes
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Toggle Button for Right Sidebar (Collaboration & Libraries) */}
      {!isOpen && (
        <button
          className="sidebar-toggle-btn"
          style={{ right: '20px' }}
          onClick={onOpenSidebar}
          title="Open Collaboration & Libraries"
        >
          <BookOpen size={20} />
        </button>
      )}
    </>
  );
});

RightSidebar.displayName = 'RightSidebar';
