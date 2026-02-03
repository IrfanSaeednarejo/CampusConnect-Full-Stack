import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * Advanced Button Component with multiple variants, sizes, and states
 * Supports loading states, icons, animations, and accessibility features
 */
const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      rounded = false,
      className = "",
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    // Variant styles
    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl",
      secondary:
        "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-lg hover:shadow-xl",
      success:
        "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-xl",
      danger:
        "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl",
      warning:
        "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-lg hover:shadow-xl",
      outline:
        "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 bg-transparent",
      ghost:
        "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 bg-transparent",
      link: "text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline focus:ring-blue-500 bg-transparent shadow-none hover:shadow-none",
    };

    // Size styles
    const sizes = {
      xs: "px-2.5 py-1.5 text-xs gap-1",
      sm: "px-3 py-2 text-sm gap-1.5",
      md: "px-4 py-2 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2",
      xl: "px-8 py-4 text-xl gap-3",
    };

    // Loading spinner component
    const LoadingSpinner = () => (
      <motion.div
        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    );

    // Icon positioning
    const renderIcon = () => {
      if (!icon) return null;

      const iconElement = React.isValidElement(icon) ? (
        icon
      ) : (
        <span className="material-symbols-outlined text-lg">{icon}</span>
      );

      return React.cloneElement(iconElement, {
        className: `${iconElement.props.className || ""} flex-shrink-0`,
      });
    };

    // Combine classes
    const buttonClasses = [
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth ? "w-full" : "",
      rounded ? "rounded-full" : "rounded-lg",
      loading ? "cursor-wait" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Handle click with loading prevention
    const handleClick = (e) => {
      if (loading || disabled) return;
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        {...props}
      >
        {loading && iconPosition === "left" && <LoadingSpinner />}
        {icon && iconPosition === "left" && !loading && renderIcon()}
        {loading ? "Loading..." : children}
        {icon && iconPosition === "right" && renderIcon()}
        {loading && iconPosition === "right" && <LoadingSpinner />}
      </motion.button>
    );
  }
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "outline",
    "ghost",
    "link",
  ]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  iconPosition: PropTypes.oneOf(["left", "right"]),
  fullWidth: PropTypes.bool,
  rounded: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

Button.displayName = "Button";

export default Button;
