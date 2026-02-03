import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced IconButton Component with hover effects and accessibility
 */
const IconButton = React.forwardRef(({
  icon,
  size = 'md',
  variant = 'ghost',
  color = 'default',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const variants = {
    solid: 'bg-gray-900 text-white hover:bg-gray-800',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    link: 'text-blue-600 hover:text-blue-800 hover:underline'
  };

  const colors = {
    default: '',
    primary: 'text-blue-600 hover:text-blue-700',
    success: 'text-green-600 hover:text-green-700',
    danger: 'text-red-600 hover:text-red-700',
    warning: 'text-yellow-600 hover:text-yellow-700'
  };

  const handleClick = (e) => {
    if (!disabled && !loading) {
      onClick?.(e);
    }
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`inline-flex items-center justify-center rounded-full transition-colors ${sizes[size]} ${variants[variant]} ${colors[color]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <span className="material-symbols-outlined">
          {icon}
        </span>
      )}
    </motion.button>
  );
});

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['solid', 'outline', 'ghost', 'link']),
  color: PropTypes.oneOf(['default', 'primary', 'success', 'danger', 'warning']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

IconButton.displayName = 'IconButton';

export default IconButton;