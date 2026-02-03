import React from "react";
import PropTypes from "prop-types";
import Avatar from "../common/Avatar";

/**
 * ProfileSidebar Component
 * Reusable sidebar for profile/account settings navigation
 */
const ProfileSidebar = ({
  user,
  navItems,
  activeSection,
  onSectionChange,
  className = "",
}) => {
  return (
    <aside
      className={`w-64 flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] p-4 flex flex-col justify-between ${className}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={user.avatar}
            alt={`Profile picture of ${user.name}`}
            size="md"
          />
          <div>
            <h1 className="text-base font-medium text-white">{user.name}</h1>
            <p className="text-sm font-normal text-white/60">
              {user.university}
            </p>
          </div>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? "bg-primary/20 text-primary"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

ProfileSidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    university: PropTypes.string,
  }).isRequired,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      icon: PropTypes.string,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ProfileSidebar;
