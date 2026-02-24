import { Outlet, Link, useNavigate } from "react-router-dom";
import NotificationDisplay from "./common/NotificationDisplay.jsx";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <NotificationDisplay />
      {/* Navigation Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#161b22] px-4 sm:px-10 md:px-20 lg:px-40 py-3 bg-[#0d1117]">
        <Link
          to="/"
          className="flex items-center gap-4 text-[#e6edf3] hover:text-[#e6edf3]"
        >
          <div className="w-4 h-4">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-[#e6edf3] text-lg font-bold leading-tight tracking-[-0.015em]">
            CampusConnect
          </h2>
        </Link>

        <div className="hidden md:flex flex-1 justify-end items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/events"
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium leading-normal"
            >
              Events
            </Link>
            <Link
              to="/mentors"
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium leading-normal"
            >
              Mentors
            </Link>
            <Link
              to="/members"
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium leading-normal"
            >
              Members
            </Link>
            <Link
              to="/societies"
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium leading-normal"
            >
              Societies
            </Link>
            <Link
              to="/about-us"
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium leading-normal"
            >
              About Us
            </Link>
            <Link
              to="/contact-us"
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium leading-normal"
            >
              Contact Us
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/signup")}
              className="flex min-w-[70px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-8 px-3 bg-[#238636] text-white text-xs font-bold leading-normal tracking-[0.015em] hover:bg-[#2ea043]"
            >
              <span className="truncate">Sign Up</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex min-w-[70px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-8 px-3 bg-[#161b22] text-white text-xs font-bold leading-normal tracking-[0.015em] border border-[#30363d] hover:bg-[#21262d]"
            >
              <span className="truncate">Log In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-5 py-5 text-center border-t border-solid border-[#161b22] bg-[#0d1117]">
        <p className="text-[#8b949e] text-xs font-normal leading-normal">
          © 2024 CampusConnect. All rights reserved. |
          <Link className="hover:text-[#e6edf3] ml-1" to="/privacy">
            Privacy Policy
          </Link>{" "}
          |
          <Link className="hover:text-[#e6edf3] ml-1" to="/terms">
            Terms of Service
          </Link>{" "}
          |
          <Link className="hover:text-[#e6edf3] ml-1" to="/contact-us">
            Contact Us
          </Link>
        </p>
      </footer>
    </div>
  );
}
