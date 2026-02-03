import React from "react";
import PropTypes from "prop-types";

/**
 * Textarea Component
 * Reusable textarea with consistent styling and props
 */
const Textarea = React.forwardRef(
  ({ value, onChange, maxLength, rows = 4, className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        className={`w-full bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-y ${className}`}
        {...props}
      />
    );
  },
);

Textarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default Textarea;
