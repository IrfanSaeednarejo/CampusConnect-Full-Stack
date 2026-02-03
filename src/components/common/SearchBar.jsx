import React from "react";
import PropTypes from "prop-types";

/**
 * SearchBar Component
 * Reusable search input with icon
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  variant = "default",
}) => {
  const variants = {
    default: "bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d]",
    dark: "bg-[#29382f] border-none",
    light: "bg-gray-50 dark:bg-[#010409] border border-gray-200 dark:border-[#30363d]",
  };

  return (
    <label className={`flex flex-col min-w-40 h-10 sm:h-12 w-full ${className}`}>
      <div className={`flex w-full flex-1 items-stretch rounded-lg h-full ${variants[variant]}`}>
        <div className="text-gray-500 dark:text-[#9db8a9] flex border-none items-center justify-center pl-3 sm:pl-4 rounded-l-lg border-r-0">
          <span className="material-symbols-outlined text-xl">search</span>
        </div>
        <input
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none h-full placeholder:text-gray-400 dark:placeholder:text-[#9db8a9] px-4 text-base font-normal leading-normal"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </label>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "dark", "light"]),
};

export default SearchBar;
