import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Notification Widget Component with real-time updates and categorization
 */
const NotificationWidget = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewAll,
  maxVisible = 5,
  showHeader = true,
  className = '',
  ...props
}) => {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  const visibleNotifications = expanded ? filteredNotifications : filteredNotifications.slice(0, maxVisible);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    const icons = {
      message: 'chat',
      event: 'event',
      society: 'groups',
      mentor: 'school',
      system: 'info',
      achievement: 'emoji_events'
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors = {
      message: 'blue',
      event: 'green',
      society: 'purple',
      mentor: 'orange',
      system: 'gray',
      achievement: 'yellow'
    };
    return colors[type] || 'gray';
  };

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge count={unreadCount} size="sm" color="danger" />
            )}
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-gray-600 hover:text-gray-900"
              >
                Mark all read
              </Button>
            )}

            <IconButton
              icon="settings"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-1 p-3 border-b border-gray-200 bg-gray-50">
        {['all', 'message', 'event', 'society', 'mentor'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === type
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {visibleNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">notifications_off</span>
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {visibleNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-full bg-${getNotificationColor(notification.type)}-100`}>
                    <span className={`material-symbols-outlined text-${getNotificationColor(notification.type)}-600`}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}

                        <IconButton
                          icon="more_vert"
                          size="sm"
                          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {notification.actions && (
                      <div className="flex space-x-2 mt-3">
                        {notification.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick();
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          {filteredNotifications.length > maxVisible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? 'Show less' : `Show ${filteredNotifications.length - maxVisible} more`}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-700 ml-auto"
          >
            View all
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

NotificationWidget.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['message', 'event', 'society', 'mentor', 'system', 'achievement']),
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      read: PropTypes.bool,
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          onClick: PropTypes.func
        })
      )
    })
  ),
  onMarkAsRead: PropTypes.func,
  onMarkAllAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  onViewAll: PropTypes.func,
  maxVisible: PropTypes.number,
  showHeader: PropTypes.bool,
  className: PropTypes.string
};

export default NotificationWidget;