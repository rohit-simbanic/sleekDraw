import React from 'react';

interface ShareModalProps {
  isOpen: boolean;
  shareUrl: string;
  onClose: () => void;
  onCopy: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = React.memo(({
  isOpen,
  shareUrl,
  onClose,
  onCopy
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">Invite Collaborators</div>
        <div className="modal-body">
          This room is fully encrypted end-to-end. Share the link below with your peers to collaborate in real-time. The encryption key resides in the link hash and is never exposed to the server.
        </div>
        <div className="link-input-container">
          <input type="text" className="link-input" value={shareUrl} readOnly />
          <button
            className="collab-btn primary"
            style={{ width: 'auto' }}
            onClick={onCopy}
          >
            Copy
          </button>
        </div>
        <button className="collab-btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
});

ShareModal.displayName = 'ShareModal';
