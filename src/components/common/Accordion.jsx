import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Advanced Accordion Component with smooth animations
 */
const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultExpanded = [],
  className = '',
  ...props
}) => {
  const [expandedItems, setExpandedItems] = useState(defaultExpanded);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setExpandedItems(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setExpandedItems(prev =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            type="button"
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => toggleItem(index)}
          >
            <span className="font-medium text-gray-900">{item.title}</span>
            <motion.span
              className="material-symbols-outlined text-gray-500"
              animate={{ rotate: expandedItems.includes(index) ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              expand_more
            </motion.span>
          </button>

          <AnimatePresence>
            {expandedItems.includes(index) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 text-gray-700">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

Accordion.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired
    })
  ),
  allowMultiple: PropTypes.bool,
  defaultExpanded: PropTypes.arrayOf(PropTypes.number),
  className: PropTypes.string
};

export default Accordion;