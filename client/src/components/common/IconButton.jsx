import React from "react";
import { getButtonClassName } from "./Button";

const iconSizeMap = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

const buttonSizeMap = {
  sm: "iconSm",
  md: "iconMd",
  lg: "iconLg",
  "icon-sm": "iconSm",
  "icon-md": "iconMd",
  "icon-lg": "iconLg",
};

const variantMap = {
  default: "icon",
  transparent: "ghost",
};

const IconButton = React.forwardRef(
  (
    {
      icon,
      label,
      title,
      variant = "ghost",
      size = "sm",
      className = "",
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const resolvedSize =
      size === "icon-sm" ? "sm" : size === "icon-md" ? "md" : size === "icon-lg" ? "lg" : size;
    const resolvedLabel = label || title || "";
    const resolvedVariant = variantMap[variant] || variant;

    const renderIcon =
      typeof icon === "string" ? (
        <span
          className={`material-symbols-outlined ${iconSizeMap[resolvedSize] || iconSizeMap.sm}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : (
        <span className="inline-flex items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      );

    return (
      <button
        ref={ref}
        type={type}
        aria-label={resolvedLabel}
        title={resolvedLabel}
        disabled={disabled}
        className={getButtonClassName({
          variant: resolvedVariant,
          size: buttonSizeMap[size] || buttonSizeMap[resolvedSize] || buttonSizeMap.sm,
          className,
        })}
        {...props}
      >
        {renderIcon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
