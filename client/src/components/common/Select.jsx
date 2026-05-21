import React from 'react';
import useHomeTheme from '../../hooks/useHomeTheme';

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
  const isDark = useHomeTheme();

  const labelClass = isDark ? 'text-text-secondary-dark' : 'text-slate-600';
  const fieldClass = isDark
    ? `${error ? 'border-danger' : 'border-border-dark'} bg-background-dark text-text-primary-dark focus:border-info focus:ring-info/20`
    : `${error ? 'border-danger' : 'border-slate-200'} bg-white text-slate-900 focus:border-info focus:ring-info/20`;
  const iconClass = isDark ? 'text-text-secondary-dark' : 'text-slate-400';
  const errorClass = isDark ? 'text-red-300' : 'text-red-600';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium ${labelClass}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none rounded-lg border p-2.5 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 ${fieldClass}`}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 ${iconClass}`}>
          <span className="material-symbols-outlined text-lg">expand_more</span>
        </div>
      </div>
      {error && <p className={`mt-1 text-xs ${errorClass}`}>{error}</p>}
    </div>
  );
};

export default Select;
