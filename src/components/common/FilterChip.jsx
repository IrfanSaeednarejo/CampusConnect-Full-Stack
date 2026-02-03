import React from "react";
import PropTypes from "prop-types";

/**
 * FilterChip Component
 * Reusable filter chip/button for filtering content
 */
const FilterChip = ({
  label,
  icon,
  isActive = false,
  onClick,
  showDropdown = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 transition-colors ${
        isActive
          ? "border border-[#238636] bg-[#238636]/20 text-[#238636]"
          : "border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-gray-300 dark:hover:border-[#404851] text-gray-700 dark:text-[#c9d1d9]"
      } ${className}`}
    >
      {icon && (
        <span
          className={`material-symbols-outlined text-xl ${
            isActive ? "text-[#238636]" : "text-gray-500 dark:text-[#8b949e]"
          }`}
        >
          {icon}
        </span>
      )}
      <p
        className={`text-sm font-medium leading-normal ${
          isActive ? "text-[#238636]" : ""
        }`}
      >
        {label}
      </p>
      {showDropdown && (
        <span className="material-symbols-outlined text-gray-500 dark:text-[#8b949e] text-xl">
          arrow_drop_down
        </span>
      )}
    </button>
  );
};

FilterChip.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  showDropdown: PropTypes.bool,
  className: PropTypes.string,
};

export default FilterChip;
