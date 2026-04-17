import React from 'react';

/**
 * Reusable RadioGroup component for exclusive choice selection.
 */
const RadioGroup = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  error, 
  required,
  direction = 'vertical',
  className = "" 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={`flex ${direction === 'vertical' ? 'flex-col space-y-3' : 'flex-row items-center gap-6'}`}>
        {options.map((option) => (
          <label 
            key={option.value} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <input 
                type="radio" 
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                value === option.value 
                  ? 'border-[#1f6feb] bg-[#1f6feb]/10' 
                  : 'border-[#30363d] group-hover:border-gray-500'
              }`} />
              {value === option.value && (
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#1f6feb] animate-in zoom-in duration-200" />
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-medium transition-colors ${
                value === option.value ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
              }`}>
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-gray-500">{option.description}</span>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default RadioGroup;
