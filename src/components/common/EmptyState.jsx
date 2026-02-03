import React from "react";
import PropTypes from "prop-types";

/**
 * EmptyState Component
 * Reusable empty state display with icon, message, and optional action
 */
const EmptyState = ({
  icon = "inbox",
  title,
  message,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] py-12 sm:py-16 text-center ${className}`}
    >
      <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-[#8b949e]">
        {icon}
      </span>
      {title && (
        <p className="text-lg font-bold text-gray-900 dark:text-[#c9d1d9]">
          {title}
        </p>
      )}
      {message && (
        <p className="text-base font-medium text-gray-500 dark:text-[#8b949e] max-w-md">
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 flex min-w-21 max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#238636] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors"
        >
          <span className="material-symbols-outlined mr-2">add</span>
          <span className="truncate">{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;
