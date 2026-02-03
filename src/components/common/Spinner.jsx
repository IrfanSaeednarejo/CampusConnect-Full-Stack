import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced Spinner/Loader Component with multiple animations and variants
 * Supports different sizes, colors, and loading states
 */
const Spinner = React.forwardRef(({
  size = 'md',
  color = 'primary',
  variant = 'spinner',
  thickness = 'default',
  speed = 'normal',
  showText = false,
  text = 'Loading...',
  className = '',
  ...props
}, ref) => {
  // Size configurations
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    '2xl': 'w-12 h-12'
  };

  // Color variants
  const colors = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    white: 'text-white',
    black: 'text-black',
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-cyan-500'
  };

  // Thickness variants
  const thicknesses = {
    thin: 'border-2',
    default: 'border-2',
    thick: 'border-4',
    extra: 'border-8'
  };

  // Speed variants
  const speeds = {
    slow: 2,
    normal: 1,
    fast: 0.5,
    extra: 0.25
  };

  // Spinner variants
  const renderSpinner = () => {
    const duration = speeds[speed];

    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={`${sizes[size]} ${thicknesses[thickness]} ${colors[color]} border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 ${colors[color]} rounded-full`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`${sizes[size]} ${colors[color]} rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );

      case 'bars':
        return (
          <div className="flex space-x-0.5">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className={`w-1 ${colors[color]} rounded-full`}
                animate={{
                  height: ['0.5rem', '1.5rem', '0.5rem']
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
                style={{ height: '0.5rem' }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <div className="relative">
            <motion.div
              className={`${sizes[size]} ${thicknesses[thickness]} ${colors[color]} border-t-transparent rounded-full`}
              animate={{ rotate: 360 }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <motion.div
              className={`absolute inset-0 ${sizes[size]} ${thicknesses.thin} ${colors[color]} border-t-transparent rounded-full opacity-30`}
              animate={{ rotate: -360 }}
              transition={{
                duration: duration * 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>
        );

      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 ${colors[color]} rounded-full`}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="flex space-x-0.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className={`w-1 ${colors[color]} rounded-full`}
                animate={{
                  scaleY: [1, 0.3, 1]
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
                style={{ height: '1rem', transformOrigin: 'bottom' }}
              />
            ))}
          </div>
        );

      default:
        return renderSpinner();
    }
  };

  return (
    <div
      ref={ref}
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      {...props}
    >
      {renderSpinner()}

      {showText && (
        <motion.p
          className="mt-2 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}

      <span className="sr-only">{text}</span>
    </div>
  );
});

// Page-level loading overlay
Spinner.Overlay = ({
  isVisible = true,
  text = 'Loading...',
  backdropBlur = true,
  className = '',
  ...props
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        backdropBlur ? 'backdrop-blur-sm bg-black/20' : 'bg-white'
      } ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      {...props}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        {text && (
          <p className="text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </motion.div>
  );
};

// Inline loading state for buttons/forms
Spinner.Inline = ({
  isLoading = false,
  children,
  spinnerProps = {},
  className = '',
  ...props
}) => {
  if (!isLoading) return children;

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`} {...props}>
      <Spinner size="sm" {...spinnerProps} />
      {children}
    </div>
  );
};

// Skeleton loading component
Spinner.Skeleton = ({
  lines = 3,
  width = '100%',
  height = '1rem',
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <motion.div
          key={index}
          className="bg-gray-200 rounded"
          style={{
            width: Array.isArray(width) ? width[index % width.length] : width,
            height: Array.isArray(height) ? height[index % height.length] : height
          }}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'black', 'success', 'danger', 'warning', 'info']),
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse', 'bars', 'ring', 'bounce', 'wave']),
  thickness: PropTypes.oneOf(['thin', 'default', 'thick', 'extra']),
  speed: PropTypes.oneOf(['slow', 'normal', 'fast', 'extra']),
  showText: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string
};

Spinner.Overlay.propTypes = {
  isVisible: PropTypes.bool,
  text: PropTypes.string,
  backdropBlur: PropTypes.bool,
  className: PropTypes.string
};

Spinner.Inline.propTypes = {
  isLoading: PropTypes.bool,
  children: PropTypes.node,
  spinnerProps: PropTypes.object,
  className: PropTypes.string
};

Spinner.Skeleton.propTypes = {
  lines: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  className: PropTypes.string
};

Spinner.displayName = 'Spinner';

export default Spinner;