import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import IconButton from '../common/IconButton';

/**
 * Advanced Notification Item Component - Individual notification display
 * Shows notification content, actions, and read/unread states
 */
const NotificationItem = React.forwardRef(({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  isLast = false,
  className = '',
  ...props
}, ref) => {
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return 'event';
      case 'message':
        return 'chat';
      case 'mentoring':
        return 'school';
      case 'society':
        return 'groups';
      case 'system':
        return 'info';
      case 'achievement':
        return 'emoji_events';
      case 'reminder':
        return 'notifications';
      default:
        return 'notifications';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'event':
        return 'primary';
      case 'message':
        return 'info';
      case 'mentoring':
        return 'success';
      case 'society':
        return 'secondary';
      case 'system':
        return 'warning';
      case 'achievement':
        return 'warning';
      case 'reminder':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <motion.div
      ref={ref}
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-blue-50' : ''
      } ${!isLast ? 'border-b border-gray-100' : ''} ${className}`}
      onClick={onClick}
      whileHover={{ x: 2 }}
      {...props}
    >
      <div className="flex items-start space-x-3">
        {/* Icon/Avatar */}
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <Avatar
              src={notification.avatar}
              name={notification.senderName || 'User'}
              size="md"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-${color}-600`}>
                {icon}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>

              {notification.message && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {notification.message}
                </p>
              )}

              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-500">
                  {formatTime(notification.createdAt)}
                </span>
                {notification.type && (
                  <Badge variant="outline" size="xs" color={color}>
                    {notification.type}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
              {!notification.read && (
                <IconButton
                  icon="circle"
                  size="sm"
                  className="text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.();
                  }}
                  title="Mark as read"
                />
              )}
              <IconButton
                icon="close"
                size="sm"
                className="text-gray-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                title="Delete"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex items-center space-x-2 mt-3" onClick={(e) => e.stopPropagation()}>
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.(notification);
                  }}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    action.primary
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    read: PropTypes.bool,
    createdAt: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    senderName: PropTypes.string,
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        primary: PropTypes.bool
      })
    )
  }).isRequired,
  onClick: PropTypes.func,
  onMarkAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  isLast: PropTypes.bool,
  className: PropTypes.string
};

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;