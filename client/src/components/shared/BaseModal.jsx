import React, { useEffect } from 'react';
import { useModal } from '../../contexts/ModalContext';

export default function BaseModal({ children, size = 'md' }) {
  const { closeModal } = useModal();

  // Handle Escape key closure
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={closeModal} // Click backdrop to close
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/50 transition-opacity" 
        style={{ backdropFilter: 'blur(4px)' }} 
      />

      {/* Modal Panel */}
      <div
        className={`relative z-10 w-full ${sizeClasses[size] || sizeClasses.md} transform transition-all animate-in fade-in zoom-in-95 duration-200 ease-out`}
        onClick={(e) => e.stopPropagation()} // Stop backdrop click
      >
        <div className="bg-surface border border-border rounded-xl shadow-2xl p-6 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
