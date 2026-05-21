import { useNavigate } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function ProfilePageHeader({
  title,
  action,
  onBack,
  backPath,
  className = "",
}) {
  const navigate = useNavigate();
  const isDark = useHomeTheme();

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

  return (
    <header
      className={`flex items-center justify-between border-b px-6 py-4 transition-colors duration-300 ${
        isDark
          ? "border-border-dark bg-surface-dark"
          : "border-border-light bg-surface-light"
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className={`transition-colors ${
            isDark
              ? "text-text-primary-dark hover:text-primary-dark"
              : "text-text-primary-light hover:text-primary-light"
          }`}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className={`text-xl font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
