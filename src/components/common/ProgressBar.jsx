import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced ProgressBar Component with animations and variants
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  color = 'blue',
  animated = true,
  className = '',
  ...props
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}

      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`${colors[color]} h-full rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'striped', 'animated']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showLabel: PropTypes.bool,
  label: PropTypes.string,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple']),
  animated: PropTypes.bool,
  className: PropTypes.string
};

export default ProgressBar;