import { useNavigate } from "react-router-dom";

export default function ProfilePageHeader({
  title,
  action,
  onBack,
  backPath,
  className = "",
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

  return (
    <header
      className={`flex items-center justify-between border-b border-[#30363d] px-6 py-4 bg-[#161b22] ${className}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="text-white hover:text-[#238636] transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
