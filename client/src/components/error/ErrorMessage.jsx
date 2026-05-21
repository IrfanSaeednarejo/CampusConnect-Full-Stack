import useHomeTheme from "../../hooks/useHomeTheme";

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  variant = "error",
  className = "",
}) {
  const isDark = useHomeTheme();

  const variantStyles = {
    error: "border-[#f85149] text-[#f85149]",
    warning: "border-[#d29922] text-[#d29922]",
    info: "border-[#58a6ff] text-[#58a6ff]",
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${isDark ? "bg-[#0d1117]" : "bg-white shadow-sm"} ${variantStyles[variant] || variantStyles.error} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined">error</span>
        <div className="flex flex-col gap-1">
          <p className={`font-semibold ${isDark ? "text-[#e6edf3]" : "text-slate-900"}`}>{title}</p>
          {message && <p className={`text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
