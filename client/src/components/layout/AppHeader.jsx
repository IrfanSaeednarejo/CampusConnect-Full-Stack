import { Link } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../common/Button";

export default function AppHeader({ searchPlaceholder = "Search" }) {
  const isDark = useHomeTheme();

  const headerClass = isDark
    ? "border-white/10 bg-transparent"
    : "border-slate-200 bg-white/95";
  const brandTextClass = isDark ? "text-white" : "text-slate-900";
  const navLinkClass = isDark
    ? "text-white/80 hover:text-white"
    : "text-slate-500 hover:text-slate-900";
  const activeNavLinkClass = isDark ? "text-white" : "text-slate-900";
  const searchShellClass = isDark ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-400";
  const searchInputClass = isDark
    ? "bg-white/5 text-white placeholder:text-white/60"
    : "bg-slate-100 text-slate-900 placeholder:text-slate-400";
  const iconButtonClass = getButtonClassName({
    variant: "icon",
    size: "icon-md",
    isDark,
  });

  return (
    <header
      className={`flex items-center justify-between whitespace-nowrap border-b border-solid px-4 py-3 sm:px-6 lg:px-10 ${headerClass}`}
    >
      <div className="flex items-center gap-8">
        <div className={`flex items-center gap-4 ${brandTextClass}`}>
          <div className="size-4 text-[#17cf60]">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className={`text-lg font-bold leading-tight tracking-[-0.015em] ${brandTextClass}`}>
            CampusNexus
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-9">
          <Link
            className={`text-sm font-medium leading-normal transition-colors ${navLinkClass}`}
            to="/student/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className={`text-sm font-medium leading-normal transition-colors ${navLinkClass}`}
            to="/events"
          >
            Events
          </Link>
          <Link
            className={`text-sm font-medium leading-normal transition-colors ${navLinkClass}`}
            to="/mentorship-hub"
          >
            Mentoring
          </Link>
          <Link
            className={`text-sm font-medium leading-normal ${activeNavLinkClass}`}
            to="/student/my-notes"
          >
            My Notes
          </Link>
        </div>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className={`flex items-center justify-center rounded-l-lg border-r-0 border-none pl-3 ${searchShellClass}`}>
              <span className="material-symbols-outlined !text-xl">search</span>
            </div>
            <input
              className={`form-input flex h-full w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-none border-l-0 px-4 pl-2 text-base font-normal leading-normal focus:border-none focus:outline-0 focus:ring-0 ${searchInputClass}`}
              placeholder={searchPlaceholder}
            />
          </div>
        </label>
        <div className="flex gap-2">
          <Link
            to="/student/notifications"
            className={iconButtonClass}
          >
            <span className="material-symbols-outlined">notifications</span>
          </Link>
          <Link
            to="/profile/view"
            className={iconButtonClass}
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              'url("https://cdn.usegalileo.ai/stability/d1f2e1d4-89fa-407f-8d2c-e463e9623ac2.png")',
          }}
        ></div>
      </div>
    </header>
  );
}
