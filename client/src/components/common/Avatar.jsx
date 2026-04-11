/**
 * Avatar Component
 * Reusable component for displaying user/profile images
 * Consolidates repeated avatar styling patterns across the application
 */
export default function Avatar({
  src,
  size = "10", // in Tailwind units: 8, 9, 10, 12, 16
  border = false,
  borderColor = "[#C7D2FE]",
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

  const borderClasses = border ? `border-2 border-${borderColor}` : "";
  const hoverClasses = hover
    ? "cursor-pointer hover:border hover:border-primary transition-colors"
    : "";

  return (
    <div
      className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full ${sizeClasses[size]} ${borderClasses} ${hoverClasses} ${className}`}
      style={{
        backgroundImage: `url(${src})`,
      }}
      aria-label={alt}
    />
  );
}
