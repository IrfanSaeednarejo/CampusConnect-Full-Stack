import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../common/Badge';
import Button from '../common/Button';
import NotificationItem from './NotificationItem';

/**
 * Advanced Notification Dropdown Component - Displays notification list with filtering
 * Includes mark as read, filtering, and grouping features
 */
const NotificationDropdown = React.forwardRef(({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  isOpen = false,
  onClose,
  maxHeight = '400px',
  className = '',
  ...props
}, ref) => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [grouped, setGrouped] = useState(true);
  const dropdownRef = useRef(null);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Group notifications by date
  const groupedNotifications = grouped
    ? filteredNotifications.reduce((groups, notification) => {
        const date = new Date(notification.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let groupKey;
        if (date.toDateString() === today.toDateString()) {
          groupKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          groupKey = 'Yesterday';
        } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          groupKey = 'This Week';
        } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
          groupKey = 'This Month';
        } else {
          groupKey = 'Older';
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(notification);
        return groups;
      }, {})
    : { 'All': filteredNotifications };

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    onMarkAllAsRead?.(unreadIds);
  };

  // Handle clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      onClearAll?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${className}`}
      {...props}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="filled" color="primary" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setGrouped(!grouped)}
              className="text-sm text-gray-600 hover:text-gray-900"
              title={grouped ? 'Ungroup' : 'Group'}
            >
              <span className="material-symbols-outlined text-sm">
                {grouped ? 'view_list' : 'view_module'}
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'read'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">
              notifications_off
            </span>
            <p className="text-gray-600">No notifications</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => (
            <div key={groupKey} className="border-b border-gray-100 last:border-b-0">
              {grouped && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    {groupKey}
                  </h4>
                </div>
              )}

              <div>
                {groupNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => onNotificationClick?.(notification)}
                    onMarkAsRead={() => onMarkAsRead?.(notification.id)}
                    onDelete={() => onDelete?.(notification.id)}
                    isLast={index === groupNotifications.length - 1}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
});

NotificationDropdown.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string,
      read: PropTypes.bool,
      createdAt: PropTypes.string.isRequired
    })
  ),
  onNotificationClick: PropTypes.func,
  onMarkAsRead: PropTypes.func,
  onMarkAllAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  onClearAll: PropTypes.func,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  maxHeight: PropTypes.string,
  className: PropTypes.string
};

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;