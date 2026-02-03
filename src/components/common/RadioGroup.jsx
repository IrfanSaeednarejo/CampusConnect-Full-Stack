import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced RadioGroup Component with animations and accessibility
 */
const RadioGroup = ({
  options = [],
  value,
  onChange,
  name,
  disabled = false,
  size = 'md',
  orientation = 'vertical',
  className = '',
  ...props
}) => {
  const handleChange = (optionValue) => {
    if (!disabled) {
      onChange?.(optionValue);
    }
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div
      className={`flex ${orientation === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'} ${className}`}
      role="radiogroup"
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`inline-flex items-center cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            disabled={disabled}
            className="sr-only"
          />
          <motion.div
            className={`relative ${sizes[size]} border-2 rounded-full flex items-center justify-center ${
              value === option.value ? 'border-blue-500' : 'border-gray-300'
            } ${disabled ? 'opacity-50' : ''}`}
            whileTap={{ scale: disabled ? 1 : 0.9 }}
          >
            {value === option.value && (
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </motion.div>
          <span className={`ml-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

RadioGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  value: PropTypes.any,
  onChange: PropTypes.func,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  className: PropTypes.string
};

export default RadioGroup;