import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const showSuccess = useCallback((message) => showNotification(message, 'success'), [showNotification]);
  const showError = useCallback((message) => showNotification(message, 'error'), [showNotification]);
  const showWarning = useCallback((message) => showNotification(message, 'warning'), [showNotification]);
  const showInfo = useCallback((message) => showNotification(message, 'info'), [showNotification]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showNotification,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
