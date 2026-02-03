import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced Switch Component with smooth animations
 */
const Switch = React.forwardRef(({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = '',
  ...props
}, ref) => {
  const handleChange = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const sizes = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
    lg: 'w-12 h-6'
  };

  const knobSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'cursor-not-allowed' : ''} ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <motion.div
        className={`relative ${sizes[size]} rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
        onClick={handleChange}
      >
        <motion.div
          className={`absolute top-0.5 ${knobSizes[size]} bg-white rounded-full shadow`}
          animate={{
            left: checked ? (size === 'sm' ? '12px' : size === 'md' ? '18px' : '24px') : '2px'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </motion.div>
      {label && (
        <span className={`ml-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
});

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  className: PropTypes.string
};

Switch.displayName = 'Switch';

export default Switch;