import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Advanced DatePicker Component with calendar interface
 */
const DatePicker = React.forwardRef(({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={selectedDate ? selectedDate.toLocaleDateString() : ''}
        readOnly
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        {...props}
      />
      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="material-symbols-outlined text-gray-400">calendar_today</span>
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Calendar implementation would go here */}
            <div className="text-center text-gray-500">Calendar Component</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

DatePicker.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

DatePicker.displayName = 'DatePicker';

export default DatePicker;