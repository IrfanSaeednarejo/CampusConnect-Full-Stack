import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MentorUserMenu from "./MentorUserMenu";

const DEFAULT_AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgjnv-ixtGxRDh4QEaPBNUdMjXlCgO4Di7YsyjQZ_I21EDiOSRocUjGni8cViV_CJzUNuTwbKO6qL2ELKucJviHvtTGb5IoWrvryA6QiSKES--KcSvqsDWZ1KpSuZmk0lwuAdXOoKx29-hTfGzUVjUFmMfKN8ePF2jbbETEb-ZJ4sbGp0i5zNnzNhdXDhOyG5SRDAgKbhgIsTZDf5Qvwv7Du7ImY-uPgAE-OPeOuTdAxD6cykLE_jM18XdA4t_EU_5vQrYK9XVePg";

export default function MentorTopBar({
  backPath = "/mentor/dashboard",
  onBack,
  showBack = true,
  showNotifications = true,
  avatarSize = "10",
  avatarBorder = true,
  className = "",
  searchValue = "",
  onSearchChange,
  children, // For custom navigation links or other elements
}) {
  const navigate = useNavigate();
  const authUser = useSelector(state => state.auth?.user);

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

  const finalAvatarSrc = authUser?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.profile?.displayName || "M"}`;

  return (
    <header
      className={`flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 py-3 lg:px-10 bg-surface ${className}`}
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
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
            CampusConnect
          </h2>
        </div>

        {/* Dynamic Search Bar */}
        {onSearchChange && (
          <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-text-secondary flex border-none bg-background items-center justify-center pl-4 rounded-l-lg">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-background h-full placeholder:text-text-secondary px-4 rounded-l-none pl-2 text-base font-normal"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </label>
        )}
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        {/* Custom Nav Links (Children) */}
        <div className="hidden lg:flex items-center gap-8">
          {children}
        </div>

        <div className="flex items-center gap-4">
          {showNotifications && (
            <button 
              onClick={() => navigate("/mentor-notifications")}
              className="flex min-w-[40px] cursor-pointer items-center justify-center rounded-lg h-10 px-2 text-white hover:bg-[#30363d] transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
          )}
          <MentorUserMenu avatarSrc={finalAvatarSrc} />
        </div>
      </div>
    </header>
  );
}
