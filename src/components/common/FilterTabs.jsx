import React from "react";
import PropTypes from "prop-types";

/**
 * FilterTabs Component
 * Reusable filter tabs/radio buttons for filtering content
 */
const FilterTabs = ({
  options,
  value,
  onChange,
  name = "filter",
  className = "",
}) => {
  return (
    <div
      className={`flex h-10 w-full flex-wrap items-center justify-start rounded-lg bg-white dark:bg-[#161b22] p-1 md:w-auto ${className}`}
    >
      {options.map((option) => (
        <label
          key={option.value || option}
          className={`flex min-w-25 cursor-pointer h-full grow items-center justify-center overflow-hidden rounded px-3 text-sm font-medium leading-normal transition-colors ${
            value === (option.value || option)
              ? "bg-[#238636] text-white"
              : "text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]"
          }`}
        >
          <span className="truncate">{option.label || option}</span>
          <input
            checked={value === (option.value || option)}
            onChange={() => onChange(option.value || option)}
            className="invisible size-0"
            name={name}
            type="radio"
            value={option.value || option}
          />
        </label>
      ))}
    </div>
  );
};

FilterTabs.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
      }),
    ]),
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  className: PropTypes.string,
};

export default FilterTabs;
