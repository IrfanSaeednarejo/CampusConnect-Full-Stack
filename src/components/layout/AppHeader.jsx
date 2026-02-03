import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardPath } from "../../config/roleNavigation";

/**
 * AppHeader Component
 * Reusable application header with logo, navigation, search, and user profile
 */
const AppHeader = ({
  navItems = [],
  showSearch = false,
  searchValue = "",
  onSearchChange,
  className = "",
}) => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const defaultNavItems = [
    { label: "Dashboard", path: getDashboardPath(role || "student") },
    { label: "Events", path: "/events" },
    { label: "Societies", path: "/societies" },
    { label: "Mentors", path: "/mentors" },
    { label: "Messages", path: "/chat" },
  ];

  const items = navItems.length > 0 ? navItems : defaultNavItems;

  return (
    <header className={`sticky top-0 z-10 border-b border-solid border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117]/80 backdrop-blur-sm ${className}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between whitespace-nowrap px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="size-6 text-[#238636]">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight">CampusConnect</h2>
          </div>

          {/* Navigation */}
          {items.length > 0 && (
            <nav className="hidden items-center gap-8 md:flex">
              {items.map((item, index) => (
                <button
                  key={item.path || index}
                  onClick={() => item.path && navigate(item.path)}
                  className="text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white text-sm font-medium leading-normal transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Search */}
          {showSearch && (
            <label className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]">
                search
              </span>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#010409] text-gray-900 dark:text-[#c9d1d9] transition-colors focus:border-[#238636] focus:outline-0 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-[#8b949e] h-9 pl-10 pr-4 text-sm font-normal leading-normal"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </label>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-gray-500 dark:text-[#8b949e] transition-colors hover:border-[#238636] hover:text-[#238636] dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="cursor-pointer"
          >
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border-2 border-gray-200 dark:border-[#30363d]"
              data-alt="User profile picture"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBdCjhK4DEVQMLmptep_d_5ZQx4jn0w_Rl847H8hL1GNNPwA_cdrLb7tAm4q3ScJF_z9sR2FEl0MZX3MzLxoPAnOtDdO0VvPmbj2ln9Yx5HLKS3RT_xSLEscdU3v5kvYgqMVXLyCuX7hRlUFbkgIMPtJwWfvVxtrxX9ywgijv-B7Ia_9Y7lWbWsCbxkLcxA0E_WyBZkYUwecAdZ4lQNtwgxS3zl3L73jIkeYnP_j8S1upqH2NfOs7mkPQ7WG8lFNaxeL7YYCTN8huw")',
              }}
            ></div>
          </button>
        </div>
      </div>
    </header>
  );
};

AppHeader.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ),
  showSearch: PropTypes.bool,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  className: PropTypes.string,
};

export default AppHeader;
