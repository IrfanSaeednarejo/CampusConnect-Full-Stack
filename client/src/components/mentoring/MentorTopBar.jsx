import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";

const DEFAULT_AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgjnv-ixtGxRDh4QEaPBNUdMjXlCgO4Di7YsyjQZ_I21EDiOSRocUjGni8cViV_CJzUNuTwbKO6qL2ELKucJviHvtTGb5IoWrvryA6QiSKES--KcSvqsDWZ1KpSuZmk0lwuAdXOoKx29-hTfGzUVjUFmMfKN8ePF2jbbETEb-ZJ4sbGp0i5zNnzNhdXDhOyG5SRDAgKbhgIsTZDf5Qvwv7Du7ImY-uPgAE-OPeOuTdAxD6cykLE_jM18XdA4t_EU_5vQrYK9XVePg";

export default function MentorTopBar({
  backPath = "/mentor/dashboard",
  onBack,
  showBack = true,
  showNotifications = true,
  avatarSrc = DEFAULT_AVATAR_SRC,
  avatarSize = "10",
  avatarBorder = true,
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
      className={`flex items-center justify-between whitespace-nowrap border-b border-solid border-[#30363d] px-6 py-3 lg:px-10 bg-[#0d1117] ${className}`}
    >
      <div className="flex items-center gap-8">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center gap-4 text-white hover:text-[#1dc964] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div className="flex items-center gap-4 text-white">
          <svg
            className="size-6 text-[#1dc964]"
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
              fill="currentColor"
            ></path>
          </svg>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            CampusNexus
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showNotifications && (
          <button className="flex min-w-[40px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-2 bg-transparent text-white hover:bg-[#161b22] transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        )}
        <Avatar src={avatarSrc} size={avatarSize} border={avatarBorder} />
      </div>
    </header>
  );
}
