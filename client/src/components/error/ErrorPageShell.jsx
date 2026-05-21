import useHomeTheme from "../../hooks/useHomeTheme";

export default function ErrorPageShell({
  icon,
  iconClassName = "",
  code,
  title,
  message,
  actions,
  footer,
  className = "",
}) {
  const isDark = useHomeTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-[#0d1117]" : "bg-slate-50"} ${className}`}
    >
      <div className="max-w-md text-center">
        {icon && (
          <div className="mb-6">
            <span className={`material-symbols-outlined text-8xl ${iconClassName}`}>{icon}</span>
          </div>
        )}
        {code && <h1 className={`mb-4 text-5xl font-bold ${isDark ? "text-[#e6edf3]" : "text-slate-900"}`}>{code}</h1>}
        {title && <h2 className={`mb-4 text-3xl font-bold ${isDark ? "text-[#e6edf3]" : "text-slate-900"}`}>{title}</h2>}
        {message && <p className={`mb-8 text-xl ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{message}</p>}
        {actions && <div className="flex flex-col justify-center gap-4 sm:flex-row">{actions}</div>}
        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </div>
  );
}
