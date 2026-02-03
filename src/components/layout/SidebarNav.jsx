import React from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * SidebarNav Component
 * Reusable sidebar navigation with user profile and navigation items
 */
const SidebarNav = ({
  user,
  navItems,
  onLogout,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("onboardingComplete");
    if (onLogout) {
      onLogout();
    } else {
      navigate("/login");
    }
  };

  return (
    <aside
      className={`flex-col justify-between bg-[#f6f8f7] dark:bg-[#0d1117] border-r border-transparent dark:border-[#30363d] w-64 p-4 hidden lg:flex ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* User Profile Section */}
        {user && (
          <div className="flex gap-3 items-center">
            {user.avatar ? (
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                data-alt={`User profile picture of ${user.name}`}
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
            ) : (
              <div className="bg-[#238636]/20 rounded-full size-10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#238636]">person</span>
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-[#c9d1d9] text-base font-medium leading-normal">
                {user.name || "User"}
              </h1>
              {user.role && (
                <p className="text-gray-500 dark:text-[#8b949e] text-sm font-normal leading-normal">
                  {user.role}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        {navItems && navItems.length > 0 && (
          <nav className="flex flex-col gap-2 mt-4">
            {navItems.map((item) => (
              <button
                key={item.path || item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-[#238636]/20 text-[#238636]"
                    : "hover:bg-gray-200 dark:hover:bg-[#161b22] text-gray-700 dark:text-[#c9d1d9]"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                  {item.icon}
                </span>
                <p
                  className={`text-sm font-medium leading-normal ${
                    isActive(item.path) ? "text-[#238636]" : ""
                  }`}
                >
                  {item.label}
                </p>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => navigate("/profile/settings")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] text-gray-700 dark:text-[#c9d1d9] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            settings
          </span>
          <p className="text-sm font-medium leading-normal">Settings</p>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] text-gray-700 dark:text-[#c9d1d9] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            logout
          </span>
          <p className="text-sm font-medium leading-normal">Log out</p>
        </button>
      </div>
    </aside>
  );
};

SidebarNav.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
    avatar: PropTypes.string,
  }),
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.string.isRequired,
    })
  ),
  onLogout: PropTypes.func,
  className: PropTypes.string,
};

export default SidebarNav;
