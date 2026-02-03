import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Advanced Popover Component with positioning and animations
 */
const Popover = React.forwardRef(({
  trigger,
  content,
  placement = 'bottom',
  trigger: triggerType = 'click',
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const positions = {
    top: { top: -10, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: -10, left: '50%', transform: 'translateX(-50%)' },
    left: { left: -10, top: '50%', transform: 'translateY(-50%)' },
    right: { right: -10, top: '50%', transform: 'translateY(-50%)' }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        ref={triggerRef}
        onClick={triggerType === 'click' ? handleToggle : undefined}
        onMouseEnter={triggerType === 'hover' ? () => setIsOpen(true) : undefined}
        onMouseLeave={triggerType === 'hover' ? handleClose : undefined}
      >
        {trigger}
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={popoverRef}
              className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
              style={positions[placement]}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              {...props}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
});

Popover.propTypes = {
  trigger: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  trigger: PropTypes.oneOf(['click', 'hover']),
  className: PropTypes.string
};

Popover.displayName = 'Popover';

export default Popover;