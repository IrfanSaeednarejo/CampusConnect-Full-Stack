import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Advanced Select Component with search, multi-select, and animations
 */
const Select = React.forwardRef(({
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  multiple = false,
  searchable = false,
  clearable = false,
  disabled = false,
  loading = false,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState(multiple ? (value || defaultValue || []) : (value || defaultValue || ''));
  const selectRef = useRef(null);
  const combinedRef = ref || selectRef;

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Handle selection
  const handleSelect = (option) => {
    if (multiple) {
      const newValues = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      setSelectedValues(newValues);
      onChange?.(newValues);
    } else {
      setSelectedValues(option.value);
      onChange?.(option.value);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  // Get selected option(s) for display
  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(option => selectedValues.includes(option.value));
      return selectedOptions.length > 0 ? selectedOptions.map(opt => opt.label).join(', ') : placeholder;
    } else {
      const selectedOption = options.find(option => option.value === selectedValues);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  return (
    <div className={`relative ${className}`} ref={combinedRef}>
      {/* Select Button */}
      <button
        type="button"
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedValues ? 'text-gray-900' : 'text-gray-500'}>
          {getDisplayValue()}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <span className="material-symbols-outlined text-gray-400">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => {
                const isSelected = multiple
                  ? selectedValues.includes(option.value)
                  : selectedValues === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                      isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {multiple && (
                      <span className="mr-2">
                        {isSelected ? '✓' : '○'}
                      </span>
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  multiple: PropTypes.bool,
  searchable: PropTypes.bool,
  clearable: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'filled', 'outlined']),
  className: PropTypes.string
};

Select.displayName = 'Select';

export default Select;