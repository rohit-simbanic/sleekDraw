import React from 'react';
import { X } from 'lucide-react';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = React.memo(({ toasts, onClose }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type} glass-panel`}>
          <span>{toast.message}</span>
          <button className="toast-close-btn" onClick={() => onClose(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';
