import { useNavigate } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function PageHeader({
  title,
  subtitle,
  icon,
  backPath,
  onBack,
  action,
  className = "",
  sticky = false,
  showBack = true,
  isDark,
}) {
  const navigate = useNavigate();
  const themeIsDark = useHomeTheme();
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : themeIsDark;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`border-b py-6 ${
        resolvedIsDark
          ? "border-[#30363d] bg-[#0d1117]"
          : "border-[#DCE4EE] bg-white/90 backdrop-blur-xl"
      } ${sticky ? "sticky top-0 z-10" : ""} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={handleBack}
                className={`transition-colors ${
                  resolvedIsDark
                    ? "text-[#8b949e] hover:text-[#c9d1d9]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
                aria-label="Go back"
              >
                <span className="material-symbols-outlined text-2xl">
                  arrow_back
                </span>
              </button>
            )}
            {icon && (
              <span
                className={`material-symbols-outlined text-3xl ${
                  resolvedIsDark ? "text-[#238636]" : "text-[#1D4ED8]"
                }`}
              >
                {icon}
              </span>
            )}
            <div>
              <h1
                className={`text-2xl font-bold ${
                  resolvedIsDark ? "text-[#c9d1d9]" : "text-[#0F172A]"
                }`}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={`mt-1 text-sm ${
                    resolvedIsDark ? "text-[#8b949e]" : "text-[#64748B]"
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    </header>
  );
}
