// src/contexts/NotificationContext.js
// Notification Context - manages global notifications and alerts

import React, { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return addNotification({
      type: 'success',
      message,
      duration: duration ?? 5000,
    });
  }, [addNotification]);

  const showError = useCallback((message, duration) => {
    return addNotification({
      type: 'error',
      message,
      duration: duration ?? 7000,
    });
  }, [addNotification]);

  const showWarning = useCallback((message, duration) => {
    return addNotification({
      type: 'warning',
      message,
      duration: duration ?? 5000,
    });
  }, [addNotification]);

  const showInfo = useCallback((message, duration) => {
    return addNotification({
      type: 'info',
      message,
      duration: duration ?? 5000,
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
