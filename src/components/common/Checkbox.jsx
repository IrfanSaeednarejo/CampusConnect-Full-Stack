import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced Checkbox Component with animations and accessibility
 */
const Checkbox = React.forwardRef(({
  checked = false,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked, e);
    }
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
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
        className={`relative ${sizes[size]} border-2 rounded flex items-center justify-center ${
          checked || indeterminate ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
      >
        <motion.span
          className="text-white text-sm"
          initial={false}
          animate={{
            scale: checked || indeterminate ? 1 : 0,
            opacity: checked || indeterminate ? 1 : 0
          }}
        >
          {indeterminate ? '−' : '✓'}
        </motion.span>
      </motion.div>
      {label && (
        <span className={`ml-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  indeterminate: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;