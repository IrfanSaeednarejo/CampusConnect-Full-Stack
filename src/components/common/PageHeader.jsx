import React from "react";
import PropTypes from "prop-types";

/**
 * PageHeader Component
 * Reusable page header with title, description, and optional action button
 */
const PageHeader = ({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold sm:font-black leading-tight tracking-tight text-gray-900 dark:text-[#c9d1d9]">
          {title}
        </h1>
        {description && (
          <p className="text-base font-normal leading-normal text-gray-500 dark:text-[#8b949e]">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex min-w-21 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-11 px-4 sm:px-5 bg-[#238636] text-white gap-2 text-sm sm:text-base font-bold leading-normal tracking-wide hover:bg-green-700 transition-colors"
        >
          {actionIcon && (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 24 }}
            >
              {actionIcon}
            </span>
          )}
          <span className="truncate">{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  actionIcon: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default PageHeader;
