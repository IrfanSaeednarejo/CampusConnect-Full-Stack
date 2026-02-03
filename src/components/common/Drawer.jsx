import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Advanced Drawer Component with slide animations
 */
const Drawer = ({
  isOpen,
  onClose,
  position = 'right',
  children,
  title,
  className = '',
  ...props
}) => {
  const positions = {
    left: { x: '-100%' },
    right: { x: '100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' }
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed z-50 bg-white shadow-xl ${className}`}
            style={{
              [position === 'left' || position === 'right' ? 'top' : 'left']: 0,
              [position === 'left' || position === 'right' ? 'bottom' : 'right']: 0,
              [position === 'left' || position === 'right' ? 'width' : 'height']: '300px'
            }}
            initial={positions[position]}
            animate={{ x: 0, y: 0 }}
            exit={positions[position]}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            {...props}
          >
            {title && (
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
};

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
};

export default Drawer;