import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Advanced Snackbar Component with auto-dismiss and animations
 */
const Snackbar = ({
  isOpen,
  message,
  type = 'info',
  duration = 4000,
  onClose,
  action,
  position = 'bottom-right',
  className = '',
  ...props
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const types = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const snackbarContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed ${positions[position]} z-50 max-w-sm w-full ${className}`}
          initial={{ opacity: 0, y: position.includes('top') ? -50 : 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.includes('top') ? -50 : 50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          {...props}
        >
          <div className={`p-4 rounded-lg shadow-lg ${types[type]} flex items-center justify-between`}>
            <span className="flex-1">{message}</span>
            <div className="flex items-center space-x-2 ml-4">
              {action}
              <button
                onClick={onClose}
                className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(snackbarContent, document.body);
};

Snackbar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  action: PropTypes.node,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center']),
  className: PropTypes.string
};

export default Snackbar;