import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced Avatar Component with fallback generation, status indicators, and animations
 * Supports images, initials, icons, and online/offline status
 */
const Avatar = React.forwardRef(({
  src,
  alt = '',
  name = '',
  size = 'md',
  variant = 'circular',
  status = null,
  statusPosition = 'bottom-right',
  showBorder = false,
  borderColor = 'white',
  borderWidth = 2,
  fallbackIcon,
  fallbackColor = 'bg-gray-400',
  className = '',
  onClick,
  onError,
  animateOnLoad = true,
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Size configurations
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl'
  };

  // Variant styles
  const variants = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };

  // Status indicator sizes
  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
    '3xl': 'w-6 h-6'
  };

  // Status colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    invisible: 'bg-gray-300'
  };

  // Generate initials from name
  const initials = useMemo(() => {
    if (!name) return '?';

    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }, [name]);

  // Generate fallback color based on name
  const fallbackColorFromName = useMemo(() => {
    if (!name) return fallbackColor;

    const colors = [
      'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-yellow-400',
      'bg-lime-400', 'bg-green-400', 'bg-emerald-400', 'bg-teal-400',
      'bg-cyan-400', 'bg-sky-400', 'bg-blue-400', 'bg-indigo-400',
      'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400',
      'bg-rose-400'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }, [name, fallbackColor]);

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    onError?.();
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Render fallback content (initials or icon)
  const renderFallback = () => {
    if (fallbackIcon) {
      return React.isValidElement(fallbackIcon) ? fallbackIcon : (
        <span className="material-symbols-outlined">{fallbackIcon}</span>
      );
    }

    return <span className="font-semibold text-white">{initials}</span>;
  };

  // Status indicator component
  const StatusIndicator = () => {
    if (!status) return null;

    const positionClasses = {
      'top-left': '-top-1 -left-1',
      'top-right': '-top-1 -right-1',
      'bottom-left': '-bottom-1 -left-1',
      'bottom-right': '-bottom-1 -right-1'
    };

    return (
      <motion.div
        className={`absolute ${positionClasses[statusPosition]} ${statusSizes[size]} ${statusColors[status]} border-2 border-white rounded-full shadow-sm`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    );
  };

  // Combine classes
  const avatarClasses = [
    'relative inline-flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat',
    sizes[size],
    variants[variant],
    fallbackColorFromName,
    showBorder ? `border-${borderWidth} border-${borderColor}` : '',
    onClick ? 'cursor-pointer hover:scale-105 transition-transform' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      ref={ref}
      className={avatarClasses}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      {...props}
    >
      {/* Image */}
      {src && !imageError && (
        <motion.img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          initial={animateOnLoad ? { opacity: 0, scale: 0.8 } : {}}
          animate={animateOnLoad ? { opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.8 } : {}}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}

      {/* Fallback */}
      {(!src || imageError) && (
        <motion.div
          className="flex items-center justify-center w-full h-full"
          initial={animateOnLoad ? { opacity: 0, scale: 0.8 } : {}}
          animate={animateOnLoad ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {renderFallback()}
        </motion.div>
      )}

      {/* Status Indicator */}
      <StatusIndicator />

      {/* Loading overlay */}
      {animateOnLoad && src && !imageLoaded && !imageError && (
        <motion.div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
});

// Avatar Group component for displaying multiple avatars
Avatar.Group = ({
  avatars,
  max = 5,
  size = 'md',
  spacing = 'overlap',
  showMore = true,
  className = '',
  ...props
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const spacingClasses = {
    overlap: '-space-x-2',
    separate: 'space-x-1'
  };

  return (
    <div className={`flex ${spacingClasses[spacing]} ${className}`} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          {...avatar}
          size={size}
          className="ring-2 ring-white"
        />
      ))}

      {showMore && remainingCount > 0 && (
        <motion.div
          className={`flex items-center justify-center ${Avatar.sizes[size]} bg-gray-400 text-white text-sm font-semibold rounded-full ring-2 ring-white`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: visibleAvatars.length * 0.1 }}
        >
          +{remainingCount}
        </motion.div>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy', 'invisible']),
  statusPosition: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  showBorder: PropTypes.bool,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number,
  fallbackIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  fallbackColor: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  onError: PropTypes.func,
  animateOnLoad: PropTypes.bool
};

Avatar.Group.propTypes = {
  avatars: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      src: PropTypes.string,
      name: PropTypes.string,
      status: PropTypes.oneOf(['online', 'offline', 'away', 'busy', 'invisible'])
    })
  ).isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  spacing: PropTypes.oneOf(['overlap', 'separate']),
  showMore: PropTypes.bool,
  className: PropTypes.string
};

Avatar.displayName = 'Avatar';

export default Avatar;