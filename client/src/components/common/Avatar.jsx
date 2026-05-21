/**
 * Avatar Component
 * Reusable component for displaying user/profile images
 * Consolidates repeated avatar styling patterns across the application
 */
import React, { useMemo, useState } from "react";

export default function Avatar({
  src,
  size = "10", // in Tailwind units: 8, 9, 10, 12, 16
  border = false,
  borderColor = "[#30363d]",
  hover = false,
  className = "",
  alt = "Avatar",
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    8: "size-8",
    9: "size-9",
    10: "size-10",
    12: "size-12",
    14: "size-14",
    16: "size-16",
  };

  const borderColorClasses = {
    "[#30363d]": "border-[#30363d]",
  };

  const borderClasses = border ? `border-2 ${borderColorClasses[borderColor] || ""}` : "";
  const hoverClasses = hover
    ? "cursor-pointer hover:border hover:border-[#238636] transition-colors"
    : "";
  const resolvedSizeClass = sizeClasses[size] || sizeClasses[10];
  const initial = useMemo(() => {
    const source = alt && alt !== "Avatar" ? alt : "U";
    return source.trim().charAt(0).toUpperCase() || "U";
  }, [alt]);

  const accessibilityProps = alt
    ? { role: "img", "aria-label": alt }
    : { role: "img", "aria-hidden": true };

  if (!src || hasError) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full border border-border bg-surface-muted text-sm font-semibold text-text-secondary ${resolvedSizeClass} ${borderClasses} ${hoverClasses} ${className}`}
        {...accessibilityProps}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`aspect-square rounded-full object-cover bg-surface-muted ${resolvedSizeClass} ${borderClasses} ${hoverClasses} ${className}`}
      {...accessibilityProps}
    />
  );
}
