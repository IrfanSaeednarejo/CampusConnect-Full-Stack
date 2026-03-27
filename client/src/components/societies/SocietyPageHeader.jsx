import { useNavigate } from "react-router-dom";

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
    if (!icon) {
      return null;
    }
    if (typeof icon === "string") {
      return (
        <span className="material-symbols-outlined text-4xl text-[#1dc964]">
          {icon}
        </span>
      );
    }
    return icon;
  };

  return (
    <header
      className={`bg-[#1a241e] border-b border-[#29382f] ${
        sticky ? "sticky top-0 z-10" : ""
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-[#9eb7a9] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  arrow_back
                </span>
                <span className="text-sm font-medium">{backLabel}</span>
              </button>
            )}
            {icon && (
              <div className="flex items-center gap-3">
                {renderIcon()}
                <div>
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-[#9eb7a9]">{subtitle}</p>
                  )}
                </div>
              </div>
            )}
            {!icon && title && (
              <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-[#9eb7a9]">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
      </div>
    </header>
  );
}
