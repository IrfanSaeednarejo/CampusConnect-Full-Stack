export default function Badge({ children, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-[#238636] text-white",
    secondary: "bg-[#161b22] text-[#8b949e] border border-[#30363d]",
    info: "bg-[#1f6feb] text-white",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
