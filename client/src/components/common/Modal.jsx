import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

/**
 * Reusable Modal component for interactive overlays.
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-[95%]'
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose} 
      />
      
      {/* Container */}
      <div className={`relative w-full ${sizes[size]} bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="text-[#c9d1d9]">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[#0d1117] border-t border-[#30363d] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
