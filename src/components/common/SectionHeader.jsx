import React from "react";
import PropTypes from "prop-types";

/**
 * SectionHeader Component
 * Reusable section header with title and optional action
 */
const SectionHeader = ({
  title,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <h2 className="text-gray-900 dark:text-[#c9d1d9] text-xl font-bold leading-tight tracking-tight">
        {title}
      </h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-[#238636] text-sm font-medium hover:underline transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default SectionHeader;
