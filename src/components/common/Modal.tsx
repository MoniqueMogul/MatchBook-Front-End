'use client';

import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 480,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-base__overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className="modal-base__content"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-base__header">
            {title && <h2 className="modal-base__title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal-base__close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        <div className="modal-base__body">{children}</div>
      </div>
    </div>
  );
}