import { Link } from "react-router-dom";

export default function AppHeader({ searchPlaceholder = "Search" }) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-6 lg:px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-white">
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
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            CampusConnect
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-9">
          <Link
            className="text-white/80 hover:text-white text-sm font-medium leading-normal"
            to="/student/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-white/80 hover:text-white text-sm font-medium leading-normal"
            to="/events"
          >
            Events
          </Link>
          <Link
            className="text-white/80 hover:text-white text-sm font-medium leading-normal"
            to="/mentorship-hub"
          >
            Mentoring
          </Link>
          <Link
            className="text-white text-sm font-medium leading-normal"
            to="/student/my-notes"
          >
            My Notes
          </Link>
        </div>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-white/60 flex border-none bg-white/5 items-center justify-center pl-3 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined !text-xl">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-white/5 focus:border-none h-full placeholder:text-white/60 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              placeholder={searchPlaceholder}
            />
          </div>
        </label>
        <div className="flex gap-2">
          <Link
            to="/student/notifications"
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
          >
            <span className="material-symbols-outlined">notifications</span>
          </Link>
          <Link
            to="/profile/view"
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
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
