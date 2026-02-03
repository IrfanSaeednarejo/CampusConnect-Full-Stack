import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * Advanced Badge Component with variants, animations, and interactive features
 * Supports dots, counters, removable badges, and custom styling
 */
const Badge = React.forwardRef(
  (
    {
      children,
      variant = "default",
      size = "md",
      color = "primary",
      dot = false,
      count,
      maxCount = 99,
      showZero = false,
      removable = false,
      onRemove,
      onClick,
      animate = true,
      className = "",
      ...props
    },
    ref
  ) => {
    // Color variants
    const colors = {
      primary: {
        background: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500",
      },
      secondary: {
        background: "bg-gray-100",
        text: "text-gray-800",
        dot: "bg-gray-500",
      },
      success: {
        background: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-500",
      },
      danger: {
        background: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
      },
      warning: {
        background: "bg-yellow-100",
        text: "text-yellow-800",
        dot: "bg-yellow-500",
      },
      info: {
        background: "bg-cyan-100",
        text: "text-cyan-800",
        dot: "bg-cyan-500",
      },
      light: {
        background: "bg-gray-50",
        text: "text-gray-600",
        dot: "bg-gray-400",
      },
      dark: {
        background: "bg-gray-800",
        text: "text-white",
        dot: "bg-gray-600",
      },
    };

    // Size variants
    const sizes = {
      xs: "px-1.5 py-0.5 text-xs",
      sm: "px-2 py-1 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
      xl: "px-4 py-2 text-lg",
    };

    // Variant styles
    const variants = {
      default: "rounded-full",
      rounded: "rounded-lg",
      square: "rounded-none",
      pill: "rounded-full px-3",
    };

    // Display count with max limit
    const displayCount = React.useMemo(() => {
      if (count === undefined || count === null) return null;
      if (count === 0 && !showZero) return null;
      if (count > maxCount) return `${maxCount}+`;
      return count.toString();
    }, [count, maxCount, showZero]);

    // Handle remove
    const handleRemove = (e) => {
      e.stopPropagation();
      onRemove?.();
    };

    // Handle click
    const handleClick = (e) => {
      if (removable) return; // Don't trigger click if removable
      onClick?.(e);
    };

    // Combine classes
    const badgeClasses = [
      "inline-flex items-center font-medium transition-all duration-200",
      colors[color].background,
      colors[color].text,
      sizes[size],
      variants[variant],
      onClick || removable ? "cursor-pointer hover:shadow-md" : "",
      animate ? "transform hover:scale-105" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Animation variants
    const badgeVariants = {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
    };

    const countVariants = {
      initial: { scale: 0 },
      animate: { scale: 1 },
      exit: { scale: 0 },
    };

    return (
      <motion.div
        ref={ref}
        className={badgeClasses}
        onClick={handleClick}
        variants={animate ? badgeVariants : {}}
        initial={animate ? "initial" : {}}
        animate={animate ? "animate" : {}}
        exit={animate ? "exit" : {}}
        whileHover={animate ? { scale: 1.05 } : {}}
        whileTap={animate ? { scale: 0.95 } : {}}
        layout
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <motion.span
            className={`w-2 h-2 ${colors[color].dot} rounded-full mr-1.5 flex-shrink-0`}
            variants={animate ? countVariants : {}}
            initial={animate ? "initial" : {}}
            animate={animate ? "animate" : {}}
            exit={animate ? "exit" : {}}
          />
        )}

        {/* Content */}
        {children}

        {/* Count */}
        {displayCount && (
          <motion.span
            className="ml-1 font-semibold"
            variants={animate ? countVariants : {}}
            initial={animate ? "initial" : {}}
            animate={animate ? "animate" : {}}
            exit={animate ? "exit" : {}}
            key={displayCount} // Re-animate when count changes
          >
            {displayCount}
          </motion.span>
        )}

        {/* Remove button */}
        {removable && (
          <motion.button
            type="button"
            className="ml-1 p-0.5 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
            onClick={handleRemove}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Remove badge"
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </motion.button>
        )}
      </motion.div>
    );
  }
);

// Badge Group component for managing multiple badges
Badge.Group = ({
  badges,
  maxVisible,
  showMore = true,
  onMoreClick,
  spacing = "sm",
  className = "",
  ...props
}) => {
  const visibleBadges = maxVisible ? badges.slice(0, maxVisible) : badges;
  const remainingCount = badges.length - visibleBadges.length;

  const spacingClasses = {
    xs: "space-x-1",
    sm: "space-x-2",
    md: "space-x-3",
    lg: "space-x-4",
  };

  return (
    <div
      className={`flex flex-wrap ${spacingClasses[spacing]} ${className}`}
      {...props}
    >
      {visibleBadges.map((badge, index) => (
        <Badge key={badge.id || index} {...badge} />
      ))}

      {showMore && remainingCount > 0 && (
        <Badge
          variant="rounded"
          color="secondary"
          onClick={onMoreClick}
          className="cursor-pointer"
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

// Notification Badge component
Badge.Notification = ({
  count,
  maxCount = 99,
  showZero = false,
  animate = true,
  className = "",
  children,
  ...props
}) => {
  const displayCount = React.useMemo(() => {
    if (count === 0 && !showZero) return null;
    if (count > maxCount) return `${maxCount}+`;
    return count.toString();
  }, [count, maxCount, showZero]);

  if (!displayCount) return children || null;

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <motion.div
        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1"
        variants={
          animate
            ? {
                initial: { scale: 0 },
                animate: { scale: 1 },
                pulse: {
                  scale: [1, 1.1, 1],
                  transition: {
                    duration: 0.3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  },
                },
              }
            : {}
        }
        initial={animate ? "initial" : {}}
        animate={animate ? ["animate", "pulse"] : {}}
        {...props}
      >
        {displayCount}
      </motion.div>
    </div>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["default", "rounded", "square", "pill"]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
  ]),
  dot: PropTypes.bool,
  count: PropTypes.number,
  maxCount: PropTypes.number,
  showZero: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
  animate: PropTypes.bool,
  className: PropTypes.string,
};

Badge.Group.propTypes = {
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      children: PropTypes.node,
      variant: PropTypes.string,
      color: PropTypes.string,
      removable: PropTypes.bool,
      onRemove: PropTypes.func,
    })
  ).isRequired,
  maxVisible: PropTypes.number,
  showMore: PropTypes.bool,
  onMoreClick: PropTypes.func,
  spacing: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
  className: PropTypes.string,
};

Badge.Notification.propTypes = {
  count: PropTypes.number,
  maxCount: PropTypes.number,
  showZero: PropTypes.bool,
  animate: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

Badge.displayName = "Badge";

export default Badge;
