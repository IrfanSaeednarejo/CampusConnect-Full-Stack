/**
 * Avatar Component
 * Reusable component for displaying user/profile images
 * Consolidates repeated avatar styling patterns across the application
 */
export default function Avatar({
  src,
  size = "10", // in Tailwind units: 8, 9, 10, 12, 16
  border = false,
  borderColor = "[#30363d]",
  hover = false,
  className = "",
  alt = "Avatar",
}) {
  const sizeClasses = {
    8: "size-8",
    9: "size-9",
    10: "size-10",
    12: "size-12",
    16: "size-16",
  };

  const borderColorClasses = {
    "[#30363d]": "border-[#30363d]",
  };

  const borderClasses = border ? `border-2 ${borderColorClasses[borderColor] || ""}` : "";
  const hoverClasses = hover
    ? "cursor-pointer hover:border hover:border-[#238636] transition-colors"
    : "";

  const accessibilityProps = alt
    ? { role: "img", "aria-label": alt }
    : { role: "img", "aria-hidden": true };

  return (
    <div
      className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full ${sizeClasses[size]} ${borderClasses} ${hoverClasses} ${className}`}
      style={{
        backgroundImage: `url(${src})`,
      }}
      {...accessibilityProps}
    />
  );
}
