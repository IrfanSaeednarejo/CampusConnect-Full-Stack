export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  ...props
}) {
  const baseStyles =
    "flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 md:h-12 px-4 md:px-5 text-sm md:text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover disabled:hover:bg-primary",
    secondary:
      "bg-surface text-text-primary border border-border hover:bg-surface-hover disabled:hover:bg-surface",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className="truncate">{children}</span>
    </button>
  );
}
