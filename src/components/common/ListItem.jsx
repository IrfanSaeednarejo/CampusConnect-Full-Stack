import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Advanced ListItem Component with hover effects and actions
 */
const ListItem = React.forwardRef(({
  children,
  onClick,
  selected = false,
  disabled = false,
  className = '',
  avatar,
  icon,
  title,
  subtitle,
  actions,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={`flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${selected ? 'bg-blue-50' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { backgroundColor: 'rgba(0,0,0,0.05)' } : {}}
      {...props}
    >
      {avatar && <div className="mr-3">{avatar}</div>}
      {icon && <span className="material-symbols-outlined mr-3 text-gray-500">{icon}</span>}

      <div className="flex-1">
        {title && <div className="font-medium text-gray-900">{title}</div>}
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        {children}
      </div>

      {actions && <div className="ml-3 flex items-center space-x-2">{actions}</div>}
    </motion.div>
  );
});

ListItem.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  avatar: PropTypes.node,
  icon: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node
};

ListItem.displayName = 'ListItem';

export default ListItem;