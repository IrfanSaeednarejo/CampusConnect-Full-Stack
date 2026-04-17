import React from 'react';

/**
 * Reusable Select component for dropdown inputs.
 */
const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  error, 
  required, 
  disabled,
  placeholder = "Select an option",
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full bg-[#0d1117] border ${
            error ? 'border-red-500' : 'border-[#30363d]'
          } rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-[#1f6feb]/30 focus:border-[#1f6feb] transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <span className="material-symbols-outlined text-lg">expand_more</span>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Select;
