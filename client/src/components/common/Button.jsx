import React from "react";

export const buttonVariants = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary/40",
  secondary:
    "border border-border bg-surface text-text-primary hover:bg-surface-muted focus-visible:ring-primary/30",
  outline:
    "border border-border bg-transparent text-text-primary hover:bg-surface-muted focus-visible:ring-primary/30",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-muted focus-visible:ring-primary/30",
  danger:
    "bg-danger text-white hover:bg-danger-hover focus-visible:ring-danger/40",
  success:
    "bg-success text-white hover:bg-success-hover focus-visible:ring-success/40",
  warning:
    "bg-warning text-white hover:bg-warning-hover focus-visible:ring-warning/40",
  icon:
    "border border-border bg-surface text-text-primary hover:bg-surface-muted focus-visible:ring-primary/30",
};

export const buttonSizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
  iconSm: "h-8 w-8 p-0",
  iconMd: "h-10 w-10 p-0",
  iconLg: "h-11 w-11 p-0",
};

const legacySizeMap = {
  "icon-sm": "iconSm",
  "icon-md": "iconMd",
  "icon-lg": "iconLg",
  10: "iconMd",
  12: "iconLg",
};

export function getButtonClassName({
  variant = "primary",
  size = "md",
  className = "",
  iconOnly = false,
} = {}) {
  const mappedSize = legacySizeMap[size] || size;
  const resolvedSize =
    iconOnly && (mappedSize === "sm" || mappedSize === "md" || mappedSize === "lg")
      ? mappedSize === "sm"
        ? "iconSm"
        : mappedSize === "lg"
          ? "iconLg"
          : "iconMd"
      : mappedSize;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "disabled:pointer-events-none disabled:opacity-50";

  return [
    base,
    buttonVariants[variant] || buttonVariants.primary,
    buttonSizes[resolvedSize] || buttonSizes.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

const Button = React.forwardRef(
  (
    {
      children,
      type = "button",
      variant = "primary",
      size = "md",
      className = "",
      isDark: _isDark,
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={getButtonClassName({ variant, size, className })}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}

        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {leftIcon}
          </span>
        )}

        {children && <span>{children}</span>}

        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
