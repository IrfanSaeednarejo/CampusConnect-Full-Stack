import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import IconButton from '../common/IconButton';

/**
 * Advanced Sidebar Component with collapsible navigation and user profile section
 */
const Sidebar = ({
  user,
  isCollapsed = false,
  onToggle,
  className = '',
  ...props
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      badge: null
    },
    {
      label: 'Events',
      path: '/events',
      icon: 'event',
      badge: null
    },
    {
      label: 'Mentoring',
      path: '/mentoring/sessions',
      icon: 'school',
      badge: '2'
    },
    {
      label: 'Societies',
      path: '/societies',
      icon: 'groups',
      badge: null
    },
    {
      label: 'Study Groups',
      path: '/study-groups',
      icon: 'group_work',
      badge: '3'
    },
    {
      label: 'Chat',
      path: '/chat',
      icon: 'chat',
      badge: '5'
    },
    {
      label: 'Notes',
      path: '/notes',
      icon: 'description',
      badge: null
    },
    {
      label: 'Analytics',
      path: '/dashboard/admin',
      icon: 'analytics',
      badge: null
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: 'settings',
      badge: null
    }
  ];

  const quickActions = [
    { label: 'Create Event', icon: 'add', action: () => navigate('/events/create') },
    { label: 'Find Mentor', icon: 'person_search', action: () => navigate('/mentors') },
    { label: 'Join Society', icon: 'group_add', action: () => navigate('/societies') }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.div
      className={`h-full bg-white border-r border-gray-200 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      {...props}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="font-bold text-gray-900">CampusConnect</span>
              </motion.div>
            )}
          </AnimatePresence>

          <IconButton
            icon={isCollapsed ? 'chevron_right' : 'chevron_left'}
            size="sm"
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700"
          />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Avatar
                src={user?.avatar}
                name={user?.name || 'User'}
                size="md"
                status={user?.status}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Guest User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || 'Student'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Avatar
                src={user?.avatar}
                name={user?.name || 'User'}
                size="sm"
                status={user?.status}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-start'
              } px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredItem(`action-${index}`)}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <span className="material-symbols-outlined text-lg">
                {action.icon}
              </span>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    className="ml-3"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    {action.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              <AnimatePresence>
                {isCollapsed && hoveredItem === `action-${index}` && (
                  <motion.div
                    className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-10"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {action.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.path}
              onHoverStart={() => setHoveredItem(`nav-${index}`)}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <Link
                to={item.path}
                className={`group relative flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${
                  isActive(item.path) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  {item.icon}
                </span>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="ml-3 flex-1"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && (
                  <Badge
                    count={item.badge}
                    size="xs"
                    className={!isCollapsed ? 'ml-auto' : 'absolute -top-1 -right-1'}
                  />
                )}

                {/* Active indicator */}
                {isActive(item.path) && (
                  <motion.div
                    className="absolute inset-0 bg-blue-100 rounded-lg"
                    layoutId="activeNavItem"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Tooltip for collapsed state */}
                <AnimatePresence>
                  {isCollapsed && hoveredItem === `nav-${index}` && (
                    <motion.div
                      className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-10"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="text-xs text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              © 2024 CampusConnect
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.oneOf(['online', 'offline', 'away', 'busy'])
  }),
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string
};

export default Sidebar;