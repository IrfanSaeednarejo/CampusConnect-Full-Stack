export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  ...props
}) {
  const baseStyles =
    "flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 md:h-12 px-4 md:px-5 text-sm md:text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#238636] text-white hover:bg-[#2ea043] disabled:hover:bg-[#238636]",
    secondary:
      "bg-[#161b22] text-[#e6edf3] border border-[#30363d] hover:bg-[#21262d] disabled:hover:bg-[#161b22]",
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
