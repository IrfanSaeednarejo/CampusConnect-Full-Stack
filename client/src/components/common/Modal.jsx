import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import useHomeTheme from '../../hooks/useHomeTheme';
import IconButton from './IconButton';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md' 
}) => {
  const isDark = useHomeTheme();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const panelClass = 'border-border bg-surface';
  const headerClass = 'border-border';
  const titleClass = 'text-text-primary';
  const bodyTextClass = 'text-text-primary';
  const footerClass = 'border-border bg-background';

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-[95%]'
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full overflow-hidden rounded-2xl border animate-in zoom-in-95 duration-200 ${sizes[size]} ${panelClass}`}>
        <div className={`flex items-center justify-between border-b px-6 py-4 ${headerClass}`}>
          <h2 className={`text-xl font-semibold tracking-tight ${titleClass}`}>{title}</h2>
          <IconButton
            ref={closeButtonRef}
            onClick={onClose}
            className="shrink-0"
            label="Close modal"
            icon="close"
            variant="ghost"
            size="sm"
          />
        </div>
        
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className={bodyTextClass}>
            {children}
          </div>
        </div>
        
        {footer && (
          <div className={`flex justify-end gap-3 border-t px-6 py-4 ${footerClass}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
