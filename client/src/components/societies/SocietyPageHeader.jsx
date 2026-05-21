import { useNavigate } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getSocietyTheme } from "../../pages/Societies/societyTheme";

export default function SocietyPageHeader({
  title,
  subtitle,
  icon,
  backPath,
  backLabel = "Back",
  onBack,
  action,
  className = "",
  sticky = true,
  showBack = true,
}) {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backPath) {
      navigate(backPath);
      return;
    }
    navigate(-1);
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return (
        <span className={cn("material-symbols-outlined text-3xl", isDark ? "text-emerald-400" : "text-emerald-600")}>
          {icon}
        </span>
      );
    }
    return icon;
  };

  return (
    <header
      className={cn(
        "border-b backdrop-blur-sm",
        theme.header,
        sticky && "sticky top-0 z-10",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {showBack && (
              <button
                onClick={handleBack}
                className={cn(
                  "inline-flex w-fit items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm font-medium transition-colors",
                  theme.secondaryButton
                )}
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>{backLabel}</span>
              </button>
            )}

            <div className="flex items-start gap-4">
              {icon && (
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border", theme.badge)}>
                  {renderIcon()}
                </div>
              )}
              <div className="space-y-1">
                {title && <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>{title}</h1>}
                {subtitle && <p className={cn("text-sm sm:text-base", theme.muted)}>{subtitle}</p>}
              </div>
            </div>
          </div>

          {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
      </div>
    </header>
  );
}
